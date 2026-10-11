import React, { useState } from 'react';
import { Search, Bell, Eye, Menu, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useDemoData } from '../../context/DemoDataContext';
import { Link, useNavigate } from 'react-router-dom';

interface TopBarProps {
  onToggleMobileMenu?: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileMenu, searchTerm, onSearchChange }) => {
  const { settings, enquiries, submissions } = useDemoData();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const unreadEnquiries = enquiries.filter(e => e.status === 'New').length;
  const unreviewedSubs = submissions.filter(s => s.status === 'Submitted').length;
  const totalNotifications = unreadEnquiries + unreviewedSubs;

  return (
    <header className="sticky top-0 z-30 bg-[#DFEFFF] border-b border-[#CAD7CD]/50 px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Mobile Menu & Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-white/80 border border-[#CAD7CD] text-[#17492F]"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#41634E]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search students, assignments, enrolments or enquiries..."
            className="w-full pl-10 pr-4 py-2 bg-white/95 rounded-xl border border-[#CAD7CD] text-xs md:text-sm text-[#17492F] placeholder:text-[#41634E]/70 focus:outline-none focus:ring-2 focus:ring-[#17492F]/20 focus:border-[#17492F] transition shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#41634E] hover:text-[#17492F]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Demo Preview Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFF583] border border-[#CAD7CD] text-[#17492F] text-xs font-semibold shadow-xs">
          <Eye className="w-3.5 h-3.5 text-[#17492F]" />
          <span>Demo Preview</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-white/80 hover:bg-white border border-[#CAD7CD] text-[#17492F] transition shadow-xs"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          {/* Dropdown panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] shadow-lg p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#CAD7CD]/50">
                <span className="font-bold text-xs text-[#17492F]">Recent Academy Alerts</span>
                <span className="text-[10px] bg-[#EFF583] text-[#17492F] px-2 py-0.5 rounded-full font-bold">
                  {totalNotifications} new
                </span>
              </div>
              <div className="divide-y divide-[#CAD7CD]/30 max-h-64 overflow-y-auto mt-1">
                {submissions.filter(s => s.status === 'Submitted').map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setShowNotifications(false);
                      navigate(`/admin/reviews/${sub.id}`);
                    }}
                    className="p-2.5 hover:bg-white/60 rounded-xl cursor-pointer transition text-xs"
                  >
                    <p className="font-semibold text-[#17492F]">Awaiting Review: {sub.studentName}</p>
                    <p className="text-[11px] text-[#41634E]">{sub.assignmentTitle} submitted</p>
                  </div>
                ))}
                {enquiries.filter(e => e.status === 'New').map((enq) => (
                  <div
                    key={enq.id}
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/admin/enquiries');
                    }}
                    className="p-2.5 hover:bg-white/60 rounded-xl cursor-pointer transition text-xs"
                  >
                    <p className="font-semibold text-[#17492F]">New Lead: {enq.name}</p>
                    <p className="text-[11px] text-[#41634E]">{enq.courseInterestedIn} enquiry</p>
                  </div>
                ))}
              </div>
              <div className="pt-2 text-center border-t border-[#CAD7CD]/50 mt-1">
                <Link
                  to="/admin/reviews"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-bold text-[#17492F] hover:underline"
                >
                  View Review Queue →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User avatar circle */}
        <Link
          to="/admin/settings"
          className="w-8 h-8 rounded-full bg-[#EFF583] border border-[#17492F]/20 flex items-center justify-center font-bold text-xs text-[#17492F] shadow-xs hover:ring-2 hover:ring-[#17492F]/20 transition"
          title="Tutor Profile & Settings"
        >
          {settings.account.avatarInitials}
        </Link>
      </div>
    </header>
  );
};
