import { Role } from '../types/index.ts';

/**
 * RBAC authorization logic based on Talent Nechiturike's STEM STUDY specification.
 * Roles: STUDENT, TUTOR, ADMIN
 */

const ROLE_HIERARCHY: Record<Role, number> = {
  STUDENT: 1,
  TUTOR: 2,
  ADMIN: 3,
};

export function hasRole(currentRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canUploadResource(role: Role): boolean {
  return role === 'STUDENT' || role === 'TUTOR' || role === 'ADMIN';
}

export function canVerifyResource(role: Role): boolean {
  return role === 'TUTOR' || role === 'ADMIN';
}

export function canDeleteResource(role: Role, isAuthor: boolean): boolean {
  if (role === 'ADMIN') return true;
  if (role === 'TUTOR') return true;
  return isAuthor;
}

export function canManageUsers(role: Role): boolean {
  return role === 'ADMIN';
}

export function canViewAuditLogs(role: Role): boolean {
  // Full audit oversight for Tutors and Admins, Students can view their own activity
  return role === 'ADMIN' || role === 'TUTOR';
}

export function canModerateContent(role: Role): boolean {
  return role === 'ADMIN' || role === 'TUTOR';
}

export interface ResourceInputValidation {
  isValid: boolean;
  errors: string[];
}

export function validateResourceData(data: {
  title?: string;
  courseCode?: string;
  department?: string;
  resourceType?: string;
  level?: string;
}): ResourceInputValidation {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long.');
  }
  if (!data.courseCode || data.courseCode.trim().length < 2) {
    errors.push('Course code is required (e.g., SE201, CS101).');
  }
  if (!data.department || data.department.trim().length === 0) {
    errors.push('Department is required.');
  }
  if (!data.resourceType) {
    errors.push('Resource type is required.');
  }
  if (!data.level) {
    errors.push('Academic level is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
