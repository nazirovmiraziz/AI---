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
  AppNotice,
  ChatMessage,
  ExamSession,
  Flashcard,
  Locale,
  StudentProfile,
  StudyPlan,
  TestRecord,
} from "./types";
import { firstName, isInventedName, seedInbox, stripFakeNames, todayKey } from "./cabinet";
import { ensureLangSchool } from "./lang/progress";
import { emptyLangSchool } from "./lang/types";
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
import { isKnownTopic, mergeTopics } from "./learning";

const KEY = "smart-school-ai-v1";
const ACCOUNTS_KEY = "smart-school-ai-accounts-v1";
const SESSION_KEY = "smart-school-ai-session-v1";
const COOKIE = "ssai_session";
let sessionLockedOut = false;

function cookieDomain() {
  if (typeof location === "undefined") return "";
  return location.hostname.endsWith("microaischooll.pp.ua") ? "; Domain=.microaischooll.pp.ua" : "";
}

function writeSessionCookie(email: string | null) {
  if (typeof document === "undefined") return;
  const domain = cookieDomain();
  const secure = location.protocol === "https:" ? "; Secure" : "";
  if (!email || email === DEMO_EMAIL) {
    document.cookie = `${COOKIE}=; Max-Age=0; Path=/${domain}`;
    return;
  }
  document.cookie = `${COOKIE}=${encodeURIComponent(email)}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax${domain}${secure}`;
}

function readSessionCookie() {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )ssai_session=([^;]+)/);
  return m ? decodeURIComponent(m[1]).toLowerCase() : null;
}

type UsersDB = Record<string, StudentProfile>;

type Workspace = {
  conversations: Conversation[];
  activeConversationId: string | null;
  studyPlan: StudyPlan | null;
  flashcards: Flashcard[];
  exam: ExamSession | null;
};

type SessionDump = {
  currentEmail: string | null;
  lastEmail: string | null;
  lastName: string | null;
  signedOut?: boolean;
};

type RawDump = Partial<AppState> & {
  users?: UsersDB;
  workspaces?: Record<string, Workspace>;
  localeReady?: boolean;
  ruUi?: boolean;
  pickedLocale?: boolean;
};

let localePicked = false;

function loadRaw(): RawDump {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function loadAccounts(): UsersDB {
  if (typeof window === "undefined") return {};
  try {
    const dedicated = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}") as UsersDB;
    const legacy = loadRaw().users ?? {};
    const merged: UsersDB = { ...legacy, ...dedicated };
    if (!merged[DEMO_EMAIL]) merged[DEMO_EMAIL] = demoUser;
    return merged;
  } catch {
    return { [DEMO_EMAIL]: demoUser };
  }
}

function saveAccounts(users: UsersDB) {
  if (typeof window === "undefined") return;
  const next = { ...users };
  if (!next[DEMO_EMAIL]) next[DEMO_EMAIL] = demoUser;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
}

function loadSession(): SessionDump {
  if (typeof window === "undefined") return { currentEmail: null, lastEmail: null, lastName: null, signedOut: false };
  try {
    const raw = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}") as SessionDump;
    const cookie = readSessionCookie();
    const signedOut = !!raw.signedOut && !cookie;
    return {
      currentEmail: signedOut ? null : (raw.currentEmail ?? cookie ?? null),
      lastEmail: raw.lastEmail ?? cookie ?? null,
      lastName: raw.lastName ?? null,
      signedOut,
    };
  } catch {
    const cookie = readSessionCookie();
    return { currentEmail: cookie, lastEmail: cookie, lastName: null, signedOut: false };
  }
}

function saveSession(next: SessionDump) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  writeSessionCookie(next.signedOut || !next.currentEmail || next.currentEmail === DEMO_EMAIL ? null : next.currentEmail);
}

function emptyWorkspace(): Workspace {
  return {
    conversations: [],
    activeConversationId: null,
    studyPlan: null,
    flashcards: [],
    exam: null,
  };
}

function workspaceOf(s: AppState): Workspace {
  return {
    conversations: s.conversations,
    activeConversationId: s.activeConversationId,
    studyPlan: s.studyPlan,
    flashcards: s.flashcards,
    exam: s.exam,
  };
}

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function renameAlisher(text: string, name: string) {
  return stripFakeNames(text, firstName(name));
}

function withNamedHistory(list: Conversation[] | undefined, user: StudentProfile | null, isDemoUser: boolean): Conversation[] {
  if (!list) return isDemoUser ? [demoConversation] : [];
  const name = isDemoUser ? "" : user?.name ?? "";
  return list.map((c) => ({
    ...c,
    title: renameAlisher(c.title, name),
    messages: c.messages.map((m) => ({ ...m, content: renameAlisher(m.content, name) })),
  }));
}

interface Store extends AppState {
  tReady: boolean;
  login: (email: string, password: string) => boolean;
  loginCloud: (email: string, password: string) => Promise<boolean>;
  loginDemo: () => void;
  loginLast: () => boolean;
  displayName: string;
  register: (
    data: Pick<StudentProfile, "name" | "email" | "password" | "grade" | "country"> & {
      favoriteSubjects?: string[];
      dailyGoalMin?: number;
      lessonLanguage?: Locale;
      goal?: string;
      startLevel?: number;
      onboardingDone?: boolean;
    }
  ) => boolean;
  logout: () => void;
  updateUser: (patch: Partial<StudentProfile>) => void;
  setLanguage: (l: Locale) => void;
  setLessonLanguage: (l: Locale) => void;
  setTheme: (t: "light" | "dark" | "system") => void;
  setConversationMode: (id: string, mode: Conversation["mode"]) => void;
  resetLocalData: () => void;
  addXp: (amount: number, reason?: string) => void;
  addConversation: (c?: Partial<Conversation>) => string;
  setActiveConversation: (id: string | null) => void;
  appendMessage: (conversationId: string, m: Omit<ChatMessage, "id" | "createdAt">) => string;
  patchMessage: (conversationId: string, messageId: string, patch: Partial<ChatMessage> & { meta?: ChatMessage["meta"] }) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  toggleFavorite: (topicId: string) => void;
  pushNotice: (n: Omit<AppNotice, "id" | "createdAt" | "read"> & { id?: string }) => void;
  markInboxRead: (id?: string) => void;
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
  addStudyMinutes: (minutes: number) => void;
  recordTopic: (topicId: string) => void;
  setDemoMode: (v: boolean) => void;
  lastXp?: { amount: number; reason: string } | null;
  lastAchievement?: string | null;
  clearToasts: () => void;
}

const Ctx = createContext<Store | null>(null);

function persist(next: AppState, users: UsersDB) {
  if (typeof window === "undefined") return;
  try {
    const prev = loadRaw();
    const accounts = { ...loadAccounts(), ...users };
    if (next.user) accounts[next.user.email.toLowerCase()] = next.user;
    saveAccounts(accounts);

    const workspaces = { ...(prev.workspaces ?? {}) };
    const mail = next.user?.email.toLowerCase();
    if (mail && mail !== DEMO_EMAIL) {
      workspaces[mail] = workspaceOf(next);
    }

    const session = loadSession();
    const keepEmail = session.currentEmail && session.currentEmail !== DEMO_EMAIL ? session.currentEmail : null;
    const lastEmail =
      mail && mail !== DEMO_EMAIL ? mail : next.lastUserEmail ?? session.lastEmail ?? keepEmail;
    const lastName =
      mail && mail !== DEMO_EMAIL ? next.user!.name : next.lastUserName ?? session.lastName;
    const currentEmail = mail && mail !== DEMO_EMAIL ? mail : sessionLockedOut ? null : keepEmail;
    saveSession({
      currentEmail,
      lastEmail: lastEmail && lastEmail !== DEMO_EMAIL ? lastEmail : session.lastEmail,
      lastName: lastName && !isInventedName(lastName) ? lastName : session.lastName,
      signedOut: sessionLockedOut && !currentEmail,
    });

    const { hydrated: _h, ...rest } = next;
    localStorage.setItem(
      KEY,
      JSON.stringify({
        ...rest,
        user: sessionLockedOut ? null : (next.user ?? prev.user ?? null),
        lastUserEmail: lastEmail && lastEmail !== DEMO_EMAIL ? lastEmail : null,
        lastUserName: lastName ?? rest.lastUserName,
        users: accounts,
        workspaces,
        localeReady: true,
        ruUi: true,
        pickedLocale: localePicked,
      })
    );
  } catch {
    try {
      saveAccounts({ ...loadAccounts(), ...users });
    } catch {
      /* quota */
    }
  }
}

function syncCloudAuth(path: string, body: object) {
  if (typeof window === "undefined") return;
  fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

/** Profile + recent workspace, sent to the cloud copy of the account. */
function cloudPayload(user: StudentProfile, ws: Workspace) {
  const { password, ...profile } = user;
  return {
    name: user.name,
    email: user.email.toLowerCase(),
    password,
    profile: {
      ...profile,
      _ws: { ...ws, conversations: ws.conversations.slice(0, 30), exam: null },
    },
  };
}

function blankProfile(email: string, name: string, password: string): StudentProfile {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: uid("u"),
    name,
    email,
    password,
    grade: "9",
    country: "TJ",
    language: "ru",
    lessonLanguage: "ru",
    goal: "university",
    favoriteSubjects: [],
    subjectLevels: Object.fromEntries(Object.keys(demoUser.subjectLevels).map((k) => [k, 20])),
    learnedTopics: [],
    weakTopics: [],
    strongTopics: [],
    xp: 0,
    streak: 1,
    dailyGoalMin: 20,
    lastActiveDate: today,
    achievements: [],
    testHistory: [],
    explainStyle: "simple",
    hintOnly: false,
    theme: "light",
    onboardingDone: true,
    diagnosticDone: false,
    weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
    topicsThisWeek: 0,
    studyMinutes: 0,
    recentTopics: [],
    activityDays: [today],
    favoriteTopics: [],
    inbox: [],
    langSchool: emptyLangSchool(),
  };
}

function readUsers(): UsersDB {
  return loadAccounts();
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
    const session = loadSession();
    const u = readUsers();
    usersRef.current = u;
    setUsers(u);
    const cookieEmail = readSessionCookie();
    const allowLast = !session.signedOut;
    const currentEmail =
      (
        session.currentEmail ??
        cookieEmail ??
        (raw.user?.email && raw.user.email.toLowerCase() !== DEMO_EMAIL ? raw.user.email : null) ??
        (allowLast ? session.lastEmail ?? raw.lastUserEmail : null) ??
        null
      )?.toLowerCase() ?? null;
    const stored = (currentEmail && u[currentEmail]) || raw.user || null;
    const rawUser =
      stored?.email?.toLowerCase() === DEMO_EMAIL
        ? { ...demoUser, theme: "light" as const }
        : stored
        ? {
            ...stored,
            email: stored.email.toLowerCase(),
            theme: stored.theme ?? "light",
          }
        : null;
    const user = rawUser;
    const lastEmail =
      (session.lastEmail ?? raw.lastUserEmail ?? (user && user.email.toLowerCase() !== DEMO_EMAIL ? user.email : null) ?? null)?.toLowerCase() ??
      null;
    const lastIsDemo = lastEmail === DEMO_EMAIL;
    const isDemoUser = user?.email?.toLowerCase() === DEMO_EMAIL;
    localePicked = Boolean(raw.pickedLocale);
    const mail = user?.email.toLowerCase();
    const ws = mail && mail !== DEMO_EMAIL ? raw.workspaces?.[mail] : null;
    const nextUser = user
      ? {
          ...user,
          language: localePicked ? user.language ?? "ru" : "ru",
          lessonLanguage: localePicked ? user.lessonLanguage ?? "ru" : "ru",
        }
      : null;
    const hydratedUser = nextUser
      ? {
          ...nextUser,
          inbox: seedInbox(nextUser),
          activityDays: Array.from(new Set([...(nextUser.activityDays ?? []), todayKey()])).slice(-60),
          favoriteTopics: nextUser.favoriteTopics ?? [],
          langSchool: ensureLangSchool(nextUser.langSchool),
        }
      : null;
    if (hydratedUser) {
      u[hydratedUser.email.toLowerCase()] = hydratedUser;
      usersRef.current = u;
      setUsers({ ...u });
    }
    const next: AppState = {
      user: hydratedUser,
      conversations: withNamedHistory(ws?.conversations ?? raw.conversations, user, isDemoUser),
      activeConversationId: ws?.activeConversationId ?? raw.activeConversationId ?? (isDemoUser ? demoConversation.id : null),
      studyPlan: ws?.studyPlan ?? raw.studyPlan ?? null,
      flashcards: ws?.flashcards ?? raw.flashcards ?? (isDemoUser ? demoFlashcards : []),
      exam: ws?.exam ?? raw.exam ?? null,
      demoMode: isDemoUser,
      hydrated: true,
      lastUserName: lastIsDemo || isInventedName(session.lastName ?? raw.lastUserName ?? "") ? null : (session.lastName ?? raw.lastUserName ?? (user && !isDemoUser ? user.name : null)),
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
    const dark = state.user.theme === "dark";
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.lang = state.user.language;
    document.documentElement.dir = state.user.language === "ar" ? "rtl" : "ltr";
  }, [state.user]);

  const commitUser = useCallback((user: StudentProfile | null, extra?: Partial<AppState>) => {
    if (user) sessionLockedOut = false;
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
      const pass = password.trim();
      const db = { ...readUsers(), ...usersRef.current };
      const found = clean === DEMO_EMAIL ? demoUser : db[clean];
      if (!found || found.password !== pass) return false;
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      let streak = found.streak;
      if (found.lastActiveDate === yesterday) streak += 1;
      else if (found.lastActiveDate !== today) streak = 1;
      const isDemo = clean === DEMO_EMAIL;
      const user = {
        ...found,
        email: clean,
        streak,
        lastActiveDate: today,
        theme: isDemo ? "light" : found.theme,
        activityDays: Array.from(new Set([...(found.activityDays ?? []), today])).slice(-60),
        inbox: seedInbox({ ...found, streak, lastActiveDate: today }),
      };
      const prev = stateRef.current;
      const samePerson = prev.user?.email.toLowerCase() === clean;
      const saved = loadRaw().workspaces?.[clean];
      commitUser(
        user,
        isDemo
          ? {
              conversations: prev.conversations.length ? prev.conversations : [demoConversation],
              activeConversationId: prev.activeConversationId ?? demoConversation.id,
              studyPlan: prev.studyPlan ?? demoPlan,
              flashcards: prev.flashcards.length ? prev.flashcards : demoFlashcards,
              demoMode: true,
            }
          : {
              conversations: samePerson ? prev.conversations : saved?.conversations ?? [],
              activeConversationId: samePerson ? prev.activeConversationId : saved?.activeConversationId ?? null,
              studyPlan: samePerson ? prev.studyPlan : saved?.studyPlan ?? null,
              flashcards: samePerson ? prev.flashcards : saved?.flashcards ?? [],
              exam: samePerson ? prev.exam : saved?.exam ?? null,
              demoMode: false,
            }
      );
      if (!isDemo) syncCloudAuth("/api/auth/register", cloudPayload(user, workspaceOf(stateRef.current)));
      return true;
    },
    [commitUser]
  );

  const loginCloud = useCallback(
    async (email: string, password: string) => {
      const clean = email.trim().toLowerCase();
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: clean, password }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          user?: Partial<StudentProfile> & { _ws?: Workspace };
        };
        if (!res.ok || !data.ok || !data.user) return false;
        const { _ws, ...cloud } = data.user;
        const profile: StudentProfile = {
          ...blankProfile(clean, cloud.name || clean.split("@")[0], password.trim()),
          ...cloud,
          email: clean,
          password: password.trim(),
        };
        const nextUsers = { ...readUsers(), ...usersRef.current, [clean]: profile };
        usersRef.current = nextUsers;
        setUsers(nextUsers);
        saveAccounts(nextUsers);
        if (_ws) {
          const raw = loadRaw();
          localStorage.setItem(KEY, JSON.stringify({ ...raw, workspaces: { ...(raw.workspaces ?? {}), [clean]: _ws } }));
        }
        return login(clean, password);
      } catch {
        return false;
      }
    },
    [login]
  );

  useEffect(() => {
    const user = state.user;
    if (!state.hydrated || !user || user.email.toLowerCase() === DEMO_EMAIL || !user.password) return;
    const timer = window.setTimeout(() => {
      syncCloudAuth("/api/auth/save", cloudPayload(user, workspaceOf(stateRef.current)));
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [state.hydrated, state.user, state.conversations, state.studyPlan, state.flashcards]);

  const loginDemo = useCallback(() => {
    login(DEMO_EMAIL, demoUser.password);
  }, [login]);

  const loginLast = useCallback(() => {
    const session = loadSession();
    if (session.signedOut && !session.currentEmail && !readSessionCookie()) return false;
    const email = (session.currentEmail ?? stateRef.current.lastUserEmail ?? session.lastEmail ?? loadRaw().lastUserEmail)?.toLowerCase();
    if (!email || email === DEMO_EMAIL) return false;
    const found = usersRef.current[email] ?? readUsers()[email];
    if (!found) return false;
    return login(found.email, found.password);
  }, [login]);

  useEffect(() => {
    if (!state.hydrated || state.user) return;
    if (loadSession().signedOut && !readSessionCookie()) return;
    loginLast();
  }, [state.hydrated, state.user, loginLast]);

  const register = useCallback(
    (
      data: Pick<StudentProfile, "name" | "email" | "password" | "grade" | "country"> & {
        favoriteSubjects?: string[];
        dailyGoalMin?: number;
        lessonLanguage?: Locale;
        goal?: string;
        startLevel?: number;
        onboardingDone?: boolean;
      }
    ) => {
      const email = data.email.trim().toLowerCase();
      const pass = data.password.trim();
      const db = { ...readUsers(), ...usersRef.current };
      const existing = db[email];
      if (existing) {
        if (existing.password === pass) {
          const saved = loadRaw().workspaces?.[email];
          commitUser(existing, {
            conversations: saved?.conversations ?? [],
            flashcards: saved?.flashcards ?? [],
            studyPlan: saved?.studyPlan ?? null,
            activeConversationId: saved?.activeConversationId ?? null,
            exam: saved?.exam ?? null,
            demoMode: false,
          });
          return true;
        }
        return false;
      }
      const base = blankProfile(email, data.name.trim(), pass);
      const user: StudentProfile = {
        ...base,
        grade: data.grade,
        country: data.country,
        lessonLanguage: data.lessonLanguage ?? "ru",
        goal: data.goal || "university",
        favoriteSubjects: data.favoriteSubjects ?? [],
        subjectLevels: Object.fromEntries(Object.keys(base.subjectLevels).map((k) => [k, data.startLevel ?? 20])),
        dailyGoalMin: data.dailyGoalMin ?? 20,
        onboardingDone: data.onboardingDone ?? true,
      };
      usersRef.current = { ...db, [email]: user };
      setUsers(usersRef.current);
      saveAccounts(usersRef.current);
      commitUser(user, {
        ...emptyWorkspace(),
        demoMode: false,
      });
      syncCloudAuth("/api/auth/register", cloudPayload(user, emptyWorkspace()));
      return true;
    },
    [commitUser]
  );

  const logout = useCallback(() => {
    sessionLockedOut = true;
    writeSessionCookie(null);
    setState((s) => {
      const mail = s.user?.email.toLowerCase();
      if (mail && mail !== DEMO_EMAIL) {
        const prev = loadRaw();
        try {
          localStorage.setItem(
            KEY,
            JSON.stringify({
              ...prev,
              workspaces: { ...(prev.workspaces ?? {}), [mail]: workspaceOf(s) },
              users: { ...loadAccounts(), ...usersRef.current, [mail]: s.user },
            })
          );
        } catch {
          /* keep going */
        }
      }
      const next = {
        ...s,
        user: null,
        conversations: [],
        activeConversationId: null,
        exam: null,
        lastUserName: mail && mail !== DEMO_EMAIL ? s.user?.name ?? s.lastUserName : s.lastUserName,
        lastUserEmail: mail && mail !== DEMO_EMAIL ? mail : s.lastUserEmail,
      };
      persist(next, usersRef.current);
      const session = loadSession();
      saveSession({
        currentEmail: null,
        lastEmail: next.lastUserEmail ?? session.lastEmail,
        lastName: next.lastUserName ?? session.lastName,
        signedOut: true,
      });
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
      mode: c?.mode ?? "chat",
    };
    setState((s) => ({
      ...s,
      conversations: [conv, ...s.conversations],
      activeConversationId: id,
    }));
    return id;
  }, [state.user]);

  const appendMessage = useCallback((conversationId: string, m: Omit<ChatMessage, "id" | "createdAt">) => {
    const mid = uid("m");
    setState((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              updatedAt: new Date().toISOString(),
              title:
                (c.title === "Новый диалог" || c.title === "New chat" || c.messages.length === 0) && m.role === "user"
                  ? m.content.replace(/\s+/g, " ").trim().slice(0, 42)
                  : c.title,
              messages: [
                ...c.messages,
                { ...m, id: mid, createdAt: new Date().toISOString() },
              ],
            }
          : c
      ),
    }));
    return mid;
  }, []);

  const patchMessage = useCallback((conversationId: string, messageId: string, patch: Partial<ChatMessage> & { meta?: ChatMessage["meta"] }) => {
    setState((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.id !== conversationId
          ? c
          : {
              ...c,
              messages: c.messages.map((msg) =>
                msg.id === messageId
                  ? { ...msg, ...patch, meta: { ...msg.meta, ...patch.meta } }
                  : msg
              ),
            }
      ),
    }));
  }, []);

  const deleteMessage = useCallback((conversationId: string, messageId: string) => {
    setState((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.id !== conversationId ? c : { ...c, messages: c.messages.filter((msg) => msg.id !== messageId) }
      ),
    }));
  }, []);

  const toggleFavorite = useCallback((topicId: string) => {
    setState((s) => {
      if (!s.user) return s;
      const cur = s.user.favoriteTopics ?? [];
      const favoriteTopics = cur.includes(topicId) ? cur.filter((id) => id !== topicId) : [topicId, ...cur].slice(0, 24);
      const user = { ...s.user, favoriteTopics };
      setUsers((p) => ({ ...p, [user.email]: user }));
      return { ...s, user };
    });
  }, []);

  const pushNotice = useCallback((n: Omit<AppNotice, "id" | "createdAt" | "read"> & { id?: string }) => {
    setState((s) => {
      if (!s.user) return s;
      const notice: AppNotice = {
        id: n.id ?? uid("n"),
        kind: n.kind,
        title: n.title,
        text: n.text,
        href: n.href,
        read: false,
        createdAt: new Date().toISOString(),
      };
      const user = { ...s.user, inbox: [notice, ...(s.user.inbox ?? [])].slice(0, 30) };
      setUsers((p) => ({ ...p, [user.email]: user }));
      return { ...s, user };
    });
  }, []);

  const markInboxRead = useCallback((id?: string) => {
    setState((s) => {
      if (!s.user) return s;
      const inbox = (s.user.inbox ?? []).map((n) => (id ? (n.id === id ? { ...n, read: true } : n) : { ...n, read: true }));
      const user = { ...s.user, inbox };
      setUsers((p) => ({ ...p, [user.email]: user }));
      return { ...s, user };
    });
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      tReady: state.hydrated,
      lastXp,
      lastAchievement,
      login,
      loginCloud,
      loginDemo,
      loginLast,
      displayName: (() => {
        if (state.user?.email?.toLowerCase() === DEMO_EMAIL) return "";
        const name = state.user?.name || (state.lastUserEmail?.toLowerCase() === DEMO_EMAIL ? "" : state.lastUserName) || "";
        if (isInventedName(name)) return "";
        return name;
      })(),
      register,
      logout,
      updateUser,
      setLanguage: (l) => {
        localePicked = true;
        updateUser({ language: l });
      },
      setLessonLanguage: (l) => updateUser({ lessonLanguage: l }),
      setTheme: (t) => updateUser({ theme: t }),
      addXp,
      addConversation,
      setActiveConversation: (id) => setState((s) => ({ ...s, activeConversationId: id })),
      appendMessage,
      patchMessage,
      deleteMessage,
      toggleFavorite,
      pushNotice,
      markInboxRead,
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
            setTimeout(() => addXp(XP_REWARDS.plan, "Plan finished"), 0);
          }
          return { ...s, studyPlan: plan };
        }),
      addTest: (r) => {
        setState((s) => {
          if (!s.user) return s;
          const weakIn = (r.weak.length ? r.weak : r.score < r.total ? [r.topic] : []).filter(isKnownTopic);
          const strongIn = (r.strong.length ? r.strong : r.score === r.total ? [r.topic] : []).filter(isKnownTopic);
          const weakTopics = mergeTopics(s.user.weakTopics, weakIn, strongIn);
          const strongTopics = mergeTopics(s.user.strongTopics, strongIn, weakTopics);
          const pct = Math.round((r.score / Math.max(1, r.total)) * 100);
          const prevLevel = s.user.subjectLevels[r.subjectId] ?? 20;
          const user = {
            ...s.user,
            testHistory: [r, ...s.user.testHistory].slice(0, 40),
            weakTopics,
            strongTopics,
            subjectLevels: { ...s.user.subjectLevels, [r.subjectId]: Math.min(100, Math.max(0, Math.round(prevLevel * 0.65 + pct * 0.35))) },
            lastStudy: { topic: r.topic, date: new Date().toISOString() },
            recentTopics: [r.topic, ...(s.user.recentTopics ?? []).filter((id) => id !== r.topic)].slice(0, 8),
          };
          setUsers((p) => ({ ...p, [user.email]: user }));
          return { ...s, user };
        });
        if (r.score === r.total) unlockAchievement("perfect-test");
        addXp(XP_REWARDS.test, "Knowledge check");
      },
      addStudyMinutes: (minutes) => {
        if (minutes <= 0) return;
        setState((s) => {
          if (!s.user) return s;
          const weekly = [...(s.user.weeklyMinutes ?? [0, 0, 0, 0, 0, 0, 0])];
          const day = new Date().getDay();
          const idx = day === 0 ? 6 : day - 1;
          weekly[idx] = (weekly[idx] ?? 0) + minutes;
          const user = { ...s.user, studyMinutes: (s.user.studyMinutes ?? 0) + minutes, weeklyMinutes: weekly };
          setUsers((p) => ({ ...p, [user.email]: user }));
          return { ...s, user };
        });
      },
      recordTopic: (topicId) => {
        if (!isKnownTopic(topicId)) return;
        setState((s) => {
          if (!s.user) return s;
          const user = {
            ...s.user,
            lastStudy: { topic: topicId, date: new Date().toISOString() },
            recentTopics: [topicId, ...(s.user.recentTopics ?? []).filter((id) => id !== topicId)].slice(0, 8),
          };
          setUsers((p) => ({ ...p, [user.email]: user }));
          return { ...s, user };
        });
      },
      setExam: (e) => setState((s) => ({ ...s, exam: e })),
      updateFlash: (cards) => setState((s) => ({ ...s, flashcards: cards })),
      unlockAchievement,
      markTopicProgress: (topicId, subjectId, progress) => {
        updateUser({
          continueLesson: { topicId, subjectId, progress },
          lastStudy: { topic: topicId, date: new Date().toISOString() },
          recentTopics: [topicId, ...(state.user?.recentTopics ?? []).filter((id) => id !== topicId)].slice(0, 8),
        });
        if (progress >= 100) {
          addXp(XP_REWARDS.topic, "Topic completed");
          unlockAchievement("first-topic");
        }
      },
      setConversationMode: (id, mode) =>
        setState((s) => ({
          ...s,
          conversations: s.conversations.map((c) => (c.id === id ? { ...c, mode } : c)),
        })),
      resetLocalData: () =>
        setState((s) => {
          if (!s.user) return s;
          return {
            ...s,
            conversations: [],
            activeConversationId: null,
            studyPlan: null,
            flashcards: [],
            exam: null,
          };
        }),
      setDemoMode: (v) => setState((s) => ({ ...s, demoMode: v })),
      clearToasts: () => {
        setLastXp(null);
        setLastAchievement(null);
      },
    }),
    [state, lastXp, lastAchievement, login, loginCloud, loginDemo, loginLast, register, logout, updateUser, addXp, addConversation, appendMessage, patchMessage, deleteMessage, toggleFavorite, pushNotice, markInboxRead, unlockAchievement]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function peekSession() {
  if (typeof window === "undefined") return null;
  const session = loadSession();
  const email = (session.currentEmail ?? readSessionCookie() ?? (!session.signedOut ? session.lastEmail : null))?.toLowerCase();
  if (email && email !== DEMO_EMAIL) {
    const found = loadAccounts()[email];
    if (found) return found;
  }
  if (session.signedOut) return null;
  const raw = loadRaw().user ?? null;
  if (!raw || raw.email?.toLowerCase() === DEMO_EMAIL) return null;
  if (isInventedName(raw.name)) return raw;
  return raw;
}

export function peekLastLogin() {
  if (typeof window === "undefined") return null;
  const session = loadSession();
  const email = (session.lastEmail ?? loadRaw().lastUserEmail)?.toLowerCase();
  if (!email || email === DEMO_EMAIL) return null;
  const found = loadAccounts()[email];
  if (!found?.password || isInventedName(found.name)) return null;
  return { email: found.email, name: found.name, password: found.password };
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp outside provider");
  return ctx;
}

export { levelFromXp, uid };
