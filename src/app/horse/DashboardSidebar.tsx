"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { FaPlus } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";

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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-background border"
      >
        {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r",
          "transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="space-y-4 py-4 pt-16">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Race Dates
            </h2>
            <div className="space-y-1">
              {allDates.map(({ date, display }) => {
                const isCached = cachedDates.has(date);
                return (
                  <Link
                    key={date}
                    href={`/horse/${date}`}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "w-full justify-between font-normal",
                      "flex items-center py-2 px-4 hover:bg-accent hover:text-accent-foreground",
                      "rounded-md text-sm",
                      !isCached && "text-primary",
                      pathname === `/horse/${date}` &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    {display}
                    {!isCached && <FaPlus className="inline ml-2" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
