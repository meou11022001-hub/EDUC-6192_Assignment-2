import React, { useState } from 'react';
import {
  Student,
  Task,
  Meeting,
  ChangeHistoryEntry,
  AdvisorTab,
  TaskStatus,
  SmartUpdateCandidate,
} from '../../types';
import {
  ArrowLeft,
  LayoutDashboard,
  UserCheck,
  CalendarCheck,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AdvisorOverviewTab } from './tabs/AdvisorOverviewTab';
import { AdvisorProfileTab } from './tabs/AdvisorProfileTab';
import { AdvisorMeetingsTab } from './tabs/AdvisorMeetingsTab';

interface AdvisorWorkspaceProps {
  student: Student;
  tasks: Task[];
  meetings: Meeting[];
  history: ChangeHistoryEntry[];
  onBackToDirectory: () => void;
  onSaveStudent: (updatedStudent: Student, logMessage?: string) => void;
  onSaveMeeting: (newMeeting: Meeting) => void;
  onCreateTask: (newTask: Task) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onResolveMissingInfo: (infoId: string) => void;
  onApplySmartUpdates: (
    updatedStudent: Student,
    acceptedCandidates: SmartUpdateCandidate[],
    noteExcerpt: string
  ) => void;
}

export const AdvisorWorkspace: React.FC<AdvisorWorkspaceProps> = ({
  student,
  tasks,
  meetings,
  history,
  onBackToDirectory,
  onSaveStudent,
  onSaveMeeting,
  onCreateTask,
  onUpdateTaskStatus,
  onResolveMissingInfo,
  onApplySmartUpdates,
}) => {
  const [activeTab, setActiveTab] = useState<AdvisorTab>('overview');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6" id="advisor-workspace-container">
      {/* Top Breadcrumb & Return to Directory */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <button
          id="btn-back-to-directory"
          onClick={onBackToDirectory}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors group"
        >
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 group-hover:border-indigo-300 flex items-center justify-center shadow-2xs">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span>&larr; Back to Student Directory</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          <span>Advisor Mode &bull; {student.advisorName}</span>
        </div>
      </div>

      {/* Workspace Tabs Navigation: MUST follow strict order Overview → Student Profile → Meetings & Notes */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs mb-6">
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium" aria-label="Advisor Workspace Tabs">
          <button
            id="tab-advisor-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            id="tab-advisor-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Student Profile</span>
          </button>

          <button
            id="tab-advisor-meetings"
            onClick={() => setActiveTab('meetings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'meetings'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Meetings & Notes</span>
            {meetings.filter((m) => m.studentId === student.id).length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'meetings'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {meetings.filter((m) => m.studentId === student.id).length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <AdvisorOverviewTab
          student={student}
          tasks={tasks}
          meetings={meetings}
          history={history}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onUpdateTaskStatus={onUpdateTaskStatus}
          onResolveMissingInfo={onResolveMissingInfo}
        />
      )}

      {activeTab === 'profile' && (
        <AdvisorProfileTab student={student} onSaveStudent={onSaveStudent} />
      )}

      {activeTab === 'meetings' && (
        <AdvisorMeetingsTab
          student={student}
          meetings={meetings}
          tasks={tasks}
          history={history}
          onSaveMeeting={onSaveMeeting}
          onCreateTask={onCreateTask}
          onApplySmartUpdates={onApplySmartUpdates}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onSaveStudent={onSaveStudent}
        />
      )}
    </div>
  );
};
