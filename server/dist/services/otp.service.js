"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtpCode = generateOtpCode;
exports.storeOtp = storeOtp;
exports.verifyOtp = verifyOtp;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const supabase_1 = require("../db/supabase");
// In-memory fallback if the Supabase email_otps table hasn't been migrated yet
const memoryStore = new Map();
// Generate secure 6-digit numeric OTP
function generateOtpCode() {
    return crypto_1.default.randomInt(100000, 999999).toString();
}
/**
 * Stores a new OTP for the given email (with rate-limiting check)
 */
async function storeOtp(email, otp) {
    const normalizedEmail = email.toLowerCase().trim();
    const expiresAtDate = new Date(Date.now() + 10 * 20 * 1000); // 10 minutes
    const otpHash = await bcryptjs_1.default.hash(otp, 10);
    // Check rate-limiting (cooldown of 60 seconds)
    const now = Date.now();
    const memRecord = memoryStore.get(normalizedEmail);
    if (memRecord && now - memRecord.createdAt < 20 * 1000) {
        const waitSec = Math.ceil((20 * 1000 - (now - memRecord.createdAt)) / 1000);
        return { success: false, error: `Please wait ${waitSec}s before requesting a new code.` };
    }
    // Attempt to write to Supabase email_otps table
    try {
        // Delete any existing OTPs for this email first
        await supabase_1.supabase.from('email_otps').delete().eq('email', normalizedEmail);
        const { error } = await supabase_1.supabase.from('email_otps').insert({
            email: normalizedEmail,
            otp_hash: otpHash,
            expires_at: expiresAtDate.toISOString(),
            attempts: 0,
            created_at: new Date().toISOString(),
        });
        if (!error) {
            // Also sync memory store for quick rate limiting
            memoryStore.set(normalizedEmail, {
                otpHash,
                expiresAt: expiresAtDate.getTime(),
                attempts: 0,
                createdAt: now,
            });
            return { success: true };
        }
        // If table doesn't exist yet, fall through to memory store
        if (error.code !== 'PGRST205') {
            console.warn('Supabase email_otps insert warning:', error.message);
        }
    }
    catch (err) {
        console.warn('Supabase email_otps exception:', err.message);
    }
    // Memory fallback
    memoryStore.set(normalizedEmail, {
        otpHash,
        expiresAt: expiresAtDate.getTime(),
        attempts: 0,
        createdAt: now,
    });
    return { success: true };
}
/**
 * Verifies an OTP code against stored record
 */
async function verifyOtp(email, code) {
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedCode = code.trim();
    // 1. Try Supabase first
    try {
        const { data, error } = await supabase_1.supabase
            .from('email_otps')
            .select('*')
            .eq('email', normalizedEmail)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        if (!error && data) {
            // Check expiry
            if (new Date(data.expires_at).getTime() < Date.now()) {
                await supabase_1.supabase.from('email_otps').delete().eq('id', data.id);
                return { valid: false, error: 'Verification code has expired. Please request a new one.' };
            }
            // Check max attempts
            if (data.attempts >= 5) {
                await supabase_1.supabase.from('email_otps').delete().eq('id', data.id);
                return { valid: false, error: 'Too many failed attempts. Please request a new code.' };
            }
            // Verify hash
            const isMatch = await bcryptjs_1.default.compare(trimmedCode, data.otp_hash);
            if (!isMatch) {
                await supabase_1.supabase
                    .from('email_otps')
                    .update({ attempts: data.attempts + 1 })
                    .eq('id', data.id);
                const remaining = 4 - data.attempts;
                return { valid: false, error: `Invalid code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Code blocked.'}` };
            }
            // Delete on success
            await supabase_1.supabase.from('email_otps').delete().eq('email', normalizedEmail);
            memoryStore.delete(normalizedEmail);
            return { valid: true };
        }
    }
    catch (err) {
        // If Supabase query failed or table not found, fallback to memoryStore
    }
    // 2. Memory store fallback
    const record = memoryStore.get(normalizedEmail);
    if (!record) {
        return { valid: false, error: 'No verification code found for this email. Please request a code first.' };
    }
    if (Date.now() > record.expiresAt) {
        memoryStore.delete(normalizedEmail);
        return { valid: false, error: 'Verification code has expired. Please request a new one.' };
    }
    if (record.attempts >= 5) {
        memoryStore.delete(normalizedEmail);
        return { valid: false, error: 'Too many failed attempts. Please request a new code.' };
    }
    const isMatch = await bcryptjs_1.default.compare(trimmedCode, record.otpHash);
    if (!isMatch) {
        record.attempts += 1;
        const remaining = 5 - record.attempts;
        return { valid: false, error: `Invalid code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Code blocked.'}` };
    }
    memoryStore.delete(normalizedEmail);
    return { valid: true };
}
