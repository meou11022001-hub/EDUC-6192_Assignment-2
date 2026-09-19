import React, { useState } from 'react';
import {
  Student,
  ConsideredCollege,
  ExtracurricularItem,
  AwardItem,
} from '../../../types';
import {
  User,
  Compass,
  GraduationCap,
  Award,
  DollarSign,
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { FieldStatusBadge, CollegeCategoryBadge } from '../../common/Badge';

interface StudentProfileTabProps {
  student: Student;
  onSaveStudentProfile: (updatedStudent: Student) => void;
}

export const StudentProfileTab: React.FC<StudentProfileTabProps> = ({
  student,
  onSaveStudentProfile,
}) => {
  const [formData, setFormData] = useState<Student>(student);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync if student prop updates
  React.useEffect(() => {
    setFormData(student);
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce permission: student updates are marked as 'Student-Submitted'
    const studentUpdated: Student = {
      ...formData,
      // Protect advisor confidential notes and ratings from tampering
      advisorInternalNotes: student.advisorInternalNotes,
      advisorAssessmentRating: student.advisorAssessmentRating,
      advisingStatus: student.advisingStatus,
      advisingStage: student.advisingStage,
      basic: {
        ...formData.basic,
        status: 'Student-Submitted',
      },
      interests: {
        ...formData.interests,
        status: 'Student-Submitted',
      },
      academics: {
        ...formData.academics,
        status: 'Student-Submitted',
      },
      activities: {
        ...formData.activities,
        status: 'Student-Submitted',
      },
      financials: {
        ...formData.financials,
        status: 'Student-Submitted',
        // keep private familyNotes intact
        familyNotes: student.financials.familyNotes,
      },
      collegePreferences: {
        ...formData.collegePreferences,
        status: 'Student-Submitted',
      },
    };

    onSaveStudentProfile(studentUpdated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleAddCollege = () => {
    const newCollege: ConsideredCollege = {
      id: `col-${Date.now()}`,
      name: '',
      category: 'Target',
      notes: 'Interested in their undergraduate program',
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
    <div className="space-y-6" id="student-profile-tab-content">
      {/* Toast */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-900 text-teal-100 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs border border-teal-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>Profile changes submitted! Your advisor will review and verify them.</span>
        </div>
      )}

      {/* Info Notice for Student */}
      <div className="bg-teal-50/80 border border-teal-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <h3 className="font-bold text-teal-950">Student Profile Self-Service</h3>
            <p className="text-teal-800 mt-0.5 leading-relaxed">
              Keep your contact details, test scores, activities, and college preferences up to date.
              Any edits you submit will be flagged as{' '}
              <span className="font-semibold px-1.5 py-0.2 rounded bg-teal-100 text-teal-900">
                Student-Submitted
              </span>{' '}
              for your advisor ({student.advisorName}) to verify during your next session.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. BASIC INFO */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">1. Personal & Contact Information</h3>
                <p className="text-[11px] text-slate-500">How your advisor reaches you and your school details</p>
              </div>
            </div>
            <FieldStatusBadge status={formData.basic.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={formData.basic.name}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, name: e.target.value } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Preferred Name / Nickname</label>
              <input
                type="text"
                placeholder="e.g. Alex, Linh"
                value={formData.basic.preferredName}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, preferredName: e.target.value } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Grade</label>
              <select
                value={formData.basic.grade}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, grade: e.target.value as any } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
                <option value="Gap Year">Gap Year</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">School</label>
              <input
                type="text"
                value={formData.basic.school}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, school: e.target.value } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Student Email</label>
              <input
                type="email"
                value={formData.basic.email}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, email: e.target.value } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone / Zalo</label>
              <input
                type="text"
                placeholder="+84 9xx xxx xxx"
                value={formData.basic.phone}
                onChange={(e) =>
                  setFormData({ ...formData, basic: { ...formData.basic, phone: e.target.value } })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target US Enrollment</label>
              <input
                type="number"
                value={formData.basic.expectedUsEnrollmentYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    basic: { ...formData.basic, expectedUsEnrollmentYear: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. INTERESTS & DIRECTION */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">2. Academic Interests & Direction</h3>
                <p className="text-[11px] text-slate-500">What topics excite you and intended majors</p>
              </div>
            </div>
            <FieldStatusBadge status={formData.interests.status} />
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Passions & Academic Curiosity
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Passionate about machine learning ethics, bioinformatics research, and debate."
                value={formData.interests.passions}
                onChange={(e) =>
                  setFormData({ ...formData, interests: { ...formData.interests, passions: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Possible Majors (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Applied Mathematics, Economics"
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
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Certainty Level</label>
                <select
                  value={formData.interests.levelOfCertainty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interests: { ...formData.interests, levelOfCertainty: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
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
                placeholder="e.g. AI research engineer, venture capital in biotech, university professor"
                value={formData.interests.careerInterests}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interests: { ...formData.interests, careerInterests: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. ACADEMICS & TESTING */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">3. Academics & Standardized Testing</h3>
                <p className="text-[11px] text-slate-500">Your school grades, SAT/ACT, and English scores</p>
              </div>
            </div>
            <FieldStatusBadge status={formData.academics.status} />
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Current GPA</label>
                <input
                  type="text"
                  placeholder="e.g. 9.4 / 10.0 or 3.9 / 4.0"
                  value={formData.academics.gpa}
                  onChange={(e) =>
                    setFormData({ ...formData, academics: { ...formData.academics, gpa: e.target.value } })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">SAT Composite Score</label>
                <input
                  type="text"
                  placeholder="e.g. 1530 (Math 790, ERW 740)"
                  value={formData.academics.satScore || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, academics: { ...formData.academics, satScore: e.target.value } })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">IELTS / TOEFL</label>
                <input
                  type="text"
                  placeholder="e.g. IELTS 8.5 or TOEFL 110"
                  value={formData.academics.ieltsScore || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, academics: { ...formData.academics, ieltsScore: e.target.value } })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Coursework Details (AP, IB, Specialized Chuyên classes)
              </label>
              <textarea
                rows={2}
                placeholder="List key advanced classes: e.g. Chuyên Tin, AP Calculus BC (5), AP Physics C"
                value={formData.academics.coursework}
                onChange={(e) =>
                  setFormData({ ...formData, academics: { ...formData.academics, coursework: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. ACTIVITIES & ACHIEVEMENTS */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">4. Activities & Extracurriculars</h3>
                <p className="text-[11px] text-slate-500">Clubs, volunteering, leadership, and honors</p>
              </div>
            </div>
            <FieldStatusBadge status={formData.activities.status} />
          </div>

          <div className="space-y-3 text-xs">
            <span className="text-slate-500 block text-[11px]">
              Active Activities on File ({formData.activities.extracurriculars.length})
            </span>

            {formData.activities.extracurriculars.map((ec, idx) => (
              <div key={ec.id || idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>{ec.title} &bull; {ec.organization}</span>
                  <span className="text-[10px] text-slate-400">{ec.hoursPerWeek}</span>
                </div>
                <p className="text-slate-600 mt-1">{ec.description}</p>
              </div>
            ))}

            <div className="pt-2">
              <label className="block font-medium text-slate-700 mb-1">
                Summer Activities & Projects
              </label>
              <textarea
                rows={2}
                placeholder="Describe your summer research, internships, camps, or independent initiatives..."
                value={formData.activities.summerActivities}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activities: { ...formData.activities, summerActivities: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 5. COLLEGE PREFERENCES */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">5. Colleges Under Consideration</h3>
                <p className="text-[11px] text-slate-500">Colleges you are excited about or researching</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddCollege}
              className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 hover:bg-teal-100 font-medium text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Suggest College</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.collegePreferences.consideredColleges.map((col) => (
                <div key={col.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <input
                      type="text"
                      placeholder="University Name (e.g. Amherst College)"
                      value={col.name}
                      onChange={(e) => {
                        const updated = formData.collegePreferences.consideredColleges.map((c) =>
                          c.id === col.id ? { ...c, name: e.target.value } : c
                        );
                        setFormData({
                          ...formData,
                          collegePreferences: { ...formData.collegePreferences, consideredColleges: updated },
                        });
                      }}
                      className="font-bold text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded text-xs w-full"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCollege(col.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Why this college? (notes)"
                    value={col.notes}
                    onChange={(e) => {
                      const updated = formData.collegePreferences.consideredColleges.map((c) =>
                        c.id === col.id ? { ...c, notes: e.target.value } : c
                      );
                      setFormData({
                        ...formData,
                        collegePreferences: { ...formData.collegePreferences, consideredColleges: updated },
                      });
                    }}
                    className="text-[11px] text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded w-full mt-1"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="block font-medium text-slate-700 mb-1">
                Campus Preferences (e.g. Urban vs Rural, New England, Liberal Arts vs Research)
              </label>
              <textarea
                rows={2}
                value={formData.collegePreferences.campusPreferences}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    collegePreferences: {
                      ...formData.collegePreferences,
                      campusPreferences: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            id="btn-submit-student-profile"
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Submit Profile Updates for Advisor Review</span>
          </button>
        </div>
      </form>
    </div>
  );
};
