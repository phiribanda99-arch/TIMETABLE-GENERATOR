import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  BookOpen,
  Users,
  DoorOpen,
  Layers,
  BarChart3,
  AlertOctagon,
  History,
  FileText,
  RefreshCcw,
  GraduationCap
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'timetable'
  | 'courses'
  | 'lecturers'
  | 'classrooms'
  | 'cohorts'
  | 'exams'
  | 'analytics'
  | 'conflicts'
  | 'audit';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, currentTimetable, resetToDefaultData } = useApp();

  const isStudent = currentUser.role === 'STUDENT';
  const isLecturer = currentUser.role === 'LECTURER';

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      badge: null,
      roles: ['ADMIN', 'HOD', 'LECTURER', 'STUDENT'],
    },
    {
      id: 'timetable' as NavTab,
      label: isStudent ? 'My Timetable' : isLecturer ? 'Teaching Schedule' : 'Master Timetable',
      icon: CalendarDays,
      badge: currentTimetable ? `${currentTimetable.entries.length}` : null,
      roles: ['ADMIN', 'HOD', 'LECTURER', 'STUDENT'],
    },
    {
      id: 'exams' as NavTab,
      label: 'Exam Timetable Diet',
      icon: GraduationCap,
      badge: 'Diet',
      roles: ['ADMIN', 'HOD', 'LECTURER', 'STUDENT'],
    },
    {
      id: 'courses' as NavTab,
      label: 'Courses & Modules',
      icon: BookOpen,
      roles: ['ADMIN', 'HOD'],
    },
    {
      id: 'lecturers' as NavTab,
      label: 'Lecturers & Availability',
      icon: Users,
      roles: ['ADMIN', 'HOD'],
    },
    {
      id: 'classrooms' as NavTab,
      label: 'Classrooms & Labs',
      icon: DoorOpen,
      roles: ['ADMIN', 'HOD'],
    },
    {
      id: 'cohorts' as NavTab,
      label: 'Student Cohorts',
      icon: Layers,
      roles: ['ADMIN', 'HOD'],
    },
    {
      id: 'analytics' as NavTab,
      label: 'Workload & Utilization',
      icon: BarChart3,
      roles: ['ADMIN', 'HOD', 'LECTURER'],
    },
    {
      id: 'conflicts' as NavTab,
      label: 'Conflict Diagnostics',
      icon: AlertOctagon,
      badge:
        currentTimetable && currentTimetable.stats.hardConflictsCount > 0
          ? `${currentTimetable.stats.hardConflictsCount}`
          : null,
      badgeColor: 'bg-rose-500 text-white',
      roles: ['ADMIN', 'HOD', 'LECTURER'],
    },
    {
      id: 'audit' as NavTab,
      label: 'Version History & Audit',
      icon: History,
      roles: ['ADMIN'],
    },
  ];

  const allowedItems = navItems.filter((item) => item.roles.includes(currentUser.role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 no-print">
      {/* User profile card */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-inner">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-white truncate">{currentUser.name}</h4>
            <p className="text-xs text-indigo-400 truncate">{currentUser.title || currentUser.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Management
        </div>

        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    item.badgeColor || (isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status & Reset */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Optimization Engine</span>
            <span className="text-emerald-400 font-mono font-semibold">CP-SAT</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Mathematical solver with multi-pass heuristic annealing.
          </div>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => {
              if (confirm('Reset academic database to clean factory demonstration seed?')) {
                resetToDefaultData();
              }
            }}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Database</span>
          </button>
        )}
      </div>
    </aside>
  );
};
