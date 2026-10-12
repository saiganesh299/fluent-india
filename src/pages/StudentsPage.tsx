import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  UserPlus,
  Calendar,
  Edit2,
  AlertCircle,
  Clock,
  MoreVertical,
  CheckCircle,
  X,
  FileCheck,
  Plus
} from 'lucide-react';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { formatDisplayDate, calculateCourseEndDate, calculateMaterialAccessExpiry, addMonthsWithClamping, formatDateIso } from '../utils/dateRules';
import { CourseId } from '../types';

export const StudentsPage: React.FC = () => {
  const { students, enrolments, courses, addStudent, extendMaterialAccess, updateAssignmentSupport, updateStudent } = useDemoData();
  const { searchTerm: globalSearch } = useOutletContext<{ searchTerm: string }>() || { searchTerm: '' };

  const [localSearch, setLocalSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Selected student for right-side drawer
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  React.useEffect(() => {
    if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isExtendAccessOpen, setIsExtendAccessOpen] = useState(false);
  const [isEditSupportOpen, setIsEditSupportOpen] = useState(false);
  const [extensionMonths, setExtensionMonths] = useState<number>(1);
  const [customSupportDate, setCustomSupportDate] = useState<string>('');

  // Add student form fields
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    targetBand: '7.5',
    stream: 'Academic' as 'Academic' | 'General Training',
    courseId: 'longterm' as CourseId,
    startDate: new Date().toISOString().split('T')[0],
    group: 'Regular Morning'
  });

  const query = (localSearch || globalSearch).toLowerCase();

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchSearch =
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query);

      const enrolment = enrolments.find(e => e.studentId === student.id);
      const matchCourse = courseFilter === 'all' || (enrolment && enrolment.courseId === courseFilter);
      const matchStatus = statusFilter === 'all' || (enrolment && enrolment.status === statusFilter);

      return matchSearch && matchCourse && matchStatus;
    });
  }, [students, enrolments, query, courseFilter, statusFilter]);

  const selectedStudent = students.find(s => s.id === selectedStudentId) || (students.length > 0 ? students[0] : null);
  const selectedEnrolment = enrolments.find(e => e.studentId === selectedStudent?.id);

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) return;

    const created = addStudent(
      {
        name: newStudent.name,
        email: newStudent.email,
        phone: newStudent.phone,
        targetBand: newStudent.targetBand,
        stream: newStudent.stream
      },
      {
        courseId: newStudent.courseId,
        startDate: newStudent.startDate,
        group: newStudent.group
      }
    );

    setSelectedStudentId(created.id);
    setIsAddStudentOpen(false);
    setNewStudent({
      name: '',
      email: '',
      phone: '',
      targetBand: '7.5',
      stream: 'Academic',
      courseId: 'longterm',
      startDate: new Date().toISOString().split('T')[0],
      group: 'October Morning'
    });
  };

  const handleExtendAccessConfirm = () => {
    if (!selectedEnrolment) return;
    const currentExpiry = new Date(selectedEnrolment.materialAccessUntil);
    const newDate = addMonthsWithClamping(currentExpiry, extensionMonths);
    extendMaterialAccess(selectedEnrolment.id, formatDateIso(newDate));
    setIsExtendAccessOpen(false);
  };

  const handleUpdateSupportConfirm = () => {
    if (!selectedEnrolment || !customSupportDate) return;
    updateAssignmentSupport(selectedEnrolment.id, customSupportDate);
    setIsEditSupportOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#17492F] tracking-tight">
            Students
          </h1>
          <p className="text-xs md:text-sm text-[#41634E] mt-0.5">
            Manage enrolments and learning access.
          </p>
        </div>
        <button
          onClick={() => setIsAddStudentOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Main Split Layout matching Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Filters & Student Table */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter Bar */}
          <div className="bg-[#F5F3E8] p-3 rounded-2xl border border-[#CAD7CD] flex flex-wrap items-center gap-3 shadow-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#41634E]" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none focus:ring-1 focus:ring-[#17492F]"
              />
            </div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-3 py-1.5 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
            >
              <option value="all">All courses</option>
              <option value="longterm">Long-Term Course (1 month)</option>
              <option value="shortterm">Short-Term Course (15 days)</option>
              <option value="crash">Crash Course (1 week)</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="ongoing">Active</option>
              <option value="material_only">Material Access Only</option>
              <option value="expired">Inactive / Expired</option>
            </select>
          </div>

          {/* Student Table */}
          <div className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-[11px] font-bold text-[#41634E] uppercase border-b border-[#CAD7CD]/60 bg-[#ECE9DA]/50">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-3">Course</th>
                    <th className="py-3 px-3">Group</th>
                    <th className="py-3 px-3">Material access</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CAD7CD]/30">
                  {filteredStudents.map((student) => {
                    const enrolment = enrolments.find(e => e.studentId === student.id);
                    const isSelected = student.id === selectedStudent?.id;

                    return (
                      <tr
                        key={student.id}
                        onClick={() => setSelectedStudentId(student.id)}
                        className={`cursor-pointer transition ${
                          isSelected
                            ? 'bg-[#EFF583]/50 font-medium'
                            : 'hover:bg-white/60'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#EFF583] border border-[#17492F]/20 font-bold text-xs text-[#17492F] flex items-center justify-center shrink-0">
                              {student.avatarInitials}
                            </div>
                            <div>
                              <p className="font-bold text-[#17492F] leading-tight">{student.name}</p>
                              <p className="text-[11px] text-[#41634E] leading-tight">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-[#17492F]">
                            {enrolment?.courseName.split('(')[0] || 'Long-Term Course'}
                          </p>
                          <p className="text-[10px] text-[#41634E]">
                            {enrolment?.courseName.includes('(') ? `(${enrolment.courseName.split('(')[1]}` : ''}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-[#17492F]">
                          {enrolment?.group || 'October Morning'}
                        </td>
                        <td className="py-3 px-3 text-[#17492F] whitespace-nowrap font-medium">
                          {formatDisplayDate(enrolment?.materialAccessUntil || '')}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={enrolment?.status || 'ongoing'} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentId(student.id);
                            }}
                            className="p-1 rounded-lg hover:bg-[#CAD7CD]/50 text-[#41634E]"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-[#41634E] space-y-2.5">
                          <div className="w-10 h-10 rounded-full bg-[#DFEFFF] flex items-center justify-center text-[#17492F]">
                            <UserPlus className="w-5 h-5" />
                          </div>
                          <p className="font-bold text-sm text-[#17492F]">
                            {students.length === 0 ? "No students registered yet" : "No students match your filter"}
                          </p>
                          <p className="text-xs text-[#41634E] leading-relaxed">
                            {students.length === 0
                              ? "Your student directory is ready for real enrolments. Click '+ Add Student' above to onboard candidates with customized target bands and course schedules."
                              : `No candidates found matching "${query}". Try clearing search or status filters.`}
                          </p>
                          {students.length === 0 && (
                            <button
                              onClick={() => setIsAddStudentOpen(true)}
                              className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#EFF583] hover:bg-[#E5EC6A] text-[#17492F] border border-[#CAD7CD] rounded-xl text-xs font-bold transition shadow-xs"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>+ Add First Student</span>
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

        {/* Right Column (4 cols): Detailed Student Profile Panel or Empty State Card */}
        {selectedStudent ? (
          <div className="lg:col-span-4 bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs space-y-5">
            {/* Header: Large Avatar + Name */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-13 h-13 rounded-full bg-[#EFF583] border border-[#17492F]/20 flex items-center justify-center font-black text-lg text-[#17492F]">
                  {selectedStudent.avatarInitials}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#17492F]">{selectedStudent.name}</h2>
                  <p className="text-xs text-[#41634E]">{selectedStudent.email}</p>
                </div>
              </div>
              <button className="p-1 rounded-lg text-[#41634E] hover:text-[#17492F]">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Course & Timeline Details */}
            <div className="space-y-2 text-xs border-y border-[#CAD7CD]/60 py-3.5">
              <div className="flex justify-between">
                <span className="text-[#41634E]">Course</span>
                <span className="font-bold text-[#17492F]">{selectedEnrolment?.courseName || 'Long-Term Course (1 month)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#41634E]">Group</span>
                <span className="font-semibold text-[#17492F]">{selectedEnrolment?.group || 'Regular Morning'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#41634E]">Course ends</span>
                <span className="font-bold text-[#17492F]">{formatDisplayDate(selectedEnrolment?.courseEndDate || '')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#41634E]">Material access until</span>
                <span className="font-bold text-[#17492F]">{formatDisplayDate(selectedEnrolment?.materialAccessUntil || '')}</span>
              </div>
            </div>

            {/* Assignment Support Card */}
            <div className="bg-white/80 rounded-xl border border-[#CAD7CD]/80 p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#17492F]">
                <FileCheck className="w-4 h-4 text-[#17492F]" />
                <span>Assignment Support</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#41634E]">Support until</span>
                <span className="font-bold text-[#17492F]">
                  {formatDisplayDate(selectedEnrolment?.assignmentSupportUntil || '')}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#41634E]">Submissions</span>
                <span className="px-2 py-0.5 rounded-full bg-[#DCF3E2] text-[#17492F] text-[10px] font-bold border border-[#17492F]/10">
                  Enabled
                </span>
              </div>
            </div>

            {/* Actions: Extend Material Access & Edit Enrolment */}
            <div className="space-y-2">
              <button
                onClick={() => setIsExtendAccessOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Calendar className="w-4 h-4" />
                <span>Extend Material Access</span>
              </button>
              <button
                onClick={() => setIsEditSupportOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-[#ECE9DA] text-[#17492F] border border-[#CAD7CD] rounded-xl text-xs font-bold transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Assignment Support</span>
              </button>
            </div>

            {/* Crucial Yellow Warning Banner from Screenshot 2 */}
            <div className="bg-[#EFF583]/50 border border-[#CAD7CD] rounded-xl p-3 flex gap-2.5 text-[11px] text-[#17492F] leading-relaxed">
              <AlertCircle className="w-4 h-4 text-[#17492F] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">Material extensions do not extend assignment support.</p>
                <p className="text-[#41634E]">
                  Extending material access gives the student continued access to learning resources only. Assignment support end date remains unchanged.
                </p>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#17492F] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Recent Activity</span>
                </span>
                <span className="text-[11px] text-[#41634E] cursor-pointer hover:underline">View All</span>
              </div>

              <div className="space-y-2 text-xs">
                {selectedStudent.recentActivity && selectedStudent.recentActivity.length > 0 ? (
                  selectedStudent.recentActivity.slice(0, 3).map((act) => (
                    <div key={act.id} className="flex items-start gap-2.5 text-[11px]">
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          act.type === 'material'
                            ? 'bg-emerald-500'
                            : act.type === 'assignment'
                            ? 'bg-blue-500'
                            : 'bg-[#17492F]'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-bold text-[#17492F]">{act.action}</p>
                          <span className="text-[#41634E] text-[10px]">{formatDisplayDate(act.date)}</span>
                        </div>
                        <p className="text-[#41634E]">{act.detail}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#41634E]">No recent activity recorded.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-4 bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-8 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-[360px]">
            <div className="w-14 h-14 rounded-2xl bg-[#DFEFFF] border border-[#CAD7CD] flex items-center justify-center text-[#17492F]">
              <UserPlus className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-[#17492F] text-base">No Student Selected</h3>
            <p className="text-xs text-[#41634E] max-w-xs leading-relaxed">
              Select a candidate from the roster or onboard a new student to view their enrolment details, extend material access, or manage deadlines.
            </p>
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl text-xs font-bold transition shadow-xs mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add First Student</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal: Add Student */}
      <Modal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} title="Add Student & Enrol">
        <form onSubmit={handleAddStudentSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#17492F] mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none focus:ring-1 focus:ring-[#17492F]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#17492F] mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                placeholder="e.g. rahul@example.com"
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none focus:ring-1 focus:ring-[#17492F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#17492F] mb-1">Phone Number (Optional)</label>
              <input
                type="text"
                value={newStudent.phone}
                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#17492F] mb-1">Target IELTS Band</label>
              <select
                value={newStudent.targetBand}
                onChange={(e) => setNewStudent({ ...newStudent, targetBand: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
              >
                <option value="6.5">Band 6.5</option>
                <option value="7.0">Band 7.0</option>
                <option value="7.5">Band 7.5</option>
                <option value="8.0">Band 8.0</option>
                <option value="8.5">Band 8.5</option>
                <option value="9.0">Band 9.0</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-[#EFF583]/30 rounded-xl border border-[#CAD7CD] space-y-3">
            <h4 className="font-bold text-[#17492F]">Course Enrolment (Students can join on any date)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#17492F] mb-1">Approved Course</label>
                <select
                  value={newStudent.courseId}
                  onChange={(e: any) => setNewStudent({ ...newStudent, courseId: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                >
                  <option value="longterm">Long-Term Course (1 calendar month)</option>
                  <option value="shortterm">Short-Term Course (15 days)</option>
                  <option value="crash">Crash Course (7 days)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#17492F] mb-1">Start Date (Day 1)</label>
                <input
                  type="date"
                  required
                  value={newStudent.startDate}
                  onChange={(e) => setNewStudent({ ...newStudent, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                />
              </div>
            </div>

            {/* Live Calculation Preview */}
            <div className="text-[11px] bg-white/80 p-2.5 rounded-lg border border-[#CAD7CD]/60 space-y-1">
              <p className="text-[#41634E]">
                Calculated Course End Date:{' '}
                <strong className="text-[#17492F]">
                  {formatDisplayDate(calculateCourseEndDate(newStudent.startDate, newStudent.courseId))}
                </strong>
              </p>
              <p className="text-[#41634E]">
                Material Access Expiry (3 calendar months):{' '}
                <strong className="text-[#17492F]">
                  {formatDisplayDate(calculateMaterialAccessExpiry(calculateCourseEndDate(newStudent.startDate, newStudent.courseId)))}
                </strong>
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddStudentOpen(false)}
              className="px-4 py-2 bg-[#CAD7CD]/40 text-[#17492F] rounded-xl font-bold hover:bg-[#CAD7CD]/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl font-bold shadow-xs"
            >
              Save Student & Enrol
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Extend Material Access */}
      <Modal isOpen={isExtendAccessOpen} onClose={() => setIsExtendAccessOpen(false)} title="Extend Material Access">
        <div className="space-y-4 text-xs">
          <p className="text-[#41634E]">
            Extend learning portal and video masterclass access for <strong>{selectedStudent?.name}</strong>.
          </p>

          <div className="p-3 bg-white rounded-xl border border-[#CAD7CD] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#41634E]">Current Material Expiry:</span>
              <strong className="text-[#17492F]">{formatDisplayDate(selectedEnrolment?.materialAccessUntil || '')}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#41634E]">Assignment Support Ends:</span>
              <strong className="text-[#17492F]">{formatDisplayDate(selectedEnrolment?.assignmentSupportUntil || '')}</strong>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#17492F] mb-1.5">Add Access Extension</label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => setExtensionMonths(months)}
                  className={`py-2 rounded-xl font-bold border transition ${
                    extensionMonths === months
                      ? 'bg-[#17492F] text-white border-[#17492F]'
                      : 'bg-white text-[#17492F] border-[#CAD7CD] hover:bg-[#EFF583]'
                  }`}
                >
                  +{months} Month{months > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#EFF583]/50 border border-[#CAD7CD] rounded-xl p-3 text-[11px] text-[#17492F]">
            <strong>Reminder:</strong> Extending material access gives the student continued access to learning resources only. Assignment support end date will remain untouched.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsExtendAccessOpen(false)}
              className="px-4 py-2 bg-[#CAD7CD]/40 text-[#17492F] rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleExtendAccessConfirm}
              className="px-4 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl font-bold"
            >
              Confirm Extension
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Edit Assignment Support */}
      <Modal isOpen={isEditSupportOpen} onClose={() => setIsEditSupportOpen(false)} title="Edit Assignment Support Deadline">
        <div className="space-y-4 text-xs">
          <p className="text-[#41634E]">
            Update the assignment submission and tutor evaluation deadline for <strong>{selectedStudent?.name}</strong>.
          </p>

          <div>
            <label className="block font-bold text-[#17492F] mb-1">Assignment Support Deadline</label>
            <input
              type="date"
              defaultValue={selectedEnrolment?.assignmentSupportUntil}
              onChange={(e) => setCustomSupportDate(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
            />
          </div>

          <p className="text-[11px] text-[#41634E]">
            Submissions submitted past this deadline will show as overdue unless extended here.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditSupportOpen(false)}
              className="px-4 py-2 bg-[#CAD7CD]/40 text-[#17492F] rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateSupportConfirm}
              className="px-4 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl font-bold"
            >
              Save Support Deadline
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
