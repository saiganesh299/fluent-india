import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = status.toLowerCase().replace(/_/g, ' ');

  let bg = 'bg-[#ECE9DA] text-[#17492F]';

  if (['active', 'published', 'reviewed', 'contacted', 'ongoing'].includes(norm)) {
    bg = 'bg-[#DCF3E2] text-[#17492F] border border-[#17492F]/10';
  } else if (['submitted', 'new', 'processing', 'demo'].includes(norm)) {
    bg = 'bg-[#EFF583] text-[#17492F] border border-[#CAD7CD]';
  } else if (['material only', 'material access only', 'pending'].includes(norm)) {
    bg = 'bg-[#FFF8CC] text-[#805B00] border border-[#FFE885]';
  } else if (['completed'].includes(norm)) {
    bg = 'bg-[#D6E6F8] text-[#1B4D89] border border-[#BCD4F0]';
  } else if (['inactive', 'expired', 'overdue'].includes(norm)) {
    bg = 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]';
  } else if (['revision requested'].includes(norm)) {
    bg = 'bg-[#FFEDD5] text-[#9A3412] border border-[#FDBA74]';
  } else if (['draft'].includes(norm)) {
    bg = 'bg-[#E5E3D8] text-[#555246] border border-[#D5D2C2]';
  }

  // Display label formatting
  let label = status;
  if (status === 'material_only') label = 'Material Access';
  if (status === 'ongoing') label = 'Active';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight capitalize select-none shrink-0 ${bg} ${className}`}
    >
      {label}
    </span>
  );
};
