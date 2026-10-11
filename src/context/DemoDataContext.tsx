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
  getTodayIso
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

const STORAGE_KEY = 'fluent_india_demo_data_v2';

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

function generateSeedData() {
  const today = new Date();
  
  // Date helpers relative to today
  const offsetDate = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return formatDateIso(d);
  };

  // Seed Students
  const students: Student[] = [
    {
      id: 'stu-1',
      name: 'Riya Shah',
      email: 'riya@example.com',
      phone: '+91 98765 11223',
      avatarInitials: 'RS',
      targetBand: '8.0',
      stream: 'Academic',
      enrolmentIds: ['enr-1'],
      currentEnrolmentId: 'enr-1',
      createdAt: offsetDate(-20),
      recentActivity: [
        { id: 'act-1', action: 'Material access extended', detail: 'Access until 31 Jan 2027', date: offsetDate(-1), type: 'material' },
        { id: 'act-2', action: 'Assignment submitted', detail: 'Writing Task 2 (AI in Healthcare)', date: offsetDate(-5), type: 'assignment' },
        { id: 'act-3', action: 'Enrolled in course', detail: 'Long-Term Course — October Morning', date: offsetDate(-20), type: 'enrolment' }
      ]
    },
    {
      id: 'stu-2',
      name: 'Arjun Kumar',
      email: 'arjun@example.com',
      phone: '+91 98222 33445',
      avatarInitials: 'AK',
      targetBand: '7.5',
      stream: 'Academic',
      enrolmentIds: ['enr-2'],
      currentEnrolmentId: 'enr-2',
      createdAt: offsetDate(-10),
      recentActivity: [
        { id: 'act-4', action: 'Enrolled in course', detail: 'Short-Term Course (15 days)', date: offsetDate(-10), type: 'enrolment' },
        { id: 'act-5', action: 'Assignment submitted', detail: 'Speaking Practice Part 2', date: offsetDate(-2), type: 'assignment' }
      ]
    },
    {
      id: 'stu-3',
      name: 'Meera Patel',
      email: 'meera@example.com',
      phone: '+91 97111 88990',
      avatarInitials: 'MP',
      targetBand: '7.0',
      stream: 'General Training',
      enrolmentIds: ['enr-3'],
      currentEnrolmentId: 'enr-3',
      createdAt: offsetDate(-40),
      recentActivity: [
        { id: 'act-6', action: 'Course completed', detail: 'Crash Course (7 days)', date: offsetDate(-33), type: 'enrolment' }
      ]
    },
    {
      id: 'stu-4',
      name: 'Aditya Rao',
      email: 'aditya@example.com',
      phone: '+91 99887 66554',
      avatarInitials: 'AR',
      targetBand: '8.5',
      stream: 'Academic',
      enrolmentIds: ['enr-4'],
      currentEnrolmentId: 'enr-4',
      createdAt: offsetDate(-15),
      recentActivity: [
        { id: 'act-7', action: 'Feedback reviewed', detail: 'Writing Task 1 Bar Chart (Band 7.5)', date: offsetDate(-3), type: 'assignment' }
      ]
    },
    {
      id: 'stu-5',
      name: 'Priya Nair',
      email: 'priya@example.com',
      phone: '+91 98333 44556',
      avatarInitials: 'PN',
      targetBand: '7.5',
      stream: 'Academic',
      enrolmentIds: ['enr-5'],
      currentEnrolmentId: 'enr-5',
      createdAt: offsetDate(-8),
      recentActivity: [
        { id: 'act-8', action: 'Joined Live Batch', detail: 'October Morning Session', date: offsetDate(-7), type: 'enrolment' }
      ]
    },
    {
      id: 'stu-6',
      name: 'Rohit Das',
      email: 'rohit@example.com',
      phone: '+91 98777 55443',
      avatarInitials: 'RD',
      targetBand: '6.5',
      stream: 'General Training',
      enrolmentIds: ['enr-6'],
      currentEnrolmentId: 'enr-6',
      createdAt: offsetDate(-120),
      recentActivity: [
        { id: 'act-9', action: 'Access Expired', detail: '3-month buffer period ended', date: offsetDate(-15), type: 'material' }
      ]
    },
    {
      id: 'stu-7',
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      phone: '+91 98111 12345',
      avatarInitials: 'AS',
      targetBand: '8.0',
      stream: 'Academic',
      enrolmentIds: ['enr-7'],
      currentEnrolmentId: 'enr-7',
      createdAt: offsetDate(-12),
      recentActivity: [
        { id: 'act-10', action: 'Assignment submitted', detail: 'Writing Task 2 (Waiting Review)', date: offsetDate(0), type: 'assignment' }
      ]
    },
    {
      id: 'stu-8',
      name: 'Priya Khanna',
      email: 'priya.k@example.com',
      phone: '+91 98444 56789',
      avatarInitials: 'PK',
      targetBand: '7.5',
      stream: 'Academic',
      enrolmentIds: ['enr-8'],
      currentEnrolmentId: 'enr-8',
      createdAt: offsetDate(-14),
      recentActivity: [
        { id: 'act-11', action: 'Speaking recorded', detail: 'Audio upload ready for evaluation', date: offsetDate(-1), type: 'assignment' }
      ]
    },
    {
      id: 'stu-9',
      name: 'Rohan Mehta',
      email: 'rohan.m@example.com',
      phone: '+91 99000 23456',
      avatarInitials: 'RM',
      targetBand: '7.0',
      stream: 'Academic',
      enrolmentIds: ['enr-9'],
      currentEnrolmentId: 'enr-9',
      createdAt: offsetDate(-5),
      recentActivity: [
        { id: 'act-12', action: 'Reading Exercise completed', detail: 'Passage 3 True/False/Not Given', date: offsetDate(-1), type: 'assignment' }
      ]
    },
    {
      id: 'stu-10',
      name: 'Sneha Nair',
      email: 'sneha.n@example.com',
      phone: '+91 97888 34567',
      avatarInitials: 'SN',
      targetBand: '8.0',
      stream: 'Academic',
      enrolmentIds: ['enr-10'],
      currentEnrolmentId: 'enr-10',
      createdAt: offsetDate(-18),
      recentActivity: [
        { id: 'act-13', action: 'Writing revision submitted', detail: 'Second attempt with tutor suggestions', date: offsetDate(-2), type: 'assignment' }
      ]
    },
    {
      id: 'stu-11',
      name: 'Dev Patel',
      email: 'dev.patel@example.com',
      avatarInitials: 'DP',
      targetBand: '7.0',
      stream: 'Academic',
      enrolmentIds: ['enr-11'],
      currentEnrolmentId: 'enr-11',
      createdAt: offsetDate(-80),
      recentActivity: []
    },
    {
      id: 'stu-12',
      name: 'Ishita Sen',
      email: 'ishita.sen@example.com',
      avatarInitials: 'IS',
      targetBand: '7.5',
      stream: 'Academic',
      enrolmentIds: ['enr-12'],
      currentEnrolmentId: 'enr-12',
      createdAt: offsetDate(-70),
      recentActivity: []
    },
    {
      id: 'stu-13',
      name: 'Aditya Roy',
      email: 'aditya.roy@example.com',
      avatarInitials: 'AR',
      targetBand: '8.0',
      stream: 'Academic',
      enrolmentIds: ['enr-13'],
      currentEnrolmentId: 'enr-13',
      createdAt: offsetDate(-65),
      recentActivity: []
    },
    {
      id: 'stu-14',
      name: 'Kavya Tiwari',
      email: 'kavya.tiwari@example.com',
      avatarInitials: 'KT',
      targetBand: '7.5',
      stream: 'Academic',
      enrolmentIds: ['enr-14'],
      currentEnrolmentId: 'enr-14',
      createdAt: offsetDate(-62),
      recentActivity: []
    }
  ];

  // Seed Enrolments
  const enrolments: Enrolment[] = [
    {
      id: 'enr-1',
      studentId: 'stu-1',
      studentName: 'Riya Shah',
      studentEmail: 'riya@example.com',
      courseId: 'longterm',
      courseName: 'Long-Term Course (1 month)',
      startDate: offsetDate(-20),
      courseEndDate: calculateCourseEndDate(offsetDate(-20), 'longterm'),
      materialAccessUntil: calculateMaterialAccessExpiry(calculateCourseEndDate(offsetDate(-20), 'longterm')),
      assignmentSupportUntil: calculateCourseEndDate(offsetDate(-20), 'longterm'),
      group: 'October Morning',
      schedule: 'Mon, Wed, Fri 9:00 AM – 11:00 AM',
      status: 'ongoing',
      createdAt: offsetDate(-20)
    },
    {
      id: 'enr-2',
      studentId: 'stu-2',
      studentName: 'Arjun Kumar',
      studentEmail: 'arjun@example.com',
      courseId: 'shortterm',
      courseName: 'Short-Term Course (15 days)',
      startDate: offsetDate(-10),
      courseEndDate: calculateCourseEndDate(offsetDate(-10), 'shortterm'),
      materialAccessUntil: calculateMaterialAccessExpiry(calculateCourseEndDate(offsetDate(-10), 'shortterm')),
      assignmentSupportUntil: calculateCourseEndDate(offsetDate(-10), 'shortterm'),
      group: 'September Evening',
      schedule: 'Mon – Fri 10:00 AM – 12:00 PM',
      status: 'ongoing',
      createdAt: offsetDate(-10)
    },
    {
      id: 'enr-3',
      studentId: 'stu-3',
      studentName: 'Meera Patel',
      studentEmail: 'meera@example.com',
      courseId: 'crash',
      courseName: 'Crash Course (1 week)',
      startDate: offsetDate(-40),
      courseEndDate: calculateCourseEndDate(offsetDate(-40), 'crash'),
      materialAccessUntil: calculateMaterialAccessExpiry(calculateCourseEndDate(offsetDate(-40), 'crash')),
      assignmentSupportUntil: calculateCourseEndDate(offsetDate(-40), 'crash'),
      group: 'November Morning',
      schedule: 'Daily (Mon – Sun) 4:00 PM – 6:00 PM',
      status: 'material_only', // Teaching ended, material access active
      createdAt: offsetDate(-40)
    },
    {
      id: 'enr-4',
      studentId: 'stu-4',
      studentName: 'Aditya Rao',
      studentEmail: 'aditya@example.com',
      courseId: 'longterm',
      courseName: 'Long-Term Course (1 month)',
      startDate: offsetDate(-15),
      courseEndDate: calculateCourseEndDate(offsetDate(-15), 'longterm'),
      materialAccessUntil: calculateMaterialAccessExpiry(calculateCourseEndDate(offsetDate(-15), 'longterm')),
      assignmentSupportUntil: calculateCourseEndDate(offsetDate(-15), 'longterm'),
      group: 'October Evening',
      status: 'ongoing',
      createdAt: offsetDate(-15)
    },
    {
      id: 'enr-5',
      studentId: 'stu-5',
      studentName: 'Priya Nair',
      studentEmail: 'priya@example.com',
      courseId: 'shortterm',
      courseName: 'Short-Term Course (15 days)',
      startDate: offsetDate(-8),
      courseEndDate: calculateCourseEndDate(offsetDate(-8), 'shortterm'),
      materialAccessUntil: calculateMaterialAccessExpiry(calculateCourseEndDate(offsetDate(-8), 'shortterm')),
      assignmentSupportUntil: calculateCourseEndDate(offsetDate(-8), 'shortterm'),
      group: 'October Morning',
      status: 'ongoing',
      createdAt: offsetDate(-8)
    },
    {
      id: 'enr-6',
      studentId: 'stu-6',
      studentName: 'Rohit Das',
      studentEmail: 'rohit@example.com',
      courseId: 'crash',
      courseName: 'Crash Course (1 week)',
      startDate: offsetDate(-120),
      courseEndDate: calculateCourseEndDate(offsetDate(-120), 'crash'),
      materialAccessUntil: calculateMaterialAccessExpiry(calculateCourseEndDate(offsetDate(-120), 'crash')),
      assignmentSupportUntil: calculateCourseEndDate(offsetDate(-120), 'crash'),
      group: 'September Morning',
      status: 'expired',
      createdAt: offsetDate(-120)
    },
    {
      id: 'enr-7',
      studentId: 'stu-7',
      studentName: 'Aarav Sharma',
      studentEmail: 'aarav@example.com',
      courseId: 'longterm',
      courseName: 'Long-Term Course (1 month)',
      startDate: offsetDate(-12),
      courseEndDate: calculateCourseEndDate(offsetDate(-12), 'longterm'),
      materialAccessUntil: calculateMaterialAccessExpiry(calculateCourseEndDate(offsetDate(-12), 'longterm')),
      assignmentSupportUntil: calculateCourseEndDate(offsetDate(-12), 'longterm'),
      group: 'October Morning',
      status: 'ongoing',
      createdAt: offsetDate(-12)
    },
    {
      id: 'enr-8',
      studentId: 'stu-8',
      studentName: 'Priya Khanna',
      studentEmail: 'priya.k@example.com',
      courseId: 'shortterm',
      courseName: 'Short-Term Course (15 days)',
      startDate: offsetDate(-14),
      courseEndDate: calculateCourseEndDate(offsetDate(-14), 'shortterm'),
      materialAccessUntil: calculateMaterialAccessExpiry(calculateCourseEndDate(offsetDate(-14), 'shortterm')),
      assignmentSupportUntil: calculateCourseEndDate(offsetDate(-14), 'shortterm'),
      group: 'October Morning',
      status: 'ongoing',
      createdAt: offsetDate(-14)
    },
    {
      id: 'enr-9',
      studentId: 'stu-9',
      studentName: 'Rohan Mehta',
      studentEmail: 'rohan.m@example.com',
      courseId: 'crash',
      courseName: 'Crash Course (1 week)',
      startDate: offsetDate(-5),
      courseEndDate: calculateCourseEndDate(offsetDate(-5), 'crash'),
      materialAccessUntil: calculateMaterialAccessExpiry(calculateCourseEndDate(offsetDate(-5), 'crash')),
      assignmentSupportUntil: calculateCourseEndDate(offsetDate(-5), 'crash'),
      group: 'October Morning',
      status: 'ongoing',
      createdAt: offsetDate(-5)
    },
    {
      id: 'enr-10',
      studentId: 'stu-10',
      studentName: 'Sneha Nair',
      studentEmail: 'sneha.n@example.com',
      courseId: 'longterm',
      courseName: 'Long-Term Course (1 month)',
      startDate: offsetDate(-18),
      courseEndDate: calculateCourseEndDate(offsetDate(-18), 'longterm'),
      materialAccessUntil: calculateMaterialAccessExpiry(calculateCourseEndDate(offsetDate(-18), 'longterm')),
      assignmentSupportUntil: calculateCourseEndDate(offsetDate(-18), 'longterm'),
      group: 'October Morning',
      status: 'ongoing',
      createdAt: offsetDate(-18)
    },
    // Access reminders enrolments (18, 26, 29, 30 days remaining)
    {
      id: 'enr-11',
      studentId: 'stu-11',
      studentName: 'Dev Patel',
      studentEmail: 'dev.patel@example.com',
      courseId: 'shortterm',
      courseName: 'Short-Term Course (15 days)',
      startDate: offsetDate(-80),
      courseEndDate: calculateCourseEndDate(offsetDate(-80), 'shortterm'),
      materialAccessUntil: offsetDate(18), // 18 days left
      assignmentSupportUntil: calculateCourseEndDate(offsetDate(-80), 'shortterm'),
      status: 'material_only',
      createdAt: offsetDate(-80)
    },
    {
      id: 'enr-12',
      studentId: 'stu-12',
      studentName: 'Ishita Sen',
      studentEmail: 'ishita.sen@example.com',
      courseId: 'crash',
      courseName: 'Crash Course (1 week)',
      startDate: offsetDate(-70),
      courseEndDate: calculateCourseEndDate(offsetDate(-70), 'crash'),
      materialAccessUntil: offsetDate(26), // 26 days left
      assignmentSupportUntil: calculateCourseEndDate(offsetDate(-70), 'crash'),
      status: 'material_only',
      createdAt: offsetDate(-70)
    },
    {
      id: 'enr-13',
      studentId: 'stu-13',
      studentName: 'Aditya Roy',
      studentEmail: 'aditya.roy@example.com',
      courseId: 'longterm',
      courseName: 'Long-Term Course (1 month)',
      startDate: offsetDate(-65),
      courseEndDate: calculateCourseEndDate(offsetDate(-65), 'longterm'),
      materialAccessUntil: offsetDate(29), // 29 days left
      assignmentSupportUntil: calculateCourseEndDate(offsetDate(-65), 'longterm'),
      status: 'material_only',
      createdAt: offsetDate(-65)
    },
    {
      id: 'enr-14',
      studentId: 'stu-14',
      studentName: 'Kavya Tiwari',
      studentEmail: 'kavya.tiwari@example.com',
      courseId: 'shortterm',
      courseName: 'Short-Term Course (15 days)',
      startDate: offsetDate(-62),
      courseEndDate: calculateCourseEndDate(offsetDate(-62), 'shortterm'),
      materialAccessUntil: offsetDate(30), // 30 days left
      assignmentSupportUntil: calculateCourseEndDate(offsetDate(-62), 'shortterm'),
      status: 'material_only',
      createdAt: offsetDate(-62)
    }
  ];

  // Seed Lessons
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
      updatedAt: offsetDate(-5)
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
      updatedAt: offsetDate(-8)
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
      updatedAt: offsetDate(-3)
    },
    {
      id: 'les-4',
      title: 'Speaking Part 2 Cue Card Fluency & Idioms',
      module: 'Speaking',
      order: '04',
      assignedCourseIds: ['longterm', 'shortterm'],
      status: 'Processing',
      description: 'Techniques for speaking 2 full minutes without hesitation using the Past-Present-Future storytelling structure.',
      files: [
        { id: 'f-6', name: 'Cue-Card-Templates-2026.pdf', size: '510 KB', type: 'application/pdf' }
      ],
      updatedAt: offsetDate(-1)
    }
  ];

  // Seed Assignment Templates (Library)
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
      totalSubmissionsCount: 18,
      createdAt: offsetDate(-14)
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
      totalSubmissionsCount: 12,
      createdAt: offsetDate(-12)
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
      totalSubmissionsCount: 20,
      createdAt: offsetDate(-10)
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
      createdAt: offsetDate(-2)
    }
  ];

  // Seed Assigned Work
  const assignedWorks: AssignedWork[] = [
    {
      id: 'asw-1',
      templateId: 'tpl-1',
      assignmentTitle: 'Writing Task 2 — Opinion Essay',
      module: 'Writing',
      studentId: 'stu-7',
      studentName: 'Aarav Sharma',
      studentEmail: 'aarav@example.com',
      releaseDate: offsetDate(-5),
      dueDate: offsetDate(2),
      status: 'Submitted',
      submissionId: 'sub-1',
      assignedAt: offsetDate(-5)
    },
    {
      id: 'asw-2',
      templateId: 'tpl-2',
      assignmentTitle: 'Speaking Part 2 — Audio Recording',
      module: 'Speaking',
      studentId: 'stu-8',
      studentName: 'Priya Khanna',
      studentEmail: 'priya.k@example.com',
      releaseDate: offsetDate(-6),
      dueDate: offsetDate(-1),
      status: 'Submitted',
      submissionId: 'sub-2',
      assignedAt: offsetDate(-6)
    },
    {
      id: 'asw-3',
      templateId: 'tpl-3',
      assignmentTitle: 'Reading Practice — 3 Passages Diagnostic',
      module: 'Reading',
      studentId: 'stu-9',
      studentName: 'Rohan Mehta',
      studentEmail: 'rohan.m@example.com',
      releaseDate: offsetDate(-4),
      dueDate: offsetDate(1),
      status: 'Submitted',
      submissionId: 'sub-3',
      assignedAt: offsetDate(-4)
    },
    {
      id: 'asw-4',
      templateId: 'tpl-1',
      assignmentTitle: 'Writing Task 2 — Opinion Essay',
      module: 'Writing',
      studentId: 'stu-10',
      studentName: 'Sneha Nair',
      studentEmail: 'sneha.n@example.com',
      releaseDate: offsetDate(-7),
      dueDate: offsetDate(-2),
      status: 'Submitted',
      submissionId: 'sub-4',
      assignedAt: offsetDate(-7)
    },
    {
      id: 'asw-5',
      templateId: 'tpl-1',
      assignmentTitle: 'Writing Task 2 — Opinion Essay',
      module: 'Writing',
      studentId: 'stu-1',
      studentName: 'Riya Shah',
      studentEmail: 'riya@example.com',
      releaseDate: offsetDate(-10),
      dueDate: offsetDate(-5),
      status: 'Reviewed',
      submissionId: 'sub-5',
      assignedAt: offsetDate(-10)
    },
    {
      id: 'asw-6',
      templateId: 'tpl-2',
      assignmentTitle: 'Speaking Part 2 — Audio Recording',
      module: 'Speaking',
      studentId: 'stu-2',
      studentName: 'Arjun Kumar',
      studentEmail: 'arjun@example.com',
      releaseDate: offsetDate(-3),
      dueDate: offsetDate(4),
      status: 'Pending',
      assignedAt: offsetDate(-3)
    },
    {
      id: 'asw-7',
      templateId: 'tpl-3',
      assignmentTitle: 'Reading Practice — 3 Passages Diagnostic',
      module: 'Reading',
      studentId: 'stu-5',
      studentName: 'Priya Nair',
      studentEmail: 'priya@example.com',
      releaseDate: offsetDate(-8),
      dueDate: offsetDate(-1),
      status: 'Pending', // Overdue
      assignedAt: offsetDate(-8)
    }
  ];

  // Seed Submissions (for review queue)
  const submissions: Submission[] = [
    {
      id: 'sub-1',
      assignedWorkId: 'asw-1',
      templateId: 'tpl-1',
      assignmentTitle: 'Writing Task 2 — Opinion Essay',
      module: 'Writing',
      studentId: 'stu-7',
      studentName: 'Aarav Sharma',
      studentEmail: 'aarav@example.com',
      courseName: 'Long-Term Course (1 month)',
      submittedAt: offsetDate(0) + ' 10:24 AM',
      attemptNumber: 1,
      wordCount: 288,
      typedAnswer: `In recent decades, artificial intelligence (AI) has emerged as an indispensable force across multiple sectors, and medicine is perhaps its most impactful frontier. While skeptics fear widespread redundancy among healthcare professionals, I strongly contend that AI will function as a powerful catalyst for employment rather than an agent of displacement.\n\nOn one hand, concerns regarding robotic diagnostics replacing human clinicians are not entirely without merit. Machine learning algorithms can now interpret radiographic scans and detect oncological anomalies with precision rates exceeding seasoned radiologists. Consequently, repetitive laboratory analyses and low-tier triaging positions may diminish.\n\nHowever, this paradigm shift will simultaneously spawn an unprecedented volume of sophisticated professions. Biomedical data annotators, algorithmic ethicists, and neural network maintenance engineers will be urgently demanded within clinical networks. Furthermore, by automating mundane administrative duties, AI liberates clinicians to dedicate qualitative time to palliative care and surgical intervention—domains fundamentally reliant on human empathy and dexterity.\n\nIn conclusion, while mechanical job functions will inevitably evolve, artificial intelligence will amplify healthcare capacity, generating diverse employment opportunities and elevating patient outcomes globally.`,
      attachedFiles: [
        { name: 'Task2-Essay-Draft.pdf', size: '142 KB', type: 'application/pdf' }
      ],
      status: 'Submitted'
    },
    {
      id: 'sub-2',
      assignedWorkId: 'asw-2',
      templateId: 'tpl-2',
      assignmentTitle: 'Speaking practice (Cue Card)',
      module: 'Speaking',
      studentId: 'stu-8',
      studentName: 'Priya Khanna',
      studentEmail: 'priya.k@example.com',
      courseName: 'Short-Term Course (15 days)',
      submittedAt: offsetDate(-1) + ' 6:15 PM',
      attemptNumber: 1,
      wordCount: 195,
      typedAnswer: `I would like to speak about atmospheric pollution and toxic smog in urban centers, which has developed into a catastrophic environmental dilemma across major metropolitan cities in my country over the past decade.\n\nThis phenomenon primarily stems from vehicular emissions, agricultural stubble burning during autumn, and unchecked industrial manufacturing on the outskirts. The airborne particulate matter frequently surpasses hazardous limits, precipitating widespread respiratory ailments among vulnerable demographics.\n\nTo effectively curb this crisis, government bodies must implement robust incentives for public electric transport, transition rural farmers toward sustainable mechanized mulching, and impose strict carbon tariffs on heavy industries. Individual citizens should also adopt carpooling and energy-efficient habits.`,
      attachedFiles: [
        { name: 'Priya_Speaking_CueCard.mp3', size: '2.4 MB', type: 'audio/mpeg' }
      ],
      status: 'Submitted'
    },
    {
      id: 'sub-3',
      assignedWorkId: 'asw-3',
      templateId: 'tpl-3',
      assignmentTitle: 'Reading exercise (Passage 1-3)',
      module: 'Reading',
      studentId: 'stu-9',
      studentName: 'Rohan Mehta',
      studentEmail: 'rohan.m@example.com',
      courseName: 'Crash Course (1 week)',
      submittedAt: offsetDate(-1) + ' 11:02 AM',
      attemptNumber: 1,
      wordCount: 140,
      typedAnswer: `Answers:\nPassage 1 (Monarch Butterflies):\n1. TRUE\n2. FALSE\n3. NOT GIVEN\n4. Microclimate\n5. Deforestation\n6. TRUE\n\nPassage 2 (Ancient Architecture):\n7. Heading IV\n8. Heading II\n9. Heading VII\n10. Irrigation\n11. Sun-dried bricks\n\nPassage 3 (Neuroplasticity):\n12. Synaptic connections\n13. Bilingualism advantage\n14. C`,
      attachedFiles: [],
      status: 'Submitted'
    },
    {
      id: 'sub-4',
      assignedWorkId: 'asw-4',
      templateId: 'tpl-1',
      assignmentTitle: 'Writing revision',
      module: 'Writing',
      studentId: 'stu-10',
      studentName: 'Sneha Nair',
      studentEmail: 'sneha.n@example.com',
      courseName: 'Long-Term Course (1 month)',
      submittedAt: offsetDate(-2) + ' 4:37 PM',
      attemptNumber: 2,
      wordCount: 262,
      typedAnswer: `Second Revision: Focused on eliminating run-on sentences in paragraph 2 and refining academic lexical choices as suggested in tutor notes.\n\nIt is widely debated whether technological integration in educational institutions improves student academic achievement or diminishes interpersonal social aptitude. In my perspective, while excessive screen reliance poses valid developmental risks, technology serves as an indispensable educational equalizer when managed prudently.\n\nTo begin with, interactive multimedia platforms facilitate experiential comprehension of abstract scientific theories that static textbooks cannot emulate. Students across socioeconomic boundaries obtain instant access to global research repositories...\n\nIn conclusion, rather than hindering growth, well-regulated digital pedagogy empowers the contemporary generation to excel both analytically and collaborative.`,
      attachedFiles: [
        { name: 'Sneha_Revised_Essay_v2.docx', size: '78 KB', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
      ],
      status: 'Submitted'
    },
    {
      id: 'sub-5',
      assignedWorkId: 'asw-5',
      templateId: 'tpl-1',
      assignmentTitle: 'Writing Task 2 — Opinion Essay',
      module: 'Writing',
      studentId: 'stu-1',
      studentName: 'Riya Shah',
      studentEmail: 'riya@example.com',
      courseName: 'Long-Term Course (1 month)',
      submittedAt: offsetDate(-7) + ' 2:15 PM',
      attemptNumber: 1,
      wordCount: 275,
      typedAnswer: `Diagnostic Essay on Global Tourism and Cultural Preservation...`,
      attachedFiles: [],
      status: 'Reviewed',
      review: {
        tutorId: 'tutor-1',
        tutorName: 'Tutor User',
        reviewedAt: offsetDate(-6) + ' 5:30 PM',
        practiceBand: '7.5',
        criteriaScores: {
          ta: 8.0,
          cc: 7.5,
          lr: 7.0,
          gra: 7.5
        },
        feedbackNotes: 'Exemplary essay structure with cohesive transitional devices. Well-articulated thesis statement. To breach Band 8.0, focus on incorporating less common collocations in paragraph 3 and avoiding minor prepositions errors.',
        correctedFile: 'Riya_Marked_Essay_Feedback.pdf'
      }
    }
  ];

  // Seed Enquiries (Screenshot 1)
  const enquiries: Enquiry[] = [
    {
      id: 'enq-1',
      name: 'Neha Kapoor',
      email: 'neha.kapoor@example.com',
      phone: '+91 98760 12345',
      courseInterestedIn: 'Short-Term Course',
      targetBand: '7.5',
      message: 'Looking for 15-day evening batch for academic IELTS test scheduled on 28th next month.',
      receivedAt: offsetDate(0) + ' 09:30 AM',
      status: 'New'
    },
    {
      id: 'enq-2',
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '+91 98111 54321',
      courseInterestedIn: 'Long-Term Course',
      targetBand: '8.0',
      message: 'Need 1-month comprehensive writing and speaking coaching. Aiming for Canada express entry.',
      receivedAt: offsetDate(-1) + ' 03:15 PM',
      status: 'Contacted',
      tutorNotes: 'Spoke with Vikram via WhatsApp. Recommended October Morning Long-Term batch. Awaiting fee confirmation.'
    },
    {
      id: 'enq-3',
      name: 'Ananya Rao',
      email: 'ananya.rao@example.com',
      phone: '+91 99222 78901',
      courseInterestedIn: 'Crash Course',
      targetBand: '7.0',
      message: 'Exam is in 10 days! Need immediate 1-week crash course with mock speaking sessions.',
      receivedAt: offsetDate(-1) + ' 11:45 AM',
      status: 'New'
    },
    {
      id: 'enq-4',
      name: 'Karan Malhotra',
      email: 'karan.malhotra@example.com',
      phone: '+91 98333 90123',
      courseInterestedIn: 'Short-Term Course',
      targetBand: '7.5',
      message: 'Enquiring about diagnostic evaluation test before enrolling in the 15-day batch.',
      receivedAt: offsetDate(-2) + ' 05:20 PM',
      status: 'Contacted',
      tutorNotes: 'Diagnostic PDF sent via email. Follow up scheduled for tomorrow.'
    },
    {
      id: 'enq-5',
      name: 'Simran Kaur',
      email: 'simran.k@example.com',
      phone: '+91 98444 87654',
      courseInterestedIn: 'Long-Term Course',
      targetBand: '8.0',
      message: 'Interested in personalized 1-on-1 tutoring sessions.',
      receivedAt: offsetDate(-3) + ' 02:10 PM',
      status: 'Enrolled'
    }
  ];

  // Seed Blog Posts
  const blogPosts: BlogPost[] = [
    {
      id: 'post-1',
      title: 'How to Achieve Band 8.0 in IELTS Writing Task 2',
      category: 'Writing Strategy',
      excerpt: 'Learn the exact 4-paragraph essay structure, cohesive linking phrases, and vocabulary to reach Band 8.0+.',
      body: 'Writing Task 2 carries double the weight of Task 1 in your overall IELTS Writing score. Examiners evaluate your script across four criteria: Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy...',
      coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
      status: 'Published',
      publishedDate: offsetDate(-15)
    },
    {
      id: 'post-2',
      title: 'Top 10 Idioms and Collocations for Speaking Part 2',
      category: 'Speaking Fluency',
      excerpt: 'Natural idioms to express opinions, narrative transitions, and how to avoid sounding forced or robotic.',
      body: 'In IELTS Speaking, using idiomatic language correctly demonstrates lexical versatility. Rather than memorizing obscure idioms, focus on natural collocations such as "a double-edged sword", "at the crack of dawn", or "once in a blue moon"...',
      coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
      status: 'Published',
      publishedDate: offsetDate(-22)
    },
    {
      id: 'post-3',
      title: 'IELTS Academic Reading: 20-Minute Time Management Blueprint',
      category: 'Reading Strategy',
      excerpt: 'Stop getting stuck on difficult Passage 3 questions. Master skimming, scanning, and strategic guessing.',
      body: 'One of the most common student mistakes is spending 25 minutes on Passage 1 because it seems easy, leaving only 12 minutes for the dense Passage 3. Here is the recommended breakdown...',
      coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
      status: 'Draft',
      publishedDate: offsetDate(-2)
    }
  ];

  // Seed Testimonials
  const testimonials: Testimonial[] = [
    {
      id: 'test-1',
      studentName: 'Ananya Sharma',
      bandScore: 'Band 8.5 (L:9, R:8.5, W:8, S:8)',
      quote: 'The personalized line-by-line essay feedback transformed my writing within 3 weeks. I went from Band 6.5 to an overall 8.5!',
      hasPermissionToPublish: true,
      isVisibleOnHomepage: true,
      order: 1
    },
    {
      id: 'test-2',
      studentName: 'Karthik Raman',
      bandScore: 'Band 8.0 (L:8.5, R:8.0, W:7.5, S:8.0)',
      quote: 'The crash course was pure gold for last-minute speaking confidence. The cue card frameworks helped me speak effortlessly without pausing.',
      hasPermissionToPublish: true,
      isVisibleOnHomepage: true,
      order: 2
    },
    {
      id: 'test-3',
      studentName: 'Harpreet Singh',
      bandScore: 'Band 7.5 (General Training)',
      quote: 'Achieved my CLB 10 Canadian PR requirement on my first attempt with Fluent India! Truly high-touch master coaching.',
      hasPermissionToPublish: true,
      isVisibleOnHomepage: true,
      order: 3
    }
  ];

  // Seed Website Content
  const websiteContent: WebsiteContent = {
    tutorProfile: {
      name: 'Sai Ganesh',
      title: 'Lead IELTS Master Coach & Linguistic Specialist',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      intro: 'Over 8+ years helping 1,200+ candidates secure Band 7.5+ for Ivy League universities and global immigration.',
      teachingApproach: 'Diagnosis-driven, criterion-focused training. No generic tips—only actionable line-by-line essay reviews, speaking diagnostics, and targeted grammar drills.',
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
      },
      {
        id: 'vid-2',
        title: 'Speaking Part 2: 2-Minute Speech Technique',
        description: 'Live demonstration of responding to unfamiliar cue cards with zero hesitation.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
        isPublished: true
      }
    ]
  };

  // Seed App Settings
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
      tutorName: 'Tutor User',
      tutorEmail: 'tutor@fluentindia.in',
      avatarInitials: 'TU'
    }
  };

  return {
    students,
    enrolments,
    courses: initialCourses,
    lessons,
    assignmentTemplates,
    assignedWorks,
    submissions,
    enquiries,
    blogPosts,
    testimonials,
    websiteContent,
    settings
  };
}

const DemoDataContext = createContext<DemoDataContextType | undefined>(undefined);

export const DemoDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved demo data', e);
    }
    return generateSeedData();
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save demo data', e);
    }
  }, [data]);

  // Recalculate status of all enrolments periodically
  useEffect(() => {
    setData((prev: any) => {
      let changed = false;
      const updatedEnrolments = prev.enrolments.map((enr: Enrolment) => {
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

    let newEnrolment: Enrolment | null = null;
    if (enrolmentData) {
      const course = data.courses.find((c: Course) => c.id === enrolmentData.courseId) || data.courses[0];
      const endDate = calculateCourseEndDate(enrolmentData.startDate, course.id);
      const materialExpiry = calculateMaterialAccessExpiry(endDate, data.settings.accessRules.defaultMaterialBufferMonths);
      const supportDeadline = enrolmentData.assignmentSupportUntil || endDate;

      newEnrolment = {
        id: `enr-${Date.now()}`,
        studentId,
        studentName: studentData.name || 'New Student',
        studentEmail: studentData.email || 'student@example.com',
        courseId: course.id,
        courseName: course.name,
        startDate: enrolmentData.startDate,
        courseEndDate: endDate,
        materialAccessUntil: materialExpiry,
        assignmentSupportUntil: supportDeadline,
        group: enrolmentData.group || 'October Morning',
        status: computeEnrolmentStatus(enrolmentData.startDate, endDate, materialExpiry),
        createdAt: getTodayIso()
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
      createdAt: getTodayIso(),
      recentActivity: [
        {
          id: `act-${Date.now()}`,
          action: 'Student Profile Created',
          detail: newEnrolment ? `Enrolled in ${newEnrolment.courseName}` : 'Profile added to workspace',
          date: getTodayIso(),
          type: 'enrolment'
        }
      ]
    };

    setData((prev: any) => ({
      ...prev,
      students: [newStudent, ...prev.students],
      enrolments: newEnrolment ? [newEnrolment, ...prev.enrolments] : prev.enrolments
    }));

    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setData((prev: any) => ({
      ...prev,
      students: prev.students.map((s: Student) => (s.id === id ? { ...s, ...updates } : s))
    }));
  };

  const deleteStudent = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      students: prev.students.filter((s: Student) => s.id !== id),
      enrolments: prev.enrolments.filter((e: Enrolment) => e.studentId !== id)
    }));
  };

  const createEnrolment = (enrolData: { studentId: string; courseId: CourseId; startDate: string; group?: any; schedule?: string; liveClassUrl?: string; customAssignmentSupportUntil?: string }) => {
    const student = data.students.find((s: Student) => s.id === enrolData.studentId);
    const course = data.courses.find((c: Course) => c.id === enrolData.courseId) || data.courses[0];
    const courseEnd = calculateCourseEndDate(enrolData.startDate, course.id);
    const materialExpiry = calculateMaterialAccessExpiry(courseEnd, data.settings.accessRules.defaultMaterialBufferMonths);
    const supportDeadline = enrolData.customAssignmentSupportUntil || courseEnd;

    const newEnrolment: Enrolment = {
      id: `enr-${Date.now()}`,
      studentId: enrolData.studentId,
      studentName: student?.name || 'Enrolled Student',
      studentEmail: student?.email || 'student@example.com',
      courseId: course.id,
      courseName: course.name,
      startDate: enrolData.startDate,
      courseEndDate: courseEnd,
      materialAccessUntil: materialExpiry,
      assignmentSupportUntil: supportDeadline,
      group: enrolData.group || 'Morning',
      schedule: enrolData.schedule,
      liveClassUrl: enrolData.liveClassUrl,
      status: computeEnrolmentStatus(enrolData.startDate, courseEnd, materialExpiry),
      createdAt: getTodayIso()
    };

    setData((prev: any) => ({
      ...prev,
      enrolments: [newEnrolment, ...prev.enrolments],
      students: prev.students.map((s: Student) => {
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
      const target = prev.enrolments.find((e: Enrolment) => e.id === enrolmentId);
      if (!target) return prev;

      return {
        ...prev,
        enrolments: prev.enrolments.map((e: Enrolment) => {
          if (e.id === enrolmentId) {
            return {
              ...e,
              materialAccessUntil: newExpiryDate,
              status: computeEnrolmentStatus(e.startDate, e.courseEndDate, newExpiryDate)
            };
          }
          return e;
        }),
        students: prev.students.map((s: Student) => {
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
      enrolments: prev.enrolments.map((e: Enrolment) => {
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
      enrolments: prev.enrolments.map((e: Enrolment) => (e.id === enrolmentId ? { ...e, ...updates } : e))
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
      updatedAt: getTodayIso()
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
      lessons: prev.lessons.map((l: Lesson) => (l.id === id ? { ...l, ...updates, updatedAt: getTodayIso() } : l))
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
      createdAt: getTodayIso()
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
          assignedAt: getTodayIso()
        });
      }
    });

    setData((prev: any) => ({
      ...prev,
      assignedWorks: [...newAssignments, ...prev.assignedWorks]
    }));
  };

  const saveReviewDraft = (submissionId: string, reviewData: any) => {
    setData((prev: any) => ({
      ...prev,
      submissions: prev.submissions.map((sub: Submission) => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            review: {
              ...reviewData,
              tutorId: 'tutor-1',
              tutorName: prev.settings.account.tutorName,
              reviewedAt: getTodayIso()
            }
          };
        }
        return sub;
      })
    }));
  };

  const completeReview = (submissionId: string, reviewData: any) => {
    setData((prev: any) => {
      const targetSub = prev.submissions.find((s: Submission) => s.id === submissionId);
      if (!targetSub) return prev;

      return {
        ...prev,
        submissions: prev.submissions.map((sub: Submission) => {
          if (sub.id === submissionId) {
            return {
              ...sub,
              status: 'Reviewed',
              review: {
                ...reviewData,
                tutorId: 'tutor-1',
                tutorName: prev.settings.account.tutorName,
                reviewedAt: getTodayIso()
              }
            };
          }
          return sub;
        }),
        assignedWorks: prev.assignedWorks.map((aw: AssignedWork) => {
          if (aw.id === targetSub.assignedWorkId) {
            return { ...aw, status: 'Reviewed' };
          }
          return aw;
        }),
        students: prev.students.map((st: Student) => {
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
      const targetSub = prev.submissions.find((s: Submission) => s.id === submissionId);
      if (!targetSub) return prev;

      return {
        ...prev,
        submissions: prev.submissions.map((sub: Submission) => {
          if (sub.id === submissionId) {
            return {
              ...sub,
              status: 'Revision Requested',
              review: {
                ...sub.review,
                feedbackNotes: revisionNotes,
                reviewedAt: getTodayIso()
              }
            };
          }
          return sub;
        }),
        assignedWorks: prev.assignedWorks.map((aw: AssignedWork) => {
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
      enquiries: prev.enquiries.map((enq: Enquiry) => {
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
      enquiries: prev.enquiries.map((enq: Enquiry) => (enq.id === id ? { ...enq, tutorNotes: notes } : enq))
    }));
  };

  const convertEnquiryToStudent = (enquiryId: string) => {
    const enq = data.enquiries.find((e: Enquiry) => e.id === enquiryId);
    if (!enq) throw new Error('Enquiry not found');

    // Check if student with email already exists
    const existing = data.students.find((s: Student) => s.email.toLowerCase() === enq.email.toLowerCase());
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
    const defaults = generateSeedData();
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
