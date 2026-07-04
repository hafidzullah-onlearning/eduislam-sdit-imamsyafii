export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          aksi: string
          id: string
          ip: string | null
          tanggal: string
          target: string | null
          user_id: string | null
        }
        Insert: {
          aksi: string
          id?: string
          ip?: string | null
          tanggal?: string
          target?: string | null
          user_id?: string | null
        }
        Update: {
          aksi?: string
          id?: string
          ip?: string | null
          tanggal?: string
          target?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      catatan_guru: {
        Row: {
          created_at: string
          guru_id: string | null
          id: string
          isi: string
          siswa_id: string
          tanggal: string
          tipe: Database["public"]["Enums"]["catatan_tipe"]
        }
        Insert: {
          created_at?: string
          guru_id?: string | null
          id?: string
          isi: string
          siswa_id: string
          tanggal?: string
          tipe?: Database["public"]["Enums"]["catatan_tipe"]
        }
        Update: {
          created_at?: string
          guru_id?: string | null
          id?: string
          isi?: string
          siswa_id?: string
          tanggal?: string
          tipe?: Database["public"]["Enums"]["catatan_tipe"]
        }
        Relationships: [
          {
            foreignKeyName: "catatan_guru_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catatan_guru_siswa_id_fkey"
            columns: ["siswa_id"]
            isOneToOne: false
            referencedRelation: "siswa"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice: {
        Row: {
          bulan: string
          created_at: string
          dibayar_pada: string | null
          id: string
          jatuh_tempo: string
          jenis: Database["public"]["Enums"]["invoice_jenis"]
          jumlah: number
          metode: Database["public"]["Enums"]["payment_method"] | null
          referensi: string | null
          siswa_id: string
          status: Database["public"]["Enums"]["invoice_status"]
        }
        Insert: {
          bulan: string
          created_at?: string
          dibayar_pada?: string | null
          id?: string
          jatuh_tempo: string
          jenis?: Database["public"]["Enums"]["invoice_jenis"]
          jumlah: number
          metode?: Database["public"]["Enums"]["payment_method"] | null
          referensi?: string | null
          siswa_id: string
          status?: Database["public"]["Enums"]["invoice_status"]
        }
        Update: {
          bulan?: string
          created_at?: string
          dibayar_pada?: string | null
          id?: string
          jatuh_tempo?: string
          jenis?: Database["public"]["Enums"]["invoice_jenis"]
          jumlah?: number
          metode?: Database["public"]["Enums"]["payment_method"] | null
          referensi?: string | null
          siswa_id?: string
          status?: Database["public"]["Enums"]["invoice_status"]
        }
        Relationships: [
          {
            foreignKeyName: "invoice_siswa_id_fkey"
            columns: ["siswa_id"]
            isOneToOne: false
            referencedRelation: "siswa"
            referencedColumns: ["id"]
          },
        ]
      }
      kelas: {
        Row: {
          created_at: string
          id: string
          nama: string
          tahun_ajaran_id: string | null
          tingkat: number
          wali_kelas_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nama: string
          tahun_ajaran_id?: string | null
          tingkat: number
          wali_kelas_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nama?: string
          tahun_ajaran_id?: string | null
          tingkat?: number
          wali_kelas_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kelas_tahun_ajaran_id_fkey"
            columns: ["tahun_ajaran_id"]
            isOneToOne: false
            referencedRelation: "tahun_ajaran"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kelas_wali_kelas_id_fkey"
            columns: ["wali_kelas_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mapel: {
        Row: {
          created_at: string
          guru_id: string | null
          id: string
          kode: string
          nama: string
        }
        Insert: {
          created_at?: string
          guru_id?: string | null
          id?: string
          kode: string
          nama: string
        }
        Update: {
          created_at?: string
          guru_id?: string | null
          id?: string
          kode?: string
          nama?: string
        }
        Relationships: [
          {
            foreignKeyName: "mapel_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mood: {
        Row: {
          catatan: string | null
          created_at: string
          created_by: string | null
          emoji: Database["public"]["Enums"]["mood_emoji"]
          id: string
          jam_pelajaran: number | null
          siswa_id: string
          sumber: Database["public"]["Enums"]["mood_sumber"]
          tanggal: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          created_by?: string | null
          emoji: Database["public"]["Enums"]["mood_emoji"]
          id?: string
          jam_pelajaran?: number | null
          siswa_id: string
          sumber: Database["public"]["Enums"]["mood_sumber"]
          tanggal?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          created_by?: string | null
          emoji?: Database["public"]["Enums"]["mood_emoji"]
          id?: string
          jam_pelajaran?: number | null
          siswa_id?: string
          sumber?: Database["public"]["Enums"]["mood_sumber"]
          tanggal?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mood_siswa_id_fkey"
            columns: ["siswa_id"]
            isOneToOne: false
            referencedRelation: "siswa"
            referencedColumns: ["id"]
          },
        ]
      }
      nilai: {
        Row: {
          catatan: string | null
          created_at: string
          guru_id: string | null
          id: string
          jenis: Database["public"]["Enums"]["nilai_jenis"]
          kkm: number
          mapel_id: string | null
          nilai: number
          siswa_id: string
          status: Database["public"]["Enums"]["nilai_status"]
          tanggal: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          guru_id?: string | null
          id?: string
          jenis: Database["public"]["Enums"]["nilai_jenis"]
          kkm?: number
          mapel_id?: string | null
          nilai: number
          siswa_id: string
          status?: Database["public"]["Enums"]["nilai_status"]
          tanggal?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          guru_id?: string | null
          id?: string
          jenis?: Database["public"]["Enums"]["nilai_jenis"]
          kkm?: number
          mapel_id?: string | null
          nilai?: number
          siswa_id?: string
          status?: Database["public"]["Enums"]["nilai_status"]
          tanggal?: string
        }
        Relationships: [
          {
            foreignKeyName: "nilai_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nilai_mapel_id_fkey"
            columns: ["mapel_id"]
            isOneToOne: false
            referencedRelation: "mapel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nilai_siswa_id_fkey"
            columns: ["siswa_id"]
            isOneToOne: false
            referencedRelation: "siswa"
            referencedColumns: ["id"]
          },
        ]
      }
      notifikasi: {
        Row: {
          dibaca: boolean
          id: string
          judul: string
          link: string | null
          pesan: string
          tanggal: string
          tipe: Database["public"]["Enums"]["notif_tipe"]
          user_id: string
        }
        Insert: {
          dibaca?: boolean
          id?: string
          judul: string
          link?: string | null
          pesan: string
          tanggal?: string
          tipe?: Database["public"]["Enums"]["notif_tipe"]
          user_id: string
        }
        Update: {
          dibaca?: boolean
          id?: string
          judul?: string
          link?: string | null
          pesan?: string
          tanggal?: string
          tipe?: Database["public"]["Enums"]["notif_tipe"]
          user_id?: string
        }
        Relationships: []
      }
      pengumuman: {
        Row: {
          created_by: string | null
          id: string
          isi: string
          judul: string
          tanggal: string
          target_role: Database["public"]["Enums"]["target_role"]
        }
        Insert: {
          created_by?: string | null
          id?: string
          isi: string
          judul: string
          tanggal?: string
          target_role?: Database["public"]["Enums"]["target_role"]
        }
        Update: {
          created_by?: string | null
          id?: string
          isi?: string
          judul?: string
          tanggal?: string
          target_role?: Database["public"]["Enums"]["target_role"]
        }
        Relationships: [
          {
            foreignKeyName: "pengumuman_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perilaku: {
        Row: {
          aspek: Database["public"]["Enums"]["perilaku_aspek"]
          catatan: string | null
          created_at: string
          guru_id: string | null
          id: string
          siswa_id: string
          skor: number
          tanggal: string
        }
        Insert: {
          aspek: Database["public"]["Enums"]["perilaku_aspek"]
          catatan?: string | null
          created_at?: string
          guru_id?: string | null
          id?: string
          siswa_id: string
          skor: number
          tanggal?: string
        }
        Update: {
          aspek?: Database["public"]["Enums"]["perilaku_aspek"]
          catatan?: string | null
          created_at?: string
          guru_id?: string | null
          id?: string
          siswa_id?: string
          skor?: number
          tanggal?: string
        }
        Relationships: [
          {
            foreignKeyName: "perilaku_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perilaku_siswa_id_fkey"
            columns: ["siswa_id"]
            isOneToOne: false
            referencedRelation: "siswa"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          nama: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          nama?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nama?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      siswa: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          jenis_kelamin: Database["public"]["Enums"]["jenis_kelamin"]
          kelas_id: string | null
          nama: string
          nis: string
          orang_tua_id: string | null
          tanggal_lahir: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          jenis_kelamin?: Database["public"]["Enums"]["jenis_kelamin"]
          kelas_id?: string | null
          nama: string
          nis: string
          orang_tua_id?: string | null
          tanggal_lahir?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          jenis_kelamin?: Database["public"]["Enums"]["jenis_kelamin"]
          kelas_id?: string | null
          nama?: string
          nis?: string
          orang_tua_id?: string | null
          tanggal_lahir?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "siswa_kelas_id_fkey"
            columns: ["kelas_id"]
            isOneToOne: false
            referencedRelation: "kelas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "siswa_orang_tua_id_fkey"
            columns: ["orang_tua_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spp_tarif: {
        Row: {
          created_at: string
          id: string
          jumlah: number
          tahun_ajaran_id: string | null
          tingkat: number
        }
        Insert: {
          created_at?: string
          id?: string
          jumlah: number
          tahun_ajaran_id?: string | null
          tingkat: number
        }
        Update: {
          created_at?: string
          id?: string
          jumlah?: number
          tahun_ajaran_id?: string | null
          tingkat?: number
        }
        Relationships: [
          {
            foreignKeyName: "spp_tarif_tahun_ajaran_id_fkey"
            columns: ["tahun_ajaran_id"]
            isOneToOne: false
            referencedRelation: "tahun_ajaran"
            referencedColumns: ["id"]
          },
        ]
      }
      tahfidz: {
        Row: {
          ayat_dari: number
          ayat_sampai: number
          catatan: string | null
          created_at: string
          guru_id: string | null
          id: string
          siswa_id: string
          status: Database["public"]["Enums"]["tahfidz_status"]
          surah: string
          tanggal: string
          target: string | null
        }
        Insert: {
          ayat_dari: number
          ayat_sampai: number
          catatan?: string | null
          created_at?: string
          guru_id?: string | null
          id?: string
          siswa_id: string
          status?: Database["public"]["Enums"]["tahfidz_status"]
          surah: string
          tanggal?: string
          target?: string | null
        }
        Update: {
          ayat_dari?: number
          ayat_sampai?: number
          catatan?: string | null
          created_at?: string
          guru_id?: string | null
          id?: string
          siswa_id?: string
          status?: Database["public"]["Enums"]["tahfidz_status"]
          surah?: string
          tanggal?: string
          target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tahfidz_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tahfidz_siswa_id_fkey"
            columns: ["siswa_id"]
            isOneToOne: false
            referencedRelation: "siswa"
            referencedColumns: ["id"]
          },
        ]
      }
      tahun_ajaran: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          nama: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id?: string
          nama: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          nama?: string
        }
        Relationships: []
      }
      tugas: {
        Row: {
          attachment_url: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          deskripsi: string | null
          id: string
          judul: string
          kelas_id: string | null
          link_url: string | null
          mapel_id: string | null
          status: Database["public"]["Enums"]["tugas_status"]
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          deskripsi?: string | null
          id?: string
          judul: string
          kelas_id?: string | null
          link_url?: string | null
          mapel_id?: string | null
          status?: Database["public"]["Enums"]["tugas_status"]
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          deskripsi?: string | null
          id?: string
          judul?: string
          kelas_id?: string | null
          link_url?: string | null
          mapel_id?: string | null
          status?: Database["public"]["Enums"]["tugas_status"]
        }
        Relationships: [
          {
            foreignKeyName: "tugas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tugas_kelas_id_fkey"
            columns: ["kelas_id"]
            isOneToOne: false
            referencedRelation: "kelas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tugas_mapel_id_fkey"
            columns: ["mapel_id"]
            isOneToOne: false
            referencedRelation: "mapel"
            referencedColumns: ["id"]
          },
        ]
      }
      tugas_submission: {
        Row: {
          bukti_url: string | null
          id: string
          komentar_guru: string | null
          komentar_ortu: string | null
          siswa_id: string
          status: Database["public"]["Enums"]["submission_status"]
          tugas_id: string
          updated_at: string
        }
        Insert: {
          bukti_url?: string | null
          id?: string
          komentar_guru?: string | null
          komentar_ortu?: string | null
          siswa_id: string
          status?: Database["public"]["Enums"]["submission_status"]
          tugas_id: string
          updated_at?: string
        }
        Update: {
          bukti_url?: string | null
          id?: string
          komentar_guru?: string | null
          komentar_ortu?: string | null
          siswa_id?: string
          status?: Database["public"]["Enums"]["submission_status"]
          tugas_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tugas_submission_siswa_id_fkey"
            columns: ["siswa_id"]
            isOneToOne: false
            referencedRelation: "siswa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tugas_submission_tugas_id_fkey"
            columns: ["tugas_id"]
            isOneToOne: false
            referencedRelation: "tugas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      guru_of_siswa: { Args: { _siswa_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "guru" | "ortu"
      catatan_tipe: "positif" | "perlu-perhatian" | "info"
      invoice_jenis: "spp" | "buku" | "seragam" | "kegiatan"
      invoice_status: "belum-bayar" | "menunggu" | "lunas" | "terlambat"
      jenis_kelamin: "L" | "P"
      mood_emoji: "senang" | "biasa" | "bosan" | "sedih" | "marah"
      mood_sumber: "sekolah" | "rumah"
      nilai_jenis: "harian" | "uts" | "uas" | "tugas"
      nilai_status: "draft" | "published"
      notif_tipe: "tugas" | "mood" | "nilai" | "tahfidz" | "spp" | "info"
      payment_method:
        | "va-bca"
        | "va-mandiri"
        | "qris"
        | "gopay"
        | "ovo"
        | "dana"
        | "kartu-kredit"
      perilaku_aspek: "karakter-islami" | "disiplin" | "keaktifan" | "kerjasama"
      submission_status: "belum" | "dikerjakan" | "diperiksa" | "selesai"
      tahfidz_status: "lancar" | "perlu-mengulang" | "belum-dinilai"
      target_role: "admin" | "guru" | "ortu" | "semua"
      tugas_status: "aktif" | "selesai" | "arsip"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "guru", "ortu"],
      catatan_tipe: ["positif", "perlu-perhatian", "info"],
      invoice_jenis: ["spp", "buku", "seragam", "kegiatan"],
      invoice_status: ["belum-bayar", "menunggu", "lunas", "terlambat"],
      jenis_kelamin: ["L", "P"],
      mood_emoji: ["senang", "biasa", "bosan", "sedih", "marah"],
      mood_sumber: ["sekolah", "rumah"],
      nilai_jenis: ["harian", "uts", "uas", "tugas"],
      nilai_status: ["draft", "published"],
      notif_tipe: ["tugas", "mood", "nilai", "tahfidz", "spp", "info"],
      payment_method: [
        "va-bca",
        "va-mandiri",
        "qris",
        "gopay",
        "ovo",
        "dana",
        "kartu-kredit",
      ],
      perilaku_aspek: ["karakter-islami", "disiplin", "keaktifan", "kerjasama"],
      submission_status: ["belum", "dikerjakan", "diperiksa", "selesai"],
      tahfidz_status: ["lancar", "perlu-mengulang", "belum-dinilai"],
      target_role: ["admin", "guru", "ortu", "semua"],
      tugas_status: ["aktif", "selesai", "arsip"],
    },
  },
} as const
