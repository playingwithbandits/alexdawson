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
          className="fixed top-4 left-4 z-50 px-4 py-2 rounded-lg bg-gray-800 
            text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2
            border border-gray-700 shadow-lg"
          onClick={toggle}
          aria-label="Toggle menu"
        >
          <span>Race Dates</span>
          <i className="fas fa-chevron-right text-sm opacity-75"></i>
        </button>
      )}

      <aside
        className={`dashboard-sidebar transition-transform duration-300 
          fixed top-0 left-0 h-full w-64 bg-gray-900 shadow-xl 
          transform ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {sidebar}
      </aside>
      <main
        className={`dashboard-content transition-all duration-300 min-h-screen 
          ${isOpen ? "ml-64" : "ml-0"}`}
      >
        {content}
      </main>
    </div>
  );
}
