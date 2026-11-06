import React, { useState, useId } from 'react';
import { TimetableEntry, Classroom, DayOfWeek } from '../types';
import { useApp } from '../context/AppContext';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../data/constants';
import { validateTimetable } from '../engine/validator';
import { AlertCircle, CheckCircle2, Lock, Unlock, X } from 'lucide-react';

interface ManualMoveModalProps {
  entry: TimetableEntry;
  onClose: () => void;
}

export const ManualMoveModal: React.FC<ManualMoveModalProps> = ({ entry, onClose }) => {
  const {
    courses,
    lecturers,
    rooms,
    studentGroups,
    currentTimetable,
    manualMoveSession,
    toggleSessionLock,
  } = useApp();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(entry.day);
  const [selectedSlot, setSelectedSlot] = useState<number>(entry.startSlotIndex);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(entry.roomId);
  const [feedback, setFeedback] = useState<{ isError: boolean; message: string } | null>(null);

  const daySelectId = useId();
  const slotSelectId = useId();
  const roomSelectId = useId();

  const course = courses.find((c) => c.id === entry.courseId);
  const lecturer = lecturers.find((l) => l.id === entry.lecturerId);
  const group = studentGroups.find((g) => g.id === entry.studentGroupId);
  const currentRoom = rooms.find((r) => r.id === entry.roomId);

  // Live pre-validation check
  const checkLiveValidation = (day: DayOfWeek, slot: number, roomId: string) => {
    if (!currentTimetable) return { isValid: true, message: 'Valid' };

    const candidateEntries = currentTimetable.entries.map((e) =>
      e.id === entry.id
        ? {
            ...e,
            day,
            startSlotIndex: slot,
            roomId,
          }
        : e
    );

    const validation = validateTimetable(
      candidateEntries,
      courses,
      lecturers,
      rooms,
      studentGroups
    );

    if (!validation.isValid) {
      const err = validation.diagnostics.find((d) => d.severity === 'HARD_ERROR');
      return {
        isValid: false,
        message: err
          ? `${err.title}: ${err.description}`
          : 'Move violates university hard constraints.',
      };
    }

    return { isValid: true, message: 'Constraint Check Passed: Zero conflicts.' };
  };

  const preview = checkLiveValidation(selectedDay, selectedSlot, selectedRoomId);

  const handleApplyMove = () => {
    const res = manualMoveSession(entry.id, selectedDay, selectedSlot, selectedRoomId);
    if (res.success) {
      onClose();
    } else {
      setFeedback({ isError: true, message: res.error || 'Failed to move session.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold tracking-tight">Manual Timetable Allocation</h3>
            <p className="text-xs text-slate-300">
              Relocate session with real-time mathematical validation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Details Card */}
        <div className="p-6 space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-indigo-900">
                {course?.code} — {course?.title}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-200/60 text-indigo-800">
                {entry.sessionType} ({entry.durationSlots} hr{entry.durationSlots > 1 ? 's' : ''})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-indigo-700">
              <div>
                <span className="text-indigo-400">Lecturer:</span> {lecturer?.name}
              </div>
              <div>
                <span className="text-indigo-400">Cohort:</span> {group?.name}
              </div>
              <div>
                <span className="text-indigo-400">Current Room:</span> {currentRoom?.code} ({currentRoom?.capacity} seats)
              </div>
              <div>
                <span className="text-indigo-400">Current Slot:</span> {entry.day} @ {TIME_SLOTS[entry.startSlotIndex]?.timeLabel}
              </div>
            </div>
          </div>

          {/* Form Controls */}
          <div className="space-y-3">
            <div>
              <label htmlFor={daySelectId} className="block text-xs font-semibold text-slate-700 mb-1">Target Day</label>
              <select
                id={daySelectId}
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={slotSelectId} className="block text-xs font-semibold text-slate-700 mb-1">
                Target Time Window (Duration: {entry.durationSlots} Hour{entry.durationSlots > 1 ? 's' : ''})
              </label>
              <select
                id={slotSelectId}
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {TIME_SLOTS.filter((s) => s.slotIndex + entry.durationSlots <= TIME_SLOTS.length).map(
                  (s) => (
                    <option key={s.slotIndex} value={s.slotIndex}>
                      {s.timeLabel}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label htmlFor={roomSelectId} className="block text-xs font-semibold text-slate-700 mb-1">Target Classroom / Laboratory</label>
              <select
                id={roomSelectId}
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} — {r.name} ({r.capacity} seats · {r.roomType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Real-time Constraint Verification Banner */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
              preview.isValid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {preview.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold block">
                {preview.isValid ? 'Validation Succeeded' : 'Constraint Conflict Detected'}
              </span>
              <p className="mt-0.5 leading-relaxed">{preview.message}</p>
            </div>
          </div>

          {feedback && (
            <div className="p-3 bg-rose-100 text-rose-800 rounded-lg text-xs font-medium">
              {feedback.message}
            </div>
          )}

          {/* Lock Session Option */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => toggleSessionLock(entry.id)}
              className={`inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                entry.isLocked
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {entry.isLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Session is Locked (Pinned)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Session is Unlocked</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-500">
              Locked slots survive re-generation
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!preview.isValid}
            onClick={handleApplyMove}
            className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer ${
              preview.isValid
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/25'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            Commit Relocation
          </button>
        </div>
      </div>
    </div>
  );
};
