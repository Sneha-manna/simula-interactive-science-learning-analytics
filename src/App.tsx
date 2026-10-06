import React, { useState, useEffect } from 'react';
import { Navigation, NavView } from './components/layout/Navigation';
import { HomeView } from './components/home/HomeView';
import { LibraryView } from './components/library/LibraryView';
import { SimulationView } from './components/simulation/SimulationView';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { RecommendationsView } from './components/analytics/RecommendationsView';
import { ProfileView } from './components/profile/ProfileView';
import { AuthModal, AuthMode } from './components/auth/AuthModal';
import { ProtectedView } from './components/auth/ProtectedView';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { storageService } from './storage/localStorage';
import { UserProfile } from './types/user';
import { FlaskConical } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<NavView>('library');
  const [activeSimId, setActiveSimId] = useState<string>('math-linear-equation');
  const [userProfile, setUserProfile] = useState<UserProfile>(storageService.getUserProfile());

  // Auth modal management
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');
  const [authPromptMessage, setAuthPromptMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Refresh user profile if updated
    setUserProfile(storageService.getUserProfile());
  }, [currentView, user]);

  const handleOpenAuthModal = (mode: AuthMode = 'login', message?: string) => {
    setAuthModalMode(mode);
    setAuthPromptMessage(message);
    setIsAuthModalOpen(true);
  };

  const handleSelectSim = (simId: string) => {
    setActiveSimId(simId);
    setCurrentView('simulation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: NavView, simId?: string) => {
    if (simId) {
      setActiveSimId(simId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navbar */}
      <Navigation
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        userProfile={userProfile}
        onOpenAuthModal={() => handleOpenAuthModal('login')}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4">
        {currentView === 'home' && (
          <HomeView
            onNavigate={(view, simId) => handleNavigate(view, simId)}
            onOpenLogin={() => handleOpenAuthModal('login')}
          />
        )}

        {currentView === 'library' && (
          <LibraryView
            onSelectSimulation={(id) => handleSelectSim(id)}
          />
        )}

        {currentView === 'simulation' && (
          <SimulationView
            simulationId={activeSimId}
            onBack={() => setCurrentView('library')}
            onNavigateToSim={(id) => handleSelectSim(id)}
          />
        )}

        {currentView === 'analytics' && (
          <ProtectedView
            title="Student Learning Analytics"
            description="Sign in to view your personalized experiment scores, error analysis, subject mastery distributions, and telemetry records."
            onOpenLogin={() => handleOpenAuthModal('login', 'Sign in to access your private analytics.')}
          >
            <AnalyticsDashboard
              onNavigateToSim={(id) => handleSelectSim(id)}
            />
          </ProtectedView>
        )}

        {currentView === 'recommendations' && (
          <ProtectedView
            title="Personalized Learning Pathways"
            description="Sign in to view targeted recommendations calculated specifically from your previous simulation performance and conceptual gaps."
            onOpenLogin={() => handleOpenAuthModal('login', 'Sign in to view personalized curriculum recommendations.')}
          >
            <RecommendationsView
              onNavigateToSim={(id) => handleSelectSim(id)}
            />
          </ProtectedView>
        )}

        {currentView === 'profile' && (
          <ProtectedView
            title="Student Profile & Badges"
            description="Sign in to view your learning goals, earned badges, and personal profile settings."
            onOpenLogin={() => handleOpenAuthModal('login', 'Sign in to manage your profile.')}
          >
            <ProfileView
              onNavigateToSim={(id) => handleSelectSim(id)}
              onOpenLogin={() => handleOpenAuthModal('login')}
            />
          </ProtectedView>
        )}
      </main>

      {/* Auth Modal for Login, Signup, Forgot Password */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        requiredForMessage={authPromptMessage}
      />

      {/* Modern STEM Platform Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 mt-16 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FlaskConical className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-200">SIMULAB Platform</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-[11px]">150+ Modular Simulation Architecture</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <button
              onClick={() => setCurrentView('library')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Simulations
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Student Telemetry
            </button>
            <button
              onClick={() => setCurrentView('recommendations')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Learning Pathways
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => setCurrentView('profile')}
                className="hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Profile &amp; Badges
              </button>
            ) : (
              <button
                onClick={() => handleOpenAuthModal('login')}
                className="hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => setCurrentView('home')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Platform Overview
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
