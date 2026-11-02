import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GraduationCap, Calendar, Clock, MapPin, User, Search, Printer, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export const ExamDietView: React.FC = () => {
  const { exams } = useApp();
  const [search, setSearch] = useState('');

  const filtered = exams.filter(
    (ex) =>
      ex.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      ex.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
      ex.chiefInvigilator.toLowerCase().includes(search.toLowerCase()) ||
      ex.roomCode.toLowerCase().includes(search.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();
    const rows = exams.map((e, idx) => ({
      'S/N': idx + 1,
      'Course Code': e.courseCode,
      'Course Title': e.courseTitle,
      'Examination Date': e.date,
      'Day': e.day,
      'Session Time': e.session,
      'Examination Hall': e.roomCode,
      'Building': e.building,
      'Chief Invigilator': e.chiefInvigilator,
      'Student Cohort': e.cohort,
      'Candidates': e.candidateCount,
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Exam Diet 2026-2027');
    XLSX.writeFile(workbook, 'CHAU_Examination_Diet_2026_2027_Sem1.xlsx');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            End of Semester Examination Timetable Diet
          </h2>
          <p className="text-xs text-slate-500">
            Official examination venue allocations, session times, candidate counts, and invigilator rosters
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Diet</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 no-print">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search course code, title, room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden w-64"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filtered.length}</span> scheduled papers
        </span>
      </div>

      {/* Official Print Header */}
      <div className="hidden print-only mb-6 text-center border-b-2 border-slate-800 pb-4">
        <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">
          CHALIMBANA UNIVERSITY (CHAU)
        </h1>
        <h2 className="text-sm font-semibold text-slate-700">
          EXAMINATIONS COUNCIL · 2026/2027 SEMESTER 1 EXAMINATION TIMETABLE DIET
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Candidates must report to designated examination venues 30 minutes prior to session start
        </p>
      </div>

      {/* Exam Papers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Date & Day</th>
                <th className="py-3 px-4">Session Window</th>
                <th className="py-3 px-4">Course Paper</th>
                <th className="py-3 px-4">Cohort & Candidates</th>
                <th className="py-3 px-4">Examination Venue</th>
                <th className="py-3 px-4">Chief Invigilator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((paper) => (
                <tr key={paper.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    <span className="block font-bold">{paper.date}</span>
                    <span className="text-[11px] text-slate-500">{paper.day}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        paper.session.includes('MORNING')
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {paper.session}
                    </span>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <span className="font-bold text-indigo-700 block">{paper.courseCode}</span>
                    <span className="text-slate-800 font-semibold">{paper.courseTitle}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 block">{paper.cohort}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {paper.candidateCount} Seated
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{paper.roomCode}</span>
                    <span className="text-[11px] text-slate-500">{paper.building}</span>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-700">
                    {paper.chiefInvigilator}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
