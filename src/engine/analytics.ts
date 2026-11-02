import {
  TimetableEntry,
  Classroom,
  Lecturer,
  StudentGroup,
  Course,
  DayOfWeek
} from '../types';
import { DAYS_OF_WEEK, TOTAL_SLOTS_PER_DAY } from '../data/constants';

export interface RoomUtilizationStat {
  roomId: string;
  roomCode: string;
  building: string;
  capacity: number;
  roomType: string;
  bookedSlots: number;
  totalSlots: number;
  utilizationPercentage: number;
}

export interface LecturerWorkloadStat {
  lecturerId: string;
  name: string;
  staffId: string;
  departmentId: string;
  maxWeeklyHours: number;
  scheduledHours: number;
  utilizationPercentage: number;
  isOverloaded: boolean;
  coursesTaught: string[];
}

export interface DailyLoadStat {
  day: DayOfWeek;
  totalSessions: number;
  totalHours: number;
  peakSlot: string;
}

export function computeRoomUtilization(
  entries: TimetableEntry[],
  rooms: Classroom[]
): RoomUtilizationStat[] {
  const totalSlotsPerRoom = DAYS_OF_WEEK.length * TOTAL_SLOTS_PER_DAY; // 45 slots

  return rooms.map((room) => {
    const roomEntries = entries.filter((e) => e.roomId === room.id);
    const bookedSlots = roomEntries.reduce((sum, e) => sum + e.durationSlots, 0);
    const utilizationPercentage = Math.round((bookedSlots / (totalSlotsPerRoom || 1)) * 100);

    return {
      roomId: room.id,
      roomCode: room.code,
      building: room.building,
      capacity: room.capacity,
      roomType: room.roomType,
      bookedSlots,
      totalSlots: totalSlotsPerRoom,
      utilizationPercentage,
    };
  });
}

export function computeLecturerWorkloads(
  entries: TimetableEntry[],
  lecturers: Lecturer[],
  courses: Course[]
): LecturerWorkloadStat[] {
  const courseMap = new Map(courses.map((c) => [c.id, c.code]));

  return lecturers.map((lec) => {
    const lecEntries = entries.filter((e) => e.lecturerId === lec.id);
    const scheduledHours = lecEntries.reduce((sum, e) => sum + e.durationSlots, 0);
    const utilizationPercentage = Math.round(
      (scheduledHours / (lec.maxWeeklyHours || 1)) * 100
    );
    const uniqueCourseIds = Array.from(new Set(lecEntries.map((e) => e.courseId)));
    const coursesTaught = uniqueCourseIds.map((cid) => courseMap.get(cid) || cid);

    return {
      lecturerId: lec.id,
      name: lec.name,
      staffId: lec.staffId,
      departmentId: lec.departmentId,
      maxWeeklyHours: lec.maxWeeklyHours,
      scheduledHours,
      utilizationPercentage,
      isOverloaded: scheduledHours > lec.maxWeeklyHours,
      coursesTaught,
    };
  });
}

export function computeDailyLoadHeatmap(entries: TimetableEntry[]): DailyLoadStat[] {
  return DAYS_OF_WEEK.map((day) => {
    const dayEntries = entries.filter((e) => e.day === day);
    const totalHours = dayEntries.reduce((sum, e) => sum + e.durationSlots, 0);

    // Find peak hour
    const slotCounts = new Array(TOTAL_SLOTS_PER_DAY).fill(0);
    for (const entry of dayEntries) {
      for (let s = 0; s < entry.durationSlots; s++) {
        const slot = entry.startSlotIndex + s;
        if (slot >= 0 && slot < TOTAL_SLOTS_PER_DAY) {
          slotCounts[slot]++;
        }
      }
    }
    const maxVal = Math.max(...slotCounts, 0);
    const peakSlotIdx = slotCounts.indexOf(maxVal);
    const peakSlot = maxVal > 0 ? `Slot ${peakSlotIdx + 1} (${maxVal} concurrent)` : 'Balanced';

    return {
      day,
      totalSessions: dayEntries.length,
      totalHours,
      peakSlot,
    };
  });
}
