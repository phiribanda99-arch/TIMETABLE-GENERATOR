import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  School,
  AlertTriangle,
  RefreshCw,
  Sliders,
  CheckCircle2,
  FileSpreadsheet,
  LogOut
} from 'lucide-react';
import { Role } from '../types';

interface NavbarProps {
  onOpenConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenConfig }) => {
  const {
    currentUser,
    setCurrentUser,
    availableUsers,
    currentTimetable,
    isGenerating,
    generateTimetableAction,
    publishTimetableAction,
    loadInfeasibleScenario,
    resetToDefaultData,
    logout,
  } = useApp();

  const handleRoleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = availableUsers.find((u) => u.id === e.target.value);
    if (selected) {
      setCurrentUser(selected);
    }
  };

  const roleBadges: Record<Role, { label: string; color: string; icon: any }> = {
    ADMIN: { label: 'Academic Registrar', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: ShieldCheck },
    HOD: { label: 'Head of Dept', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: School },
    LECTURER: { label: 'Lecturer Portal', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: UserCheck },
    STUDENT: { label: 'Student Portal', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: GraduationCap },
  };

  const badge = roleBadges[currentUser.role];
  const Icon = badge.icon;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 py-1">
          {/* Brand & Crest */}
          <div className="flex items-center space-x-3.5">
            <img
              src="/assets/aistudio/unitime-badge_19717ed6.png"
              alt="CHAU Crest"
              className="w-9 h-9 object-contain shrink-0 drop-shadow-xs"
              onError={(e) => {
                // fallback if image not ready
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm sm:text-base font-black tracking-tight text-[#0b1d3d] leading-none uppercase">
                  UNIVERSITY INTELLIGENT
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  UniSchedule AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                Academic Timetable & Examination Scheduling System
              </p>
            </div>
          </div>

          {/* Center: Generation & Status Banner */}
          <div className="hidden xl:flex items-center space-x-3">
            {currentTimetable && (
              <div className="flex items-center space-x-2 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700">Active Schedule:</span>
                <span className="text-slate-600 truncate max-w-[200px]">
                  {currentTimetable.name}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    currentTimetable.status === 'PUBLISHED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {currentTimetable.status}
                </span>
                <span className="text-slate-400">|</span>
                <span
                  className={`font-semibold ${
                    currentTimetable.stats.hardConflictsCount === 0
                      ? 'text-emerald-700'
                      : 'text-rose-600'
                  }`}
                >
                  {currentTimetable.stats.hardConflictsCount === 0
                    ? '0 Clashes (Verified)'
                    : `${currentTimetable.stats.hardConflictsCount} Hard Clashes`}
                </span>
              </div>
            )}
          </div>

          {/* Right Action Tools & Role Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Infeasible Test Injector (for assessment) */}
            {currentUser.role === 'ADMIN' && (
              <button
                type="button"
                onClick={loadInfeasibleScenario}
                title="Inject impossible course requirement (500 students in 140 max room) to test solver conflict diagnostics"
                className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Test Infeasibility</span>
              </button>
            )}

            {/* Solver Config Trigger */}
            {currentUser.role === 'ADMIN' && (
              <button
                type="button"
                onClick={onOpenConfig}
                title="Configure CP-SAT Solver Parameters & Weights"
                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}

            {/* Role Switcher Pill */}
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold ${badge.color}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{badge.label}</span>
              </span>

              <select
                aria-label="Select Demo User Profile"
                value={currentUser.id}
                onChange={handleRoleSelect}
                className="text-xs font-medium text-slate-800 bg-transparent border-none focus:ring-0 focus:outline-hidden py-1 pr-2 cursor-pointer"
              >
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={logout}
              title="Sign Out to Login Screen"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
