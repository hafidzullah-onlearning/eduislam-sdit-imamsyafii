// Real Lovable Cloud auth wrapper. Filename kept for import stability.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Session as SupaSession } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Role } from "@/mocks/types";
import {
  loadAllFromSupabase,
  subscribeToAllRealtime,
  unsubscribeFromAllRealtime,
  useDB,
} from "@/lib/mock-store";

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
}

interface AppSession {
  userId: string;
  role: Role;
  activeSiswaId?: string;
}

interface AuthCtx {
  session: AppSession | null;
  user: AppUser | null;
  supaSession: SupaSession | null;
  ready: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, nama: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setActiveSiswa: (id: string) => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);
const ACTIVE_SISWA_KEY = "eduislam-active-siswa";

async function loadProfileAndRole(
  userId: string,
  authEmail?: string,
): Promise<{ user: AppUser | null; activeSiswaId?: string }> {
  const [{ data: profile }, { data: roles }, { data: siswa }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nama, email, phone, avatar_url")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase.from("siswa").select("id").eq("orang_tua_id", userId).order("nama").limit(1),
  ]);

  let activeProfile = profile;

  if (!activeProfile) {
    console.log(
      "Profile not found in database. Attempting to create fallback profile on the fly...",
    );
    const { data: supaUser } = await supabase.auth.getUser();
    const finalEmail = supaUser?.user?.email || authEmail || "";
    if (supaUser?.user || authEmail) {
      const email = finalEmail;
      const nama =
        supaUser?.user?.user_metadata?.nama ||
        supaUser?.user?.user_metadata?.full_name ||
        supaUser?.user?.user_metadata?.name ||
        email.split("@")[0] ||
        "Pengguna";
      const { data: newProfile, error: insErr } = await supabase
        .from("profiles")
        .insert([
          {
            id: userId,
            nama: nama,
            email: email,
          },
        ])
        .select()
        .maybeSingle();

      if (!insErr && newProfile) {
        activeProfile = newProfile;
      } else {
        console.error("Failed to create fallback profile:", insErr);
      }
    }
  }

  if (!activeProfile) return { user: null };

  const rolePriority: Role[] = ["admin", "guru", "ortu"];
  let role = rolePriority.find((r) => roles?.some((x) => x.role === r)) ?? "ortu";

  const stored =
    typeof window !== "undefined"
      ? (localStorage.getItem(ACTIVE_SISWA_KEY) ?? undefined)
      : undefined;
  const activeSiswaId = stored ?? siswa?.[0]?.id;
  return {
    user: {
      id: activeProfile.id,
      name: activeProfile.nama || activeProfile.email?.split("@")[0] || "Pengguna",
      email: activeProfile.email ?? "",
      avatar: activeProfile.avatar_url ?? undefined,
      phone: activeProfile.phone ?? undefined,
      role,
    },
    activeSiswaId,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supaSession, setSupaSession] = useState<SupaSession | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<AppSession | null>(null);
  const [ready, setReady] = useState(false);
  const currentUserIdRef = useRef<string | undefined>(undefined);
  const isReadyRef = useRef<boolean>(false);

  const hydrate = useCallback(async (s: SupaSession | null) => {
    const isNewUser = s?.user?.id !== currentUserIdRef.current;
    if (!isReadyRef.current || isNewUser) {
      setReady(false);
    }
    setSupaSession(s);
    currentUserIdRef.current = s?.user?.id;
    if (!s?.user) {
      setUser(null);
      setSession(null);
      unsubscribeFromAllRealtime();
      setReady(true);
      isReadyRef.current = true;
      return;
    }
    try {
      const { user: u, activeSiswaId } = await loadProfileAndRole(s.user.id, s.user.email);
      setUser(u);
      setSession(u ? { userId: u.id, role: u.role, activeSiswaId } : null);
    } catch (err) {
      console.error("Error during hydration:", err);
    } finally {
      setReady(true);
      isReadyRef.current = true;
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      await hydrate(data.session ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      hydrate(s ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [hydrate]);

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };

  const signUp = async (email: string, password: string, nama: string) => {
    const emailRedirectTo =
      typeof window !== "undefined" ? window.location.origin + "/app/dashboard" : undefined;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nama }, emailRedirectTo },
    });
    return error ? { error: error.message } : {};
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined" ? window.location.origin + "/app/dashboard" : undefined,
      },
    });
  };

  const signOut = async () => {
    unsubscribeFromAllRealtime();
    await supabase.auth.signOut();
    if (typeof window !== "undefined") localStorage.removeItem(ACTIVE_SISWA_KEY);
    useDB.getState().reset();
  };

  const setActiveSiswa = (id: string) => {
    setSession((prev) => (prev ? { ...prev, activeSiswaId: id } : prev));
    if (typeof window !== "undefined") localStorage.setItem(ACTIVE_SISWA_KEY, id);
  };

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    await hydrate(data.session ?? null);
  };

  return (
    <Ctx.Provider
      value={{
        session,
        user,
        supaSession,
        ready,
        signInWithPassword,
        signUp,
        signInWithGoogle,
        signOut,
        setActiveSiswa,
        refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
