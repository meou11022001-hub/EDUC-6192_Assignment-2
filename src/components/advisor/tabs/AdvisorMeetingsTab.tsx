import React, { useState } from 'react';
import {
  Student,
  Meeting,
  Task,
  ChangeHistoryEntry,
  MeetingVisibility,
  MeetingType,
  SmartUpdateCandidate,
  TaskOwner,
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
}

export const AdvisorMeetingsTab: React.FC<AdvisorMeetingsTabProps> = ({
  student,
  meetings,
  tasks,
  history,
  onSaveMeeting,
  onCreateTask,
  onApplySmartUpdates,
}) => {
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [filterVisibility, setFilterVisibility] = useState<'ALL' | MeetingVisibility>('ALL');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // New Meeting Form State
  const [meetingForm, setMeetingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '16:00 - 17:00 ICT',
    type: 'College List & Financial Planning' as MeetingType,
    participants: `${student.advisorName}, ${student.basic.name}`,
    discussionNotes: '',
    decisions: '',
    actionItems: '',
    studentPreparationNeeded: '',
    nextMeetingPlan: '',
    visibility: 'Share with Student' as MeetingVisibility,
  });

  // Follow-up task to create directly with note
  const [followUpTaskTitle, setFollowUpTaskTitle] = useState('');
  const [followUpTaskOwner, setFollowUpTaskOwner] = useState<TaskOwner>('Student');
  const [followUpTaskDueDate, setFollowUpTaskDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Suggested Updates Modal State
  const [suggestedCandidates, setSuggestedCandidates] = useState<SmartUpdateCandidate[]>([]);
  const [isSuggestedModalOpen, setIsSuggestedModalOpen] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [candidateEditValue, setCandidateEditValue] = useState<string>('');
  const [currentMeetingIdPending, setCurrentMeetingIdPending] = useState<string>('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Quick fill demo templates for testing Smart Note Update
  const handleQuickTemplate = (templateType: 'sat' | 'budget' | 'major') => {
    if (templateType === 'sat') {
      setMeetingForm((prev) => ({
        ...prev,
        discussionNotes:
          prev.discussionNotes +
          (prev.discussionNotes ? '\n' : '') +
          'Discussed recent digital SAT results. SAT score is now 1450. Student showed strong improvement in reading questions and plans to maintain this score.',
        decisions:
          prev.decisions +
          (prev.decisions ? '\n' : '') +
          'Lock 1450 SAT score for early evaluation round.',
      }));
    } else if (templateType === 'budget') {
      setMeetingForm((prev) => ({
        ...prev,
        discussionNotes:
          prev.discussionNotes +
          (prev.discussionNotes ? '\n' : '') +
          'Financial planning consultation with parents. Family confirmed a $45,000 annual budget including housing and food for undergraduate tuition.',
        decisions:
          prev.decisions +
          (prev.decisions ? '\n' : '') +
          'Recalibrate college list to match $45k family contribution ceiling.',
      }));
    } else if (templateType === 'major') {
      setMeetingForm((prev) => ({
        ...prev,
        discussionNotes:
          prev.discussionNotes +
          (prev.discussionNotes ? '\n' : '') +
          'Career and academic direction check-in. Student decided to focus on Marketing and Public Policy instead of general business.',
        decisions:
          prev.decisions +
          (prev.decisions ? '\n' : '') +
          'Add Marketing & Strategic Communications portfolio projects to activity list.',
      }));
    }
  };

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
      createdBy: student.advisorName,
      createdAt: new Date().toISOString(),
    };

    // Save meeting to storage
    onSaveMeeting(newMeeting);

    // Optional follow-up task
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

    // Run Smart Note Update extraction
    const candidates = extractSmartUpdatesFromNotes(
      meetingForm.discussionNotes,
      meetingForm.decisions,
      newMeetingId,
      student
    );

    setIsCreatingMeeting(false);

    if (candidates.length > 0) {
      setSuggestedCandidates(candidates);
      setCurrentMeetingIdPending(newMeetingId);
      setIsSuggestedModalOpen(true);
    } else {
      setSaveSuccessNotice('Meeting note recorded successfully!');
      setTimeout(() => setSaveSuccessNotice(null), 3500);
    }
  };

  // Candidate Actions: Accept, Reject, Edit & Accept
  const handleAcceptCandidate = (candidateId: string) => {
    setSuggestedCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: 'Accepted' } : c))
    );
  };

  const handleRejectCandidate = (candidateId: string) => {
    setSuggestedCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: 'Rejected' } : c))
    );
  };

  const handleStartEditCandidate = (cand: SmartUpdateCandidate) => {
    setEditingCandidateId(cand.id);
    setCandidateEditValue(
      typeof cand.proposedValue === 'object'
        ? JSON.stringify(cand.proposedValue)
        : String(cand.proposedValue)
    );
  };

  const handleSaveEditCandidate = (candidateId: string) => {
    setSuggestedCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          return {
            ...c,
            status: 'EditedAndAccepted',
            advisorEditedValue: candidateEditValue,
            formattedProposedValue: `${candidateEditValue} (Advisor Modified)`,
          };
        }
        return c;
      })
    );
    setEditingCandidateId(null);
  };

  const handleApplyAllCandidates = () => {
    const accepted = suggestedCandidates.filter(
      (c) => c.status === 'Accepted' || c.status === 'EditedAndAccepted'
    );

    // Deep clone student to apply changes
    let updatedStudent: Student = JSON.parse(JSON.stringify(student));

    accepted.forEach((cand) => {
      const valToUse =
        cand.status === 'EditedAndAccepted' && cand.advisorEditedValue !== undefined
          ? cand.advisorEditedValue
          : cand.proposedValue;

      if (cand.fieldKey === 'academics.satScore') {
        updatedStudent.academics.satScore = String(valToUse);
        updatedStudent.academics.status = 'Advisor-Verified';
      } else if (cand.fieldKey === 'academics.ieltsScore') {
        updatedStudent.academics.ieltsScore = String(valToUse);
        updatedStudent.academics.status = 'Advisor-Verified';
      } else if (cand.fieldKey === 'financials.estimatedAnnualBudgetUsd') {
        updatedStudent.financials.estimatedAnnualBudgetUsd = Number(valToUse);
        updatedStudent.financials.status = 'Advisor-Verified';
      } else if (cand.fieldKey === 'interests.possibleMajors') {
        if (Array.isArray(valToUse)) {
          updatedStudent.interests.possibleMajors = valToUse;
        } else {
          updatedStudent.interests.possibleMajors = [
            String(valToUse),
            ...updatedStudent.interests.possibleMajors.filter((m) => m !== valToUse),
          ];
        }
        updatedStudent.interests.status = 'Advisor-Verified';
      } else if (cand.fieldKey === 'academics.gpa') {
        updatedStudent.academics.gpa = String(valToUse);
        updatedStudent.academics.status = 'Advisor-Verified';
      } else if (cand.fieldKey === 'collegePreferences.consideredColleges') {
        if (typeof valToUse === 'object' && valToUse.name) {
          updatedStudent.collegePreferences.consideredColleges = [
            ...updatedStudent.collegePreferences.consideredColleges,
            valToUse,
          ];
        }
      } else if (cand.fieldKey === 'advisingStage') {
        updatedStudent.advisingStage = valToUse as any;
      }
    });

    onApplySmartUpdates(
      updatedStudent,
      accepted,
      suggestedCandidates[0]?.originalNoteQuote || 'Meeting note extraction'
    );

    setIsSuggestedModalOpen(false);
    setSaveSuccessNotice(
      `Smart Note Update applied: ${accepted.length} field(s) synchronized to student profile!`
    );
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  const studentMeetings = meetings.filter((m) => m.studentId === student.id);
  const filteredMeetings = studentMeetings.filter((m) => {
    if (filterVisibility === 'ALL') return true;
    return m.visibility === filterVisibility;
  });

  return (
    <div className="space-y-6" id="advisor-meetings-tab-content">
      {/* Save Toast */}
      {saveSuccessNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-emerald-100 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs border border-emerald-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Top Controls: Action to add new meeting note + audit log toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Meetings & Advising Notes</h2>
          <p className="text-xs text-slate-500">
            Document strategy discussions, control student visibility, and leverage Smart Note extraction
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
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

      {/* Smart Note Explanation Callout */}
      <div className="bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200/80 rounded-xl p-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <span>Smart Note Update Engine Enabled</span>
              <span className="text-[10px] font-semibold bg-white/80 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                Zero Duplicate Entry
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              When you record meeting notes, the platform automatically parses structured items (such as{' '}
              <span className="font-semibold text-slate-800">“SAT score is now 1450”</span>,{' '}
              <span className="font-semibold text-slate-800">“Family confirmed a $45,000 annual budget”</span>, or{' '}
              <span className="font-semibold text-slate-800">“Student decided to focus on Marketing”</span>).
              You can review each suggested change in a proposed diff panel with conflict detection before committing to the student profile!
            </p>
          </div>
        </div>
      </div>

      {/* NEW MEETING MODAL / FORM */}
      {isCreatingMeeting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">New Meeting Note & Session Log</h3>
                  <p className="text-xs text-slate-500">Record discussion, decisions, and trigger smart updates</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatingMeeting(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            {/* Quick Demo Fill Templates */}
            <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium text-[11px]">Quick Demo Inserts:</span>
              <button
                type="button"
                onClick={() => handleQuickTemplate('sat')}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-indigo-700 text-[11px] font-medium"
              >
                + SAT 1450 Excerpt
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplate('budget')}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-emerald-700 text-[11px] font-medium"
              >
                + $45,000 Budget Excerpt
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplate('major')}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-sky-700 text-[11px] font-medium"
              >
                + Focus on Marketing Excerpt
              </button>
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
                  placeholder="e.g. Dr. Tran Bao Ngoc, Student Name, Parent Name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-slate-700">
                    Discussion Notes <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Auto-scanned by Smart Note Engine
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="Write detailed notes here. Mention SAT scores, budget numbers, intended majors, or colleges to trigger automatic suggestions..."
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
                    placeholder="Key strategic choices locked during this session"
                    value={meetingForm.decisions}
                    onChange={(e) => setMeetingForm({ ...meetingForm, decisions: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Action Items / Follow-ups</label>
                  <textarea
                    rows={2}
                    placeholder="Bullet points of immediate deliverables"
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
                    placeholder="What the student should bring or draft"
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
                    placeholder="Proposed date and topic"
                    value={meetingForm.nextMeetingPlan}
                    onChange={(e) => setMeetingForm({ ...meetingForm, nextMeetingPlan: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Private / Shared Control */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="block font-bold text-slate-800 mb-2">Privacy & Portal Visibility</span>
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
                        Visible in Student Portal overview, past meetings & preparation view
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
                      placeholder="Task description (e.g. Complete draft of Why Bowdoin essay)"
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
                  <span>Save Note & Check Smart Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMART NOTE SUGGESTED UPDATES PANEL / MODAL */}
      {isSuggestedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Suggested Profile Updates</h3>
                  <p className="text-xs text-slate-500">
                    Smart Note Update identified structured information in your meeting notes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSuggestedModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Review each proposed change below. You can <strong>Accept</strong>, <strong>Edit & Accept</strong>, or <strong>Reject</strong>.
              Only accepted updates will be synchronized to the Student Profile and Overview tab.
            </p>

            <div className="mt-4 space-y-4 text-xs">
              {suggestedCandidates.map((candidate) => {
                const isEditingThis = editingCandidateId === candidate.id;

                return (
                  <div
                    key={candidate.id}
                    className={`rounded-xl border p-4 transition-all ${
                      candidate.status === 'Accepted' || candidate.status === 'EditedAndAccepted'
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : candidate.status === 'Rejected'
                        ? 'bg-slate-100/60 border-slate-300 opacity-60'
                        : candidate.hasConflict
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Header: Target Field & Status */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        {candidate.displayField}
                      </span>

                      {candidate.status === 'Accepted' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                          &#10003; Accepted
                        </span>
                      )}
                      {candidate.status === 'EditedAndAccepted' && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold text-[11px]">
                          &#10003; Edited & Accepted
                        </span>
                      )}
                      {candidate.status === 'Rejected' && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold text-[11px]">
                          Rejected
                        </span>
                      )}
                      {candidate.status === 'Pending' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[11px]">
                          Pending Review
                        </span>
                      )}
                    </div>

                    {/* Original Note Excerpt */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 mb-2.5 text-[11px] text-slate-600 italic">
                      &ldquo;{candidate.originalNoteQuote}&rdquo;
                    </div>

                    {/* Conflict Warning */}
                    {candidate.hasConflict && candidate.status === 'Pending' && (
                      <div className="mb-2.5 p-2.5 rounded-lg bg-amber-100/80 text-amber-900 border border-amber-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[11px]">Information Conflict Detected:</span>
                          <p className="text-[11px] leading-snug mt-0.5">{candidate.conflictReason}</p>
                        </div>
                      </div>
                    )}

                    {/* Diff: Current vs Proposed */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 rounded-lg bg-white border border-slate-200 text-xs mb-3">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">
                          Current Record
                        </span>
                        <span className="font-semibold text-slate-700">
                          {candidate.formattedCurrentValue || 'None'}
                        </span>
                      </div>

                      <div>
                        <span className="text-indigo-600 block text-[10px] uppercase font-semibold tracking-wider">
                          Proposed New Value
                        </span>
                        {isEditingThis ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <input
                              type="text"
                              value={candidateEditValue}
                              onChange={(e) => setCandidateEditValue(e.target.value)}
                              className="px-2 py-1 rounded border border-indigo-300 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full"
                            />
                            <button
                              onClick={() => handleSaveEditCandidate(candidate.id)}
                              className="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold shrink-0"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <span className="font-bold text-indigo-900">
                            {candidate.formattedProposedValue}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Controls: Accept, Edit, Reject */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => handleRejectCandidate(candidate.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          candidate.status === 'Rejected'
                            ? 'bg-slate-200 text-slate-800'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => handleStartEditCandidate(candidate)}
                        className="px-3 py-1 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit & Accept</span>
                      </button>

                      <button
                        onClick={() => handleAcceptCandidate(candidate.id)}
                        className={`px-3.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                          candidate.status === 'Accepted'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {
                  suggestedCandidates.filter(
                    (c) => c.status === 'Accepted' || c.status === 'EditedAndAccepted'
                  ).length
                }{' '}
                of {suggestedCandidates.length} update(s) ready to synchronize
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSuggestedModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Dismiss Without Updating Profile
                </button>
                <button
                  onClick={handleApplyAllCandidates}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Commit Accepted Updates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT TRAIL / CHANGE HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Timestamped Change History & Audit Log</h3>
                  <p className="text-xs text-slate-500">Full provenance of meeting extractions, manual edits, and decisions</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1 text-xs">
              {history
                .filter((h) => h.studentId === student.id)
                .map((entry) => (
                  <div key={entry.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{entry.fieldName}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-600 mb-1.5">
                      <span className="font-medium bg-white px-2 py-0.5 rounded border border-slate-200">
                        {entry.source}
                      </span>
                      <span>&bull;</span>
                      <span className="text-indigo-600 font-semibold">{entry.decision}</span>
                      <span>&bull;</span>
                      <span>By: {entry.updatedBy}</span>
                    </div>

                    {entry.originalNote && (
                      <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100 mb-2">
                        &ldquo;{entry.originalNote}&rdquo;
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-200/60">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Previous Value:</span>
                        <span className="text-slate-600">{entry.previousValue || 'None'}</span>
                      </div>
                      <div>
                        <span className="text-indigo-600 block text-[10px] font-semibold">Saved Value:</span>
                        <span className="text-slate-900 font-semibold">{entry.newValue}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILTER BUTTONS & COUNT */}
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
          <button
            onClick={() => setFilterVisibility('ALL')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filterVisibility === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Sessions ({studentMeetings.length})
          </button>
          <button
            onClick={() => setFilterVisibility('Share with Student')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filterVisibility === 'Share with Student'
                ? 'bg-white text-teal-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Shared with Student (
            {studentMeetings.filter((m) => m.visibility === 'Share with Student').length}
            )
          </button>
          <button
            onClick={() => setFilterVisibility('Advisor Only')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filterVisibility === 'Advisor Only'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Advisor Only (
            {studentMeetings.filter((m) => m.visibility === 'Advisor Only').length}
            )
          </button>
        </div>
      </div>

      {/* MEETING HISTORY CARDS */}
      <div className="space-y-4 text-xs">
        {filteredMeetings.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-semibold">No meeting records found for this filter</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click &ldquo;Record Meeting Note&rdquo; above to document your first session.
            </p>
          </div>
        ) : (
          filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-colors ${
                meeting.visibility === 'Advisor Only'
                  ? 'border-indigo-200/80 bg-gradient-to-br from-white to-indigo-50/20'
                  : 'border-slate-200'
              }`}
            >
              {/* Meeting Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{meeting.type}</h3>
                    <VisibilityBadge visibility={meeting.visibility} />
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 mt-1 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {meeting.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {meeting.time}
                    </span>
                    <span>&bull;</span>
                    <span>Recorded by: {meeting.createdBy}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                    Participants
                  </span>
                  <span className="font-medium text-slate-700 text-xs">
                    {meeting.participants.join(', ')}
                  </span>
                </div>
              </div>

              {/* Discussion Notes */}
              <div className="mb-3">
                <span className="text-slate-400 block text-[11px] font-semibold mb-1 uppercase tracking-wider">
                  Discussion Notes
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                  {meeting.discussionNotes}
                </p>
              </div>

              {/* Decisions & Action Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {meeting.decisions && (
                  <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/70">
                    <span className="font-bold text-emerald-900 block text-[11px] mb-1">
                      Agreed Decisions
                    </span>
                    <p className="text-emerald-800 leading-relaxed">{meeting.decisions}</p>
                  </div>
                )}

                {meeting.actionItems && (
                  <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200/70">
                    <span className="font-bold text-blue-900 block text-[11px] mb-1">Action Items</span>
                    <p className="text-blue-800 leading-relaxed">{meeting.actionItems}</p>
                  </div>
                )}
              </div>

              {/* Student Preparation & Next Meeting */}
              {(meeting.studentPreparationNeeded || meeting.nextMeetingPlan) && (
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                  {meeting.studentPreparationNeeded && (
                    <div className="text-amber-800">
                      <strong>Student Preparation:</strong> {meeting.studentPreparationNeeded}
                    </div>
                  )}
                  {meeting.nextMeetingPlan && (
                    <div className="text-indigo-800">
                      <strong>Next Session Plan:</strong> {meeting.nextMeetingPlan}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
