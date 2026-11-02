import * as XLSX from 'xlsx';
import {
  TimetableEntry,
  Course,
  Lecturer,
  Classroom,
  StudentGroup,
  TimetableVersion
} from '../types';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../data/constants';

export function exportTimetableToExcel(
  timetable: TimetableVersion,
  courses: Course[],
  lecturers: Lecturer[],
  rooms: Classroom[],
  groups: StudentGroup[]
) {
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const lecturerMap = new Map(lecturers.map((l) => [l.id, l]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));
  const groupMap = new Map(groups.map((g) => [g.id, g]));

  const workbook = XLSX.utils.book_new();

  // 1. Master Schedule Table
  const masterRows = timetable.entries.map((entry, idx) => {
    const course = courseMap.get(entry.courseId);
    const lecturer = lecturerMap.get(entry.lecturerId);
    const room = roomMap.get(entry.roomId);
    const group = groupMap.get(entry.studentGroupId);
    const timeSlot = TIME_SLOTS[entry.startSlotIndex];
    const endSlot = TIME_SLOTS[Math.min(TIME_SLOTS.length - 1, entry.startSlotIndex + entry.durationSlots - 1)];

    return {
      'S/N': idx + 1,
      'Course Code': course?.code || entry.courseId,
      'Course Title': course?.title || 'N/A',
      'Session Type': entry.sessionType,
      'Student Cohort': group?.name || entry.studentGroupId,
      'Classroom': room?.code || entry.roomId,
      'Building': room?.building || 'N/A',
      'Lecturer': lecturer?.name || entry.lecturerId,
      'Day': entry.day,
      'Start Time': timeSlot?.startTime || 'N/A',
      'End Time': endSlot?.endTime || 'N/A',
      'Duration (Hrs)': entry.durationSlots,
      'Locked/Fixed': entry.isLocked ? 'YES' : 'NO',
    };
  });

  const masterSheet = XLSX.utils.json_to_sheet(masterRows);
  XLSX.utils.book_append_sheet(workbook, masterSheet, 'Master Timetable');

  // 2. Weekly Grid Matrix
  const gridRows: any[] = [];
  for (const day of DAYS_OF_WEEK) {
    for (const slot of TIME_SLOTS) {
      const entriesInSlot = timetable.entries.filter(
        (e) =>
          e.day === day &&
          e.startSlotIndex <= slot.slotIndex &&
          e.startSlotIndex + e.durationSlots > slot.slotIndex
      );

      const cellText = entriesInSlot
        .map((e) => {
          const c = courseMap.get(e.courseId);
          const r = roomMap.get(e.roomId);
          const l = lecturerMap.get(e.lecturerId);
          return `[${c?.code || e.courseId}] ${r?.code} (${l?.name?.split(' ')[0]})`;
        })
        .join('; ');

      gridRows.push({
        Day: day,
        'Time Slot': slot.timeLabel,
        'Active Sessions Count': entriesInSlot.length,
        'Allocations (Course - Room - Lecturer)': cellText || '— Free Slot —',
      });
    }
  }
  const gridSheet = XLSX.utils.json_to_sheet(gridRows);
  XLSX.utils.book_append_sheet(workbook, gridSheet, 'Weekly Grid Schedule');

  // 3. Lecturer Workload Sheet
  const lecturerRows = lecturers.map((lec) => {
    const lecEntries = timetable.entries.filter((e) => e.lecturerId === lec.id);
    const assignedHours = lecEntries.reduce((sum, e) => sum + e.durationSlots, 0);
    return {
      'Staff ID': lec.staffId,
      'Lecturer Name': lec.name,
      'Designation': lec.designation,
      'Max Weekly Hours': lec.maxWeeklyHours,
      'Scheduled Hours': assignedHours,
      'Utilization %': Math.round((assignedHours / (lec.maxWeeklyHours || 1)) * 100),
      'Status': assignedHours > lec.maxWeeklyHours ? 'OVERLOAD' : 'NORMAL',
    };
  });
  const lecturerSheet = XLSX.utils.json_to_sheet(lecturerRows);
  XLSX.utils.book_append_sheet(workbook, lecturerSheet, 'Lecturer Workloads');

  // 4. Room Utilization Sheet
  const roomRows = rooms.map((rm) => {
    const rmEntries = timetable.entries.filter((e) => e.roomId === rm.id);
    const bookedHours = rmEntries.reduce((sum, e) => sum + e.durationSlots, 0);
    const totalCapHours = 45; // 5 days * 9 slots
    return {
      'Room Code': rm.code,
      'Room Name': rm.name,
      'Type': rm.roomType,
      'Capacity': rm.capacity,
      'Building': rm.building,
      'Booked Hours': bookedHours,
      'Capacity (Weekly Hours)': totalCapHours,
      'Utilization %': Math.round((bookedHours / totalCapHours) * 100),
    };
  });
  const roomSheet = XLSX.utils.json_to_sheet(roomRows);
  XLSX.utils.book_append_sheet(workbook, roomSheet, 'Room Utilization');

  // Export binary
  const fileName = `CHAU_Timetable_${timetable.academicYear.replace('/', '-')}_Sem${timetable.semester}_v${timetable.id.slice(-4)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportTimetableToCSV(
  entries: TimetableEntry[],
  courses: Course[],
  lecturers: Lecturer[],
  rooms: Classroom[],
  groups: StudentGroup[],
  filename = 'timetable_export.csv'
) {
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const lecturerMap = new Map(lecturers.map((l) => [l.id, l]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));
  const groupMap = new Map(groups.map((g) => [g.id, g]));

  const headers = [
    'Course Code',
    'Course Title',
    'Session Type',
    'Cohort',
    'Lecturer',
    'Room',
    'Building',
    'Day',
    'Time Window',
    'Duration (Hours)',
  ];

  const rows = entries.map((e) => {
    const c = courseMap.get(e.courseId);
    const l = lecturerMap.get(e.lecturerId);
    const r = roomMap.get(e.roomId);
    const g = groupMap.get(e.studentGroupId);
    const start = TIME_SLOTS[e.startSlotIndex]?.startTime || '';
    const end = TIME_SLOTS[Math.min(TIME_SLOTS.length - 1, e.startSlotIndex + e.durationSlots - 1)]?.endTime || '';

    return [
      `"${c?.code || ''}"`,
      `"${c?.title || ''}"`,
      `"${e.sessionType}"`,
      `"${g?.name || ''}"`,
      `"${l?.name || ''}"`,
      `"${r?.code || ''}"`,
      `"${r?.building || ''}"`,
      `"${e.day}"`,
      `"${start} - ${end}"`,
      e.durationSlots,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
