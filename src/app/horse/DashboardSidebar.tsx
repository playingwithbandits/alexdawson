"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { FaPlus } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { HiHome } from "react-icons/hi2";

export function DashboardSidebar() {
  const [allDates, setAllDates] = useState<
    Array<{ date: string; display: string }>
  >([]);
  const [cachedDates, setCachedDates] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const formatDate = (date: Date) => format(date, "yyyy-MM-dd");
  const today = useMemo(() => formatDate(new Date()), []);
  const tomorrow = useMemo(() => formatDate(addDays(new Date(), 1)), []);

  useEffect(() => {
    async function getCachedDates() {
      try {
        const response = await fetch("/api/racing/dates");
        const cachedDates: string[] = await response.json();
        const cachedSet = new Set(cachedDates);
        setCachedDates(cachedSet);

        const dates = [
          ...(!cachedSet.has(today) ? [{ date: today, display: "Today" }] : []),
          ...(!cachedSet.has(tomorrow)
            ? [{ date: tomorrow, display: "Tomorrow" }]
            : []),
          ...cachedDates.map((date) => ({
            date,
            display: format(new Date(date), "EEE, MMM d"),
          })),
        ];

        setAllDates(dates.sort((a, b) => b.date.localeCompare(a.date)));
      } catch (error) {
        console.error("Error getting cached dates:", error);
      }
    }

    getCachedDates();
  }, [today, tomorrow]);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 px-4 py-2 rounded-lg bg-gray-800 
            text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2
            border border-gray-700 shadow-lg"
          aria-label="Open menu"
        >
          <span>Race Dates</span>
          <HiMenu className="w-5 h-5" />
        </button>
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800",
          "transform transition-transform duration-300 ease-in-out shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-1">
              Race Dates
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-200 
                hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-[1rem]">
            <Link
              href="/horse"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 transition-colors",
                pathname === "/horse"
                  ? "bg-blue-500/10 border-l-4 border-blue-500 text-blue-400"
                  : "text-gray-300 hover:bg-gray-800 border-l-4 border-transparent"
              )}
            >
              <HiHome className="w-5 h-5" />
              <span>Overview</span>
            </Link>

            <div className="my-4 px-4">
              <div className="border-t border-gray-800" />
            </div>

            <div className="space-y-1">
              {allDates.map(({ date, display }) => {
                const isCached = cachedDates.has(date);
                return (
                  <Link
                    key={date}
                    href={`/horse/${date}`}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-2 transition-colors",

                      pathname === `/horse/${date}/`
                        ? "bg-blue-500/10 border-l-4 border-blue-500 text-blue-400"
                        : "text-gray-300 hover:bg-gray-800 border-l-4 border-transparent",
                      !isCached && "opacity-30"
                    )}
                  >
                    <span>{display}</span>
                    {!isCached && <FaPlus className="w-3 h-3 opacity-75" />}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-gray-800">
            <div className="text-sm text-gray-400">
              <i className="fas fa-code-branch mr-2"></i>
              Version 1.0.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
