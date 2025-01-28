interface ViewToggleProps {
  view: "list" | "table";
  onViewChange: (view: "list" | "table") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  const handleTableClick = () => {
    console.log("Clicking table view");
    onViewChange("table");
  };

  const handleListClick = () => {
    console.log("Clicking list view");
    onViewChange("list");
  };

  return (
    <div className="control-group">
      <label>View:</label>
      <div className="button-group">
        <button
          className={`control-button ${view === "table" ? "active" : ""}`}
          onClick={handleTableClick}
        >
          <i className="fas fa-table"></i>
          Table
        </button>
        <button
          className={`control-button ${view === "list" ? "active" : ""}`}
          onClick={handleListClick}
        >
          <i className="fas fa-list"></i>
          List
        </button>
      </div>
    </div>
  );
}
