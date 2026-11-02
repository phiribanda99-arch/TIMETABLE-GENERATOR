export type Role = 'ADMIN' | 'HOD' | 'LECTURER' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  staffId?: string;
  studentId?: string;
  departmentId?: string;
  programmeId?: string;
  studentGroupId?: string;
  avatar?: string;
  title?: string;
}

export interface Faculty {
  id: string;
  code: string;
  name: string;
  deanName: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  facultyId: string;
  hodName: string;
}

export interface AcademicProgramme {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  durationYears: number;
}

export interface StudentGroup {
  id: string;
  name: string;
  code: string;
  programmeId: string;
  yearOfStudy: number;
  semester: number;
  studentCount: number;
}

export type RoomType = 'LECTURE_HALL' | 'COMPUTER_LAB' | 'SCIENCE_LAB' | 'SEMINAR_ROOM';

export interface Classroom {
  id: string;
  code: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  roomType: RoomType;
  equipment: string[];
  isAvailable: boolean;
  unavailableSlots?: string[]; // e.g., ["MON-08", "FRI-16"]
}

export interface Lecturer {
  id: string;
  staffId: string;
  name: string;
  email: string;
  departmentId: string;
  designation: string;
  maxWeeklyHours: number;
  assignedCourseIds: string[];
  preferredSlots?: string[]; // e.g. ["MON-09", "TUE-10"]
  unavailableSlots: string[]; // e.g. ["TUE-08", "TUE-09"]
}

export interface Course {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  programmeId: string;
  level: number; // 1, 2, 3, 4
  semester: number; // 1, 2
  studentGroupId: string;
  primaryLecturerId: string;
  secondaryLecturerId?: string;
  enrolledStudents: number;
  lectureHoursWeekly: number;
  labHoursWeekly: number;
  sessionDurationHours: number; // usually 1 or 2 hours per session
  requiredRoomType: RoomType;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  credits: number;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface TimeSlotDef {
  slotIndex: number; // 0 to 8 (e.g. 08:00 - 17:00)
  timeLabel: string; // "08:00 - 09:00"
  startTime: string; // "08:00"
  endTime: string;   // "09:00"
  isLunchBreak?: boolean; // 12:00 - 13:00
}

export interface CourseSessionToSchedule {
  id: string; // session ID
  courseId: string;
  sessionType: 'LECTURE' | 'LAB' | 'TUTORIAL';
  durationSlots: number; // number of 1-hour slots (1 or 2)
  lecturerId: string;
  studentGroupId: string;
  requiredRoomType: RoomType;
  minCapacity: number;
  isFixed?: boolean;
  fixedDay?: DayOfWeek;
  fixedSlotIndex?: number;
  fixedRoomId?: string;
}

export interface TimetableEntry {
  id: string;
  sessionId: string;
  courseId: string;
  lecturerId: string;
  studentGroupId: string;
  roomId: string;
  day: DayOfWeek;
  startSlotIndex: number;
  durationSlots: number;
  isLocked: boolean;
  sessionType: 'LECTURE' | 'LAB' | 'TUTORIAL';
}

export type TimetableStatus = 'DRAFT' | 'GENERATED' | 'PUBLISHED' | 'ARCHIVED';
export type SolverStatus = 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE' | 'FAILED' | 'UNSOLVED';

export interface TimetableStats {
  totalSessions: number;
  scheduledSessions: number;
  unscheduledSessions: number;
  hardConflictsCount: number;
  softScore: number;
  roomUtilizationPct: number;
  avgStudentGaps: number;
  maxLecturerConsecutiveHours: number;
  solverRuntimeMs: number;
  iterations: number;
}

export interface TimetableVersion {
  id: string;
  name: string;
  academicYear: string;
  semester: number;
  status: TimetableStatus;
  solverStatus: SolverStatus;
  createdAt: string;
  publishedAt?: string;
  createdBy: string;
  stats: TimetableStats;
  entries: TimetableEntry[];
  diagnostics?: SchedulingDiagnostic[];
}

export type ConflictSeverity = 'HARD_ERROR' | 'SOFT_WARNING';

export interface SchedulingDiagnostic {
  id: string;
  severity: ConflictSeverity;
  ruleCode: string;
  title: string;
  description: string;
  entityType: 'LECTURER' | 'ROOM' | 'GROUP' | 'CAPACITY' | 'TYPE' | 'AVAILABILITY';
  entityId: string;
  day?: DayOfWeek;
  slotIndex?: number;
  suggestedAction?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
}

export interface ExamDietEntry {
  id: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  day: string;
  session: 'MORNING (09:00 - 12:00)' | 'AFTERNOON (14:00 - 17:00)';
  roomCode: string;
  building: string;
  chiefInvigilator: string;
  cohort: string;
  candidateCount: number;
}
