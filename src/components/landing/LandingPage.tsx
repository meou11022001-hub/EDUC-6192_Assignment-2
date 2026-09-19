import React from 'react';
import { Student, ActivePortal } from '../../types';
import {
  GraduationCap,
  Shield,
  User,
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2,
  BookOpen,
  Calendar,
  Compass,
  FileText,
} from 'lucide-react';
import { StageBadge } from '../common/Badge';

interface LandingPageProps {
  students: Student[];
  onSelectPortal: (portal: ActivePortal) => void;
  onSelectStudentAndPortal: (studentId: string, portal: ActivePortal) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  students,
  onSelectPortal,
  onSelectStudentAndPortal,
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/60 flex flex-col justify-between">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Vietnam-to-US Undergraduate Advising Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Single Source of Truth for U.S. College Admissions
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Unifying student profiles, confidential advising diagnostics, structured meeting notes, and collaborative student self-service — with strict privacy firewalls and smart note extraction.
          </p>
        </div>

        {/* Two Entry Points: Advisor Portal & Student Portal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Advisor Portal Card */}
          <div
            id="card-entry-advisor"
            className="group relative bg-white rounded-2xl border-2 border-indigo-100 hover:border-indigo-500 shadow-sm hover:shadow-md transition-all p-7 flex flex-col justify-between"
          >
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Shield className="w-3 h-3" />
                Advisor Access
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 text-amber-300" />
              </div>

              <h2 className="text-xl font-bold text-slate-900">Advisor Portal</h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Comprehensive directory and student workspace. Conduct meetings, maintain verified profiles, record confidential assessments, and leverage <strong>Smart Note Updates</strong> to sync changes automatically without duplicate data entry.
              </p>

              <div className="mt-6 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Interactive Student Directory (List & Card Views)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Private vs. Shared Meeting Notes & Task Delegation</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Smart Note Extraction with Conflict Detection</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                id="btn-enter-advisor-portal"
                onClick={() => onSelectPortal('advisor')}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs transition-colors"
              >
                <span>Enter Advisor Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Student Portal Card */}
          <div
            id="card-entry-student"
            className="group relative bg-white rounded-2xl border-2 border-teal-100 hover:border-teal-500 shadow-sm hover:shadow-md transition-all p-7 flex flex-col justify-between"
          >
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                <User className="w-3 h-3" />
                Student Access
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                <User className="w-6 h-6 text-white" />
              </div>

              <h2 className="text-xl font-bold text-slate-900">Student Portal</h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Streamlined self-service dashboard for Vietnamese students. Review shared advisor feedback, maintain extracurricular activities, prepare for upcoming strategy meetings, and complete assigned tasks on time.
              </p>

              <div className="mt-6 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Student Profile Editor with contextual guidance & examples</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Task Tracker with completion notes & milestone tracker</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Submit questions & review shared meeting summaries</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                id="btn-enter-student-portal"
                onClick={() => onSelectPortal('student')}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-xs transition-colors"
              >
                <span>Enter Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Student Switcher for direct testing */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Select Student to Open Directly</h3>
              <p className="text-xs text-slate-500">
                Explore how the exact same student record is presented differently in the Advisor Portal vs. Student Portal
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full w-fit">
              {students.length} Active Records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                id={`landing-student-card-${student.id}`}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={student.basic.photoUrl}
                      alt={student.basic.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{student.basic.name}</h4>
                      <p className="text-xs text-slate-500">{student.basic.grade} &bull; Class of {student.basic.graduationYear}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 font-medium mb-1.5" title={student.basic.school}>
                    {student.basic.school}
                  </p>

                  <div className="mb-3">
                    <StageBadge stage={student.advisingStage} />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/70 grid grid-cols-2 gap-2">
                  <button
                    id={`btn-open-advisor-${student.id}`}
                    onClick={() => onSelectStudentAndPortal(student.id, 'advisor')}
                    className="px-2 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-colors text-center"
                    title={`Open ${student.basic.name} in Advisor Workspace`}
                  >
                    As Advisor
                  </button>
                  <button
                    id={`btn-open-student-${student.id}`}
                    onClick={() => onSelectStudentAndPortal(student.id, 'student')}
                    className="px-2 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium transition-colors text-center"
                    title={`Open ${student.basic.name} in Student Portal`}
                  >
                    As Student
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">Smart Note Extraction</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Meeting notes automatically detect updated SAT scores, budgets, and intended majors. Review changes in a suggested panel with conflict protection.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">Advisor Privacy Guarantee</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Confidential parent financial discussions, internal applicant assessments, and private notes are strictly filtered from the student interface.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">Vietnam-to-US Focus</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Tailored for Vietnamese curriculum (10-point scale / specialized classes), IELTS/SAT dual benchmarks, CSS Profile aid, and US college lists.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <p>VietAdvising Platform &bull; Designed for Education Advisors and Vietnamese High School Students applying to US Universities</p>
      </footer>
    </div>
  );
};
