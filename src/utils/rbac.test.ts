import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasRole,
  canUploadResource,
  canVerifyResource,
  canDeleteResource,
  canManageUsers,
  canViewAuditLogs,
  validateResourceData,
} from './rbac.ts';

test('RBAC hierarchy checks work correctly', () => {
  assert.equal(hasRole('STUDENT', 'STUDENT'), true);
  assert.equal(hasRole('STUDENT', 'TUTOR'), false);
  assert.equal(hasRole('STUDENT', 'ADMIN'), false);

  assert.equal(hasRole('TUTOR', 'STUDENT'), true);
  assert.equal(hasRole('TUTOR', 'TUTOR'), true);
  assert.equal(hasRole('TUTOR', 'ADMIN'), false);

  assert.equal(hasRole('ADMIN', 'STUDENT'), true);
  assert.equal(hasRole('ADMIN', 'TUTOR'), true);
  assert.equal(hasRole('ADMIN', 'ADMIN'), true);
});

test('RBAC action permissions enforce authorization rules', () => {
  // Uploading
  assert.equal(canUploadResource('STUDENT'), true);
  assert.equal(canUploadResource('TUTOR'), true);
  assert.equal(canUploadResource('ADMIN'), true);

  // Verifying resources (only Tutor and Admin)
  assert.equal(canVerifyResource('STUDENT'), false);
  assert.equal(canVerifyResource('TUTOR'), true);
  assert.equal(canVerifyResource('ADMIN'), true);

  // Deleting resources (Author or Tutor or Admin)
  assert.equal(canDeleteResource('STUDENT', false), false);
  assert.equal(canDeleteResource('STUDENT', true), true);
  assert.equal(canDeleteResource('TUTOR', false), true);
  assert.equal(canDeleteResource('ADMIN', false), true);

  // Managing users
  assert.equal(canManageUsers('STUDENT'), false);
  assert.equal(canManageUsers('TUTOR'), false);
  assert.equal(canManageUsers('ADMIN'), true);

  // Audit log oversight
  assert.equal(canViewAuditLogs('STUDENT'), false);
  assert.equal(canViewAuditLogs('TUTOR'), true);
  assert.equal(canViewAuditLogs('ADMIN'), true);
});

test('validateResourceData enforces required fields', () => {
  const invalid = validateResourceData({
    title: '',
    courseCode: '',
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.length >= 3);

  const valid = validateResourceData({
    title: 'SE201 Design Patterns and Architecture',
    courseCode: 'SE201',
    department: 'Software Engineering',
    resourceType: 'Lecture Notes',
    level: 'Year 2',
  });
  assert.equal(valid.isValid, true);
  assert.equal(valid.errors.length, 0);
});
