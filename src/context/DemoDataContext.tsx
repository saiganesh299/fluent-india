import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  Enrolment,
  Course,
  Lesson,
  AssignmentTemplate,
  AssignedWork,
  Submission,
  Enquiry,
  BlogPost,
  Testimonial,
  WebsiteContent,
  AppSettings,
  CourseId
} from '../types';
import {
  calculateCourseEndDate,
  calculateMaterialAccessExpiry,
  computeEnrolmentStatus,
  formatDateIso,
  getTodayIso,
  getRealDateTimeString
} from '../utils/dateRules';

interface DemoDataContextType {
  students: Student[];
  enrolments: Enrolment[];
  courses: Course[];
  lessons: Lesson[];
  assignmentTemplates: AssignmentTemplate[];
  assignedWorks: AssignedWork[];
  submissions: Submission[];
  enquiries: Enquiry[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  websiteContent: WebsiteContent;
  settings: AppSettings;
  
  // Student Actions
  addStudent: (data: Partial<Student>, enrolmentData?: { courseId: CourseId; startDate: string; group?: any; assignmentSupportUntil?: string }) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  
  // Enrolment Actions
  createEnrolment: (data: { studentId: string; courseId: CourseId; startDate: string; group?: any; schedule?: string; liveClassUrl?: string; customAssignmentSupportUntil?: string }) => Enrolment;
  extendMaterialAccess: (enrolmentId: string, newExpiryDate: string) => void;
  updateAssignmentSupport: (enrolmentId: string, newSupportDate: string) => void;
  updateEnrolment: (enrolmentId: string, updates: Partial<Enrolment>) => void;

  // Course Actions
  updateCourse: (id: CourseId, updates: Partial<Course>) => void;

  // Lesson Actions
  addLesson: (lesson: Omit<Lesson, 'id' | 'updatedAt'>) => Lesson;
  updateLesson: (id: string, updates: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;

  // Assignment Actions
  createAssignmentTemplate: (template: Omit<AssignmentTemplate, 'id' | 'totalSubmissionsCount' | 'createdAt'>) => AssignmentTemplate;
  updateAssignmentTemplate: (id: string, updates: Partial<AssignmentTemplate>) => void;
  assignTemplateToStudents: (templateId: string, studentIds: string[], releaseDate: string, dueDate: string) => void;
  
  // Review Actions
  saveReviewDraft: (submissionId: string, reviewData: any) => void;
  completeReview: (submissionId: string, reviewData: any) => void;
  requestRevision: (submissionId: string, revisionNotes: string) => void;

  // Enquiry Actions
  updateEnquiryStatus: (id: string, status: Enquiry['status'], notes?: string) => void;
  saveEnquiryNotes: (id: string, notes: string) => void;
  convertEnquiryToStudent: (enquiryId: string) => Student;

  // Website Content & Blogs
  updateWebsiteContent: (updates: Partial<WebsiteContent>) => void;
  saveBlogPost: (post: Omit<BlogPost, 'id'>, id?: string) => void;
  deleteBlogPost: (id: string) => void;
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => void;

  // Settings & Reset
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'fluent_india_academy_clean_v5';

const initialCourses: Course[] = [
  {
    id: 'longterm',
    name: 'Long-Term Course',
    durationLabel: '1 month duration',
    durationDays: 30,
    isCalendarMonth: true,
    description: 'Comprehensive IELTS preparation with structured learning, daily classes, and personal essay feedback.',
    modules: ['Listening', 'Reading', 'Writing', 'Speaking'],
    fee: '₹14,999',
    contactForFees: true,
    isActive: true
  },
  {
    id: 'shortterm',
    name: 'Short-Term Course',
    durationLabel: '15 days duration',
    durationDays: 15,
    description: 'Focused preparation for quick band improvement, targeted grammar precision, and mock speaking.',
    modules: ['Listening', 'Reading', 'Writing', 'Speaking'],
    fee: '₹8,999',
    contactForFees: true,
    isActive: true
  },
  {
    id: 'crash',
    name: 'Crash Course',
    durationLabel: '1 week duration',
    durationDays: 7,
    description: 'Intensive training for last-minute exam readiness, high-yield templates, and time management.',
    modules: ['Listening', 'Reading', 'Writing', 'Speaking'],
    fee: '₹4,999',
    contactForFees: true,
    isActive: true
  }
];

function generateCleanInitialData() {
  const todayStr = getTodayIso();

  // Reusable Curriculum Lessons
  const lessons: Lesson[] = [
    {
      id: 'les-1',
      title: 'Writing Task 2 Structure & Thesis Formula',
      module: 'Writing',
      order: '01',
      assignedCourseIds: ['longterm', 'shortterm'],
      status: 'Published',
      description: 'Master the 4-paragraph master formula for IELTS Academic and General opinion essays. Includes cohesion markers and argument development.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      videoTitle: 'Writing Task 2 Masterclass (12:34)',
      files: [
        { id: 'f-1', name: 'Essay-planning-notes.pdf', size: '248 KB', type: 'application/pdf' },
        { id: 'f-2', name: 'task-2-worksheet.pdf', size: '312 KB', type: 'application/pdf' }
      ],
      updatedAt: todayStr
    },
    {
      id: 'les-2',
      title: 'Reading: Skimming & Scanning Speed Practice',
      module: 'Reading',
      order: '02',
      assignedCourseIds: ['longterm', 'shortterm', 'crash'],
      status: 'Published',
      description: 'High-speed diagnostic strategies to locate keywords under strict 20-minute per passage exam conditions.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      videoTitle: 'Reading Speed Techniques (18:10)',
      files: [
        { id: 'f-3', name: 'Skimming-speed-guide.pdf', size: '180 KB', type: 'application/pdf' },
        { id: 'f-4', name: 'Reading-Passage-3-Mock.pdf', size: '420 KB', type: 'application/pdf' }
      ],
      updatedAt: todayStr
    },
    {
      id: 'les-3',
      title: 'Listening Practice: Section 4 Monologue Mastery',
      module: 'Listening',
      order: '03',
      assignedCourseIds: ['longterm'],
      status: 'Draft',
      description: 'Handling academic lectures with no pause, signpost words, and preventing plural/singular spelling mistakes.',
      files: [
        { id: 'f-5', name: 'Audio-Transcript-Lecture.pdf', size: '150 KB', type: 'application/pdf' }
      ],
      updatedAt: todayStr
    },
    {
      id: 'les-4',
      title: 'Speaking Part 2 Cue Card Fluency & Idioms',
      module: 'Speaking',
      order: '04',
      assignedCourseIds: ['longterm', 'shortterm'],
      status: 'Published',
      description: 'Techniques for speaking 2 full minutes without hesitation using the Past-Present-Future storytelling structure.',
      files: [
        { id: 'f-6', name: 'Cue-Card-Templates.pdf', size: '510 KB', type: 'application/pdf' }
      ],
      updatedAt: todayStr
    }
  ];

  // Reusable Assignment Library Templates (Clean - 0 mock student submissions)
  const assignmentTemplates: AssignmentTemplate[] = [
    {
      id: 'tpl-1',
      title: 'Writing Task 2 — Opinion Essay',
      module: 'Writing',
      targetCourseId: 'longterm',
      instructions: 'Write a clear opinion essay on the given prompt. Use relevant examples and coherent paragraphing. Minimum 250 words.',
      promptContent: 'Some people believe that artificial intelligence will create more jobs than it eliminates in healthcare, while others argue it poses a serious threat to professional medical employment. Discuss both views and give your own opinion.',
      acceptedFormats: ['Text', 'PDF', 'Image'],
      worksheetName: 'IELTS-Task2-BandDescriptors.pdf',
      worksheetSize: '180 KB',
      status: 'Published',
      totalSubmissionsCount: 0,
      createdAt: todayStr
    },
    {
      id: 'tpl-2',
      title: 'Speaking Part 2 — Audio Recording',
      module: 'Speaking',
      targetCourseId: 'shortterm',
      instructions: 'Record your response for the given cue card. Speak for 1–2 minutes without pausing. Focus on natural fluency and grammatical range.',
      promptContent: 'Describe an environmental problem that your country is currently facing. You should say: what the problem is, how long it has existed, what causes it, and explain what steps can be taken to solve it.',
      acceptedFormats: ['Audio', 'Text'],
      worksheetName: 'Speaking-Pronunciation-Rubric.pdf',
      worksheetSize: '95 KB',
      status: 'Published',
      totalSubmissionsCount: 0,
      createdAt: todayStr
    },
    {
      id: 'tpl-3',
      title: 'Reading Practice — 3 Passages Diagnostic',
      module: 'Reading',
      targetCourseId: 'crash',
      instructions: 'Read the three passages and answer all 40 questions within 60 minutes. Focus on True/False/Not Given and Heading Matching.',
      promptContent: 'Passage 1: The Migration Patterns of Monarch Butterflies\nPassage 2: The Urban Architecture of Ancient Mesopotamia\nPassage 3: Neuroplasticity in Second-Language Acquisition',
      acceptedFormats: ['Text', 'PDF'],
      worksheetName: 'Reading-Diagnostic-AnswerSheet.pdf',
      worksheetSize: '340 KB',
      status: 'Published',
      totalSubmissionsCount: 0,
      createdAt: todayStr
    },
    {
      id: 'tpl-4',
      title: 'Listening Practice — Section 4 Note Completion',
      module: 'Listening',
      targetCourseId: 'longterm',
      instructions: 'Listen to the academic recording and complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      promptContent: 'Lecture title: Marine Biodiversity in Coral Reef Habitats. Questions 31-40.',
      acceptedFormats: ['Text', 'PDF'],
      worksheetName: 'Listening-Section4-Notes.pdf',
      worksheetSize: '120 KB',
      status: 'Draft',
      totalSubmissionsCount: 0,
      createdAt: todayStr
    }
  ];

  // Website Content
  const websiteContent: WebsiteContent = {
    tutorProfile: {
      name: 'Lead IELTS Coach',
      title: 'IELTS Master Coach & Linguistic Specialist',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      intro: 'Helping candidates achieve Band 7.5+ for Ivy League universities and global migration.',
      teachingApproach: 'Diagnosis-driven, criterion-focused training. Actionable line-by-line essay reviews, speaking diagnostics, and targeted grammar drills.',
      credentials: [
        'Certified British Council IELTS Trainer',
        'Official Band 9.0 Achiever (Academic)',
        'Cambridge CELTA Certified Instructor'
      ]
    },
    contactDetails: {
      email: 'admissions@fluentindia.in',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      officeHours: 'Monday – Saturday, 9:00 AM – 7:00 PM IST',
      ctaLabel: 'Contact Us'
    },
    publicVideos: [
      {
        id: 'vid-1',
        title: 'IELTS Writing Task 2 Cohesion Masterclass',
        description: 'Watch how to connect paragraphs effortlessly with high-scoring transitional markers.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
        isPublished: true
      }
    ]
  };

  const blogPosts: BlogPost[] = [
    {
      id: 'post-1',
      title: 'How to Achieve Band 8.0 in IELTS Writing Task 2',
      category: 'Writing Strategy',
      excerpt: 'Learn the exact 4-paragraph essay structure, cohesive linking phrases, and vocabulary to reach Band 8.0+.',
      body: 'Writing Task 2 carries double the weight of Task 1 in your overall IELTS Writing score. Examiners evaluate your script across four criteria: Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy...',
      coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
      status: 'Published',
      publishedDate: todayStr
    }
  ];

  const testimonials: Testimonial[] = [];

  const settings: AppSettings = {
    branding: {
      academyName: 'Fluent India',
      tagline: 'Speak Confidently, Succeed Globally.'
    },
    accessRules: {
      defaultMaterialBufferMonths: 3,
      allowSubmissionsDuringBuffer: false
    },
    notifications: {
      newEnquiry: true,
      assignmentSubmitted: true,
      feedbackPublished: true,
      materialExpiryReminder: true,
      reminderIntervalDays: 7
    },
    account: {
      tutorName: 'Tutor Admin',
      tutorEmail: 'tutor@fluentindia.in',
      avatarInitials: 'TU'
    }
  };

  return {
    students: [] as Student[],
    enrolments: [] as Enrolment[],
    courses: initialCourses,
    lessons,
    assignmentTemplates,
    assignedWorks: [] as AssignedWork[],
    submissions: [] as Submission[],
    enquiries: [] as Enquiry[],
    blogPosts,
    testimonials,
    websiteContent,
    settings
  };
}

const DemoDataContext = createContext<DemoDataContextType | undefined>(undefined);

export const DemoDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState(() => {
    // Clear out old mock data caches if present
    try {
      localStorage.removeItem('fluent_india_demo_data_v2');
      localStorage.removeItem('fluent_india_demo_data_v1');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved data', e);
    }
    return generateCleanInitialData();
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data', e);
    }
  }, [data]);

  // Recalculate status of all enrolments periodically
  useEffect(() => {
    setData((prev: any) => {
      let changed = false;
      const updatedEnrolments = (prev.enrolments || []).map((enr: Enrolment) => {
        const computed = computeEnrolmentStatus(enr.startDate, enr.courseEndDate, enr.materialAccessUntil);
        if (computed !== enr.status) {
          changed = true;
          return { ...enr, status: computed };
        }
        return enr;
      });
      return changed ? { ...prev, enrolments: updatedEnrolments } : prev;
    });
  }, []);

  // Actions
  const addStudent = (studentData: Partial<Student>, enrolmentData?: { courseId: CourseId; startDate: string; group?: any; assignmentSupportUntil?: string }) => {
    const studentId = `stu-${Date.now()}`;
    const initials = studentData.name
      ? studentData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : 'ST';

    const currentIsoDate = getTodayIso();
    const currentDateTime = getRealDateTimeString();

    let newEnrolment: Enrolment | null = null;
    if (enrolmentData) {
      const course = data.courses.find((c: Course) => c.id === enrolmentData.courseId) || data.courses[0];
      const startDate = enrolmentData.startDate || currentIsoDate;
      const endDate = calculateCourseEndDate(startDate, course.id);
      const materialExpiry = calculateMaterialAccessExpiry(endDate, data.settings.accessRules.defaultMaterialBufferMonths);
      const supportDeadline = enrolmentData.assignmentSupportUntil || endDate;

      newEnrolment = {
        id: `enr-${Date.now()}`,
        studentId,
        studentName: studentData.name || 'New Student',
        studentEmail: studentData.email || 'student@example.com',
        courseId: course.id,
        courseName: course.name,
        startDate,
        courseEndDate: endDate,
        materialAccessUntil: materialExpiry,
        assignmentSupportUntil: supportDeadline,
        group: enrolmentData.group || 'Morning',
        status: computeEnrolmentStatus(startDate, endDate, materialExpiry),
        createdAt: currentDateTime
      };
    }

    const newStudent: Student = {
      id: studentId,
      name: studentData.name || 'New Student',
      email: studentData.email || 'student@example.com',
      phone: studentData.phone || '',
      avatarInitials: initials,
      targetBand: studentData.targetBand || '7.5',
      stream: studentData.stream || 'Academic',
      enrolmentIds: newEnrolment ? [newEnrolment.id] : [],
      currentEnrolmentId: newEnrolment ? newEnrolment.id : undefined,
      createdAt: currentDateTime,
      recentActivity: [
        {
          id: `act-${Date.now()}`,
          action: 'Student Profile Created',
          detail: newEnrolment ? `Enrolled in ${newEnrolment.courseName}` : 'Profile added to workspace',
          date: currentIsoDate,
          type: 'enrolment'
        }
      ]
    };

    setData((prev: any) => ({
      ...prev,
      students: [newStudent, ...(prev.students || [])],
      enrolments: newEnrolment ? [newEnrolment, ...(prev.enrolments || [])] : (prev.enrolments || [])
    }));

    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setData((prev: any) => ({
      ...prev,
      students: (prev.students || []).map((s: Student) => (s.id === id ? { ...s, ...updates } : s))
    }));
  };

  const deleteStudent = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      students: (prev.students || []).filter((s: Student) => s.id !== id),
      enrolments: (prev.enrolments || []).filter((e: Enrolment) => e.studentId !== id)
    }));
  };

  const createEnrolment = (enrolData: { studentId: string; courseId: CourseId; startDate: string; group?: any; schedule?: string; liveClassUrl?: string; customAssignmentSupportUntil?: string }) => {
    const student = data.students.find((s: Student) => s.id === enrolData.studentId);
    const course = data.courses.find((c: Course) => c.id === enrolData.courseId) || data.courses[0];
    const startDate = enrolData.startDate || getTodayIso();
    const courseEnd = calculateCourseEndDate(startDate, course.id);
    const materialExpiry = calculateMaterialAccessExpiry(courseEnd, data.settings.accessRules.defaultMaterialBufferMonths);
    const supportDeadline = enrolData.customAssignmentSupportUntil || courseEnd;

    const newEnrolment: Enrolment = {
      id: `enr-${Date.now()}`,
      studentId: enrolData.studentId,
      studentName: student?.name || 'Enrolled Student',
      studentEmail: student?.email || 'student@example.com',
      courseId: course.id,
      courseName: course.name,
      startDate,
      courseEndDate: courseEnd,
      materialAccessUntil: materialExpiry,
      assignmentSupportUntil: supportDeadline,
      group: enrolData.group || 'Morning',
      schedule: enrolData.schedule,
      liveClassUrl: enrolData.liveClassUrl,
      status: computeEnrolmentStatus(startDate, courseEnd, materialExpiry),
      createdAt: getRealDateTimeString()
    };

    setData((prev: any) => ({
      ...prev,
      enrolments: [newEnrolment, ...(prev.enrolments || [])],
      students: (prev.students || []).map((s: Student) => {
        if (s.id === enrolData.studentId) {
          return {
            ...s,
            enrolmentIds: [...s.enrolmentIds, newEnrolment.id],
            currentEnrolmentId: newEnrolment.id,
            recentActivity: [
              {
                id: `act-${Date.now()}`,
                action: 'Enrolled in course',
                detail: `${course.name} (${enrolData.group || 'Standard'})`,
                date: getTodayIso(),
                type: 'enrolment'
              },
              ...s.recentActivity
            ]
          };
        }
        return s;
      })
    }));

    return newEnrolment;
  };

  const extendMaterialAccess = (enrolmentId: string, newExpiryDate: string) => {
    setData((prev: any) => {
      const target = (prev.enrolments || []).find((e: Enrolment) => e.id === enrolmentId);
      if (!target) return prev;

      return {
        ...prev,
        enrolments: (prev.enrolments || []).map((e: Enrolment) => {
          if (e.id === enrolmentId) {
            return {
              ...e,
              materialAccessUntil: newExpiryDate,
              status: computeEnrolmentStatus(e.startDate, e.courseEndDate, newExpiryDate)
            };
          }
          return e;
        }),
        students: (prev.students || []).map((s: Student) => {
          if (s.id === target.studentId) {
            return {
              ...s,
              recentActivity: [
                {
                  id: `act-${Date.now()}`,
                  action: 'Material access extended',
                  detail: `Access extended until ${newExpiryDate} (assignment support unchanged)`,
                  date: getTodayIso(),
                  type: 'material'
                },
                ...s.recentActivity
              ]
            };
          }
          return s;
        })
      };
    });
  };

  const updateAssignmentSupport = (enrolmentId: string, newSupportDate: string) => {
    setData((prev: any) => ({
      ...prev,
      enrolments: (prev.enrolments || []).map((e: Enrolment) => {
        if (e.id === enrolmentId) {
          return { ...e, assignmentSupportUntil: newSupportDate };
        }
        return e;
      })
    }));
  };

  const updateEnrolment = (enrolmentId: string, updates: Partial<Enrolment>) => {
    setData((prev: any) => ({
      ...prev,
      enrolments: (prev.enrolments || []).map((e: Enrolment) => (e.id === enrolmentId ? { ...e, ...updates } : e))
    }));
  };

  const updateCourse = (id: CourseId, updates: Partial<Course>) => {
    setData((prev: any) => ({
      ...prev,
      courses: prev.courses.map((c: Course) => (c.id === id ? { ...c, ...updates } : c))
    }));
  };

  const addLesson = (lessonData: Omit<Lesson, 'id' | 'updatedAt'>) => {
    const newLesson: Lesson = {
      ...lessonData,
      id: `les-${Date.now()}`,
      updatedAt: getRealDateTimeString()
    };
    setData((prev: any) => ({
      ...prev,
      lessons: [newLesson, ...prev.lessons]
    }));
    return newLesson;
  };

  const updateLesson = (id: string, updates: Partial<Lesson>) => {
    setData((prev: any) => ({
      ...prev,
      lessons: prev.lessons.map((l: Lesson) => (l.id === id ? { ...l, ...updates, updatedAt: getRealDateTimeString() } : l))
    }));
  };

  const deleteLesson = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      lessons: prev.lessons.filter((l: Lesson) => l.id !== id)
    }));
  };

  const createAssignmentTemplate = (tpl: Omit<AssignmentTemplate, 'id' | 'totalSubmissionsCount' | 'createdAt'>) => {
    const newTpl: AssignmentTemplate = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      totalSubmissionsCount: 0,
      createdAt: getRealDateTimeString()
    };
    setData((prev: any) => ({
      ...prev,
      assignmentTemplates: [newTpl, ...prev.assignmentTemplates]
    }));
    return newTpl;
  };

  const updateAssignmentTemplate = (id: string, updates: Partial<AssignmentTemplate>) => {
    setData((prev: any) => ({
      ...prev,
      assignmentTemplates: prev.assignmentTemplates.map((t: AssignmentTemplate) => (t.id === id ? { ...t, ...updates } : t))
    }));
  };

  const assignTemplateToStudents = (templateId: string, studentIds: string[], releaseDate: string, dueDate: string) => {
    const template = data.assignmentTemplates.find((t: AssignmentTemplate) => t.id === templateId);
    if (!template) return;

    const newAssignments: AssignedWork[] = [];
    studentIds.forEach(stuId => {
      const student = data.students.find((s: Student) => s.id === stuId);
      if (student) {
        newAssignments.push({
          id: `asw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          templateId,
          assignmentTitle: template.title,
          module: template.module,
          studentId: stuId,
          studentName: student.name,
          studentEmail: student.email,
          releaseDate,
          dueDate,
          status: 'Pending',
          assignedAt: getRealDateTimeString()
        });
      }
    });

    setData((prev: any) => ({
      ...prev,
      assignedWorks: [...newAssignments, ...(prev.assignedWorks || [])]
    }));
  };

  const saveReviewDraft = (submissionId: string, reviewData: any) => {
    setData((prev: any) => ({
      ...prev,
      submissions: (prev.submissions || []).map((sub: Submission) => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            review: {
              ...reviewData,
              tutorId: 'tutor-1',
              tutorName: prev.settings.account.tutorName,
              reviewedAt: getRealDateTimeString()
            }
          };
        }
        return sub;
      })
    }));
  };

  const completeReview = (submissionId: string, reviewData: any) => {
    setData((prev: any) => {
      const targetSub = (prev.submissions || []).find((s: Submission) => s.id === submissionId);
      if (!targetSub) return prev;

      return {
        ...prev,
        submissions: (prev.submissions || []).map((sub: Submission) => {
          if (sub.id === submissionId) {
            return {
              ...sub,
              status: 'Reviewed',
              review: {
                ...reviewData,
                tutorId: 'tutor-1',
                tutorName: prev.settings.account.tutorName,
                reviewedAt: getRealDateTimeString()
              }
            };
          }
          return sub;
        }),
        assignedWorks: (prev.assignedWorks || []).map((aw: AssignedWork) => {
          if (aw.id === targetSub.assignedWorkId) {
            return { ...aw, status: 'Reviewed' };
          }
          return aw;
        }),
        students: (prev.students || []).map((st: Student) => {
          if (st.id === targetSub.studentId) {
            return {
              ...st,
              recentActivity: [
                {
                  id: `act-${Date.now()}`,
                  action: 'Evaluation published',
                  detail: `${targetSub.assignmentTitle} (Estimated Band: ${reviewData.practiceBand})`,
                  date: getTodayIso(),
                  type: 'assignment'
                },
                ...st.recentActivity
              ]
            };
          }
          return st;
        })
      };
    });
  };

  const requestRevision = (submissionId: string, revisionNotes: string) => {
    setData((prev: any) => {
      const targetSub = (prev.submissions || []).find((s: Submission) => s.id === submissionId);
      if (!targetSub) return prev;

      return {
        ...prev,
        submissions: (prev.submissions || []).map((sub: Submission) => {
          if (sub.id === submissionId) {
            return {
              ...sub,
              status: 'Revision Requested',
              review: {
                ...sub.review,
                feedbackNotes: revisionNotes,
                reviewedAt: getRealDateTimeString()
              }
            };
          }
          return sub;
        }),
        assignedWorks: (prev.assignedWorks || []).map((aw: AssignedWork) => {
          if (aw.id === targetSub.assignedWorkId) {
            return { ...aw, status: 'Revision Requested' };
          }
          return aw;
        })
      };
    });
  };

  const updateEnquiryStatus = (id: string, status: Enquiry['status'], notes?: string) => {
    setData((prev: any) => ({
      ...prev,
      enquiries: (prev.enquiries || []).map((enq: Enquiry) => {
        if (enq.id === id) {
          return {
            ...enq,
            status,
            tutorNotes: notes !== undefined ? notes : enq.tutorNotes
          };
        }
        return enq;
      })
    }));
  };

  const saveEnquiryNotes = (id: string, notes: string) => {
    setData((prev: any) => ({
      ...prev,
      enquiries: (prev.enquiries || []).map((enq: Enquiry) => (enq.id === id ? { ...enq, tutorNotes: notes } : enq))
    }));
  };

  const convertEnquiryToStudent = (enquiryId: string) => {
    const enq = (data.enquiries || []).find((e: Enquiry) => e.id === enquiryId);
    if (!enq) throw new Error('Enquiry not found');

    const existing = (data.students || []).find((s: Student) => s.email.toLowerCase() === enq.email.toLowerCase());
    if (existing) {
      return existing;
    }

    return addStudent({
      name: enq.name,
      email: enq.email,
      phone: enq.phone,
      targetBand: enq.targetBand || '7.5'
    });
  };

  const updateWebsiteContent = (updates: Partial<WebsiteContent>) => {
    setData((prev: any) => ({
      ...prev,
      websiteContent: { ...prev.websiteContent, ...updates }
    }));
  };

  const saveBlogPost = (postData: Omit<BlogPost, 'id'>, id?: string) => {
    setData((prev: any) => {
      if (id) {
        return {
          ...prev,
          blogPosts: prev.blogPosts.map((p: BlogPost) => (p.id === id ? { ...p, ...postData } : p))
        };
      } else {
        const newPost: BlogPost = {
          ...postData,
          id: `post-${Date.now()}`
        };
        return {
          ...prev,
          blogPosts: [newPost, ...prev.blogPosts]
        };
      }
    });
  };

  const deleteBlogPost = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      blogPosts: prev.blogPosts.filter((p: BlogPost) => p.id !== id)
    }));
  };

  const updateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    setData((prev: any) => ({
      ...prev,
      testimonials: prev.testimonials.map((t: Testimonial) => (t.id === id ? { ...t, ...updates } : t))
    }));
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setData((prev: any) => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  };

  const resetToDefaults = () => {
    const defaults = generateCleanInitialData();
    setData(defaults);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DemoDataContext.Provider
      value={{
        ...data,
        addStudent,
        updateStudent,
        deleteStudent,
        createEnrolment,
        extendMaterialAccess,
        updateAssignmentSupport,
        updateEnrolment,
        updateCourse,
        addLesson,
        updateLesson,
        deleteLesson,
        createAssignmentTemplate,
        updateAssignmentTemplate,
        assignTemplateToStudents,
        saveReviewDraft,
        completeReview,
        requestRevision,
        updateEnquiryStatus,
        saveEnquiryNotes,
        convertEnquiryToStudent,
        updateWebsiteContent,
        saveBlogPost,
        deleteBlogPost,
        updateTestimonial,
        updateSettings,
        resetToDefaults
      }}
    >
      {children}
    </DemoDataContext.Provider>
  );
};

export const useDemoData = () => {
  const context = useContext(DemoDataContext);
  if (!context) {
    throw new Error('useDemoData must be used within a DemoDataProvider');
  }
  return context;
};
