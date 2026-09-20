import React, { useState, useEffect } from 'react';
import {
  Student,
  Task,
  Meeting,
  ChangeHistoryEntry,
  ActivePortal,
  TaskStatus,
  SmartUpdateCandidate,
} from './types';
import { StorageService } from './services/storageService';
import { Header } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { AdvisorDirectory } from './components/advisor/AdvisorDirectory';
import { AdvisorWorkspace } from './components/advisor/AdvisorWorkspace';
import { StudentWorkspace } from './components/student/StudentWorkspace';

export default function App() {
  const [currentPortal, setCurrentPortal] = useState<ActivePortal>('landing');
  const [students, setStudents] = useState<Student[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [history, setHistory] = useState<ChangeHistoryEntry[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [inAdvisorWorkspace, setInAdvisorWorkspace] = useState<boolean>(false);

  // Initialize data from LocalStorage (or sample seed)
  useEffect(() => {
    const loadedStudents = StorageService.loadStudents();
    const loadedTasks = StorageService.loadTasks();
    const loadedMeetings = StorageService.loadMeetings();
    const loadedHistory = StorageService.loadChangeHistory();

    setStudents(loadedStudents);
    setTasks(loadedTasks);
    setMeetings(loadedMeetings);
    setHistory(loadedHistory);

    if (loadedStudents.length > 0) {
      setSelectedStudentId(loadedStudents[0].id);
    }
  }, []);

  const currentStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  // Portal switching handlers
  const handleSelectPortal = (portal: ActivePortal) => {
    setCurrentPortal(portal);
    if (portal === 'advisor') {
      // Go to directory by default unless student already selected in workspace
      setInAdvisorWorkspace(false);
    }
  };

  const handleSelectStudentAndPortal = (studentId: string, portal: ActivePortal) => {
    setSelectedStudentId(studentId);
    setCurrentPortal(portal);
    if (portal === 'advisor') {
      setInAdvisorWorkspace(true);
    }
  };

  const handleOpenStudentInAdvisorWorkspace = (studentId: string) => {
    setSelectedStudentId(studentId);
    setInAdvisorWorkspace(true);
  };

  // Data update handlers
  const handleSaveStudent = (updatedStudent: Student, logMessage?: string) => {
    StorageService.saveStudent(updatedStudent);
    setStudents(StorageService.loadStudents());

    if (logMessage) {
      StorageService.addChangeHistory({
        id: `hist-${Date.now()}`,
        studentId: updatedStudent.id,
        timestamp: new Date().toISOString(),
        source: 'Advisor Manual Edit',
        fieldName: 'Profile Dossier',
        previousValue: 'Previous state',
        newValue: 'Updated profile attributes',
        decision: 'Accepted',
        updatedBy: updatedStudent.advisorName || 'Advisor',
      });
      setHistory(StorageService.loadChangeHistory());
    }
  };

  const handleSaveMeeting = (newMeeting: Meeting) => {
    StorageService.saveMeeting(newMeeting);
    setMeetings(StorageService.loadMeetings());
  };

  const handleCreateTask = (newTask: Task) => {
    StorageService.saveTask(newTask);
    setTasks(StorageService.loadTasks());
  };

  const handleUpdateTask = (taskId: string, status: TaskStatus, note?: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const updatedTask: Task = {
      ...targetTask,
      status,
      ...(note !== undefined && { completionNote: note }),
    };

    StorageService.saveTask(updatedTask);
    setTasks(StorageService.loadTasks());
  };

  const handleResolveMissingInfo = (infoId: string) => {
    if (!currentStudent) return;
    const updatedMissing = currentStudent.missingOrUnclearInfo.filter(
      (item) => item.id !== infoId
    );
    const updatedStudent = {
      ...currentStudent,
      missingOrUnclearInfo: updatedMissing,
    };
    handleSaveStudent(updatedStudent, 'Resolved missing information flag');
  };

  const handleApplySmartUpdates = (
    updatedStudent: Student,
    acceptedCandidates: SmartUpdateCandidate[],
    noteExcerpt: string
  ) => {
    // 1. Save updated student record
    StorageService.saveStudent(updatedStudent);
    setStudents(StorageService.loadStudents());

    // 2. Add audit history for each candidate & handle tasks
    acceptedCandidates.forEach((cand, idx) => {
      // If task was accepted as part of candidates, ensure it is saved to tasks list
      if (cand.category === 'task' && cand.taskDetails) {
        const newTask: Task = {
          id: `task-smart-${Date.now()}-${idx}`,
          studentId: updatedStudent.id,
          title: cand.taskDetails.title,
          description: cand.taskDetails.description,
          owner: cand.taskDetails.owner,
          dueDate: cand.taskDetails.dueDate,
          status: 'Not Started',
          createdAt: new Date().toISOString(),
        };
        StorageService.saveTask(newTask);
      }

      let decisionText: ChangeHistoryEntry['decision'] = 'Accepted';
      if (cand.status === 'EditedAndAccepted') {
        decisionText = 'Edited & Accepted';
      } else if (cand.status === 'ClarificationQueued') {
        decisionText = 'Clarification Queued';
      } else if (cand.status === 'Rejected') {
        decisionText = 'Rejected';
      }

      StorageService.addChangeHistory({
        id: `hist-smart-${Date.now()}-${idx}`,
        studentId: updatedStudent.id,
        timestamp: new Date().toISOString(),
        source: 'Meeting Note Smart Extraction',
        originalNote: cand.originalNoteQuote,
        meetingId: cand.meetingId,
        meetingDate: cand.meetingDate,
        meetingType: cand.meetingType,
        fieldName: cand.displayField,
        previousValue: cand.formattedCurrentValue || 'None',
        newValue:
          cand.status === 'EditedAndAccepted' && cand.advisorEditedValue
            ? String(cand.advisorEditedValue)
            : String(cand.formattedProposedValue),
        decision: decisionText,
        updatedBy: updatedStudent.advisorName || 'Advisor',
      });
    });

    setTasks(StorageService.loadTasks());
    setHistory(StorageService.loadChangeHistory());
  };

  const handleAddQuestionForAdvisor = (question: string) => {
    if (!currentStudent) return;
    const existingQuestions = currentStudent.questionsForAdvisor || [];
    const updatedStudent: Student = {
      ...currentStudent,
      questionsForAdvisor: [...existingQuestions, question],
    };
    StorageService.saveStudent(updatedStudent);
    setStudents(StorageService.loadStudents());
  };

  const handleAddStudent = (newStudent: Student) => {
    StorageService.saveStudent(newStudent);
    setStudents(StorageService.loadStudents());
    setSelectedStudentId(newStudent.id);
    setInAdvisorWorkspace(true);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Reset advising database to initial sample records? Any local changes will be replaced with fresh mock data.'
      )
    ) {
      StorageService.resetToInitialSample();
      setStudents(StorageService.loadStudents());
      setTasks(StorageService.loadTasks());
      setMeetings(StorageService.loadMeetings());
      setHistory(StorageService.loadChangeHistory());
      const loaded = StorageService.loadStudents();
      if (loaded.length > 0) setSelectedStudentId(loaded[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header with quick portal switching, active student, and reset controls */}
      <Header
        currentPortal={currentPortal}
        onSelectPortal={handleSelectPortal}
        students={students}
        selectedStudentId={selectedStudentId}
        onSelectStudent={(id) => setSelectedStudentId(id)}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 1. LANDING PAGE */}
        {currentPortal === 'landing' && (
          <LandingPage
            students={students}
            onSelectPortal={handleSelectPortal}
            onSelectStudentAndPortal={handleSelectStudentAndPortal}
          />
        )}

        {/* 2. ADVISOR PORTAL */}
        {currentPortal === 'advisor' && (
          <>
            {inAdvisorWorkspace && currentStudent ? (
              <AdvisorWorkspace
                student={currentStudent}
                tasks={tasks}
                meetings={meetings}
                history={history}
                onBackToDirectory={() => setInAdvisorWorkspace(false)}
                onSaveStudent={handleSaveStudent}
                onSaveMeeting={handleSaveMeeting}
                onCreateTask={handleCreateTask}
                onUpdateTaskStatus={handleUpdateTask}
                onResolveMissingInfo={handleResolveMissingInfo}
                onApplySmartUpdates={handleApplySmartUpdates}
              />
            ) : (
              <AdvisorDirectory
                students={students}
                tasks={tasks}
                meetings={meetings}
                onSelectStudent={handleOpenStudentInAdvisorWorkspace}
                onAddStudent={handleAddStudent}
              />
            )}
          </>
        )}

        {/* 3. STUDENT PORTAL (strict privacy: advisor internal notes hidden) */}
        {currentPortal === 'student' && currentStudent && (
          <StudentWorkspace
            student={currentStudent}
            tasks={tasks}
            meetings={meetings}
            history={history}
            onSaveStudentProfile={(updated) => handleSaveStudent(updated)}
            onUpdateTask={handleUpdateTask}
            onAddQuestionForAdvisor={handleAddQuestionForAdvisor}
          />
        )}
      </main>
    </div>
  );
}
