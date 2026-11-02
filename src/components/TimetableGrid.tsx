import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  TimetableEntry,
  DayOfWeek,
  RoomType
} from '../types';
import {
  DAYS_OF_WEEK,
  TIME_SLOTS,
  LUNCH_SLOT_INDEX,
  ROOM_TYPE_BADGES,
  getCourseColor
} from '../data/constants';
import {
  Printer,
  Download,
  Filter,
  Search,
  Lock,
  Unlock,
  Building,
  User as UserIcon,
  Users,
  DoorOpen,
  Calendar,
  Sparkles,
  Layers
} from 'lucide-react';
import { exportTimetableToExcel, exportTimetableToCSV } from '../engine/export';
import { ManualMoveModal } from './ManualMoveModal';

export const TimetableGrid: React.FC = () => {
  const {
    currentTimetable,
    courses,
    lecturers,
    rooms,
    studentGroups,
    departments,
    programmes,
    currentUser,
    toggleSessionLock
  } = useApp();

  // Filters
  const [filterType, setFilterType] = useState<
    'ALL' | 'PROGRAMME' | 'GROUP' | 'LECTURER' | 'ROOM' | 'DEPARTMENT'
  >(() => {
    if (currentUser.role === 'STUDENT') return 'GROUP';
    if (currentUser.role === 'LECTURER') return 'LECTURER';
    return 'ALL';
  });

  const [selectedEntityId, setSelectedEntityId] = useState<string>(() => {
    if (currentUser.role === 'STUDENT') return currentUser.studentGroupId || 'grp-cs2';
    if (currentUser.role === 'LECTURER') {
      const match = lecturers.find((l) => l.staffId === currentUser.staffId);
      return match ? match.id : lecturers[0]?.id || '';
    }
    return '';
  });

  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSessionForModal, setActiveSessionForModal] = useState<TimetableEntry | null>(null);

  // Maps for rapid lookup
  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);
  const lecturerMap = useMemo(() => new Map(lecturers.map((l) => [l.id, l])), [lecturers]);
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const groupMap = useMemo(() => new Map(studentGroups.map((g) => [g.id, g])), [studentGroups]);

  // Filter entries based on active filters
  const filteredEntries = useMemo(() => {
    if (!currentTimetable) return [];
    let list = currentTimetable.entries;

    // Entity filter
    if (filterType === 'GROUP' && selectedEntityId) {
      list = list.filter((e) => e.studentGroupId === selectedEntityId);
    } else if (filterType === 'LECTURER' && selectedEntityId) {
      list = list.filter((e) => e.lecturerId === selectedEntityId);
    } else if (filterType === 'ROOM' && selectedEntityId) {
      list = list.filter((e) => e.roomId === selectedEntityId);
    } else if (filterType === 'DEPARTMENT' && selectedEntityId) {
      const deptCourses = new Set(
        courses.filter((c) => c.departmentId === selectedEntityId).map((c) => c.id)
      );
      list = list.filter((e) => deptCourses.has(e.courseId));
    } else if (filterType === 'PROGRAMME' && selectedEntityId) {
      const progCourses = new Set(
        courses.filter((c) => c.programmeId === selectedEntityId).map((c) => c.id)
      );
      list = list.filter((e) => progCourses.has(e.courseId));
    }

    // Day filter
    if (selectedDay !== 'ALL') {
      list = list.filter((e) => e.day === selectedDay);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) => {
        const c = courseMap.get(e.courseId);
        const l = lecturerMap.get(e.lecturerId);
        const r = roomMap.get(e.roomId);
        const g = groupMap.get(e.studentGroupId);
        return (
          c?.code.toLowerCase().includes(q) ||
          c?.title.toLowerCase().includes(q) ||
          l?.name.toLowerCase().includes(q) ||
          r?.code.toLowerCase().includes(q) ||
          g?.name.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [
    currentTimetable,
    filterType,
    selectedEntityId,
    selectedDay,
    searchQuery,
    courseMap,
    lecturerMap,
    roomMap,
    groupMap,
    courses,
  ]);

  const displayedDays = selectedDay === 'ALL' ? DAYS_OF_WEEK : [selectedDay];

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!currentTimetable) return;
    exportTimetableToExcel(currentTimetable, courses, lecturers, rooms, studentGroups);
  };

  const handleExportCSV = () => {
    if (!currentTimetable) return;
    exportTimetableToCSV(
      filteredEntries,
      courses,
      lecturers,
      rooms,
      studentGroups,
      `CHAU_Schedule_${filterType}_${selectedEntityId || 'All'}.csv`
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs no-print space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: View Filter Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 mr-1">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>View Mode:</span>
            </div>

            <select
              value={filterType}
              onChange={(e) => {
                const val = e.target.value as any;
                setFilterType(val);
                if (val === 'GROUP') setSelectedEntityId(studentGroups[0]?.id || '');
                else if (val === 'LECTURER') setSelectedEntityId(lecturers[0]?.id || '');
                else if (val === 'ROOM') setSelectedEntityId(rooms[0]?.id || '');
                else if (val === 'DEPARTMENT') setSelectedEntityId(departments[0]?.id || '');
                else if (val === 'PROGRAMME') setSelectedEntityId(programmes[0]?.id || '');
                else setSelectedEntityId('');
              }}
              className="text-xs font-medium px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">University Master Grid</option>
              <option value="GROUP">Student Cohort View</option>
              <option value="LECTURER">Lecturer Schedule</option>
              <option value="ROOM">Classroom / Lab View</option>
              <option value="DEPARTMENT">Departmental Schedule</option>
              <option value="PROGRAMME">Academic Programme</option>
            </select>

            {/* Entity sub-selector */}
            {filterType === 'GROUP' && (
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="text-xs font-medium px-2.5 py-1.5 bg-indigo-50/50 text-indigo-900 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden max-w-[200px]"
              >
                {studentGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.studentCount} students)
                  </option>
                ))}
              </select>
            )}

            {filterType === 'LECTURER' && (
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="text-xs font-medium px-2.5 py-1.5 bg-indigo-50/50 text-indigo-900 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden max-w-[200px]"
              >
                {lecturers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.staffId})
                  </option>
                ))}
              </select>
            )}

            {filterType === 'ROOM' && (
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="text-xs font-medium px-2.5 py-1.5 bg-indigo-50/50 text-indigo-900 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden max-w-[200px]"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} ({r.capacity} seats · {r.roomType})
                  </option>
                ))}
              </select>
            )}

            {filterType === 'DEPARTMENT' && (
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="text-xs font-medium px-2.5 py-1.5 bg-indigo-50/50 text-indigo-900 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden max-w-[200px]"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}

            {filterType === 'PROGRAMME' && (
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="text-xs font-medium px-2.5 py-1.5 bg-indigo-50/50 text-indigo-900 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden max-w-[200px]"
              >
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            {/* Day Toggle */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedDay('ALL')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  selectedDay === 'ALL'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Full Week
              </button>
              {DAYS_OF_WEEK.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDay(d)}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                    selectedDay === d
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Search & Export Actions */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search course, room, staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden w-48 md:w-56"
              />
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Excel (XLSX)</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Info Sub-bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Showing <span className="font-bold text-slate-700">{filteredEntries.length}</span> scheduled sessions
            {filterType !== 'ALL' && selectedEntityId && (
              <span className="ml-1 text-indigo-600 font-medium">
                (Filtered by {filterType.toLowerCase()})
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              <span>Lecture</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Computer Lab</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
              <span>Science Lab</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-400">
              <Lock className="w-3 h-3 text-amber-500 inline-block" />
              <span>Pinned/Locked</span>
            </span>
          </div>
        </div>
      </div>

      {/* Official Print Header (Only visible on paper / PDF export) */}
      <div className="hidden print-only mb-6 text-center border-b-2 border-slate-800 pb-4">
        <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">
          CHALIMBANA UNIVERSITY (CHAU)
        </h1>
        <h2 className="text-sm font-semibold text-slate-700">
          DIRECTORATE OF ACADEMIC AFFAIRS · OFFICIAL TIMETABLE SCHEDULE
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Academic Year: 2026/2027 · Semester 1 · Version: {currentTimetable?.name || 'Approved Master'}
        </p>
        <p className="text-[11px] text-slate-500 italic mt-0.5">
          Generated on {new Date().toLocaleDateString()} | Verified Against All University Scheduling Constraints
        </p>
      </div>

      {/* Timetable Grid Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden timetable-print-container">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse text-left min-w-[1100px]">
            {/* Header: Time Slots */}
            <thead>
              <tr className="bg-slate-900 text-white divide-x divide-slate-800 text-xs">
                <th className="py-3 px-3 font-bold w-28 uppercase tracking-wider text-slate-300 sticky left-0 bg-slate-900 z-10">
                  Day / Period
                </th>
                {TIME_SLOTS.map((slot) => (
                  <th
                    key={slot.slotIndex}
                    className={`py-2 px-2 text-center font-semibold ${
                      slot.isLunchBreak ? 'bg-slate-800 text-amber-300' : ''
                    }`}
                  >
                    <div className="text-[11px] font-bold">{slot.timeLabel}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {slot.isLunchBreak ? 'Lunch Break' : `Slot ${slot.slotIndex + 1}`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body: Days x Slots */}
            <tbody className="divide-y divide-slate-200 text-xs">
              {displayedDays.map((day) => {
                return (
                  <tr key={day} className="divide-x divide-slate-200 hover:bg-slate-50/50">
                    {/* Day Column Header */}
                    <td className="py-3 px-3 font-bold text-slate-800 bg-slate-100/80 sticky left-0 z-10 flex flex-col justify-center">
                      <span className="text-sm font-bold text-slate-900">{day}</span>
                      <span className="text-[10px] text-slate-500 font-medium">08:00 - 17:00</span>
                    </td>

                    {/* Time Slot Columns */}
                    {TIME_SLOTS.map((slot) => {
                      // Find sessions that start in this slot on this day
                      const startingSessions = filteredEntries.filter(
                        (e) => e.day === day && e.startSlotIndex === slot.slotIndex
                      );

                      const isLunch = slot.slotIndex === LUNCH_SLOT_INDEX;

                      return (
                        <td
                          key={slot.slotIndex}
                          className={`p-1.5 align-top min-w-[125px] h-28 relative ${
                            isLunch ? 'bg-slate-50/80' : 'bg-white'
                          }`}
                        >
                          {isLunch && startingSessions.length === 0 && (
                            <div className="h-full flex items-center justify-center text-[10px] font-semibold text-slate-400 italic">
                              Lunch Hour
                            </div>
                          )}

                          <div className="space-y-1.5 h-full">
                            {startingSessions.map((session) => {
                              const course = courseMap.get(session.courseId);
                              const lecturer = lecturerMap.get(session.lecturerId);
                              const room = roomMap.get(session.roomId);
                              const group = groupMap.get(session.studentGroupId);
                              const colorStyle = getCourseColor(course?.code || session.courseId);

                              return (
                                <div
                                  key={session.id}
                                  onClick={() => currentUser.role === 'ADMIN' && setActiveSessionForModal(session)}
                                  className={`rounded-lg p-2 shadow-xs border transition-all cursor-pointer hover:shadow-md relative group ${colorStyle} ${
                                    session.isLocked ? 'ring-1 ring-amber-400' : ''
                                  }`}
                                  title={`${course?.title} - Click to relocate or inspect`}
                                >
                                  {/* Header: Code & Pin */}
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-xs tracking-tight">
                                      {course?.code}
                                    </span>
                                    <div className="flex items-center space-x-1">
                                      {session.isLocked && (
                                        <Lock className="w-3 h-3 text-amber-600" />
                                      )}
                                      <span
                                        className={`text-[9px] font-bold px-1 py-0.5 rounded uppercase ${
                                          session.sessionType === 'LAB'
                                            ? 'bg-emerald-200/70 text-emerald-900'
                                            : 'bg-blue-200/70 text-blue-900'
                                        }`}
                                      >
                                        {session.sessionType === 'LAB' ? 'Lab' : 'Lec'} {session.durationSlots}h
                                      </span>
                                    </div>
                                  </div>

                                  {/* Title preview */}
                                  <div className="text-[10px] font-semibold line-clamp-1 text-slate-800">
                                    {course?.title}
                                  </div>

                                  {/* Room & Building */}
                                  <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-700 mt-1">
                                    <DoorOpen className="w-3 h-3 text-slate-500 shrink-0" />
                                    <span className="truncate">{room?.code}</span>
                                    <span className="text-[9px] font-normal text-slate-500">
                                      ({room?.capacity}s)
                                    </span>
                                  </div>

                                  {/* Lecturer */}
                                  <div className="flex items-center space-x-1 text-[10px] text-slate-600 mt-0.5">
                                    <UserIcon className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate">{lecturer?.name.replace('Dr. ', '').replace('Prof. ', '').replace('Mr. ', '').replace('Mrs. ', '')}</span>
                                  </div>

                                  {/* Student Cohort */}
                                  <div className="flex items-center space-x-1 text-[9px] text-slate-500 mt-0.5">
                                    <Users className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate">{group?.code || group?.name}</span>
                                  </div>

                                  {/* Hover Hint */}
                                  {currentUser.role === 'ADMIN' && (
                                    <div className="hidden group-hover:block text-[9px] text-indigo-700 font-semibold mt-1 pt-1 border-t border-slate-200/60 no-print">
                                      Click to relocate
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Sign-off Box for Print/PDF */}
      <div className="hidden print-only mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-slate-300 text-xs">
        <div>
          <p className="font-bold text-slate-900">Prepared by:</p>
          <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
          <p className="font-semibold text-slate-800">Mrs. Ruth Kalumba</p>
          <p className="text-slate-500">Academic Registrar & Timetable Coordinator</p>
        </div>

        <div>
          <p className="font-bold text-slate-900">Reviewed by:</p>
          <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
          <p className="font-semibold text-slate-800">Prof. Donald Zulu</p>
          <p className="text-slate-500">Dean, School of Science, Tech & Engineering</p>
        </div>

        <div>
          <p className="font-bold text-slate-900">Approved by Senate:</p>
          <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
          <p className="font-semibold text-slate-800">Vice Chancellor / Senate Secretariat</p>
          <p className="text-slate-500">Chalimbana University</p>
        </div>
      </div>

      {/* Manual Relocation Modal */}
      {activeSessionForModal && (
        <ManualMoveModal
          entry={activeSessionForModal}
          onClose={() => setActiveSessionForModal(null)}
        />
      )}
    </div>
  );
};
