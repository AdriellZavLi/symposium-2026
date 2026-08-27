import { SessionOptions } from "iron-session";

export interface SessionData {
  adminId?: number;
  usuario?: string;
  nombre?: string;
  rol?: string;
  semestre?: number | null;
  isLoggedIn?: boolean;
}

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "dev-secret-symposium-2026-local-change-in-prod",
  cookieName: "symposium2026_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 8, // 8 horas
  },
};

export const defaultSession: SessionData = {
  isLoggedIn: false,
};
