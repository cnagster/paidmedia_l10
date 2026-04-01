import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  dueBy: string;
  done: boolean;
  team: string;
  isPrivate: boolean;
  assignees: User[];
}

export interface HeadlineItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  archived: boolean;
  team: string;
  author: User | null;
}

export interface IssueItem {
  id: string;
  title: string;
  description: string;
  dueBy: string;
  resolved: boolean;
  team: string;
  assignees: User[];
  term: "short" | "long";
  createdAt: string;
}

interface AppContextType {
  todos: TodoItem[];
  issues: IssueItem[];
  headlines: HeadlineItem[];
  users: User[];
  currentUser: User | null;
  addTodo: (todo: Omit<TodoItem, "id">) => void;
  updateTodo: (id: string, changes: Partial<TodoItem>) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  addIssue: (issue: Omit<IssueItem, "id" | "createdAt">) => void;
  updateIssue: (id: string, changes: Partial<IssueItem>) => void;
  resolveIssue: (id: string) => void;
  deleteIssue: (id: string) => void;
  reorderIssues: (term: "short" | "long", fromId: string, toId: string) => void;
  addHeadline: (headline: Omit<HeadlineItem, "id" | "createdAt">) => void;
  updateHeadline: (id: string, changes: Partial<HeadlineItem>) => void;
  deleteHeadline: (id: string) => void;
  archiveHeadline: (id: string) => void;
  reorderHeadlines: (fromId: string, toId: string) => void;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Carlos Naguit",   initials: "CN", color: "#5b9ea6" },
  { id: "u2", name: "Naveen Jasrotia", initials: "NJ", color: "#e07b54" },
  { id: "u3", name: "Al Baltazar",     initials: "AB", color: "#9b59b6" },
  { id: "u4", name: "Miguel Naguit",   initials: "MN", color: "#2980b9" },
  { id: "u5", name: "Jermin David",    initials: "JD", color: "#27ae60" },
  { id: "u6", name: "Dun Abiera",      initials: "DA", color: "#e74c3c" },
];

const USERNAME_TO_ID: Record<string, string> = {
  carlos: "u1", naveen: "u2", albaltazar: "u3", miguel: "u4", jermin: "u5", dun: "u6",
};

const todosRef     = doc(db, "app-data", "todos");
const issuesRef    = doc(db, "app-data", "issues");
const headlinesRef = doc(db, "app-data", "headlines");

// One-time migration: push localStorage data to Firestore if Firestore is empty
async function migrateFromLocalStorage() {
  if (localStorage.getItem("ninety-migrated-to-firestore")) return;
  const migrations: Array<{ ref: ReturnType<typeof doc>; key: string; field: string }> = [
    { ref: todosRef,     key: "ninety-todos",     field: "items" },
    { ref: issuesRef,    key: "ninety-issues",     field: "items" },
    { ref: headlinesRef, key: "ninety-headlines",  field: "items" },
  ];
  for (const { ref, key, field } of migrations) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const localData = JSON.parse(raw);
      if (!Array.isArray(localData) || localData.length === 0) continue;
      const snap = await getDoc(ref);
      const cloudItems = snap.exists() ? (snap.data()[field] ?? []) : [];
      if (cloudItems.length === 0) {
        await setDoc(ref, { [field]: localData });
        console.log(`Migrated ${localData.length} items from ${key} to Firestore`);
      }
    } catch (e) {
      console.warn("Migration failed for", key, e);
    }
  }
  localStorage.setItem("ninety-migrated-to-firestore", "1");
}

export function AppProvider({ children, username }: { children: ReactNode; username: string }) {
  const currentUser = MOCK_USERS.find((u) => u.id === USERNAME_TO_ID[username]) ?? null;

  const [todos,     setTodos]     = useState<TodoItem[]>([]);
  const [issues,    setIssues]    = useState<IssueItem[]>([]);
  const [headlines, setHeadlines] = useState<HeadlineItem[]>([]);
  const [loaded,    setLoaded]    = useState({ todos: false, issues: false, headlines: false });

  // Run migration once on first load
  useEffect(() => { migrateFromLocalStorage(); }, []);

  // Timeout fallback — unblock UI after 8s even if Firestore never responds
  useEffect(() => {
    const t = setTimeout(() => setLoaded({ todos: true, issues: true, headlines: true }), 8000);
    return () => clearTimeout(t);
  }, []);

  // Real-time Firestore listeners
  useEffect(() => {
    return onSnapshot(todosRef,
      (snap) => {
        if (snap.metadata.hasPendingWrites) return;
        setTodos(snap.exists() ? (snap.data().items ?? []) : []);
        setLoaded((p) => ({ ...p, todos: true }));
      },
      (err) => { console.error("todos listener:", err); setLoaded((p) => ({ ...p, todos: true })); }
    );
  }, []);

  useEffect(() => {
    return onSnapshot(issuesRef,
      (snap) => {
        if (snap.metadata.hasPendingWrites) return;
        setIssues(snap.exists() ? (snap.data().items ?? []) : []);
        setLoaded((p) => ({ ...p, issues: true }));
      },
      (err) => { console.error("issues listener:", err); setLoaded((p) => ({ ...p, issues: true })); }
    );
  }, []);

  useEffect(() => {
    return onSnapshot(headlinesRef,
      (snap) => {
        if (snap.metadata.hasPendingWrites) return;
        setHeadlines(snap.exists() ? (snap.data().items ?? []) : []);
        setLoaded((p) => ({ ...p, headlines: true }));
      },
      (err) => { console.error("headlines listener:", err); setLoaded((p) => ({ ...p, headlines: true })); }
    );
  }, []);

  // ── Todos ──────────────────────────────────────────────
  function addTodo(todo: Omit<TodoItem, "id">) {
    const newItem = { ...todo, id: Date.now().toString() };
    setTodos((prev) => { const next = [newItem, ...prev]; setDoc(todosRef, { items: next }); return next; });
  }
  function updateTodo(id: string, changes: Partial<TodoItem>) {
    setTodos((prev) => { const next = prev.map((t) => (t.id === id ? { ...t, ...changes } : t)); setDoc(todosRef, { items: next }); return next; });
  }
  function deleteTodo(id: string) {
    setTodos((prev) => { const next = prev.filter((t) => t.id !== id); setDoc(todosRef, { items: next }); return next; });
  }
  function toggleTodo(id: string) {
    setTodos((prev) => { const next = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)); setDoc(todosRef, { items: next }); return next; });
  }

  // ── Issues ─────────────────────────────────────────────
  function addIssue(issue: Omit<IssueItem, "id" | "createdAt">) {
    const createdAt = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const newItem = { ...issue, id: Date.now().toString(), createdAt };
    setIssues((prev) => { const next = [...prev, newItem]; setDoc(issuesRef, { items: next }); return next; });
  }
  function updateIssue(id: string, changes: Partial<IssueItem>) {
    setIssues((prev) => { const next = prev.map((i) => (i.id === id ? { ...i, ...changes } : i)); setDoc(issuesRef, { items: next }); return next; });
  }
  function deleteIssue(id: string) {
    setIssues((prev) => { const next = prev.filter((i) => i.id !== id); setDoc(issuesRef, { items: next }); return next; });
  }
  function resolveIssue(id: string) {
    setIssues((prev) => { const next = prev.map((i) => (i.id === id ? { ...i, resolved: !i.resolved } : i)); setDoc(issuesRef, { items: next }); return next; });
  }
  function reorderIssues(term: "short" | "long", fromId: string, toId: string) {
    setIssues((prev) => {
      const group = prev.filter((i) => i.term === term);
      const rest  = prev.filter((i) => i.term !== term);
      const fromIdx = group.findIndex((i) => i.id === fromId);
      const toIdx   = group.findIndex((i) => i.id === toId);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return prev;
      const next = [...group];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      const result = [...rest, ...next];
      setDoc(issuesRef, { items: result });
      return result;
    });
  }

  // ── Headlines ──────────────────────────────────────────
  function addHeadline(headline: Omit<HeadlineItem, "id" | "createdAt">) {
    const createdAt = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const newItem = { ...headline, id: Date.now().toString(), createdAt };
    setHeadlines((prev) => { const next = [newItem, ...prev]; setDoc(headlinesRef, { items: next }); return next; });
  }
  function updateHeadline(id: string, changes: Partial<HeadlineItem>) {
    setHeadlines((prev) => { const next = prev.map((h) => (h.id === id ? { ...h, ...changes } : h)); setDoc(headlinesRef, { items: next }); return next; });
  }
  function deleteHeadline(id: string) {
    setHeadlines((prev) => { const next = prev.filter((h) => h.id !== id); setDoc(headlinesRef, { items: next }); return next; });
  }
  function archiveHeadline(id: string) {
    setHeadlines((prev) => { const next = prev.map((h) => (h.id === id ? { ...h, archived: !h.archived } : h)); setDoc(headlinesRef, { items: next }); return next; });
  }
  function reorderHeadlines(fromId: string, toId: string) {
    setHeadlines((prev) => {
      const fromIdx = prev.findIndex((h) => h.id === fromId);
      const toIdx   = prev.findIndex((h) => h.id === toId);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      setDoc(headlinesRef, { items: next });
      return next;
    });
  }

  if (!loaded.todos || !loaded.issues || !loaded.headlines) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: 14, color: "#888" }}>Loading…</div>;
  }

  return (
    <AppContext.Provider value={{ todos, issues, headlines, users: MOCK_USERS, currentUser, addTodo, updateTodo, toggleTodo, deleteTodo, addIssue, updateIssue, resolveIssue, deleteIssue, reorderIssues, addHeadline, updateHeadline, deleteHeadline, archiveHeadline, reorderHeadlines }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
