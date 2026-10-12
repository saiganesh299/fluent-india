import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Users,
  FileText,
  Mail,
  Clock,
  UserPlus,
  PlusCircle,
  FilePlus,
  ArrowRight,
  ChevronRight,
  Calendar,
  Sparkles,
  Inbox
} from 'lucide-react';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { getDaysRemaining, getRealDateFormatted, getRealTimeFormatted, formatDisplayDate } from '../utils/dateRules';
import { Modal } from '../components/common/Modal';

export const OverviewPage: React.FC = () => {
  const { students, enrolments, submissions, enquiries, addStudent } = useDemoData();
  const navigate = useNavigate();
  const { searchTerm } = useOutletContext<{ searchTerm: string }>() || { searchTerm: '' };

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentCourse, setNewStudentCourse] = useState<'longterm' | 'shortterm' | 'crash'>('longterm');

  // Live real date and time state
  const [currentDateTime, setCurrentDateTime] = useState({
    dateStr: getRealDateFormatted(),
    timeStr: getRealTimeFormatted()
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDateTime({
        dateStr: getRealDateFormatted(now),
        timeStr: getRealTimeFormatted(now)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live metrics from actual data
  const activeEnrolments = (enrolments || []).filter(e => e.status === 'ongoing');
  const activeStudentCount = new Set(activeEnrolments.map(e => e.studentId)).size || (students || []).length;
  const awaitingReviewList = (submissions || []).filter(s => s.status === 'Submitted');
  const newEnquiriesList = (enquiries || []).filter(e => e.status === 'New');
  
  // Access expiring soon (within 30 days)
  const expiringSoonList = (enrolments || [])
    .filter(e => e.status === 'material_only')
    .map(e => ({
      ...e,
      daysLeft: getDaysRemaining(e.materialAccessUntil)
    }))
    .filter(e => e.daysLeft > 0 && e.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Grouped active counts
  const longTermCount = (enrolments || []).filter(e => e.courseId === 'longterm' && (e.status === 'ongoing' || e.status === 'material_only')).length;
  const shortTermCount = (enrolments || []).filter(e => e.courseId === 'shortterm' && (e.status === 'ongoing' || e.status === 'material_only')).length;
  const crashCount = (enrolments || []).filter(e => e.courseId === 'crash' && (e.status === 'ongoing' || e.status === 'material_only')).length;

  const handleQuickAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail) return;
    const today = new Date().toISOString().split('T')[0];
    addStudent(
      { name: newStudentName, email: newStudentEmail, targetBand: '7.5' },
      { courseId: newStudentCourse, startDate: today }
    );
    setIsAddStudentOpen(false);
    setNewStudentName('');
    setNewStudentEmail('');
    navigate('/admin/students');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with Real Live Date and Time */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#17492F] tracking-tight">
            Your teaching dashboard
          </h1>
          <p className="text-xs md:text-sm text-[#41634E] mt-0.5">
            Here’s what’s happening with your students and courses today.
          </p>
        </div>
        <div className="text-left sm:text-right bg-white/70 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-none border-[#CAD7CD]/60">
          <p className="text-xs md:text-sm font-extrabold text-[#17492F] flex items-center sm:justify-end gap-1.5">
            <Clock className="w-4 h-4 text-[#17492F]" />
            <span>{currentDateTime.dateStr} • {currentDateTime.timeStr}</span>
          </p>
          <p className="text-[11px] text-[#41634E] font-medium flex items-center sm:justify-end gap-1 mt-0.5">
            <Sparkles className="w-3 h-3 text-[#17492F]" />
            Live IELTS Academy Session
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Students */}
        <div
          onClick={() => navigate('/admin/students')}
          className="bg-[#F5F3E8] p-5 rounded-2xl border border-[#CAD7CD]/80 hover:border-[#17492F]/40 transition shadow-xs cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#DCF3E2] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-[#17492F]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#41634E]">Active Students</p>
              <h2 className="text-2xl font-black text-[#17492F] tracking-tight">{activeStudentCount}</h2>
            </div>
          </div>
          <p className="text-[11px] text-[#41634E] mt-3">Currently enrolled across all courses</p>
        </div>

        {/* Awaiting Review */}
        <div
          onClick={() => navigate('/admin/reviews')}
          className="bg-[#F5F3E8] p-5 rounded-2xl border border-[#CAD7CD]/80 hover:border-[#17492F]/40 transition shadow-xs cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FFF8CC] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-[#17492F]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#41634E]">Awaiting Review</p>
              <h2 className="text-2xl font-black text-[#17492F] tracking-tight">{awaitingReviewList.length}</h2>
            </div>
          </div>
          <p className="text-[11px] text-[#41634E] mt-3">Assignments submitted by students</p>
        </div>

        {/* New Enquiries */}
        <div
          onClick={() => navigate('/admin/enquiries')}
          className="bg-[#F5F3E8] p-5 rounded-2xl border border-[#CAD7CD]/80 hover:border-[#17492F]/40 transition shadow-xs cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FFF8CC] flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-[#17492F]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#41634E]">New Enquiries</p>
              <h2 className="text-2xl font-black text-[#17492F] tracking-tight">{newEnquiriesList.length}</h2>
            </div>
          </div>
          <p className="text-[11px] text-[#41634E] mt-3">From website contact form</p>
        </div>

        {/* Access Expiring Soon */}
        <div
          onClick={() => navigate('/admin/students')}
          className="bg-[#F5F3E8] p-5 rounded-2xl border border-[#CAD7CD]/80 hover:border-[#17492F]/40 transition shadow-xs cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FFF8CC] flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-[#17492F]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#41634E]">Access Expiring Soon</p>
                <h2 className="text-2xl font-black text-[#17492F] tracking-tight">
                  {expiringSoonList.length}
                </h2>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#41634E] group-hover:translate-x-1 transition" />
          </div>
          <p className="text-[11px] text-[#41634E] mt-3">Student access ends within 30 days</p>
        </div>
      </div>

      {/* Quick actions bar */}
      <div className="bg-[#EFF583]/40 border border-[#CAD7CD] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-[#17492F]">Quick actions</h2>
          <p className="text-xs text-[#41634E]">Save time with these common tasks.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
          <button
            onClick={() => navigate('/admin/materials')}
            className="flex items-center gap-2 px-4 py-2 bg-[#F5F3E8] hover:bg-[#ECE9DA] text-[#17492F] border border-[#CAD7CD] rounded-xl text-xs font-bold transition shadow-xs"
          >
            <FilePlus className="w-4 h-4" />
            <span>Add Lesson</span>
          </button>
          <button
            onClick={() => navigate('/admin/assignments')}
            className="flex items-center gap-2 px-4 py-2 bg-[#F5F3E8] hover:bg-[#ECE9DA] text-[#17492F] border border-[#CAD7CD] rounded-xl text-xs font-bold transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* 2-Column Main Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Review Queue & Recent Enquiries */}
        <div className="lg:col-span-8 space-y-6">
          {/* Assignment review queue */}
          <div className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#CAD7CD]/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#DCF3E2] text-[#17492F]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#17492F]">Assignment review queue</h2>
                  <p className="text-xs text-[#41634E]">Students are waiting for your feedback.</p>
                </div>
              </div>
              <Link
                to="/admin/reviews"
                className="text-xs font-bold text-[#17492F] hover:underline flex items-center gap-1"
              >
                <span>View all assignments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Table or Empty State */}
            {awaitingReviewList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] font-bold text-[#41634E] uppercase border-b border-[#CAD7CD]/60">
                      <th className="pb-2.5 font-bold">Student</th>
                      <th className="pb-2.5 font-bold">Assignment</th>
                      <th className="pb-2.5 font-bold">Submitted</th>
                      <th className="pb-2.5 font-bold">Status</th>
                      <th className="pb-2.5 text-right font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CAD7CD]/30 text-xs">
                    {awaitingReviewList.slice(0, 4).map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/50 transition">
                        <td className="py-3 pr-2">
                          <p className="font-bold text-[#17492F] leading-tight">{sub.studentName}</p>
                          <p className="text-[10px] text-[#41634E] leading-tight">{sub.courseName.split('(')[0]}</p>
                        </td>
                        <td className="py-3 px-2">
                          <p className="font-bold text-[#17492F]">{sub.assignmentTitle}</p>
                          <p className="text-[10px] text-[#41634E]">IELTS {sub.module}</p>
                        </td>
                        <td className="py-3 px-2 text-[#41634E] whitespace-nowrap">
                          {sub.submittedAt}
                        </td>
                        <td className="py-3 px-2">
                          <StatusBadge status={sub.status} />
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <Link
                            to={`/admin/reviews/${sub.id}`}
                            className="px-3 py-1 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-lg text-xs font-semibold transition inline-block shadow-xs"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center bg-white/50 rounded-xl border border-dashed border-[#CAD7CD] p-6 space-y-2">
                <Inbox className="w-8 h-8 text-[#41634E]/50 mx-auto" />
                <p className="text-xs font-bold text-[#17492F]">No assignments awaiting review</p>
                <p className="text-[11px] text-[#41634E]">
                  When students submit essay responses or speaking recordings, they will appear here for grading.
                </p>
              </div>
            )}
          </div>

          {/* Recent Enquiries */}
          <div className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#CAD7CD]/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#FFF8CC] text-[#17492F]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#17492F]">Recent enquiries</h2>
                  <p className="text-xs text-[#41634E]">Latest enquiries from your website.</p>
                </div>
              </div>
              <Link
                to="/admin/enquiries"
                className="text-xs font-bold text-[#17492F] hover:underline flex items-center gap-1"
              >
                <span>View all enquiries</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(enquiries || []).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-[11px] font-bold text-[#41634E] uppercase border-b border-[#CAD7CD]/60">
                      <th className="pb-2.5">Name</th>
                      <th className="pb-2.5">Email</th>
                      <th className="pb-2.5">Course Interested In</th>
                      <th className="pb-2.5">Received</th>
                      <th className="pb-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CAD7CD]/30">
                    {(enquiries || []).slice(0, 4).map((enq) => (
                      <tr
                        key={enq.id}
                        onClick={() => navigate('/admin/enquiries')}
                        className="hover:bg-white/50 cursor-pointer transition"
                      >
                        <td className="py-2.5 font-bold text-[#17492F]">{enq.name}</td>
                        <td className="py-2.5 text-[#41634E]">{enq.email}</td>
                        <td className="py-2.5 text-[#17492F] font-medium">{enq.courseInterestedIn}</td>
                        <td className="py-2.5 text-[#41634E] whitespace-nowrap">{enq.receivedAt.split(' ')[0]}</td>
                        <td className="py-2.5 text-right">
                          <StatusBadge status={enq.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center bg-white/50 rounded-xl border border-dashed border-[#CAD7CD] p-6 space-y-2">
                <Mail className="w-8 h-8 text-[#41634E]/50 mx-auto" />
                <p className="text-xs font-bold text-[#17492F]">No enquiries yet</p>
                <p className="text-[11px] text-[#41634E]">
                  Inquiries received from your website contact form will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Active Enrolments & Access Reminders */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Enrolments */}
          <div className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-[#CAD7CD]/50">
              <div className="p-2 rounded-lg bg-[#DCF3E2] text-[#17492F]">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#17492F]">Active Enrolments</h2>
                <p className="text-xs text-[#41634E]">Your active courses and student count.</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Long-Term */}
              <div
                onClick={() => navigate('/admin/courses')}
                className="p-3.5 bg-white/70 hover:bg-white rounded-xl border border-[#CAD7CD]/60 flex items-center justify-between cursor-pointer transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#D6E6F8] text-[#1B4D89] flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#17492F]">Long-Term Course</h3>
                    <p className="text-[11px] text-[#41634E]">1 calendar month</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-[#17492F]">{longTermCount}</span>
                    <span className="text-[10px] text-[#41634E] block">students</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#41634E] group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Short-Term */}
              <div
                onClick={() => navigate('/admin/courses')}
                className="p-3.5 bg-white/70 hover:bg-white rounded-xl border border-[#CAD7CD]/60 flex items-center justify-between cursor-pointer transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#DCF3E2] text-[#17492F] flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#17492F]">Short-Term Course</h3>
                    <p className="text-[11px] text-[#41634E]">15 days duration</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-[#17492F]">{shortTermCount}</span>
                    <span className="text-[10px] text-[#41634E] block">students</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#41634E] group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Crash Course */}
              <div
                onClick={() => navigate('/admin/courses')}
                className="p-3.5 bg-white/70 hover:bg-white rounded-xl border border-[#CAD7CD]/60 flex items-center justify-between cursor-pointer transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF8CC] text-[#805B00] flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#17492F]">Crash Course</h3>
                    <p className="text-[11px] text-[#41634E]">7 days duration</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-[#17492F]">{crashCount}</span>
                    <span className="text-[10px] text-[#41634E] block">students</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#41634E] group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>
          </div>

          {/* Access Reminders */}
          <div className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-[#CAD7CD]/50">
              <div className="p-2 rounded-lg bg-[#FFF8CC] text-[#17492F]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#17492F]">Access reminders</h2>
                <p className="text-[11px] text-[#41634E]">Student access ends 3 months after course completion.</p>
              </div>
            </div>

            {expiringSoonList.length > 0 ? (
              <div className="space-y-3">
                {expiringSoonList.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1">
                    <div>
                      <p className="font-bold text-[#17492F]">{item.studentName}</p>
                      <p className="text-[10px] text-[#41634E]">{item.courseName.split('(')[0]}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#EFF583] text-[#17492F] text-[10px] font-bold border border-[#CAD7CD]">
                      {item.daysLeft} days left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-[11px] text-[#41634E] italic bg-white/40 rounded-xl p-3">
                No access expiries approaching in the next 30 days.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Student Modal */}
      <Modal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} title="Add Student & Enrol">
        <form onSubmit={handleQuickAddStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#17492F] mb-1">Student Full Name *</label>
            <input
              type="text"
              required
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none focus:ring-2 focus:ring-[#17492F]/20"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#17492F] mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
              placeholder="e.g. rahul@example.com"
              className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none focus:ring-2 focus:ring-[#17492F]/20"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#17492F] mb-1">Select Course *</label>
            <select
              value={newStudentCourse}
              onChange={(e: any) => setNewStudentCourse(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none focus:ring-2 focus:ring-[#17492F]/20"
            >
              <option value="longterm">Long-Term Course (1 calendar month)</option>
              <option value="shortterm">Short-Term Course (15 days)</option>
              <option value="crash">Crash Course (7 days)</option>
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddStudentOpen(false)}
              className="px-4 py-2 bg-[#CAD7CD]/40 hover:bg-[#CAD7CD]/60 text-[#17492F] rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Add and Enrol
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
