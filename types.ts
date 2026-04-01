
export enum UserRole {
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type QuestionType = 'TEXT' | 'MCQ';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[]; // For MCQ
  correctAnswer?: string; // Optional, for auto-grading MCQs later
}
export interface Assessment {
  id: string;
  instructorId: string;
  title: string;
  questions: Question[]; // Array of questions
  rubric: string; // General rubric for the whole assessment
  createdAt: string;
}

export type ResourceType = 'VIDEO' | 'PDF' | 'IMAGE' | 'DOCUMENT' | 'SPREADSHEET' | 'OTHER';

export interface CourseResource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  mimeType?: string; // For correct download/preview
  instructorId: string;
  createdAt: string;
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED'
}

export interface Submission {
  id: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  answers: Record<string, string>; // Map questionId -> answer text
  status: SubmissionStatus;
  submittedAt: string;
  viewedAt?: string;
}

export interface FeedbackTag {
  id: string;
  name: string;
  category: 'CONTENT' | 'STRUCTURE' | 'CRITICAL_THINKING' | 'REASONING';
}

export interface Feedback {
  id: string;
  submissionId: string;
  instructorId: string;
  content: string;
  modelAnswer?: string; // New field for the ideal answer
  isAiGenerated: boolean;
  wasModified: boolean; // Analytics: Did the human edit the AI draft?
  tags: string[]; // IDs
  improvementSuggestions: string[];
  interactionTime: number; // Analytics: Seconds spent by instructor
  createdAt: string;
}

export interface AiFeedbackResponse {
  feedback: string;
  modelAnswer?: string; // New field from AI
  suggestedTags: string[];
  improvements: string[];
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}
