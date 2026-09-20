import React, { useState, useMemo } from 'react';
import {
  Student,
  Meeting,
  Task,
  ChangeHistoryEntry,
  MeetingVisibility,
  MeetingType,
  SmartUpdateCandidate,
  TaskOwner,
  MissingInfoItem,
  SmartUpdateCategory,
} from '../../../types';
import {
  Calendar,
  Clock,
  Lock,
  Share2,
  Plus,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  Check,
  History,
  FileText,
  UserCheck,
  CheckSquare,
  ArrowRight,
  HelpCircle,
  Compass,
  GraduationCap,
  Award,
  DollarSign,
  Building2,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { VisibilityBadge } from '../../common/Badge';
import { extractSmartUpdatesFromNotes } from '../../../services/smartNoteExtractor';

interface AdvisorMeetingsTabProps {
  student: Student;
  meetings: Meeting[];
  tasks: Task[];
  history: ChangeHistoryEntry[];
  onSaveMeeting: (newMeeting: Meeting) => void;
  onCreateTask: (newTask: Task) => void;
  onApplySmartUpdates: (
    updatedStudent: Student,
    acceptedCandidates: SmartUpdateCandidate[],
    noteExcerpt: string
  ) => void;
  onNavigateTab?: (tab: 'overview' | 'profile' | 'meetings') => void;
  onSaveStudent?: (updatedStudent: Student, reason?: string) => void;
}

export const AdvisorMeetingsTab: React.FC<AdvisorMeetingsTabProps> = ({
  student,
  meetings,
  tasks,
  history,
  onSaveMeeting,
  onCreateTask,
  onApplySmartUpdates,
  onNavigateTab,
  onSaveStudent,
}) => {
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [filterVisibility, setFilterVisibility] = useState<'ALL' | MeetingVisibility>('ALL');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedMeetingDetail, setSelectedMeetingDetail] = useState<Meeting | null>(null);

  // New Meeting Form State
  const [meetingForm, setMeetingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '16:00 - 17:00 ICT',
    type: 'College List & Financial Planning' as MeetingType,
    participants: `${student.advisorName || 'Advisor'}, ${student.basic.name}`,
    discussionNotes: '',
    decisions: '',
    actionItems: '',
    studentPreparationNeeded: '',
    nextMeetingPlan: '',
    visibility: 'Share with Student' as MeetingVisibility,
  });

  // Optional direct follow-up task to create with meeting
  const [followUpTaskTitle, setFollowUpTaskTitle] = useState('');
  const [followUpTaskOwner, setFollowUpTaskOwner] = useState<TaskOwner>('Student');
  const [followUpTaskDueDate, setFollowUpTaskDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Suggested Updates Panel State
  const [suggestedCandidates, setSuggestedCandidates] = useState<SmartUpdateCandidate[]>([]);
  const [isSuggestedModalOpen, setIsSuggestedModalOpen] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [candidateEditValue, setCandidateEditValue] = useState<string>('');
  const [candidateEditTaskOwner, setCandidateEditTaskOwner] = useState<TaskOwner>('Student');
  const [candidateEditTaskDueDate, setCandidateEditTaskDueDate] = useState<string>('');
  const [currentMeetingContext, setCurrentMeetingContext] = useState<{ id: string; date: string; type: string } | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Live detection preview while advisor is typing notes
  const liveDetectedCount = useMemo(() => {
    if (!meetingForm.discussionNotes.trim() && !meetingForm.actionItems.trim() && !meetingForm.decisions.trim()) {
      return 0;
    }
    const preliminary = extractSmartUpdatesFromNotes(
      meetingForm.discussionNotes,
      meetingForm.decisions,
      meetingForm.actionItems,
      'temp-id',
      student,
      { date: meetingForm.date, type: meetingForm.type }
    );
    return preliminary.length;
  }, [meetingForm.discussionNotes, meetingForm.decisions, meetingForm.actionItems, meetingForm.date, meetingForm.type, student]);

  // Quick fill demo templates for testing Smart Note Update
  const handleQuickTemplate = (templateType: string) => {
    switch (templateType) {
      case 'sat':
        setMeetingForm((prev) => ({
          ...prev,
          discussionNotes:
            prev.discussionNotes +
            (prev.discussionNotes ? '\n' : '') +
            'Official test review: Student received their new digital SAT score. SAT score is 1480 (Math 780, Reading 700). Demonstrates readiness for competitive STEM programs.',
          decisions:
            prev.decisions +
            (prev.decisions ? '\n' : '') +
            'Lock 1480 SAT score as verified on student profile.',
        }));
        break;
      case 'major':
        setMeetingForm((prev) => ({
          ...prev,
          discussionNotes:
            prev.discussionNotes +
            (prev.discussionNotes ? '\n' : '') +
            'Student finalized their direction after summer research. Decided to focus on Computer Science & Artificial Intelligence as primary intended major.',
          decisions:
            prev.decisions +
            (prev.decisions ? '\n' : '') +
            'Update intended majors to prioritize Computer Science & AI.',
        }));
        break;
      case 'activity':
        setMeetingForm((prev) => ({
          ...prev,
          discussionNotes:
            prev.discussionNotes +
            (prev.discussionNotes ? '\n' : '') +
            'Extracurricular milestone: Student founded High School AI & Robotics Club with 25 members, serving as President for 5 hrs/week.',
          actionItems:
            prev.actionItems +
            (prev.actionItems ? '\n' : '') +
            'Student to document club competition schedule by next Friday.',
        }));
        break;
      case 'award':
        setMeetingForm((prev) => ({
          ...prev,
          discussionNotes:
            prev.discussionNotes +
            (prev.discussionNotes ? '\n' : '') +
            'Academic honors: Won First Prize in National High School Chemistry Olympiad (2025). Top 5 score nationwide.',
        }));
        break;
      case 'budget':
        setMeetingForm((prev) => ({
          ...prev,
          discussionNotes:
            prev.discussionNotes +
            (prev.discussionNotes ? '\n' : '') +
            'Financial strategy consultation with parents: Family confirmed a $45,000 annual budget in USD for tuition and living expenses.',
          decisions:
            prev.decisions +
            (prev.decisions ? '\n' : '') +
            'Calibrate college list to match $45k USD annual family contribution.',
        }));
        break;
      case 'college':
        setMeetingForm((prev) => ({
          ...prev,
          discussionNotes:
            prev.discussionNotes +
            (prev.discussionNotes ? '\n' : '') +
            'College list review: Agreed to add Swarthmore College and Williams College to the college strategy list as top liberal arts reach targets.',
        }));
        break;
      case 'deadline':
        setMeetingForm((prev) => ({
          ...prev,
          discussionNotes:
            prev.discussionNotes +
            (prev.discussionNotes ? '\n' : '') +
            'Deadlines confirmed: Early Decision deadline is November 1, 2026. All Common App essays and teacher recommendations must be finalized before this date.',
        }));
        break;
      case 'tasks':
        setMeetingForm((prev) => ({
          ...prev,
          actionItems:
            prev.actionItems +
            (prev.actionItems ? '\n' : '') +
            'Student to draft Why Bowdoin supplemental essay by next Friday.\nAdvisor to review common app activities list by Monday.',
        }));
        break;
      case 'tentative':
        setMeetingForm((prev) => ({
          ...prev,
          discussionNotes:
            prev.discussionNotes +
            (prev.discussionNotes ? '\n' : '') +
            'Student is considering majoring in Economics or Finance, still tentative and undecided pending discussion with parents. Family is also tentatively thinking about $40,000 budget.',
        }));
        break;
      case 'marketing_test':
        setMeetingForm((prev) => ({
          ...prev,
          discussionNotes:
            prev.discussionNotes +
            (prev.discussionNotes ? '\n' : '') +
            'Minh Anh is becoming more interested in Marketing, that her family confirmed a $35,000 annual budget including tuition and living expenses and that she will complete an SAT diagnostic before the next meeting.',
        }));
        break;
      case 'comprehensive':
        setMeetingForm((prev) => ({
          ...prev,
          discussionNotes:
            'Comprehensive Strategy Session: Student received official SAT score of 1480. Decided to focus on Computer Science & Data Science. Founded the High School AI & Robotics Club (President, 5 hrs/week). Won First Prize in National High School Chemistry Olympiad 2025. Family confirmed a $45,000 annual budget. Agreed to add Swarthmore College to the list. Early Decision deadline is November 1, 2026. Student is also considering Economics as a secondary minor.',
          decisions: 'Synchronize test score, intended major, budget, and college list additions.',
          actionItems:
            'Student to draft personal statement essay outline by next Friday.\nAdvisor to compile reach college financial aid profiles by Monday.',
        }));
        break;
    }
  };

  // Save Meeting & Trigger Smart Updates
  const handleSaveMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.discussionNotes.trim()) return;

    const newMeetingId = `meet-${Date.now()}`;
    const newMeeting: Meeting = {
      id: newMeetingId,
      studentId: student.id,
      date: meetingForm.date,
      time: meetingForm.time,
      type: meetingForm.type,
      participants: meetingForm.participants.split(',').map((p) => p.trim()).filter(Boolean),
      discussionNotes: meetingForm.discussionNotes,
      decisions: meetingForm.decisions,
      actionItems: meetingForm.actionItems,
      studentPreparationNeeded: meetingForm.studentPreparationNeeded,
      nextMeetingPlan: meetingForm.nextMeetingPlan,
      visibility: meetingForm.visibility,
      createdBy: student.advisorName || 'Advisor',
      createdAt: new Date().toISOString(),
    };

    // Save meeting to storage
    onSaveMeeting(newMeeting);

    // Optional follow-up task directly from meeting form
    if (followUpTaskTitle.trim()) {
      onCreateTask({
        id: `task-${Date.now()}`,
        studentId: student.id,
        title: followUpTaskTitle.trim(),
        description: `Generated from meeting on ${meetingForm.date}: ${meetingForm.type}`,
        owner: followUpTaskOwner,
        dueDate: followUpTaskDueDate,
        status: 'Not Started',
        createdAt: new Date().toISOString(),
      });
      setFollowUpTaskTitle('');
    }

    // Run Smart Note Update extraction with full parameters!
    const candidates = extractSmartUpdatesFromNotes(
      meetingForm.discussionNotes,
      meetingForm.decisions,
      meetingForm.actionItems,
      newMeetingId,
      student,
      { date: meetingForm.date, type: meetingForm.type }
    );

    setIsCreatingMeeting(false);
    setCurrentMeetingContext({
      id: newMeetingId,
      date: meetingForm.date,
      type: meetingForm.type,
    });

    if (candidates.length > 0) {
      setSuggestedCandidates(candidates);
      setIsSuggestedModalOpen(true);
      setSaveSuccessNotice(
        `Meeting note saved! ${candidates.length} structured update(s) detected. Review them below.`
      );
      setTimeout(() => setSaveSuccessNotice(null), 5000);
    } else {
      setSaveSuccessNotice('Meeting note recorded successfully! No new structured changes detected.');
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    }
  };

  // Helper to apply a candidate directly to the student record
  const applyCandidateToStudentRecord = (
    updatedStudent: Student,
    cand: SmartUpdateCandidate,
    customValue?: any
  ) => {
    const val = customValue !== undefined ? customValue : cand.proposedValue;

    if (cand.fieldKey === 'academics.satScore') {
      updatedStudent.academics.satScore = String(val);
      updatedStudent.academics.status = 'Advisor-Verified';
    } else if (cand.fieldKey === 'academics.actScore') {
      updatedStudent.academics.actScore = String(val);
      updatedStudent.academics.status = 'Advisor-Verified';
    } else if (cand.fieldKey === 'academics.ieltsScore') {
      updatedStudent.academics.ieltsScore = String(val);
      updatedStudent.academics.status = 'Advisor-Verified';
    } else if (cand.fieldKey === 'academics.toeflScore') {
      updatedStudent.academics.toeflScore = String(val);
      updatedStudent.academics.status = 'Advisor-Verified';
    } else if (cand.fieldKey === 'academics.gpa') {
      updatedStudent.academics.gpa = String(val);
      updatedStudent.academics.status = 'Advisor-Verified';
    } else if (cand.fieldKey === 'interests.possibleMajors') {
      if (Array.isArray(val)) {
        updatedStudent.interests.possibleMajors = val;
      } else {
        updatedStudent.interests.possibleMajors = [
          String(val),
          ...updatedStudent.interests.possibleMajors.filter(
            (m) => m.toLowerCase() !== String(val).toLowerCase()
          ),
        ];
      }
      updatedStudent.interests.status = 'Advisor-Verified';
    } else if (cand.fieldKey === 'financials.estimatedAnnualBudgetUsd') {
      const num = typeof val === 'number' ? val : parseInt(String(val).replace(/[^0-9]/g, ''), 10);
      if (!isNaN(num)) {
        updatedStudent.financials.estimatedAnnualBudgetUsd = num;
        updatedStudent.financials.status = 'Advisor-Verified';
      }
    } else if (cand.fieldKey === 'activities.extracurriculars') {
      if (typeof val === 'object' && val.title) {
        updatedStudent.activities.extracurriculars = [
          val,
          ...updatedStudent.activities.extracurriculars,
        ];
        updatedStudent.activities.status = 'Advisor-Verified';
      }
    } else if (cand.fieldKey === 'activities.awards') {
      if (typeof val === 'object' && val.title) {
        updatedStudent.activities.awards = [val, ...updatedStudent.activities.awards];
        updatedStudent.activities.status = 'Advisor-Verified';
      }
    } else if (cand.fieldKey === 'collegePreferences.consideredColleges') {
      if (typeof val === 'object' && val.name) {
        const alreadyIn = updatedStudent.collegePreferences.consideredColleges.some(
          (c) => c.name.toLowerCase() === val.name.toLowerCase()
        );
        if (!alreadyIn) {
          updatedStudent.collegePreferences.consideredColleges = [
            ...updatedStudent.collegePreferences.consideredColleges,
            val,
          ];
          updatedStudent.collegePreferences.status = 'Advisor-Verified';
        }
      }
    } else if (cand.fieldKey === 'nextMilestone') {
      updatedStudent.nextMilestone = String(val);
    } else if (cand.fieldKey === 'advisingStage') {
      updatedStudent.advisingStage = val as any;
    }
  };

  // ACCEPT a single candidate immediately
  const handleAcceptSingle = (candidateId: string) => {
    const cand = suggestedCandidates.find((c) => c.id === candidateId);
    if (!cand) return;

    let updatedStudent: Student = JSON.parse(JSON.stringify(student));

    if (cand.category !== 'task') {
      applyCandidateToStudentRecord(updatedStudent, cand);
    }

    const updatedCand: SmartUpdateCandidate = {
      ...cand,
      status: 'Accepted',
      decidedAt: new Date().toISOString(),
    };

    setSuggestedCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? updatedCand : c))
    );

    onApplySmartUpdates(updatedStudent, [updatedCand], cand.originalNoteQuote);

    setSaveSuccessNotice(
      cand.category === 'task'
        ? `Saved action task to student record & refreshed Overview tab!`
        : `Synchronized "${cand.displayField}" to record! Overview tab refreshed.`
    );
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  // ADD TO CLARIFICATION QUEUE (For uncertain/tentative information)
  const handleQueueClarification = (candidateId: string) => {
    const cand = suggestedCandidates.find((c) => c.id === candidateId);
    if (!cand) return;

    let updatedStudent: Student = JSON.parse(JSON.stringify(student));
    const newMissingItem: MissingInfoItem = {
      id: `clarif-${Date.now()}`,
      field: cand.displayField.split('>').pop()?.trim() || cand.displayField,
      status: 'Needs Clarification',
      description: `From meeting note on ${cand.meetingDate || 'today'}: "${cand.originalNoteQuote}". ${cand.clarificationReason || 'Information is tentative or exploratory; requires student/family confirmation.'}`,
      section: cand.destinationSection || 'Advising Session',
    };

    updatedStudent.missingOrUnclearInfo = [
      newMissingItem,
      ...(updatedStudent.missingOrUnclearInfo || []),
    ];

    const updatedCand: SmartUpdateCandidate = {
      ...cand,
      status: 'ClarificationQueued',
      decidedAt: new Date().toISOString(),
    };

    setSuggestedCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? updatedCand : c))
    );

    onApplySmartUpdates(updatedStudent, [updatedCand], cand.originalNoteQuote);

    setSaveSuccessNotice(
      `Added "${newMissingItem.field}" to Clarification Queue! Visible on Overview tab under Missing/Unclear Info.`
    );
    setTimeout(() => setSaveSuccessNotice(null), 4500);
  };

  // REJECT a candidate
  const handleRejectCandidate = (candidateId: string) => {
    const cand = suggestedCandidates.find((c) => c.id === candidateId);
    if (!cand) return;

    const updatedCand: SmartUpdateCandidate = {
      ...cand,
      status: 'Rejected',
      decidedAt: new Date().toISOString(),
    };

    setSuggestedCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? updatedCand : c))
    );

    onApplySmartUpdates(student, [updatedCand], cand.originalNoteQuote);

    setSaveSuccessNotice(`Candidate rejected and logged to audit trail.`);
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  // START EDITING candidate
  const handleStartEdit = (cand: SmartUpdateCandidate) => {
    setEditingCandidateId(cand.id);
    setCandidateEditValue(
      typeof cand.proposedValue === 'object' && cand.proposedValue?.name
        ? cand.proposedValue.name
        : typeof cand.proposedValue === 'object' && cand.proposedValue?.title
        ? cand.proposedValue.title
        : Array.isArray(cand.proposedValue)
        ? cand.proposedValue[0] || ''
        : String(cand.proposedValue)
    );

    if (cand.category === 'task' && cand.taskDetails) {
      setCandidateEditTaskOwner(cand.taskDetails.owner);
      setCandidateEditTaskDueDate(cand.taskDetails.dueDate);
    }
  };

  // SAVE EDIT & ACCEPT candidate
  const handleSaveEditAndAccept = (candidateId: string) => {
    const cand = suggestedCandidates.find((c) => c.id === candidateId);
    if (!cand) return;

    let updatedStudent: Student = JSON.parse(JSON.stringify(student));

    const editedCand: SmartUpdateCandidate = {
      ...cand,
      status: 'EditedAndAccepted',
      advisorEditedValue: candidateEditValue,
      formattedProposedValue: `${candidateEditValue} (Advisor Modified)`,
      decidedAt: new Date().toISOString(),
      taskDetails:
        cand.category === 'task'
          ? {
              title: candidateEditValue.trim() || cand.taskDetails?.title || 'Action Task',
              description:
                cand.taskDetails?.description || `From meeting note: ${cand.originalNoteQuote}`,
              owner: candidateEditTaskOwner,
              dueDate:
                candidateEditTaskDueDate ||
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }
          : undefined,
    };

    if (cand.category !== 'task') {
      applyCandidateToStudentRecord(updatedStudent, cand, candidateEditValue);
    }

    setSuggestedCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? editedCand : c))
    );

    onApplySmartUpdates(updatedStudent, [editedCand], cand.originalNoteQuote);
    setEditingCandidateId(null);

    setSaveSuccessNotice(
      cand.category === 'task'
        ? `Saved edited action task to student record & refreshed Overview tab!`
        : `Saved & synchronized "${cand.displayField}" to student record!`
    );
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  // ACCEPT ALL VERIFIED (all non-tentative pending candidates)
  const handleAcceptAllVerified = () => {
    const pendingCandidates = suggestedCandidates.filter((c) => c.status === 'Pending');
    if (pendingCandidates.length === 0) return;

    let updatedStudent: Student = JSON.parse(JSON.stringify(student));
    const processedCandidates: SmartUpdateCandidate[] = [];

    pendingCandidates.forEach((cand) => {
      // If tentative, don't blindly overwrite; queue for clarification
      if (cand.isTentative) {
        const newMissingItem: MissingInfoItem = {
          id: `clarif-${Date.now()}-${cand.id}`,
          field: cand.displayField.split('>').pop()?.trim() || cand.displayField,
          status: 'Needs Clarification',
          description: `From meeting note: "${cand.originalNoteQuote}". ${cand.clarificationReason || 'Needs confirmation.'}`,
          section: cand.destinationSection || 'Advising Notes',
        };
        updatedStudent.missingOrUnclearInfo = [
          newMissingItem,
          ...(updatedStudent.missingOrUnclearInfo || []),
        ];
        processedCandidates.push({
          ...cand,
          status: 'ClarificationQueued',
          decidedAt: new Date().toISOString(),
        });
      } else if (cand.category === 'task' && cand.taskDetails) {
        processedCandidates.push({
          ...cand,
          status: 'Accepted',
          decidedAt: new Date().toISOString(),
        });
      } else {
        applyCandidateToStudentRecord(updatedStudent, cand);
        processedCandidates.push({
          ...cand,
          status: 'Accepted',
          decidedAt: new Date().toISOString(),
        });
      }
    });

    setSuggestedCandidates((prev) =>
      prev.map((item) => {
        const found = processedCandidates.find((pc) => pc.id === item.id);
        return found || item;
      })
    );

    onApplySmartUpdates(
      updatedStudent,
      processedCandidates,
      suggestedCandidates[0]?.originalNoteQuote || 'Meeting note extraction'
    );

    setSaveSuccessNotice(
      `All ${processedCandidates.length} suggested update(s) synchronized! Overview tab refreshed.`
    );
    setTimeout(() => setSaveSuccessNotice(null), 5000);
  };

  // Helper for Category badge icons
  const getCategoryBadge = (category: SmartUpdateCategory) => {
    switch (category) {
      case 'testScore':
        return {
          icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />,
          label: 'Test Score',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'major':
        return {
          icon: <Compass className="w-3.5 h-3.5 text-purple-600" />,
          label: 'Major Interest',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'activity':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Activity',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'award':
        return {
          icon: <Award className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Award / Honor',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'budget':
        return {
          icon: <DollarSign className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Budget Guidance',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'college':
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-blue-600" />,
          label: 'College Preference',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'deadline':
        return {
          icon: <Calendar className="w-3.5 h-3.5 text-rose-600" />,
          label: 'Deadline / Milestone',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'task':
        return {
          icon: <CheckSquare className="w-3.5 h-3.5 text-teal-600" />,
          label: 'Actionable Task',
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-slate-600" />,
          label: 'Profile Field',
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  const pendingCount = suggestedCandidates.filter((c) => c.status === 'Pending').length;
  const synchronizedCount = suggestedCandidates.filter(
    (c) => c.status === 'Accepted' || c.status === 'EditedAndAccepted' || c.status === 'ClarificationQueued'
  ).length;

  const studentMeetings = meetings.filter((m) => m.studentId === student.id);
  const filteredMeetings = studentMeetings.filter((m) => {
    if (filterVisibility === 'ALL') return true;
    return m.visibility === filterVisibility;
  });

  return (
    <div className="space-y-6" id="advisor-meetings-tab-content">
      {/* Save Toast */}
      {saveSuccessNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Top Controls: Action to add new meeting note + audit log toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Meetings & Advising Notes</h2>
          <p className="text-xs text-slate-500">
            Document strategy sessions, control student visibility, and leverage Smart Note extraction
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span>Audit Trail ({history.filter((h) => h.studentId === student.id).length})</span>
          </button>

          <button
            id="btn-new-meeting-note"
            onClick={() => setIsCreatingMeeting(true)}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Meeting Note</span>
          </button>
        </div>
      </div>

      {/* Persistent Suggested Updates Available Banner */}
      {suggestedCandidates.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 border-2 border-amber-400/80 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-sm">Suggested Updates Panel Ready</h3>
                {pendingCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-300">
                    {pendingCount} Pending Review
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px] border border-emerald-300">
                    ✓ All {synchronizedCount} Processed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Structured updates parsed from meeting notes (SAT, major, activity, award, budget, college, deadline, tasks).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSuggestedModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Review Suggested Updates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('overview')}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                title="View refreshed content on Overview tab"
              >
                <span>View Overview Tab</span>
                <ExternalLink className="w-3 h-3 text-indigo-600" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Smart Note Explanation Callout */}
      <div className="bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200/80 rounded-xl p-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <span>Smart Note Synchronization Active</span>
              <span className="text-[10px] font-semibold bg-white/80 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                Advisor in Complete Control
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              When you record meeting notes, the engine automatically extracts structured changes (such as{' '}
              <span className="font-semibold text-slate-800">“SAT score is 1480”</span>,{' '}
              <span className="font-semibold text-slate-800">“Decided to focus on Computer Science & AI”</span>,{' '}
              <span className="font-semibold text-slate-800">“Founded Robotics Club”</span>,{' '}
              <span className="font-semibold text-slate-800">“Won Chemistry Olympiad”</span>,{' '}
              <span className="font-semibold text-slate-800">“Family confirmed a $45,000 budget”</span>, or{' '}
              <span className="font-semibold text-slate-800">“Student to draft essay by Friday”</span>).
              Proposed changes are displayed in a diff panel where you can <strong>Accept</strong>, <strong>Edit & Accept</strong>, or <strong>Reject</strong> before updating the record.
            </p>
          </div>
        </div>
      </div>

      {/* NEW MEETING NOTE MODAL / FORM */}
      {isCreatingMeeting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">New Meeting Note & Session Log</h3>
                  <p className="text-xs text-slate-500">
                    Record strategy discussions and trigger automated structured update extraction
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatingMeeting(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Comprehensive Quick Demo Fill Templates */}
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-700 font-bold text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Quick Scenario Inserts (Test Extraction):
                </span>
                {liveDetectedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] animate-pulse">
                    ✨ {liveDetectedCount} structured update(s) detected in note!
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickTemplate('sat')}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-indigo-700 text-[11px] font-medium transition-colors"
                >
                  + SAT 1480 Score
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate('major')}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-purple-50 border border-slate-200 text-purple-700 text-[11px] font-medium transition-colors"
                >
                  + CS & AI Major
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate('activity')}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 text-emerald-700 text-[11px] font-medium transition-colors"
                >
                  + Founded Robotics Club
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate('award')}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 text-amber-800 text-[11px] font-medium transition-colors"
                >
                  + Chemistry Olympiad Award
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate('budget')}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 text-emerald-700 text-[11px] font-medium transition-colors"
                >
                  + $45k USD Budget
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate('college')}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-blue-700 text-[11px] font-medium transition-colors"
                >
                  + Swarthmore & Williams
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate('deadline')}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 text-rose-700 text-[11px] font-medium transition-colors"
                >
                  + ED Nov 1 Deadline
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate('tasks')}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-teal-50 border border-slate-200 text-teal-700 text-[11px] font-medium transition-colors"
                >
                  + Follow-Up Tasks
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate('tentative')}
                  className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold transition-colors"
                  title="Test tentative information labeled for clarification"
                >
                  + Tentative / Clarification
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate('marketing_test')}
                  className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[11px] font-bold transition-colors shadow-2xs"
                  title="Test: Marketing interest, $35k budget, and SAT diagnostic task"
                >
                  + Marketing & $35k Budget
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate('comprehensive')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors ml-auto shadow-2xs"
                >
                  ★ Full Consultation Note
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveMeetingSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Time & Timezone</label>
                  <input
                    type="text"
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Meeting Type</label>
                  <select
                    value={meetingForm.type}
                    onChange={(e) => setMeetingForm({ ...meetingForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="Initial Diagnostic">Initial Diagnostic</option>
                    <option value="Extracurricular & Profile Strategy">Extracurricular & Profile Strategy</option>
                    <option value="Testing Strategy">Testing Strategy</option>
                    <option value="College List & Financial Planning">College List & Financial Planning</option>
                    <option value="Common App & Personal Statement">Common App & Personal Statement</option>
                    <option value="Supplemental Essays Review">Supplemental Essays Review</option>
                    <option value="Visa & Pre-Departure">Visa & Pre-Departure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Participants</label>
                <input
                  type="text"
                  value={meetingForm.participants}
                  onChange={(e) => setMeetingForm({ ...meetingForm, participants: e.target.value })}
                  placeholder="e.g. Advisor Name, Student Name, Parent Name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-slate-700">
                    Discussion Notes <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Auto-scanned by Smart Note Engine
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="Record detailed notes here. Mention SAT scores, GPA, intended majors, activities, awards, budget, colleges, or deadlines to trigger automatic suggestions..."
                  value={meetingForm.discussionNotes}
                  onChange={(e) => setMeetingForm({ ...meetingForm, discussionNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Decisions Agreed Upon</label>
                  <textarea
                    rows={2}
                    placeholder="Key strategic decisions reached during this session"
                    value={meetingForm.decisions}
                    onChange={(e) => setMeetingForm({ ...meetingForm, decisions: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Action Items / Deliverables</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Student to draft Why Bowdoin essay by Friday; Advisor to review activity list by Monday"
                    value={meetingForm.actionItems}
                    onChange={(e) => setMeetingForm({ ...meetingForm, actionItems: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Student Preparation Needed</label>
                  <input
                    type="text"
                    placeholder="What the student should bring or prepare before next session"
                    value={meetingForm.studentPreparationNeeded}
                    onChange={(e) =>
                      setMeetingForm({ ...meetingForm, studentPreparationNeeded: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Next Meeting Plan</label>
                  <input
                    type="text"
                    placeholder="Proposed date and topic for next discussion"
                    value={meetingForm.nextMeetingPlan}
                    onChange={(e) => setMeetingForm({ ...meetingForm, nextMeetingPlan: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Privacy & Student Portal Isolation */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="block font-bold text-slate-800 mb-2">Privacy & Student Portal Isolation</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      meetingForm.visibility === 'Share with Student'
                        ? 'bg-teal-50/80 border-teal-300 text-teal-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="Share with Student"
                      checked={meetingForm.visibility === 'Share with Student'}
                      onChange={() => setMeetingForm({ ...meetingForm, visibility: 'Share with Student' })}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Share2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Share with Student</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                        Visible in Student Portal overview, past meetings & preparation needed
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      meetingForm.visibility === 'Advisor Only'
                        ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="Advisor Only"
                      checked={meetingForm.visibility === 'Advisor Only'}
                      onChange={() => setMeetingForm({ ...meetingForm, visibility: 'Advisor Only' })}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Lock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Advisor Only (Confidential)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                        Completely hidden from Student Portal (for parent finances or internal notes)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Direct Follow-Up Task Creator */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Create Follow-Up Task from Meeting (Optional)</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Task title (e.g. Complete draft of Why Bowdoin essay)"
                      value={followUpTaskTitle}
                      onChange={(e) => setFollowUpTaskTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    />
                  </div>
                  <div>
                    <select
                      value={followUpTaskOwner}
                      onChange={(e) => setFollowUpTaskOwner(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                    >
                      <option value="Student">Assign to Student</option>
                      <option value="Advisor">Assign to Advisor</option>
                      <option value="Parent">Assign to Parent</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingMeeting(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Save Note & Launch Smart Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUGGESTED UPDATES PANEL / MODAL */}
      {isSuggestedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Suggested Profile Updates</h3>
                  <p className="text-xs text-slate-500">
                    Smart Note Update extracted structured information from your meeting notes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSuggestedModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 my-3 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Review and Authorize Profile Changes:</p>
                <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
                  Information is not automatically applied to the official record. Use <strong>Accept</strong>,{' '}
                  <strong>Edit & Accept</strong>, or <strong>Reject</strong> for each proposed item. Tentative or conflicting data is clearly flagged for your clarification.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs">
              {suggestedCandidates.map((candidate) => {
                const isEditingThis = editingCandidateId === candidate.id;
                const catInfo = getCategoryBadge(candidate.category);

                return (
                  <div
                    key={candidate.id}
                    className={`rounded-xl border p-4 transition-all ${
                      candidate.status === 'Accepted' || candidate.status === 'EditedAndAccepted'
                        ? 'bg-emerald-50/40 border-emerald-300'
                        : candidate.status === 'ClarificationQueued'
                        ? 'bg-blue-50/40 border-blue-300'
                        : candidate.status === 'Rejected'
                        ? 'bg-slate-100/70 border-slate-300 opacity-60'
                        : candidate.isTentative
                        ? 'bg-amber-50/50 border-amber-300'
                        : candidate.hasConflict
                        ? 'bg-rose-50/40 border-rose-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Header: Target Field & Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border flex items-center gap-1 ${catInfo.bg}`}>
                          {catInfo.icon}
                          <span>{catInfo.label}</span>
                        </span>
                        <span className="font-bold text-slate-900 text-xs">{candidate.displayField}</span>
                      </div>

                      {/* Status Badges */}
                      {candidate.status === 'Accepted' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Synchronized to Record</span>
                        </span>
                      )}
                      {candidate.status === 'EditedAndAccepted' && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[11px] flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Edited & Synchronized</span>
                        </span>
                      )}
                      {candidate.status === 'ClarificationQueued' && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          <span>Added to Clarification Queue</span>
                        </span>
                      )}
                      {candidate.status === 'Rejected' && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold text-[11px]">
                          Rejected
                        </span>
                      )}
                      {candidate.status === 'Pending' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold text-[11px]">
                          Pending Review
                        </span>
                      )}
                    </div>

                    {/* Source Note Excerpt */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 mb-2.5 text-[11px] text-slate-700 italic">
                      <span className="font-semibold text-slate-500 not-italic block text-[10px] uppercase tracking-wider mb-0.5">
                        Source Note Excerpt:
                      </span>
                      &ldquo;{candidate.originalNoteQuote}&rdquo;
                    </div>

                    {/* Tentative Information Banner */}
                    {candidate.isTentative && candidate.status === 'Pending' && (
                      <div className="mb-2.5 p-2.5 rounded-lg bg-amber-100/90 text-amber-900 border border-amber-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[11px] block">⚠️ Labeled for Clarification (Uncertain / Exploratory):</span>
                          <p className="text-[11px] leading-snug mt-0.5">
                            {candidate.clarificationReason || 'Expressed tentatively in the discussion. Recommended to place in the Clarification Queue on the Overview tab instead of prematurely overwriting the confirmed record.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Information Conflict Banner */}
                    {candidate.hasConflict && candidate.status === 'Pending' && !candidate.isTentative && (
                      <div className="mb-2.5 p-2.5 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[11px] block">⚠️ Information Conflict Detected:</span>
                          <p className="text-[11px] leading-snug mt-0.5">{candidate.conflictReason}</p>
                        </div>
                      </div>
                    )}

                    {/* Diff: Current Record vs Proposed Value */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-white border border-slate-200 text-xs mb-3">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">
                          Current Record Value
                        </span>
                        <span className="font-semibold text-slate-700 mt-0.5 block">
                          {candidate.formattedCurrentValue || 'None recorded'}
                        </span>
                      </div>

                      <div>
                        <span className="text-indigo-600 block text-[10px] uppercase font-semibold tracking-wider">
                          Proposed New Value
                        </span>
                        {isEditingThis ? (
                          <div className="space-y-2 mt-1">
                            <input
                              type="text"
                              value={candidateEditValue}
                              onChange={(e) => setCandidateEditValue(e.target.value)}
                              className="px-2.5 py-1.5 rounded border border-indigo-300 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full font-medium"
                              placeholder="Edit proposed value..."
                            />

                            {candidate.category === 'task' && (
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-500 font-semibold block">Assignee</label>
                                  <select
                                    value={candidateEditTaskOwner}
                                    onChange={(e) => setCandidateEditTaskOwner(e.target.value as any)}
                                    className="w-full px-2 py-1 rounded border border-slate-200 text-xs bg-white"
                                  >
                                    <option value="Student">Student</option>
                                    <option value="Advisor">Advisor</option>
                                    <option value="Parent">Parent</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-500 font-semibold block">Due Date</label>
                                  <input
                                    type="date"
                                    value={candidateEditTaskDueDate}
                                    onChange={(e) => setCandidateEditTaskDueDate(e.target.value)}
                                    className="w-full px-2 py-1 rounded border border-slate-200 text-xs bg-white"
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleSaveEditAndAccept(candidate.id)}
                                className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold"
                              >
                                Save & Synchronize
                              </button>
                              <button
                                onClick={() => setEditingCandidateId(null)}
                                className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-0.5">
                            <span className="font-bold text-indigo-900 block">
                              {candidate.formattedProposedValue}
                            </span>
                            {candidate.category === 'task' && candidate.taskDetails && (
                              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                                <span>Assignee: <strong>{candidate.taskDetails.owner}</strong></span>
                                <span>&bull;</span>
                                <span>Due: <strong>{candidate.taskDetails.dueDate}</strong></span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Controls for Candidate */}
                    {candidate.status === 'Pending' && !isEditingThis && (
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleRejectCandidate(candidate.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleStartEdit(candidate)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit & Accept</span>
                        </button>

                        {/* If candidate is tentative, provide explicit Clarification Queue button */}
                        {candidate.isTentative ? (
                          <>
                            <button
                              onClick={() => handleQueueClarification(candidate.id)}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 transition-colors flex items-center gap-1"
                            >
                              <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                              <span>Add to Clarification Queue</span>
                            </button>

                            <button
                              onClick={() => handleAcceptSingle(candidate.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1"
                              title="Override tentativeness and confirm as official"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirm as Official</span>
                            </button>
                          </>
                        ) : candidate.category === 'task' ? (
                          <button
                            onClick={() => handleAcceptSingle(candidate.id)}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>Save Action Task</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAcceptSingle(candidate.id)}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept & Synchronize</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer with Batch Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                <strong>{synchronizedCount}</strong> of <strong>{suggestedCandidates.length}</strong> updates processed.
                {pendingCount > 0 && ` (${pendingCount} pending review)`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSuggestedModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Close Panel
                </button>

                {pendingCount > 0 && (
                  <button
                    onClick={handleAcceptAllVerified}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept All Verified ({pendingCount})</span>
                  </button>
                )}

                {onNavigateTab && (
                  <button
                    onClick={() => {
                      setIsSuggestedModalOpen(false);
                      onNavigateTab('overview');
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>View Overview Tab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT TRAIL / CHANGE HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Student Record Change History & Provenance</h3>
                  <p className="text-xs text-slate-500">
                    Complete audit trail of meeting extractions, manual edits, and decisions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1 text-xs">
              {history.filter((h) => h.studentId === student.id).length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center italic">No change history logged yet.</p>
              ) : (
                history
                  .filter((h) => h.studentId === student.id)
                  .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                  .map((entry) => (
                    <div key={entry.id} className="p-3 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-slate-900 text-xs">{entry.fieldName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            entry.decision === 'Accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : entry.decision === 'Edited & Accepted'
                              ? 'bg-indigo-100 text-indigo-800'
                              : entry.decision === 'Clarification Queued'
                              ? 'bg-blue-100 text-blue-800'
                              : entry.decision === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {entry.decision}
                        </span>
                      </div>

                      {entry.meetingDate && entry.meetingType && (
                        <div className="text-[11px] font-medium text-indigo-700 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-500" />
                          <span>Caused by meeting on {entry.meetingDate} ({entry.meetingType})</span>
                        </div>
                      )}

                      {entry.originalNote && (
                        <div className="p-2 rounded bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 italic mb-2">
                          &ldquo;{entry.originalNote}&rdquo;
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 p-2 rounded bg-slate-50 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Previous Value:</span>
                          <span className="text-slate-700 font-medium">{entry.previousValue || 'None'}</span>
                        </div>
                        <div>
                          <span className="text-indigo-600 block text-[10px]">New Value:</span>
                          <span className="text-indigo-900 font-bold">{entry.newValue}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                        <span>Updated by: {entry.updatedBy}</span>
                        <span>{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEETINGS LIST */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Visibility Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Filter Visibility:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterVisibility('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterVisibility === 'ALL'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({studentMeetings.length})
              </button>
              <button
                onClick={() => setFilterVisibility('Share with Student')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterVisibility === 'Share with Student'
                    ? 'bg-teal-700 text-white font-semibold'
                    : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                }`}
              >
                Shared ({studentMeetings.filter((m) => m.visibility === 'Share with Student').length})
              </button>
              <button
                onClick={() => setFilterVisibility('Advisor Only')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterVisibility === 'Advisor Only'
                    ? 'bg-indigo-700 text-white font-semibold'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                Advisor Only ({studentMeetings.filter((m) => m.visibility === 'Advisor Only').length})
              </button>
            </div>
          </div>

          <span className="text-xs text-slate-400">
            {filteredMeetings.length} of {studentMeetings.length} meeting logs
          </span>
        </div>

        {/* Meeting Cards */}
        {filteredMeetings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No meeting notes recorded</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Record Meeting Note&quot; to log advising discussions and trigger smart updates.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMeetings.map((meeting) => (
              <div key={meeting.id} className="p-5 hover:bg-slate-50/50 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{meeting.type}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {meeting.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {meeting.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <VisibilityBadge visibility={meeting.visibility} />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Participants:
                  </span>
                  <p className="text-xs text-slate-700 font-medium">{meeting.participants.join(', ')}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">Discussion Notes:</span>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{meeting.discussionNotes}</p>
                </div>

                {meeting.decisions && (
                  <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-xs text-indigo-900">
                    <span className="font-bold block mb-1">Decisions Agreed Upon:</span>
                    <p className="leading-relaxed whitespace-pre-wrap">{meeting.decisions}</p>
                  </div>
                )}

                {meeting.actionItems && (
                  <div className="bg-teal-50/50 p-3 rounded-lg border border-teal-100 text-xs text-teal-900">
                    <span className="font-bold block mb-1">Action Items / Deliverables:</span>
                    <p className="leading-relaxed whitespace-pre-wrap">{meeting.actionItems}</p>
                  </div>
                )}

                {meeting.studentPreparationNeeded && (
                  <div className="text-xs text-amber-800 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                    <strong>Preparation Needed:</strong> {meeting.studentPreparationNeeded}
                  </div>
                )}

                {meeting.nextMeetingPlan && (
                  <div className="text-xs text-slate-600">
                    <strong>Next Meeting:</strong> {meeting.nextMeetingPlan}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
