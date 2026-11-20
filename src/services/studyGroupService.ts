import {
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config.ts';
import { StudyGroup, GroupMessage, Role } from '../types/index.ts';
import { createAuditLog } from './auditService.ts';

const GROUPS_PATH = 'studyGroups';

export const DEFAULT_STUDY_GROUPS: StudyGroup[] = [
  {
    id: 'grp_seed_1',
    title: 'UZ Software Engineering Honours 2026',
    courseCode: 'SE201',
    department: 'Software Engineering',
    description: 'Collaborative problem solving for design patterns, database architecture, and agile sprints.',
    creatorId: 'user_talent_nechaz_admin',
    creatorName: 'Talent Nechiturike (Lead Engineer)',
    memberCount: 14,
    maxMembers: 30,
    meetingSchedule: 'Tuesdays & Thursdays, 16:00 CAT',
    topics: 'Clean Architecture, Microservices, MongoDB & Prisma schemas, Docker',
    isPublic: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'grp_seed_2',
    title: 'Calculus & Engineering Mathematics Problem Solving',
    courseCode: 'MTH204',
    department: 'Mathematics',
    description: 'Weekly peer review of differential equation problem sets, Laplace transforms, and linear algebra.',
    creatorId: 'user_farai_chimurenga_tutor',
    creatorName: 'Dr. Farai Chimurenga',
    memberCount: 22,
    maxMembers: 40,
    meetingSchedule: 'Wednesdays, 14:00 CAT',
    topics: 'Differential equations, eigenvalues, Taylor series expansions',
    isPublic: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'grp_seed_3',
    title: 'Embedded Systems & Robotics Lab Squad',
    courseCode: 'EE302',
    department: 'Electrical Engineering',
    description: 'Hands-on hardware troubleshooting, oscilloscope debugging, and C/C++ firmware optimization.',
    creatorId: 'user_tanaka_moyo_student',
    creatorName: 'Tanaka Moyo',
    memberCount: 8,
    maxMembers: 15,
    meetingSchedule: 'Fridays, 15:30 CAT',
    topics: 'ARM Cortex-M, GPIO registers, UART protocol, PWM motor control',
    isPublic: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export function subscribeStudyGroups(callback: (groups: StudyGroup[]) => void): () => void {
  const q = query(collection(db, GROUPS_PATH), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const groups = snapshot.docs.map((d) => d.data() as StudyGroup);
      if (groups.length > 0) {
        callback(groups);
      } else {
        callback(DEFAULT_STUDY_GROUPS);
      }
    },
    (error) => {
      console.warn('Using local study groups on snapshot error:', error);
      callback(DEFAULT_STUDY_GROUPS);
    }
  );
}

export function subscribeGroupMessages(
  groupId: string,
  callback: (messages: GroupMessage[]) => void
): () => void {
  const messagesCol = collection(db, `${GROUPS_PATH}/${groupId}/messages`);
  const q = query(messagesCol, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((d) => d.data() as GroupMessage);
      callback(messages);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${GROUPS_PATH}/${groupId}/messages`);
    }
  );
}

export async function createStudyGroup(
  groupData: Omit<StudyGroup, 'id' | 'createdAt' | 'memberCount'>,
  user: { id: string; name: string; role: Role }
): Promise<string> {
  const groupId = `grp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const groupDoc = doc(db, GROUPS_PATH, groupId);

  const newGroup: StudyGroup = {
    ...groupData,
    id: groupId,
    memberCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(groupDoc, newGroup);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${GROUPS_PATH}/${groupId}`);
  }

  await createAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'CREATE_STUDY_GROUP',
    target: newGroup.title,
    metadata: `Course: ${newGroup.courseCode}, Max: ${newGroup.maxMembers}`,
  });

  return groupId;
}

export async function sendGroupMessage(
  groupId: string,
  groupTitle: string,
  text: string,
  user: { id: string; name: string; role: Role }
): Promise<void> {
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const msgDoc = doc(db, `${GROUPS_PATH}/${groupId}/messages`, msgId);

  const messageData: GroupMessage = {
    id: msgId,
    groupId,
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(msgDoc, messageData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${GROUPS_PATH}/${groupId}/messages/${msgId}`);
  }

  await createAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'SEND_GROUP_MESSAGE',
    target: groupTitle,
    metadata: `Message in ${groupTitle}: "${text.substring(0, 30)}..."`,
  });
}

export async function joinStudyGroup(
  group: StudyGroup,
  user: { id: string; name: string; role: Role }
): Promise<void> {
  const groupDoc = doc(db, GROUPS_PATH, group.id);
  const newCount = (group.memberCount || 1) + 1;

  try {
    await updateDoc(groupDoc, {
      memberCount: newCount,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${GROUPS_PATH}/${group.id}`);
  }

  await createAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'JOIN_STUDY_GROUP',
    target: group.title,
    metadata: `Joined room. Total members: ${newCount}`,
  });
}

export async function seedInitialStudyGroupsIfEmpty(user: { id: string; name: string; role: Role }): Promise<void> {
  try {
    const existing = await getDocs(query(collection(db, GROUPS_PATH), limit(1)));
    if (!existing.empty) return;

    const initialGroups: Omit<StudyGroup, 'id'>[] = [
      {
        title: 'UZ Software Engineering Honours 2026',
        courseCode: 'SE201',
        department: 'Software Engineering',
        description: 'Collaborative problem solving for design patterns, database architecture, and agile sprints.',
        creatorId: user.id,
        creatorName: 'Talent Nechiturike (Lead Engineer)',
        memberCount: 14,
        maxMembers: 30,
        meetingSchedule: 'Tuesdays & Thursdays, 16:00 CAT',
        topics: 'Clean Architecture, Microservices, MongoDB & Prisma schemas, Docker',
        isPublic: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        title: 'Calculus & Engineering Mathematics Problem Solving',
        courseCode: 'MTH204',
        department: 'Mathematics',
        description: 'Weekly peer review of differential equation problem sets, Laplace transforms, and linear algebra.',
        creatorId: user.id,
        creatorName: 'Dr. Farai Chimurenga',
        memberCount: 22,
        maxMembers: 40,
        meetingSchedule: 'Wednesdays, 14:00 CAT',
        topics: 'Differential equations, eigenvalues, Taylor series expansions',
        isPublic: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        title: 'Embedded Systems & Robotics Lab Squad',
        courseCode: 'EE302',
        department: 'Electrical Engineering',
        description: 'Hands-on hardware troubleshooting, oscilloscope debugging, and C/C++ firmware optimization.',
        creatorId: user.id,
        creatorName: 'Tanaka Moyo',
        memberCount: 8,
        maxMembers: 15,
        meetingSchedule: 'Fridays, 15:30 CAT',
        topics: 'ARM Cortex-M, GPIO registers, UART protocol, PWM motor control',
        isPublic: true,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ];

    for (const grp of initialGroups) {
      const gId = `grp_seed_${Math.random().toString(36).substring(2, 9)}`;
      await setDoc(doc(db, GROUPS_PATH, gId), {
        ...grp,
        id: gId,
      });

      // Add a welcome message to each room
      const msgId = `msg_welcome_${Math.random().toString(36).substring(2, 9)}`;
      await setDoc(doc(db, `${GROUPS_PATH}/${gId}/messages`, msgId), {
        id: msgId,
        groupId: gId,
        senderId: user.id,
        senderName: grp.creatorName,
        senderRole: 'TUTOR',
        text: `Welcome to ${grp.title}! Feel free to share your questions, lecture doubts, and exam prep tips here.`,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Seed study group error (ignored):', err);
  }
}
