import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config.ts';
import { AcademicResource, ResourceComment, Role } from '../types/index.ts';
import { createAuditLog } from './auditService.ts';

const RESOURCES_PATH = 'resources';

export const DEFAULT_STEM_SEEDS: AcademicResource[] = [
  {
    id: 'res_seed_1',
    title: 'SE201 Software Architecture & Design Patterns (Gang of Four) Exam Pack',
    description: 'Comprehensive study pack including past examination questions, structural diagrams for Factory, Singleton, Observer, and Strategy patterns with clean TypeScript & Java code implementations. Reviewed and verified by Software Engineering faculty.',
    courseCode: 'SE201',
    department: 'Software Engineering',
    level: 'Year 2',
    resourceType: 'Past Paper',
    tags: ['Architecture', 'Design Patterns', 'UML', 'OOP', 'Gang of Four'],
    content: `### SE201: Software Architecture & Design Patterns (UZ 2024 Exam Revision)

1. Architectural Styles Overview:
- Layered (N-Tier): Presentation -> Business Logic -> Data Access
- Microservices: Independent deployable units communicating over RPC/REST
- Event-Driven: Pub/Sub messaging with loose coupling

2. Observer Pattern Implementation in TypeScript:
\`\`\`ts
interface Observer {
  update(event: string, data: any): void;
}

class AcademicResourceHub {
  private observers: Observer[] = [];
  
  subscribe(observer: Observer) {
    this.observers.push(observer);
  }
  
  notify(event: string, payload: any) {
    this.observers.forEach(o => o.update(event, payload));
  }
}
\`\`\`

3. Key Exam Questions:
- Distinguish between Coupling and Cohesion.
- Explain Open/Closed Principle (OCP) with code demonstration.`,
    authorId: 'user_talent_nechaz_admin',
    authorName: 'Talent Nechiturike (Lead Engineer)',
    authorRole: 'ADMIN',
    status: 'verified',
    verificationNotes: 'Official syllabus-aligned past paper revision guide for University of Zimbabwe SE Dept.',
    verifiedBy: 'Talent Nechiturike',
    verifiedAt: new Date().toISOString(),
    downloadsCount: 142,
    ratingAvg: 4.9,
    ratingCount: 18,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'res_seed_2',
    title: 'CS101 Discrete Mathematics: Induction, Recurrences & Graph Theory Solutions',
    description: 'Step-by-step mathematical proofs for strong mathematical induction, master theorem for recurrence relations T(n) = aT(n/b) + f(n), and graph traversal Dijkstra/BFS derivations.',
    courseCode: 'CS101',
    department: 'Computer Science',
    level: 'Year 1',
    resourceType: 'Tutorial & Solutions',
    tags: ['Discrete Math', 'Induction', 'Master Theorem', 'Graph Theory'],
    content: `### Master Theorem Reference:
For recurrences of form: T(n) = aT(n/b) + f(n) with a >= 1, b > 1:
- Case 1: If f(n) = O(n^(log_b(a) - e)) for e > 0, then T(n) = Theta(n^(log_b(a))).
- Case 2: If f(n) = Theta(n^(log_b(a))), then T(n) = Theta(n^(log_b(a)) * log n).
- Case 3: If f(n) = Omega(n^(log_b(a) + e)) and regularity condition holds, then T(n) = Theta(f(n)).`,
    authorId: 'user_farai_chimurenga_tutor',
    authorName: 'Dr. Farai Chimurenga',
    authorRole: 'TUTOR',
    status: 'verified',
    verificationNotes: 'Verified with formal mathematical proofs.',
    verifiedBy: 'Dr. Farai Chimurenga',
    verifiedAt: new Date().toISOString(),
    downloadsCount: 98,
    ratingAvg: 4.8,
    ratingCount: 12,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'res_seed_3',
    title: 'MTH204 Differential Equations: Laplace Transforms & Second-Order Cauchy-Euler',
    description: 'Complete revision guide for solving linear non-homogeneous differential equations with constant coefficients using undetermined coefficients and Laplace transform tables.',
    courseCode: 'MTH204',
    department: 'Mathematics',
    level: 'Year 2',
    resourceType: 'Revision Guide',
    tags: ['Calculus', 'Laplace', 'Differential Equations', 'Engineering Math'],
    content: `### Common Laplace Transform Pairs:
- L{ 1 } = 1 / s
- L{ t^n } = n! / s^(n+1)
- L{ e^(at) } = 1 / (s - a)
- L{ sin(wt) } = w / (s^2 + w^2)
- L{ cos(wt) } = s / (s^2 + w^2)
- L{ y'(t) } = s Y(s) - y(0)
- L{ y''(t) } = s^2 Y(s) - s y(0) - y'(0)`,
    authorId: 'user_tanaka_moyo_student',
    authorName: 'Tanaka Moyo',
    authorRole: 'STUDENT',
    status: 'verified',
    verificationNotes: 'Checked against university lecture notes.',
    verifiedBy: 'Dr. Farai Chimurenga',
    verifiedAt: new Date().toISOString(),
    downloadsCount: 75,
    ratingAvg: 4.7,
    ratingCount: 9,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'res_seed_4',
    title: 'EE302 Embedded Systems & Microcontrollers: STM32 Register Configuration Manual',
    description: 'Hands-on laboratory guide covering ARM Cortex-M architecture, memory-mapped I/O, USART serial debugging, timer interrupts, and ADC sampling configuration.',
    courseCode: 'EE302',
    department: 'Electrical Engineering',
    level: 'Year 3',
    resourceType: 'Lab Manual',
    tags: ['Embedded', 'ARM Cortex', 'STM32', 'C Programming', 'Registers'],
    content: `// Bare-metal GPIO LED toggle on STM32
#define RCC_AHB1ENR (*((volatile uint32_t *) 0x40023830))
#define GPIOA_MODER  (*((volatile uint32_t *) 0x40020000))
#define GPIOA_ODR    (*((volatile uint32_t *) 0x40020014))

void init_led(void) {
  RCC_AHB1ENR |= (1 << 0); // Enable GPIOA clock
  GPIOA_MODER |= (1 << 10); // Set PA5 as general purpose output mode
}

void toggle_led(void) {
  GPIOA_ODR ^= (1 << 5);
}`,
    authorId: 'user_kudzai_shumba_student',
    authorName: 'Kudzai Shumba',
    authorRole: 'STUDENT',
    status: 'pending',
    verificationNotes: 'Awaiting tutor lab review.',
    downloadsCount: 41,
    ratingAvg: 4.5,
    ratingCount: 5,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export async function createResource(
  resource: Omit<AcademicResource, 'id' | 'createdAt' | 'downloadsCount' | 'ratingAvg' | 'ratingCount'>,
  user: { id: string; name: string; role: Role }
): Promise<string> {
  const resourceId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const resourceDoc = doc(db, RESOURCES_PATH, resourceId);

  const newResource: AcademicResource = {
    ...resource,
    id: resourceId,
    downloadsCount: 0,
    ratingAvg: 5.0,
    ratingCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(resourceDoc, newResource);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${RESOURCES_PATH}/${resourceId}`);
  }

  // Audit Log Step 6 & 7
  await createAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'UPLOAD_RESOURCE',
    target: newResource.title,
    metadata: `Course: ${newResource.courseCode}, Level: ${newResource.level}`,
  });

  return resourceId;
}

export function subscribeResources(callback: (resources: AcademicResource[]) => void): () => void {
  const q = query(collection(db, RESOURCES_PATH), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const resources = snapshot.docs.map((d) => d.data() as AcademicResource);
      if (resources.length > 0) {
        callback(resources);
      } else {
        callback(DEFAULT_STEM_SEEDS);
      }
    },
    (error) => {
      console.warn('Using local STEM resources on snapshot error:', error);
      callback(DEFAULT_STEM_SEEDS);
    }
  );
}

export async function updateResourceVerification(
  resourceId: string,
  resourceTitle: string,
  status: 'verified' | 'rejected',
  notes: string,
  user: { id: string; name: string; role: Role }
): Promise<void> {
  const resourceDoc = doc(db, RESOURCES_PATH, resourceId);

  try {
    await updateDoc(resourceDoc, {
      status,
      verificationNotes: notes,
      verifiedBy: user.name,
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${RESOURCES_PATH}/${resourceId}`);
  }

  await createAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: status === 'verified' ? 'VERIFY_RESOURCE' : 'REJECT_RESOURCE',
    target: resourceTitle,
    metadata: `Status changed to ${status}. Notes: ${notes}`,
  });
}

export async function incrementDownloads(resource: AcademicResource, user: { id: string; name: string; role: Role }): Promise<void> {
  const resourceDoc = doc(db, RESOURCES_PATH, resource.id);
  try {
    await updateDoc(resourceDoc, {
      downloadsCount: (resource.downloadsCount || 0) + 1,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${RESOURCES_PATH}/${resource.id}`);
  }

  await createAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'DOWNLOAD_RESOURCE',
    target: resource.title,
    metadata: `Downloads: ${(resource.downloadsCount || 0) + 1}`,
  });
}

export async function rateResource(
  resource: AcademicResource,
  rating: number,
  user: { id: string; name: string; role: Role }
): Promise<void> {
  const resourceDoc = doc(db, RESOURCES_PATH, resource.id);
  const currentCount = resource.ratingCount || 0;
  const currentAvg = resource.ratingAvg || 5;
  const newCount = currentCount + 1;
  const newAvg = Math.round(((currentAvg * currentCount + rating) / newCount) * 10) / 10;

  try {
    await updateDoc(resourceDoc, {
      ratingAvg: newAvg,
      ratingCount: newCount,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${RESOURCES_PATH}/${resource.id}`);
  }

  await createAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'RATE_RESOURCE',
    target: resource.title,
    metadata: `Rated ${rating}/5. New avg: ${newAvg}`,
  });
}

export async function deleteResource(
  resourceId: string,
  resourceTitle: string,
  user: { id: string; name: string; role: Role }
): Promise<void> {
  const resourceDoc = doc(db, RESOURCES_PATH, resourceId);
  try {
    await deleteDoc(resourceDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${RESOURCES_PATH}/${resourceId}`);
  }

  await createAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'DELETE_RESOURCE',
    target: resourceTitle,
    metadata: `Deleted by ${user.name} (${user.role})`,
  });
}

// Subcollection: Comments
export function subscribeComments(
  resourceId: string,
  callback: (comments: ResourceComment[]) => void
): () => void {
  const commentsCol = collection(db, `${RESOURCES_PATH}/${resourceId}/comments`);
  const q = query(commentsCol, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const comments = snapshot.docs.map((d) => d.data() as ResourceComment);
      callback(comments);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${RESOURCES_PATH}/${resourceId}/comments`);
    }
  );
}

export async function addComment(
  resourceId: string,
  resourceTitle: string,
  text: string,
  user: { id: string; name: string; role: Role }
): Promise<void> {
  const commentId = `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const commentDoc = doc(db, `${RESOURCES_PATH}/${resourceId}/comments`, commentId);

  const commentData: ResourceComment = {
    id: commentId,
    resourceId,
    authorId: user.id,
    authorName: user.name,
    authorRole: user.role,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(commentDoc, commentData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${RESOURCES_PATH}/${resourceId}/comments/${commentId}`);
  }

  await createAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'ADD_COMMENT',
    target: resourceTitle,
    metadata: `Comment: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`,
  });
}

// Initial Seed for University of Zimbabwe STEM study curriculum
export async function seedInitialResourcesIfEmpty(user: { id: string; name: string; role: Role }): Promise<void> {
  try {
    const existingSnap = await getDocs(query(collection(db, RESOURCES_PATH), limit(1)));
    if (!existingSnap.empty) {
      return; // Already populated
    }

    const seeds: Omit<AcademicResource, 'id'>[] = [
      {
        title: 'SE201 Software Architecture & Design Patterns (Gang of Four) Exam Pack',
        description: 'Comprehensive study pack including past examination questions, structural diagrams for Factory, Singleton, Observer, and Strategy patterns with clean TypeScript & Java code implementations. Reviewed and verified by Software Engineering faculty.',
        courseCode: 'SE201',
        department: 'Software Engineering',
        level: 'Year 2',
        resourceType: 'Past Paper',
        tags: ['Architecture', 'Design Patterns', 'UML', 'OOP', 'Gang of Four'],
        content: `### SE201: Software Architecture & Design Patterns (UZ 2024 Exam Revision)

1. Architectural Styles Overview:
- Layered (N-Tier): Presentation -> Business Logic -> Data Access
- Microservices: Independent deployable units communicating over RPC/REST
- Event-Driven: Pub/Sub messaging with loose coupling

2. Observer Pattern Implementation in TypeScript:
\`\`\`ts
interface Observer {
  update(event: string, data: any): void;
}

class AcademicResourceHub {
  private observers: Observer[] = [];
  
  subscribe(observer: Observer) {
    this.observers.push(observer);
  }
  
  notify(event: string, payload: any) {
    this.observers.forEach(o => o.update(event, payload));
  }
}
\`\`\`

3. Key Exam Questions:
- Distinguish between Coupling and Cohesion.
- Explain Open/Closed Principle (OCP) with code demonstration.`,
        authorId: user.id,
        authorName: 'Talent Nechiturike (Lead Engineer)',
        authorRole: 'ADMIN',
        status: 'verified',
        verificationNotes: 'Official syllabus-aligned past paper revision guide for University of Zimbabwe SE Dept.',
        verifiedBy: 'Talent Nechiturike',
        verifiedAt: new Date().toISOString(),
        downloadsCount: 142,
        ratingAvg: 4.9,
        ratingCount: 18,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        title: 'CS101 Discrete Mathematics: Induction, Recurrences & Graph Theory Solutions',
        description: 'Step-by-step mathematical proofs for strong mathematical induction, master theorem for recurrence relations T(n) = aT(n/b) + f(n), and graph traversal Dijkstra/BFS derivations.',
        courseCode: 'CS101',
        department: 'Computer Science',
        level: 'Year 1',
        resourceType: 'Tutorial & Solutions',
        tags: ['Discrete Math', 'Induction', 'Master Theorem', 'Graph Theory'],
        content: `### Master Theorem Reference:
For recurrences of form: T(n) = aT(n/b) + f(n) with a >= 1, b > 1:
- Case 1: If f(n) = O(n^(log_b(a) - e)) for e > 0, then T(n) = Theta(n^(log_b(a))).
- Case 2: If f(n) = Theta(n^(log_b(a))), then T(n) = Theta(n^(log_b(a)) * log n).
- Case 3: If f(n) = Omega(n^(log_b(a) + e)) and regularity condition holds, then T(n) = Theta(f(n)).`,
        authorId: user.id,
        authorName: 'Dr. Farai Chimurenga',
        authorRole: 'TUTOR',
        status: 'verified',
        verificationNotes: 'Verified with formal mathematical proofs.',
        verifiedBy: 'Dr. Farai Chimurenga',
        verifiedAt: new Date().toISOString(),
        downloadsCount: 98,
        ratingAvg: 4.8,
        ratingCount: 12,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        title: 'MTH204 Differential Equations: Laplace Transforms & Second-Order Cauchy-Euler',
        description: 'Complete revision guide for solving linear non-homogeneous differential equations with constant coefficients using undetermined coefficients and Laplace transform tables.',
        courseCode: 'MTH204',
        department: 'Mathematics',
        level: 'Year 2',
        resourceType: 'Revision Guide',
        tags: ['Calculus', 'Laplace', 'Differential Equations', 'Engineering Math'],
        content: `### Common Laplace Transform Pairs:
- L{ 1 } = 1 / s
- L{ t^n } = n! / s^(n+1)
- L{ e^(at) } = 1 / (s - a)
- L{ sin(wt) } = w / (s^2 + w^2)
- L{ cos(wt) } = s / (s^2 + w^2)
- L{ y'(t) } = s Y(s) - y(0)
- L{ y''(t) } = s^2 Y(s) - s y(0) - y'(0)`,
        authorId: user.id,
        authorName: 'Tanaka Moyo',
        authorRole: 'STUDENT',
        status: 'verified',
        verificationNotes: 'Checked against university lecture notes.',
        verifiedBy: 'Dr. Farai Chimurenga',
        verifiedAt: new Date().toISOString(),
        downloadsCount: 75,
        ratingAvg: 4.7,
        ratingCount: 9,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        title: 'EE302 Embedded Systems & Microcontrollers: STM32 Register Configuration Manual',
        description: 'Hands-on laboratory guide covering ARM Cortex-M architecture, memory-mapped I/O, USART serial debugging, timer interrupts, and ADC sampling configuration.',
        courseCode: 'EE302',
        department: 'Electrical Engineering',
        level: 'Year 3',
        resourceType: 'Lab Manual',
        tags: ['Embedded', 'ARM Cortex', 'STM32', 'C Programming', 'Registers'],
        content: `// Bare-metal GPIO LED toggle on STM32
#define RCC_AHB1ENR (*((volatile uint32_t *) 0x40023830))
#define GPIOA_MODER  (*((volatile uint32_t *) 0x40020000))
#define GPIOA_ODR    (*((volatile uint32_t *) 0x40020014))

void init_led(void) {
  RCC_AHB1ENR |= (1 << 0); // Enable GPIOA clock
  GPIOA_MODER |= (1 << 10); // Set PA5 as general purpose output mode
}

void toggle_led(void) {
  GPIOA_ODR ^= (1 << 5);
}`,
        authorId: user.id,
        authorName: 'Kudzai Shumba',
        authorRole: 'STUDENT',
        status: 'pending',
        verificationNotes: 'Awaiting tutor lab review.',
        downloadsCount: 41,
        ratingAvg: 4.5,
        ratingCount: 5,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ];

    for (const seed of seeds) {
      const seedId = `res_seed_${Math.random().toString(36).substring(2, 9)}`;
      await setDoc(doc(db, RESOURCES_PATH, seedId), {
        ...seed,
        id: seedId,
      });
    }
  } catch (error) {
    console.warn('Seed resource error (ignored):', error);
  }
}
