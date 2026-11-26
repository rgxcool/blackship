import { SearchBar } from "@/shared/ui";

interface CourseSearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export function CourseSearchBar({ query, onQueryChange }: CourseSearchBarProps) {
  return (
    <SearchBar
      className="course-search"
      clearLabel="Clear search"
      label="Search courses"
      onQueryChange={onQueryChange}
      placeholder="Search course titles..."
      query={query}
    />
  );
}