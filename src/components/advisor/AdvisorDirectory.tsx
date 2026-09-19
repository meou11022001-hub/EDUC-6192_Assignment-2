import React, { useState, useMemo } from 'react';
import { Student, Task, Meeting, AdvisingStage, AdvisingStatus } from '../../types';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  UserPlus,
  Calendar,
  CheckSquare,
  Compass,
  GraduationCap,
  ExternalLink,
  X,
  AlertCircle,
} from 'lucide-react';
import { AdvisingStatusBadge, StageBadge } from '../common/Badge';

interface AdvisorDirectoryProps {
  students: Student[];
  tasks: Task[];
  meetings: Meeting[];
  onSelectStudent: (studentId: string) => void;
  onAddStudent: (newStudent: Student) => void;
}

export const AdvisorDirectory: React.FC<AdvisorDirectoryProps> = ({
  students,
  tasks,
  meetings,
  onSelectStudent,
  onAddStudent,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New student form state
  const [formData, setFormData] = useState({
    name: '',
    preferredName: '',
    grade: 'Grade 12' as Student['basic']['grade'],
    school: '',
    city: 'Hanoi',
    graduationYear: 2026,
    expectedUsEnrollmentYear: 2026,
    email: '',
    phone: '',
    parentName: '',
    parentEmail: '',
    possibleMajors: '',
    advisingStage: 'Early Exploration' as AdvisingStage,
    estimatedBudget: 40000,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        student.basic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.basic.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.interests.possibleMajors.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGrade = gradeFilter === 'ALL' || student.basic.grade === gradeFilter;
      const matchesYear = yearFilter === 'ALL' || student.basic.expectedUsEnrollmentYear.toString() === yearFilter;
      const matchesStage = stageFilter === 'ALL' || student.advisingStage === stageFilter;

      return matchesSearch && matchesGrade && matchesYear && matchesStage;
    });
  }, [students, searchQuery, gradeFilter, yearFilter, stageFilter]);

  // Helper to get next task for student
  const getNextTask = (studentId: string) => {
    const studentTasks = tasks.filter((t) => t.studentId === studentId && t.status !== 'Completed');
    if (studentTasks.length === 0) return null;
    return studentTasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  };

  // Helper to get next meeting for student
  const getNextMeeting = (studentId: string) => {
    const studentMeetings = meetings.filter((m) => m.studentId === studentId);
    if (studentMeetings.length === 0) return null;
    return studentMeetings.sort((a, b) => b.date.localeCompare(a.date))[0];
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.school.trim()) errors.school = 'School name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Valid student email required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newStudentId = `stu-${Date.now()}`;
    const majorsArray = formData.possibleMajors
      ? formData.possibleMajors.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Undeclared'];

    const newStudent: Student = {
      id: newStudentId,
      basic: {
        name: formData.name,
        preferredName: formData.preferredName || formData.name,
        grade: formData.grade,
        school: formData.school,
        city: formData.city,
        graduationYear: Number(formData.graduationYear),
        expectedUsEnrollmentYear: Number(formData.expectedUsEnrollmentYear),
        email: formData.email,
        phone: formData.phone || '+84 900 000 000',
        parentName: formData.parentName || 'Parent / Guardian',
        parentEmail: formData.parentEmail || '',
        parentPhone: '',
        photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
        status: 'Student-Submitted',
      },
      advisorId: 'adv-1',
      advisorName: 'Dr. Tran Bao Ngoc (Lead US Advisor)',
      advisingStatus: 'Active',
      advisingStage: formData.advisingStage,
      nextMilestone: 'Initial diagnostic strategy check-in and academic profile intake',
      currentPriorities: [
        'Complete academic transcript intake and verify grading system',
        'Establish standardized testing plan (SAT / IELTS)',
      ],
      missingOrUnclearInfo: [
        {
          id: `miss-${Date.now()}-1`,
          field: 'Official High School Transcript',
          section: 'Academics & Testing',
          description: 'Official English translated transcript needed from high school',
          status: 'Missing',
        },
      ],
      interests: {
        passions: 'Exploring academic passions',
        academicInterests: majorsArray,
        possibleMajors: majorsArray,
        careerInterests: 'To be explored during advising sessions',
        levelOfCertainty: 'Exploring',
        status: 'Student-Submitted',
      },
      academics: {
        gpa: 'To be recorded',
        gradingSystem: 'Vietnamese 10-point scale',
        strongestSubjects: [],
        coursework: 'Standard high school program',
        testingPlans: 'To be determined',
        status: 'Missing',
      },
      activities: {
        extracurriculars: [],
        awards: [],
        projects: [],
        summerActivities: '',
        status: 'Missing',
      },
      financials: {
        estimatedAnnualBudgetUsd: Number(formData.estimatedBudget),
        aidExpectation: 'Partial Merit / Budget Sensitive',
        relevantConstraints: `Family estimated annual capacity around $${Number(formData.estimatedBudget).toLocaleString()} USD`,
        familyNotes: 'New student intake; financial consultation scheduled.',
        status: 'Needs Clarification',
      },
      collegePreferences: {
        preferredLocations: ['US General'],
        institutionTypes: ['National Research University', 'Liberal Arts College (LAC)'],
        consideredColleges: [],
        campusPreferences: 'Open to recommendations',
        status: 'Missing',
      },
      advisorInternalNotes: 'Initial onboarding profile created.',
      advisorAssessmentRating: 'Solid Applicant',
    };

    onAddStudent(newStudent);
    setIsAddModalOpen(false);
    onSelectStudent(newStudentId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {filteredStudents.length} Students Assigned
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Education advising cohort &bull; Vietnamese high school students targeting U.S. universities
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="inline-flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              id="view-toggle-list"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List View</span>
            </button>
            <button
              id="view-toggle-card"
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'card'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Card View</span>
            </button>
          </div>

          {/* Add Student Button */}
          <button
            id="btn-add-student-modal"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative md:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="search-students-input"
            type="text"
            placeholder="Search by name, school, major..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Grade Filter */}
        <div>
          <select
            id="filter-grade-select"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            aria-label="Filter by Grade"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All Grades</option>
            <option value="Grade 10">Grade 10 (Class of 2028)</option>
            <option value="Grade 11">Grade 11 (Class of 2027)</option>
            <option value="Grade 12">Grade 12 (Class of 2026)</option>
            <option value="Gap Year">Gap Year</option>
          </select>
        </div>

        {/* Enrollment Year Filter */}
        <div>
          <select
            id="filter-year-select"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            aria-label="Filter by Enrollment Year"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All US Enrollment Years</option>
            <option value="2025">Fall 2025</option>
            <option value="2026">Fall 2026</option>
            <option value="2027">Fall 2027</option>
            <option value="2028">Fall 2028</option>
          </select>
        </div>

        {/* Advising Stage Filter */}
        <div>
          <select
            id="filter-stage-select"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            aria-label="Filter by Advising Stage"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All Advising Stages</option>
            <option value="Early Exploration">Early Exploration</option>
            <option value="Profile Building & Testing">Profile Building & Testing</option>
            <option value="College List & Strategy">College List & Strategy</option>
            <option value="Application & Essays">Application & Essays</option>
            <option value="Decision & Visa">Decision & Visa</option>
          </select>
        </div>
      </div>

      {/* Directory Content: List View or Card View */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No students match your filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or reset the stage/grade filters to see all assigned students.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setGradeFilter('ALL');
              setYearFilter('ALL');
              setStageFilter('ALL');
            }}
            className="mt-4 px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="students-list-table">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-3">Grade & School</th>
                  <th className="py-3.5 px-3">Expected U.S. Year</th>
                  <th className="py-3.5 px-3">Current Advising Stage</th>
                  <th className="py-3.5 px-3">Next Task</th>
                  <th className="py-3.5 px-3">Next Meeting</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((student) => {
                  const nextTask = getNextTask(student.id);
                  const nextMeeting = getNextMeeting(student.id);

                  return (
                    <tr
                      key={student.id}
                      id={`student-row-${student.id}`}
                      onClick={() => onSelectStudent(student.id)}
                      className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Name & Photo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.basic.photoUrl}
                            alt={student.basic.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {student.basic.name}
                            </div>
                            <div className="text-[11px] text-slate-500">{student.basic.preferredName}</div>
                          </div>
                        </div>
                      </td>

                      {/* Grade & School */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800">{student.basic.grade}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 max-w-[200px]" title={student.basic.school}>
                          {student.basic.school}
                        </div>
                      </td>

                      {/* Expected U.S. Enrollment Year */}
                      <td className="py-3.5 px-3 font-medium text-slate-700">
                        Fall {student.basic.expectedUsEnrollmentYear}
                      </td>

                      {/* Current Stage */}
                      <td className="py-3.5 px-3">
                        <StageBadge stage={student.advisingStage} />
                      </td>

                      {/* Next Task */}
                      <td className="py-3.5 px-3">
                        {nextTask ? (
                          <div className="max-w-[200px]">
                            <div className="font-medium text-slate-800 truncate" title={nextTask.title}>
                              {nextTask.title}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <span>Due {nextTask.dueDate}</span>
                              <span className="text-slate-300">&bull;</span>
                              <span className="font-medium text-indigo-600">{nextTask.owner}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No active tasks</span>
                        )}
                      </td>

                      {/* Next Meeting */}
                      <td className="py-3.5 px-3">
                        {nextMeeting ? (
                          <div className="max-w-[180px]">
                            <div className="font-medium text-slate-800 truncate" title={nextMeeting.type}>
                              {nextMeeting.type}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{nextMeeting.date}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No upcoming session</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-medium text-[11px] group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="students-card-grid">
          {filteredStudents.map((student) => {
            return (
              <div
                key={student.id}
                id={`student-card-${student.id}`}
                onClick={() => onSelectStudent(student.id)}
                className="bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all p-5 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Card Top: Photo, Name, Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.basic.photoUrl}
                        alt={student.basic.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">
                          {student.basic.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {student.basic.grade} &bull; {student.basic.city}
                        </p>
                      </div>
                    </div>
                    <AdvisingStatusBadge status={student.advisingStatus} />
                  </div>

                  {/* School */}
                  <div className="text-xs text-slate-600 mb-3 line-clamp-1 font-medium" title={student.basic.school}>
                    <GraduationCap className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                    {student.basic.school}
                  </div>

                  {/* Intended Academic Direction */}
                  <div className="bg-slate-50 rounded-lg p-2.5 mb-3 border border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Intended Direction
                    </div>
                    <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {student.interests.possibleMajors.join(', ') || 'Exploring'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      Budget: ${student.financials.estimatedAnnualBudgetUsd.toLocaleString()} USD/yr
                    </div>
                  </div>

                  {/* Stage & Milestone */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-slate-500 font-medium">Stage:</span>
                      <StageBadge stage={student.advisingStage} />
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 italic bg-amber-50/50 p-2 rounded border border-amber-100/60">
                      Milestone: {student.nextMilestone}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Enrolling: <strong>Fall {student.basic.expectedUsEnrollmentYear}</strong>
                  </span>
                  <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Workspace &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Add New Student Record</h3>
                  <p className="text-xs text-slate-500">Initialize a student record in the advising directory</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nguyen Hoang Nam"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {formErrors.name && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Preferred Name / English Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Hoang Nam (Henry)"
                    value={formData.preferredName}
                    onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    High School <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Le Hong Phong High School for the Gifted"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {formErrors.school && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.school}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="Hanoi">Hanoi</option>
                    <option value="Ho Chi Minh City">Ho Chi Minh City</option>
                    <option value="Da Nang">Da Nang</option>
                    <option value="Hai Phong">Hai Phong</option>
                    <option value="Can Tho">Can Tho</option>
                    <option value="Other">Other Province</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Current Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="Gap Year">Gap Year</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">HS Graduation Year</label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Expected US Enrollment</label>
                  <input
                    type="number"
                    value={formData.expectedUsEnrollmentYear}
                    onChange={(e) => setFormData({ ...formData, expectedUsEnrollmentYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Student Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {formErrors.email && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Student Phone / Zalo</label>
                  <input
                    type="tel"
                    placeholder="+84 912 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Initial Advising Stage</label>
                  <select
                    value={formData.advisingStage}
                    onChange={(e) => setFormData({ ...formData, advisingStage: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="Early Exploration">Early Exploration</option>
                    <option value="Profile Building & Testing">Profile Building & Testing</option>
                    <option value="College List & Strategy">College List & Strategy</option>
                    <option value="Application & Essays">Application & Essays</option>
                    <option value="Decision & Visa">Decision & Visa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Estimated Annual Budget (USD)</label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Possible Majors / Interests</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Economics, Applied Mathematics"
                  value={formData.possibleMajors}
                  onChange={(e) => setFormData({ ...formData, possibleMajors: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs transition-colors"
                >
                  Create & Open Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
