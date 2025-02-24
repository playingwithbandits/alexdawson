interface AccordionProps {
  children: React.ReactNode;
  type?: "single" | "multiple";
  collapsible?: boolean;
}

export function Accordion({ children }: AccordionProps) {
  return <div className="divide-y divide-gray-200">{children}</div>;
}

export function AccordionItem({
  children,
}: {
  children: React.ReactNode;
  value: string;
}) {
  return <div>{children}</div>;
}

export function AccordionTrigger({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button className={`w-full p-4 text-left hover:bg-gray-50 ${className}`}>
      {children}
    </button>
  );
}

export function AccordionContent({ children }: { children: React.ReactNode }) {
  return <div className="bg-gray-50">{children}</div>;
}
