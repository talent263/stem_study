export type Role = 'STUDENT' | 'TUTOR' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  institution?: string;
  department?: string;
  avatarUrl?: string;
  isDemo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ResourceLevel = 'Year 1' | 'Year 2' | 'Year 3' | 'Year 4' | 'Postgraduate';

export type ResourceType =
  | 'Past Paper'
  | 'Lecture Notes'
  | 'Lab Manual'
  | 'Tutorial & Solutions'
  | 'Code Snippet'
  | 'Revision Guide';

export type ResourceStatus = 'pending' | 'verified' | 'rejected';

export interface AcademicResource {
  id: string;
  title: string;
  description: string;
  courseCode: string; // e.g. SE201, CS101, MTH204
  department: string; // e.g. Software Engineering, Computer Science, Electrical Engineering
  level: ResourceLevel;
  resourceType: ResourceType;
  tags: string[];
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  authorId: string;
  authorName: string;
  authorRole: Role;
  status: ResourceStatus;
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  downloadsCount: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ResourceComment {
  id: string;
  resourceId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  text: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action:
    | 'AUTH_LOGIN'
    | 'AUTH_LOGOUT'
    | 'ROLE_SWITCH'
    | 'UPLOAD_RESOURCE'
    | 'VERIFY_RESOURCE'
    | 'REJECT_RESOURCE'
    | 'DELETE_RESOURCE'
    | 'UPDATE_RESOURCE'
    | 'ADD_COMMENT'
    | 'CREATE_STUDY_GROUP'
    | 'JOIN_STUDY_GROUP'
    | 'SEND_GROUP_MESSAGE'
    | 'DOWNLOAD_RESOURCE'
    | 'RATE_RESOURCE'
    | 'ADMIN_UPDATE_ROLE';
  target: string;
  metadata?: string;
  timestamp: string;
}

export interface StudyGroup {
  id: string;
  title: string;
  courseCode: string;
  department: string;
  description: string;
  creatorId: string;
  creatorName: string;
  memberCount: number;
  maxMembers: number;
  meetingSchedule: string;
  topics: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
