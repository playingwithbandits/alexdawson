import { SortOption, FilterOption } from "@/lib/generator/predictions";

interface PredictionControlsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filterRating: FilterOption;
  onFilterChange: (rating: FilterOption) => void;
}

export function PredictionControls({
  sortBy,
  onSortChange,
  filterRating,
  onFilterChange,
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

      <div className="control-group">
        <label>Rating:</label>
        <div className="button-group">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              className={`control-button ${
                filterRating === rating ? "active" : ""
              }`}
              onClick={() =>
                onFilterChange(
                  filterRating === rating ? null : (rating as FilterOption)
                )
              }
            >
              {rating}★
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
