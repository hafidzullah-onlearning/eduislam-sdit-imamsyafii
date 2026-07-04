import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Bell, LogOut, Moon, Search, Sun, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB } from "@/lib/mock-store";

const SEARCH_TARGETS = [
  { label: "Dashboard", to: "/app/dashboard" },
  { label: "Tugas", to: "/app/tugas" },
  { label: "Tahfidz", to: "/app/tahfidz" },
  { label: "Nilai & Rapor", to: "/app/nilai" },
  { label: "Mood", to: "/app/mood" },
  { label: "SPP & Tagihan", to: "/app/spp" },
  { label: "Notifikasi", to: "/app/notifikasi" },
  { label: "Profil", to: "/app/profil" },
  { label: "Pengaturan", to: "/app/pengaturan" },
];

export function Topbar() {
  const { user, signOut, session } = useAuth();
  const notifs = useDB((s) => s.notifikasi);
  const unread = notifs.filter((n) => n.role === session?.role && !n.dibaca).length;
  const [dark, setDark] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const d = saved === "dark";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpenSearch((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/85 px-3 backdrop-blur-md md:px-4">
        <SidebarTrigger className="shrink-0" />
        <button
          onClick={() => setOpenSearch(true)}
          className="ml-1 hidden max-w-md flex-1 items-center gap-2 rounded-full border border-border/60 bg-surface-soft/60 px-3.5 py-1.5 text-left text-sm text-muted-foreground transition hover:bg-surface-soft md:flex"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 truncate">Cari halaman, siswa, tagihan…</span>
          <kbd className="rounded bg-background px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-sm">
            ⌘K
          </kbd>
        </button>
        <div className="flex-1 md:hidden" />
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Ubah tema">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link to="/app/notifikasi" className="relative">
            <Button variant="ghost" size="icon" aria-label="Notifikasi">
              <Bell className="h-4 w-4" />
            </Button>
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                {unread}
              </span>
            )}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 flex items-center gap-2 rounded-full border border-border/60 bg-surface-soft/60 px-1 py-1 pr-3 transition hover:bg-surface-soft">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-emerald text-xs font-bold text-primary-foreground">
                  {user?.name?.[0] ?? "U"}
                </span>
                <span className="hidden max-w-[140px] truncate text-sm font-medium md:inline">
                  {user?.name?.split(" ")[0]}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/app/profil" })}>
                <UserIcon className="mr-2 h-4 w-4" /> Profil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  signOut();
                  router.navigate({ to: "/app/login", replace: true });
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
        <CommandInput placeholder="Cari halaman atau menu…" />
        <CommandList>
          <CommandEmpty>Tidak ada hasil.</CommandEmpty>
          <CommandGroup heading="Navigasi">
            {SEARCH_TARGETS.map((t) => (
              <CommandItem
                key={t.to}
                onSelect={() => {
                  setOpenSearch(false);
                  navigate({ to: t.to });
                }}
              >
                {t.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
