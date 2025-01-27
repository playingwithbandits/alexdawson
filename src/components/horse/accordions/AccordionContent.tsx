interface AccordionContentProps {
  isExpanded: boolean;
  children: React.ReactNode;
}

export function AccordionContent({
  isExpanded,
  children,
}: AccordionContentProps) {
  return (
    <div className={`predictions-list ${isExpanded ? "expanded" : ""}`}>
      {children}
    </div>
  );
}
