import { useExpansion } from "../context/ExpansionContext";

export function ExpandAllToggle() {
  const { expandAll, toggleExpandAll } = useExpansion();

  return (
    <button
      className="expand-all-button"
      onClick={toggleExpandAll}
      aria-label={expandAll ? "Collapse all" : "Expand all"}
    >
      <i className={`fas fa-chevron-${expandAll ? "up" : "down"}`} />
      {expandAll ? "Collapse All" : "Expand All"}
    </button>
  );
}
