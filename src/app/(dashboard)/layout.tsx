import { DashboardHeader } from "@/components/layouts/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <DashboardHeader />
      <main>{children}</main>
    </div>
  );
}
