import React, { useState } from 'react';
import {
  Student,
  Task,
  Meeting,
  TaskStatus,
} from '../../../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  HelpCircle,
  FileText,
  AlertCircle,
  Plus,
  BookOpen,
} from 'lucide-react';
import { TaskStatusBadge } from '../../common/Badge';

interface StudentTasksMeetingsTabProps {
  student: Student;
  tasks: Task[];
  meetings: Meeting[];
  onUpdateTask: (taskId: string, status: TaskStatus, note?: string) => void;
  onAddQuestionForAdvisor: (question: string) => void;
}

export const StudentTasksMeetingsTab: React.FC<StudentTasksMeetingsTabProps> = ({
  student,
  tasks,
  meetings,
  onUpdateTask,
  onAddQuestionForAdvisor,
}) => {
  const [taskFilter, setTaskFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [completionNote, setCompletionNote] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [questionSentToast, setQuestionSentToast] = useState(false);

  // Filter tasks assigned to Student
  const myTasks = tasks.filter((t) => t.studentId === student.id && t.owner === 'Student');
  const filteredTasks = myTasks.filter((t) => {
    if (taskFilter === 'ALL') return true;
    return t.status === taskFilter;
  });

  // STRICT PERMISSION FILTER: Only meetings with 'Share with Student'
  const sharedMeetings = meetings.filter(
    (m) => m.studentId === student.id && m.visibility === 'Share with Student'
  );

  const upcomingMeetings = sharedMeetings.filter(
    (m) => new Date(m.date).getTime() >= new Date().setHours(0, 0, 0, 0)
  );

  const pastMeetings = sharedMeetings.filter(
    (m) => new Date(m.date).getTime() < new Date().setHours(0, 0, 0, 0)
  );

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    if (newStatus === 'Completed') {
      setEditingTaskId(taskId);
      setCompletionNote('');
    } else {
      onUpdateTask(taskId, newStatus);
    }
  };

  const handleSaveCompletionWithNote = (taskId: string) => {
    onUpdateTask(taskId, 'Completed', completionNote);
    setEditingTaskId(null);
    setCompletionNote('');
  };

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    onAddQuestionForAdvisor(newQuestion.trim());
    setNewQuestion('');
    setQuestionSentToast(true);
    setTimeout(() => setQuestionSentToast(false), 3500);
  };

  return (
    <div className="space-y-6" id="student-tasks-meetings-content">
      {/* Toast */}
      {questionSentToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-900 text-teal-100 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs border border-teal-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>Question recorded! Your advisor will see this on their agenda for your next session.</span>
        </div>
      )}

      {/* SECTION 1: ASSIGNED TASKS */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Assigned Student Tasks</h3>
            <p className="text-xs text-slate-500">
              Manage your action items, update progress, and log completion notes
            </p>
          </div>

          <div className="inline-flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
            <button
              onClick={() => setTaskFilter('ALL')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                taskFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({myTasks.length})
            </button>
            <button
              onClick={() => setTaskFilter('In Progress')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                taskFilter === 'In Progress'
                  ? 'bg-white text-teal-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress ({myTasks.filter((t) => t.status === 'In Progress').length})
            </button>
            <button
              onClick={() => setTaskFilter('Completed')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                taskFilter === 'Completed'
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Done ({myTasks.filter((t) => t.status === 'Completed').length})
            </button>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center italic">
            No tasks found matching this status filter.
          </p>
        ) : (
          <div className="space-y-3 text-xs">
            {filteredTasks.map((task) => {
              const isPromptingNote = editingTaskId === task.id;

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all ${
                    task.status === 'Completed'
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-white border-slate-200 hover:border-teal-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h4
                        className={`font-bold text-sm ${
                          task.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <p className="text-slate-600 mt-0.5">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <TaskStatusBadge status={task.status} />
                    </div>
                  </div>

                  {/* Task Completion Note (if already completed) */}
                  {task.completionNote && (
                    <div className="mb-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900 text-[11px]">
                      <strong>Completion note:</strong> {task.completionNote}
                    </div>
                  )}

                  {/* Inline Note prompt modal when clicking "Completed" */}
                  {isPromptingNote && (
                    <div className="mt-3 p-3 rounded-lg bg-teal-50 border border-teal-200 space-y-2">
                      <label className="block font-semibold text-teal-950 text-[11px]">
                        Add an optional note on what was accomplished or links to your work:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Uploaded draft to Google Docs, finished first 5 colleges..."
                        value={completionNote}
                        onChange={(e) => setCompletionNote(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-teal-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingTaskId(null)}
                          className="px-3 py-1 text-[11px] text-slate-600 hover:bg-slate-100 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveCompletionWithNote(task.id)}
                          className="px-3.5 py-1 text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded shadow-xs"
                        >
                          Mark Completed
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Status update buttons */}
                  {!isPromptingNote && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-500">
                        Deadline: <strong className="text-slate-800">{task.dueDate}</strong>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-medium">Update to:</span>
                        {task.status !== 'Not Started' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'Not Started')}
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            Not Started
                          </button>
                        )}
                        {task.status !== 'In Progress' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'In Progress')}
                            className="px-2 py-0.5 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold"
                          >
                            In Progress
                          </button>
                        )}
                        {task.status !== 'Completed' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'Completed')}
                            className="px-2.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Done</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: UPCOMING & PAST MEETINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Meetings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Upcoming Advising Sessions</h3>
                <p className="text-[11px] text-slate-500">Dates, topics, and preparation items</p>
              </div>
            </div>
          </div>

          {upcomingMeetings.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">
              No upcoming meetings scheduled right now.
            </p>
          ) : (
            <div className="space-y-3 text-xs">
              {upcomingMeetings.map((m) => (
                <div key={m.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">{m.type}</span>
                    <span className="text-slate-500 font-medium text-[11px]">{m.date}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mb-2">{m.time}</span>

                  {m.studentPreparationNeeded && (
                    <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900">
                      <span className="font-bold block text-[11px] mb-0.5">Preparation Needed:</span>
                      <p className="text-[11px] leading-relaxed">{m.studentPreparationNeeded}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Meetings (Shared Only) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Past Session Summaries</h3>
                <p className="text-[11px] text-slate-500">Shared decisions & agreed plans</p>
              </div>
            </div>
          </div>

          {pastMeetings.length === 0 && sharedMeetings.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">
              No previous meeting notes shared yet.
            </p>
          ) : (
            <div className="space-y-3 text-xs">
              {(pastMeetings.length > 0 ? pastMeetings : sharedMeetings).map((m) => (
                <div key={m.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">{m.type}</span>
                    <span className="text-slate-500 text-[11px]">{m.date}</span>
                  </div>

                  {m.decisions && (
                    <p className="text-slate-700 mt-1 leading-snug">
                      <strong>Decisions:</strong> {m.decisions}
                    </p>
                  )}

                  {m.actionItems && (
                    <p className="text-slate-600 text-[11px] mt-1">
                      <strong>Action items:</strong> {m.actionItems}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: QUESTIONS FOR ADVISOR */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Questions for Your Advisor</h3>
              <p className="text-[11px] text-slate-500">
                Add discussion topics or queries you want {student.advisorName} to cover in the next meeting
              </p>
            </div>
          </div>
        </div>

        {/* Existing questions log */}
        {student.questionsForAdvisor && student.questionsForAdvisor.length > 0 && (
          <div className="mb-4 space-y-2 text-xs">
            <span className="text-slate-500 font-medium block text-[11px]">
              Active Topics on Agenda:
            </span>
            {student.questionsForAdvisor.map((q, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-purple-50/50 border border-purple-100 text-purple-950"
              >
                <span className="w-4 h-4 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{q}</span>
              </div>
            ))}
          </div>
        )}

        {/* Add new question form */}
        <form onSubmit={handleSendQuestion} className="flex items-center gap-2 text-xs">
          <input
            type="text"
            required
            placeholder="Type your question or topic (e.g. 'Can we review my Early Decision choice for Bowdoin?')..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shrink-0 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Add Topic</span>
          </button>
        </form>
      </div>
    </div>
  );
};
