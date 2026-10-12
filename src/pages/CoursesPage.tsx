import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  Zap,
  Plus,
  Search,
  UserPlus,
  Clock,
  Link as LinkIcon,
  Edit2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { CourseId, Course, Enrolment } from '../types';
import {
  calculateCourseEndDate,
  calculateMaterialAccessExpiry,
  formatDisplayDate,
  getTodayIso
} from '../utils/dateRules';

export const CoursesPage: React.FC = () => {
  const { courses, enrolments, students, updateCourse, createEnrolment, extendMaterialAccess, updateAssignmentSupport } = useDemoData();

  const [activeTab, setActiveTab] = useState<'courses' | 'enrolments'>('courses');
  const [searchEnrolment, setSearchEnrolment] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isEnrolModalOpen, setIsEnrolModalOpen] = useState(false);
  const [selectedEnrolmentId, setSelectedEnrolmentId] = useState<string>(enrolments[0]?.id || '');

  useEffect(() => {
    if (!selectedEnrolmentId && enrolments.length > 0) {
      setSelectedEnrolmentId(enrolments[0].id);
    }
  }, [enrolments, selectedEnrolmentId]);

  const selectedEnrolment = enrolments.find(e => e.id === selectedEnrolmentId) || (enrolments.length > 0 ? enrolments[0] : null);

  // New Enrolment Form State
  const [enrolStudentId, setEnrolStudentId] = useState<string>(students[0]?.id || '');

  useEffect(() => {
    if (!enrolStudentId && students.length > 0) {
      setEnrolStudentId(students[0].id);
    }
  }, [students, enrolStudentId]);

  const [enrolCourseId, setEnrolCourseId] = useState<CourseId>('longterm');
  const [enrolStartDate, setEnrolStartDate] = useState<string>(getTodayIso());
  const [enrolGroup, setEnrolGroup] = useState<string>('Regular Morning');
  const [enrolSchedule, setEnrolSchedule] = useState<string>('Mon, Wed, Fri 9:00 AM – 11:00 AM');
  const [enrolClassLink, setEnrolClassLink] = useState<string>('https://meet.google.com/xyz-abcd-efg');

  // Calculated Dates Preview for Enrolment
  const calcEndDate = calculateCourseEndDate(enrolStartDate, enrolCourseId);
  const calcMaterialExpiry = calculateMaterialAccessExpiry(calcEndDate, 3);

  const filteredEnrolments = enrolments.filter(e => {
    const matchSearch =
      e.studentName.toLowerCase().includes(searchEnrolment.toLowerCase()) ||
      e.studentEmail.toLowerCase().includes(searchEnrolment.toLowerCase());
    const matchCourse = filterCourse === 'all' || e.courseId === filterCourse;
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchSearch && matchCourse && matchStatus;
  });

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    updateCourse(editingCourse.id, editingCourse);
    setEditingCourse(null);
  };

  const handleCreateEnrolmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrolStudentId) return;

    createEnrolment({
      studentId: enrolStudentId,
      courseId: enrolCourseId,
      startDate: enrolStartDate,
      group: enrolGroup as any,
      schedule: enrolSchedule,
      liveClassUrl: enrolClassLink
    });

    setIsEnrolModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#17492F] tracking-tight">
            Courses & Enrolments
          </h1>
          <p className="text-xs md:text-sm text-[#41634E] mt-0.5">
            Manage your courses and enrolments, view schedules and students.
          </p>
        </div>
        <button
          onClick={() => setIsEnrolModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Enrol Student</span>
        </button>
      </div>

      {/* Tabs matching Screenshot 3: Courses & Enrolments */}
      <div className="flex gap-2 border-b border-[#CAD7CD]/60 pb-1">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'courses'
              ? 'bg-[#17492F] text-white shadow-xs'
              : 'bg-[#F5F3E8] text-[#17492F] hover:bg-[#ECE9DA]'
          }`}
        >
          Courses
        </button>
        <button
          onClick={() => setActiveTab('enrolments')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'enrolments'
              ? 'bg-[#17492F] text-white shadow-xs'
              : 'bg-[#F5F3E8] text-[#17492F] hover:bg-[#ECE9DA]'
          }`}
        >
          Enrolments ({enrolments.length})
        </button>
      </div>

      {/* Tab 1: Courses Cards */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {courses.map((course) => {
              const Icon =
                course.id === 'longterm'
                  ? GraduationCap
                  : course.id === 'shortterm'
                  ? Calendar
                  : Zap;

              const enrolledCount = enrolments.filter(e => e.courseId === course.id && e.status !== 'expired').length;

              return (
                <div
                  key={course.id}
                  className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs flex flex-col justify-between hover:border-[#17492F]/40 transition group"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-[#DCF3E2] flex items-center justify-center text-[#17492F] shrink-0">
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-[#17492F] leading-tight">{course.name}</h2>
                        <span className="text-xs text-[#41634E] font-medium">{course.durationLabel}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#41634E] leading-relaxed mb-4">
                      {course.description}
                    </p>

                    <div className="mb-4">
                      <p className="text-[11px] font-bold text-[#17492F] mb-1.5">Covered Modules:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {course.modules.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded-md bg-white text-[#17492F] text-[10px] font-semibold border border-[#CAD7CD]/60"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-[#41634E] mb-4">
                      Active Enrolments: <strong className="text-[#17492F] font-bold">{enrolledCount} students</strong>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#CAD7CD]/50">
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="w-full py-2 bg-[#EFF583] hover:bg-[#E5EB74] text-[#17492F] border border-[#CAD7CD] rounded-xl text-xs font-bold transition shadow-xs text-center"
                    >
                      {course.contactForFees ? 'Contact for fees' : course.fee}
                    </button>
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="w-full py-1.5 bg-white hover:bg-[#ECE9DA] text-[#17492F] rounded-xl text-xs font-semibold transition border border-[#CAD7CD]/60"
                    >
                      Edit Course Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Enrolments (Table & Split details panel matching Screenshot 3 right side) */}
      {activeTab === 'enrolments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Enrolments Table (7 or 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter Bar */}
            <div className="bg-[#F5F3E8] p-3 rounded-2xl border border-[#CAD7CD] flex flex-wrap items-center gap-3 shadow-xs">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#41634E]" />
                <input
                  type="text"
                  value={searchEnrolment}
                  onChange={(e) => setSearchEnrolment(e.target.value)}
                  placeholder="Search enrolments..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
                />
              </div>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="px-3 py-1.5 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
              >
                <option value="all">All courses</option>
                <option value="longterm">Long-Term Course</option>
                <option value="shortterm">Short-Term Course</option>
                <option value="crash">Crash Course</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
              >
                <option value="all">All statuses</option>
                <option value="ongoing">Active</option>
                <option value="material_only">Material Access Only</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-[11px] font-bold text-[#41634E] uppercase border-b border-[#CAD7CD]/60 bg-[#ECE9DA]/50">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-3">Course</th>
                      <th className="py-3 px-3">Start Date</th>
                      <th className="py-3 px-3">Course End</th>
                      <th className="py-3 px-3">Material Access</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CAD7CD]/30">
                    {filteredEnrolments.map((enr) => {
                      const isSelected = selectedEnrolment?.id === enr.id;
                      return (
                        <tr
                          key={enr.id}
                          onClick={() => setSelectedEnrolmentId(enr.id)}
                          className={`cursor-pointer transition ${
                            isSelected ? 'bg-[#EFF583]/50 font-medium' : 'hover:bg-white/60'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <p className="font-bold text-[#17492F]">{enr.studentName}</p>
                            <p className="text-[10px] text-[#41634E]">{enr.studentEmail}</p>
                          </td>
                          <td className="py-3 px-3 font-semibold text-[#17492F]">
                            {enr.courseName.split('(')[0]}
                          </td>
                          <td className="py-3 px-3 text-[#41634E]">
                            {formatDisplayDate(enr.startDate)}
                          </td>
                          <td className="py-3 px-3 text-[#17492F] font-medium">
                            {formatDisplayDate(enr.courseEndDate)}
                          </td>
                          <td className="py-3 px-3 text-[#17492F]">
                            {formatDisplayDate(enr.materialAccessUntil)}
                          </td>
                          <td className="py-3 px-3">
                            <StatusBadge status={enr.status} />
                          </td>
                        </tr>
                      );
                    })}
                    {filteredEnrolments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-[#41634E] space-y-2.5">
                            <div className="w-10 h-10 rounded-full bg-[#DFEFFF] flex items-center justify-center text-[#17492F]">
                              <GraduationCap className="w-5 h-5" />
                            </div>
                            <p className="font-bold text-sm text-[#17492F]">
                              {enrolments.length === 0 ? "No active enrolments yet" : "No enrolments match your filter"}
                            </p>
                            <p className="text-xs text-[#41634E] leading-relaxed">
                              {enrolments.length === 0
                                ? "When students are enrolled in Long-Term, Short-Term, or Crash courses, their start dates, deadlines, and material buffers appear here."
                                : `No enrolments found matching "${searchEnrolment}". Try adjusting your filters.`}
                            </p>
                            {enrolments.length === 0 && (
                              <button
                                onClick={() => setIsEnrolModalOpen(true)}
                                className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#EFF583] hover:bg-[#E5EC6A] text-[#17492F] border border-[#CAD7CD] rounded-xl text-xs font-bold transition shadow-xs"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>+ Enrol First Student</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Enrolment Details Panel or Empty State Card */}
          {selectedEnrolment ? (
            <div className="lg:col-span-4 bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-[#17492F]">Enrolment Details</h3>
                <p className="text-xs text-[#41634E]">View and update student course timeline.</p>
              </div>

              <div className="space-y-3 text-xs bg-white/70 p-3.5 rounded-xl border border-[#CAD7CD]/70">
                <div>
                  <label className="text-[11px] text-[#41634E] block mb-0.5">Student</label>
                  <p className="font-bold text-sm text-[#17492F]">{selectedEnrolment.studentName}</p>
                  <p className="text-[#41634E] text-[11px]">{selectedEnrolment.studentEmail}</p>
                </div>

                <div>
                  <label className="text-[11px] text-[#41634E] block mb-0.5">Enrolled Course</label>
                  <p className="font-bold text-[#17492F]">{selectedEnrolment.courseName}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#CAD7CD]/40">
                  <div>
                    <label className="text-[10px] text-[#41634E] block">Start Date (Day 1)</label>
                    <p className="font-bold text-[#17492F]">{formatDisplayDate(selectedEnrolment.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#41634E] block">Course End Date</label>
                    <p className="font-bold text-[#17492F]">{formatDisplayDate(selectedEnrolment.courseEndDate)}</p>
                  </div>
                </div>

                <div className="pt-1 border-t border-[#CAD7CD]/40">
                  <label className="text-[10px] text-[#41634E] block">Material Access Expiry (3 Months)</label>
                  <p className="font-extrabold text-[#17492F] text-sm">{formatDisplayDate(selectedEnrolment.materialAccessUntil)}</p>
                </div>

                <div className="pt-1 border-t border-[#CAD7CD]/40">
                  <label className="text-[10px] text-[#41634E] block">Assignment Support Deadline</label>
                  <p className="font-bold text-[#17492F]">{formatDisplayDate(selectedEnrolment.assignmentSupportUntil)}</p>
                </div>

                {selectedEnrolment.schedule && (
                  <div className="pt-1 border-t border-[#CAD7CD]/40">
                    <label className="text-[10px] text-[#41634E] block">Live Class Schedule</label>
                    <p className="font-medium text-[#17492F]">{selectedEnrolment.schedule}</p>
                  </div>
                )}
              </div>

              {/* Informative yellow notice matching Screenshot 3 */}
              <div className="bg-[#EFF583]/50 border border-[#CAD7CD] rounded-xl p-3 text-[11px] text-[#17492F] flex gap-2">
                <AlertCircle className="w-4 h-4 text-[#17492F] shrink-0 mt-0.5" />
                <p>
                  Student material access continues for <strong>3 calendar months</strong> after the course end date.
                </p>
              </div>

              <button
                onClick={() => {
                  alert(`Enrolment changes for ${selectedEnrolment.studentName} saved successfully.`);
                }}
                className="w-full py-2.5 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="lg:col-span-4 bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-8 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-[340px]">
              <div className="w-14 h-14 rounded-2xl bg-[#DFEFFF] border border-[#CAD7CD] flex items-center justify-center text-[#17492F]">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-[#17492F] text-base">No Enrolment Selected</h3>
              <p className="text-xs text-[#41634E] max-w-xs leading-relaxed">
                Select an enrolment record from the directory to review batch timing, calculated completion dates, and material access buffer.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal: Enrol Student with Dynamic Date Calculations */}
      <Modal isOpen={isEnrolModalOpen} onClose={() => setIsEnrolModalOpen(false)} title="Enrol Student in Course">
        <form onSubmit={handleCreateEnrolmentSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#17492F] mb-1">Select Student *</label>
            {students.length === 0 ? (
              <div className="p-3 bg-[#EFF583]/40 border border-[#CAD7CD] rounded-xl text-xs space-y-2">
                <p className="font-bold text-[#17492F]">No students registered in the academy yet.</p>
                <p className="text-[#41634E] text-[11px]">
                  Please onboard candidates in the Students section first before creating course enrolments.
                </p>
                <Link
                  to="/admin/students"
                  onClick={() => setIsEnrolModalOpen(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#17492F] text-white rounded-lg font-bold text-xs hover:bg-[#0E301F]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Go to Students & Onboard</span>
                </Link>
              </div>
            ) : (
              <select
                value={enrolStudentId}
                onChange={(e) => setEnrolStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email}) — Target Band {s.targetBand}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#17492F] mb-1">Select Course *</label>
              <select
                value={enrolCourseId}
                onChange={(e: any) => setEnrolCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              >
                <option value="longterm">Long-Term Course (1 calendar month)</option>
                <option value="shortterm">Short-Term Course (15 days)</option>
                <option value="crash">Crash Course (7 days)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#17492F] mb-1">Course Start Date (Day 1) *</label>
              <input
                type="date"
                required
                value={enrolStartDate}
                onChange={(e) => setEnrolStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>
          </div>

          {/* DYNAMIC CALCULATED TIMELINE PREVIEW (MANDATORY REQUIREMENT) */}
          <div className="bg-[#EFF583]/40 border border-[#CAD7CD] rounded-xl p-3 space-y-1.5">
            <h4 className="font-bold text-[#17492F] text-xs flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#17492F]" />
              <span>Calculated Enrolment Timeline:</span>
            </h4>
            <div className="text-[11px] grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white/80 p-2 rounded-lg border border-[#CAD7CD]/50">
              <div>
                <span className="text-[#41634E] block">Start Date:</span>
                <strong className="text-[#17492F]">{formatDisplayDate(enrolStartDate)}</strong>
              </div>
              <div>
                <span className="text-[#41634E] block">Course End Date:</span>
                <strong className="text-[#17492F]">{formatDisplayDate(calcEndDate)}</strong>
              </div>
              <div>
                <span className="text-[#41634E] block">Material Access Ends:</span>
                <strong className="text-[#17492F]">{formatDisplayDate(calcMaterialExpiry)}</strong>
              </div>
            </div>
            <p className="text-[10px] text-[#41634E]">
              Note: Material access expires 3 calendar months after completion. Assignment support defaults to {formatDisplayDate(calcEndDate)}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#17492F] mb-1">Schedule Timing</label>
              <input
                type="text"
                value={enrolSchedule}
                onChange={(e) => setEnrolSchedule(e.target.value)}
                placeholder="e.g. Mon, Wed, Fri 9:00 AM – 11:00 AM"
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#17492F] mb-1">Live Class Link</label>
              <input
                type="text"
                value={enrolClassLink}
                onChange={(e) => setEnrolClassLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEnrolModalOpen(false)}
              className="px-4 py-2 bg-[#CAD7CD]/40 text-[#17492F] rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl font-bold shadow-xs"
            >
              Confirm Enrolment
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Course Details */}
      {editingCourse && (
        <Modal isOpen={!!editingCourse} onClose={() => setEditingCourse(null)} title={`Edit ${editingCourse.name}`}>
          <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#17492F] mb-1">Course Name</label>
              <input
                type="text"
                value={editingCourse.name}
                onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#17492F] mb-1">Course Description</label>
              <textarea
                rows={3}
                value={editingCourse.description}
                onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="contactForFees"
                checked={editingCourse.contactForFees}
                onChange={(e) => setEditingCourse({ ...editingCourse, contactForFees: e.target.checked })}
                className="w-4 h-4 rounded text-[#17492F]"
              />
              <label htmlFor="contactForFees" className="font-bold text-[#17492F]">
                Display "Contact Us for fees" instead of price tag
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="px-4 py-2 bg-[#CAD7CD]/40 text-[#17492F] rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl font-bold shadow-xs"
              >
                Save Course
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
