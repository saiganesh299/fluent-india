import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  Users,
  BookOpen,
  FileText,
  ClipboardList,
  Star,
  Globe,
  Mail,
  Settings,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useDemoData } from '../../context/DemoDataContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { settings } = useDemoData();

  const navItems = [
    { name: 'Overview', path: '/admin', icon: Home, end: true },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Courses & Enrolments', path: '/admin/courses', icon: BookOpen },
    { name: 'Lessons & Materials', path: '/admin/materials', icon: FileText },
    { name: 'Assignments', path: '/admin/assignments', icon: ClipboardList },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Website Content', path: '/admin/content', icon: Globe },
    { name: 'Enquiries', path: '/admin/enquiries', icon: Mail },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-[260px] h-screen sticky top-0 flex flex-col justify-between p-4 bg-[#DFEFFF] select-none border-r border-[#CAD7CD]/50 shrink-0">
      {/* Top Branding */}
      <div>
        <div className="flex items-center gap-3 px-3 py-3 mb-4">
          <div className="relative w-11 h-11 rounded-xl bg-[#EFF583] border border-[#17492F]/20 flex items-center justify-center shadow-xs">
            <span className="font-extrabold text-xl text-[#17492F] tracking-tighter">FI</span>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#17492F] rounded-full border border-white flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-[#EFF583]" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#17492F] leading-tight tracking-tight">Fluent India</h1>
            <p className="text-[10px] tracking-wider font-semibold text-[#41634E] uppercase">TUTOR WORKSPACE</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-[#17492F] text-white shadow-xs'
                      : 'text-[#17492F] hover:bg-[#CAD7CD]/30 hover:text-[#0E301F]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 stroke-[2.2]" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-3 pt-4 border-t border-[#CAD7CD]/40">
        <a
          href="/website.html"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#EFF583] hover:bg-[#E5EB74] text-[#17492F] border border-[#CAD7CD] font-semibold text-xs tracking-wide transition shadow-xs"
        >
          <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>View Website</span>
        </a>

        <Link
          to="/admin/settings"
          onClick={onCloseMobile}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-[#CAD7CD]/30 transition group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#EFF583] border border-[#17492F]/20 flex items-center justify-center font-bold text-xs text-[#17492F] shrink-0">
              {settings.account.avatarInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#17492F] truncate leading-tight group-hover:text-black">
                {settings.account.tutorName}
              </p>
              <p className="text-[11px] text-[#41634E] truncate leading-tight">
                {settings.account.tutorEmail}
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#41634E] group-hover:text-[#17492F] shrink-0" />
        </Link>
      </div>
    </aside>
  );
};
