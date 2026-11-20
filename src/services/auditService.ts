import {
  collection,
  doc,
  setDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config.ts';
import { AuditLogEntry, Role } from '../types/index.ts';

const AUDIT_PATH = 'auditLogs';

/**
 * Step 6: Audit Logging Service from Talent Nechiturike's Architecture Guide
 * Centralized logging for transparency and security auditing.
 */
export async function createAuditLog(entry: {
  userId: string;
  userName: string;
  userRole: Role;
  action: AuditLogEntry['action'];
  target: string;
  metadata?: string;
}): Promise<void> {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const logDoc = doc(db, AUDIT_PATH, logId);
  const data: AuditLogEntry = {
    id: logId,
    userId: entry.userId,
    userName: entry.userName,
    userRole: entry.userRole,
    action: entry.action,
    target: entry.target,
    metadata: entry.metadata || '',
    timestamp: new Date().toISOString(),
  };

  try {
    await setDoc(logDoc, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${AUDIT_PATH}/${logId}`);
  }
}

export const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log_init_1',
    userId: 'user_talent_nechaz_admin',
    userName: 'Talent Nechiturike (Lead Engineer)',
    userRole: 'ADMIN',
    action: 'AUTH_LOGIN',
    target: 'STEM STUDY Platform',
    metadata: 'Lead Architect session initialized with ADMIN role claims',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'log_init_2',
    userId: 'user_talent_nechaz_admin',
    userName: 'Talent Nechiturike',
    userRole: 'ADMIN',
    action: 'UPLOAD_RESOURCE',
    target: 'SE201 Software Architecture & Design Patterns Exam Pack',
    metadata: 'Course: SE201, Department: Software Engineering',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'log_init_3',
    userId: 'user_farai_chimurenga_tutor',
    userName: 'Dr. Farai Chimurenga',
    userRole: 'TUTOR',
    action: 'VERIFY_RESOURCE',
    target: 'CS101 Discrete Mathematics Solutions',
    metadata: 'Verified by Tutor with formal induction and graph proofs',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'log_init_4',
    userId: 'user_tanaka_moyo_student',
    userName: 'Tanaka Moyo',
    userRole: 'STUDENT',
    action: 'JOIN_STUDY_GROUP',
    target: 'UZ Software Engineering Honours 2026',
    metadata: 'Joined room. Total members: 14',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
];

export function subscribeAuditLogs(
  callback: (logs: AuditLogEntry[]) => void,
  maxRecords: number = 60
): () => void {
  const q = query(
    collection(db, AUDIT_PATH),
    orderBy('timestamp', 'desc'),
    limit(maxRecords)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const logs = snapshot.docs.map((docSnap) => docSnap.data() as AuditLogEntry);
      if (logs.length > 0) {
        callback(logs);
      } else {
        callback(DEFAULT_AUDIT_LOGS);
      }
    },
    (error) => {
      console.warn('Using local audit logs on snapshot error:', error);
      callback(DEFAULT_AUDIT_LOGS);
    }
  );
}
