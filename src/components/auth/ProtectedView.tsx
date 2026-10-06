import React from 'react';
import { ShieldCheck, LogIn, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface ProtectedViewProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onOpenLogin: () => void;
}

export const ProtectedView: React.FC<ProtectedViewProps> = ({
  title,
  description,
  children,
  onOpenLogin,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 md:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authenticated Student Access Required</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Access</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
          Each student's simulation telemetry, score accuracy, and badges are isolated and stored securely.
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
