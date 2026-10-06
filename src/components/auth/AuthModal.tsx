import React, { useState } from 'react';
import {
  FlaskConical,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export type AuthMode = 'login' | 'signup' | 'forgot_password';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess?: () => void;
  requiredForMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
  requiredForMessage,
}) => {
  const { login, register, requestPasswordReset } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Evaluate password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-blue-500', text: 'text-blue-400' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
      default:
        return { score: 10, label: 'Too short', color: 'bg-rose-500', text: 'text-rose-400' };
    }
  };

  const strength = getPasswordStrength(password);

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSwitchMode = (newMode: AuthMode) => {
    resetMessages();
    setMode(newMode);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanEmail = email.trim();
    const cleanName = name.trim();

    // Basic common validation
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!password) {
          setErrorMessage('Please enter your email and password.');
          setIsSubmitting(false);
          return;
        }

        const res = await login(cleanEmail, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Email or password is incorrect.');
          setIsSubmitting(false);
          return;
        }

        setSuccessMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          setIsSubmitting(false);
          if (onSuccess) onSuccess();
          onClose();
        }, 600);
      } else if (mode === 'signup') {
        if (!cleanName) {
          setErrorMessage('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }

        if (password.length < 8) {
          setErrorMessage('Password must be at least 8 characters long.');
          setIsSubmitting(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match. Please re-enter confirm password.');
          setIsSubmitting(false);
          return;
        }

        const res = await register({
          name: cleanName,
          email: cleanEmail,
          password,
        });

        if (!res.success) {
          setErrorMessage(res.error || 'Could not complete registration.');
          setIsSubmitting(false);
          return;
        }

        setSuccessMessage('Account created successfully! Welcome to SIMULAB.');
        setTimeout(() => {
          setIsSubmitting(false);
          if (onSuccess) onSuccess();
          onClose();
        }, 600);
      } else if (mode === 'forgot_password') {
        const res = await requestPasswordReset(cleanEmail);
        setIsSubmitting(false);
        if (res.success) {
          setSuccessMessage(res.message || 'Password reset instructions have been sent to your email.');
        } else {
          setErrorMessage(res.error || 'Unable to process reset request.');
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 my-8 text-slate-100">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="text-center relative mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3 shadow-lg shadow-cyan-500/10">
            <FlaskConical className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            {mode === 'login' && 'Welcome to SIMULAB'}
            {mode === 'signup' && 'Create Your Student Account'}
            {mode === 'forgot_password' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Access interactive laboratories, personalized pathways & telemetry.'}
            {mode === 'signup' && 'Join 150+ interactive physics, chemistry, and math simulations.'}
            {mode === 'forgot_password' && "Enter your email to receive secure recovery instructions."}
          </p>

          {requiredForMessage && (
            <div className="mt-3 py-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{requiredForMessage}</span>
            </div>
          )}
        </div>

        {/* Notification Alert (Error or Success) */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marie Curie"
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot_password')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator for Signup */}
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Password strength:</span>
                    <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In to SIMULAB'}
                  {mode === 'signup' && 'Create Free Account'}
                  {mode === 'forgot_password' && 'Send Reset Instructions'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Helper for seamless testing */}
        {mode === 'login' && (
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span className="font-mono">Default Demo Account:</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('alex.mercer@simulab.edu');
                  setPassword('Simulab2026!');
                  resetMessages();
                }}
                className="text-cyan-400 hover:underline font-semibold cursor-pointer"
              >
                Auto-fill credentials
              </button>
            </div>
            <div className="text-[10px] text-slate-400 font-mono bg-slate-950/50 p-2 rounded-lg border border-slate-800">
              alex.mercer@simulab.edu / Simulab2026!
            </div>
          </div>
        )}

        {/* Toggle Mode Footer */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {mode === 'login' && (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('signup')}
                className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline ml-1 cursor-pointer"
              >
                Create Account
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}

          {mode === 'forgot_password' && (
            <p>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline ml-1 cursor-pointer"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>

        {/* Mobile / Android compatibility note badge */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          <span>Optimized for Web &amp; Android Capacitor App</span>
        </div>

        {/* Close Button if opened as modal */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
