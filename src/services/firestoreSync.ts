import { User } from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { normalizeCollegeEntry } from '../data/colleges';
import { ChatMessage, CollegeRecord, RawCollegeEntry } from '../types/college';
import { ChanceMeExam, ChanceMeProfile } from '../utils/admissions';
import {
  OperationType,
  db,
  handleFirestoreError,
  isBootstrappedAdminEmail,
} from '../firebase';

const VALID_EXAMS: readonly ChanceMeExam[] = [
  'JEE Main',
  'JEE Advanced',
  'GATE',
  'IIT JAM',
  'CAT',
  'CUET',
  'Merit',
];

export interface PersistedUserProfile {
  chanceMeProfile: ChanceMeProfile;
  shortlistIds: string[];
  displayName?: string;
}

function sanitizeId(raw: string, fallbackPrefix = 'item'): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  return cleaned.length > 0 ? cleaned : `${fallbackPrefix}-${Date.now()}`;
}

function sanitizeExam(exam: string | undefined): ChanceMeExam {
  if (exam && (VALID_EXAMS as readonly string[]).includes(exam)) {
    return exam as ChanceMeExam;
  }
  return 'JEE Main';
}

function clampString(val: unknown, maxLen: number, fallback = ''): string {
  const s = typeof val === 'string' ? val.trim() : '';
  if (!s) return fallback;
  return s.slice(0, maxLen);
}

function clampStringList(arr: unknown, maxItems: number, maxItemLen: number): string[] {
  if (!Array.isArray(arr)) return [];
  const out: string[] = [];
  for (const item of arr) {
    if (typeof item === 'string') {
      const trimmed = item.trim().slice(0, maxItemLen);
      if (trimmed) out.push(trimmed);
      if (out.length >= maxItems) break;
    }
  }
  return out;
}

function timestampToIso(ts: unknown): string {
  if (ts instanceof Timestamp) {
    return ts.toDate().toISOString();
  }
  if (ts && typeof ts === 'object' && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
    return (ts as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

export async function ensureUserProfile(
  user: User,
  guestDefaults: {
    chanceMeProfile: ChanceMeProfile;
    shortlistIds: string[];
  }
): Promise<PersistedUserProfile> {
  const path = `users/${user.uid}`;
  const ref = doc(db, 'users', user.uid);

  let snap;
  try {
    snap = await getDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (snap.exists()) {
    const data = snap.data() as Record<string, unknown>;
    return {
      displayName: typeof data.displayName === 'string' ? data.displayName : undefined,
      chanceMeProfile: {
        exam: sanitizeExam(typeof data.chanceMeExam === 'string' ? data.chanceMeExam : undefined),
        score: clampString(data.chanceMeScore, 20, ''),
        rajasthanDomicile: Boolean(data.rajasthanDomicile),
      },
      shortlistIds: clampStringList(data.shortlistIds, 30, 128),
    };
  }

  const safeShortlist = clampStringList(guestDefaults.shortlistIds, 30, 128);
  const safeExam = sanitizeExam(guestDefaults.chanceMeProfile.exam);
  const safeScore = clampString(guestDefaults.chanceMeProfile.score, 20, '');
  const safeDisplayName = clampString(user.displayName, 100, '');

  const payload: Record<string, unknown> = {
    uid: user.uid,
    chanceMeExam: safeExam,
    chanceMeScore: safeScore,
    rajasthanDomicile: Boolean(guestDefaults.chanceMeProfile.rajasthanDomicile),
    shortlistIds: safeShortlist,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (safeDisplayName) {
    payload.displayName = safeDisplayName;
  }

  try {
    await setDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  return {
    displayName: safeDisplayName || undefined,
    chanceMeProfile: {
      exam: safeExam,
      score: safeScore,
      rajasthanDomicile: Boolean(guestDefaults.chanceMeProfile.rajasthanDomicile),
    },
    shortlistIds: safeShortlist,
  };
}

export function subscribeUserProfile(
  uid: string,
  onData: (profile: PersistedUserProfile) => void,
  onSyncError?: (error: unknown) => void
): () => void {
  const path = `users/${uid}`;
  const ref = doc(db, 'users', uid);

  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as Record<string, unknown>;
      onData({
        displayName: typeof data.displayName === 'string' ? data.displayName : undefined,
        chanceMeProfile: {
          exam: sanitizeExam(
            typeof data.chanceMeExam === 'string' ? data.chanceMeExam : undefined
          ),
          score: clampString(data.chanceMeScore, 20, ''),
          rajasthanDomicile: Boolean(data.rajasthanDomicile),
        },
        shortlistIds: clampStringList(data.shortlistIds, 30, 128),
      });
    },
    (error) => {
      onSyncError?.(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveUserPreferences(
  uid: string,
  updates: {
    chanceMeProfile?: ChanceMeProfile;
    shortlistIds?: string[];
    displayName?: string;
  }
): Promise<void> {
  const path = `users/${uid}`;
  const ref = doc(db, 'users', uid);

  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (updates.chanceMeProfile) {
    payload.chanceMeExam = sanitizeExam(updates.chanceMeProfile.exam);
    payload.chanceMeScore = clampString(updates.chanceMeProfile.score, 20, '');
    payload.rajasthanDomicile = Boolean(updates.chanceMeProfile.rajasthanDomicile);
  }

  if (updates.shortlistIds) {
    payload.shortlistIds = clampStringList(updates.shortlistIds, 30, 128);
  }

  if (updates.displayName !== undefined) {
    payload.displayName = clampString(updates.displayName, 100, 'Student');
  }

  try {
    await updateDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeUserChats(
  uid: string,
  onMessages: (messages: ChatMessage[]) => void,
  onSyncError?: (error: unknown) => void
): () => void {
  const path = `users/${uid}/chats`;
  const q = query(
    collection(db, 'users', uid, 'chats'),
    orderBy('clientOrder', 'asc'),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const next: ChatMessage[] = snapshot.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          role: data.role === 'user' ? 'user' : 'assistant',
          content: typeof data.content === 'string' ? data.content : '',
          timestamp: timestampToIso(data.createdAt),
        };
      });
      onMessages(next);
    },
    (error) => {
      onSyncError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function appendChatMessage(
  uid: string,
  messageId: string,
  role: 'user' | 'assistant',
  content: string,
  clientOrder: number
): Promise<void> {
  const trimmed = content.trim();
  if (!trimmed) return;

  const safeId = sanitizeId(messageId, role);
  const path = `users/${uid}/chats/${safeId}`;
  const ref = doc(db, 'users', uid, 'chats', safeId);

  const clampedContent = trimmed.slice(0, 24500);
  const safeOrder = Number.isFinite(clientOrder) && clientOrder >= 0 ? clientOrder : Date.now();

  try {
    await setDoc(ref, {
      userId: uid,
      role,
      content: clampedContent,
      clientOrder: safeOrder,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function clearUserChats(uid: string): Promise<void> {
  const path = `users/${uid}/chats`;
  const colRef = collection(db, 'users', uid, 'chats');

  let snapshot;
  try {
    snapshot = await getDocs(colRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }

  if (snapshot.empty) return;

  try {
    const batch = writeBatch(db);
    for (const d of snapshot.docs) {
      batch.delete(d.ref);
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeCustomColleges(
  uid: string,
  email: string | null | undefined,
  onColleges: (colleges: CollegeRecord[]) => void,
  onSyncError?: (error: unknown) => void
): () => void {
  const path = 'colleges';
  const colRef = collection(db, 'colleges');
  const q = isBootstrappedAdminEmail(email)
    ? query(colRef)
    : query(colRef, where('createdBy', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: CollegeRecord[] = snapshot.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        const feeRangesObj =
          data.feeRanges && typeof data.feeRanges === 'object'
            ? (data.feeRanges as Record<string, unknown>)
            : {};

        const raw: RawCollegeEntry = {
          id: typeof data.id === 'string' ? data.id : d.id,
          name: clampString(data.name, 160, 'Custom College'),
          city: clampString(data.city, 80, 'India'),
          state: clampString(data.state, 80, 'India'),
          type: clampString(data.type, 80, 'Private University'),
          portalUrl: clampString(data.portalUrl, 300, ''),
          ugCourses: clampStringList(data.ugCourses, 25, 100),
          pgCourses: clampStringList(data.pgCourses, 25, 100),
          entranceExams: clampStringList(data.entranceExams, 25, 60),
          feeRanges: {
            ugTotal: clampString(feeRangesObj.ugTotal, 60, 'N/A'),
            pgTotal: clampString(feeRangesObj.pgTotal, 60, 'N/A'),
          },
          placementHighlights: clampString(data.placementHighlights, 200, 'N/A'),
          scholarshipInfo: clampString(data.scholarshipInfo, 500, ''),
        };

        const normalized = normalizeCollegeEntry(raw, 'custom');
        normalized.addedAt = timestampToIso(data.createdAt);
        normalized.createdBy = typeof data.createdBy === 'string' ? data.createdBy : uid;
        return normalized;
      });

      list.sort((a, b) => (b.addedAt || '').localeCompare(a.addedAt || ''));
      onColleges(list);
    },
    (error) => {
      onSyncError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveCustomCollege(
  uid: string,
  college: CollegeRecord,
  isEdit: boolean
): Promise<CollegeRecord> {
  const safeId = sanitizeId(college.id, 'custom');
  const path = `colleges/${safeId}`;
  const ref = doc(db, 'colleges', safeId);

  const safeName = clampString(college.name, 160, 'Untitled Institution');
  const safeCity = clampString(college.city, 80, 'India');
  const safeState = clampString(college.state, 80, 'India');
  const safeType = clampString(college.type, 80, 'Private University');
  const safePortalUrl = clampString(college.portalUrl, 300, '');
  const safeUgCourses = clampStringList(college.ugCourses, 25, 100);
  const safePgCourses = clampStringList(college.pgCourses, 25, 100);
  const safeExams = clampStringList(college.entranceExams, 25, 60);
  const safeUgFee = clampString(college.feeRanges?.ugTotal, 60, 'N/A');
  const safePgFee = clampString(college.feeRanges?.pgTotal, 60, 'N/A');
  const safePlacement = clampString(college.placementHighlights, 200, 'N/A');
  const safeScholarshipInfo = clampString(college.scholarshipInfo, 500, '');

  const safeRaw: RawCollegeEntry = {
    id: safeId,
    name: safeName.length >= 2 ? safeName : `${safeName} Institute`,
    city: safeCity.length >= 2 ? safeCity : 'India',
    state: safeState.length >= 2 ? safeState : 'India',
    type: safeType.length >= 2 ? safeType : 'Private University',
    portalUrl: safePortalUrl,
    ugCourses: safeUgCourses,
    pgCourses: safePgCourses,
    entranceExams: safeExams,
    feeRanges: {
      ugTotal: safeUgFee,
      pgTotal: safePgFee,
    },
    placementHighlights: safePlacement,
    scholarshipInfo: safeScholarshipInfo,
  };

  if (isEdit) {
    try {
      await updateDoc(ref, {
        name: safeRaw.name,
        city: safeRaw.city,
        state: safeRaw.state,
        type: safeRaw.type,
        portalUrl: safeRaw.portalUrl,
        ugCourses: safeRaw.ugCourses,
        pgCourses: safeRaw.pgCourses,
        entranceExams: safeRaw.entranceExams,
        feeRanges: safeRaw.feeRanges,
        placementHighlights: safeRaw.placementHighlights,
        scholarshipInfo: safeRaw.scholarshipInfo,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  } else {
    try {
      await setDoc(ref, {
        ...safeRaw,
        createdBy: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  const normalized = normalizeCollegeEntry(safeRaw, 'custom');
  normalized.addedAt = college.addedAt || new Date().toISOString();
  normalized.createdBy = college.createdBy || uid;
  return normalized;
}

export async function deleteCustomCollegeDoc(collegeId: string): Promise<void> {
  const safeId = sanitizeId(collegeId, 'custom');
  const path = `colleges/${safeId}`;
  try {
    await deleteDoc(doc(db, 'colleges', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
