export type Role = 'TEACHER' | 'STUDENT';

export type MaterialType = 'IMAGE' | 'PDF' | 'PPT' | 'TEXT';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  createdAt: Date;
}

export interface Classroom {
  id: string;
  name: string;
  subject?: string | null;
  code: string;
  teacherId: string;
  teacher?: User;
  createdAt: Date;
  enrollments?: Enrollment[];
  materials?: Material[];
  _count?: {
    enrollments: number;
    materials: number;
  };
}

export interface Enrollment {
  id: string;
  userId: string;
  classroomId: string;
  joinedAt: Date;
  user?: User;
  classroom?: Classroom;
}

export interface Material {
  id: string;
  classroomId: string;
  uploadedById: string;
  title: string;
  type: MaterialType;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  pageCount?: number | null;
  createdAt: Date;
  classroom?: Classroom;
  annotations?: Annotation[];
  notes?: StudentNote[];
  _count?: {
    annotations: number;
    notes: number;
  };
}

export interface Annotation {
  id: string;
  materialId: string;
  data: Record<string, unknown>;
  createdAt: Date;
}

export interface StudentNote {
  id: string;
  userId: string;
  materialId: string;
  content: string;
  isAIGenerated: boolean;
  createdAt: Date;
  material?: Material;
}

export interface BoardSession {
  id: string;
  classroomId: string;
  materialId?: string | null;
  isLive: boolean;
  startedAt: Date;
  endedAt?: Date | null;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export interface SocketEvents {
  'join:classroom': { classroomId: string; userId: string; role: Role };
  'board:setMaterial': { classroomId: string; material: Material };
  'material:new': Material;
  'annotation:stroke': { classroomId: string; path: unknown };
  'annotation:clear': { classroomId: string };
  'board:pageChange': { classroomId: string; page: number };
  'presence:update': { classroomId: string; count: number };
  'notification:new': Notification;
  'notes:ready': { classroomId: string; materialId: string };
}
