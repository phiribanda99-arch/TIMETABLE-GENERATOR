import test from 'node:test';
import assert from 'node:assert/strict';
import { generateOptimizedTimetable, buildSessionsFromCourses, analyzeFeasibility } from './scheduler';
import { validateTimetable } from './validator';
import {
  SEED_COURSES,
  SEED_LECTURERS,
  SEED_ROOMS,
  SEED_STUDENT_GROUPS
} from '../data/seedData';
import { Course, Classroom } from '../types';

test('buildSessionsFromCourses decomposes course hours into atomic lecture and lab sessions', () => {
  const sessions = buildSessionsFromCourses(SEED_COURSES.slice(0, 3));
  assert.ok(sessions.length > 0, 'Sessions should be created');
  const labSessions = sessions.filter((s) => s.sessionType === 'LAB');
  assert.ok(labSessions.length > 0, 'Should create lab sessions for courses with lab hours');
  assert.equal(labSessions[0].durationSlots >= 1, true, 'Lab duration is at least 1-2 hours');
});

test('Independent validator detects lecturer double-booking accurately', () => {
  const entries = [
    {
      id: 'e1',
      sessionId: 's1',
      courseId: 'crs-cs201',
      lecturerId: 'lec-mutale',
      studentGroupId: 'grp-cs2',
      roomId: 'rm-slh1',
      day: 'Monday' as const,
      startSlotIndex: 1,
      durationSlots: 1,
      isLocked: false,
      sessionType: 'LECTURE' as const,
    },
    {
      id: 'e2',
      sessionId: 's2',
      courseId: 'crs-cs301',
      lecturerId: 'lec-mutale', // Same lecturer at same day and slot!
      studentGroupId: 'grp-cs3',
      roomId: 'rm-slh2',
      day: 'Monday' as const,
      startSlotIndex: 1,
      durationSlots: 1,
      isLocked: false,
      sessionType: 'LECTURE' as const,
    },
  ];

  const validation = validateTimetable(
    entries,
    SEED_COURSES,
    SEED_LECTURERS,
    SEED_ROOMS,
    SEED_STUDENT_GROUPS
  );

  assert.equal(validation.isValid, false, 'Validation should fail when lecturer is double booked');
  assert.ok(validation.hardConflictsCount >= 1, 'Should have at least 1 hard conflict');
  const clashDiag = validation.diagnostics.find((d) => d.ruleCode === 'LECTURER_CLASH');
  assert.ok(clashDiag !== undefined, 'Should have LECTURER_CLASH diagnostic');
});

test('Independent validator detects classroom double-booking accurately', () => {
  const entries = [
    {
      id: 'e1',
      sessionId: 's1',
      courseId: 'crs-cs201',
      lecturerId: 'lec-mutale',
      studentGroupId: 'grp-cs2',
      roomId: 'rm-slh1', // Same room!
      day: 'Tuesday' as const,
      startSlotIndex: 2,
      durationSlots: 1,
      isLocked: false,
      sessionType: 'LECTURE' as const,
    },
    {
      id: 'e2',
      sessionId: 's2',
      courseId: 'crs-cs101',
      lecturerId: 'lec-banda',
      studentGroupId: 'grp-cs1',
      roomId: 'rm-slh1', // Same room!
      day: 'Tuesday' as const,
      startSlotIndex: 2,
      durationSlots: 1,
      isLocked: false,
      sessionType: 'LECTURE' as const,
    },
  ];

  const validation = validateTimetable(
    entries,
    SEED_COURSES,
    SEED_LECTURERS,
    SEED_ROOMS,
    SEED_STUDENT_GROUPS
  );

  assert.equal(validation.isValid, false, 'Validation should fail on room clash');
  const clashDiag = validation.diagnostics.find((d) => d.ruleCode === 'ROOM_CLASH');
  assert.ok(clashDiag !== undefined, 'Should produce ROOM_CLASH diagnostic');
});

test('Feasibility analyzer detects impossible room capacity or requirements', () => {
  const impossibleCourse: Course = {
    id: 'crs-impossible',
    code: 'IMP999',
    title: 'Super Giant Course',
    departmentId: 'dept-cs',
    programmeId: 'prog-bsc-cs',
    level: 4,
    semester: 1,
    studentGroupId: 'grp-cs1',
    primaryLecturerId: 'lec-banda',
    enrolledStudents: 500, // No room has 500 seats!
    lectureHoursWeekly: 3,
    labHoursWeekly: 0,
    sessionDurationHours: 1,
    requiredRoomType: 'LECTURE_HALL',
    priority: 'HIGH',
    credits: 3,
  };

  const sessions = buildSessionsFromCourses([impossibleCourse]);
  const analysis = analyzeFeasibility(
    sessions,
    [impossibleCourse],
    SEED_LECTURERS,
    SEED_ROOMS,
    SEED_STUDENT_GROUPS
  );

  assert.equal(analysis.isFeasible, false, 'Should flag impossible capacity requirement');
  assert.ok(analysis.diagnostics.length > 0, 'Should output diagnostic for insufficient capacity');
});

test('Solver respects lecturer unavailable slots strictly', () => {
  // Dr. Mutale is unavailable Monday slots 0 and 1
  const courses = SEED_COURSES.filter((c) => c.primaryLecturerId === 'lec-mutale');
  const result = generateOptimizedTimetable(
    courses,
    SEED_LECTURERS,
    SEED_ROOMS,
    SEED_STUDENT_GROUPS,
    []
  );

  const mutaleEntries = result.entries.filter((e) => e.lecturerId === 'lec-mutale');
  for (const entry of mutaleEntries) {
    for (let s = 0; s < entry.durationSlots; s++) {
      const slotKey = `${entry.day}-${entry.startSlotIndex + s}`;
      assert.notEqual(slotKey, 'Monday-0', 'Must not schedule Mutale on Monday slot 0');
      assert.notEqual(slotKey, 'Monday-1', 'Must not schedule Mutale on Monday slot 1');
    }
  }
});

test('Solver preserves fixed/locked sessions at designated position', () => {
  const fixedEntry = {
    id: 'fixed-1',
    sessionId: 'sess-crs-cs201-lec-1',
    courseId: 'crs-cs201',
    lecturerId: 'lec-mutale',
    studentGroupId: 'grp-cs2',
    roomId: 'rm-mlt',
    day: 'Wednesday' as const,
    startSlotIndex: 3,
    durationSlots: 1,
    isLocked: true,
    sessionType: 'LECTURE' as const,
  };

  const courses = [SEED_COURSES.find((c) => c.id === 'crs-cs201')!];
  const result = generateOptimizedTimetable(
    courses,
    SEED_LECTURERS,
    SEED_ROOMS,
    SEED_STUDENT_GROUPS,
    [fixedEntry]
  );

  const scheduled = result.entries.find((e) => e.sessionId === 'sess-crs-cs201-lec-1');
  assert.ok(scheduled, 'Fixed session must be present');
  assert.equal(scheduled.day, 'Wednesday');
  assert.equal(scheduled.startSlotIndex, 3);
  assert.equal(scheduled.roomId, 'rm-mlt');
  assert.equal(scheduled.isLocked, true);
});
