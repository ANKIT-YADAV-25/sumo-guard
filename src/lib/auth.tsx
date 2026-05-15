import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./firebase";
import { getUserDoc, setUserDoc, getHealthDetails, setHealthDetails, type UserDoc } from "./firestore";

interface Lifestyle {
  isSmoker?: boolean;
  isDrinker?: boolean;
  isAlcoholic?: boolean;
  hasChronicCondition?: boolean;
  chronicConditions?: string[];
  activityLevel?: string;
  dietType?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  lifestyle: Lifestyle;
  onboardingDone: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  saveOnboarding: (data: Record<string, unknown>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function buildAuthUser(firebaseUser: FirebaseUser): Promise<AuthUser> {
  const [userDoc, healthDetails] = await Promise.all([
    getUserDoc(firebaseUser.uid),
    getHealthDetails(firebaseUser.uid)
  ]);

  return {
    id: firebaseUser.uid,
    name: userDoc?.name || firebaseUser.displayName || "User",
    email: userDoc?.email || firebaseUser.email || "",
    lifestyle: (healthDetails as Lifestyle) || {},
    onboardingDone: userDoc?.onboardingDone ?? false,
    createdAt: userDoc?.createdAt || firebaseUser.metadata.creationTime || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(() => {
    // If the user was previously logged in, start with loading=true to show splash immediately
    return !!localStorage.getItem("sumoguard_was_logged_in");
  });
  const skipNextAuthChange = React.useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        localStorage.setItem("sumoguard_was_logged_in", "true");
        // Skip if we're in the middle of registration (the register function will set the user)
        if (skipNextAuthChange.current) {
          skipNextAuthChange.current = false;
          setLoading(false);
          return;
        }
        try {
          const authUser = await buildAuthUser(firebaseUser);
          setUser(authUser);
        } catch {
          // If Firestore read fails (e.g. doc doesn't exist yet), set a minimal user
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "User",
            email: firebaseUser.email || "",
            lifestyle: {},
            onboardingDone: false,
            createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
          });
        }
      } else {
        localStorage.removeItem("sumoguard_was_logged_in");
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function refreshUser() {
    if (auth.currentUser) {
      const authUser = await buildAuthUser(auth.currentUser);
      setUser(authUser);
    }
  }

  async function login(email: string, password: string) {
    skipNextAuthChange.current = true;
    const cred = await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem("sumoguard_was_logged_in", "true");
    const authUser = await buildAuthUser(cred.user);
    setUser(authUser);
  }

  async function register(name: string, realEmail: string, password: string): Promise<AuthUser> {
    // We use a name-based ID for authentication to allow Name-only login
    const authEmail = name.toLowerCase().trim().replace(/\s+/g, ".") + "@sumoguard.io";

    // Prevent onAuthStateChanged from racing with the Firestore write below
    skipNextAuthChange.current = true;
    const cred = await createUserWithEmailAndPassword(auth, authEmail, password);
    const now = new Date().toISOString();
    
    await setUserDoc(cred.user.uid, {
      name,
      email: realEmail, // Store the real email in Firestore
      lifestyle: {},
      onboardingDone: false,
      createdAt: now,
    });

    const authUser: AuthUser = {
      id: cred.user.uid,
      name,
      email: realEmail, // Use the real email for the display
      lifestyle: {},
      onboardingDone: false,
      createdAt: now,
    };
    setUser(authUser);
    return authUser;
  }

  async function logout() {
    await signOut(auth);
    localStorage.removeItem("sumoguard_was_logged_in");
    setUser(null);
  }

  async function saveOnboarding(onboardingData: Record<string, unknown>) {
    if (!auth.currentUser) throw new Error("Not logged in");
    const lifestyle: Lifestyle = {
      isSmoker: (onboardingData.isSmoker as boolean) ?? false,
      isDrinker: (onboardingData.isDrinker as boolean) ?? false,
      isAlcoholic: (onboardingData.isAlcoholic as boolean) ?? false,
      hasChronicCondition: (onboardingData.hasChronicCondition as boolean) ?? false,
      chronicConditions: (onboardingData.chronicConditions as string[]) ?? [],
      activityLevel: (onboardingData.activityLevel as string) ?? "",
      dietType: (onboardingData.dietType as string) ?? "",
    };
    await Promise.all([
      setHealthDetails(auth.currentUser.uid, lifestyle as unknown as Record<string, unknown>),
      setUserDoc(auth.currentUser.uid, { onboardingDone: true })
    ]);
    setUser((prev) =>
      prev ? { ...prev, lifestyle, onboardingDone: true } : prev
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, saveOnboarding, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
