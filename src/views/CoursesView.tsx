import React, { useState, useId } from 'react';
import { useApp } from '../context/AppContext';
import { Course, RoomType } from '../types';
import { ROOM_TYPE_LABELS } from '../data/constants';
import { Plus, Search, Edit2, Trash2, X, BookOpen, AlertCircle } from 'lucide-react';

export const CoursesView: React.FC = () => {
  const {
    courses,
    departments,
    programmes,
    studentGroups,
    lecturers,
    addCourse,
    updateCourse,
    deleteCourse,
    currentUser
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form IDs for accessibility
  const formCodeId = useId();
  const formTitleId = useId();
  const formDeptId = useId();
  const formProgId = useId();
  const formGroupId = useId();
  const formLecturerId = useId();
  const formLectureHoursId = useId();
  const formLabHoursId = useId();
  const formDurationId = useId();
  const formRoomTypeId = useId();
  const formPriorityId = useId();
  const formCreditsId = useId();

  // Modal Form State
  const [formData, setFormData] = useState<Partial<Course>>({
    code: '',
    title: '',
    departmentId: departments[0]?.id || '',
    programmeId: programmes[0]?.id || '',
    level: 1,
    semester: 1,
    studentGroupId: studentGroups[0]?.id || '',
    primaryLecturerId: lecturers[0]?.id || '',
    enrolledStudents: 60,
    lectureHoursWeekly: 3,
    labHoursWeekly: 0,
    sessionDurationHours: 1,
    requiredRoomType: 'LECTURE_HALL',
    priority: 'HIGH',
    credits: 3,
  });

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      code: '',
      title: '',
      departmentId: departments[0]?.id || '',
      programmeId: programmes[0]?.id || '',
      level: 1,
      semester: 1,
      studentGroupId: studentGroups[0]?.id || '',
      primaryLecturerId: lecturers[0]?.id || '',
      enrolledStudents: 60,
      lectureHoursWeekly: 3,
      labHoursWeekly: 0,
      sessionDurationHours: 1,
      requiredRoomType: 'LECTURE_HALL',
      priority: 'HIGH',
      credits: 3,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({ ...course });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title) {
      alert('Please provide Course Code and Title.');
      return;
    }

    if (editingCourse) {
      updateCourse({ ...(formData as Course), id: editingCourse.id });
    } else {
      addCourse({
        ...(formData as Course),
        id: `crs-${Date.now()}`,
      });
    }
    setIsModalOpen(false);
  };

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || c.departmentId === selectedDept;
    return matchesSearch && matchesDept;
  });

  const deptMap = new Map(departments.map((d) => [d.id, d.name]));
  const lecMap = new Map(lecturers.map((l) => [l.id, l.name]));
  const groupMap = new Map(studentGroups.map((g) => [g.id, g.name]));

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Academic Courses & Modules</h2>
          <p className="text-xs text-slate-500">
            Define course credit hours, lecture/lab breakdown, cohort sizes, and venue specifications
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Course</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden w-60"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {courses.length} courses
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Lecturer</th>
                <th className="py-3 px-4">Cohort</th>
                <th className="py-3 px-4 text-center">Lect / Lab Hrs</th>
                <th className="py-3 px-4">Venue Spec</th>
                <th className="py-3 px-4">Priority</th>
                {currentUser.role === 'ADMIN' && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-indigo-700">{course.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">{course.title}</td>
                  <td className="py-3 px-4 text-slate-600">{deptMap.get(course.departmentId) || '—'}</td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{lecMap.get(course.primaryLecturerId) || 'Unassigned'}</td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium">
                      {groupMap.get(course.studentGroupId) || 'All'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    <span className="text-blue-700">{course.lectureHoursWeekly}h Lec</span>
                    {course.labHoursWeekly > 0 && (
                      <span className="text-emerald-700 ml-1.5">/ {course.labHoursWeekly}h Lab</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {course.requiredRoomType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        course.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : course.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {course.priority}
                    </span>
                  </td>
                  {currentUser.role === 'ADMIN' && (
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(course)}
                        className="p-1 text-slate-500 hover:text-indigo-600 rounded cursor-pointer"
                        title="Edit course"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete course ${course.code}?`)) {
                            deleteCourse(course.id);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-600 rounded cursor-pointer"
                        title="Delete course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold tracking-tight">
                {editingCourse ? 'Edit Course Specifications' : 'Register New Course'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={formCodeId} className="block font-semibold text-slate-700 mb-1">Course Code *</label>
                  <input
                    id={formCodeId}
                    type="text"
                    required
                    placeholder="e.g. CS210"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor={formTitleId} className="block font-semibold text-slate-700 mb-1">Course Title *</label>
                  <input
                    id={formTitleId}
                    type="text"
                    required
                    placeholder="e.g. Data Structures"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={formDeptId} className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    id={formDeptId}
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor={formProgId} className="block font-semibold text-slate-700 mb-1">Programme</label>
                  <select
                    id={formProgId}
                    value={formData.programmeId}
                    onChange={(e) => setFormData({ ...formData, programmeId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {programmes.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={formGroupId} className="block font-semibold text-slate-700 mb-1">Student Cohort</label>
                  <select
                    id={formGroupId}
                    value={formData.studentGroupId}
                    onChange={(e) => {
                      const g = studentGroups.find((x) => x.id === e.target.value);
                      setFormData({
                        ...formData,
                        studentGroupId: e.target.value,
                        enrolledStudents: g?.studentCount || 60,
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {studentGroups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name} ({g.studentCount}s)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={formLecturerId} className="block font-semibold text-slate-700 mb-1">Primary Lecturer</label>
                  <select
                    id={formLecturerId}
                    value={formData.primaryLecturerId}
                    onChange={(e) => setFormData({ ...formData, primaryLecturerId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {lecturers.map((l) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.staffId})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor={formLectureHoursId} className="block font-semibold text-slate-700 mb-1">Lecture Hrs/Wk</label>
                  <input
                    id={formLectureHoursId}
                    type="number"
                    min="1"
                    max="10"
                    value={formData.lectureHoursWeekly}
                    onChange={(e) => setFormData({ ...formData, lectureHoursWeekly: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor={formLabHoursId} className="block font-semibold text-slate-700 mb-1">Lab Hrs/Wk</label>
                  <input
                    id={formLabHoursId}
                    type="number"
                    min="0"
                    max="6"
                    value={formData.labHoursWeekly}
                    onChange={(e) => setFormData({ ...formData, labHoursWeekly: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor={formDurationId} className="block font-semibold text-slate-700 mb-1">Session Duration</label>
                  <select
                    id={formDurationId}
                    value={formData.sessionDurationHours}
                    onChange={(e) => setFormData({ ...formData, sessionDurationHours: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value={1}>1-Hour Slots</option>
                    <option value={2}>2-Hour Contiguous</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor={formRoomTypeId} className="block font-semibold text-slate-700 mb-1">Required Room</label>
                  <select
                    id={formRoomTypeId}
                    value={formData.requiredRoomType}
                    onChange={(e) => setFormData({ ...formData, requiredRoomType: e.target.value as RoomType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="COMPUTER_LAB">Computer Lab</option>
                    <option value="SCIENCE_LAB">Science Lab</option>
                    <option value="SEMINAR_ROOM">Seminar Room</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={formPriorityId} className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    id={formPriorityId}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={formCreditsId} className="block font-semibold text-slate-700 mb-1">Credits</label>
                  <input
                    id={formCreditsId}
                    type="number"
                    min="1"
                    max="6"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value, 10) || 3 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
