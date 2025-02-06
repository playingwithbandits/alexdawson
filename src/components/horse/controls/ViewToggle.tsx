import { Table2, List, LayoutList } from "lucide-react";

interface ViewToggleProps {
  view: "list" | "table" | "compact" | "detailed";
  onViewChange: (view: "list" | "table" | "compact" | "detailed") => void;
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
    <div className="inline-flex rounded-md shadow-sm" role="group">
      <button
        className={`inline-flex items-center px-4 py-2 text-sm font-medium border ${
          view === "table"
            ? "bg-blue-50 text-blue-700 border-blue-700"
            : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
        } rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700`}
        onClick={handleTableClick}
      >
        <Table2 className="w-4 h-4 mr-2" />
        Table
      </button>
      <button
        className={`inline-flex items-center px-4 py-2 text-sm font-medium border-t border-b ${
          view === "detailed"
            ? "bg-blue-50 text-blue-700 border-blue-700"
            : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
        } focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700`}
        onClick={() => onViewChange("detailed")}
      >
        <List className="w-4 h-4 mr-2" />
        Detailed
      </button>
      <button
        className={`inline-flex items-center px-4 py-2 text-sm font-medium border ${
          view === "compact"
            ? "bg-blue-50 text-blue-700 border-blue-700"
            : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
        } rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700`}
        onClick={() => onViewChange("compact")}
      >
        <LayoutList className="w-4 h-4 mr-2" />
        Compact
      </button>
    </div>
  );
}
