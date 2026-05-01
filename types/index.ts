export type UserRole = "player" | "coach";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: Date;
}

export interface PlayerProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  height: string;
  position: "PG" | "SG" | "SF" | "PF" | "C";
  state: AustralianState;
  club: string;
  gpa?: number;
  graduationYear: number;
  highlights?: string;
  stats?: PlayerStats;
  avatarUrl?: string;
  isVerified: boolean;
}

export interface CoachProfile {
  id: string;
  userId: string;
  name: string;
  university: string;
  division: "D1" | "D2" | "D3" | "NAIA" | "JUCO";
  state: USState;
  title: string;
  openScholarships?: number;
  avatarUrl?: string;
  isVerified: boolean;
}

export interface PlayerStats {
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  fgPct: number;
}

export type AustralianState =
  | "NSW"
  | "VIC"
  | "QLD"
  | "WA"
  | "SA"
  | "TAS"
  | "ACT"
  | "NT";

export type USState = string;
