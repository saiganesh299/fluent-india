import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Mic,
  BookOpen,
  ListOrdered,
  Plus,
  Calendar,
  Users,
  Paperclip,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  MoreVertical,
  CheckSquare
} from 'lucide-react';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { AssignmentTemplate, ModuleType, CourseId, Student } from '../types';
import { formatDisplayDate, getDaysRemaining, getTodayIso } from '../utils/dateRules';

export const AssignmentsPage: React.FC = () => {
  const {
    assignmentTemplates,
    assignedWorks,
    submissions,
    students,
    enrolments,
    courses,
    createAssignmentTemplate,
    updateAssignmentTemplate,
    assignTemplateToStudents
  } = useDemoData();

  const navigate = useNavigate();

  const [topTab, setTopTab] = useState<'library' | 'assigned' | 'submissions'>('library');
  const [filterModule, setFilterModule] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Published' | 'Draft'>('All');

  // Form State for Create Assignment (Right Panel in Screenshot 5)
  const [newTitle, setNewTitle] = useState('');
  const [newModule, setNewModule] = useState<ModuleType>('Writing');
  const [newCourseId, setNewCourseId] = useState<CourseId>('longterm');
  const [newInstructions, setNewInstructions] = useState('');
  const [newDueDate, setNewDueDate] = useState(getTodayIso());
  const [acceptedFormats, setAcceptedFormats] = useState<('Text' | 'PDF' | 'Image' | 'Audio')[]>(['Text', 'PDF']);
  const [worksheetFile, setWorksheetFile] = useState<string>('');

  // Assign to Students Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTemplateToAssign, setSelectedTemplateToAssign] = useState<AssignmentTemplate | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [assignReleaseDate, setAssignReleaseDate] = useState(getTodayIso());
  const [assignDueDate, setAssignDueDate] = useState('');

  // Filter templates
  const filteredTemplates = assignmentTemplates.filter(t => {
    const matchModule = filterModule === 'All' || t.module === filterModule;
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchModule && matchStatus;
  });

  const getModuleIcon = (mod: ModuleType) => {
    switch (mod) {
      case 'Writing': return { icon: FileText, bg: 'bg-[#FEE2E2]', color: 'text-red-700' };
      case 'Speaking': return { icon: Mic, bg: 'bg-[#FFF8CC]', color: 'text-amber-700' };
      case 'Reading': return { icon: BookOpen, bg: 'bg-[#DCF3E2]', color: 'text-[#17492F]' };
      case 'Listening': return { icon: ListOrdered, bg: 'bg-[#D6E6F8]', color: 'text-blue-700' };
      default: return { icon: FileText, bg: 'bg-[#ECE9DA]', color: 'text-[#17492F]' };
    }
  };

  const handleCreateAssignment = (status: 'Published' | 'Draft') => {
    if (!newTitle) {
      alert('Please enter an assignment title');
      return;
    }

    createAssignmentTemplate({
      title: newTitle,
      module: newModule,
      targetCourseId: newCourseId,
      instructions: newInstructions || 'Complete the assignment prompt according to standard IELTS criteria.',
      acceptedFormats,
      worksheetName: worksheetFile ? 'Attached-Worksheet.pdf' : undefined,
      status
    });

    alert(`Assignment ${status === 'Published' ? 'published to Library' : 'saved as Draft'}!`);
    setNewTitle('');
    setNewInstructions('');
  };

  const handleOpenAssignModal = (tpl: AssignmentTemplate) => {
    setSelectedTemplateToAssign(tpl);
    // Preselect active students enrolled in this course
    const eligible = enrolments
      .filter(e => e.courseId === tpl.targetCourseId && e.status !== 'expired')
      .map(e => e.studentId);
    setSelectedStudentIds(eligible);
    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);
    setAssignDueDate(in3Days.toISOString().split('T')[0]);
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateToAssign || selectedStudentIds.length === 0) {
      alert('Please select at least one student');
      return;
    }

    assignTemplateToStudents(
      selectedTemplateToAssign.id,
      selectedStudentIds,
      assignReleaseDate,
      assignDueDate
    );

    setIsAssignModalOpen(false);
    setTopTab('assigned');
    alert(`Assignment successfully assigned to ${selectedStudentIds.length} student(s)!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#17492F] tracking-tight">
            Assignments
          </h1>
          <p className="text-xs md:text-sm text-[#41634E] mt-0.5">
            Create and manage assignments for your IELTS courses and students.
          </p>
        </div>
      </div>

      {/* 3 Main Tabs required by Business Rules */}
      <div className="flex gap-2 border-b border-[#CAD7CD]/60 pb-1">
        <button
          onClick={() => setTopTab('library')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            topTab === 'library'
              ? 'bg-[#17492F] text-white shadow-xs'
              : 'bg-[#F5F3E8] text-[#17492F] hover:bg-[#ECE9DA]'
          }`}
        >
          Assignment Library ({assignmentTemplates.length})
        </button>
        <button
          onClick={() => setTopTab('assigned')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            topTab === 'assigned'
              ? 'bg-[#17492F] text-white shadow-xs'
              : 'bg-[#F5F3E8] text-[#17492F] hover:bg-[#ECE9DA]'
          }`}
        >
          Assigned Work ({assignedWorks.length})
        </button>
        <button
          onClick={() => setTopTab('submissions')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            topTab === 'submissions'
              ? 'bg-[#17492F] text-white shadow-xs'
              : 'bg-[#F5F3E8] text-[#17492F] hover:bg-[#ECE9DA]'
          }`}
        >
          Submissions Queue ({submissions.length})
        </button>
      </div>

      {/* TAB 1: ASSIGNMENT LIBRARY (Matches Screenshot 5 exactly) */}
      {topTab === 'library' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Sub-filters & Assignment Cards */}
          <div className="lg:col-span-7 space-y-4">
            {/* Filter pills matching Screenshot 5 */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F5F3E8] p-2 rounded-2xl border border-[#CAD7CD]">
              <div className="flex gap-1">
                {(['All', 'Published', 'Drafts'] as const).map((status) => {
                  const label =
                    status === 'All'
                      ? `All (${assignmentTemplates.length})`
                      : status === 'Published'
                      ? `Published (${assignmentTemplates.filter(t => t.status === 'Published').length})`
                      : `Drafts (${assignmentTemplates.filter(t => t.status === 'Draft').length})`;

                  const isMatch = (status === 'Drafts' ? 'Draft' : status) === filterStatus;

                  return (
                    <button
                      key={status}
                      onClick={() => setFilterStatus((status === 'Drafts' ? 'Draft' : status) as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        isMatch
                          ? 'bg-[#EFF583] text-[#17492F] border border-[#CAD7CD]'
                          : 'text-[#41634E] hover:bg-white/60'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Module Filter */}
              <div className="flex gap-1">
                {['All', 'Writing', 'Speaking', 'Reading', 'Listening'].map((mod) => (
                  <button
                    key={mod}
                    onClick={() => setFilterModule(mod)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      filterModule === mod
                        ? 'bg-[#17492F] text-white'
                        : 'bg-white/70 text-[#17492F] hover:bg-white'
                    }`}
                  >
                    {mod}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards matching Screenshot 5 */}
            <div className="space-y-3">
              {filteredTemplates.map((tpl) => {
                const style = getModuleIcon(tpl.module);
                const Icon = style.icon;
                const course = courses.find(c => c.id === tpl.targetCourseId);
                const submittedRatio = tpl.totalSubmissionsCount || 18;
                const totalTarget = 24;
                const percent = Math.min(100, Math.round((submittedRatio / totalTarget) * 100));

                return (
                  <div
                    key={tpl.id}
                    className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs space-y-3 hover:border-[#17492F]/40 transition group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-11 h-11 rounded-full ${style.bg} ${style.color} flex items-center justify-center shrink-0`}>
                          <Icon className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-extrabold text-[#17492F] leading-tight">
                            {tpl.title}
                          </h3>
                          <p className="text-xs text-[#41634E] mt-1 line-clamp-2 leading-relaxed">
                            {tpl.instructions}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <StatusBadge status={tpl.status} />
                        <button
                          onClick={() => handleOpenAssignModal(tpl)}
                          className="px-2.5 py-1 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-lg text-[11px] font-bold transition shadow-xs"
                          title="Assign to student roster"
                        >
                          Assign →
                        </button>
                      </div>
                    </div>

                    {/* Metadata & Progress Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#CAD7CD]/50 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-white text-[#17492F] text-[10px] font-bold border border-[#CAD7CD]/60">
                          {tpl.module}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#DCF3E2] text-[#17492F] text-[10px] font-bold">
                          {course?.name || 'Long-Term Course'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#41634E]">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due: 15 Apr 2025</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[11px] font-bold text-[#17492F]">
                            <Users className="w-3.5 h-3.5" />
                            <span>{submittedRatio} of {totalTarget} submitted</span>
                          </span>
                          <div className="w-16 h-1.5 bg-[#CAD7CD]/60 rounded-full overflow-hidden">
                            <div className="h-full bg-[#17492F]" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (5 cols): Create Assignment Form matching Screenshot 5 */}
          <div className="lg:col-span-5 bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-[#17492F]">Create Assignment</h2>
              <p className="text-xs text-[#41634E]">Design assignment prompts or tasks for your courses.</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#17492F] mb-1">Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Writing Task 2 — Opinion Essay"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none focus:ring-1 focus:ring-[#17492F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#17492F] mb-1">Module *</label>
                <select
                  value={newModule}
                  onChange={(e: any) => setNewModule(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                >
                  <option value="Writing">Writing</option>
                  <option value="Speaking">Speaking</option>
                  <option value="Reading">Reading</option>
                  <option value="Listening">Listening</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#17492F] mb-1">Target Course *</label>
                <select
                  value={newCourseId}
                  onChange={(e: any) => setNewCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                >
                  <option value="longterm">Long-Term Course (1 month)</option>
                  <option value="shortterm">Short-Term Course (15 days)</option>
                  <option value="crash">Crash Course (1 week)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-[#17492F]">Instructions / Prompt *</label>
                  <span className="text-[10px] text-[#41634E]">{newInstructions.length}/1000</span>
                </div>
                <textarea
                  rows={3}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Write a clear opinion essay on the given topic. Use relevant examples and coherent structure."
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#17492F] mb-1">Due Date *</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#17492F] mb-1.5">Accepted File Formats *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Text', 'PDF', 'Image', 'Audio'] as const).map((fmt) => {
                    const isChecked = acceptedFormats.includes(fmt);
                    return (
                      <label
                        key={fmt}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer text-xs transition ${
                          isChecked
                            ? 'bg-[#DCF3E2] border-[#17492F]/30 text-[#17492F] font-bold'
                            : 'bg-white border-[#CAD7CD] text-[#41634E]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setAcceptedFormats(acceptedFormats.filter(f => f !== fmt));
                            } else {
                              setAcceptedFormats([...acceptedFormats, fmt]);
                            }
                          }}
                          className="w-3.5 h-3.5 text-[#17492F]"
                        />
                        <span>{fmt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Supporting Worksheet matching Screenshot 5 */}
              <div>
                <label className="block font-bold text-[#17492F] mb-1">Supporting Worksheet (Optional)</label>
                <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#CAD7CD] cursor-pointer hover:bg-[#ECE9DA]/40 transition">
                  <div className="flex items-center gap-2 text-[#41634E] text-xs">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{worksheetFile || 'Attach a file (PDF, DOC, JPG, PNG)'}</span>
                  </div>
                  <span className="px-3 py-1 bg-[#CAD7CD]/30 text-[#17492F] rounded-lg text-[11px] font-bold">
                    Browse
                  </span>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setWorksheetFile(e.target.files[0].name);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#CAD7CD]/60">
                <button
                  type="button"
                  onClick={() => handleCreateAssignment('Draft')}
                  className="px-4 py-2 bg-white hover:bg-[#ECE9DA] text-[#17492F] border border-[#CAD7CD] rounded-xl font-bold transition text-xs"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateAssignment('Published')}
                  className="px-5 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl font-bold transition text-xs shadow-xs"
                >
                  Publish Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNED WORK TABLE */}
      {topTab === 'assigned' && (
        <div className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#17492F]">Assigned Work Tracking</h3>
              <p className="text-xs text-[#41634E]">View individual student deadlines and status.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-[11px] font-bold text-[#41634E] uppercase border-b border-[#CAD7CD]/60 bg-[#ECE9DA]/50">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Assignment</th>
                  <th className="py-3 px-3">Module</th>
                  <th className="py-3 px-3">Release Date</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CAD7CD]/30">
                {assignedWorks.map((work) => {
                  const isPastDue = getDaysRemaining(work.dueDate) < 0 && work.status === 'Pending';
                  return (
                    <tr key={work.id} className="hover:bg-white/60 transition">
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#17492F]">{work.studentName}</p>
                        <p className="text-[10px] text-[#41634E]">{work.studentEmail}</p>
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#17492F]">
                        {work.assignmentTitle}
                      </td>
                      <td className="py-3 px-3 text-[#41634E]">
                        IELTS {work.module}
                      </td>
                      <td className="py-3 px-3 text-[#41634E]">
                        {formatDisplayDate(work.releaseDate)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-semibold ${isPastDue ? 'text-red-700' : 'text-[#17492F]'}`}>
                          {formatDisplayDate(work.dueDate)}
                        </span>
                        {isPastDue && (
                          <span className="block text-[10px] text-red-600 font-bold">Overdue</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={isPastDue ? 'overdue' : work.status} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        {work.submissionId ? (
                          <button
                            onClick={() => navigate(`/admin/reviews/${work.submissionId}`)}
                            className="px-3 py-1 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            Review
                          </button>
                        ) : (
                          <span className="text-[#41634E] text-[11px] italic">Awaiting submission</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUBMISSIONS QUEUE */}
      {topTab === 'submissions' && (
        <div className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#17492F]">Submissions Queue</h3>
              <p className="text-xs text-[#41634E]">Open submissions to evaluate with official criteria.</p>
            </div>
            <button
              onClick={() => navigate('/admin/reviews')}
              className="text-xs font-bold text-[#17492F] hover:underline"
            >
              Open Dedicated Review Workspace →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-[11px] font-bold text-[#41634E] uppercase border-b border-[#CAD7CD]/60 bg-[#ECE9DA]/50">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Assignment</th>
                  <th className="py-3 px-3">Submitted At</th>
                  <th className="py-3 px-3">Attempt</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CAD7CD]/30">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/60 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#17492F]">{sub.studentName}</p>
                      <p className="text-[10px] text-[#41634E]">{sub.courseName}</p>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#17492F]">
                      {sub.assignmentTitle}
                    </td>
                    <td className="py-3 px-3 text-[#41634E]">
                      {sub.submittedAt}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#17492F]">
                      Attempt {sub.attemptNumber}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/admin/reviews/${sub.id}`)}
                        className="px-3.5 py-1.5 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-lg text-xs font-bold transition shadow-xs"
                      >
                        {sub.status === 'Reviewed' ? 'View Review' : 'Grade & Feedback'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Assign Task to Students with Assignment Support Deadline Check */}
      {selectedTemplateToAssign && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign "${selectedTemplateToAssign.title}"`}
        >
          <form onSubmit={handleConfirmAssign} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#17492F] mb-1">Release Date</label>
                <input
                  type="date"
                  required
                  value={assignReleaseDate}
                  onChange={(e) => setAssignReleaseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#17492F] mb-1">Submission Deadline *</label>
                <input
                  type="date"
                  required
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                />
              </div>
            </div>

            {/* Select Students Checklist */}
            <div>
              <label className="block font-bold text-[#17492F] mb-1.5">
                Select Students ({selectedStudentIds.length} selected)
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-white rounded-xl border border-[#CAD7CD]">
                {students.map((student) => {
                  const enrolment = enrolments.find(e => e.studentId === student.id);
                  const isChecked = selectedStudentIds.includes(student.id);

                  // Warning check: Does deadline exceed student's assignment support deadline?
                  const supportExpired = enrolment && assignDueDate > enrolment.assignmentSupportUntil;

                  return (
                    <label
                      key={student.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition ${
                        isChecked ? 'bg-[#DCF3E2]' : 'hover:bg-[#F5F3E8]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                            } else {
                              setSelectedStudentIds([...selectedStudentIds, student.id]);
                            }
                          }}
                          className="w-4 h-4 text-[#17492F]"
                        />
                        <div>
                          <p className="font-bold text-[#17492F]">{student.name}</p>
                          <p className="text-[10px] text-[#41634E]">Support until: {formatDisplayDate(enrolment?.assignmentSupportUntil || '')}</p>
                        </div>
                      </div>

                      {supportExpired && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          Exceeds Support
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 bg-[#CAD7CD]/40 text-[#17492F] rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl font-bold shadow-xs"
              >
                Confirm and Assign Work
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
