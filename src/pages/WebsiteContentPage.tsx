import React, { useState } from 'react';
import {
  Globe,
  User,
  BookOpen,
  Video,
  Star,
  Phone,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useDemoData } from '../context/DemoDataContext';
import { BlogPost, Testimonial } from '../types';
import { Modal } from '../components/common/Modal';

export const WebsiteContentPage: React.FC = () => {
  const {
    websiteContent,
    blogPosts,
    testimonials,
    updateWebsiteContent,
    saveBlogPost,
    deleteBlogPost,
    updateTestimonial
  } = useDemoData();

  const [activeTab, setActiveTab] = useState<'profile' | 'blogs' | 'videos' | 'testimonials' | 'contact'>('profile');

  // Blog Editor Modal
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);

  // Testimonial Modal
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);

  // Profile Form State
  const [profile, setProfile] = useState(websiteContent.tutorProfile);
  const [contact, setContact] = useState(websiteContent.contactDetails);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsiteContent({ tutorProfile: profile });
    alert('Tutor profile content updated in demo store!');
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsiteContent({ contactDetails: contact });
    alert('Contact details updated in demo store!');
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editingPost.title) return;
    saveBlogPost(
      {
        title: editingPost.title || 'Untitled Post',
        category: editingPost.category || 'IELTS Tips',
        excerpt: editingPost.excerpt || '',
        body: editingPost.body || '',
        coverImage: editingPost.coverImage || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600',
        status: editingPost.status || 'Published',
        publishedDate: editingPost.publishedDate || new Date().toISOString().split('T')[0]
      },
      editingPost.id
    );
    setEditingPost(null);
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial || !editingTestimonial.studentName) return;
    if (editingTestimonial.isVisibleOnHomepage && !editingTestimonial.hasPermissionToPublish) {
      alert('Error: You cannot publish testimonials without confirmed student permission.');
      return;
    }
    if (editingTestimonial.id) {
      updateTestimonial(editingTestimonial.id, editingTestimonial);
    }
    setEditingTestimonial(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#17492F] tracking-tight">
            Website Content
          </h1>
          <p className="text-xs md:text-sm text-[#41634E] mt-0.5">
            Manage public homepage content, tutor bio, blogs, and student reviews.
          </p>
        </div>
        <a
          href="/website.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#EFF583] hover:bg-[#E5EB74] text-[#17492F] border border-[#CAD7CD] rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Eye className="w-4 h-4" />
          <span>Preview Public Site</span>
        </a>
      </div>

      {/* 5 Tabs matching requirements */}
      <div className="flex flex-wrap gap-2 border-b border-[#CAD7CD]/60 pb-1">
        {[
          { id: 'profile', label: 'Tutor Profile', icon: User },
          { id: 'blogs', label: `Blogs (${blogPosts.length})`, icon: BookOpen },
          { id: 'videos', label: `Public Videos (${websiteContent.publicVideos.length})`, icon: Video },
          { id: 'testimonials', label: `Testimonials (${testimonials.length})`, icon: Star },
          { id: 'contact', label: 'Contact Details', icon: Phone }
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

      {/* TAB 1: TUTOR PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-6 shadow-xs max-w-3xl">
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <h2 className="text-base font-extrabold text-[#17492F]">Tutor Biography & Credentials</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#17492F] mb-1">Lead Tutor Name *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#17492F] mb-1">Professional Headline *</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#17492F] mb-1">Introduction</label>
              <textarea
                rows={3}
                value={profile.intro}
                onChange={(e) => setProfile({ ...profile, intro: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#17492F] mb-1">Teaching Methodology & Approach</label>
              <textarea
                rows={3}
                value={profile.teachingApproach}
                onChange={(e) => setProfile({ ...profile, teachingApproach: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#17492F] mb-1.5">Official Credentials (comma separated)</label>
              <input
                type="text"
                value={profile.credentials.join(', ')}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    credentials: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                  })
                }
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl font-bold transition shadow-xs text-xs"
              >
                Save Tutor Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: BLOGS */}
      {activeTab === 'blogs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-extrabold text-[#17492F]">IELTS Strategy Articles</h2>
            <button
              onClick={() =>
                setEditingPost({
                  title: '',
                  category: 'Writing Strategy',
                  excerpt: '',
                  body: '',
                  status: 'Published'
                })
              }
              className="flex items-center gap-1.5 px-4 py-2 bg-[#17492F] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#0E301F]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Blog Post</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-36 object-cover border-b border-[#CAD7CD]"
                />
                <div className="p-4 space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-[#CAD7CD]/60 text-[#17492F]">
                      {post.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${post.status === 'Published' ? 'bg-[#DCF3E2] text-[#17492F]' : 'bg-[#ECE9DA] text-[#41634E]'}`}>
                      {post.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-[#17492F] leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[#41634E] line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
                <div className="p-4 pt-0 flex justify-between items-center border-t border-[#CAD7CD]/40 mt-2">
                  <span className="text-[10px] text-[#41634E]">{post.publishedDate}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPost(post)}
                      className="p-1.5 rounded-lg bg-white hover:bg-[#ECE9DA] text-[#17492F]"
                      title="Edit Post"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBlogPost(post.id)}
                      className="p-1.5 rounded-lg bg-white hover:bg-red-50 text-red-600"
                      title="Delete Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PUBLIC VIDEOS */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-[#17492F]">Homepage Video Masterclasses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {websiteContent.publicVideos.map((vid) => (
              <div
                key={vid.id}
                className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-4 shadow-xs space-y-3"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-[#CAD7CD]">
                  <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#EFF583] text-[#17492F] flex items-center justify-center">
                      <Video className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#17492F]">{vid.title}</h3>
                  <p className="text-xs text-[#41634E] mt-1">{vid.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TESTIMONIALS (With mandatory permission check!) */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-extrabold text-[#17492F]">Student Testimonials</h2>
              <p className="text-xs text-[#41634E]">Permission-to-publish is strictly required for public display.</p>
            </div>
            <button
              onClick={() =>
                setEditingTestimonial({
                  studentName: '',
                  bandScore: 'Band 8.0',
                  quote: '',
                  hasPermissionToPublish: false,
                  isVisibleOnHomepage: false,
                  order: testimonials.length + 1
                })
              }
              className="flex items-center gap-1.5 px-4 py-2 bg-[#17492F] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#0E301F]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Testimonial</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((test) => (
              <div
                key={test.id}
                className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-5 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-[#EFF583] text-[#17492F] text-[10px] font-black border border-[#CAD7CD]">
                      {test.bandScore}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${test.isVisibleOnHomepage ? 'bg-[#DCF3E2] text-[#17492F]' : 'bg-[#ECE9DA] text-[#41634E]'}`}>
                      {test.isVisibleOnHomepage ? 'Visible on Site' : 'Hidden'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-[#17492F]">{test.studentName}</h3>
                  <p className="text-xs text-[#41634E] italic leading-relaxed">
                    "{test.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#CAD7CD]/50 flex items-center justify-between text-xs">
                  <span className={`text-[11px] font-bold ${test.hasPermissionToPublish ? 'text-emerald-700' : 'text-red-700'}`}>
                    {test.hasPermissionToPublish ? '✓ Permission Verified' : '✗ No Permission'}
                  </span>
                  <button
                    onClick={() => setEditingTestimonial(test)}
                    className="p-1 rounded text-[#17492F] hover:bg-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CONTACT DETAILS */}
      {activeTab === 'contact' && (
        <div className="bg-[#F5F3E8] rounded-2xl border border-[#CAD7CD] p-6 shadow-xs max-w-2xl">
          <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
            <h2 className="text-base font-extrabold text-[#17492F]">Academy Contact Information</h2>

            <div>
              <label className="block font-bold text-[#17492F] mb-1">Official Admissions Email *</label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#17492F] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#17492F] mb-1">WhatsApp Hotline</label>
                <input
                  type="text"
                  value={contact.whatsapp}
                  onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#17492F] mb-1">Office Hours</label>
              <input
                type="text"
                value={contact.officeHours}
                onChange={(e) => setContact({ ...contact, officeHours: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#17492F] mb-1">Public CTA Button Label</label>
              <input
                type="text"
                disabled
                value="Contact Us"
                className="w-full px-3 py-2 bg-[#CAD7CD]/30 rounded-xl border border-[#CAD7CD] text-xs font-bold text-[#17492F] cursor-not-allowed"
              />
              <p className="text-[10px] text-[#41634E] mt-0.5">Strict Rule: Public CTA label is fixed to "Contact Us".</p>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl font-bold transition shadow-xs text-xs"
              >
                Save Contact Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Edit Blog */}
      {editingPost && (
        <Modal isOpen={!!editingPost} onClose={() => setEditingPost(null)} title="Edit Strategy Blog Post">
          <form onSubmit={handleSaveBlog} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#17492F] mb-1">Article Title *</label>
              <input
                type="text"
                required
                value={editingPost.title || ''}
                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#17492F] mb-1">Category</label>
                <input
                  type="text"
                  value={editingPost.category || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#17492F] mb-1">Status</label>
                <select
                  value={editingPost.status || 'Published'}
                  onChange={(e: any) => setEditingPost({ ...editingPost, status: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-bold text-[#17492F] mb-1">Short Excerpt</label>
              <textarea
                rows={2}
                value={editingPost.excerpt || ''}
                onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#17492F] mb-1">Full Article Body</label>
              <textarea
                rows={6}
                value={editingPost.body || ''}
                onChange={(e) => setEditingPost({ ...editingPost, body: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="px-4 py-2 bg-[#CAD7CD]/40 text-[#17492F] rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl font-bold shadow-xs"
              >
                Save Post
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Edit Testimonial */}
      {editingTestimonial && (
        <Modal isOpen={!!editingTestimonial} onClose={() => setEditingTestimonial(null)} title="Manage Testimonial">
          <form onSubmit={handleSaveTestimonial} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#17492F] mb-1">Student Display Name *</label>
              <input
                type="text"
                required
                value={editingTestimonial.studentName || ''}
                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, studentName: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#17492F] mb-1">Band Score Achieved</label>
              <input
                type="text"
                value={editingTestimonial.bandScore || ''}
                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, bandScore: e.target.value })}
                placeholder="e.g. Band 8.5 (Academic)"
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#17492F] mb-1">Quote</label>
              <textarea
                rows={3}
                value={editingTestimonial.quote || ''}
                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-[#CAD7CD] text-xs text-[#17492F]"
              />
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#CAD7CD] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingTestimonial.hasPermissionToPublish || false}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, hasPermissionToPublish: e.target.checked })}
                  className="w-4 h-4 text-[#17492F]"
                />
                <span className="font-bold text-[#17492F]">Candidate gave explicit permission to publish</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingTestimonial.isVisibleOnHomepage || false}
                  disabled={!editingTestimonial.hasPermissionToPublish}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, isVisibleOnHomepage: e.target.checked })}
                  className="w-4 h-4 text-[#17492F]"
                />
                <span className={editingTestimonial.hasPermissionToPublish ? 'font-bold text-[#17492F]' : 'text-gray-400'}>
                  Show on Public Homepage
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTestimonial(null)}
                className="px-4 py-2 bg-[#CAD7CD]/40 text-[#17492F] rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#17492F] hover:bg-[#0E301F] text-white rounded-xl font-bold shadow-xs"
              >
                Save Testimonial
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
