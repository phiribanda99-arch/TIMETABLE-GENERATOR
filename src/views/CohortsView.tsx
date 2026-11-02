import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, BookOpen, GraduationCap, School } from 'lucide-react';

export const CohortsView: React.FC = () => {
  const { studentGroups, programmes, courses, departments } = useApp();

  const progMap = new Map(programmes.map((p) => [p.id, p]));
  const deptMap = new Map(departments.map((d) => [d.id, d.name]));

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Student Cohorts & Year Groups</h2>
        <p className="text-xs text-slate-500">
          Academic class groups, headcounts, assigned semester modules, and degree programmes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {studentGroups.map((group) => {
          const prog = progMap.get(group.programmeId);
          const groupCourses = courses.filter((c) => c.studentGroupId === group.id);
          const totalHours = groupCourses.reduce(
            (sum, c) => sum + c.lectureHoursWeekly + c.labHoursWeekly,
            0
          );

          return (
            <div
              key={group.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{group.name}</span>
                    <span className="text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {group.code}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 block">
                      {group.studentCount}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Students
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{prog?.name || 'Programme'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <School className="w-3.5 h-3.5 text-slate-400" />
                    <span>Year {group.yearOfStudy} · Semester {group.semester}</span>
                  </div>
                </div>

                {/* Modules Registered */}
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                    <span className="font-semibold text-slate-700">Enrolled Modules ({groupCourses.length})</span>
                    <span className="font-bold text-indigo-700">{totalHours} Hrs/Week</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {groupCourses.map((c) => (
                      <span
                        key={c.id}
                        className="text-[10px] bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded"
                      >
                        {c.code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 bg-slate-50 p-2 rounded-lg">
                Conflict free scheduling strictly ensures no two compulsory cohort modules occur simultaneously.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
