import { useEffect, useId, useRef, useState } from "react";
import "./SearchableSelect.css";

interface SearchableSelectProps {
  label: string;
  options: readonly (string | SearchableSelectOption)[];
  value: string;
  placeholder: string;
  searchPlaceholder: string;
  onChange: (value: string) => void;
  onSearchChange?: (search: string) => void;
  loading?: boolean;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  emptyMessage?: string;
}

interface SearchableSelectOption {
  value: string;
  label: string;
  keywords?: readonly string[];
}

export function SearchableSelect({
  label,
  options,
  value,
  placeholder,
  searchPlaceholder,
  onChange,
  onSearchChange,
  loading = false,
  isLoading,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  emptyMessage,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [cachedSelectedOption, setCachedSelectedOption] = useState<SearchableSelectOption | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();
  const listboxId = `${id}-options`;
  const searchInputId = `${id}-search`;
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { value: option, label: option, keywords: [] } : option,
  );
  const normalizedSearch = search.trim().toLowerCase();
  const isSearchPending = Boolean(onSearchChange) && isOpen && search !== committedSearch;
  const filteredOptions = onSearchChange
    ? (isSearchPending ? [] : normalizedOptions)
    : normalizedOptions.filter((option) =>
        [option.label, option.value, ...(option.keywords ?? [])].some((searchableValue) =>
          searchableValue.toLowerCase().includes(normalizedSearch),
        ),
      );
  const matchedOption = normalizedOptions.find((option) => option.value === value);
  const selectedOption = value
    ? (matchedOption ?? (cachedSelectedOption?.value === value ? cachedSelectedOption : undefined))
    : undefined;
  const showLoading = (isLoading ?? loading) || isSearchPending;

  useEffect(() => {
    if (matchedOption) {
      setCachedSelectedOption(matchedOption);
    } else if (!value) {
      setCachedSelectedOption(null);
    }
  }, [matchedOption, value]);

  useEffect(() => {
    if (!isOpen) return;

    const closeMenu = () => {
      setIsOpen(false);
      setSearch("");
      setCommittedSearch("");
      setActiveIndex(0);
      onSearchChange?.("");
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        closeMenu();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onSearchChange]);

  useEffect(() => {
    if (isOpen) searchInputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !onSearchChange) return;
    const timer = setTimeout(() => {
      setCommittedSearch(search);
      onSearchChange(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [isOpen, onSearchChange, search]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [isOpen, normalizedSearch]);

  useEffect(() => {
    if (isOpen) optionRefs.current[activeIndex]?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, isOpen]);

  const handleListScroll = () => {
    const el = listRef.current;
    if (!el || !onLoadMore || !hasNextPage || isFetchingNextPage) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      onLoadMore();
    }
  };

  const selectOption = (nextValue: string) => {
    const chosen = normalizedOptions.find((option) => option.value === nextValue) ?? null;
    setCachedSelectedOption(nextValue ? chosen : null);
    onChange(nextValue);
    setSearch("");
    setCommittedSearch("");
    onSearchChange?.("");
    setActiveIndex(0);
    setIsOpen(false);
  };

  return (
    <div className="searchable-select" ref={containerRef}>
      <div className="searchable-select-control">
        <button
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={`${label}: ${selectedOption?.label || placeholder}`}
          className={`searchable-select-trigger${value ? " has-clear" : ""}`}
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
              setSearch("");
              setCommittedSearch("");
              setActiveIndex(0);
              onSearchChange?.("");
            } else {
              setIsOpen(true);
            }
          }}
          ref={triggerRef}
          type="button"
        >
          <span>{selectedOption?.label || placeholder}</span>
          <span aria-hidden="true" className="searchable-select-chevron">
            <svg viewBox="0 0 12 12">
              <path d="M2.5 4.5 6 8l3.5-3.5" />
            </svg>
          </span>
        </button>
        {value && (
          <button
            aria-label={`Clear ${label}`}
            className="searchable-select-clear"
            onClick={() => selectOption("")}
            title={`Clear ${label}`}
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 12 12">
              <path d="M3 3l6 6M9 3l-6 6" />
            </svg>
          </button>
        )}
      </div>
      {isOpen && (
        <div className="searchable-select-menu">
          <p className="searchable-select-heading">Select {label}</p>
          <label className="searchable-select-search" htmlFor={searchInputId}>
            <span aria-hidden="true">⌕</span>
            <input
              aria-activedescendant={filteredOptions[activeIndex] ? `${listboxId}-${activeIndex}` : undefined}
              aria-label={searchPlaceholder}
              autoComplete="off"
              id={searchInputId}
              onChange={(event) => {
                setSearch(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" && filteredOptions.length) {
                  event.preventDefault();
                  setActiveIndex((index) => (index + 1) % filteredOptions.length);
                } else if (event.key === "ArrowUp" && filteredOptions.length) {
                  event.preventDefault();
                  setActiveIndex((index) => (index - 1 + filteredOptions.length) % filteredOptions.length);
                } else if (event.key === "Enter" && filteredOptions[activeIndex]) {
                  event.preventDefault();
                  const nextValue = filteredOptions[activeIndex].value;
                  selectOption(value === nextValue ? "" : nextValue);
                }
              }}
              placeholder={searchPlaceholder}
              ref={searchInputRef}
              type="search"
              value={search}
            />
          </label>
          <ul aria-label={`${label} options`} className="searchable-select-options" id={listboxId} role="listbox" ref={listRef} onScroll={handleListScroll}>
            <li role="presentation">
              <button
                aria-selected={!value}
                className="searchable-select-option"
                onClick={() => selectOption("")}
                role="option"
                type="button"
              >
                {placeholder}
              </button>
            </li>
            {filteredOptions.map((option, index) => {
              const isSelected = value === option.value;
              return (
                <li key={option.value} role="presentation">
                  <button
                    aria-selected={isSelected}
                    className={`searchable-select-option${activeIndex === index ? " is-active" : ""}`}
                    id={`${listboxId}-${index}`}
                    onClick={() => selectOption(isSelected ? "" : option.value)}
                    ref={(element) => { optionRefs.current[index] = element; }}
                    role="option"
                    type="button"
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <svg aria-hidden="true" className="searchable-select-check" viewBox="0 0 12 12">
                        <path d="M2.5 6.2 5 8.7 9.5 3.5" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
            {showLoading && (
              <li className="searchable-select-empty" role="presentation">Loading...</li>
            )}
            {!showLoading && isFetchingNextPage && (
              <li className="searchable-select-empty" role="presentation">Loading more...</li>
            )}
            {!showLoading && !isFetchingNextPage && !filteredOptions.length && (
              <li className="searchable-select-empty" role="presentation">
                {emptyMessage ?? `No ${label.toLowerCase()} found.`}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}