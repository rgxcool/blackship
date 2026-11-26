import { courseSortOptions, initialCourseSort } from "../model/course-directory.mock";

interface ResultsHeaderProps {
  view: "list" | "grid";
  onViewChange: (view: "list" | "grid") => void;
  resultCount: number;
  query: string;
}

export function ResultsHeader({ view, onViewChange, resultCount, query }: ResultsHeaderProps) {
  return (
    <div className="results-header">
      <p className="results-copy">
        <strong>{resultCount} featured {resultCount === 1 ? "course" : "courses"}</strong>
        {query && (
          <>
            , matching <span>'{query}'</span>
          </>
        )}
      </p>
      <div className="results-controls">
        <label className="sort-control">
          <span>Sort by</span>
          <select aria-label="Sort courses" defaultValue={initialCourseSort}>
            {courseSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="view-toggle" role="group" aria-label="Results view">
          <button
            className={view === "list" ? "is-active" : ""}
            type="button"
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => onViewChange("list")}
          >
            ☰
          </button>
          <button
            className={view === "grid" ? "is-active" : ""}
            type="button"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => onViewChange("grid")}
          >
            ▦
          </button>
        </div>
      </div>
    </div>
  );
}