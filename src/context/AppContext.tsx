import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

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
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Carlos Naguit",   initials: "CN", color: "#5b9ea6" },
  { id: "u2", name: "Naveen Jasrotia", initials: "NJ", color: "#e07b54" },
  { id: "u3", name: "Al Baltazar",     initials: "AB", color: "#9b59b6" },
  { id: "u4", name: "Jermin David",    initials: "JD", color: "#27ae60" },
  { id: "u5", name: "Miguel Naguit",   initials: "MN", color: "#2980b9" },
  { id: "u6", name: "Rafael Guida",    initials: "RG", color: "#e74c3c" },
  { id: "u7", name: "Andy Nguyen",     initials: "AN", color: "#f39c12" },
  { id: "u8", name: "Kevin Louie",     initials: "KL", color: "#1abc9c" },
];

const INITIAL_ISSUES: IssueItem[] = [
  { id: "i1", title: "Brick'd gummies will be ready in 4 weeks time (end of march)", description: "", dueBy: "", resolved: false, team: "Marketing", assignees: [MOCK_USERS[1]], term: "short", createdAt: "Mar 3" },
  { id: "i2", title: "Launch 2ml Free + Shipping Subscription INTL April 1",          description: "", dueBy: "", resolved: false, team: "Marketing", assignees: [MOCK_USERS[1]], term: "short", createdAt: "Mar 8" },
];

const INITIAL_TODOS: TodoItem[] = [
  { id: "t1", title: "Funnelish Subscription Automation error with shopify and stripe charges", description: "", dueBy: "Apr 1", done: false, team: "Marketing", isPrivate: false, assignees: [MOCK_USERS[0]] },
  { id: "t2", title: "Get Brick'd gummies LP ready (copy, structure)", description: "", dueBy: "Apr 1", done: false, team: "Marketing", isPrivate: false, assignees: [MOCK_USERS[1]] },
  { id: "t3", title: "Get Brick'd gummies LP ready (copy, structure)", description: "", dueBy: "Apr 1", done: false, team: "Marketing", isPrivate: false, assignees: [MOCK_USERS[0]] },
  { id: "t4", title: "Long-form ads for YT (AI generated)", description: "", dueBy: "Mar 31", done: false, team: "Marketing", isPrivate: false, assignees: [MOCK_USERS[2]] },
  { id: "t5", title: "Launch and test YouTube long form", description: "", dueBy: "Mar 31", done: false, team: "Marketing", isPrivate: false, assignees: [MOCK_USERS[3]] },
  { id: "t6", title: "Check CupidsFemme and Glamory shopify atc loading speed vs Cupids and find solution", description: "", dueBy: "Apr 1", done: false, team: "Marketing", isPrivate: false, assignees: [MOCK_USERS[0]] },
  { id: "t7", title: "Brief Brick'd gummies ads and get them ready for launch by end of week 1 or 2 of April", description: "", dueBy: "Apr 1", done: false, team: "Marketing", isPrivate: false, assignees: [MOCK_USERS[4]] },
  { id: "t8", title: "Prepare INTL 2ml Free + Shipping Subscription Offer to launch on Meta. (Shopify)", description: "", dueBy: "Apr 1", done: false, team: "Marketing", isPrivate: false, assignees: [MOCK_USERS[5]] },
  { id: "t9", title: "Setup compliance price test for funnelish. compare-at price at $75. (currently at $150)", description: "", dueBy: "Apr 1", done: true, team: "Marketing", isPrivate: false, assignees: [MOCK_USERS[0]] },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* fall through */ }
  return fallback;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [todos,     setTodos]     = useState<TodoItem[]>(() => loadFromStorage("ninety-todos",      INITIAL_TODOS));
  const [issues,    setIssues]    = useState<IssueItem[]>(() => loadFromStorage("ninety-issues",    INITIAL_ISSUES));
  const [headlines, setHeadlines] = useState<HeadlineItem[]>(() => loadFromStorage("ninety-headlines", []));

  useEffect(() => { localStorage.setItem("ninety-todos",      JSON.stringify(todos));     }, [todos]);
  useEffect(() => { localStorage.setItem("ninety-issues",     JSON.stringify(issues));    }, [issues]);
  useEffect(() => { localStorage.setItem("ninety-headlines",  JSON.stringify(headlines)); }, [headlines]);

  function addTodo(todo: Omit<TodoItem, "id">) {
    setTodos((prev) => [{ ...todo, id: Date.now().toString() }, ...prev]);
  }
  function updateTodo(id: string, changes: Partial<TodoItem>) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));
  }
  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }
  function toggleTodo(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function addIssue(issue: Omit<IssueItem, "id" | "createdAt">) {
    const createdAt = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setIssues((prev) => [...prev, { ...issue, id: Date.now().toString(), createdAt }]);
  }
  function updateIssue(id: string, changes: Partial<IssueItem>) {
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  }
  function deleteIssue(id: string) {
    setIssues((prev) => prev.filter((i) => i.id !== id));
  }
  function resolveIssue(id: string) {
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, resolved: !i.resolved } : i)));
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
      return [...rest, ...next];
    });
  }

  function addHeadline(headline: Omit<HeadlineItem, "id" | "createdAt">) {
    const createdAt = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setHeadlines((prev) => [{ ...headline, id: Date.now().toString(), createdAt }, ...prev]);
  }
  function updateHeadline(id: string, changes: Partial<HeadlineItem>) {
    setHeadlines((prev) => prev.map((h) => (h.id === id ? { ...h, ...changes } : h)));
  }
  function deleteHeadline(id: string) {
    setHeadlines((prev) => prev.filter((h) => h.id !== id));
  }
  function archiveHeadline(id: string) {
    setHeadlines((prev) => prev.map((h) => (h.id === id ? { ...h, archived: !h.archived } : h)));
  }

  return (
    <AppContext.Provider value={{ todos, issues, headlines, users: MOCK_USERS, addTodo, updateTodo, toggleTodo, deleteTodo, addIssue, updateIssue, resolveIssue, deleteIssue, reorderIssues, addHeadline, updateHeadline, deleteHeadline, archiveHeadline }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
