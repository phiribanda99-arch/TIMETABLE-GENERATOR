import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  BookOpen,
  Users,
  DoorOpen,
  Layers,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  ArrowRight,
  ShieldAlert,
  Download,
  GraduationCap
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';
import { exportTimetableToExcel } from '../engine/export';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    courses,
    lecturers,
    rooms,
    studentGroups,
    currentTimetable,
    isGenerating,
    generateTimetableAction,
    publishTimetableAction,
    auditLogs,
    currentUser,
  } = useApp();

  const stats = currentTimetable?.stats;

  const handleGenerate = async () => {
    await generateTimetableAction();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 pointer-events-none flex items-center justify-center">
          <img
            src="/assets/aistudio/unitime-badge_19717ed6.png"
            alt=""
            className="w-80 h-80 object-contain"
          />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Intelligent Constraint Satisfaction Engine (CP-SAT)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Chalimbana University Timetable Portal
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Welcome back, <span className="font-semibold text-white">{currentUser.name}</span>.
            {currentUser.role === 'ADMIN' &&
              ' As Academic Registrar, you can trigger mathematical schedule optimization, manage university faculties, inspect room capacities, resolve clashes, and publish certified academic timetables.'}
            {currentUser.role === 'HOD' &&
              ' Inspect departmental course allocations, manage lecturer teaching availability, and monitor laboratory capacity.'}
            {currentUser.role === 'LECTURER' &&
              ' Access your personal teaching timetable, venue allocations, and weekly teaching workload analysis.'}
            {currentUser.role === 'STUDENT' &&
              ' View your semester course schedules, room locations, lecture hours, and download your personal weekly timetable.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {currentUser.role === 'ADMIN' && (
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/40 hover:shadow-indigo-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Solving CP-SAT Constraints...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Intelligent Timetable</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('timetable')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>View Active Timetable</span>
            </button>

            {currentTimetable && currentUser.role === 'ADMIN' && currentTimetable.status === 'DRAFT' && (
              <button
                type="button"
                onClick={publishTimetableAction}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Approved Version</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Courses
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{courses.length}</span>
            <span className="text-xs text-slate-500 font-medium">Modules</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Teaching Faculty
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{lecturers.length}</span>
            <span className="text-xs text-slate-500 font-medium">Lecturers</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Classrooms & Labs
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <DoorOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{rooms.length}</span>
            <span className="text-xs text-slate-500 font-medium">Venues</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Student Cohorts
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{studentGroups.length}</span>
            <span className="text-xs text-slate-500 font-medium">Groups</span>
          </div>
        </div>
      </div>

      {/* Timetable Optimization State & Engine Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Generation Health & Metrics */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Optimization Status & Constraint Health
              </h2>
              <p className="text-xs text-slate-500">
                Mathematical solver verification for active semester timetable
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                currentTimetable?.solverStatus === 'OPTIMAL'
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentTimetable?.solverStatus === 'FEASIBLE'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              Solver: {currentTimetable?.solverStatus || 'UNSOLVED'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Scheduled Sessions
              </span>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-xl font-bold text-slate-900">
                  {stats?.scheduledSessions ?? 0}
                </span>
                <span className="text-xs text-slate-400">/ {stats?.totalSessions ?? 0}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Hard Conflicts
              </span>
              <div className="mt-1 flex items-baseline space-x-1">
                <span
                  className={`text-xl font-bold ${
                    (stats?.hardConflictsCount ?? 0) === 0
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {stats?.hardConflictsCount ?? 0}
                </span>
                <span className="text-xs text-slate-400">Clashes</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Room Utilization
              </span>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-xl font-bold text-slate-900">
                  {stats?.roomUtilizationPct ?? 0}%
                </span>
                <span className="text-xs text-slate-400">Capacity</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Solver Runtime
              </span>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-xl font-bold text-slate-900">
                  {stats?.solverRuntimeMs ?? 0}
                </span>
                <span className="text-xs text-slate-400">ms</span>
              </div>
            </div>
          </div>

          {/* Quick Conflict Notification */}
          {currentTimetable?.diagnostics && currentTimetable.diagnostics.length > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-amber-900">
                    {currentTimetable.diagnostics.length} Advisory Diagnostic(s) Logged
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {currentTimetable.diagnostics[0].description}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('conflicts')}
                    className="mt-2 inline-flex items-center space-x-1 text-xs font-bold text-amber-900 hover:text-amber-950 underline"
                  >
                    <span>Inspect all diagnostics in Conflict Center</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900">
                  Clean Schedule: 100% Constraints Satisfied
                </h4>
                <p className="text-xs text-emerald-700">
                  No lecturer double-bookings, room collisions, or cohort clashes detected.
                </p>
              </div>
            </div>
          )}

          {/* Feature shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div
              onClick={() => onNavigate('timetable')}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">Interactive Grid Matrix</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Filter by department, lecturer, room, or student group with drag-free manual adjustment.
              </p>
            </div>

            <div
              onClick={() => onNavigate('exams')}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">Examination Diet</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                View university examination diets, invigilator assignments, and exam hall capacities.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Recent Audit & Activity Log */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">University Audit Log</h3>
              <button
                type="button"
                onClick={() => onNavigate('audit')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View Full
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-indigo-400 pl-3 py-0.5">
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span className="font-semibold text-indigo-900">{log.action}</span>
                    <span>{log.timestamp.split(',')[1] || log.timestamp}</span>
                  </div>
                  <p className="text-slate-700 font-medium mt-0.5 line-clamp-2">
                    {log.details}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">By {log.userName}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-800 block">Quick Action</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Export official multi-sheet timetable workbook for distribution.
            </p>
            <button
              type="button"
              onClick={() => currentTimetable && exportTimetableToExcel(currentTimetable, courses, lecturers, rooms, studentGroups)}
              className="mt-2 w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-300 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Excel Workbook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
