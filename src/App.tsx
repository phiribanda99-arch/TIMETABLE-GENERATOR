import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { TimetableGrid } from './components/TimetableGrid';
import { CoursesView } from './views/CoursesView';
import { LecturersView } from './views/LecturersView';
import { RoomsView } from './views/RoomsView';
import { CohortsView } from './views/CohortsView';
import { AnalyticsView } from './views/AnalyticsView';
import { ConflictsView } from './views/ConflictsView';
import { AuditLogsView } from './views/AuditLogsView';
import { ExamDietView } from './views/ExamDietView';
import { SolverConfigModal } from './components/SolverConfigModal';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const { isGenerating } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation */}
      <Navbar onOpenConfig={() => setIsConfigModalOpen(true)} />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
          {/* Generation Loading Overlay */}
          {isGenerating && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-xs text-white">
              <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-bold tracking-tight">Solving CP-SAT Optimization Model...</h2>
              <p className="text-sm text-slate-300 mt-1 max-w-sm text-center">
                Applying hard conflict pruning, lecturer availability domains, and multi-objective soft annealing.
              </p>
            </div>
          )}

          {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === 'timetable' && <TimetableGrid />}
          {activeTab === 'courses' && <CoursesView />}
          {activeTab === 'lecturers' && <LecturersView />}
          {activeTab === 'classrooms' && <RoomsView />}
          {activeTab === 'cohorts' && <CohortsView />}
          {activeTab === 'exams' && <ExamDietView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'conflicts' && <ConflictsView onNavigate={setActiveTab} />}
          {activeTab === 'audit' && <AuditLogsView />}
        </main>
      </div>

      {/* CP-SAT Solver Config Modal */}
      {isConfigModalOpen && (
        <SolverConfigModal onClose={() => setIsConfigModalOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
