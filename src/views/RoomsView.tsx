import React, { useState, useId } from 'react';
import { useApp } from '../context/AppContext';
import { Classroom, RoomType } from '../types';
import { ROOM_TYPE_BADGES, ROOM_TYPE_LABELS } from '../data/constants';
import { Plus, Search, Edit2, Trash2, X, DoorOpen, CheckCircle2, XCircle } from 'lucide-react';

export const RoomsView: React.FC = () => {
  const { rooms, addClassroom, updateClassroom, deleteClassroom, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [editingRoom, setEditingRoom] = useState<Classroom | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form IDs for accessibility
  const roomCodeField = useId();
  const roomNameField = useId();
  const roomBuildingField = useId();
  const roomFloorField = useId();
  const roomCapacityField = useId();
  const roomTypeField = useId();
  const roomEquipmentField = useId();

  const [formData, setFormData] = useState<Partial<Classroom>>({
    code: '',
    name: '',
    building: 'Central Complex',
    floor: 1,
    capacity: 70,
    roomType: 'LECTURE_HALL',
    equipment: ['Projector', 'Whiteboard'],
    isAvailable: true,
  });

  const [equipmentInput, setEquipmentInput] = useState('');

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      code: '',
      name: '',
      building: 'Science & Tech Wing',
      floor: 1,
      capacity: 75,
      roomType: 'LECTURE_HALL',
      equipment: ['Projector', 'Whiteboard'],
      isAvailable: true,
    });
    setEquipmentInput('Projector, Whiteboard');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Classroom) => {
    setEditingRoom(room);
    setFormData({ ...room });
    setEquipmentInput(room.equipment.join(', '));
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      alert('Please fill out Room Code and Name.');
      return;
    }

    const equipmentList = equipmentInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingRoom) {
      updateClassroom({
        ...(formData as Classroom),
        id: editingRoom.id,
        equipment: equipmentList,
      });
    } else {
      addClassroom({
        ...(formData as Classroom),
        id: `rm-${Date.now()}`,
        equipment: equipmentList,
      });
    }
    setIsModalOpen(false);
  };

  const filtered = rooms.filter((r) => {
    const matchesSearch =
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.building.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'ALL' || r.roomType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Classrooms & Specialized Laboratories</h2>
          <p className="text-xs text-slate-500">
            Define seating capacities, equipment specifications, computer lab stations, and availability
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Classroom / Lab</span>
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
              placeholder="Search room code, building..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden w-60"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Room Types</option>
            <option value="LECTURE_HALL">Lecture Halls</option>
            <option value="COMPUTER_LAB">Computer Labs</option>
            <option value="SCIENCE_LAB">Science Labs</option>
            <option value="SEMINAR_ROOM">Seminar Rooms</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filtered.length}</span> rooms & labs
        </span>
      </div>

      {/* Grid Cards of Classrooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((room) => {
          const badge = ROOM_TYPE_BADGES[room.roomType] || {
            label: room.roomType,
            color: 'bg-slate-100 text-slate-800 border-slate-200',
          };

          return (
            <div
              key={room.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-base font-bold text-slate-900 tracking-tight">
                      {room.code}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-700">{room.name}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="mt-3 flex items-center space-x-4 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Capacity
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{room.capacity}</span> Seats
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Building
                    </span>
                    <span className="font-medium text-slate-800">{room.building}</span> (Fl {room.floor})
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Status
                    </span>
                    <span
                      className={`font-semibold ${
                        room.isAvailable ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {room.isAvailable ? 'Operational' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                {/* Equipment Tags */}
                <div className="mt-3">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    Equipped Resources
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {room.equipment.map((eq) => (
                      <span
                        key={eq}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {currentUser.role === 'ADMIN' && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      updateClassroom({ ...room, isAvailable: !room.isAvailable })
                    }
                    className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 cursor-pointer"
                  >
                    Toggle: {room.isAvailable ? 'Disable Room' : 'Enable Room'}
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(room)}
                      className="p-1 text-slate-500 hover:text-indigo-600 rounded cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete room ${room.code}?`)) {
                          deleteClassroom(room.id);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-rose-600 rounded cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold tracking-tight">
                {editingRoom ? 'Edit Venue Specification' : 'Add New Classroom / Lab'}
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
                  <label htmlFor={roomCodeField} className="block font-semibold text-slate-700 mb-1">Room Code *</label>
                  <input
                    id={roomCodeField}
                    type="text"
                    required
                    placeholder="e.g. SLH-101"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor={roomNameField} className="block font-semibold text-slate-700 mb-1">Room Name *</label>
                  <input
                    id={roomNameField}
                    type="text"
                    required
                    placeholder="e.g. Science Lecture Hall"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={roomBuildingField} className="block font-semibold text-slate-700 mb-1">Building</label>
                  <input
                    id={roomBuildingField}
                    type="text"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor={roomFloorField} className="block font-semibold text-slate-700 mb-1">Floor Number</label>
                  <input
                    id={roomFloorField}
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={roomCapacityField} className="block font-semibold text-slate-700 mb-1">Seating Capacity *</label>
                  <input
                    id={roomCapacityField}
                    type="number"
                    min="10"
                    max="500"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 50 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor={roomTypeField} className="block font-semibold text-slate-700 mb-1">Room Type</label>
                  <select
                    id={roomTypeField}
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value as RoomType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="COMPUTER_LAB">Computer Lab</option>
                    <option value="SCIENCE_LAB">Science Lab</option>
                    <option value="SEMINAR_ROOM">Seminar Room</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor={roomEquipmentField} className="block font-semibold text-slate-700 mb-1">
                  Equipment (comma-separated)
                </label>
                <input
                  id={roomEquipmentField}
                  type="text"
                  placeholder="e.g. 50 PCs, Gigabit LAN, Projector, UPS"
                  value={equipmentInput}
                  onChange={(e) => setEquipmentInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
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
                  Save Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
