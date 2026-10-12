import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Search,
  Phone,
  MessageSquare,
  UserPlus,
  CheckCircle,
  Clock,
  MoreVertical,
  Save,
  Check
} from 'lucide-react';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Enquiry, EnquiryStatus } from '../types';

export const EnquiriesPage: React.FC = () => {
  const { enquiries, updateEnquiryStatus, saveEnquiryNotes, convertEnquiryToStudent } = useDemoData();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<'All' | EnquiryStatus>('All');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>(enquiries[0]?.id || '');

  React.useEffect(() => {
    if (!selectedEnquiryId && enquiries.length > 0) {
      setSelectedEnquiryId(enquiries[0].id);
    }
  }, [enquiries, selectedEnquiryId]);

  const selectedEnquiry = enquiries.find(e => e.id === selectedEnquiryId) || (enquiries.length > 0 ? enquiries[0] : null);
  const [notes, setNotes] = useState<string>(selectedEnquiry?.tutorNotes || '');

  // Keep notes synced
  React.useEffect(() => {
    if (selectedEnquiry) {
      setNotes(selectedEnquiry.tutorNotes || '');
    }
  }, [selectedEnquiryId, selectedEnquiry]);

  // Compute status metrics
  const allCount = enquiries.length;
  const newCount = enquiries.filter(e => e.status === 'New').length;
  const contactedCount = enquiries.filter(e => e.status === 'Contacted').length;
  const enrolledCount = enquiries.filter(e => e.status === 'Enrolled').length;

  const filteredEnquiries = enquiries.filter(e => {
    const matchSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone.includes(searchTerm);
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchCourse = courseFilter === 'all' || e.courseInterestedIn.toLowerCase().includes(courseFilter.toLowerCase());
    return matchSearch && matchStatus && matchCourse;
  });

  const handleSaveNotes = () => {
    if (!selectedEnquiry) return;
    saveEnquiryNotes(selectedEnquiry.id, notes);
    alert('Follow-up notes saved successfully.');
  };

  const handleMarkContacted = () => {
    if (!selectedEnquiry) return;
    updateEnquiryStatus(selectedEnquiry.id, 'Contacted');
  };

  const handleCreateStudent = () => {
    if (!selectedEnquiry) return;
    try {
      const student = convertEnquiryToStudent(selectedEnquiry.id);
      alert(`Student profile for "${student.name}" prepared in Student Roster! Redirecting to student enrolment...`);
      navigate('/admin/students');
    } catch (err: any) {
      alert(err.message || 'Error converting enquiry to student.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#17492F] tracking-tight">
          Admissions & Enquiries
        </h1>
        <p className="text-xs md:text-sm text-[#41634E] mt-0.5">
          Follow up with prospective students who registered interest on the website.
        </p>
      </div>

      {/* 4 Status Metric Cards matching requirements */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { id: 'All', label: 'All Leads', count: allCount, bg: 'bg-[#F5F3E8]' },
          { id: 'New', label: 'New Enquiries', count: newCount, bg: 'bg-[#FFF8CC]' },
          { id: 'Contacted', label: 'Contacted', count: contactedCount, bg: 'bg-[#DCF3E2]' },
          { id: 'Enrolled', label: 'Enrolled', count: enrolledCount, bg: 'bg-[#D6E6F8]' }
        ].map((card) => {
          const isSelected = statusFilter === card.id;
          return (
            <div
              key={card.id}
              onClick={() => setStatusFilter(card.id as any)}
              className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs flex items-center justify-between ${card.bg} ${
                isSelected ? 'border-[#17492F] ring-2 ring-[#17492F]/20' : 'border-[#CAD7CD]/80 hover:border-[#17492F]/40'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-[#41634E]">{card.label}</p>
                <h3 className="text-2xl font-black text-[#17492F] tracking-tight">{card.count}</h3>
              </div>
              <Mail className="w-5 h-5 text-[#17492F]/40" />
            </div>
          );
        })}
      </div>

      {/* Split layout: Enquiries Table (7 cols) and Detail Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Filters & Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#F5F3E8] p-3 rounded-2xl border border-[#CAD7CD] flex flex-wrap items-center gap-3 shadow-xs">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#41634E]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leads by name, email or phone..."
                className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
              />
            </div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-3 py-1.5 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
            >
              <option value="all">All Courses</option>
              <option value="Long-Term">Long-Term Course</option>
              <option value="Short-Term">Short-Term Course</option>
              <option value="Crash">Crash Course</option>
            </select>
          </div>

          <div className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-[11px] font-bold text-[#41634E] uppercase border-b border-[#CAD7CD]/60 bg-[#ECE9DA]/50">
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-3">Interested Course</th>
                    <th className="py-3 px-3">Received</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CAD7CD]/30">
                  {filteredEnquiries.map((enq) => {
                    const isSelected = enq.id === selectedEnquiry?.id;
                    return (
                      <tr
                        key={enq.id}
                        onClick={() => setSelectedEnquiryId(enq.id)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-[#EFF583]/50 font-medium' : 'hover:bg-white/60'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#17492F]">{enq.name}</p>
                          <p className="text-[10px] text-[#41634E]">{enq.email}</p>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-[#17492F]">{enq.courseInterestedIn}</p>
                          {enq.targetBand && (
                            <span className="text-[10px] text-[#41634E]">Target: Band {enq.targetBand}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[#41634E] whitespace-nowrap">
                          {enq.receivedAt.split(' ')[0]}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <StatusBadge status={enq.status} />
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEnquiries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-[#41634E] space-y-2.5">
                          <div className="w-10 h-10 rounded-full bg-[#DFEFFF] flex items-center justify-center text-[#17492F]">
                            <Mail className="w-5 h-5" />
                          </div>
                          <p className="font-bold text-sm text-[#17492F]">No enquiries at this time</p>
                          <p className="text-xs text-[#41634E] leading-relaxed">
                            {enquiries.length === 0
                              ? "Prospective candidates who fill out the contact form on your public website will appear here in real time."
                              : "No enquiries match your search or filter."}
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

        {/* Right Column (5 cols): Detailed Enquiry Drawer & Notes or Empty State Card */}
        {selectedEnquiry ? (
          <div className="lg:col-span-5 bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#CAD7CD]/60">
              <div>
                <h2 className="text-base font-extrabold text-[#17492F]">{selectedEnquiry.name}</h2>
                <p className="text-xs text-[#41634E] mt-0.5">{selectedEnquiry.email}</p>
              </div>
              <StatusBadge status={selectedEnquiry.status} />
            </div>

            {/* Quick Contact Info */}
            <div className="p-3 bg-white/80 rounded-xl border border-[#CAD7CD]/70 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#41634E]">Phone Number:</span>
                <strong className="text-[#17492F]">{selectedEnquiry.phone}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#41634E]">Interested Course:</span>
                <strong className="text-[#17492F]">{selectedEnquiry.courseInterestedIn}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#41634E]">Target IELTS Band:</span>
                <strong className="text-[#17492F]">Band {selectedEnquiry.targetBand || '7.5'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#41634E]">Enquiry Date:</span>
                <span className="text-[#17492F] font-medium">{selectedEnquiry.receivedAt}</span>
              </div>
            </div>

            {/* Candidate Message */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-[#17492F] block">Candidate Message</label>
              <div className="p-3 bg-white rounded-xl border border-[#CAD7CD]/80 text-[#17492F] leading-relaxed italic">
                "{selectedEnquiry.message}"
              </div>
            </div>

            {/* Status Selector */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-[#17492F] block">Lead Status</label>
              <select
                value={selectedEnquiry.status}
                onChange={(e: any) => updateEnquiryStatus(selectedEnquiry.id, e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs font-bold text-[#17492F]"
              >
                <option value="New">New Lead</option>
                <option value="Contacted">Contacted</option>
                <option value="Enrolled">Enrolled</option>
              </select>
            </div>

            {/* Follow-up Notes */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <label className="font-bold text-[#17492F]">Tutor Follow-up Notes</label>
                <button
                  onClick={handleSaveNotes}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#17492F] hover:underline"
                >
                  <Save className="w-3 h-3" />
                  <span>Save Notes</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Record consultation discussion, preferred batch time, diagnostic test results..."
                className="w-full p-2.5 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
              />
            </div>

            {/* Actions: Mark Contacted & Create Student */}
            <div className="pt-2 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={handleMarkContacted}
                  className="flex-1 py-2 bg-white hover:bg-[#ECE9DA] text-[#17492F] border border-[#CAD7CD] rounded-xl font-bold text-xs transition"
                >
                  Mark as Contacted
                </button>
                <button
                  onClick={handleCreateStudent}
                  className="flex-1 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Student</span>
                </button>
              </div>
              <p className="text-[10px] text-[#41634E] text-center italic">
                *Note: Creating a student profile prepares their account. Lead is marked Enrolled once course enrolment is confirmed.
              </p>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-5 bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-8 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-[340px]">
            <div className="w-14 h-14 rounded-2xl bg-[#DFEFFF] border border-[#CAD7CD] flex items-center justify-center text-[#17492F]">
              <Mail className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-[#17492F] text-base">No Enquiry Selected</h3>
            <p className="text-xs text-[#41634E] max-w-xs leading-relaxed">
              Select an admissions lead from the table to review contact details, log follow-up calls, or onboard as an enrolled candidate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
