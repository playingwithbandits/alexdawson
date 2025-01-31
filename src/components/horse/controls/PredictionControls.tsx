import { SortOption } from "../DayPredictions";

interface PredictionControlsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function PredictionControls({
  sortBy,
  onSortChange,
}: PredictionControlsProps) {
  return (
    <div className="prediction-controls">
      <div className="control-group">
        <label>Sort by:</label>
        <div className="button-group">
          <button
            className={`control-button ${sortBy === "off" ? "active" : ""}`}
            onClick={() => onSortChange("off")}
          >
            Off
          </button>
          <button
            className={`control-button ${sortBy === "time" ? "active" : ""}`}
            onClick={() => onSortChange("time")}
          >
            Time
          </button>
          <button
            className={`control-button ${sortBy === "rating" ? "active" : ""}`}
            onClick={() => onSortChange("rating")}
          >
            Rating
          </button>
        </div>
      </div>
    </div>
  );
}
