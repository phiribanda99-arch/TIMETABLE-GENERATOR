import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Role } from '../types';
import {
  Calendar,
  Users,
  Settings,
  BarChart3,
  User as UserIcon,
  Lock,
  ArrowRight,
  Shield,
  Landmark,
  GraduationCap,
  Sparkles,
  Heart
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { availableUsers, login } = useApp();

  const [selectedRole, setSelectedRole] = useState<Role>('ADMIN');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map roles to corresponding seed users
  const adminUser = availableUsers.find((u) => u.role === 'ADMIN') || availableUsers[0];
  const hodUser = availableUsers.find((u) => u.role === 'HOD') || availableUsers[1];
  const lecturerUser = availableUsers.find((u) => u.role === 'LECTURER') || availableUsers[2];
  const studentUser = availableUsers.find((u) => u.role === 'STUDENT') || availableUsers[3];

  const handleSelectDemoRole = (role: Role) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'STUDENT') {
      setUsername('student');
      setPassword('password123');
    } else if (role === 'LECTURER') {
      setUsername('lecturer');
      setPassword('password123');
    } else if (role === 'HOD') {
      setUsername('hod');
      setPassword('password123');
    } else {
      setUsername('admin');
      setPassword('password123');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const inputLower = username.trim().toLowerCase();

    // Match appropriate user by username/email/staffId/studentId or selected demo role
    let matchedUser: User | undefined;

    if (inputLower === 'admin' || inputLower.includes('registrar') || inputLower.includes('kalumba') || inputLower === adminUser.email.toLowerCase() || inputLower === adminUser.staffId?.toLowerCase()) {
      matchedUser = adminUser;
    } else if (inputLower === 'hod' || inputLower.includes('mutale') || inputLower === hodUser.email.toLowerCase() || inputLower === hodUser.staffId?.toLowerCase()) {
      matchedUser = hodUser;
    } else if (inputLower === 'lecturer' || inputLower.includes('banda') || inputLower === lecturerUser.email.toLowerCase() || inputLower === lecturerUser.staffId?.toLowerCase()) {
      matchedUser = lecturerUser;
    } else if (inputLower === 'student' || inputLower.includes('phiri') || inputLower.includes('202408912') || inputLower === studentUser.email.toLowerCase() || inputLower === studentUser.studentId?.toLowerCase()) {
      matchedUser = studentUser;
    } else if (selectedRole === 'STUDENT') {
      matchedUser = studentUser;
    } else if (selectedRole === 'LECTURER') {
      matchedUser = lecturerUser;
    } else if (selectedRole === 'HOD') {
      matchedUser = hodUser;
    } else {
      matchedUser = adminUser;
    }

    if (!matchedUser) {
      setError('Invalid username or role. Please choose a demo account.');
      return;
    }

    login(matchedUser);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#eaf1fb] font-sans selection:bg-blue-500 selection:text-white">
      {/* ============================================================ */}
      {/* LEFT COLUMN: HERO PANEL MATCHING REFERENCE IMAGE 100%        */}
      {/* ============================================================ */}
      <div className="relative w-full lg:w-[54%] bg-[#0b1d3d] overflow-hidden shrink-0 h-72 sm:h-96 lg:h-auto lg:min-h-screen">
        <img
          src="/assets/aistudio/hero_panel.jpg"
          alt="University Intelligent Timetable Scheduling System"
          className="w-full h-full object-cover object-top select-none pointer-events-none"
        />
        {/* Screen reader content for semantic accessibility and SEO */}
        <div className="sr-only">
          <h1>University Intelligent Timetable Scheduling System</h1>
          <h2>SMARTER PLANNING | BETTER LEARNING</h2>
          <p>Welcome to the University Timetable Scheduling System</p>
          <p>
            An intelligent and efficient way to manage lecture and examination timetables, resources and academic activities.
          </p>
          <ul>
            <li>Automated Timetabling: Quick, accurate and conflict-free</li>
            <li>Manage Resources: Lecturers, rooms, students and courses</li>
            <li>Smart Scheduling: With optimization algorithms</li>
            <li>Better Academic Experience: For students, lecturers and administrators</li>
          </ul>
          <p>Plan Today &bull; Achieve Tomorrow</p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT COLUMN: LOGIN FLOATING CARD                            */}
      {/* ============================================================ */}
      <div className="w-full lg:w-[46%] flex flex-col items-center justify-center p-6 sm:p-10 lg:p-12 min-h-[600px] lg:min-h-screen">
        <div className="w-full max-w-[440px]">
          {/* Floating White Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-300/40 border border-slate-100 p-8 sm:p-10">
            {/* Round University System Badge */}
            <div className="flex justify-center">
              <img
                src="/assets/aistudio/unitime-badge_19717ed6.png"
                alt="University Intelligent Timetable Scheduling System"
                className="w-24 h-24 object-contain drop-shadow-md"
              />
            </div>

            {/* Heading */}
            <h3 className="text-base font-semibold text-slate-700 text-center mt-3 tracking-tight">
              Login to continue
            </h3>

            {/* Demo selector label */}
            <p className="text-xs text-slate-500 text-center mt-3 font-normal">
              Choose a demo account (password123)
            </p>

            {/* 4 Demo Account Quick Select Cards */}
            <div className="grid grid-cols-4 gap-2.5 mt-2.5">
              {/* Student */}
              <button
                type="button"
                onClick={() => handleSelectDemoRole('STUDENT')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === 'STUDENT'
                    ? 'bg-[#ebf3ff] border-[#2563eb] ring-2 ring-blue-500/30'
                    : 'bg-[#f0f5fc] hover:bg-[#e4effb] border-[#d6e4f7]'
                }`}
              >
                <div className="text-xl mb-1">🎓</div>
                <span className="text-xs font-bold text-[#1e40af]">Student</span>
              </button>

              {/* Lecturer */}
              <button
                type="button"
                onClick={() => handleSelectDemoRole('LECTURER')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === 'LECTURER'
                    ? 'bg-[#ebf3ff] border-[#2563eb] ring-2 ring-blue-500/30'
                    : 'bg-[#f0f5fc] hover:bg-[#e4effb] border-[#d6e4f7]'
                }`}
              >
                <div className="text-xl mb-1">👨‍🏫</div>
                <span className="text-xs font-bold text-[#1e40af]">Lecturer</span>
              </button>

              {/* HOD */}
              <button
                type="button"
                onClick={() => handleSelectDemoRole('HOD')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === 'HOD'
                    ? 'bg-[#ebf3ff] border-[#2563eb] ring-2 ring-blue-500/30'
                    : 'bg-[#f0f5fc] hover:bg-[#e4effb] border-[#d6e4f7]'
                }`}
              >
                <div className="text-xl mb-1">🏛️</div>
                <span className="text-xs font-bold text-[#1e40af]">HOD</span>
              </button>

              {/* Admin */}
              <button
                type="button"
                onClick={() => handleSelectDemoRole('ADMIN')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === 'ADMIN'
                    ? 'bg-[#ebf3ff] border-[#2563eb] ring-2 ring-blue-500/30'
                    : 'bg-[#f0f5fc] hover:bg-[#e4effb] border-[#d6e4f7]'
                }`}
              >
                <div className="text-xl mb-1">🛡️</div>
                <span className="text-xs font-bold text-[#1e40af]">Admin</span>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-3.5">
              {/* Username Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-[#2563eb]" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Username or Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#eab308]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-14 py-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center space-x-2 text-slate-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      'For demo access, please click one of the 4 demo accounts above (Student, Lecturer, HOD, Admin) and password: password123'
                    );
                  }}
                  className="text-[#2563eb] font-semibold hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#1d5bd8] hover:bg-[#184ebd] active:bg-[#133e9e] text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Login</span>
                </button>
              </div>
            </form>
          </div>

          {/* Footer under card */}
          <div className="mt-5 text-center">
            <div className="flex items-center justify-center space-x-2 text-xs font-medium text-slate-500">
              <span className="text-slate-400">&hearts;</span>
              <span>Secure</span>
              <span>&bull;</span>
              <span>Reliable</span>
              <span>&bull;</span>
              <span>University Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
