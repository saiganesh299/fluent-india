import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  User,
  Clock,
  Paperclip,
  CheckCircle,
  AlertCircle,
  Star,
  Award,
  Sparkles,
  Download,
  UploadCloud,
  FileCheck,
  History
} from 'lucide-react';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const ReviewDetailPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { submissions, completeReview, saveReviewDraft, requestRevision } = useDemoData();

  const submission = submissions.find(s => s.id === submissionId) || submissions[0];

  // Review form state
  const [practiceBand, setPracticeBand] = useState<string>(submission?.review?.practiceBand || '7.5');
  const [taScore, setTaScore] = useState<number>(submission?.review?.criteriaScores?.ta || 7.5);
  const [ccScore, setCcScore] = useState<number>(submission?.review?.criteriaScores?.cc || 7.5);
  const [lrScore, setLrScore] = useState<number>(submission?.review?.criteriaScores?.lr || 7.0);
  const [graScore, setGraScore] = useState<number>(submission?.review?.criteriaScores?.gra || 7.5);
  const [feedbackNotes, setFeedbackNotes] = useState<string>(
    submission?.review?.feedbackNotes ||
      'Clear thesis and logical progression across paragraphs. To push toward Band 8.0, refine article precision in paragraph 3 and employ a wider range of academic collocations.'
  );
  const [correctedFileName, setCorrectedFileName] = useState<string>(submission?.review?.correctedFile || '');

  // Tab in left panel: 'answer' | 'attachments' | 'history'
  const [leftTab, setLeftTab] = useState<'answer' | 'attachments' | 'history'>('answer');

  useEffect(() => {
    if (submission?.review) {
      setPracticeBand(submission.review.practiceBand);
      setTaScore(submission.review.criteriaScores.ta);
      setCcScore(submission.review.criteriaScores.cc);
      setLrScore(submission.review.criteriaScores.lr);
      setGraScore(submission.review.criteriaScores.gra);
      setFeedbackNotes(submission.review.feedbackNotes);
      setCorrectedFileName(submission.review.correctedFile || '');
    }
  }, [submission]);

  if (!submission) {
    return (
      <div className="p-8 text-center bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD]">
        <p className="text-sm font-bold text-[#17492F]">Submission not found.</p>
        <Link to="/admin/reviews" className="text-xs font-bold text-[#17492F] underline mt-2 block">
          Return to Review Queue
        </Link>
      </div>
    );
  }

  // Calculate overall practice average
  const computedBand = ((taScore + ccScore + lrScore + graScore) / 4).toFixed(1);

  const handleSaveDraft = () => {
    saveReviewDraft(submission.id, {
      practiceBand,
      criteriaScores: { ta: taScore, cc: ccScore, lr: lrScore, gra: graScore },
      feedbackNotes,
      correctedFile: correctedFileName
    });
    alert('Feedback draft saved successfully.');
  };

  const handleRequestRevision = () => {
    const notes = prompt('Enter notes for student revision request:', 'Please revise paragraph 2 with additional supporting evidence and resubmit.');
    if (notes) {
      requestRevision(submission.id, notes);
      alert('Revision requested from student.');
      navigate('/admin/reviews');
    }
  };

  const handleMarkReviewed = () => {
    completeReview(submission.id, {
      practiceBand,
      criteriaScores: { ta: taScore, cc: ccScore, lr: lrScore, gra: graScore },
      feedbackNotes,
      correctedFile: correctedFileName
    });
    alert('Evaluation published! Student profile, review queue, and dashboard counts have been updated.');
    navigate('/admin/reviews');
  };

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/reviews"
            className="p-2 rounded-xl bg-[#F5F3E8] hover:bg-[#ECE9DA] border border-[#CAD7CD] text-[#17492F] transition shadow-xs"
            title="Back to Review Queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-[#17492F] tracking-tight">
                Review: {submission.assignmentTitle}
              </h1>
              <StatusBadge status={submission.status} />
            </div>
            <p className="text-xs text-[#41634E] mt-0.5">
              Candidate: <strong>{submission.studentName}</strong> • {submission.courseName} • Attempt {submission.attemptNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSaveDraft}
            className="px-3.5 py-1.5 bg-white hover:bg-[#ECE9DA] text-[#17492F] border border-[#CAD7CD] rounded-xl text-xs font-bold transition"
          >
            Save Draft
          </button>
          <button
            onClick={handleRequestRevision}
            className="px-3.5 py-1.5 bg-[#FFF8CC] hover:bg-[#FFE885] text-[#805B00] border border-[#FFE885] rounded-xl text-xs font-bold transition"
          >
            Request Revision
          </button>
          <button
            onClick={handleMarkReviewed}
            className="px-4 py-1.5 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Reviewed</span>
          </button>
        </div>
      </div>

      {/* Split-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL (7 cols): Student Submission & Typed Response */}
        <div className="lg:col-span-7 bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white/80 rounded-xl border border-[#CAD7CD]/70 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#EFF583] text-[#17492F] font-bold flex items-center justify-center shrink-0">
                  {submission.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-[#17492F]">{submission.studentName}</p>
                  <p className="text-[11px] text-[#41634E]">{submission.studentEmail}</p>
                </div>
              </div>
              <div className="text-right text-[11px] text-[#41634E]">
                <p>Submitted: <strong className="text-[#17492F]">{submission.submittedAt}</strong></p>
                <p>Word Count: <strong className="text-[#17492F]">{submission.wordCount || 288} words</strong></p>
              </div>
            </div>

            {/* Left Tabs: Typed Answer / Attachments / Submission History */}
            <div className="flex gap-2 border-b border-[#CAD7CD]/60 pb-1">
              <button
                onClick={() => setLeftTab('answer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  leftTab === 'answer' ? 'bg-[#17492F] text-white' : 'text-[#17492F] hover:bg-white/50'
                }`}
              >
                Typed Response
              </button>
              <button
                onClick={() => setLeftTab('attachments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  leftTab === 'attachments' ? 'bg-[#17492F] text-white' : 'text-[#17492F] hover:bg-white/50'
                }`}
              >
                Attachments ({submission.attachedFiles.length})
              </button>
              <button
                onClick={() => setLeftTab('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  leftTab === 'history' ? 'bg-[#17492F] text-white' : 'text-[#17492F] hover:bg-white/50'
                }`}
              >
                Attempt History (Attempt {submission.attemptNumber})
              </button>
            </div>

            {/* Tab: Typed Answer */}
            {leftTab === 'answer' && (
              <div className="p-4 bg-white rounded-xl border border-[#CAD7CD]/80 font-sans text-xs text-[#17492F] leading-relaxed whitespace-pre-line max-h-[480px] overflow-y-auto shadow-inner">
                {submission.typedAnswer}
              </div>
            )}

            {/* Tab: Attachments */}
            {leftTab === 'attachments' && (
              <div className="space-y-2 p-2 bg-white rounded-xl border border-[#CAD7CD]/80 min-h-[200px]">
                {submission.attachedFiles.length > 0 ? (
                  submission.attachedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-[#F5F3E8] rounded-xl border border-[#CAD7CD]/60 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-[#17492F]" />
                        <div>
                          <p className="font-bold text-[#17492F]">{f.name}</p>
                          <p className="text-[10px] text-[#41634E]">{f.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Simulated download: ${f.name}`)}
                        className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-[#ECE9DA] text-[#17492F] rounded-lg border border-[#CAD7CD] text-xs font-bold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-center text-xs text-[#41634E] italic">No files attached to this submission.</p>
                )}
              </div>
            )}

            {/* Tab: History */}
            {leftTab === 'history' && (
              <div className="p-3 bg-white rounded-xl border border-[#CAD7CD]/80 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#17492F]">
                  <History className="w-4 h-4" />
                  <span>Submission Lifecycle</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-[#41634E]">
                  <p>• Attempt 1: Submitted on {submission.submittedAt}</p>
                  {submission.attemptNumber > 1 && (
                    <p>• Attempt 2: Re-submitted following tutor line-by-line notes.</p>
                  )}
                  {submission.review && (
                    <p className="text-[#17492F] font-semibold">
                      • Evaluated by {submission.review.tutorName} with estimated Band {submission.review.practiceBand}.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL (5 cols): Tutor Evaluation & Band Descriptor Rubric */}
        <div className="lg:col-span-5 bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-[#17492F] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#17492F]" />
              <span>Tutor Evaluation Workspace</span>
            </h2>
            <p className="text-[11px] text-[#41634E] mt-0.5">
              Practice assessment estimate for study guidance. (Not official IELTS score).
            </p>
          </div>

          {/* Practice Band Estimate selector */}
          <div className="bg-[#EFF583]/40 border border-[#CAD7CD] rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#17492F]">Practice Band Estimate</p>
              <p className="text-[10px] text-[#41634E]">Average criteria score: {computedBand}</p>
            </div>
            <select
              value={practiceBand}
              onChange={(e) => setPracticeBand(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#CAD7CD] rounded-xl text-sm font-black text-[#17492F] focus:outline-none"
            >
              {['5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'].map(band => (
                <option key={band} value={band}>Band {band}</option>
              ))}
            </select>
          </div>

          {/* 4 Official Criteria Scores */}
          <div className="space-y-2.5 text-xs">
            <label className="font-bold text-[#17492F] block">Official Assessment Criteria (0 - 9)</label>

            {/* Task Achievement */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#CAD7CD]/80">
              <div>
                <p className="font-bold text-[#17492F]">Task Achievement (TA)</p>
                <p className="text-[10px] text-[#41634E]">Prompt coverage, full position & support</p>
              </div>
              <input
                type="number"
                min="0"
                max="9"
                step="0.5"
                value={taScore}
                onChange={(e) => setTaScore(parseFloat(e.target.value) || 0)}
                className="w-14 px-2 py-1 bg-[#F5F3E8] border border-[#CAD7CD] rounded-lg text-center font-bold text-[#17492F]"
              />
            </div>

            {/* Coherence & Cohesion */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#CAD7CD]/80">
              <div>
                <p className="font-bold text-[#17492F]">Coherence & Cohesion (CC)</p>
                <p className="text-[10px] text-[#41634E]">Paragraphing, logical linking & flow</p>
              </div>
              <input
                type="number"
                min="0"
                max="9"
                step="0.5"
                value={ccScore}
                onChange={(e) => setCcScore(parseFloat(e.target.value) || 0)}
                className="w-14 px-2 py-1 bg-[#F5F3E8] border border-[#CAD7CD] rounded-lg text-center font-bold text-[#17492F]"
              />
            </div>

            {/* Lexical Resource */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#CAD7CD]/80">
              <div>
                <p className="font-bold text-[#17492F]">Lexical Resource (LR)</p>
                <p className="text-[10px] text-[#41634E]">Vocabulary flexibility, collocations & spelling</p>
              </div>
              <input
                type="number"
                min="0"
                max="9"
                step="0.5"
                value={lrScore}
                onChange={(e) => setLrScore(parseFloat(e.target.value) || 0)}
                className="w-14 px-2 py-1 bg-[#F5F3E8] border border-[#CAD7CD] rounded-lg text-center font-bold text-[#17492F]"
              />
            </div>

            {/* Grammatical Range & Accuracy */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#CAD7CD]/80">
              <div>
                <p className="font-bold text-[#17492F]">Grammatical Range (GRA)</p>
                <p className="text-[10px] text-[#41634E]">Complex sentence structures & error-free clauses</p>
              </div>
              <input
                type="number"
                min="0"
                max="9"
                step="0.5"
                value={graScore}
                onChange={(e) => setGraScore(parseFloat(e.target.value) || 0)}
                className="w-14 px-2 py-1 bg-[#F5F3E8] border border-[#CAD7CD] rounded-lg text-center font-bold text-[#17492F]"
              />
            </div>
          </div>

          {/* Line-by-Line Tutor Feedback */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-[#17492F] block">Tutor Line-by-Line Feedback</label>
            <textarea
              rows={4}
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              className="w-full p-3 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
              placeholder="Provide constructive, detailed feedback with specific sentences to revise..."
            />
          </div>

          {/* Corrected Attachment Upload */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-[#17492F] block">Corrected File Attachment</label>
            <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#CAD7CD] cursor-pointer hover:bg-[#ECE9DA]/40 transition">
              <div className="flex items-center gap-2 text-[#41634E]">
                <UploadCloud className="w-4 h-4 text-[#17492F]" />
                <span className="truncate">{correctedFileName || 'Attach marked-up PDF / audio feedback'}</span>
              </div>
              <span className="px-2.5 py-1 bg-[#CAD7CD]/30 text-[#17492F] rounded-lg text-[10px] font-bold shrink-0">
                Browse
              </span>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files?.[0]) setCorrectedFileName(e.target.files[0].name);
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleMarkReviewed}
              className="w-full py-2.5 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Publish Evaluation & Band Score</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
