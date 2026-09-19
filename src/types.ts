export type AdvisingStage =
  | 'Early Exploration'
  | 'Profile Building & Testing'
  | 'College List & Strategy'
  | 'Application & Essays'
  | 'Decision & Visa';

export type AdvisingStatus = 'Active' | 'Needs Attention' | 'On Track' | 'At Risk';

export type FieldStatus =
  | 'Student-Submitted'
  | 'Advisor-Verified'
  | 'Missing'
  | 'Needs Clarification';

export interface MissingInfoItem {
  id: string;
  field: string;
  section: string;
  description: string;
  status: 'Missing' | 'Needs Clarification';
}

export interface ExtracurricularItem {
  id: string;
  title: string;
  role: string;
  organization: string;
  hoursPerWeek: string;
  weeksPerYear?: string;
  description: string;
  status: FieldStatus;
}

export interface AwardItem {
  id: string;
  title: string;
  level: 'School' | 'City/Province' | 'National' | 'International';
  year: string;
  description: string;
  status: FieldStatus;
}

export interface ProjectItem {
  id: string;
  name: string;
  type: string;
  impact: string;
}

export interface ConsideredCollege {
  id: string;
  name: string;
  category: 'Reach' | 'Target' | 'Safety';
  notes: string;
  financialFit?: string;
  location?: string;
}

export interface StudentInterests {
  passions: string;
  academicInterests: string[];
  possibleMajors: string[];
  careerInterests: string;
  levelOfCertainty: 'Exploring' | 'Moderate' | 'Very Decided';
  status: FieldStatus;
}

export interface StudentAcademics {
  gpa: string; // e.g. "9.3 / 10.0"
  gradingSystem: 'Vietnamese 10-point scale' | 'US 4.0 scale' | 'IB 45' | 'A-Levels';
  strongestSubjects: string[];
  coursework: string;
  ieltsScore?: string;
  toeflScore?: string;
  satScore?: string;
  actScore?: string;
  testingPlans: string;
  status: FieldStatus;
}

export interface StudentActivities {
  extracurriculars: ExtracurricularItem[];
  awards: AwardItem[];
  projects: ProjectItem[];
  summerActivities: string;
  status: FieldStatus;
}

export interface StudentFinancials {
  estimatedAnnualBudgetUsd: number;
  aidExpectation:
    | 'Need-Blind Target only'
    | 'Significant Need-Based Aid Needed'
    | 'Partial Merit / Budget Sensitive'
    | 'Full Pay / Self-Funded';
  relevantConstraints: string;
  familyNotes: string; // Advisor internal note
  status: FieldStatus;
}

export interface StudentCollegePreferences {
  preferredLocations: string[];
  institutionTypes: string[];
  consideredColleges: ConsideredCollege[];
  campusPreferences: string;
  status: FieldStatus;
}

export interface StudentBasicInfo {
  name: string;
  preferredName: string;
  grade: 'Grade 10' | 'Grade 11' | 'Grade 12' | 'Gap Year';
  school: string;
  city: string;
  graduationYear: number;
  expectedUsEnrollmentYear: number;
  email: string;
  phone: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  photoUrl: string;
  status: FieldStatus;
}

export interface Student {
  id: string;
  basic: StudentBasicInfo;
  advisorId: string;
  advisorName: string;
  advisingStatus: AdvisingStatus;
  advisingStage: AdvisingStage;
  nextMilestone: string;
  currentPriorities: string[];
  missingOrUnclearInfo: MissingInfoItem[];
  interests: StudentInterests;
  academics: StudentAcademics;
  activities: StudentActivities;
  financials: StudentFinancials;
  collegePreferences: StudentCollegePreferences;
  questionsForAdvisor?: string[];
  // Advisor internal assessment - NEVER shown to students
  advisorInternalNotes?: string;
  advisorAssessmentRating?: 'High Potential' | 'Solid Applicant' | 'Needs Major Improvement';
}

export type TaskOwner = 'Advisor' | 'Student' | 'Parent';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  studentId: string;
  title: string;
  description: string;
  owner: TaskOwner;
  dueDate: string;
  status: TaskStatus;
  completionNote?: string;
  createdAt: string;
  completedAt?: string;
}

export type MeetingVisibility = 'Advisor Only' | 'Share with Student';
export type MeetingType =
  | 'Initial Diagnostic'
  | 'Extracurricular & Profile Strategy'
  | 'Testing Strategy'
  | 'College List & Financial Planning'
  | 'Common App & Personal Statement'
  | 'Supplemental Essays Review'
  | 'Visa & Pre-Departure';

export interface Meeting {
  id: string;
  studentId: string;
  date: string;
  time: string;
  type: MeetingType;
  participants: string[];
  discussionNotes: string;
  decisions: string;
  actionItems: string;
  studentPreparationNeeded?: string;
  nextMeetingPlan?: string;
  visibility: MeetingVisibility;
  createdBy: string;
  createdAt: string;
}

export interface StudentQuestion {
  id: string;
  studentId: string;
  question: string;
  createdAt: string;
  status: 'Open' | 'Addressed';
  advisorReply?: string;
}

export interface SmartUpdateCandidate {
  id: string;
  meetingId: string;
  fieldKey: string;
  displayField: string;
  originalNoteQuote: string;
  proposedValue: any;
  formattedProposedValue: string;
  currentValue: any;
  formattedCurrentValue: string;
  hasConflict: boolean;
  conflictReason?: string;
  status: 'Pending' | 'Accepted' | 'EditedAndAccepted' | 'Rejected';
  advisorEditedValue?: any;
  decidedAt?: string;
}

export interface ChangeHistoryEntry {
  id: string;
  studentId: string;
  timestamp: string;
  source: 'Meeting Note Smart Extraction' | 'Advisor Manual Edit' | 'Student Submission' | 'Task Update';
  originalNote?: string;
  fieldName: string;
  previousValue: string;
  newValue: string;
  decision: 'Accepted' | 'Edited & Accepted' | 'Rejected' | 'Updated' | 'Completed';
  updatedBy: string;
}

export type ActivePortal = 'landing' | 'advisor' | 'student';
export type AdvisorTab = 'overview' | 'profile' | 'meetings';
export type StudentTab = 'overview' | 'profile' | 'tasks';
