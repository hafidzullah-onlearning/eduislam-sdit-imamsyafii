import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  BookMarked,
  Smile,
  Award,
  Bell,
  Settings,
  User,
  HelpCircle,
  Wallet,
  Baby,
  MessageSquare,
  School,
  Layers,
  CalendarDays,
  Megaphone,
  Shield,
  BarChart3,
  Heart,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth/mock-auth";
import { cn } from "@/lib/utils";

type NavItem = { title: string; url: string; icon: typeof LayoutDashboard };

const navGuru: { label: string; items: NavItem[] }[] = [
  {
    label: "Utama",
    items: [
      { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
      { title: "Kelas Saya", url: "/app/kelas", icon: School },
      { title: "Siswa", url: "/app/siswa", icon: Users },
    ],
  },
  {
    label: "Pembelajaran",
    items: [
      { title: "Tugas", url: "/app/tugas", icon: ClipboardList },
      { title: "Materi", url: "/app/materi", icon: BookOpen },
      { title: "Nilai", url: "/app/nilai", icon: Award },
    ],
  },
  {
    label: "Karakter",
    items: [
      { title: "Tahfidz", url: "/app/tahfidz", icon: BookMarked },
      { title: "Mood Siswa", url: "/app/mood", icon: Smile },
      { title: "Perilaku", url: "/app/perilaku", icon: Heart },
      { title: "Laporan", url: "/app/laporan", icon: BarChart3 },
    ],
  },
];

const navOrtu: { label: string; items: NavItem[] }[] = [
  {
    label: "Anak Saya",
    items: [
      { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
      { title: "Daftar Anak", url: "/app/anak", icon: Baby },
      { title: "Tugas", url: "/app/tugas", icon: ClipboardList },
      { title: "Tahfidz", url: "/app/tahfidz", icon: BookMarked },
      { title: "Nilai & Rapor", url: "/app/nilai", icon: Award },
    ],
  },
  {
    label: "Kesejahteraan",
    items: [
      { title: "Mood Anak", url: "/app/mood", icon: Smile },
      { title: "Catatan Guru", url: "/app/catatan", icon: MessageSquare },
    ],
  },
  {
    label: "Keuangan",
    items: [{ title: "SPP & Tagihan", url: "/app/spp", icon: Wallet }],
  },
];

const navAdmin: { label: string; items: NavItem[] }[] = [
  {
    label: "Utama",
    items: [{ title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Master Data",
    items: [
      { title: "User", url: "/app/admin/users", icon: Users },
      { title: "Kelas", url: "/app/admin/kelas", icon: School },
      { title: "Mata Pelajaran", url: "/app/admin/mapel", icon: BookOpen },
      { title: "Tahun Ajaran", url: "/app/admin/tahun-ajaran", icon: CalendarDays },
    ],
  },
  {
    label: "Keuangan",
    items: [
      { title: "Tarif SPP", url: "/app/admin/spp", icon: Layers },
      { title: "Pembayaran", url: "/app/admin/pembayaran", icon: Wallet },
    ],
  },
  {
    label: "Komunikasi",
    items: [
      { title: "Pengumuman", url: "/app/admin/pengumuman", icon: Megaphone },
      { title: "Audit Log", url: "/app/admin/audit-log", icon: Shield },
    ],
  },
];

const navFooter: NavItem[] = [
  { title: "Notifikasi", url: "/app/notifikasi", icon: Bell },
  { title: "Profil", url: "/app/profil", icon: User },
  { title: "Pengaturan", url: "/app/pengaturan", icon: Settings },
  { title: "Bantuan", url: "/app/bantuan", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { session } = useAuth();
  const role = session?.role ?? "ortu";

  const groups = role === "guru" ? navGuru : role === "admin" ? navAdmin : navOrtu;
  const isActive = (url: string) =>
    pathname === url || (url !== "/app/dashboard" && pathname.startsWith(url));

  const roleLabel = { guru: "Portal Guru", ortu: "Portal Orang Tua", admin: "Portal Admin" }[role];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/app/dashboard" className="flex items-center gap-2.5 px-1 py-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-emerald shadow-glow-emerald">
            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold tracking-tight">EduIslam Connect</p>
              <p className="truncate text-[11px] text-muted-foreground">{roleLabel}</p>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((it) => (
                  <SidebarMenuItem key={it.url}>
                    <SidebarMenuButton asChild isActive={isActive(it.url)}>
                      <Link to={it.url} className={cn("flex items-center gap-2")}>
                        <it.icon className="h-4 w-4" />
                        {!collapsed && <span>{it.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarGroup>
          <SidebarGroupLabel>Akun</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navFooter.map((it) => (
                <SidebarMenuItem key={it.url}>
                  <SidebarMenuButton asChild isActive={isActive(it.url)}>
                    <Link to={it.url} className="flex items-center gap-2">
                      <it.icon className="h-4 w-4" />
                      {!collapsed && <span>{it.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
