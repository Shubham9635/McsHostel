import 'dotenv/config';
import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase';
import { authenticate, AuthRequest, JWT_SECRET_KEY } from '../middleware/auth.middleware';
import { generateOtpCode, storeOtp, verifyOtp } from '../services/otp.service';
import { sendOtpEmail } from '../services/email.service';

const router = Router();

// Helper: strip password_hash from profile
function sanitize(profile: any) {
  const { password_hash, ...safe } = profile;
  return safe;
}

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !profile) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, profile.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: profile.id, email: profile.email, role: profile.role, name: profile.name },
      JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    return res.json({ token, user: sanitize(profile) });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/auth/direct-login (Instant login without OTP for demo accounts)
router.post('/direct-login', async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const normalizedEmail = email.toLowerCase().trim();

    if (!['student@hostel.hub', 'admin@hostel.hub'].includes(normalizedEmail)) {
      return res.status(400).json({ error: 'Direct login is only available for demo accounts.' });
    }

    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (!profile) {
      const isStudent = normalizedEmail === 'student@hostel.hub';
      const randomHash = await bcrypt.hash(Math.random().toString(36), 10);
      const { data: newProfile } = await supabase.from('profiles').insert({
        email: normalizedEmail,
        name: isStudent ? 'Hostel Student' : 'Hostel Management',
        role: isStudent ? 'student' : 'admin',
        room: isStudent ? 'B-204' : null,
        hostel: isStudent ? 'New Boys Hostel' : null,
        password_hash: randomHash,
        is_active: true,
      }).select().single();
      profile = newProfile;
    }

    const token = jwt.sign(
      { id: profile.id, email: profile.email, role: profile.role, name: profile.name },
      JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    return res.json({ token, user: sanitize(profile) });
  } catch (err) {
    console.error('Direct login error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/auth/send-otp
router.post('/send-otp', async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email format (e.g. yourname@gmail.com).' });
    }

    // Direct login bypass for student@hostel.hub and admin@hostel.hub
    if (['student@hostel.hub', 'admin@hostel.hub'].includes(normalizedEmail)) {
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', normalizedEmail)
        .single();

      if (profile) {
        const token = jwt.sign(
          { id: profile.id, email: profile.email, role: profile.role, name: profile.name },
          JWT_SECRET_KEY,
          { expiresIn: '7d' }
        );
        return res.json({
          success: true,
          direct_login: true,
          token,
          user: sanitize(profile),
          message: 'Direct login successful.',
        });
      }
    }

    // Check if account exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, email, is_active')
      .eq('email', normalizedEmail)
      .single();

    if (profile && !profile.is_active) {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact hostel admin.' });
    }

    // Generate 6-digit code
    const otp = generateOtpCode();

    // Store OTP (with rate limiting check)
    const storeResult = await storeOtp(normalizedEmail, otp);
    if (!storeResult.success) {
      return res.status(429).json({ error: storeResult.error });
    }

    // Dispatch email with a fast race timeout so the HTTP response NEVER hangs
    let emailResult: { delivered_via_smtp: boolean; smtp_error?: string } = {
      delivered_via_smtp: false,
      smtp_error: 'Dispatch timeout',
    };

    try {
      const timeoutPromise = new Promise<{ delivered_via_smtp: boolean; smtp_error: string }>((resolve) =>
        setTimeout(() => resolve({ delivered_via_smtp: false, smtp_error: 'SMTP connection timed out' }), 3500)
      );

      emailResult = await Promise.race([
        sendOtpEmail({ to: normalizedEmail, otp, userName: profile?.name }),
        timeoutPromise,
      ]);
    } catch (e: any) {
      emailResult = { delivered_via_smtp: false, smtp_error: e.message };
    }

    return res.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}`,
      delivered_via_smtp: emailResult.delivered_via_smtp,
    });
  } catch (err) {
    console.error('send-otp error:', err);
    return res.status(500).json({ error: 'Failed to send verification code. Please try again.' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: AuthRequest, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Bypass OTP verification for demo emails
    if (!['student@hostel.hub', 'admin@hostel.hub'].includes(normalizedEmail)) {
      // Verify OTP against stored record
      const verification = await verifyOtp(normalizedEmail, String(otp));
      if (!verification.valid) {
        return res.status(400).json({ error: verification.error || 'Invalid verification code.' });
      }
    }

    // Fetch user profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (profile && !profile.is_active) {
      return res.status(403).json({ error: 'This account has been deactivated.' });
    }

    let is_new_user = false;
    const ADMIN_EMAILS = ['admin@hostelhub.demo', 'admin@hostel.hub', 'hostelhub.support@gmail.com'];
    const isAdminEmail = ADMIN_EMAILS.includes(normalizedEmail);

    // If new user with real email, auto-provision profile
    if (!profile) {
      const defaultRole = isAdminEmail ? 'admin' : 'student';
      is_new_user = defaultRole === 'student'; // admins don't need hostel onboarding

      const defaultName = isAdminEmail
        ? 'Hostel Management'
        : normalizedEmail
            .split('@')[0]
            .replace(/[._]/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());

      const randomHash = await bcrypt.hash(Math.random().toString(36), 10);
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          name: defaultName,
          email: normalizedEmail,
          role: defaultRole,
          password_hash: randomHash,
          is_active: true,
          room: null,
          hostel: null,
        })
        .select()
        .single();

      if (createError || !newProfile) {
        console.error('Auto-provisioning profile error:', createError);
        return res.status(500).json({ error: 'Failed to create profile.' });
      }
      profile = newProfile;
    } else {
      // Ensure admin email has role 'admin'
      if (isAdminEmail && profile.role !== 'admin') {
        const { data: updatedAdmin } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', profile.id)
          .select()
          .single();
        if (updatedAdmin) profile = updatedAdmin;
      }
      if (profile.role === 'student' && (!profile.room || !profile.hostel)) {
        is_new_user = true;
      }
    }

    // Sign JWT
    const token = jwt.sign(
      { id: profile.id, email: profile.email, role: profile.role, name: profile.name },
      JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: sanitize(profile),
      is_new_user,
      message: 'Signed in successfully via email verification.',
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// POST /api/auth/google-login
// Allows any new or existing user to sign in using their Gmail / Google ID
router.post('/google-login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, name, avatarUrl } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid Gmail or email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email format (e.g. yourname@gmail.com).' });
    }

    // Direct demo login bypass
    if (['student@hostel.hub', 'admin@hostel.hub'].includes(normalizedEmail)) {
      let { data: demoProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', normalizedEmail)
        .single();
      if (demoProfile) {
        const token = jwt.sign(
          { id: demoProfile.id, email: demoProfile.email, role: demoProfile.role, name: demoProfile.name },
          JWT_SECRET_KEY,
          { expiresIn: '7d' }
        );
        return res.json({ token, user: sanitize(demoProfile), is_new_user: false, message: 'Direct login successful.' });
      }
    }

    // Check if user profile already exists
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (profile && !profile.is_active) {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact hostel admin.' });
    }

    let is_new_user = false;
    const ADMIN_EMAILS = ['admin@hostelhub.demo', 'admin@hostel.hub', 'hostelhub.support@gmail.com'];
    const isAdminEmail = ADMIN_EMAILS.includes(normalizedEmail);

    if (!profile) {
      const defaultRole = isAdminEmail ? 'admin' : 'student';
      is_new_user = defaultRole === 'student';

      const defaultName = name?.trim() || (
        isAdminEmail
          ? 'Hostel Management'
          : normalizedEmail
              .split('@')[0]
              .replace(/[._]/g, ' ')
              .replace(/w/g, (c: string) => c.toUpperCase())
      );

      const randomHash = await bcrypt.hash(Math.random().toString(36), 10);
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          name: defaultName,
          email: normalizedEmail,
          role: defaultRole,
          password_hash: randomHash,
          is_active: true,
          room: null,
          hostel: null,
          profile_photo_url: avatarUrl || null,
        })
        .select()
        .single();

      if (createError || !newProfile) {
        console.error('Auto-provisioning Google user error:', createError);
        return res.status(500).json({ error: 'Failed to create user profile.' });
      }
      profile = newProfile;
    } else {
      if (isAdminEmail && profile.role !== 'admin') {
        const { data: updatedAdmin } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', profile.id)
          .select()
          .single();
        if (updatedAdmin) profile = updatedAdmin;
      }
      if (profile.role === 'student' && (!profile.room || !profile.hostel)) {
        is_new_user = true;
      }
    }

    const token = jwt.sign(
      { id: profile.id, email: profile.email, role: profile.role, name: profile.name },
      JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: sanitize(profile),
      is_new_user,
      message: 'Signed in successfully via Google.',
    });
  } catch (err: any) {
    console.error('Google login error:', err);
    return res.status(500).json({ error: 'Server error during Google login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user!.id)
    .single();

  if (error || !profile) return res.status(404).json({ error: 'User not found.' });
  return res.json(sanitize(profile));
});

// POST /api/auth/register
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, student_id, room, hostel, block, phone, course, year } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check duplicate
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        student_id: student_id || null,
        password_hash,
        role: 'student',
        room: room || null,
        hostel: hostel || null,
        block: block || null,
        phone: phone || null,
        course: course || null,
        year: year || null,
      })
      .select()
      .single();

    if (error || !newProfile) {
      console.error('Register error:', error);
      return res.status(500).json({ error: 'Failed to create account.' });
    }

    const token = jwt.sign(
      { id: newProfile.id, email: newProfile.email, role: newProfile.role, name: newProfile.name },
      JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ token, user: sanitize(newProfile) });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/auth/profile - update own profile
router.patch('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, course, year, room, hostel, block, student_id } = req.body;

    // Only allow safe fields — role, email, password_hash cannot be changed here
    const updates: any = {};
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone || null;
    if (course !== undefined) updates.course = course || null;
    if (year !== undefined) updates.year = year || null;
    if (room !== undefined) updates.room = room || null;
    if (hostel !== undefined) updates.hostel = hostel || null;
    if (block !== undefined) updates.block = block || null;
    if (student_id !== undefined) updates.student_id = student_id || null;

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error || !updated) {
      return res.status(500).json({ error: 'Failed to update profile.' });
    }

    return res.json(sanitize(updated));
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current and new passwords are required.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('password_hash')
      .eq('id', req.user!.id)
      .single();

    if (!profile) return res.status(404).json({ error: 'User not found.' });

    const valid = await bcrypt.compare(current_password, profile.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });

    const password_hash = await bcrypt.hash(new_password, 12);
    const { error } = await supabase
      .from('profiles')
      .update({ password_hash })
      .eq('id', req.user!.id);

    if (error) return res.status(500).json({ error: 'Failed to change password.' });

    return res.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
