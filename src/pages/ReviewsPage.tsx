import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Search, CheckCircle, Clock, ArrowRight, FileText, User } from 'lucide-react';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const ReviewsPage: React.FC = () => {
  const { submissions } = useDemoData();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filtered = submissions.filter(s => {
    const matchSearch =
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.assignmentTitle.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchModule = filterModule === 'all' || s.module === filterModule;
    return matchSearch && matchStatus && matchModule;
  });

  const pendingCount = submissions.filter(s => s.status === 'Submitted').length;
  const reviewedCount = submissions.filter(s => s.status === 'Reviewed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#17492F] tracking-tight">
            Review Queue
          </h1>
          <p className="text-xs md:text-sm text-[#41634E] mt-0.5">
            Evaluate student essays, speaking clips, and provide practice band scores.
          </p>
        </div>
      </div>

      {/* Filter and stats row */}
      <div className="bg-[#F5F3E8] p-4 rounded-2xl border border-[#CAD7CD] flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#41634E]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate or task..."
              className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
          >
            <option value="all">All Statuses ({submissions.length})</option>
            <option value="Submitted">Awaiting Review ({pendingCount})</option>
            <option value="Reviewed">Reviewed ({reviewedCount})</option>
            <option value="Revision Requested">Revision Requested</option>
          </select>
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="px-3 py-1.5 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
          >
            <option value="all">All Modules</option>
            <option value="Writing">Writing</option>
            <option value="Speaking">Speaking</option>
            <option value="Reading">Reading</option>
            <option value="Listening">Listening</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-[#FFF8CC] text-[#17492F] font-bold border border-[#CAD7CD]">
            {pendingCount} Awaiting Feedback
          </span>
          <span className="px-3 py-1 rounded-full bg-[#DCF3E2] text-[#17492F] font-bold">
            {reviewedCount} Completed
          </span>
        </div>
      </div>

      {/* Table of Submissions */}
      <div className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[11px] font-bold text-[#41634E] uppercase border-b border-[#CAD7CD]/60 bg-[#ECE9DA]/50">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-3">Assignment & Module</th>
                <th className="py-3 px-3">Submitted At</th>
                <th className="py-3 px-3">Attempt</th>
                <th className="py-3 px-3">Practice Band</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CAD7CD]/30">
              {filtered.map((sub) => (
                <tr
                  key={sub.id}
                  onClick={() => navigate(`/admin/reviews/${sub.id}`)}
                  className="hover:bg-white/60 cursor-pointer transition"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#EFF583] text-[#17492F] font-bold text-xs flex items-center justify-center shrink-0">
                        {sub.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-[#17492F]">{sub.studentName}</p>
                        <p className="text-[11px] text-[#41634E]">{sub.courseName.split('(')[0]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-[#17492F]">{sub.assignmentTitle}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-[#CAD7CD]/60 font-semibold text-[#17492F]">
                      IELTS {sub.module}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[#41634E]">
                    {sub.submittedAt}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-[#17492F]">
                    Attempt {sub.attemptNumber}
                  </td>
                  <td className="py-3.5 px-3">
                    {sub.review?.practiceBand ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#EFF583] text-[#17492F] font-black text-xs border border-[#CAD7CD]">
                        Band {sub.review.practiceBand}
                      </span>
                    ) : (
                      <span className="text-[#41634E] italic text-[11px]">Pending eval</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/reviews/${sub.id}`);
                      }}
                      className="px-4 py-1.5 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      {sub.status === 'Reviewed' ? 'Edit Review' : 'Open Review'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-[#41634E] space-y-2.5">
                      <div className="w-10 h-10 rounded-full bg-[#DFEFFF] flex items-center justify-center text-[#17492F]">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-sm text-[#17492F]">All caught up!</p>
                      <p className="text-xs text-[#41634E] leading-relaxed">
                        {submissions.length === 0
                          ? "No student submissions are awaiting evaluation. When students complete essays or audio tasks, they will appear in this review queue."
                          : "No submissions found matching your search or filters."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
