import { useExpansion } from "../context/ExpansionContext";

export function ExpandAllToggle() {
  const { expandAll, toggleExpandAll } = useExpansion();

  return (
    <button
      className="expand-all-button"
      onClick={toggleExpandAll}
      aria-label={"All"}
    >
      <i className={`fas fa-chevron-${expandAll ? "up" : "down"}`} />
      All
    </button>
  );
}
