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
  AlertTriangle,
  CheckCircle2,
  Compass,
  ArrowRight,
  ListTodo,
  FileQuestion,
  HelpCircle,
  TrendingUp,
  Sparkles,
  History,
  Shield,
  Plus,
} from 'lucide-react';
import {
  AdvisingStatusBadge,
  StageBadge,
  FieldStatusBadge,
  TaskStatusBadge,
  VisibilityBadge,
} from '../../common/Badge';

interface AdvisorOverviewTabProps {
  student: Student;
  tasks: Task[];
  meetings: Meeting[];
  history: ChangeHistoryEntry[];
  onNavigateTab: (tab: 'overview' | 'profile' | 'meetings') => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onResolveMissingInfo: (infoId: string) => void;
}

export const AdvisorOverviewTab: React.FC<AdvisorOverviewTabProps> = ({
  student,
  tasks,
  meetings,
  history,
  onNavigateTab,
  onUpdateTaskStatus,
  onResolveMissingInfo,
}) => {
  const studentTasks = tasks.filter((t) => t.studentId === student.id);
  const activeTasks = studentTasks.filter((t) => t.status !== 'Completed');
  const completedTasks = studentTasks.filter((t) => t.status === 'Completed');

  // Sorted upcoming meetings
  const upcomingMeetings = meetings
    .filter((m) => m.studentId === student.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextMeeting = upcomingMeetings[0];

  // Recent activity: combines recent history, meetings, tasks
  const recentActivities = [
    ...history
      .filter((h) => h.studentId === student.id)
      .map((h) => ({
        id: h.id,
        date: h.timestamp,
        type: 'history',
        title: `${h.source}: ${h.fieldName}`,
        detail: `Changed from "${h.previousValue}" to "${h.newValue}"`,
        actor: h.updatedBy,
        causedBy:
          h.meetingDate && h.meetingType
            ? `Caused by meeting on ${h.meetingDate} (${h.meetingType})`
            : undefined,
        originalQuote: h.originalNote ? `"${h.originalNote}"` : undefined,
        decision: h.decision,
      })),
    ...meetings
      .filter((m) => m.studentId === student.id)
      .map((m) => ({
        id: m.id,
        date: m.createdAt,
        type: 'meeting',
        title: `Meeting Conducted: ${m.type}`,
        detail: m.decisions || m.discussionNotes.substring(0, 100) + '...',
        actor: m.createdBy,
        causedBy: undefined,
        originalQuote: undefined,
        decision: undefined,
      })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="space-y-6" id="advisor-overview-tab-content">
      {/* 1. STUDENT HEADER */}
      <div
        id="advisor-student-header-card"
        className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <img
              src={student.basic.photoUrl}
              alt={student.basic.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shadow-xs shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-900">{student.basic.name}</h2>
                <span className="text-sm font-medium text-slate-500">
                  ({student.basic.preferredName})
                </span>
                <AdvisingStatusBadge status={student.advisingStatus} />
                <StageBadge stage={student.advisingStage} />
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                <span>
                  <strong>Grade:</strong> {student.basic.grade} &bull; Class of {student.basic.graduationYear}
                </span>
                <span>
                  <strong>School:</strong> {student.basic.school}
                </span>
                <span>
                  <strong>Target US Enrollment:</strong> Fall {student.basic.expectedUsEnrollmentYear}
                </span>
              </div>

              <div className="mt-2 text-xs flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-700">Intended Direction:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {student.interests.possibleMajors.map((major, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-semibold text-[11px] border border-indigo-200"
                    >
                      {major}
                    </span>
                  ))}
                  <span className="text-slate-400 text-[11px]">
                    (Certainty: {student.interests.levelOfCertainty})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Assigned Advisor</span>
              <span className="text-xs font-semibold text-slate-800">{student.advisorName}</span>
            </div>
            <button
              onClick={() => onNavigateTab('profile')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium text-xs transition-colors"
            >
              <span>Full Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Synchronized Record Snapshot Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">SAT Composite</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {student.academics.satScore || 'None recorded'}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">
              {student.academics.status}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">GPA Record</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {student.academics.gpa || 'Pending transcript'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Vietnamese Scale</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">English Testing</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {student.academics.ieltsScore ? `IELTS ${student.academics.ieltsScore}` : student.academics.toeflScore ? `TOEFL ${student.academics.toeflScore}` : 'Not tested'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Proficiency</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Annual Budget</span>
            <span className="text-xs font-bold text-emerald-700 block mt-0.5">
              {student.financials.estimatedAnnualBudgetUsd
                ? `$${student.financials.estimatedAnnualBudgetUsd.toLocaleString()} USD`
                : 'Unspecified'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Annual capacity</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Activities & Awards</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {student.activities.extracurriculars.length} ECs / {student.activities.awards.length} Honors
            </span>
            <span className="text-[10px] text-indigo-600 font-medium">Profile Portfolio</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">College Strategy</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {student.collegePreferences.consideredColleges.length} Colleges
            </span>
            <span className="text-[10px] text-teal-600 font-medium">
              {student.collegePreferences.consideredColleges.filter(c => c.category === 'Reach').length} Reach, {student.collegePreferences.consideredColleges.filter(c => c.category === 'Target').length} Target
            </span>
          </div>
        </div>
      </div>

      {/* 2. CURRENT STAGE & MILESTONE + CURRENT PRIORITIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Stage & Next Major Milestone */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Current Advising Stage</h3>
              </div>
              <StageBadge stage={student.advisingStage} />
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Student is actively progressing through the <strong>{student.advisingStage}</strong> phase of their US undergraduate campaign.
            </p>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-700" />
              <span>Next Major Milestone</span>
            </div>
            <p className="text-xs font-medium text-indigo-800 leading-snug">
              {student.nextMilestone}
            </p>
          </div>
        </div>

        {/* Current Priorities */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Current Advising Priorities</h3>
            </div>
            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {student.currentPriorities.length} Key Focus Areas
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {student.currentPriorities.map((priority, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
              >
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-slate-700 leading-snug">{priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. NEXT ACTIONS (TASKS) & MISSING/UNCLEAR INFORMATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Actions (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <ListTodo className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Next Actions</h3>
                <p className="text-[11px] text-slate-500">Immediate advisor and student tasks</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('meetings')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Manage Tasks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {studentTasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center italic">No tasks created yet.</p>
          ) : (
            <div className="space-y-2.5 text-xs">
              {activeTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white"
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => onUpdateTaskStatus(task.id, 'Completed')}
                      className="mt-0.5 text-slate-300 hover:text-emerald-600 transition-colors"
                      title="Mark as completed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                      <h4 className="font-semibold text-slate-800">{task.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                        <span className="text-slate-400">Due:</span>
                        <span className="font-medium text-slate-700">{task.dueDate}</span>
                        <span className="text-slate-300">&bull;</span>
                        <span
                          className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                            task.owner === 'Student'
                              ? 'bg-teal-50 text-teal-700'
                              : task.owner === 'Advisor'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.owner}
                        </span>
                      </div>
                    </div>
                  </div>

                  <TaskStatusBadge status={task.status} />
                </div>
              ))}

              {completedTasks.length > 0 && (
                <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>{completedTasks.length} task(s) marked completed</span>
                  <span className="text-emerald-600 font-medium">&#10003; Verified</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Missing / Unclear Information (1 col on lg) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Missing / Unclear Info</h3>
                  <p className="text-[11px] text-slate-500">Requires collection or clarification</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {student.missingOrUnclearInfo.length}
              </span>
            </div>

            {student.missingOrUnclearInfo.length === 0 ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800">All Core Information Verified</p>
                <p className="text-[11px] text-slate-500 mt-0.5">No flagged missing fields at this stage.</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {student.missingOrUnclearInfo.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border ${
                      item.status === 'Missing'
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-amber-50/40 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{item.field}</span>
                      <FieldStatusBadge status={item.status} />
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{item.description}</p>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">Sec: {item.section}</span>
                      <button
                        onClick={() => onResolveMissingInfo(item.id)}
                        className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Mark Verified &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('profile')}
              className="w-full py-1.5 text-xs text-center text-slate-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Update in Student Profile Tab &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 4. UPCOMING MEETINGS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Meetings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Upcoming Advising Meetings</h3>
                <p className="text-[11px] text-slate-500">Scheduled sessions & preparation needed</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('meetings')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All Meetings</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {nextMeeting ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{nextMeeting.type}</div>
                  <div className="flex items-center gap-2 text-slate-600 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{nextMeeting.date} &bull; {nextMeeting.time}</span>
                  </div>
                </div>
                <VisibilityBadge visibility={nextMeeting.visibility} />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Participants:</span>
                <p className="text-slate-700">{nextMeeting.participants.join(', ')}</p>
              </div>

              {nextMeeting.studentPreparationNeeded && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-semibold block text-[11px] mb-0.5">Preparation Required:</span>
                  <p className="text-[11px] leading-relaxed">{nextMeeting.studentPreparationNeeded}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center italic">
              No upcoming meetings scheduled. Record one in the Meetings & Notes tab.
            </p>
          )}
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recent Activity & Audit Trail</h3>
                <p className="text-[11px] text-slate-500">Timeline of updates, meetings, and changes</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 relative pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-slate-800 truncate">{act.title}</h4>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(act.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{act.detail}</p>
                  
                  {act.causedBy && (
                    <span className="inline-block mt-1 text-[10px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {act.causedBy}
                    </span>
                  )}

                  {act.originalQuote && (
                    <p className="text-[10px] text-slate-500 italic mt-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                      Excerpt: {act.originalQuote}
                    </p>
                  )}

                  <span className="text-[10px] text-slate-400 font-medium mt-1 block">By: {act.actor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
