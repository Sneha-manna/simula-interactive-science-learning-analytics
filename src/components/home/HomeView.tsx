import React, { useState } from 'react';
import {
  Compass,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Atom,
  Binary,
  FlaskConical,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  BookOpen,
  Lock,
  ShieldCheck,
  UserCheck,
  Flame,
} from 'lucide-react';
import { NavView } from '../layout/Navigation';
import { useAuth } from '../../auth/AuthContext';

interface HomeViewProps {
  onNavigate: (view: NavView, simId?: string) => void;
  onOpenLogin?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenLogin }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-16 py-8 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-8 md:p-14 text-center max-w-5xl mx-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.12),transparent_60%)] pointer-events-none" />

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Interactive STEM Laboratory System</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-100 tracking-tight max-w-4xl mx-auto leading-tight">
            Learn Math, Physics &amp; Chemistry Through{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
              Interactive Simulation
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Move beyond static textbooks and video lectures. Manipulate parameters, observe real-time differential dynamics, and verify conceptual mastery through laboratory telemetry.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('library')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Simulations</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('analytics')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition-colors cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Student Telemetry</span>
            </button>

            {!isAuthenticated && onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-sm transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>

          {/* Authenticated User Status banner if logged in */}
          {isAuthenticated && user && (
            <div className="pt-4 flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>
                  Welcome back, <strong>{user.name}</strong> • Telemetry active under user account
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tri-Disciplinary STEM Pillars */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            Integrated Curriculum Modules
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
            High-fidelity mathematical models running locally in your browser with zero latency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mathematics */}
          <div
            onClick={() => onNavigate('library')}
            className="group p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer shadow-lg space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Binary className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold mb-1">
                Pure &amp; Applied
              </div>
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                Mathematics
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Functions, calculus integration, vector matrices, Fourier series, and probability distributions with dynamic parameter sliders.
            </p>
            <div className="flex items-center text-xs font-bold text-indigo-400 gap-1 pt-2">
              <span>Explore Math</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Physics */}
          <div
            onClick={() => onNavigate('library')}
            className="group p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer shadow-lg space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Atom className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold mb-1">
                Classical &amp; Quantum
              </div>
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                Physics
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Kinematics, Ohm's law circuit networks, Snell's optics, harmonic oscillators, and orbital gravitational mechanics.
            </p>
            <div className="flex items-center text-xs font-bold text-cyan-400 gap-1 pt-2">
              <span>Explore Physics</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Chemistry */}
          <div
            onClick={() => onNavigate('library')}
            className="group p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer shadow-lg space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1">
                Physical &amp; Organic
              </div>
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                Chemistry
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Acid-base titrations, Arrhenius reaction kinetics, ideal gas thermodynamics, periodic trends, and Bohr atomic orbital shells.
            </p>
            <div className="flex items-center text-xs font-bold text-emerald-400 gap-1 pt-2">
              <span>Explore Chemistry</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Telemetry & Pathway Callout */}
      <section className="max-w-5xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/40 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Deterministic Assessment Engine</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-100">
            Account-Based Learning Telemetry
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every simulation run logs attempts, accuracy rates, and misconception flags into your authenticated student account. Data is securely isolated per user so every student has an independent learning pathway.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => onNavigate('analytics')}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors text-center cursor-pointer"
          >
            View Student Telemetry
          </button>
          <button
            onClick={() => onNavigate('recommendations')}
            className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors text-center cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            Personalized Pathways
          </button>
        </div>
      </section>
    </div>
  );
};
