import React, { useState, useId } from 'react';
import { useApp } from '../context/AppContext';
import { Lecturer, DayOfWeek } from '../types';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../data/constants';
import { Plus, Search, Edit2, Trash2, X, Clock, CalendarX, UserCheck } from 'lucide-react';

export const LecturersView: React.FC = () => {
  const { lecturers, departments, courses, addLecturer, updateLecturer, deleteLecturer, currentUser } =
    useApp();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form IDs for accessibility
  const staffIdField = useId();
  const nameField = useId();
  const emailField = useId();
  const deptField = useId();
  const designationField = useId();
  const maxHoursField = useId();

  const [formData, setFormData] = useState<Partial<Lecturer>>({
    staffId: '',
    name: '',
    email: '',
    departmentId: departments[0]?.id || '',
    designation: 'Lecturer',
    maxWeeklyHours: 14,
    assignedCourseIds: [],
    unavailableSlots: [],
  });

  const handleOpenAdd = () => {
    setEditingLecturer(null);
    setFormData({
      staffId: `CHAU-LEC-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      email: '',
      departmentId: departments[0]?.id || '',
      designation: 'Lecturer',
      maxWeeklyHours: 14,
      assignedCourseIds: [],
      unavailableSlots: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lec: Lecturer) => {
    setEditingLecturer(lec);
    setFormData({ ...lec });
    setIsModalOpen(true);
  };

  const toggleUnavailableSlot = (day: DayOfWeek, slotIdx: number) => {
    const key = `${day}-${slotIdx}`;
    const current = formData.unavailableSlots || [];
    const exists = current.includes(key);
    const updated = exists ? current.filter((s) => s !== key) : [...current, key];
    setFormData({ ...formData, unavailableSlots: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.staffId) {
      alert('Please fill out Name and Staff ID.');
      return;
    }

    if (editingLecturer) {
      updateLecturer({ ...(formData as Lecturer), id: editingLecturer.id });
    } else {
      addLecturer({
        ...(formData as Lecturer),
        id: `lec-${Date.now()}`,
      });
    }
    setIsModalOpen(false);
  };

  const filtered = lecturers.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.staffId.toLowerCase().includes(search.toLowerCase()) ||
      l.designation.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || l.departmentId === selectedDept;
    return matchesSearch && matchesDept;
  });

  const deptMap = new Map(departments.map((d) => [d.id, d.name]));
  const courseMap = new Map(courses.map((c) => [c.id, c.code]));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Academic Teaching Staff</h2>
          <p className="text-xs text-slate-500">
            Manage lecturer contracts, maximum teaching load, and unavailable time periods
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Lecturer</span>
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
              placeholder="Search staff ID, name..."
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
          Showing <span className="font-bold text-slate-800">{filtered.length}</span> lecturers
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Staff ID</th>
                <th className="py-3 px-4">Name & Designation</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Max Weekly Hrs</th>
                <th className="py-3 px-4">Unavailable Periods</th>
                {currentUser.role === 'ADMIN' && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((lec) => (
                <tr key={lec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{lec.staffId}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{lec.name}</span>
                    <span className="text-[11px] text-slate-500">{lec.designation}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{deptMap.get(lec.departmentId) || '—'}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{lec.email}</td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-700">
                    {lec.maxWeeklyHours} Hours
                  </td>
                  <td className="py-3 px-4">
                    {lec.unavailableSlots.length === 0 ? (
                      <span className="text-emerald-600 font-medium text-[11px]">Fully Available</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {lec.unavailableSlots.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                        {lec.unavailableSlots.length > 3 && (
                          <span className="text-[10px] text-slate-400">
                            +{lec.unavailableSlots.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  {currentUser.role === 'ADMIN' && (
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(lec)}
                        className="p-1 text-slate-500 hover:text-indigo-600 rounded cursor-pointer"
                        title="Edit lecturer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove lecturer ${lec.name}?`)) {
                            deleteLecturer(lec.id);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-600 rounded cursor-pointer"
                        title="Delete lecturer"
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold tracking-tight">
                {editingLecturer ? 'Edit Lecturer & Availability' : 'Register Lecturer'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={staffIdField} className="block font-semibold text-slate-700 mb-1">Staff Identifier *</label>
                  <input
                    id={staffIdField}
                    type="text"
                    required
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor={nameField} className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    id={nameField}
                    type="text"
                    required
                    placeholder="e.g. Dr. Peter Banda"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={emailField} className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    id={emailField}
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor={deptField} className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    id={deptField}
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={designationField} className="block font-semibold text-slate-700 mb-1">Academic Designation</label>
                  <input
                    id={designationField}
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor={maxHoursField} className="block font-semibold text-slate-700 mb-1">Max Weekly Hours</label>
                  <input
                    id={maxHoursField}
                    type="number"
                    min="4"
                    max="30"
                    value={formData.maxWeeklyHours}
                    onChange={(e) => setFormData({ ...formData, maxWeeklyHours: parseInt(e.target.value, 10) || 12 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Unavailable Periods Interactive Grid */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800">Unavailability Restrictions</span>
                  <span className="text-[10px] text-slate-500">
                    Click cells to block periods (Red = Unavailable)
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-center text-[10px]">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-1 px-1.5 text-left">Day</th>
                        {TIME_SLOTS.map((s) => (
                          <th key={s.slotIndex} className="py-1 px-1">
                            {s.startTime.slice(0, 2)}h
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {DAYS_OF_WEEK.map((day) => (
                        <tr key={day}>
                          <td className="py-1 px-1.5 text-left font-semibold text-slate-700">
                            {day.slice(0, 3)}
                          </td>
                          {TIME_SLOTS.map((slot) => {
                            const key = `${day}-${slot.slotIndex}`;
                            const isBlocked = formData.unavailableSlots?.includes(key);
                            return (
                              <td key={slot.slotIndex} className="p-0.5">
                                <button
                                  type="button"
                                  onClick={() => toggleUnavailableSlot(day, slot.slotIndex)}
                                  className={`w-6 h-6 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                                    isBlocked
                                      ? 'bg-rose-500 text-white'
                                      : 'bg-slate-50 text-slate-400 hover:bg-slate-200'
                                  }`}
                                  title={`${day} @ ${slot.timeLabel}: ${isBlocked ? 'Blocked' : 'Available'}`}
                                >
                                  {isBlocked ? 'X' : '•'}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  Save Lecturer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
