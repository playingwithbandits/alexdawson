import { DashboardSidebar } from "./DashboardSidebar";

export default function HorseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto p-4">{children}</main>
    </div>
  );
}
