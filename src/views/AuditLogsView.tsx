import React from 'react';
import { useApp } from '../context/AppContext';
import { History, CheckCircle2, RotateCcw, ShieldCheck, FileSpreadsheet, Sparkles } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const {
    timetableVersions,
    currentTimetable,
    revertToVersion,
    publishTimetableAction,
    auditLogs,
    currentUser,
  } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Timetable Versions & Governance Audit Trail</h2>
        <p className="text-xs text-slate-500">
          Track academic timetable generation runs, compare mathematical solutions, and view immutable change logs
        </p>
      </div>

      {/* Timetable Versions History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Academic Schedule Versions</h3>
          </div>
          <span className="text-xs text-slate-500">
            {timetableVersions.length} versions generated
          </span>
        </div>

        <div className="space-y-3">
          {timetableVersions.map((version) => {
            const isActive = currentTimetable?.id === version.id;
            const isPublished = version.status === 'PUBLISHED';

            return (
              <div
                key={version.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{version.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isPublished
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {version.status}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                        Active in View
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Created: {new Date(version.createdAt).toLocaleString()}</span>
                    <span>By: {version.createdBy}</span>
                    <span>Solver: {version.solverStatus}</span>
                    <span className="font-semibold text-slate-700">
                      {version.entries.length} Sessions Scheduled
                    </span>
                    <span
                      className={`font-semibold ${
                        version.stats.hardConflictsCount === 0
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {version.stats.hardConflictsCount} Conflicts
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => revertToVersion(version.id)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Switch to Version</span>
                    </button>
                  )}

                  {isActive && version.status === 'DRAFT' && currentUser.role === 'ADMIN' && (
                    <button
                      type="button"
                      onClick={publishTimetableAction}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Publish Version</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Security & Administrative Audit Log</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {auditLogs.length} events logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-indigo-700 font-mono text-[11px]">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{log.userName}</td>
                  <td className="py-2.5 px-4 text-slate-600">{log.userRole}</td>
                  <td className="py-2.5 px-4 text-slate-700 max-w-md">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
