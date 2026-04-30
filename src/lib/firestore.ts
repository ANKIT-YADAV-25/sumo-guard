import {
  collection, doc, addDoc, getDocs, deleteDoc, getDoc, setDoc,
  query, orderBy, limit, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { SleepLog, HabitLog } from "./predictions";

// ── User document ──
export interface UserDoc {
  name: string;
  email: string;
  lifestyle: Record<string, unknown>;
  onboardingDone: boolean;
  createdAt: string;
}

export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data() as UserDoc) : null;
  } catch (error) {
    console.error("Error fetching user doc:", error);
    throw error;
  }
}

export async function setUserDoc(uid: string, data: Partial<UserDoc>) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

// ── Sleep logs ──
export async function getSleepLogs(uid: string): Promise<SleepLog[]> {
  if (!uid) return [];
  try {
    const q = query(
      collection(db, "users", uid, "sleepLogs"),
      limit(500)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SleepLog));
  } catch (error) {
    console.error("Error fetching sleep logs:", error);
    throw error;
  }
}

export async function addSleepLog(uid: string, data: Omit<SleepLog, "id" | "createdAt">) {
  const docRef = doc(db, "users", uid, "sleepLogs", data.date);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...data, createdAt: now }, { merge: true });
  return { id: data.date, ...data, createdAt: now } as SleepLog;
}

export async function deleteSleepLog(uid: string, logId: string) {
  await deleteDoc(doc(db, "users", uid, "sleepLogs", logId));
}

// ── Habit logs ──
export async function getHabitLogs(uid: string): Promise<HabitLog[]> {
  if (!uid) return [];
  try {
    const q = query(
      collection(db, "users", uid, "habitLogs"),
      limit(500)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as HabitLog));
  } catch (error) {
    console.error("Error fetching habit logs:", error);
    throw error;
  }
}

export async function addHabitLog(uid: string, data: Omit<HabitLog, "id" | "createdAt">) {
  const docRef = doc(db, "users", uid, "habitLogs", data.date);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...data, createdAt: now }, { merge: true });
  return { id: data.date, ...data, createdAt: now } as HabitLog;
}

export async function deleteHabitLog(uid: string, logId: string) {
  await deleteDoc(doc(db, "users", uid, "habitLogs", logId));
}

// ── User profile (health details) ──
export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  existingConditions: string[];
  familyHistory: string[];
  createdAt: string;
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid, "user_health_details", "main"));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

export async function updateProfile(uid: string, data: Omit<UserProfile, "createdAt">) {
  await setDoc(doc(db, "users", uid, "user_health_details", "main"), {
    ...data,
    createdAt: new Date().toISOString(),
  }, { merge: true });
  return data;
}

// ── User health details (onboarding lifestyle) ──
export async function getHealthDetails(uid: string): Promise<Record<string, unknown> | null> {
  const snap = await getDoc(doc(db, "users", uid, "user_health_details", "main"));
  return snap.exists() ? snap.data() : null;
}

export async function setHealthDetails(uid: string, data: Record<string, unknown>) {
  await setDoc(doc(db, "users", uid, "user_health_details", "main"), data, { merge: true });
}
