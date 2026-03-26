export type OKRStatus = "no-status" | "on-track" | "at-risk" | "behind" | "done";

export interface OKRUser {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface KeyResult {
  id: string;
  title: string;
  assignees: OKRUser[];
  status: OKRStatus;
  score: number; // 0–10
}

export interface Objective {
  id: string;
  title: string;
  owner: string;
  keyResults: KeyResult[];
  notes: string;
  status: OKRStatus;
  score: number; // 0–10
}
