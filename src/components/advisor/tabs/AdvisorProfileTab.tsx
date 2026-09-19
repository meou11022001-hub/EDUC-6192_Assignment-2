import React, { useState } from 'react';
import {
  Student,
  FieldStatus,
  ExtracurricularItem,
  AwardItem,
  ConsideredCollege,
} from '../../../types';
import {
  User,
  Compass,
  GraduationCap,
  Award,
  DollarSign,
  Building2,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { FieldStatusBadge, CollegeCategoryBadge } from '../../common/Badge';

interface AdvisorProfileTabProps {
  student: Student;
  onSaveStudent: (updatedStudent: Student, logMessage?: string) => void;
}

export const AdvisorProfileTab: React.FC<AdvisorProfileTabProps> = ({
  student,
  onSaveStudent,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Student>(student);
  const [activeSection, setActiveSection] = useState<string>('all');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Sync if prop changes and not actively editing
  React.useEffect(() => {
    if (!isEditing) {
      setFormData(student);
    }
  }, [student, isEditing]);

  const handleSave = () => {
    onSaveStudent(formData, 'Advisor updated profile information');
    setIsEditing(false);
    setSaveToast('Profile information successfully saved and verified!');
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleCancel = () => {
    setFormData(student);
    setIsEditing(false);
  };

  // Helper to add college to list
  const handleAddCollege = () => {
    const newCollege: ConsideredCollege = {
      id: `col-${Date.now()}`,
      name: 'New College Name',
      category: 'Target',
      notes: 'Initial evaluation',
      financialFit: 'Needs Review',
      location: 'US',
    };
    setFormData({
      ...formData,
      collegePreferences: {
        ...formData.collegePreferences,
        consideredColleges: [...formData.collegePreferences.consideredColleges, newCollege],
      },
    });
  };

  const handleRemoveCollege = (id: string) => {
    setFormData({
      ...formData,
      collegePreferences: {
        ...formData.collegePreferences,
        consideredColleges: formData.collegePreferences.consideredColleges.filter((c) => c.id !== id),
      },
    });
  };

  return (
    <div className="space-y-6" id="advisor-profile-tab-content">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-emerald-100 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs border border-emerald-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">Student Profile & Records</h2>
          <span className="text-xs text-slate-500 font-medium hidden md:inline">
            &bull; Editable advising dossier with source verification
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                id="btn-cancel-profile-edit"
                onClick={handleCancel}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                id="btn-save-profile-changes"
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </>
          ) : (
            <button
              id="btn-enable-profile-edit"
              onClick={() => setIsEditing(true)}
              className="px-4 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile Information</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: BASIC INFORMATION */}
      <div id="section-basic-info" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">1. Basic Information</h3>
              <p className="text-[11px] text-slate-500">Student personal & contact dossier</p>
            </div>
          </div>
          <FieldStatusBadge status={formData.basic.status} />
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={formData.basic.name}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, name: e.target.value } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Preferred / English Name</label>
              <input
                type="text"
                value={formData.basic.preferredName}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, preferredName: e.target.value } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Grade</label>
              <select
                value={formData.basic.grade}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, grade: e.target.value as any } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
                <option value="Gap Year">Gap Year</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">High School</label>
              <input
                type="text"
                value={formData.basic.school}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, school: e.target.value } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">City / Province</label>
              <input
                type="text"
                value={formData.basic.city}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, city: e.target.value } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">HS Graduation Year</label>
              <input
                type="number"
                value={formData.basic.graduationYear}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, graduationYear: Number(e.target.value) } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Expected US Enrollment Year</label>
              <input
                type="number"
                value={formData.basic.expectedUsEnrollmentYear}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, expectedUsEnrollmentYear: Number(e.target.value) } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Verification Status</label>
              <select
                value={formData.basic.status}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, status: e.target.value as FieldStatus } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
              >
                <option value="Advisor-Verified">Advisor-Verified</option>
                <option value="Student-Submitted">Student-Submitted</option>
                <option value="Needs Clarification">Needs Clarification</option>
                <option value="Missing">Missing</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Student Email</label>
              <input
                type="email"
                value={formData.basic.email}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, email: e.target.value } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Student Phone / Zalo</label>
              <input
                type="text"
                value={formData.basic.phone}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, phone: e.target.value } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Parent Name(s)</label>
              <input
                type="text"
                value={formData.basic.parentName}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, parentName: e.target.value } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Full Legal Name</span>
              <span className="font-semibold text-slate-800">{student.basic.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Preferred Name</span>
              <span className="font-semibold text-slate-800">{student.basic.preferredName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Grade & City</span>
              <span className="font-semibold text-slate-800">{student.basic.grade} &bull; {student.basic.city}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Expected US Enrollment</span>
              <span className="font-semibold text-slate-800">Fall {student.basic.expectedUsEnrollmentYear}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block text-[11px]">School</span>
              <span className="font-semibold text-slate-800">{student.basic.school}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Student Email</span>
              <span className="font-semibold text-slate-800">{student.basic.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Phone / Zalo</span>
              <span className="font-semibold text-slate-800">{student.basic.phone}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block text-[11px]">Parents</span>
              <span className="font-semibold text-slate-800">{student.basic.parentName} ({student.basic.parentEmail || 'Contact on file'})</span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: INTERESTS & DIRECTION */}
      <div id="section-interests-direction" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">2. Interests & Direction</h3>
              <p className="text-[11px] text-slate-500">Academic passions, intended majors, and certainty</p>
            </div>
          </div>
          <FieldStatusBadge status={formData.interests.status} />
        </div>

        {isEditing ? (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Core Passions</label>
              <textarea
                rows={2}
                value={formData.interests.passions}
                onChange={(e) =>
                  setFormData({ ...formData, interests: { ...formData.interests, passions: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Possible Majors (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.interests.possibleMajors.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interests: {
                        ...formData.interests,
                        possibleMajors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Level of Certainty</label>
                <select
                  value={formData.interests.levelOfCertainty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interests: { ...formData.interests, levelOfCertainty: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="Exploring">Exploring</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Very Decided">Very Decided</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Career Interests</label>
              <input
                type="text"
                value={formData.interests.careerInterests}
                onChange={(e) =>
                  setFormData({ ...formData, interests: { ...formData.interests, careerInterests: e.target.value } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">Passions</span>
              <p className="text-slate-700 leading-relaxed">{student.interests.passions}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Intended Majors</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {student.interests.possibleMajors.map((m, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-semibold text-[11px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Certainty Level</span>
                <span className="font-semibold text-slate-800">{student.interests.levelOfCertainty}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Career Vision</span>
                <span className="font-semibold text-slate-800">{student.interests.careerInterests}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: ACADEMICS & TESTING */}
      <div id="section-academics-testing" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">3. Academics & Testing</h3>
              <p className="text-[11px] text-slate-500">GPA, grading scale, standardized exams & coursework</p>
            </div>
          </div>
          <FieldStatusBadge status={formData.academics.status} />
        </div>

        {isEditing ? (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">GPA</label>
                <input
                  type="text"
                  placeholder="e.g. 9.4 / 10.0"
                  value={formData.academics.gpa}
                  onChange={(e) =>
                    setFormData({ ...formData, academics: { ...formData.academics, gpa: e.target.value } })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Grading System</label>
                <select
                  value={formData.academics.gradingSystem}
                  onChange={(e) =>
                    setFormData({ ...formData, academics: { ...formData.academics, gradingSystem: e.target.value as any } })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="Vietnamese 10-point scale">Vietnamese 10-point scale</option>
                  <option value="US 4.0 scale">US 4.0 scale</option>
                  <option value="IB 45">IB 45</option>
                  <option value="A-Levels">A-Levels</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Status Verification</label>
                <select
                  value={formData.academics.status}
                  onChange={(e) =>
                    setFormData({ ...formData, academics: { ...formData.academics, status: e.target.value as FieldStatus } })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                >
                  <option value="Advisor-Verified">Advisor-Verified</option>
                  <option value="Student-Submitted">Student-Submitted</option>
                  <option value="Needs Clarification">Needs Clarification</option>
                  <option value="Missing">Missing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">SAT Score</label>
                <input
                  type="text"
                  placeholder="e.g. 1530 (Math 790, ERW 740)"
                  value={formData.academics.satScore || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, academics: { ...formData.academics, satScore: e.target.value } })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">IELTS Score</label>
                <input
                  type="text"
                  placeholder="e.g. 8.5 (L: 9.0, R: 9.0, W: 7.5, S: 8.0)"
                  value={formData.academics.ieltsScore || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, academics: { ...formData.academics, ieltsScore: e.target.value } })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Coursework & AP / IB / Chuyên details</label>
              <textarea
                rows={2}
                value={formData.academics.coursework}
                onChange={(e) =>
                  setFormData({ ...formData, academics: { ...formData.academics, coursework: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Testing Plans / Registration Status</label>
              <input
                type="text"
                value={formData.academics.testingPlans}
                onChange={(e) =>
                  setFormData({ ...formData, academics: { ...formData.academics, testingPlans: e.target.value } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-400 block text-[11px]">GPA</span>
                <span className="font-bold text-slate-900 text-sm">{student.academics.gpa}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Grading Scale</span>
                <span className="font-semibold text-slate-800">{student.academics.gradingSystem}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">SAT Composite</span>
                <span className="font-bold text-indigo-700 text-sm">{student.academics.satScore || 'None recorded'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">IELTS Band</span>
                <span className="font-bold text-emerald-700 text-sm">{student.academics.ieltsScore || 'None recorded'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block text-[11px] mb-0.5">Coursework & Honors</span>
              <p className="text-slate-700">{student.academics.coursework}</p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block text-[11px] mb-0.5">Testing Strategy & Plans</span>
              <p className="text-slate-700">{student.academics.testingPlans}</p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: ACTIVITIES & ACHIEVEMENTS */}
      <div id="section-activities-achievements" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">4. Activities & Achievements</h3>
              <p className="text-[11px] text-slate-500">Leadership, awards, volunteering, and summer endeavors</p>
            </div>
          </div>
          <FieldStatusBadge status={formData.activities.status} />
        </div>

        <div className="space-y-4 text-xs">
          {/* Extracurriculars */}
          <div>
            <h4 className="font-bold text-slate-800 text-xs mb-2 uppercase tracking-wider text-[11px]">
              Extracurricular Activities ({formData.activities.extracurriculars.length})
            </h4>
            <div className="space-y-2.5">
              {formData.activities.extracurriculars.map((ec) => (
                <div key={ec.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{ec.title} &bull; {ec.organization}</span>
                    <FieldStatusBadge status={ec.status} />
                  </div>
                  <p className="text-slate-700 leading-snug">{ec.description}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Commitment: {ec.hoursPerWeek} ({ec.weeksPerYear || 'Academic year'})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Awards */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs mb-2 uppercase tracking-wider text-[11px]">
              Honors & Awards ({formData.activities.awards.length})
            </h4>
            <div className="space-y-2">
              {formData.activities.awards.map((aw) => (
                <div key={aw.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-800">{aw.title}</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">{aw.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[10px]">
                      {aw.level} ({aw.year})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summer Activities */}
          {formData.activities.summerActivities && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-slate-400 block text-[11px] mb-0.5">Summer Activities & Special Projects</span>
              <p className="text-slate-700">{formData.activities.summerActivities}</p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5: FAMILY & FINANCIAL INFORMATION */}
      <div id="section-family-financial" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">5. Family & Financial Information</h3>
              <p className="text-[11px] text-slate-500">Estimated budget, scholarship needs, and institutional aid strategy</p>
            </div>
          </div>
          <FieldStatusBadge status={formData.financials.status} />
        </div>

        {isEditing ? (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Estimated Annual Budget (USD)</label>
                <input
                  type="number"
                  step="1000"
                  value={formData.financials.estimatedAnnualBudgetUsd}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      financials: {
                        ...formData.financials,
                        estimatedAnnualBudgetUsd: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Aid Expectation Category</label>
                <select
                  value={formData.financials.aidExpectation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      financials: { ...formData.financials, aidExpectation: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="Need-Blind Target only">Need-Blind Target only</option>
                  <option value="Significant Need-Based Aid Needed">Significant Need-Based Aid Needed</option>
                  <option value="Partial Merit / Budget Sensitive">Partial Merit / Budget Sensitive</option>
                  <option value="Full Pay / Self-Funded">Full Pay / Self-Funded</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Financial Constraints & Parameters</label>
              <textarea
                rows={2}
                value={formData.financials.relevantConstraints}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    financials: { ...formData.financials, relevantConstraints: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 mb-1">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Advisor Internal Family Notes (Confidential - Hidden from student portal)</span>
              </div>
              <textarea
                rows={2}
                value={formData.financials.familyNotes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    financials: { ...formData.financials, familyNotes: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-amber-300 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs bg-white"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[11px]">Estimated Annual Budget</span>
                <span className="font-bold text-slate-900 text-base">
                  ${student.financials.estimatedAnnualBudgetUsd.toLocaleString()} USD / year
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Financial Aid Profile</span>
                <span className="font-semibold text-indigo-700">{student.financials.aidExpectation}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block text-[11px] mb-0.5">Parameters & Constraints</span>
              <p className="text-slate-700 leading-relaxed">{student.financials.relevantConstraints}</p>
            </div>

            {student.financials.familyNotes && (
              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900">
                <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-0.5">
                  <Lock className="w-3 h-3 text-amber-700" />
                  <span>Advisor Confidential Notes (Private)</span>
                </div>
                <p className="text-[11px] leading-relaxed">{student.financials.familyNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 6: COLLEGE PREFERENCES & LIST */}
      <div id="section-college-preferences" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">6. College Preferences & Target List</h3>
              <p className="text-[11px] text-slate-500">Curated university list, categorized by Reach, Target, Safety</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FieldStatusBadge status={formData.collegePreferences.status} />
            {isEditing && (
              <button
                onClick={handleAddCollege}
                className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add College</span>
              </button>
            )}
          </div>
        </div>

        {/* Considered Colleges Table / Cards */}
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formData.collegePreferences.consideredColleges.map((col, idx) => (
              <div
                key={col.id || idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="font-bold text-slate-900 text-sm">{col.name}</div>
                  <div className="flex items-center gap-1.5">
                    <CollegeCategoryBadge category={col.category} />
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveCollege(col.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                        title="Remove college"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{col.notes}</p>

                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{col.location || 'United States'}</span>
                  <span className="font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                    {col.financialFit || 'CSS Profile Eligible'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-400 block text-[11px] mb-0.5">Campus Preferences & Community Culture</span>
            <p className="text-slate-700 leading-relaxed">{student.collegePreferences.campusPreferences}</p>
          </div>
        </div>
      </div>

      {/* ADVISOR INTERNAL ASSESSMENT (Confidential) */}
      {student.advisorInternalNotes && (
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm">Internal Strategic Assessment</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Advisor Only
              </span>
            </div>
            {student.advisorAssessmentRating && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-800 text-indigo-200">
                Rating: {student.advisorAssessmentRating}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{student.advisorInternalNotes}</p>
        </div>
      )}
    </div>
  );
};
