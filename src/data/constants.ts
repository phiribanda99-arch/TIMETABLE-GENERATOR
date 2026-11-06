import { DayOfWeek, TimeSlotDef } from '../types';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export const TIME_SLOTS: TimeSlotDef[] = [
  { slotIndex: 0, timeLabel: '07:00 - 08:00', startTime: '07:00', endTime: '08:00' },
  { slotIndex: 1, timeLabel: '08:00 - 09:00', startTime: '08:00', endTime: '09:00' },
  { slotIndex: 2, timeLabel: '09:00 - 10:00', startTime: '09:00', endTime: '10:00' },
  { slotIndex: 3, timeLabel: '10:00 - 11:00', startTime: '10:00', endTime: '11:00' },
  { slotIndex: 4, timeLabel: '11:00 - 12:00', startTime: '11:00', endTime: '12:00' },
  { slotIndex: 5, timeLabel: '12:00 - 13:00', startTime: '12:00', endTime: '13:00' },
  { slotIndex: 6, timeLabel: '13:00 - 14:00', startTime: '13:00', endTime: '14:00' },
  { slotIndex: 7, timeLabel: '14:00 - 15:00', startTime: '14:00', endTime: '15:00' },
  { slotIndex: 8, timeLabel: '15:00 - 16:00', startTime: '15:00', endTime: '16:00' },
  { slotIndex: 9, timeLabel: '16:00 - 17:00', startTime: '16:00', endTime: '17:00' },
  { slotIndex: 10, timeLabel: '17:00 - 18:00', startTime: '17:00', endTime: '18:00' },
];

export const TOTAL_SLOTS_PER_DAY = TIME_SLOTS.length; // 11 slots (07:00 - 18:00)

export const ROOM_TYPE_LABELS: Record<string, string> = {
  LECTURE_HALL: 'Lecture Hall / Tiered Theatre',
  COMPUTER_LAB: 'Computer Laboratory',
  SCIENCE_LAB: 'Science Laboratory',
  SEMINAR_ROOM: 'Seminar / Tutorial Room',
};

export const ROOM_TYPE_BADGES: Record<string, { label: string; color: string }> = {
  LECTURE_HALL: { label: 'Lecture Hall', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  COMPUTER_LAB: { label: 'Computer Lab', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  SCIENCE_LAB: { label: 'Science Lab', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  SEMINAR_ROOM: { label: 'Seminar Room', color: 'bg-amber-100 text-amber-800 border-amber-200' },
};

export const COURSE_COLOR_PALETTES = [
  'bg-blue-50 border-blue-400 text-blue-900 border-l-4',
  'bg-emerald-50 border-emerald-400 text-emerald-900 border-l-4',
  'bg-indigo-50 border-indigo-400 text-indigo-900 border-l-4',
  'bg-amber-50 border-amber-400 text-amber-900 border-l-4',
  'bg-purple-50 border-purple-400 text-purple-900 border-l-4',
  'bg-rose-50 border-rose-400 text-rose-900 border-l-4',
  'bg-teal-50 border-teal-400 text-teal-900 border-l-4',
  'bg-cyan-50 border-cyan-400 text-cyan-900 border-l-4',
  'bg-violet-50 border-violet-400 text-violet-900 border-l-4',
  'bg-orange-50 border-orange-400 text-orange-900 border-l-4',
];

export function getCourseColor(courseCode: string): string {
  let hash = 0;
  for (let i = 0; i < courseCode.length; i++) {
    hash = courseCode.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COURSE_COLOR_PALETTES.length;
  return COURSE_COLOR_PALETTES[index];
}
