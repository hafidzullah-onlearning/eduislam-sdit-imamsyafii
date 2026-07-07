import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { seed, type SeedShape } from "@/mocks/seed";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

// Mappings between Zustand store keys and Supabase table names
export const tableMap: Record<string, string> = {
  siswa: "siswa",
  kelas: "kelas",
  mapel: "mapel",
  tugas: "tugas",
  submissions: "tugas_submission",
  tahfidz: "tahfidz",
  nilai: "nilai",
  mood: "mood",
  perilaku: "perilaku",
  invoice: "invoice",
  notifikasi: "notifikasi",
  pengumuman: "pengumuman",
  catatan: "catatan_guru",
  audit: "audit_log",
  tahunAjaran: "tahun_ajaran",
  sppTarif: "spp_tarif",
  materi: "materi",
};

// Static ID to UUID map for consistent seeding
const idUuidMap: Record<string, string> = {
  "u-guru-1": "00000000-0000-0000-0000-000000000001",
  "u-guru-2": "00000000-0000-0000-0000-000000000002",
  "u-ortu-1": "00000000-0000-0000-0000-000000000003",
  "u-ortu-2": "00000000-0000-0000-0000-000000000004",
  "u-admin-1": "00000000-0000-0000-0000-000000000005",
  "k-3a": "10000000-0000-0000-0000-000000000001",
  "k-3b": "10000000-0000-0000-0000-000000000002",
  "k-4a": "10000000-0000-0000-0000-000000000003",
  "s-1": "20000000-0000-0000-0000-000000000001",
  "s-2": "20000000-0000-0000-0000-000000000002",
  "s-3": "20000000-0000-0000-0000-000000000003",
  "s-4": "20000000-0000-0000-0000-000000000004",
  "s-5": "20000000-0000-0000-0000-000000000005",
  "m-1": "30000000-0000-0000-0000-000000000001",
  "m-2": "30000000-0000-0000-0000-000000000002",
  "m-3": "30000000-0000-0000-0000-000000000003",
  "m-4": "30000000-0000-0000-0000-000000000004",
  "m-5": "30000000-0000-0000-0000-000000000005",
};

// Deterministic UUID generator from string seed IDs
export function toUuid(id: string): string | null {
  if (!id || id === "" || id === "null" || id === "undefined") return null;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  if (idUuidMap[id]) return idUuidMap[id];

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  let hex = "";
  for (let i = 0; i < 16; i++) {
    const code = (id.charCodeAt(i % id.length) || 0) + (hash >> (i % 4));
    hex += Math.abs(code % 16).toString(16);
    hex += Math.abs((code * 13) % 16).toString(16);
  }

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// Convert camelCase object properties to snake_case
export function camelToSnake(obj: any): any {
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (obj !== null && typeof obj === "object") {
    const n: any = {};
    for (const k of Object.keys(obj)) {
      const snake = k.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      n[snake] = camelToSnake(obj[k]);
    }
    return n;
  }
  return obj;
}

// Convert snake_case object properties to camelCase
export function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj !== null && typeof obj === "object") {
    const n: any = {};
    for (const k of Object.keys(obj)) {
      const camel = k.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      n[camel] = snakeToCamel(obj[k]);
    }
    return n;
  }
  return obj;
}

export function convertIdsToUuid(obj: any): any {
  if (Array.isArray(obj)) return obj.map(convertIdsToUuid);
  if (obj !== null && typeof obj === "object") {
    const res: any = {};
    for (const k of Object.keys(obj)) {
      const val = obj[k];
      if (typeof val === "string") {
        const keyLower = k.toLowerCase();
        if (
          keyLower === "id" ||
          keyLower.endsWith("id") ||
          keyLower.endsWith("_id") ||
          keyLower === "createdby" ||
          keyLower === "created_by"
        ) {
          res[k] = toUuid(val);
        } else {
          res[k] = val;
        }
      } else {
        res[k] = convertIdsToUuid(val);
      }
    }
    return res;
  }
  return obj;
}

interface Store extends SeedShape {
  reset: () => void;
  patch: <K extends keyof SeedShape>(
    key: K,
    updater: (items: SeedShape[K]) => SeedShape[K],
  ) => void;
}

export const useDB = create<Store>()(
  persist(
    (set) => ({
      ...seed,
      reset: () => set({ ...seed }),
      patch: (key, updater) => {
        const oldItems = useDB.getState()[key] as any[];
        let newItems = updater(oldItems as any) as any[];

        newItems = convertIdsToUuid(newItems);

        const rollback = () => {
          set((state) => ({ ...state, [key]: oldItems }));
        };

        // Update local Zustand state immediately for fast UI feedback
        set((state) => ({ ...state, [key]: newItems }));

        // Sync changes to Supabase database asynchronously
        if (key === "users") {
          (async () => {
            try {
              // 1. Detect Inserts
              const added = newItems.filter((item) => !oldItems.some((old) => old.id === item.id));
              for (const item of added) {
                const userId = toUuid(item.id)!;
                const placeholderEmail =
                  item.email || `${userId.slice(0, 8)}@sdit-placeholder.sch.id`;

                // Call public.create_user_admin RPC to create user in auth.users & public.profiles safely
                const { error: rpcErr } = await (supabase as any).rpc("create_user_admin", {
                  p_id: userId,
                  p_email: placeholderEmail,
                  p_password: "EduIslamDefaultPassword123!",
                  p_nama: item.name,
                  p_role: item.role,
                });

                if (rpcErr) {
                  console.error("Error calling create_user_admin RPC:", rpcErr);
                  toast.error(`Gagal menyimpan user baru ke database: ${rpcErr.message}`);
                  rollback();
                  return;
                } else {
                  // RPC succeeded. Safely update other profile fields (phone, avatar_url)
                  if (item.phone || item.avatar) {
                    const { error: pErr } = await supabase
                      .from("profiles")
                      .update({
                        phone: item.phone || null,
                        avatar_url: item.avatar || null,
                      })
                      .eq("id", userId);
                    if (pErr) {
                      console.error("Error updating phone/avatar for new user:", pErr);
                      rollback();
                      return;
                    }
                  }
                }
              }

              // 2. Detect Updates
              const updated = newItems.filter((item) => {
                const old = oldItems.find((o) => o.id === item.id);
                if (!old) return false;
                return JSON.stringify(old) !== JSON.stringify(item);
              });
              for (const item of updated) {
                const userId = toUuid(item.id)!;
                const { error: pErr } = await supabase
                  .from("profiles")
                  .update({
                    nama: item.name,
                    email: item.email || null,
                    phone: item.phone || null,
                    avatar_url: item.avatar || null,
                  })
                  .eq("id", userId);
                if (pErr) {
                  console.error("Error updating profile:", pErr);
                  toast.error(`Gagal memperbarui profil user di database: ${pErr.message}`);
                  rollback();
                  return;
                }

                const { error: rErr } = await supabase.from("user_roles").upsert(
                  {
                    user_id: userId,
                    role: item.role,
                  },
                  { onConflict: "user_id,role" },
                );
                if (rErr) {
                  console.error("Error upserting user role:", rErr);
                  toast.error(`Gagal memperbarui peran user di database: ${rErr.message}`);
                  rollback();
                  return;
                }
              }

              // 3. Detect Deletions
              const deleted = oldItems.filter((item) => !newItems.some((n) => n.id === item.id));
              for (const item of deleted) {
                const userId = toUuid(item.id)!;
                const { error: rpcErr } = await (supabase as any).rpc("delete_user_admin", {
                  p_id: userId,
                });
                if (rpcErr) {
                  console.error("Error calling delete_user_admin RPC:", rpcErr);
                  toast.error(`Gagal menghapus user dari database: ${rpcErr.message}`);
                  rollback();
                  return;
                }
              }
            } catch (e) {
              console.error("Sync error on users patch:", e);
              rollback();
            }
          })();
          return;
        }

        const tableName = tableMap[key];
        if (!tableName) return;

        (async () => {
          try {
            // 1. Detect Inserts
            const added = newItems.filter((item) => !oldItems.some((old) => old.id === item.id));
            if (added.length > 0) {
              const mappedRows = added.map((item) => {
                const mapped = camelToSnake(item);
                if (key === "kelas") {
                  mapped.tahun_ajaran_id = toUuid("ta-" + item.tahunAjaran)!;
                  delete mapped.tahun_ajaran;
                }
                if (key === "sppTarif") {
                  mapped.tahun_ajaran_id = toUuid(item.tahunAjaranId)!;
                }
                if (key === "siswa") {
                  delete mapped.status;
                }
                return mapped;
              });
              const { error } = await supabase.from(tableName as any).insert(mappedRows);
              if (error) {
                console.error(`Error inserting to ${tableName}:`, error);
                toast.error(`Gagal menyimpan ke tabel ${tableName}: ${error.message}`);
                rollback();
                return;
              }
            }

            // 2. Detect Updates
            const updated = newItems.filter((item) => {
              const old = oldItems.find((o) => o.id === item.id);
              if (!old) return false;
              return JSON.stringify(old) !== JSON.stringify(item);
            });
            for (const item of updated) {
              const mapped = camelToSnake(item);
              if (key === "kelas") {
                mapped.tahun_ajaran_id = toUuid("ta-" + item.tahunAjaran)!;
                delete mapped.tahun_ajaran;
              }
              if (key === "sppTarif") {
                mapped.tahun_ajaran_id = toUuid(item.tahunAjaranId)!;
              }
              if (key === "siswa") {
                delete mapped.status;
              }
              const { error } = await supabase
                .from(tableName as any)
                .update(mapped)
                .eq("id", toUuid(item.id)!);
              if (error) {
                console.error(`Error updating in ${tableName}:`, error);
                toast.error(`Gagal memperbarui tabel ${tableName}: ${error.message}`);
                rollback();
                return;
              }
            }

            // 3. Detect Deletions
            const deleted = oldItems.filter((item) => !newItems.some((n) => n.id === item.id));
            for (const item of deleted) {
              const { error } = await supabase
                .from(tableName as any)
                .delete()
                .eq("id", toUuid(item.id)!);
              if (error) {
                console.error(`Error deleting from ${tableName}:`, error);
                toast.error(`Gagal menghapus dari tabel ${tableName}: ${error.message}`);
                rollback();
                return;
              }
            }
          } catch (e) {
            console.error(`Sync error on patch ${key}:`, e);
            toast.error(`Gagal sinkronisasi data: ${e instanceof Error ? e.message : e}`);
            rollback();
          }
        })();
      },
    }),
    {
      name: "eduislam-mock-db-v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage),
      ),
    },
  ),
);

export function genId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

let tahunAjaranCache: { id: string; nama: string }[] = [];
const loadedTables: Record<string, boolean> = {};
const activeSubscriptions: Record<string, any> = {};

// Helper to subscribe to individual tables in realtime
export function subscribeToTableRealtime(key: string) {
  if (activeSubscriptions[key]) return;

  if (key === "users") {
    const channelProfiles = supabase
      .channel("rt-profiles-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        loadedTables.users = false;
        ensureTableLoaded("users");
      })
      .subscribe();

    const channelRoles = supabase
      .channel("rt-roles-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_roles" }, () => {
        loadedTables.users = false;
        ensureTableLoaded("users");
      })
      .subscribe();

    activeSubscriptions.users = {
      unsubscribe: () => {
        supabase.removeChannel(channelProfiles);
        supabase.removeChannel(channelRoles);
      },
    };
    return;
  }

  const tableName = tableMap[key];
  if (!tableName) return;

  console.log(`[Supabase] Subscribing to realtime updates for ${tableName}...`);

  const channel = supabase
    .channel(`rt-${tableName}`)
    .on("postgres_changes", { event: "*", schema: "public", table: tableName }, (payload: any) => {
      const { eventType, new: newRow, old: oldRow } = payload;
      const camelNew = snakeToCamel(newRow);
      const camelOld = snakeToCamel(oldRow);

      const currentState = useDB.getState();
      const items = [...((currentState[key as keyof SeedShape] || []) as any[])];

      if (eventType === "INSERT") {
        if (!items.some((item) => item.id === camelNew.id)) {
          if (key === "kelas") {
            loadedTables.kelas = false;
            ensureTableLoaded("kelas");
            return;
          }
          if (key === "siswa" && !camelNew.status) {
            camelNew.status = "aktif";
          }
          useDB.setState({ [key]: [...items, camelNew] });
        }
      } else if (eventType === "UPDATE") {
        const index = items.findIndex((item) => item.id === camelNew.id);
        if (index !== -1) {
          if (key === "kelas") {
            loadedTables.kelas = false;
            ensureTableLoaded("kelas");
            return;
          }
          if (key === "siswa" && !camelNew.status) {
            camelNew.status = items[index].status || "aktif";
          }
          items[index] = camelNew;
          useDB.setState({ [key]: items });
        }
      } else if (eventType === "DELETE") {
        const updatedItems = items.filter((item) => item.id !== camelOld.id);
        useDB.setState({ [key]: updatedItems });
      }
    })
    .subscribe();

  activeSubscriptions[key] = { unsubscribe: () => supabase.removeChannel(channel) };
}

// Function to ensure specific database tables are loaded on-demand
export async function ensureTableLoaded(key: string) {
  if (loadedTables[key]) {
    return;
  }

  loadedTables[key] = true;

  try {
    if (key === "users") {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("*"),
      ]);

      const users = (profiles || []).map((p) => {
        const rolePriority = ["admin", "guru", "ortu"];
        const uRoles = roles?.filter((r) => r.user_id === p.id) || [];
        const role = rolePriority.find((r) => uRoles.some((x) => x.role === r)) ?? "ortu";
        return {
          id: p.id,
          name: p.nama,
          email: p.email || "",
          role: role as any,
          phone: p.phone || undefined,
          avatar: p.avatar_url || undefined,
        };
      });

      useDB.setState({ users });
      subscribeToTableRealtime("users");
      return;
    }

    const tableName = tableMap[key];
    if (!tableName) return;

    let query = supabase.from(tableName as any).select("*");

    if (key === "notifikasi" || key === "audit") {
      query = query.order("tanggal", { ascending: false }).limit(50);
    }

    const { data, error } = await query;
    if (error) {
      console.error(`Error loading table ${tableName} from Supabase:`, error);
      loadedTables[key] = false;
      return;
    }

    if (key === "siswa") {
      useDB.setState({
        siswa: (data || []).map((s: any) => ({
          ...snakeToCamel(s),
          status: s.status || "aktif",
        })),
      });
    } else if (key === "kelas") {
      const { data: kelasData } = await supabase.from("kelas").select("*, tahun_ajaran(id, nama)");
      useDB.setState({
        kelas: (kelasData || []).map((c: any) => ({
          id: c.id,
          nama: c.nama,
          tingkat: c.tingkat,
          waliKelasId: c.wali_kelas_id || "",
          tahunAjaran: c.tahun_ajaran?.nama || "2025/2026",
        })),
      });
    } else {
      useDB.setState({
        [key]: snakeToCamel(data || []),
      });
    }

    subscribeToTableRealtime(key);
  } catch (err) {
    console.error(`Failed loading database table ${key}:`, err);
    loadedTables[key] = false;
  }
}

// React Hook for lazy loading tables on page load
export function useLazyLoadTables(keys: string[]) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      await Promise.all(keys.map((k) => ensureTableLoaded(k)));
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [keys]);

  return loading;
}

// Backward-compatible empty hooks to prevent breaking other files
export async function loadAllFromSupabase(realUserId: string, realUserEmail: string) {
  console.log("[Supabase] Legacy loadAllFromSupabase called - NOP. Tables loaded dynamically.");
}

export function subscribeToAllRealtime() {
  // NOP: Subscriptions are made dynamically per table when loaded
}

export function unsubscribeFromAllRealtime() {
  const keys = Object.keys(activeSubscriptions);
  if (keys.length > 0) {
    console.log("[Supabase] Unsubscribing from all realtime table replications...");
    for (const key of keys) {
      activeSubscriptions[key].unsubscribe();
    }
    for (const key of keys) {
      delete activeSubscriptions[key];
    }
  }
}
