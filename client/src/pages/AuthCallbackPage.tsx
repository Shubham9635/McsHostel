import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [statusText, setStatusText] = useState('Authenticating with Google...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isHandled = false;

    const processAuth = async () => {
      try {
        // 1. Check for errors in the URL search params (e.g. user cancelled)
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const error = params.get('error') || hashParams.get('error');
        const errorDesc = params.get('error_description') || hashParams.get('error_description');

        if (error) {
          const message = errorDesc || 'Google sign-in was cancelled or failed.';
          setErrorMsg(message);
          toast.error(message);
          setTimeout(() => navigate('/login', { replace: true }), 2500);
          return;
        }

        setStatusText('Retrieving Google session...');

        // 2. Fetch active session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        // If session not ready yet in getSession, wait briefly or listen to authStateChange
        let currentSession = session;
        if (!currentSession) {
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (isHandled) return;
            if (event === 'SIGNED_IN' && newSession) {
              isHandled = true;
              authListener.subscription.unsubscribe();
              await handleSessionLogin(newSession);
            }
          });

          // Timeout after 6 seconds if no session is received
          setTimeout(() => {
            if (!isHandled) {
              authListener.subscription.unsubscribe();
              setErrorMsg('Google session not found. Please try signing in again.');
              toast.error('Google session not found.');
              setTimeout(() => navigate('/login', { replace: true }), 2000);
            }
          }, 6000);
          return;
        }

        if (!isHandled) {
          isHandled = true;
          await handleSessionLogin(currentSession);
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        const msg = err.response?.data?.error || err.message || 'Failed to authenticate with Google.';
        setErrorMsg(msg);
        toast.error(msg);
        setTimeout(() => navigate('/login', { replace: true }), 2500);
      }
    };

    const handleSessionLogin = async (session: any) => {
      try {
        setStatusText('Synchronizing profile with HostelHub...');
        const email = session.user?.email;
        if (!email) {
          throw new Error('No email found in Google account.');
        }

        const fullName =
          session.user?.user_metadata?.full_name ||
          session.user?.user_metadata?.name ||
          email.split('@')[0];
        const avatarUrl =
          session.user?.user_metadata?.avatar_url ||
          session.user?.user_metadata?.picture ||
          null;

        // Exchange Google identity with HostelHub backend
        const { user, is_new_user } = await googleLogin(email, fullName, avatarUrl);

        if (user.role === 'admin') {
          toast.success(`Welcome to Admin Panel, ${user.name.split(' ')[0]}!`);
          navigate('/admin', { replace: true });
          return;
        }

        if (is_new_user || !user.hostel || !user.room) {
          toast.success('Signed in with Google! Please complete your hostel details');
          navigate('/onboarding', { replace: true });
          return;
        }

        toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
        navigate('/student', { replace: true });
      } catch (err: any) {
        console.error('Session login error:', err);
        const msg = err.response?.data?.error || err.message || 'Failed to process Google sign-in.';
        setErrorMsg(msg);
        toast.error(msg);
        setTimeout(() => navigate('/login', { replace: true }), 2500);
      }
    };

    processAuth();
  }, [googleLogin, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[var(--bg-primary)] text-[var(--text-heading)]">
      <div className="w-full max-w-sm p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl text-center space-y-5">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-bold text-lg">
          <span>🏨 Hostel<strong className="text-indigo-400">Hub</strong></span>
        </div>

        {errorMsg ? (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-red-400">Authentication Notice</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{errorMsg}</p>
            <p className="text-[11px] text-[var(--text-muted)]">Redirecting back to login...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative w-14 h-14 mx-auto">
              <div className="w-14 h-14 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[var(--text-heading)]">Signing You In</h3>
              <p className="text-xs text-[var(--text-muted)]">{statusText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
