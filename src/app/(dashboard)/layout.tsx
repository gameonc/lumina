import { SimpleHeader } from "@/components/layouts/simple-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <SimpleHeader />
      <main>{children}</main>
    </div>
  );
}
