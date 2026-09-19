import React from 'react';
import { ActivePortal, Student } from '../../types';
import {
  GraduationCap,
  Shield,
  User,
  RotateCcw,
  ChevronDown,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  currentPortal: ActivePortal;
  onSelectPortal: (portal: ActivePortal) => void;
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPortal,
  onSelectPortal,
  students,
  selectedStudentId,
  onSelectStudent,
  onResetData,
}) => {
  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner indicating current role view */}
      {currentPortal !== 'landing' && (
        <div
          id="portal-context-banner"
          className={`px-4 py-1.5 text-xs flex items-center justify-between border-b ${
            currentPortal === 'advisor'
              ? 'bg-indigo-900 text-indigo-100 border-indigo-950'
              : 'bg-teal-900 text-teal-100 border-teal-950'
          }`}
        >
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2 font-medium">
              {currentPortal === 'advisor' ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    Advisor Portal Active &bull; <strong className="text-white">Dr. Tran Bao Ngoc</strong> (Lead US Advisor) &bull; Private meeting notes & internal assessments enabled
                  </span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-teal-300" />
                  <span>
                    Student Portal Active &bull; Viewing as <strong className="text-white">{currentStudent?.basic.name}</strong> ({currentStudent?.basic.grade}) &bull; Private advisor notes strictly hidden
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-slate-300 text-[11px]">Simulated Local Storage Connected</span>
              <button
                id="btn-quick-switch-portal"
                onClick={() => onSelectPortal(currentPortal === 'advisor' ? 'student' : 'advisor')}
                className="px-2.5 py-0.5 rounded bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors flex items-center gap-1.5 border border-white/20"
                title="Toggle between Advisor view and Student self-service view"
              >
                <span>Switch to {currentPortal === 'advisor' ? 'Student Portal' : 'Advisor Portal'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <button
            id="brand-logo-btn"
            onClick={() => onSelectPortal('landing')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-lg leading-tight flex items-center gap-1.5">
                <span>VietAdvising</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  US Prep
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Vietnam to US Undergraduate Advising</p>
            </div>
          </button>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          {/* Active Student Selector (visible when in student or advisor workspace) */}
          {currentPortal !== 'landing' && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <span className="text-xs text-slate-500 font-medium hidden md:inline">Current Student:</span>
              <div className="relative">
                <select
                  id="header-student-select"
                  value={selectedStudentId}
                  onChange={(e) => onSelectStudent(e.target.value)}
                  aria-label="Select active student"
                  className="bg-transparent text-xs font-semibold text-slate-800 pr-6 pl-1 py-0.5 focus:outline-none cursor-pointer"
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.basic.name} ({student.basic.grade}, {student.basic.school.split('-')[0].trim()})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1.5 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Portal Switcher Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              id="nav-advisor-portal-btn"
              onClick={() => onSelectPortal('advisor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentPortal === 'advisor'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Advisor Portal</span>
            </button>
            <button
              id="nav-student-portal-btn"
              onClick={() => onSelectPortal('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentPortal === 'student'
                  ? 'bg-white text-teal-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </button>
          </div>

          {/* Reset Demo Data Button */}
          <button
            id="btn-reset-demo-data"
            onClick={() => {
              if (window.confirm('Reset student records, meeting notes, and tasks to default demonstration data?')) {
                onResetData();
              }
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Reset sample data to initial state"
            aria-label="Reset sample data to initial state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
