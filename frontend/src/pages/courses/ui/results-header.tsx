import { courseSortOptions, initialCourseSort } from "../model/course-directory.mock";
import { SearchableSelect } from "@/shared/ui";

interface ResultsHeaderProps {
  view: "list" | "grid";
  onViewChange: (view: "list" | "grid") => void;
  resultCount: number;
  query: string;
  sortBy: string;
  onSortBy: React.Dispatch<React.SetStateAction<string>>;
}

export function ResultsHeader({ view, onViewChange, resultCount, query, sortBy, onSortBy }: ResultsHeaderProps) {
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
          <SearchableSelect
            label="Sort by"
            options={courseSortOptions}
            value={sortBy}
            placeholder="Any sort option"
            onChange={(value) => onSortBy(value)}
            searchPlaceholder="Search sort option..."
          />
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