import { createFileRoute, Outlet, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/layout/AppSidebar";
import { Topbar } from "@/components/app/layout/Topbar";
import { useAuth } from "@/lib/auth/mock-auth";

const PUBLIC_APP_ROUTES = ["/app/login", "/app/forgot-password", "/app/reset-password"];

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const router = useRouter();
  const { session, ready } = useAuth();
  const isPublic = PUBLIC_APP_ROUTES.includes(pathname);

  useEffect(() => {
    if (!ready) return;
    if (!session && !isPublic) {
      router.navigate({ to: "/app/login", replace: true });
    } else if (session && isPublic) {
      router.navigate({ to: "/app/dashboard", replace: true });
    } else if (session && pathname.startsWith("/app/admin") && session.role !== "admin") {
      router.navigate({ to: "/app/dashboard", replace: true });
    }
  }, [ready, session, isPublic, pathname, router]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isPublic) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Outlet />
      </div>
    );
  }

  if (!session) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-surface-soft/40">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
