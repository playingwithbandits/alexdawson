interface AccordionButtonProps {
  isExpanded: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function AccordionButton({
  isExpanded,
  onClick,
  children,
}: AccordionButtonProps) {
  return (
    <button
      className={`race-time-button ${isExpanded ? "expanded" : ""}`}
      onClick={onClick}
    >
      {children}
      <i className={`fas fa-chevron-${isExpanded ? "up" : "down"}`} />
    </button>
  );
}
