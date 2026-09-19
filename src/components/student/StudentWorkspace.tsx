import React, { useState } from 'react';
import {
  Student,
  Task,
  Meeting,
  ChangeHistoryEntry,
  StudentTab,
  TaskStatus,
} from '../../types';
import {
  LayoutDashboard,
  User,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { StudentOverviewTab } from './tabs/StudentOverviewTab';
import { StudentProfileTab } from './tabs/StudentProfileTab';
import { StudentTasksMeetingsTab } from './tabs/StudentTasksMeetingsTab';

interface StudentWorkspaceProps {
  student: Student;
  tasks: Task[];
  meetings: Meeting[];
  history: ChangeHistoryEntry[];
  onSaveStudentProfile: (updatedStudent: Student) => void;
  onUpdateTask: (taskId: string, status: TaskStatus, note?: string) => void;
  onAddQuestionForAdvisor: (question: string) => void;
}

export const StudentWorkspace: React.FC<StudentWorkspaceProps> = ({
  student,
  tasks,
  meetings,
  history,
  onSaveStudentProfile,
  onUpdateTask,
  onAddQuestionForAdvisor,
}) => {
  const [activeTab, setActiveTab] = useState<StudentTab>('overview');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6" id="student-workspace-container">
      {/* Student Portal Navigation Tabs: Strict order Overview → My Profile → Tasks & Meetings */}
      <div className="bg-white rounded-xl border border-teal-100 p-1.5 shadow-xs mb-6">
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium" aria-label="Student Portal Tabs">
          <button
            id="tab-student-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-teal-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            id="tab-student-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'bg-teal-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          <button
            id="tab-student-tasks"
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'tasks'
                ? 'bg-teal-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Tasks & Meetings</span>
            {tasks.filter((t) => t.studentId === student.id && t.owner === 'Student' && t.status !== 'Completed').length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'tasks'
                    ? 'bg-white/20 text-white'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                {tasks.filter((t) => t.studentId === student.id && t.owner === 'Student' && t.status !== 'Completed').length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <StudentOverviewTab
          student={student}
          tasks={tasks}
          meetings={meetings}
          history={history}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onUpdateTaskStatus={(id, st) => onUpdateTask(id, st)}
        />
      )}

      {activeTab === 'profile' && (
        <StudentProfileTab
          student={student}
          onSaveStudentProfile={onSaveStudentProfile}
        />
      )}

      {activeTab === 'tasks' && (
        <StudentTasksMeetingsTab
          student={student}
          tasks={tasks}
          meetings={meetings}
          onUpdateTask={onUpdateTask}
          onAddQuestionForAdvisor={onAddQuestionForAdvisor}
        />
      )}
    </div>
  );
};
