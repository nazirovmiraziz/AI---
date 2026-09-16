"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AppState,
  Conversation,
  ChatMessage,
  ExamSession,
  Flashcard,
  Locale,
  StudentProfile,
  StudyPlan,
  TestRecord,
} from "./types";
import {
  ACHIEVEMENTS,
  DEMO_EMAIL,
  XP_REWARDS,
  demoConversation,
  demoFlashcards,
  demoPlan,
  demoUser,
  levelFromXp,
} from "./demo-data";

const KEY = "smart-school-ai-v1";

type UsersDB = Record<string, StudentProfile>;

function loadRaw(): Partial<AppState> & { users?: UsersDB } {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

interface Store extends AppState {
  tReady: boolean;
  login: (email: string, password: string) => boolean;
  loginDemo: () => void;
  loginLast: () => boolean;
  displayName: string;
  register: (data: Pick<StudentProfile, "name" | "email" | "password" | "grade" | "country">) => boolean;
  logout: () => void;
  updateUser: (patch: Partial<StudentProfile>) => void;
  setLanguage: (l: Locale) => void;
  setLessonLanguage: (l: Locale) => void;
  setTheme: (t: "light" | "dark") => void;
  addXp: (amount: number, reason?: string) => void;
  addConversation: (c?: Partial<Conversation>) => string;
  setActiveConversation: (id: string | null) => void;
  appendMessage: (conversationId: string, m: Omit<ChatMessage, "id" | "createdAt">) => void;
  renameConversation: (id: string, title: string) => void;
  pinConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  setPlan: (p: StudyPlan) => void;
  togglePlanDay: (day: number) => void;
  addTest: (r: TestRecord) => void;
  setExam: (e: ExamSession | null) => void;
  updateFlash: (cards: Flashcard[]) => void;
  unlockAchievement: (id: string) => void;
  markTopicProgress: (topicId: string, subjectId: string, progress: number) => void;
  setDemoMode: (v: boolean) => void;
  lastXp?: { amount: number; reason: string } | null;
  lastAchievement?: string | null;
  clearToasts: () => void;
}

const Ctx = createContext<Store | null>(null);

function persist(next: AppState, users: UsersDB) {
  if (typeof window === "undefined") return;
  const prev = loadRaw();
  const merged: UsersDB = { ...(prev.users ?? {}), ...users };
  if (next.user) merged[next.user.email.toLowerCase()] = next.user;
  const { hydrated: _h, ...rest } = next;
  localStorage.setItem(KEY, JSON.stringify({ ...rest, users: merged }));
}

function syncCloudAuth(path: string, body: object) {
  if (typeof window === "undefined") return;
  fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

function readUsers(): UsersDB {
  const raw = loadRaw();
  const u = raw.users ?? {};
  if (!u[DEMO_EMAIL]) u[DEMO_EMAIL] = demoUser;
  return u;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    conversations: [],
    activeConversationId: null,
    studyPlan: null,
    flashcards: [],
    exam: null,
    demoMode: true,
    hydrated: false,
    lastUserName: null,
    lastUserEmail: null,
  });
  const [users, setUsers] = useState<UsersDB>({});
  const usersRef = useRef<UsersDB>({});
  const stateRef = useRef(state);
  stateRef.current = state;
  usersRef.current = users;
  const [lastXp, setLastXp] = useState<{ amount: number; reason: string } | null>(null);
  const [lastAchievement, setLastAchievement] = useState<string | null>(null);

  useEffect(() => {
    const raw = loadRaw();
    const u = readUsers();
    usersRef.current = u;
    setUsers(u);
    const stored = raw.user ?? null;
    const user = stored && stored.email.toLowerCase() !== DEMO_EMAIL ? stored : null;
    const lastEmail = (raw.lastUserEmail ?? user?.email ?? null)?.toLowerCase() ?? null;
    const lastIsDemo = lastEmail === DEMO_EMAIL;
    const next: AppState = {
      user,
      conversations: raw.conversations?.length ? raw.conversations : user ? [demoConversation] : [],
      activeConversationId: raw.activeConversationId ?? (user ? demoConversation.id : null),
      studyPlan: raw.studyPlan ?? (user ? demoPlan : null),
      flashcards: raw.flashcards?.length ? raw.flashcards : user ? demoFlashcards : [],
      exam: raw.exam ?? null,
      demoMode: raw.demoMode ?? true,
      hydrated: true,
      lastUserName: lastIsDemo ? null : (raw.lastUserName ?? user?.name ?? null),
      lastUserEmail: lastIsDemo ? null : lastEmail,
    };
    stateRef.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    persist(state, usersRef.current);
  }, [state, users]);

  useEffect(() => {
    if (!state.user) return;
    document.documentElement.classList.toggle("dark", state.user.theme === "dark");
    document.documentElement.lang = state.user.language;
    document.documentElement.dir = state.user.language === "ar" ? "rtl" : "ltr";
  }, [state.user]);

  const commitUser = useCallback((user: StudentProfile | null, extra?: Partial<AppState>) => {
    const isDemo = user?.email.toLowerCase() === DEMO_EMAIL;
    setState((s) => {
      const next = {
        ...s,
        user,
        lastUserName: isDemo ? s.lastUserName : (user?.name ?? s.lastUserName),
        lastUserEmail: isDemo ? s.lastUserEmail : (user?.email ?? s.lastUserEmail),
        ...extra,
      };
      const nextUsers = user ? { ...usersRef.current, [user.email.toLowerCase()]: user } : usersRef.current;
      usersRef.current = nextUsers;
      persist(next, nextUsers);
      stateRef.current = next;
      return next;
    });
    if (user) {
      setUsers((prev) => {
        const next = { ...prev, [user.email.toLowerCase()]: user };
        usersRef.current = next;
        return next;
      });
    }
  }, []);

  const login = useCallback(
    (email: string, password: string) => {
      const clean = email.trim().toLowerCase();
      const db = { ...readUsers(), ...usersRef.current };
      const found = db[clean] ?? (clean === DEMO_EMAIL ? demoUser : undefined);
      if (!found || found.password !== password) return false;
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      let streak = found.streak;
      if (found.lastActiveDate === yesterday) streak += 1;
      else if (found.lastActiveDate !== today) streak = 1;
      const user = { ...found, email: clean, streak, lastActiveDate: today };
      const isDemo = clean === DEMO_EMAIL;
      commitUser(
        user,
        isDemo
          ? {
              conversations: [demoConversation],
              activeConversationId: demoConversation.id,
              studyPlan: demoPlan,
              flashcards: demoFlashcards,
            }
          : {}
      );
      if (!isDemo) syncCloudAuth("/api/auth/login", { email: clean, password });
      return true;
    },
    [commitUser]
  );

  const loginDemo = useCallback(() => {
    login(DEMO_EMAIL, demoUser.password);
  }, [login]);

  const loginLast = useCallback(() => {
    const email = (stateRef.current.lastUserEmail ?? loadRaw().lastUserEmail)?.toLowerCase();
    if (!email || email === DEMO_EMAIL) return false;
    const found = usersRef.current[email] ?? readUsers()[email];
    if (!found) return false;
    return login(found.email, found.password);
  }, [login]);

  const register = useCallback(
    (data: Pick<StudentProfile, "name" | "email" | "password" | "grade" | "country">) => {
      const email = data.email.trim().toLowerCase();
      const db = { ...readUsers(), ...usersRef.current };
      const existing = db[email];
      if (existing) {
        if (existing.password === data.password) {
          commitUser(existing);
          return true;
        }
        return false;
      }
      const user: StudentProfile = {
        ...demoUser,
        ...data,
        name: data.name.trim(),
        email,
        password: data.password,
        id: uid("u"),
        xp: 0,
        streak: 1,
        learnedTopics: [],
        weakTopics: [],
        strongTopics: [],
        achievements: [],
        testHistory: [],
        onboardingDone: false,
        diagnosticDone: false,
        continueLesson: undefined,
        lastStudy: undefined,
        weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
        topicsThisWeek: 0,
        studyMinutes: 0,
        subjectLevels: Object.fromEntries(Object.keys(demoUser.subjectLevels).map((k) => [k, 40])),
      };
      usersRef.current = { ...db, [email]: user };
      setUsers(usersRef.current);
      commitUser(user, { conversations: [], flashcards: [], studyPlan: null, activeConversationId: null });
      syncCloudAuth("/api/auth/register", {
        name: user.name,
        email,
        password: data.password,
        grade: data.grade,
        country: data.country,
      });
      return true;
    },
    [commitUser]
  );

  const logout = useCallback(() => {
    setState((s) => {
      const next = {
        ...s,
        user: null,
        conversations: [],
        activeConversationId: null,
        exam: null,
      };
      persist(next, usersRef.current);
      stateRef.current = next;
      return next;
    });
  }, []);

  const updateUser = useCallback((patch: Partial<StudentProfile>) => {
    setState((s) => {
      if (!s.user) return s;
      const user = { ...s.user, ...patch, name: (patch.name ?? s.user.name).trim() };
      setUsers((p) => ({ ...p, [user.email]: user }));
      return { ...s, user, lastUserName: user.name, lastUserEmail: user.email };
    });
  }, []);

  const addXp = useCallback((amount: number, reason = "") => {
    setState((s) => {
      if (!s.user) return s;
      const xp = s.user.xp + amount;
      const user = { ...s.user, xp };
      setUsers((p) => ({ ...p, [user.email]: user }));
      return { ...s, user };
    });
    setLastXp({ amount, reason });
    setTimeout(() => setLastXp(null), 2200);
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setState((s) => {
      if (!s.user || s.user.achievements.includes(id)) return s;
      if (!ACHIEVEMENTS.some((a) => a.id === id)) return s;
      const user = { ...s.user, achievements: [...s.user.achievements, id] };
      setUsers((p) => ({ ...p, [user.email]: user }));
      setLastAchievement(id);
      setTimeout(() => setLastAchievement(null), 3200);
      return { ...s, user };
    });
  }, []);

  const addConversation = useCallback((c?: Partial<Conversation>) => {
    const id = c?.id ?? uid("c");
    const conv: Conversation = {
      id,
      title: c?.title ?? "Новый диалог",
      pinned: c?.pinned ?? false,
      messages: c?.messages ?? [],
      updatedAt: new Date().toISOString(),
      lessonLanguage: c?.lessonLanguage ?? state.user?.lessonLanguage ?? "ru",
      subjectId: c?.subjectId,
      topicId: c?.topicId,
    };
    setState((s) => ({
      ...s,
      conversations: [conv, ...s.conversations],
      activeConversationId: id,
    }));
    return id;
  }, [state.user]);

  const appendMessage = useCallback((conversationId: string, m: Omit<ChatMessage, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              updatedAt: new Date().toISOString(),
              title:
                c.messages.length === 0 && m.role === "user"
                  ? m.content.slice(0, 42)
                  : c.title,
              messages: [
                ...c.messages,
                { ...m, id: uid("m"), createdAt: new Date().toISOString() },
              ],
            }
          : c
      ),
    }));
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      tReady: state.hydrated,
      lastXp,
      lastAchievement,
      login,
      loginDemo,
      loginLast,
      displayName: state.user?.name || (state.lastUserEmail?.toLowerCase() === DEMO_EMAIL ? "" : state.lastUserName) || "",
      register,
      logout,
      updateUser,
      setLanguage: (l) => updateUser({ language: l }),
      setLessonLanguage: (l) => updateUser({ lessonLanguage: l }),
      setTheme: (t) => updateUser({ theme: t }),
      addXp,
      addConversation,
      setActiveConversation: (id) => setState((s) => ({ ...s, activeConversationId: id })),
      appendMessage,
      renameConversation: (id, title) =>
        setState((s) => ({
          ...s,
          conversations: s.conversations.map((c) => (c.id === id ? { ...c, title } : c)),
        })),
      pinConversation: (id) =>
        setState((s) => ({
          ...s,
          conversations: s.conversations.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
        })),
      deleteConversation: (id) =>
        setState((s) => ({
          ...s,
          conversations: s.conversations.filter((c) => c.id !== id),
          activeConversationId: s.activeConversationId === id ? s.conversations.find((c) => c.id !== id)?.id ?? null : s.activeConversationId,
        })),
      setPlan: (p) => setState((s) => ({ ...s, studyPlan: p })),
      togglePlanDay: (day) =>
        setState((s) => {
          if (!s.studyPlan) return s;
          const days = s.studyPlan.days.map((d) => (d.day === day ? { ...d, done: !d.done } : d));
          const plan = { ...s.studyPlan, days };
          if (days.every((d) => d.done) && s.user) {
            setTimeout(() => addXp(XP_REWARDS.plan, "План завершён"), 0);
          }
          return { ...s, studyPlan: plan };
        }),
      addTest: (r) => {
        updateUser({
          testHistory: [r, ...(state.user?.testHistory ?? [])].slice(0, 40),
        });
        if (r.score === r.total) unlockAchievement("perfect-test");
        addXp(XP_REWARDS.test, "Проверка знаний");
      },
      setExam: (e) => setState((s) => ({ ...s, exam: e })),
      updateFlash: (cards) => setState((s) => ({ ...s, flashcards: cards })),
      unlockAchievement,
      markTopicProgress: (topicId, subjectId, progress) => {
        updateUser({
          continueLesson: { topicId, subjectId, progress },
          lastStudy: { topic: topicId, date: new Date().toISOString() },
        });
        if (progress >= 100) {
          addXp(XP_REWARDS.topic, "Тема завершена");
          unlockAchievement("first-topic");
        }
      },
      setDemoMode: (v) => setState((s) => ({ ...s, demoMode: v })),
      clearToasts: () => {
        setLastXp(null);
        setLastAchievement(null);
      },
    }),
    [state, lastXp, lastAchievement, login, loginDemo, loginLast, register, logout, updateUser, addXp, addConversation, appendMessage, unlockAchievement]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function peekSession() {
  const raw = loadRaw();
  const user = raw.user;
  if (!user || user.email.toLowerCase() === DEMO_EMAIL) return null;
  return user;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp outside provider");
  return ctx;
}

export { levelFromXp, uid };
