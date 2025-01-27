"use client";

import { useInView } from "@/hooks/useInView";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

export function Section({ children, id, className = "" }: SectionProps) {
  const { ref, isInView } = useInView();

  return (
    <section
      ref={ref}
      id={id}
      className={`fade-section ${isInView ? "is-visible" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
