import {
  Student,
  Meeting,
  Task,
  ChangeHistoryEntry,
  StudentQuestion,
  TaskStatus,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_MEETINGS,
  INITIAL_TASKS,
  INITIAL_CHANGE_HISTORY,
  INITIAL_QUESTIONS,
} from '../data/sampleStudents';

const STORAGE_KEYS = {
  STUDENTS: 'vietadvising_students_v1',
  MEETINGS: 'vietadvising_meetings_v1',
  TASKS: 'vietadvising_tasks_v1',
  CHANGE_HISTORY: 'vietadvising_change_history_v1',
  QUESTIONS: 'vietadvising_questions_v1',
  SELECTED_STUDENT_ID: 'vietadvising_selected_student_id_v1',
  CURRENT_PORTAL: 'vietadvising_current_portal_v1',
};

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function safeSetItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('vietadvising_storage_change'));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export const StorageService = {
  // Students
  getStudents(): Student[] {
    const students = safeGetItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
    if (!students || students.length === 0) {
      safeSetItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
      return INITIAL_STUDENTS;
    }
    return students;
  },

  getStudentById(id: string): Student | undefined {
    const students = this.getStudents();
    return students.find((s) => s.id === id);
  },

  saveStudent(student: Student, historyInfo?: { source: ChangeHistoryEntry['source']; fieldName: string; previousValue: string; newValue: string; updatedBy: string }): void {
    const students = this.getStudents();
    const index = students.findIndex((s) => s.id === student.id);
    let updated: Student[];
    if (index >= 0) {
      updated = [...students];
      updated[index] = student;
    } else {
      updated = [student, ...students];
    }
    safeSetItem(STORAGE_KEYS.STUDENTS, updated);

    if (historyInfo) {
      this.addChangeHistory({
        id: `hist-${Date.now()}`,
        studentId: student.id,
        timestamp: new Date().toISOString(),
        source: historyInfo.source,
        fieldName: historyInfo.fieldName,
        previousValue: historyInfo.previousValue,
        newValue: historyInfo.newValue,
        decision: 'Updated',
        updatedBy: historyInfo.updatedBy,
      });
    }
  },

  // Meetings
  getMeetings(studentId?: string): Meeting[] {
    const meetings = safeGetItem<Meeting[]>(STORAGE_KEYS.MEETINGS, []);
    if (!meetings || meetings.length === 0) {
      safeSetItem(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS);
      return studentId ? INITIAL_MEETINGS.filter((m) => m.studentId === studentId) : INITIAL_MEETINGS;
    }
    return studentId ? meetings.filter((m) => m.studentId === studentId) : meetings;
  },

  saveMeeting(meeting: Meeting): void {
    const meetings = safeGetItem<Meeting[]>(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS);
    const index = meetings.findIndex((m) => m.id === meeting.id);
    let updated: Meeting[];
    if (index >= 0) {
      updated = [...meetings];
      updated[index] = meeting;
    } else {
      updated = [meeting, ...meetings];
    }
    safeSetItem(STORAGE_KEYS.MEETINGS, updated);
  },

  // Tasks
  getTasks(studentId?: string): Task[] {
    const tasks = safeGetItem<Task[]>(STORAGE_KEYS.TASKS, []);
    if (!tasks || tasks.length === 0) {
      safeSetItem(STORAGE_KEYS.TASKS, INITIAL_TASKS);
      return studentId ? INITIAL_TASKS.filter((t) => t.studentId === studentId) : INITIAL_TASKS;
    }
    return studentId ? tasks.filter((t) => t.studentId === studentId) : tasks;
  },

  saveTask(task: Task): void {
    const tasks = safeGetItem<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const index = tasks.findIndex((t) => t.id === task.id);
    let updated: Task[];
    if (index >= 0) {
      updated = [...tasks];
      updated[index] = task;
    } else {
      updated = [task, ...tasks];
    }
    safeSetItem(STORAGE_KEYS.TASKS, updated);
  },

  updateTaskStatus(taskId: string, status: TaskStatus, completionNote?: string, updatedBy?: string): void {
    const tasks = safeGetItem<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index >= 0) {
      const existing = tasks[index];
      const prevStatus = existing.status;
      const updatedTask: Task = {
        ...existing,
        status,
        completionNote: completionNote !== undefined ? completionNote : existing.completionNote,
        completedAt: status === 'Completed' ? new Date().toISOString() : undefined,
      };
      tasks[index] = updatedTask;
      safeSetItem(STORAGE_KEYS.TASKS, tasks);

      if (updatedBy) {
        this.addChangeHistory({
          id: `hist-${Date.now()}`,
          studentId: existing.studentId,
          timestamp: new Date().toISOString(),
          source: 'Task Update',
          fieldName: `Task: ${existing.title}`,
          previousValue: prevStatus,
          newValue: `${status}${completionNote ? ` (${completionNote})` : ''}`,
          decision: 'Updated',
          updatedBy,
        });
      }
    }
  },

  // Change History
  getChangeHistory(studentId?: string): ChangeHistoryEntry[] {
    const history = safeGetItem<ChangeHistoryEntry[]>(STORAGE_KEYS.CHANGE_HISTORY, []);
    if (!history || history.length === 0) {
      safeSetItem(STORAGE_KEYS.CHANGE_HISTORY, INITIAL_CHANGE_HISTORY);
      return studentId ? INITIAL_CHANGE_HISTORY.filter((h) => h.studentId === studentId) : INITIAL_CHANGE_HISTORY;
    }
    return studentId ? history.filter((h) => h.studentId === studentId) : history;
  },

  addChangeHistory(entry: ChangeHistoryEntry): void {
    const history = safeGetItem<ChangeHistoryEntry[]>(STORAGE_KEYS.CHANGE_HISTORY, INITIAL_CHANGE_HISTORY);
    safeSetItem(STORAGE_KEYS.CHANGE_HISTORY, [entry, ...history]);
  },

  // Aliases for convenience
  loadStudents(): Student[] {
    return this.getStudents();
  },
  loadMeetings(studentId?: string): Meeting[] {
    return this.getMeetings(studentId);
  },
  loadTasks(studentId?: string): Task[] {
    return this.getTasks(studentId);
  },
  loadChangeHistory(studentId?: string): ChangeHistoryEntry[] {
    return this.getChangeHistory(studentId);
  },
  resetToInitialSample(): void {
    this.resetToDefaults();
  },

  // Questions from student
  getQuestions(studentId?: string): StudentQuestion[] {
    const questions = safeGetItem<StudentQuestion[]>(STORAGE_KEYS.QUESTIONS, []);
    if (!questions || questions.length === 0) {
      safeSetItem(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
      return studentId ? INITIAL_QUESTIONS.filter((q) => q.studentId === studentId) : INITIAL_QUESTIONS;
    }
    return studentId ? questions.filter((q) => q.studentId === studentId) : questions;
  },

  addQuestion(question: StudentQuestion): void {
    const questions = safeGetItem<StudentQuestion[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    safeSetItem(STORAGE_KEYS.QUESTIONS, [question, ...questions]);
  },

  answerQuestion(questionId: string, reply: string): void {
    const questions = safeGetItem<StudentQuestion[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    const index = questions.findIndex((q) => q.id === questionId);
    if (index >= 0) {
      questions[index] = {
        ...questions[index],
        status: 'Addressed',
        advisorReply: reply,
      };
      safeSetItem(STORAGE_KEYS.QUESTIONS, questions);
    }
  },

  getSelectedStudentId(): string {
    return safeGetItem<string>(STORAGE_KEYS.SELECTED_STUDENT_ID, 'stu-1');
  },

  setSelectedStudentId(id: string): void {
    safeSetItem(STORAGE_KEYS.SELECTED_STUDENT_ID, id);
  },

  resetToDefaults(): void {
    safeSetItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    safeSetItem(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS);
    safeSetItem(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    safeSetItem(STORAGE_KEYS.CHANGE_HISTORY, INITIAL_CHANGE_HISTORY);
    safeSetItem(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    safeSetItem(STORAGE_KEYS.SELECTED_STUDENT_ID, 'stu-1');
  },
};
