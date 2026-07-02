import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role, User } from "@/mocks/types";
import { useDB } from "@/lib/mock-store";

interface Session {
  userId: string;
  role: Role;
  activeSiswaId?: string;
  remember: boolean;
}

interface AuthCtx {
  session: Session | null;
  user: User | null;
  ready: boolean;
  signIn: (role: Role, remember: boolean) => void;
  signOut: () => void;
  setActiveSiswa: (id: string) => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "eduislam-session-v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const users = useDB((s) => s.users);
  const siswa = useDB((s) => s.siswa);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const signIn = (role: Role, remember: boolean) => {
    const u = users.find((x) => x.role === role);
    if (!u) return;
    const activeSiswaId = role === "ortu" ? siswa.find((s) => s.orangTuaId === u.id)?.id : undefined;
    const s: Session = { userId: u.id, role, remember, activeSiswaId };
    setSession(s);
    const store = remember ? localStorage : sessionStorage;
    store.setItem(KEY, JSON.stringify(s));
    (remember ? sessionStorage : localStorage).removeItem(KEY);
  };

  const signOut = () => {
    setSession(null);
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  };

  const setActiveSiswa = (id: string) => {
    if (!session) return;
    const next = { ...session, activeSiswaId: id };
    setSession(next);
    const store = session.remember ? localStorage : sessionStorage;
    store.setItem(KEY, JSON.stringify(next));
  };

  const user = session ? users.find((u) => u.id === session.userId) ?? null : null;

  return (
    <Ctx.Provider value={{ session, user, ready, signIn, signOut, setActiveSiswa }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
