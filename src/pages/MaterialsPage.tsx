import React, { useState } from 'react';
import {
  FileText,
  BookOpen,
  Headphones,
  MessageSquare,
  Plus,
  Play,
  FileCode,
  Paperclip,
  MoreVertical,
  CheckCircle,
  Video,
  UploadCloud,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { Lesson, ModuleType, LessonStatus, CourseId } from '../types';

export const MaterialsPage: React.FC = () => {
  const { lessons, courses, addLesson, updateLesson, deleteLesson } = useDemoData();

  const [activeModuleTab, setActiveModuleTab] = useState<string>('All');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessons[0]?.id || '');
  const [isNewLessonModalOpen, setIsNewLessonModalOpen] = useState(false);

  // Active lesson being edited
  const currentLesson = lessons.find(l => l.id === selectedLessonId) || lessons[0];

  // Form edit state for current lesson
  const [title, setTitle] = useState(currentLesson?.title || '');
  const [module, setModule] = useState<ModuleType>(currentLesson?.module || 'Writing');
  const [order, setOrder] = useState(currentLesson?.order || '01');
  const [assignedCourses, setAssignedCourses] = useState<CourseId[]>(currentLesson?.assignedCourseIds || ['longterm']);
  const [description, setDescription] = useState(currentLesson?.description || '');
  const [videoUrl, setVideoUrl] = useState(currentLesson?.videoUrl || '');

  // Keep form fields synced when selecting a different lesson
  React.useEffect(() => {
    if (currentLesson) {
      setTitle(currentLesson.title);
      setModule(currentLesson.module);
      setOrder(currentLesson.order);
      setAssignedCourses(currentLesson.assignedCourseIds);
      setDescription(currentLesson.description);
      setVideoUrl(currentLesson.videoUrl || '');
    }
  }, [selectedLessonId, currentLesson]);

  // Filter lessons
  const filteredLessons = lessons.filter(l => {
    const matchModule = activeModuleTab === 'All' || l.module === activeModuleTab;
    const matchCourse = selectedCourseFilter === 'all' || l.assignedCourseIds.includes(selectedCourseFilter as CourseId);
    return matchModule && matchCourse;
  });

  const getModuleIcon = (mod: ModuleType) => {
    switch (mod) {
      case 'Writing': return FileText;
      case 'Reading': return BookOpen;
      case 'Listening': return Headphones;
      case 'Speaking': return MessageSquare;
      default: return FileText;
    }
  };

  const handleSaveDraft = () => {
    if (!currentLesson) return;
    updateLesson(currentLesson.id, {
      title,
      module,
      order,
      assignedCourseIds: assignedCourses,
      description,
      videoUrl,
      status: 'Draft'
    });
    alert('Lesson saved as Draft.');
  };

  const handlePublishLesson = () => {
    if (!currentLesson) return;
    updateLesson(currentLesson.id, {
      title,
      module,
      order,
      assignedCourseIds: assignedCourses,
      description,
      videoUrl,
      status: 'Published'
    });
    alert('Lesson published successfully to all assigned courses!');
  };

  const handleAddFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !currentLesson) return;
    const file = e.target.files[0];
    const newFile = {
      id: `f-${Date.now()}`,
      name: file.name,
      size: `${Math.round(file.size / 1024)} KB`,
      type: file.type || 'application/pdf'
    };
    updateLesson(currentLesson.id, {
      files: [...currentLesson.files, newFile]
    });
  };

  const handleRemoveFile = (fileId: string) => {
    if (!currentLesson) return;
    updateLesson(currentLesson.id, {
      files: currentLesson.files.filter(f => f.id !== fileId)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#17492F] tracking-tight">
            Lessons & Materials
          </h1>
          <p className="text-xs md:text-sm text-[#41634E] mt-0.5">
            Create and manage lesson content for your IELTS courses.
          </p>
        </div>
        <button
          onClick={() => {
            const newL = addLesson({
              title: 'New Masterclass Lesson',
              module: 'Writing',
              order: String(lessons.length + 1).padStart(2, '0'),
              assignedCourseIds: ['longterm', 'shortterm'],
              status: 'Draft',
              description: 'Add lesson overview, learning goals, and assignment prompts.',
              videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
              files: []
            });
            setSelectedLessonId(newL.id);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Lesson</span>
        </button>
      </div>

      {/* Top Filter and Module Tabs Bar matching Screenshot 4 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-[#CAD7CD]/60">
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Listening', 'Reading', 'Writing', 'Speaking'].map((mod) => (
            <button
              key={mod}
              onClick={() => setActiveModuleTab(mod)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeModuleTab === mod
                  ? 'bg-[#EFF583] text-[#17492F] border border-[#CAD7CD]'
                  : 'bg-[#F5F3E8] text-[#17492F] hover:bg-[#ECE9DA]'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#41634E]">Course:</span>
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#F5F3E8] rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none"
          >
            <option value="all">All Courses</option>
            <option value="longterm">Long-Term Course (1 month)</option>
            <option value="shortterm">Short-Term Course (15 days)</option>
            <option value="crash">Crash Course (1 week)</option>
          </select>
        </div>
      </div>

      {/* Split View matching Screenshot 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Lesson List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#17492F] px-1">
            <span>Lessons ({filteredLessons.length})</span>
            <span className="text-[#41634E] text-[11px]">Sort by: Order</span>
          </div>

          <div className="space-y-2.5">
            {filteredLessons.map((les) => {
              const Icon = getModuleIcon(les.module);
              const isSelected = les.id === currentLesson?.id;

              return (
                <div
                  key={les.id}
                  onClick={() => setSelectedLessonId(les.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 shadow-xs ${
                    isSelected
                      ? 'bg-[#EFF583]/50 border-[#CAD7CD] ring-1 ring-[#17492F]/20'
                      : 'bg-[#F5F3E8] border-[#CAD7CD]/80 hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#CAD7CD]/80 flex items-center justify-center text-[#17492F] shrink-0">
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-[#17492F] truncate leading-tight">
                        {les.title}
                      </h3>
                      <p className="text-[11px] text-[#41634E] mt-0.5">
                        {les.module} • Order {les.order}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={les.status} />
                    <button className="p-1 text-[#41634E] hover:text-[#17492F]">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Lesson Editor matching Screenshot 4 (7 cols) */}
        {currentLesson && (
          <div className="lg:col-span-7 bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#CAD7CD]/60">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#17492F]">Edit Lesson</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DCF3E2] text-[#17492F] text-[10px] font-bold border border-[#17492F]/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  {currentLesson.status}
                </span>
              </div>
              <button
                onClick={() => deleteLesson(currentLesson.id)}
                className="text-xs text-red-600 hover:underline font-bold"
              >
                Delete Lesson
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#17492F] mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F] focus:outline-none focus:ring-1 focus:ring-[#17492F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#17492F] mb-1">Module *</label>
                  <select
                    value={module}
                    onChange={(e: any) => setModule(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                  >
                    <option value="Writing">Writing</option>
                    <option value="Reading">Reading</option>
                    <option value="Listening">Listening</option>
                    <option value="Speaking">Speaking</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#17492F] mb-1">Lesson Order *</label>
                  <input
                    type="text"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#17492F] mb-1">Assigned Courses</label>
                <div className="flex flex-wrap gap-2">
                  {courses.map((c) => {
                    const isChecked = assignedCourses.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'bg-[#17492F] text-white border-[#17492F]'
                            : 'bg-white text-[#17492F] border-[#CAD7CD]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setAssignedCourses(assignedCourses.filter(id => id !== c.id));
                            } else {
                              setAssignedCourses([...assignedCourses, c.id]);
                            }
                          }}
                        />
                        <span>{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#17492F] mb-1">Lesson Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                />
              </div>

              {/* Video Player Section matching Screenshot 4 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#17492F]">Video Class</label>
                  <span className="text-[11px] text-[#41634E] flex items-center gap-1 font-semibold">
                    <Video className="w-3.5 h-3.5" />
                    Demo Video Player
                  </span>
                </div>
                <div className="relative rounded-2xl overflow-hidden bg-[#17492F] border border-[#CAD7CD] aspect-video flex items-center justify-center shadow-inner">
                  {videoUrl ? (
                    <video
                      controls
                      src={videoUrl}
                      className="w-full h-full object-cover"
                      poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"
                    />
                  ) : (
                    <div className="text-center text-white/80 p-4">
                      <Play className="w-10 h-10 mx-auto mb-2 text-[#EFF583]" />
                      <p className="text-xs font-bold text-white">No video linked</p>
                      <p className="text-[10px] text-white/60">Enter an MP4 or streaming URL below</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Files / Materials Section matching Screenshot 4 */}
              <div className="space-y-2 pt-2 border-t border-[#CAD7CD]/50">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#17492F]">Files / Worksheets</label>
                  <label className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-[#ECE9DA] text-[#17492F] rounded-lg border border-[#CAD7CD] text-[11px] font-bold cursor-pointer transition">
                    <Paperclip className="w-3 h-3" />
                    <span>+ Add File</span>
                    <input type="file" onChange={handleAddFileAttachment} className="hidden" />
                  </label>
                </div>

                <div className="space-y-2">
                  {currentLesson.files && currentLesson.files.length > 0 ? (
                    currentLesson.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#CAD7CD]/80"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-lg bg-red-100 text-red-600">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#17492F] text-xs truncate">{file.name}</p>
                            <p className="text-[10px] text-[#41634E]">{file.size}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(file.id)}
                          className="p-1 text-[#41634E] hover:text-red-600 transition"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-[#41634E] italic">No worksheets attached yet.</p>
                  )}
                </div>
              </div>

              {/* Actions: Save Draft and Publish Lesson */}
              <div className="flex justify-end items-center gap-3 pt-3 border-t border-[#CAD7CD]/60">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-white hover:bg-[#ECE9DA] text-[#17492F] border border-[#CAD7CD] rounded-xl font-bold transition text-xs"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handlePublishLesson}
                  className="px-5 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl font-bold transition text-xs shadow-xs"
                >
                  Publish Lesson
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
