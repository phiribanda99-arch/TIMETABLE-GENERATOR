import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Faculty,
  Department,
  AcademicProgramme,
  StudentGroup,
  Classroom,
  Lecturer,
  Course,
  User,
  TimetableVersion,
  TimetableEntry,
  AuditLog,
  SchedulingDiagnostic,
  ExamDietEntry
} from '../types';
import {
  SEED_FACULTIES,
  SEED_DEPARTMENTS,
  SEED_PROGRAMMES,
  SEED_STUDENT_GROUPS,
  SEED_ROOMS,
  SEED_LECTURERS,
  SEED_COURSES,
  SEED_USERS,
  SEED_EXAMS
} from '../data/seedData';
import { generateOptimizedTimetable, DEFAULT_SOLVER_CONFIG, SolverConfig } from '../engine/scheduler';
import { validateTimetable } from '../engine/validator';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;

  faculties: Faculty[];
  departments: Department[];
  programmes: AcademicProgramme[];
  studentGroups: StudentGroup[];
  rooms: Classroom[];
  lecturers: Lecturer[];
  courses: Course[];
  exams: ExamDietEntry[];

  currentTimetable: TimetableVersion | null;
  timetableVersions: TimetableVersion[];
  auditLogs: AuditLog[];
  solverConfig: SolverConfig;
  setSolverConfig: React.Dispatch<React.SetStateAction<SolverConfig>>;

  isGenerating: boolean;
  generateTimetableAction: () => Promise<boolean>;
  publishTimetableAction: () => void;
  revertToVersion: (versionId: string) => void;

  manualMoveSession: (
    entryId: string,
    targetDay: any,
    targetSlot: number,
    targetRoomId: string
  ) => { success: boolean; error?: string };

  toggleSessionLock: (entryId: string) => void;
  resetToDefaultData: () => void;
  loadInfeasibleScenario: () => void;
  addCourse: (course: Course) => void;
  addClassroom: (room: Classroom) => void;
  addLecturer: (lecturer: Lecturer) => void;
  updateCourse: (course: Course) => void;
  updateClassroom: (room: Classroom) => void;
  updateLecturer: (lecturer: Lecturer) => void;
  deleteCourse: (id: string) => void;
  deleteClassroom: (id: string) => void;
  deleteLecturer: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('chau_current_user');
    return saved ? JSON.parse(saved) : SEED_USERS[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const authSaved = localStorage.getItem('chau_authenticated');
    return authSaved === 'true';
  });

  const [faculties, setFaculties] = useState<Faculty[]>(() => {
    const s = localStorage.getItem('chau_faculties');
    return s ? JSON.parse(s) : SEED_FACULTIES;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const s = localStorage.getItem('chau_departments');
    return s ? JSON.parse(s) : SEED_DEPARTMENTS;
  });

  const [programmes, setProgrammes] = useState<AcademicProgramme[]>(() => {
    const s = localStorage.getItem('chau_programmes');
    return s ? JSON.parse(s) : SEED_PROGRAMMES;
  });

  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>(() => {
    const s = localStorage.getItem('chau_student_groups');
    return s ? JSON.parse(s) : SEED_STUDENT_GROUPS;
  });

  const [rooms, setRooms] = useState<Classroom[]>(() => {
    const s = localStorage.getItem('chau_rooms');
    return s ? JSON.parse(s) : SEED_ROOMS;
  });

  const [lecturers, setLecturers] = useState<Lecturer[]>(() => {
    const s = localStorage.getItem('chau_lecturers');
    return s ? JSON.parse(s) : SEED_LECTURERS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const s = localStorage.getItem('chau_courses');
    return s ? JSON.parse(s) : SEED_COURSES;
  });

  const [exams, setExams] = useState<ExamDietEntry[]>(() => {
    const s = localStorage.getItem('chau_exams');
    return s ? JSON.parse(s) : SEED_EXAMS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const s = localStorage.getItem('chau_audit_logs');
    return s
      ? JSON.parse(s)
      : [
          {
            id: 'log-1',
            timestamp: new Date().toLocaleString(),
            userName: 'Mrs. Ruth Kalumba',
            userRole: 'Academic Registrar',
            action: 'SYSTEM_INITIALIZED',
            details: 'Chalimbana University Intelligent Timetable Scheduling Engine initialized.',
          },
        ];
  });

  const [solverConfig, setSolverConfig] = useState<SolverConfig>(() => {
    const s = localStorage.getItem('chau_solver_config');
    return s ? JSON.parse(s) : DEFAULT_SOLVER_CONFIG;
  });

  const [timetableVersions, setTimetableVersions] = useState<TimetableVersion[]>(() => {
    const s = localStorage.getItem('chau_timetable_versions_v3');
    if (s) return JSON.parse(s);

    // Initial baseline solve on startup across 07:00 - 18:00
    const initialRun = generateOptimizedTimetable(
      SEED_COURSES.slice(0, 14),
      SEED_LECTURERS,
      SEED_ROOMS,
      SEED_STUDENT_GROUPS,
      [],
      DEFAULT_SOLVER_CONFIG
    );

    const initialVersion: TimetableVersion = {
      id: 'tt-v101',
      name: '2026/2027 Semester 1 - Master Baseline (07:00-18:00)',
      academicYear: '2026/2027',
      semester: 1,
      status: 'PUBLISHED',
      solverStatus: initialRun.status,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      createdBy: 'Mrs. Ruth Kalumba (Academic Registrar)',
      stats: initialRun.stats,
      entries: initialRun.entries,
      diagnostics: initialRun.diagnostics,
    };

    return [initialVersion];
  });

  const [currentTimetable, setCurrentTimetable] = useState<TimetableVersion | null>(() => {
    return timetableVersions.length > 0 ? timetableVersions[0] : null;
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('chau_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('chau_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('chau_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('chau_lecturers', JSON.stringify(lecturers));
  }, [lecturers]);

  useEffect(() => {
    localStorage.setItem('chau_timetable_versions_v3', JSON.stringify(timetableVersions));
  }, [timetableVersions]);

  useEffect(() => {
    localStorage.setItem('chau_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const generateTimetableAction = async (): Promise<boolean> => {
    setIsGenerating(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const lockedEntries = currentTimetable
            ? currentTimetable.entries.filter((e) => e.isLocked)
            : [];

          const solverResult = generateOptimizedTimetable(
            courses,
            lecturers,
            rooms,
            studentGroups,
            lockedEntries,
            solverConfig
          );

          const newVersion: TimetableVersion = {
            id: `tt-v${Date.now().toString().slice(-5)}`,
            name: `2026/2027 Sem 1 - Run #${timetableVersions.length + 1} (${solverResult.status})`,
            academicYear: '2026/2027',
            semester: 1,
            status: 'DRAFT',
            solverStatus: solverResult.status,
            createdAt: new Date().toISOString(),
            createdBy: currentUser.name,
            stats: solverResult.stats,
            entries: solverResult.entries,
            diagnostics: solverResult.diagnostics,
          };

          setTimetableVersions((prev) => [newVersion, ...prev]);
          setCurrentTimetable(newVersion);

          addAuditLog(
            'GENERATE_TIMETABLE',
            `Intelligent CP-SAT engine executed in ${solverResult.stats.solverRuntimeMs}ms. Status: ${solverResult.status}. Scheduled ${solverResult.stats.scheduledSessions}/${solverResult.stats.totalSessions} sessions.`
          );

          setIsGenerating(false);
          resolve(solverResult.status === 'OPTIMAL' || solverResult.status === 'FEASIBLE');
        } catch (err: any) {
          setIsGenerating(false);
          addAuditLog('GENERATION_ERROR', `Solver failure: ${err?.message || 'Unknown error'}`);
          resolve(false);
        }
      }, 500);
    });
  };

  const publishTimetableAction = () => {
    if (!currentTimetable) return;

    // Check validity before publishing
    const validation = validateTimetable(
      currentTimetable.entries,
      courses,
      lecturers,
      rooms,
      studentGroups
    );

    if (!validation.isValid) {
      alert(`Cannot publish timetable: ${validation.hardConflictsCount} hard conflict(s) detected.`);
      return;
    }

    const updated = {
      ...currentTimetable,
      status: 'PUBLISHED' as const,
      publishedAt: new Date().toISOString(),
    };

    setTimetableVersions((prev) =>
      prev.map((v) => (v.id === updated.id ? updated : { ...v, status: 'ARCHIVED' as const }))
    );
    setCurrentTimetable(updated);

    addAuditLog(
      'PUBLISH_TIMETABLE',
      `Version ${updated.name} officially approved and published to faculty and students.`
    );
  };

  const revertToVersion = (versionId: string) => {
    const target = timetableVersions.find((v) => v.id === versionId);
    if (target) {
      setCurrentTimetable(target);
      addAuditLog('SWITCH_VERSION', `Active timetable set to version ${target.name}.`);
    }
  };

  const manualMoveSession = (
    entryId: string,
    targetDay: any,
    targetSlot: number,
    targetRoomId: string
  ): { success: boolean; error?: string } => {
    if (!currentTimetable) return { success: false, error: 'No active timetable.' };

    const targetEntry = currentTimetable.entries.find((e) => e.id === entryId);
    if (!targetEntry) return { success: false, error: 'Session not found.' };

    // Create proposed candidate entries
    const proposedEntries = currentTimetable.entries.map((e) => {
      if (e.id === entryId) {
        return {
          ...e,
          day: targetDay,
          startSlotIndex: targetSlot,
          roomId: targetRoomId,
        };
      }
      return e;
    });

    // Validate proposed timetable
    const validation = validateTimetable(
      proposedEntries,
      courses,
      lecturers,
      rooms,
      studentGroups
    );

    if (!validation.isValid) {
      const errorDiag = validation.diagnostics.find((d) => d.severity === 'HARD_ERROR');
      const errorMsg = errorDiag
        ? `${errorDiag.title}: ${errorDiag.description}`
        : 'Action violates university hard scheduling constraints.';
      return { success: false, error: errorMsg };
    }

    const updated = {
      ...currentTimetable,
      entries: proposedEntries,
      diagnostics: validation.diagnostics,
      status: 'DRAFT' as const,
    };

    setCurrentTimetable(updated);
    setTimetableVersions((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));

    addAuditLog(
      'MANUAL_SESSION_MOVE',
      `Session for course ${targetEntry.courseId} relocated to ${targetDay} Slot ${targetSlot + 1} in Room ${targetRoomId}. Constraint check passed.`
    );

    return { success: true };
  };

  const toggleSessionLock = (entryId: string) => {
    if (!currentTimetable) return;
    const updatedEntries = currentTimetable.entries.map((e) => {
      if (e.id === entryId) {
        return { ...e, isLocked: !e.isLocked };
      }
      return e;
    });

    const updated = {
      ...currentTimetable,
      entries: updatedEntries,
    };
    setCurrentTimetable(updated);
    setTimetableVersions((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));

    const item = currentTimetable.entries.find((e) => e.id === entryId);
    addAuditLog(
      'LOCK_TOGGLED',
      `Session ${item?.courseId || entryId} was ${item?.isLocked ? 'unlocked' : 'locked/pinned'}.`
    );
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setCourses(SEED_COURSES);
    setRooms(SEED_ROOMS);
    setLecturers(SEED_LECTURERS);
    setFaculties(SEED_FACULTIES);
    setDepartments(SEED_DEPARTMENTS);
    setProgrammes(SEED_PROGRAMMES);
    setStudentGroups(SEED_STUDENT_GROUPS);
    setExams(SEED_EXAMS);

    const run = generateOptimizedTimetable(
      SEED_COURSES.slice(0, 14),
      SEED_LECTURERS,
      SEED_ROOMS,
      SEED_STUDENT_GROUPS,
      [],
      DEFAULT_SOLVER_CONFIG
    );

    const initialVersion: TimetableVersion = {
      id: 'tt-v101',
      name: '2026/2027 Semester 1 - Master Baseline',
      academicYear: '2026/2027',
      semester: 1,
      status: 'PUBLISHED',
      solverStatus: run.status,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      createdBy: 'Mrs. Ruth Kalumba (Academic Registrar)',
      stats: run.stats,
      entries: run.entries,
      diagnostics: run.diagnostics,
    };

    setTimetableVersions([initialVersion]);
    setCurrentTimetable(initialVersion);
    setCurrentUser(SEED_USERS[0]);
    addAuditLog('SYSTEM_RESET', 'Database restored to clean university demonstration state.');
  };

  const loadInfeasibleScenario = () => {
    // Deliberately impossible scenario: Add an impossible course requiring 600 seats when max room is 140
    const impossibleCourse: Course = {
      id: `crs-infeasible-${Date.now()}`,
      code: 'FAIL999',
      title: 'Infeasible Demonstration Lecture',
      departmentId: 'dept-cs',
      programmeId: 'prog-bsc-cs',
      level: 4,
      semester: 1,
      studentGroupId: 'grp-cs1',
      primaryLecturerId: 'lec-mutale',
      enrolledStudents: 500, // Impossibly large
      lectureHoursWeekly: 10,
      labHoursWeekly: 0,
      sessionDurationHours: 1,
      requiredRoomType: 'LECTURE_HALL',
      priority: 'HIGH',
      credits: 4,
    };

    setCourses((prev) => [impossibleCourse, ...prev]);
    addAuditLog(
      'TEST_INFEASIBLE_SCENARIO',
      'Loaded deliberately contradictory test course (500 students in 140 seat capacity hall) to test solver diagnostics.'
    );
  };

  const addCourse = (course: Course) => {
    setCourses((prev) => [course, ...prev]);
    addAuditLog('COURSE_CREATED', `Course ${course.code} - ${course.title} registered.`);
  };

  const updateCourse = (course: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === course.id ? course : c)));
    addAuditLog('COURSE_UPDATED', `Course ${course.code} updated.`);
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('COURSE_DELETED', `Course ID ${id} removed.`);
  };

  const addClassroom = (room: Classroom) => {
    setRooms((prev) => [room, ...prev]);
    addAuditLog('ROOM_CREATED', `Classroom ${room.code} (${room.capacity} seats) added.`);
  };

  const updateClassroom = (room: Classroom) => {
    setRooms((prev) => prev.map((r) => (r.id === room.id ? room : r)));
    addAuditLog('ROOM_UPDATED', `Classroom ${room.code} updated.`);
  };

  const deleteClassroom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    addAuditLog('ROOM_DELETED', `Classroom ID ${id} removed.`);
  };

  const addLecturer = (lecturer: Lecturer) => {
    setLecturers((prev) => [lecturer, ...prev]);
    addAuditLog('LECTURER_CREATED', `Lecturer ${lecturer.name} (${lecturer.staffId}) registered.`);
  };

  const updateLecturer = (lecturer: Lecturer) => {
    setLecturers((prev) => prev.map((l) => (l.id === lecturer.id ? lecturer : l)));
    addAuditLog('LECTURER_UPDATED', `Lecturer ${lecturer.name} details updated.`);
  };

  const deleteLecturer = (id: string) => {
    setLecturers((prev) => prev.filter((l) => l.id !== id));
    addAuditLog('LECTURER_DELETED', `Lecturer ID ${id} removed.`);
  };

  const login = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('chau_authenticated', 'true');
    localStorage.setItem('chau_current_user', JSON.stringify(user));
    addAuditLog('USER_LOGIN', `${user.name} logged in successfully as ${user.role}.`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('chau_authenticated', 'false');
    addAuditLog('USER_LOGOUT', `${currentUser.name} signed out.`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers: SEED_USERS,
        isAuthenticated,
        login,
        logout,
        faculties,
        departments,
        programmes,
        studentGroups,
        rooms,
        lecturers,
        courses,
        exams,
        currentTimetable,
        timetableVersions,
        auditLogs,
        solverConfig,
        setSolverConfig,
        isGenerating,
        generateTimetableAction,
        publishTimetableAction,
        revertToVersion,
        manualMoveSession,
        toggleSessionLock,
        resetToDefaultData,
        loadInfeasibleScenario,
        addCourse,
        addClassroom,
        addLecturer,
        updateCourse,
        updateClassroom,
        updateLecturer,
        deleteCourse,
        deleteClassroom,
        deleteLecturer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
