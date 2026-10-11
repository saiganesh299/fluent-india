export type CourseId = 'longterm' | 'shortterm' | 'crash';

export interface Course {
  id: CourseId;
  name: string;
  durationLabel: string;
  durationDays: number;
  isCalendarMonth?: boolean;
  description: string;
  modules: string[];
  fee: string;
  contactForFees: boolean;
  isActive: boolean;
}

export type EnrolmentStatus = 'upcoming' | 'ongoing' | 'material_only' | 'expired';

export interface Enrolment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: CourseId;
  courseName: string;
  startDate: string; // ISO date YYYY-MM-DD
  courseEndDate: string; // ISO date YYYY-MM-DD
  materialAccessUntil: string; // ISO date YYYY-MM-DD (3 months after course end date)
  assignmentSupportUntil: string; // ISO date YYYY-MM-DD (defaults to courseEndDate)
  group?: 'October Morning' | 'October Evening' | 'September Evening' | 'November Morning' | 'Morning' | 'Evening' | 'Self-Paced';
  schedule?: string;
  liveClassUrl?: string;
  status: EnrolmentStatus;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarInitials: string;
  targetBand: string;
  stream: 'Academic' | 'General Training';
  currentEnrolmentId?: string;
  enrolmentIds: string[];
  createdAt: string;
  recentActivity: {
    id: string;
    action: string;
    detail: string;
    date: string;
    type: 'material' | 'assignment' | 'enrolment';
  }[];
}

export type ModuleType = 'Listening' | 'Reading' | 'Writing' | 'Speaking';
export type LessonStatus = 'Published' | 'Draft' | 'Processing';

export interface LessonFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface Lesson {
  id: string;
  title: string;
  module: ModuleType;
  order: string;
  assignedCourseIds: CourseId[];
  status: LessonStatus;
  description: string;
  videoUrl?: string;
  videoTitle?: string;
  files: LessonFile[];
  updatedAt: string;
}

export type AssignmentStatus = 'Draft' | 'Published' | 'Archived';

export interface AssignmentTemplate {
  id: string;
  title: string;
  module: ModuleType;
  targetCourseId: CourseId;
  instructions: string;
  promptContent?: string; // passage for Reading, cue card for Speaking, task prompt for Writing
  acceptedFormats: ('Text' | 'PDF' | 'Image' | 'Audio')[];
  worksheetName?: string;
  worksheetSize?: string;
  status: AssignmentStatus;
  totalSubmissionsCount: number;
  createdAt: string;
}

export type AssignedWorkStatus = 'Scheduled' | 'Pending' | 'Submitted' | 'Revision Requested' | 'Reviewed';

export interface AssignedWork {
  id: string;
  templateId: string;
  assignmentTitle: string;
  module: ModuleType;
  studentId: string;
  studentName: string;
  studentEmail: string;
  releaseDate: string;
  dueDate: string;
  status: AssignedWorkStatus;
  submissionId?: string;
  assignedAt: string;
}

export interface Submission {
  id: string;
  assignedWorkId: string;
  templateId: string;
  assignmentTitle: string;
  module: ModuleType;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  submittedAt: string;
  attemptNumber: number;
  typedAnswer: string;
  wordCount?: number;
  attachedFiles: { name: string; size: string; type: string }[];
  status: 'Submitted' | 'Reviewed' | 'Revision Requested';
  review?: {
    tutorId: string;
    tutorName: string;
    reviewedAt: string;
    practiceBand: string;
    criteriaScores: {
      ta: number;
      cc: number;
      lr: number;
      gra: number;
    };
    feedbackNotes: string;
    correctedFile?: string;
  };
}

export type EnquiryStatus = 'New' | 'Contacted' | 'Enrolled';

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseInterestedIn: string;
  targetBand?: string;
  message: string;
  receivedAt: string;
  status: EnquiryStatus;
  tutorNotes?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  coverImage: string;
  status: 'Published' | 'Draft';
  publishedDate: string;
}

export interface Testimonial {
  id: string;
  studentName: string;
  bandScore: string;
  quote: string;
  hasPermissionToPublish: boolean;
  isVisibleOnHomepage: boolean;
  order: number;
}

export interface WebsiteContent {
  tutorProfile: {
    name: string;
    title: string;
    photoUrl: string;
    intro: string;
    teachingApproach: string;
    credentials: string[];
  };
  contactDetails: {
    email: string;
    phone: string;
    whatsapp: string;
    officeHours: string;
    ctaLabel: string;
  };
  publicVideos: {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnail: string;
    isPublished: boolean;
  }[];
}

export interface AppSettings {
  branding: {
    academyName: string;
    tagline: string;
  };
  accessRules: {
    defaultMaterialBufferMonths: number;
    allowSubmissionsDuringBuffer: boolean;
  };
  notifications: {
    newEnquiry: boolean;
    assignmentSubmitted: boolean;
    feedbackPublished: boolean;
    materialExpiryReminder: boolean;
    reminderIntervalDays: number;
  };
  account: {
    tutorName: string;
    tutorEmail: string;
    avatarInitials: string;
  };
}
