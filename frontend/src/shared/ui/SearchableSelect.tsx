import { useEffect, useId, useRef, useState } from "react";
import "./SearchableSelect.css";

interface SearchableSelectProps {
  label: string;
  options: readonly (string | SearchableSelectOption)[];
  value: string;
  placeholder: string;
  searchPlaceholder: string;
  onChange: (value: string) => void;
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
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();
  const listboxId = `${id}-options`;
  const searchInputId = `${id}-search`;
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { value: option, label: option, keywords: [] } : option,
  );
  const normalizedSearch = search.trim().toLowerCase();
  const filteredOptions = normalizedOptions.filter((option) =>
    [option.label, option.value, ...(option.keywords ?? [])]
      .some((searchableValue) => searchableValue.toLowerCase().includes(normalizedSearch)),
  );
  const selectedOption = normalizedOptions.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearch("");
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) searchInputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) optionRefs.current[activeIndex]?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, isOpen]);

  const selectOption = (nextValue: string) => {
    onChange(nextValue);
    setSearch("");
    setActiveIndex(0);
    setIsOpen(false);
  };

  return (
    <div className="searchable-select" ref={containerRef}>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${label}: ${selectedOption?.label || placeholder}`}
        className="searchable-select-trigger"
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            setSearch("");
          } else {
            setIsOpen(true);
          }
        }}
        ref={triggerRef}
        type="button"
      >
        <span>{selectedOption?.label || placeholder}</span>
        <span aria-hidden="true" className="searchable-select-chevron">⌄</span>
      </button>
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
                  selectOption(filteredOptions[activeIndex].value);
                }
              }}
              placeholder={searchPlaceholder}
              ref={searchInputRef}
              type="search"
              value={search}
            />
          </label>
          <ul aria-label={`${label} options`} className="searchable-select-options" id={listboxId} role="listbox">
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
            {filteredOptions.map((option, index) => (
              <li key={option.value} role="presentation">
                <button
                  aria-selected={value === option.value}
                  className={`searchable-select-option${activeIndex === index ? " is-active" : ""}`}
                  id={`${listboxId}-${index}`}
                  onClick={() => selectOption(option.value)}
                  ref={(element) => { optionRefs.current[index] = element; }}
                  role="option"
                  type="button"
                >
                  {option.label}
                </button>
              </li>
            ))}
            {!filteredOptions.length && (
              <li className="searchable-select-empty" role="presentation">No {label.toLowerCase()} found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}