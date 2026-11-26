import { useId, type FormEvent } from "react";
import "./SearchBar.css";

export interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  label: string;
  placeholder: string;
  submitLabel?: string;
  clearLabel?: string;
  className?: string;
  onSubmit?: (query: string) => void;
}

export function SearchBar({
  query,
  onQueryChange,
  label,
  placeholder,
  submitLabel = "Search",
  clearLabel = "Clear search",
  className,
  onSubmit,
}: SearchBarProps) {
  const inputId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(query);
  };

  return (
    <form className={["search-bar", className].filter(Boolean).join(" ")} role="search" onSubmit={handleSubmit}>
      <label className="search-bar-label" htmlFor={inputId}>
        {label}
      </label>
      <span className="search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <circle cx="10.8" cy="10.8" r="6.3" />
          <path d="m15.4 15.4 4.1 4.1" />
        </svg>
      </span>
      <input
        id={inputId}
        type="search"
        value={query}
        placeholder={placeholder}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <button
        className="clear-search"
        type="button"
        aria-label={clearLabel}
        disabled={!query}
        onClick={() => onQueryChange("")}
      >
        ×
      </button>
      <button className="search-submit" type="submit">
        {submitLabel}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}