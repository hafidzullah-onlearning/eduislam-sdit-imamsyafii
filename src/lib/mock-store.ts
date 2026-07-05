import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { seed, type SeedShape } from "@/mocks/seed";
import { supabase } from "@/integrations/supabase/client";

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
export function toUuid(id: string): string {
  if (!id) return id;
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
  patch: <K extends keyof SeedShape>(key: K, updater: (items: SeedShape[K]) => SeedShape[K]) => void;
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

        // Update local Zustand state immediately for fast UI feedback
        set((state) => ({ ...state, [key]: newItems }));

        // Sync changes to Supabase database asynchronously
        if (key === "users") {
          (async () => {
            try {
              // 1. Detect Inserts
              const added = newItems.filter((item) => !oldItems.some((old) => old.id === item.id));
              for (const item of added) {
                const userId = toUuid(item.id);
                // Insert into profiles
                const { error: pErr } = await supabase.from("profiles").insert([{
                  id: userId,
                  nama: item.name,
                  email: item.email || null,
                  phone: item.phone || null,
                  avatar_url: item.avatar || null
                }]);
                if (pErr) console.error("Error inserting profile:", pErr);

                // Insert into user_roles
                const { error: rErr } = await supabase.from("user_roles").insert([{
                  user_id: userId,
                  role: item.role
                }]);
                if (rErr) console.error("Error inserting user role:", rErr);
              }

              // 2. Detect Updates
              const updated = newItems.filter((item) => {
                const old = oldItems.find((o) => o.id === item.id);
                if (!old) return false;
                return JSON.stringify(old) !== JSON.stringify(item);
              });
              for (const item of updated) {
                const userId = toUuid(item.id);
                const { error: pErr } = await supabase.from("profiles").update({
                  nama: item.name,
                  email: item.email || null,
                  phone: item.phone || null,
                  avatar_url: item.avatar || null
                }).eq("id", userId);
                if (pErr) console.error("Error updating profile:", pErr);

                const { error: rErr } = await supabase.from("user_roles").upsert({
                  user_id: userId,
                  role: item.role
                }, { onConflict: "user_id,role" });
                if (rErr) console.error("Error upserting user role:", rErr);
              }

              // 3. Detect Deletions
              const deleted = oldItems.filter((item) => !newItems.some((n) => n.id === item.id));
              for (const item of deleted) {
                const userId = toUuid(item.id);
                await supabase.from("user_roles").delete().eq("user_id", userId);
                await supabase.from("profiles").delete().eq("id", userId);
              }
            } catch (e) {
              console.error("Sync error on users patch:", e);
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
            for (const item of added) {
              const mapped = camelToSnake(item);
              if (key === "kelas") {
                mapped.tahun_ajaran_id = toUuid("ta-" + item.tahunAjaran);
                delete mapped.tahun_ajaran;
              }
              if (key === "sppTarif") {
                mapped.tahun_ajaran_id = toUuid(item.tahunAjaranId);
              }
              if (key === "siswa") {
                delete mapped.status;
              }
              const { error } = await supabase.from(tableName).insert([mapped]);
              if (error) console.error(`Error inserting to ${tableName}:`, error);
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
                mapped.tahun_ajaran_id = toUuid("ta-" + item.tahunAjaran);
                delete mapped.tahun_ajaran;
              }
              if (key === "sppTarif") {
                mapped.tahun_ajaran_id = toUuid(item.tahunAjaranId);
              }
              if (key === "siswa") {
                delete mapped.status;
              }
              const { error } = await supabase.from(tableName).update(mapped).eq("id", toUuid(item.id));
              if (error) console.error(`Error updating in ${tableName}:`, error);
            }

            // 3. Detect Deletions
            const deleted = oldItems.filter((item) => !newItems.some((n) => n.id === item.id));
            for (const item of deleted) {
              const { error } = await supabase.from(tableName).delete().eq("id", toUuid(item.id));
              if (error) console.error(`Error deleting from ${tableName}:`, error);
            }
          } catch (e) {
            console.error(`Sync error on patch ${key}:`, e);
          }
        })();
      },
    }),
    {
      name: "eduislam-mock-db-v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage))),
    },
  ),
);

export function genId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

let tahunAjaranCache: { id: string; nama: string }[] = [];
let activeSubscriptions: any[] = [];

// Map seed item references safely to prevent foreign key errors
function mapSeedItem(item: any, realUserId: string, realUserEmail: string): any {
  let loggedInSeedId = "u-ortu-1";
  const emailLower = (realUserEmail || "").toLowerCase().trim();
  if (emailLower === "aisyah@sdit.sch.id") loggedInSeedId = "u-guru-1";
  else if (emailLower === "ahmad@sdit.sch.id") loggedInSeedId = "u-guru-2";
  else if (emailLower === "ridho@keluarga.id") loggedInSeedId = "u-ortu-1";
  else if (emailLower === "salma@keluarga.id") loggedInSeedId = "u-ortu-2";
  else if (emailLower === "admin@sdit.sch.id" || emailLower === "hafidzullah.a@gmail.com") loggedInSeedId = "u-admin-1";

  const mapped = JSON.parse(JSON.stringify(item));

  const mapValue = (val: any, key?: string): any => {
    if (typeof val === "string") {
      if (val === loggedInSeedId) {
        return realUserId;
      }
      if (val.startsWith("u-")) {
        return null; // Set other users to null to prevent foreign key constraint fails
      }
      return toUuid(val);
    }
    if (Array.isArray(val)) {
      return val.map((x) => mapValue(x, key));
    }
    if (val !== null && typeof val === "object") {
      const res: any = {};
      for (const k of Object.keys(val)) {
        res[k] = mapValue(val[k], k);
      }
      return res;
    }
    return val;
  };

  return mapValue(mapped);
}

// Seed live Supabase database with converted mock records
async function seedSupabaseDatabase(realUserId: string, realUserEmail: string) {
  console.log("[Supabase] Seeding database with converted mock records...");
  try {
    const mapAndConvert = (arr: any[], key: string) => {
      return arr.map((item) => {
        const mapped = mapSeedItem(item, realUserId, realUserEmail);
        const dbObj = camelToSnake(mapped);
        if (key === "kelas") {
          dbObj.tahun_ajaran_id = toUuid("ta-" + item.tahunAjaran);
          delete dbObj.tahun_ajaran;
        }
        if (key === "sppTarif") {
          dbObj.tahun_ajaran_id = toUuid(item.tahunAjaranId);
        }
        if (key === "notifikasi") {
          dbObj.user_id = realUserId;
        }
        return dbObj;
      });
    };

    await supabase.from("tahun_ajaran").upsert(mapAndConvert(seed.tahunAjaran, "tahunAjaran"));
    await supabase.from("spp_tarif").upsert(mapAndConvert(seed.sppTarif, "sppTarif"));
    await supabase.from("mapel").upsert(mapAndConvert(seed.mapel, "mapel"));
    await supabase.from("kelas").upsert(mapAndConvert(seed.kelas, "kelas"));
    await supabase.from("siswa").upsert(mapAndConvert(seed.siswa, "siswa"));
    await supabase.from("tugas").upsert(mapAndConvert(seed.tugas, "tugas"));
    await supabase.from("tugas_submission").upsert(mapAndConvert(seed.submissions, "submissions"));
    await supabase.from("tahfidz").upsert(mapAndConvert(seed.tahfidz, "tahfidz"));
    await supabase.from("nilai").upsert(mapAndConvert(seed.nilai, "nilai"));
    await supabase.from("mood").upsert(mapAndConvert(seed.mood, "mood"));
    await supabase.from("perilaku").upsert(mapAndConvert(seed.perilaku, "perilaku"));
    await supabase.from("invoice").upsert(mapAndConvert(seed.invoice, "invoice"));
    await supabase.from("notifikasi").upsert(mapAndConvert(seed.notifikasi, "notifikasi"));
    await supabase.from("pengumuman").upsert(mapAndConvert(seed.pengumuman, "pengumuman"));
    await supabase.from("catatan_guru").upsert(mapAndConvert(seed.catatan, "catatan"));
    await supabase.from("audit_log").upsert(mapAndConvert(seed.audit, "audit"));

    console.log("[Supabase] Database seeding completed successfully.");
  } catch (e) {
    console.error("[Supabase] Seeding error:", e);
  }
}

// Load all tables from Supabase into Zustand store
export async function loadAllFromSupabase(realUserId: string, realUserEmail: string) {
  console.log("[Supabase] Fetching database state...");

  // Cache tahun_ajaran records for kelas mapper
  const { data: taData } = await supabase.from("tahun_ajaran").select("id, nama");
  tahunAjaranCache = taData || [];

  // Check if siswa table is empty; if so, seed the database first
  const { count } = await supabase.from("siswa").select("*", { count: "exact", head: true });
  if (count === 0 || count === null) {
    await seedSupabaseDatabase(realUserId, realUserEmail);
  }

  // Fetch all tables in parallel
  const [
    { data: profiles },
    { data: roles },
    { data: siswa },
    { data: kelas },
    { data: mapel },
    { data: tugas },
    { data: submissions },
    { data: tahfidz },
    { data: nilai },
    { data: mood },
    { data: perilaku },
    { data: invoice },
    { data: notifikasi },
    { data: pengumuman },
    { data: catatan },
    { data: audit },
    { data: tahunAjaran },
    { data: sppTarif },
  ] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("user_roles").select("*"),
    supabase.from("siswa").select("*"),
    supabase.from("kelas").select("*, tahun_ajaran(id, nama)"),
    supabase.from("mapel").select("*"),
    supabase.from("tugas").select("*"),
    supabase.from("tugas_submission").select("*"),
    supabase.from("tahfidz").select("*"),
    supabase.from("nilai").select("*"),
    supabase.from("mood").select("*"),
    supabase.from("perilaku").select("*"),
    supabase.from("invoice").select("*"),
    supabase.from("notifikasi").select("*"),
    supabase.from("pengumuman").select("*"),
    supabase.from("catatan_guru").select("*"),
    supabase.from("audit_log").select("*"),
    supabase.from("tahun_ajaran").select("*"),
    supabase.from("spp_tarif").select("*"),
  ]);

  // Map profiles and roles to users
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

  // Hydrate the Zustand store
  useDB.setState({
    users,
    siswa: (siswa || []).map((s) => ({
      ...snakeToCamel(s),
      status: s.status || "aktif",
    })),
    kelas: (kelas || []).map((c) => ({
      id: c.id,
      nama: c.nama,
      tingkat: c.tingkat,
      waliKelasId: c.wali_kelas_id,
      tahunAjaran: c.tahun_ajaran?.nama || "2025/2026",
    })),
    mapel: snakeToCamel(mapel || []),
    tugas: snakeToCamel(tugas || []),
    submissions: snakeToCamel(submissions || []),
    tahfidz: snakeToCamel(tahfidz || []),
    nilai: snakeToCamel(nilai || []),
    mood: snakeToCamel(mood || []),
    perilaku: snakeToCamel(perilaku || []),
    invoice: snakeToCamel(invoice || []),
    notifikasi: snakeToCamel(notifikasi || []),
    pengumuman: snakeToCamel(pengumuman || []),
    catatan: snakeToCamel(catatan || []),
    audit: snakeToCamel(audit || []),
    tahunAjaran: snakeToCamel(tahunAjaran || []),
    sppTarif: snakeToCamel(sppTarif || []),
  });

  console.log("[Supabase] Zustand store successfully hydrated from database.");
}

// Subcribe to all Supabase channels for live real-time synchronization
export function subscribeToAllRealtime() {
  unsubscribeFromAllRealtime();
  console.log("[Supabase] Subscribing to real-time table replication...");

  const tables = Object.keys(tableMap);

  for (const key of tables) {
    const tableName = tableMap[key];
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
              const ta = tahunAjaranCache.find((x) => x.id === camelNew.tahunAjaranId);
              camelNew.tahunAjaran = ta ? ta.nama : "2025/2026";
              delete camelNew.tahunAjaranId;
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
              const ta = tahunAjaranCache.find((x) => x.id === camelNew.tahunAjaranId);
              camelNew.tahunAjaran = ta ? ta.nama : "2025/2026";
              delete camelNew.tahunAjaranId;
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

    activeSubscriptions.push(channel);
  }
}

// Clean up all active real-time channels
export function unsubscribeFromAllRealtime() {
  if (activeSubscriptions.length > 0) {
    console.log("[Supabase] Unsubscribing from real-time table replication...");
    for (const channel of activeSubscriptions) {
      supabase.removeChannel(channel);
    }
    activeSubscriptions = [];
  }
}
