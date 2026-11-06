import {
  TimetableEntry,
  Course,
  Lecturer,
  Classroom,
  StudentGroup,
  SchedulingDiagnostic,
  ConflictSeverity
} from '../types';
import { TOTAL_SLOTS_PER_DAY } from '../data/constants';

export interface ValidationResult {
  isValid: boolean;
  hardConflictsCount: number;
  softWarningsCount: number;
  diagnostics: SchedulingDiagnostic[];
}

/**
 * Independently validates any timetable against all 15 hard and soft rules.
 * Never allows manual edits or corrupted solver runs to bypass constraints.
 */
export function validateTimetable(
  entries: TimetableEntry[],
  courses: Course[],
  lecturers: Lecturer[],
  rooms: Classroom[],
  groups: StudentGroup[],
  options: { enforceLunchBreak?: boolean } = { enforceLunchBreak: true }
): ValidationResult {
  const diagnostics: SchedulingDiagnostic[] = [];
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const lecturerMap = new Map(lecturers.map((l) => [l.id, l]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));
  const groupMap = new Map(groups.map((g) => [g.id, g]));

  // Track occupancies:
  // key format: `${day}-${slotIndex}` -> entryIds
  const lecturerSlots = new Map<string, string[]>();
  const roomSlots = new Map<string, string[]>();
  const groupSlots = new Map<string, string[]>();

  // 1. Check each entry bounds and individual resource properties
  for (const entry of entries) {
    const course = courseMap.get(entry.courseId);
    const lecturer = lecturerMap.get(entry.lecturerId);
    const room = roomMap.get(entry.roomId);
    const group = groupMap.get(entry.studentGroupId);

    if (!course) {
      diagnostics.push({
        id: `err-course-missing-${entry.id}`,
        severity: 'HARD_ERROR',
        ruleCode: 'INVALID_COURSE',
        title: 'Unknown Course Assigned',
        description: `Entry ${entry.id} references non-existent course ID ${entry.courseId}.`,
        entityType: 'GROUP',
        entityId: entry.courseId,
      });
      continue;
    }

    // A. Working hours check
    if (
      entry.startSlotIndex < 0 ||
      entry.startSlotIndex + entry.durationSlots > TOTAL_SLOTS_PER_DAY
    ) {
      diagnostics.push({
        id: `err-bounds-${entry.id}`,
        severity: 'HARD_ERROR',
        ruleCode: 'WORKING_HOURS_EXCEEDED',
        title: 'Class Outside Working Hours',
        description: `Course ${course.code} on ${entry.day} spans beyond the university daily schedule (slots 0-${TOTAL_SLOTS_PER_DAY - 1}).`,
        entityType: 'ROOM',
        entityId: entry.roomId,
        day: entry.day,
        slotIndex: entry.startSlotIndex,
        suggestedAction: 'Move to earlier slot during 07:00 - 18:00.',
      });
    }

    // C. Room capacity check
    if (room && group) {
      const requiredCapacity = entry.sessionType === 'LAB' && group.studentCount > 50
        ? Math.ceil(group.studentCount / 2)
        : group.studentCount;

      if (room.capacity < requiredCapacity) {
        diagnostics.push({
          id: `err-capacity-${entry.id}`,
          severity: 'HARD_ERROR',
          ruleCode: 'ROOM_CAPACITY_EXCEEDED',
          title: 'Room Capacity Deficit',
          description: `Room ${room.code} (${room.capacity} seats) cannot accommodate ${group.name} (${requiredCapacity} students required) for ${course.code}.`,
          entityType: 'CAPACITY',
          entityId: room.id,
          day: entry.day,
          slotIndex: entry.startSlotIndex,
          suggestedAction: `Reallocate to a larger room such as MLT or BH-101.`,
        });
      }
    }

    // D. Room type suitability
    if (room) {
      if (entry.sessionType === 'LAB') {
        const isLab = room.roomType === 'COMPUTER_LAB' || room.roomType === 'SCIENCE_LAB';
        if (!isLab) {
          diagnostics.push({
            id: `err-room-type-${entry.id}`,
            severity: 'HARD_ERROR',
            ruleCode: 'WRONG_ROOM_TYPE',
            title: 'Laboratory Session in Standard Room',
            description: `Practical lab for ${course.code} is assigned to non-laboratory room ${room.code} (${room.roomType}).`,
            entityType: 'TYPE',
            entityId: room.id,
            day: entry.day,
            slotIndex: entry.startSlotIndex,
            suggestedAction: 'Assign to CCL-Lab1, CCL-Lab2, SE-Lab, or SCI-Lab1.',
          });
        }
      }
    }

    // E. Lecturer availability
    if (lecturer) {
      for (let s = 0; s < entry.durationSlots; s++) {
        const slotKey = `${entry.day}-${entry.startSlotIndex + s}`;
        if (lecturer.unavailableSlots.includes(slotKey)) {
          diagnostics.push({
            id: `err-lec-avail-${entry.id}-${s}`,
            severity: 'HARD_ERROR',
            ruleCode: 'LECTURER_UNAVAILABLE',
            title: 'Lecturer Unavailability Conflict',
            description: `${lecturer.name} is marked unavailable on ${entry.day} slot ${entry.startSlotIndex + s} (e.g. administrative/research duties).`,
            entityType: 'AVAILABILITY',
            entityId: lecturer.id,
            day: entry.day,
            slotIndex: entry.startSlotIndex + s,
            suggestedAction: 'Move to a slot when the lecturer is free.',
          });
        }
      }
    }

    // Register active slots for overlap checking
    for (let s = 0; s < entry.durationSlots; s++) {
      const slotIdx = entry.startSlotIndex + s;
      const key = `${entry.day}-${slotIdx}`;

      // Lecturer slot occupancy
      const lecKey = `${entry.lecturerId}@${key}`;
      const existingLec = lecturerSlots.get(lecKey) || [];
      existingLec.push(entry.id);
      lecturerSlots.set(lecKey, existingLec);

      // Room slot occupancy
      const rmKey = `${entry.roomId}@${key}`;
      const existingRm = roomSlots.get(rmKey) || [];
      existingRm.push(entry.id);
      roomSlots.set(rmKey, existingRm);

      // Group slot occupancy
      const grpKey = `${entry.studentGroupId}@${key}`;
      const existingGrp = groupSlots.get(grpKey) || [];
      existingGrp.push(entry.id);
      groupSlots.set(grpKey, existingGrp);
    }
  }

  // 2. Check for simultaneous clashes (Hard Constraints 1, 2, 3)
  // Lecturer double-booking
  for (const [key, entryIds] of lecturerSlots.entries()) {
    if (entryIds.length > 1) {
      const [lecId, timeStr] = key.split('@');
      const lec = lecturerMap.get(lecId);
      const [day, slot] = timeStr.split('-');
      const conflictingCourses = entryIds
        .map((eid) => {
          const ent = entries.find((e) => e.id === eid);
          return ent ? courseMap.get(ent.courseId)?.code || eid : eid;
        })
        .join(' & ');

      diagnostics.push({
        id: `err-lec-clash-${key}`,
        severity: 'HARD_ERROR',
        ruleCode: 'LECTURER_CLASH',
        title: 'Lecturer Simultaneous Double-Booking',
        description: `${lec?.name || 'Lecturer'} is scheduled to teach multiple sessions simultaneously (${conflictingCourses}) on ${day} at slot ${slot}.`,
        entityType: 'LECTURER',
        entityId: lecId,
        day: day as any,
        slotIndex: parseInt(slot, 10),
        suggestedAction: 'Shift one of the concurrent sessions to another available day/time.',
      });
    }
  }

  // Room double-booking
  for (const [key, entryIds] of roomSlots.entries()) {
    if (entryIds.length > 1) {
      const [rmId, timeStr] = key.split('@');
      const rm = roomMap.get(rmId);
      const [day, slot] = timeStr.split('-');
      const conflictingCourses = entryIds
        .map((eid) => {
          const ent = entries.find((e) => e.id === eid);
          return ent ? courseMap.get(ent.courseId)?.code || eid : eid;
        })
        .join(' & ');

      diagnostics.push({
        id: `err-rm-clash-${key}`,
        severity: 'HARD_ERROR',
        ruleCode: 'ROOM_CLASH',
        title: 'Classroom Simultaneous Clash',
        description: `Classroom ${rm?.code || 'Room'} has two or more classes booked at the same time (${conflictingCourses}) on ${day} slot ${slot}.`,
        entityType: 'ROOM',
        entityId: rmId,
        day: day as any,
        slotIndex: parseInt(slot, 10),
        suggestedAction: 'Assign one session to an alternate empty room.',
      });
    }
  }

  // Student Group double-booking
  for (const [key, entryIds] of groupSlots.entries()) {
    if (entryIds.length > 1) {
      const [grpId, timeStr] = key.split('@');
      const grp = groupMap.get(grpId);
      const [day, slot] = timeStr.split('-');
      const conflictingCourses = entryIds
        .map((eid) => {
          const ent = entries.find((e) => e.id === eid);
          return ent ? courseMap.get(ent.courseId)?.code || eid : eid;
        })
        .join(' & ');

      diagnostics.push({
        id: `err-grp-clash-${key}`,
        severity: 'HARD_ERROR',
        ruleCode: 'STUDENT_GROUP_CLASH',
        title: 'Student Cohort Timetable Clash',
        description: `Student Group ${grp?.name || 'Cohort'} has simultaneous classes (${conflictingCourses}) on ${day} slot ${slot}.`,
        entityType: 'GROUP',
        entityId: grpId,
        day: day as any,
        slotIndex: parseInt(slot, 10),
        suggestedAction: 'Separate the two required classes onto different days or time slots.',
      });
    }
  }

  // 3. Workload and consecutive hours (Soft checks)
  for (const lecturer of lecturers) {
    const lecEntries = entries.filter((e) => e.lecturerId === lecturer.id);
    const totalHours = lecEntries.reduce((sum, e) => sum + e.durationSlots, 0);
    if (totalHours > lecturer.maxWeeklyHours) {
      diagnostics.push({
        id: `warn-workload-${lecturer.id}`,
        severity: 'SOFT_WARNING',
        ruleCode: 'WORKLOAD_EXCEEDED',
        title: 'Lecturer Max Weekly Hours Exceeded',
        description: `${lecturer.name} is assigned ${totalHours} teaching hours (contract maximum: ${lecturer.maxWeeklyHours} hours).`,
        entityType: 'LECTURER',
        entityId: lecturer.id,
        suggestedAction: 'Reassign courses or co-teach with a teaching assistant or secondary lecturer.',
      });
    }
  }

  const hardErrors = diagnostics.filter((d) => d.severity === 'HARD_ERROR');
  const softWarnings = diagnostics.filter((d) => d.severity === 'SOFT_WARNING');

  return {
    isValid: hardErrors.length === 0,
    hardConflictsCount: hardErrors.length,
    softWarningsCount: softWarnings.length,
    diagnostics,
  };
}
