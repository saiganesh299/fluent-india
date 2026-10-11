import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Bell,
  User,
  RotateCcw,
  Clock,
  Sparkles,
  AlertTriangle,
  Calendar,
  Save,
  CheckCircle
} from 'lucide-react';
import { useDemoData } from '../context/DemoDataContext';
import { Modal } from '../components/common/Modal';
import { calculateCourseEndDate, calculateMaterialAccessExpiry, formatDisplayDate, getTodayIso } from '../utils/dateRules';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToDefaults } = useDemoData();

  const [activeTab, setActiveTab] = useState<'access' | 'notifications' | 'branding' | 'account'>('access');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Access Rules state
  const [bufferMonths, setBufferMonths] = useState(settings.accessRules.defaultMaterialBufferMonths);
  const [allowSubmissionsDuringBuffer, setAllowSubmissionsDuringBuffer] = useState(settings.accessRules.allowSubmissionsDuringBuffer);

  // Interactive Timeline Preview state
  const [previewCourse, setPreviewCourse] = useState<'longterm' | 'shortterm' | 'crash'>('longterm');
  const [previewStartDate, setPreviewStartDate] = useState(getTodayIso());

  // Notifications state
  const [notifications, setNotifications] = useState(settings.notifications);

  // Account state
  const [account, setAccount] = useState(settings.account);

  // Calculated preview dates
  const previewEndDate = calculateCourseEndDate(previewStartDate, previewCourse);
  const previewMaterialExpiry = calculateMaterialAccessExpiry(previewEndDate, bufferMonths);

  const handleSaveAccessRules = () => {
    updateSettings({
      accessRules: {
        defaultMaterialBufferMonths: bufferMonths,
        allowSubmissionsDuringBuffer
      }
    });
    alert('Access rules updated. New settings will apply to future enrolments.');
  };

  const handleSaveNotifications = () => {
    updateSettings({ notifications });
    alert('Notification preferences saved.');
  };

  const handleSaveAccount = () => {
    updateSettings({ account });
    alert('Tutor profile settings updated.');
  };

  const handleResetConfirmed = () => {
    resetToDefaults();
    setIsResetConfirmOpen(false);
    alert('Demo data has been reset to default state.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#17492F] tracking-tight">
          Academy Settings & Access Rules
        </h1>
        <p className="text-xs md:text-sm text-[#41634E] mt-0.5">
          Configure business rules, 3-month material buffers, notifications, and demo state.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#CAD7CD]/60 pb-1">
        {[
          { id: 'access', label: 'Access Rules & Timeline', icon: Clock },
          { id: 'notifications', label: 'Notification Alerts', icon: Bell },
          { id: 'account', label: 'Tutor Account', icon: User }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-[#17492F] text-white shadow-xs'
                  : 'bg-[#F5F3E8] text-[#17492F] hover:bg-[#ECE9DA]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ACCESS RULES & TIMELINE PREVIEW */}
      {activeTab === 'access' && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-[#17492F]">Material Access & Support Policy</h2>
              <p className="text-xs text-[#41634E] mt-0.5">
                Configure default course completion buffers and assignment submission rules.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Default buffer */}
              <div>
                <label className="block font-bold text-[#17492F] mb-1">
                  Default Extended Material Access Buffer
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={bufferMonths}
                    onChange={(e) => setBufferMonths(Number(e.target.value))}
                    className="px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs font-bold text-[#17492F]"
                  >
                    <option value={1}>1 Calendar Month</option>
                    <option value={2}>2 Calendar Months</option>
                    <option value={3}>3 Calendar Months (Fluent India Standard Policy)</option>
                    <option value={6}>6 Calendar Months</option>
                  </select>
                  <span className="text-[11px] text-[#41634E]">after course completion date</span>
                </div>
              </div>

              {/* Toggle: allow submissions during buffer */}
              <div className="p-3.5 bg-white rounded-xl border border-[#CAD7CD] space-y-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowSubmissionsDuringBuffer}
                    onChange={(e) => setAllowSubmissionsDuringBuffer(e.target.checked)}
                    className="w-4 h-4 text-[#17492F] rounded"
                  />
                  <span className="font-bold text-[#17492F] text-xs">
                    Allow assignment submissions during extended material buffer
                  </span>
                </label>
                <p className="text-[11px] text-[#41634E] pl-7">
                  Default is disabled: assignment support ends when teaching period ends, while access to recorded classes and PDFs continues through the 3-month expiry.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveAccessRules}
                  className="px-5 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Save Access Rules
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Timeline Calculator Preview */}
          <div className="bg-[#EFF583]/40 rounded-2xl border border-[#CAD7CD] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#17492F]" />
              <h2 className="text-sm font-extrabold text-[#17492F]">Interactive Timeline Calculator Preview</h2>
            </div>
            <p className="text-xs text-[#41634E]">
              Test how start dates calculate end dates and 3-month material buffers before enrolling students.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#17492F] mb-1">Test Course</label>
                <select
                  value={previewCourse}
                  onChange={(e: any) => setPreviewCourse(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                >
                  <option value="longterm">Long-Term Course (1 calendar month)</option>
                  <option value="shortterm">Short-Term Course (15 days)</option>
                  <option value="crash">Crash Course (7 days)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#17492F] mb-1">Test Start Date (Day 1)</label>
                <input
                  type="date"
                  value={previewStartDate}
                  onChange={(e) => setPreviewStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-[#CAD7CD] text-xs">
              <div>
                <span className="text-[#41634E] block text-[11px]">Start Date (Day 1)</span>
                <strong className="text-sm text-[#17492F]">{formatDisplayDate(previewStartDate)}</strong>
              </div>
              <div>
                <span className="text-[#41634E] block text-[11px]">Course End Date</span>
                <strong className="text-sm text-[#17492F]">{formatDisplayDate(previewEndDate)}</strong>
              </div>
              <div>
                <span className="text-[#41634E] block text-[11px]">Material Expiry (+3 Months)</span>
                <strong className="text-sm text-[#17492F]">{formatDisplayDate(previewMaterialExpiry)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-6 shadow-xs max-w-2xl space-y-5">
          <div>
            <h2 className="text-base font-extrabold text-[#17492F]">In-App Notification Preferences</h2>
            <p className="text-xs text-[#41634E] mt-0.5">
              Configure dashboard alerts and reminder thresholds. (Simulated in-app demo).
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { key: 'newEnquiry', label: 'New student lead or enquiry received from homepage' },
              { key: 'assignmentSubmitted', label: 'Assignment response uploaded by enrolled student' },
              { key: 'feedbackPublished', label: 'Tutor feedback and band score evaluation published' },
              { key: 'materialExpiryReminder', label: 'Material access expiration warning (within reminder interval)' }
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#CAD7CD]/80 cursor-pointer"
              >
                <span className="font-bold text-[#17492F]">{item.label}</span>
                <input
                  type="checkbox"
                  checked={(notifications as any)[item.key]}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      [item.key]: e.target.checked
                    })
                  }
                  className="w-4 h-4 text-[#17492F] rounded"
                />
              </label>
            ))}

            <div className="p-3 bg-white rounded-xl border border-[#CAD7CD]/80 flex items-center justify-between">
              <div>
                <p className="font-bold text-[#17492F]">Material Access Reminder Interval</p>
                <p className="text-[10px] text-[#41634E]">Alert when candidate has fewer days remaining</p>
              </div>
              <select
                value={notifications.reminderIntervalDays}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    reminderIntervalDays: Number(e.target.value)
                  })
                }
                className="px-3 py-1.5 bg-[#F5F3E8] border border-[#CAD7CD] rounded-lg font-bold text-xs"
              >
                <option value={7}>7 Days Prior</option>
                <option value={14}>14 Days Prior</option>
                <option value={30}>30 Days Prior</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveNotifications}
                className="px-5 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Save Notification Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNT & DEMO RESET */}
      {activeTab === 'account' && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-[#17492F]">Tutor Account Information</h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-[#17492F] mb-1">Display Name</label>
                <input
                  type="text"
                  value={account.tutorName}
                  onChange={(e) => setAccount({ ...account, tutorName: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#17492F] mb-1">Email Address</label>
                <input
                  type="email"
                  value={account.tutorEmail}
                  onChange={(e) => setAccount({ ...account, tutorEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                />
              </div>
            </div>

            <div className="p-3 bg-[#EFF583]/40 border border-[#CAD7CD] rounded-xl text-[11px] text-[#17492F]">
              <strong>Notice:</strong> This is an interactive demo workspace prototype. Production authentication and cloud role tokens are not connected.
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveAccount}
                className="px-5 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Save Account Profile
              </button>
            </div>
          </div>

          {/* Reset Demo Data Danger Card */}
          <div className="bg-[#FEE2E2]/60 rounded-2xl border border-[#FCA5A5] p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-extrabold">Reset Demo Data</h3>
            </div>
            <p className="text-xs text-red-900 leading-relaxed">
              Reset all student records, course enrolments, submitted essays, and enquiries back to the initial seeded test suite.
            </p>
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Application Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Reset Demo Data */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Confirm Reset Demo Records"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#17492F]">
            Are you sure you want to restore initial demo data? Any custom students, lessons, or evaluation drafts you created will be reset.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsResetConfirmOpen(false)}
              className="px-4 py-2 bg-[#CAD7CD]/40 text-[#17492F] rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleResetConfirmed}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold"
            >
              Yes, Reset Everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
