import React from 'react';
import {
  FieldStatus,
  AdvisingStatus,
  AdvisingStage,
  MeetingVisibility,
  TaskStatus,
} from '../../types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Lock,
  Share2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface StatusBadgeProps {
  status: FieldStatus;
  size?: 'sm' | 'md';
}

export const FieldStatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  switch (status) {
    case 'Advisor-Verified':
      return (
        <span
          id="badge-advisor-verified"
          className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
          title="Verified by Education Advisor"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Advisor-Verified</span>
        </span>
      );
    case 'Student-Submitted':
      return (
        <span
          id="badge-student-submitted"
          className={`inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
          title="Submitted by Student (Pending formal advisor review)"
        >
          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Student-Submitted</span>
        </span>
      );
    case 'Needs Clarification':
      return (
        <span
          id="badge-needs-clarification"
          className={`inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}
          title="Additional explanation or documentation needed"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Needs Clarification</span>
        </span>
      );
    case 'Missing':
      return (
        <span
          id="badge-missing"
          className={`inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}
          title="Important information missing"
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Missing</span>
        </span>
      );
    default:
      return null;
  }
};

export const AdvisingStatusBadge: React.FC<{ status: AdvisingStatus }> = ({ status }) => {
  switch (status) {
    case 'On Track':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs px-2.5 py-0.5 font-medium border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          {status}
        </span>
      );
    case 'Active':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100/70 text-blue-800 text-xs px-2.5 py-0.5 font-medium border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          {status}
        </span>
      );
    case 'Needs Attention':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/70 text-amber-800 text-xs px-2.5 py-0.5 font-medium border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
          {status}
        </span>
      );
    case 'At Risk':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100/70 text-rose-800 text-xs px-2.5 py-0.5 font-medium border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
          {status}
        </span>
      );
  }
};

export const StageBadge: React.FC<{ stage: AdvisingStage }> = ({ stage }) => {
  const getColors = () => {
    switch (stage) {
      case 'Early Exploration':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Profile Building & Testing':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'College List & Strategy':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Application & Essays':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Decision & Visa':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-md border text-xs px-2.5 py-1 font-medium ${getColors()}`}>
      {stage}
    </span>
  );
};

export const VisibilityBadge: React.FC<{ visibility: MeetingVisibility }> = ({ visibility }) => {
  if (visibility === 'Advisor Only') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-xs px-2.5 py-0.5 font-medium">
        <Lock className="w-3 h-3 text-slate-500" />
        Advisor Only (Private)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs px-2.5 py-0.5 font-medium">
      <Share2 className="w-3 h-3 text-teal-600" />
      Shared with Student
    </span>
  );
};

export const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  switch (status) {
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Completed
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          In Progress
        </span>
      );
    case 'Not Started':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs px-2.5 py-0.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Not Started
        </span>
      );
  }
};

export const CollegeCategoryBadge: React.FC<{ category: 'Reach' | 'Target' | 'Safety' }> = ({ category }) => {
  switch (category) {
    case 'Reach':
      return (
        <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Reach
        </span>
      );
    case 'Target':
      return (
        <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Target
        </span>
      );
    case 'Safety':
      return (
        <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Safety
        </span>
      );
  }
};
