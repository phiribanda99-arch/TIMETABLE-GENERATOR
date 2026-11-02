import React from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface ConflictsViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const ConflictsView: React.FC<ConflictsViewProps> = ({ onNavigate }) => {
  const { currentTimetable, generateTimetableAction, isGenerating, loadInfeasibleScenario } = useApp();

  const diagnostics = currentTimetable?.diagnostics || [];
  const hardErrors = diagnostics.filter((d) => d.severity === 'HARD_ERROR');
  const softWarnings = diagnostics.filter((d) => d.severity === 'SOFT_WARNING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Constraint Conflict & Diagnostics Center</h2>
          <p className="text-xs text-slate-500">
            Independent verification audit: Explains constraint violations, infeasible conditions, and resolution guidance
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={loadInfeasibleScenario}
            className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors cursor-pointer"
            title="Inject an impossible constraint to observe how the system detects and explains it"
          >
            Load Infeasible Test Dataset
          </button>

          <button
            type="button"
            disabled={isGenerating}
            onClick={() => generateTimetableAction()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Re-solve with CP-SAT</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hard Constraint Violations
            </span>
            <AlertOctagon className={`w-5 h-5 ${hardErrors.length > 0 ? 'text-rose-600' : 'text-slate-300'}`} />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-2xl font-black ${hardErrors.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {hardErrors.length}
            </span>
            <span className="text-xs text-slate-500">
              {hardErrors.length === 0 ? 'Zero clashes (Valid)' : 'Blocking publish'}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Soft Policy Advisories
            </span>
            <AlertTriangle className={`w-5 h-5 ${softWarnings.length > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-600">{softWarnings.length}</span>
            <span className="text-xs text-slate-500">Optimization warnings</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Audit Status
            </span>
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-base font-bold text-slate-900">
              {hardErrors.length === 0 ? 'Certified Feasible' : 'Requires Resolution'}
            </span>
          </div>
        </div>
      </div>

      {/* Diagnostics List */}
      <div className="space-y-3">
        {diagnostics.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Zero Scheduling Conflicts Detected</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Every course session satisfies lecturer availability, classroom capacity, room type specifications,
              and non-overlapping student group contact hours.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => onNavigate('timetable')}
                className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                Inspect Timetable Grid
              </button>
            </div>
          </div>
        ) : (
          diagnostics.map((diag) => {
            const isHard = diag.severity === 'HARD_ERROR';
            return (
              <div
                key={diag.id}
                className={`p-4 rounded-xl border transition-all ${
                  isHard
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg mt-0.5 ${
                        isHard ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                      }`}
                    >
                      {isHard ? <AlertOctagon className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm tracking-tight">{diag.title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isHard ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                          }`}
                        >
                          {diag.severity.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/10">
                          {diag.ruleCode}
                        </span>
                      </div>

                      <p className="text-xs mt-1 leading-relaxed opacity-90">{diag.description}</p>

                      {diag.suggestedAction && (
                        <div className="mt-2.5 flex items-start space-x-1.5 text-xs font-medium">
                          <Wrench className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-80" />
                          <span>
                            <strong>Suggested Resolution:</strong> {diag.suggestedAction}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {diag.day && (
                    <div className="text-right text-xs shrink-0">
                      <span className="font-bold block">{diag.day}</span>
                      <span className="text-[11px] opacity-75">Slot {diag.slotIndex}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
