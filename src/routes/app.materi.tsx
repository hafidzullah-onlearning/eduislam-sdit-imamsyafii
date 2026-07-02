import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { EmptyState } from "@/components/app/common/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/materi")({ component: () => (
  <div className="space-y-6">
    <PageHeader title="Materi Pembelajaran" description="Bagikan materi, video, dan bahan bacaan ke siswa." actions={<Button>+ Materi baru</Button>} />
    <EmptyState icon={BookOpen} title="Belum ada materi" description="Buat materi pertama Anda dan bagikan ke kelas." />
  </div>
) });
