"use client";

import { ReactNode } from "react";
import { useSidebarStore } from "@/store/useSidebarStore";

interface DashboardLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
}

export function DashboardLayout({ sidebar, content }: DashboardLayoutProps) {
  const { isOpen, toggle } = useSidebarStore();

  return (
    <div className="dashboard-container">
      {!isOpen && (
        <button
          className={`mobile-sidebar-toggle ${isOpen ? "open" : ""}`}
          onClick={toggle}
          aria-label="Toggle menu"
        >
          <span>Race Dates</span>
          <i className="fas fa-chevron-right ml-1"></i>
        </button>
      )}

      <aside className={`dashboard-sidebar ${isOpen ? "open" : ""}`}>
        {sidebar}
      </aside>
      <main className="dashboard-content">{content}</main>
    </div>
  );
}
