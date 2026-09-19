import React from 'react';
import {
  Student,
  Task,
  Meeting,
  ChangeHistoryEntry,
  TaskStatus,
} from '../../../types';
import {
  Calendar,
  Clock,
  Compass,
  ListTodo,
  TrendingUp,
  Share2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { StageBadge, TaskStatusBadge } from '../../common/Badge';

interface StudentOverviewTabProps {
  student: Student;
  tasks: Task[];
  meetings: Meeting[];
  history: ChangeHistoryEntry[];
  onNavigateTab: (tab: 'overview' | 'profile' | 'tasks') => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
}

export const StudentOverviewTab: React.FC<StudentOverviewTabProps> = ({
  student,
  tasks,
  meetings,
  history,
  onNavigateTab,
  onUpdateTaskStatus,
}) => {
  // Student-specific tasks
  const myTasks = tasks.filter((t) => t.studentId === student.id && t.owner === 'Student');
  const activeTasks = myTasks.filter((t) => t.status !== 'Completed');

  // Next upcoming meeting (strictly shared only)
  const sharedMeetings = meetings
    .filter((m) => m.studentId === student.id && m.visibility === 'Share with Student')
    .sort((a, b) => a.date.localeCompare(b.date));
  const upcomingMeeting = sharedMeetings[0];

  // Recent shared updates: ONLY shared meetings or student-facing changes
  const recentSharedUpdates = sharedMeetings.slice(0, 3);

  // Profile completion calculation
  const profileSections = [
    { name: 'Basic Info & Contact', complete: !!student.basic.email && !!student.basic.phone, status: student.basic.status },
    { name: 'Academic Interests & Majors', complete: student.interests.possibleMajors.length > 0, status: student.interests.status },
    { name: 'GPA & Standardized Testing', complete: !!student.academics.gpa && (!!student.academics.satScore || !!student.academics.ieltsScore), status: student.academics.status },
    { name: 'Extracurricular Activities', complete: student.activities.extracurriculars.length > 0, status: student.activities.status },
    { name: 'Family & Budget Guidance', complete: student.financials.estimatedAnnualBudgetUsd > 0, status: student.financials.status },
    { name: 'College Preferences', complete: student.collegePreferences.consideredColleges.length > 0, status: student.collegePreferences.status },
  ];

  const completedCount = profileSections.filter((s) => s.complete).length;
  const completionPercentage = Math.round((completedCount / profileSections.length) * 100);

  return (
    <div className="space-y-6" id="student-overview-tab-content">
      {/* 1. STUDENT HEADER */}
      <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <img
              src={student.basic.photoUrl}
              alt={student.basic.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border-2 border-teal-300 shadow-xs shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-900">{student.basic.name}</h2>
                <span className="text-sm font-medium text-slate-500">
                  ({student.basic.preferredName})
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">
                  Student Portal
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                <span>
                  <strong>Grade:</strong> {student.basic.grade} &bull; {student.basic.school}
                </span>
                <span>
                  <strong>Expected U.S. Enrollment:</strong> Fall {student.basic.expectedUsEnrollmentYear}
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-600 flex items-center gap-2">
                <span className="font-semibold text-slate-800">Your Advisor:</span>
                <span className="font-bold text-indigo-700">{student.advisorName}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Advising Status</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                {student.advisingStatus}
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('profile')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold text-xs transition-colors"
            >
              <span>Update My Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. CURRENT STAGE & NEXT MILESTONE + PROFILE COMPLETION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stage & Milestone */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Your Advising Stage</h3>
              </div>
              <StageBadge stage={student.advisingStage} />
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              You are currently in the <strong>{student.advisingStage}</strong> phase of your US college prep journey.
            </p>
          </div>

          <div className="bg-teal-50/60 border border-teal-100 rounded-lg p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
              <span>Next Major Milestone</span>
            </div>
            <p className="text-xs font-medium text-teal-800 leading-snug">{student.nextMilestone}</p>
          </div>
        </div>

        {/* Profile Completion Indicator */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Profile Completion</h3>
              </div>
              <span className="text-xs font-bold text-indigo-700">{completionPercentage}% Ready</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] mb-2">
              {profileSections.map((sec, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {sec.complete ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                  <span className={`truncate ${sec.complete ? 'text-slate-700' : 'text-amber-700 font-medium'}`}>
                    {sec.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('profile')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium pt-2 border-t border-slate-100 text-left"
          >
            Review and complete pending sections &rarr;
          </button>
        </div>
      </div>

      {/* 3. MY NEXT ACTIONS (STUDENT TASKS) & UPCOMING MEETING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Next Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <ListTodo className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">My Next Actions</h3>
                <p className="text-[11px] text-slate-500">Tasks assigned for you to complete</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              View All Tasks &rarr;
            </button>
          </div>

          {activeTasks.length === 0 ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">All student tasks completed!</p>
              <p className="text-[11px] text-slate-500">Check in with your advisor during the next meeting.</p>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              {activeTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => onUpdateTaskStatus(task.id, 'Completed')}
                        className="mt-0.5 text-slate-300 hover:text-emerald-600 transition-colors"
                        title="Click to mark done"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{task.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{task.description}</p>
                      </div>
                    </div>

                    <TaskStatusBadge status={task.status} />
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      Due Date: <strong className="text-slate-800">{task.dueDate}</strong>
                    </span>
                    <button
                      onClick={() => onNavigateTab('tasks')}
                      className="text-teal-700 font-semibold hover:underline"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Meeting & Preparation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Upcoming Advising Session</h3>
                <p className="text-[11px] text-slate-500">Date, purpose, and preparation</p>
              </div>
            </div>
          </div>

          {upcomingMeeting ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              <div>
                <div className="font-bold text-slate-900 text-sm">{upcomingMeeting.type}</div>
                <div className="flex items-center gap-2 text-slate-600 mt-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {upcomingMeeting.date} &bull; {upcomingMeeting.time}
                  </span>
                </div>
              </div>

              {upcomingMeeting.studentPreparationNeeded ? (
                <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-900">
                  <span className="font-bold block text-[11px] mb-1">What you should prepare:</span>
                  <p className="text-[11px] leading-relaxed">{upcomingMeeting.studentPreparationNeeded}</p>
                </div>
              ) : (
                <p className="text-slate-500 italic text-[11px]">
                  No specific prep homework assigned. Bring your recent drafts and questions!
                </p>
              )}

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">With {student.advisorName}</span>
                <button
                  onClick={() => onNavigateTab('tasks')}
                  className="text-teal-700 font-semibold hover:underline"
                >
                  Submit Question for Session &rarr;
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center italic">
              No upcoming session scheduled yet. Check back soon or message your advisor.
            </p>
          )}
        </div>
      </div>

      {/* 4. RECENT SHARED UPDATES */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Shared Advisor Updates</h3>
              <p className="text-[11px] text-slate-500">
                Feedback, strategic summaries, and decisions shared by your advisor
              </p>
            </div>
          </div>
        </div>

        {recentSharedUpdates.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center italic">
            No shared updates recorded yet.
          </p>
        ) : (
          <div className="space-y-3 text-xs">
            {recentSharedUpdates.map((m) => (
              <div key={m.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{m.type}</span>
                  <span className="text-[10px] text-slate-500">{m.date}</span>
                </div>
                {m.decisions && (
                  <p className="text-slate-700 mt-1 leading-snug">
                    <strong className="text-slate-900">Key Decision:</strong> {m.decisions}
                  </p>
                )}
                {m.actionItems && (
                  <p className="text-[11px] text-slate-600 mt-1">
                    <strong>Action Items:</strong> {m.actionItems}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
