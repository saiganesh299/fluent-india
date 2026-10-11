import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ExternalLink, Sparkles } from 'lucide-react';

export const PublicWebsitePage: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col bg-[#DFEFFF] overflow-hidden">
      {/* Top Banner allowing quick switch between Public Website & Tutor Admin Panel */}
      <div className="bg-[#17492F] text-white px-4 py-2 flex items-center justify-between text-xs shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EFF583] animate-pulse" />
          <span className="font-bold">Fluent India — Public Academy Preview</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/website.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-[#EFF583] hover:underline font-semibold"
          >
            <span>Open in New Tab</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-1 bg-[#EFF583] hover:bg-[#E5EB74] text-[#17492F] rounded-lg font-bold text-xs shadow-xs transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Open Tutor Workspace →</span>
          </Link>
        </div>
      </div>

      {/* Embedded Public Website iframe */}
      <div className="flex-1 w-full h-full relative">
        <iframe
          src="/website.html"
          title="Fluent India Public Website"
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
};
