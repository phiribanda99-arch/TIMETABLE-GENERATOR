import React from 'react';
import { useApp } from '../context/AppContext';
import {
  computeRoomUtilization,
  computeLecturerWorkloads,
  computeDailyLoadHeatmap
} from '../engine/analytics';
import { BarChart3, DoorOpen, Users, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { currentTimetable, rooms, lecturers, courses } = useApp();

  const entries = currentTimetable?.entries || [];

  const roomStats = computeRoomUtilization(entries, rooms);
  const lecturerStats = computeLecturerWorkloads(entries, lecturers, courses);
  const dailyHeatmap = computeDailyLoadHeatmap(entries);

  // Sort rooms by highest utilization
  roomStats.sort((a, b) => b.utilizationPercentage - a.utilizationPercentage);

  // Sort lecturers by scheduled hours
  lecturerStats.sort((a, b) => b.scheduledHours - a.scheduledHours);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Workload & Campus Resource Analytics</h2>
        <p className="text-xs text-slate-500">
          Optimization efficiency, room utilization heatmaps, and academic teaching load distributions
        </p>
      </div>

      {/* Daily Heatmap Grid */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Campus-Wide Daily Session Distribution</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total Weekly Session Hours: {entries.reduce((a, b) => a + b.durationSlots, 0)} Hours
          </span>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {dailyHeatmap.map((item) => (
            <div
              key={item.day}
              className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center space-y-2"
            >
              <span className="text-xs font-bold text-slate-700 block">{item.day}</span>
              <div className="text-2xl font-black text-indigo-700">{item.totalHours}</div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Class Hours
              </span>
              <div className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">
                {item.peakSlot}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Section: Room Utilization & Lecturer Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Utilization */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <DoorOpen className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Classroom & Lab Utilization</h3>
            </div>
            <span className="text-xs text-slate-400">Weekly Basis</span>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
            {roomStats.map((r) => (
              <div key={r.roomId} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {r.roomCode}{' '}
                    <span className="font-normal text-slate-500">
                      ({r.capacity} seats · {r.roomType})
                    </span>
                  </span>
                  <span className="font-semibold text-slate-700">
                    {r.bookedSlots} / {r.totalSlots}h ({r.utilizationPercentage}%)
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      r.utilizationPercentage > 75
                        ? 'bg-rose-500'
                        : r.utilizationPercentage > 40
                        ? 'bg-indigo-600'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, r.utilizationPercentage)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lecturer Teaching Workload */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Lecturer Teaching Workload Distribution</h3>
            </div>
            <span className="text-xs text-slate-400">Hours / Contract Limit</span>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
            {lecturerStats.map((l) => (
              <div key={l.lecturerId} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {l.name}{' '}
                    <span className="font-normal text-slate-500">({l.staffId})</span>
                  </span>
                  <span
                    className={`font-semibold ${
                      l.isOverloaded ? 'text-rose-600 font-bold' : 'text-slate-700'
                    }`}
                  >
                    {l.scheduledHours} / {l.maxWeeklyHours}h ({l.utilizationPercentage}%)
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      l.isOverloaded
                        ? 'bg-rose-600'
                        : l.utilizationPercentage >= 90
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, l.utilizationPercentage)}%` }}
                  ></div>
                </div>

                <div className="text-[10px] text-slate-400">
                  Modules: {l.coursesTaught.length > 0 ? l.coursesTaught.join(', ') : 'None scheduled'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
