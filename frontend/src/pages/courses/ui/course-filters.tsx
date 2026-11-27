import { useMemo, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { SearchableSelect, Select } from "@/shared/ui";
import { getCountryByIso3, searchCountriesPage } from "@/shared/api";
import type { CourseFilterValues } from "../model/course";
import {
  advancedCourseFilterOptions,
  courseFaculties,
  courseFilterOptions,
  courseLanguages,
  courseSpecializations,
  courseUniversities,
} from "../model/course-directory.mock";

interface CourseFiltersProps {
  filters: CourseFilterValues;
  onFiltersChange: (filters: CourseFilterValues) => void;
}

export function CourseFilters({ filters, onFiltersChange }: CourseFiltersProps) {
  const queryClient = useQueryClient();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["countries", "search", countrySearch],
    queryFn: ({ pageParam, signal }) => searchCountriesPage(countrySearch, pageParam, 10, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    staleTime: 5 * 60 * 1000,
  });
  const countries = useMemo(() => {
    const items = data?.pages.flatMap((p) => p.items) ?? [];
    const seen = new Set<string>();
    return items.filter((country) => {
      if (seen.has(country.iso3)) return false;
      seen.add(country.iso3);
      return true;
    });
  }, [data]);
  const { data: selectedCountry } = useQuery({
    queryKey: ["countries", "by-iso3", filters.country],
    queryFn: ({ signal }) => getCountryByIso3(filters.country, signal),
    enabled: Boolean(filters.country) && !countries.some((c) => c.iso3 === filters.country),
    staleTime: 5 * 60 * 1000,
  });
  const countryOptions = useMemo(() => {
    const list =
      !countrySearch.trim() &&
      selectedCountry &&
      !countries.some((c) => c.iso3 === selectedCountry.iso3)
        ? [selectedCountry, ...countries]
        : countries;
    return list.map(({ name, iso3 }) => ({
      label: `${name} (${iso3})`,
      value: iso3,
      keywords: [name, iso3],
    }));
  }, [countries, countrySearch, selectedCountry]);
  const toolbarFilters = courseFilterOptions.filter((filter) => filter.label !== "Country" && filter.label !== "Partner");
  const updateFilters = (updates: Partial<CourseFilterValues>) =>
    onFiltersChange({ ...filters, ...updates });

  return (
    <div className="course-filters" aria-label="Course filters">
      <div className="course-filter-toolbar">
        <div className="filter-selects">
          <SearchableSelect
            label="Country"
            onChange={(countryIso3) => {
              const matched = countries.find((c) => c.iso3 === countryIso3);
              if (matched) {
                queryClient.setQueryData(["countries", "by-iso3", countryIso3], matched);
              }
              updateFilters({ country: countryIso3 });
            }}
            options={countryOptions}
            placeholder="Any country"
            searchPlaceholder="Search country or ISO-3 code..."
            value={filters.country}
            onSearchChange={setCountrySearch}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={!!hasNextPage}
            onLoadMore={() => fetchNextPage()}
            emptyMessage={isError ? "Failed to load countries." : undefined}
          />
          <SearchableSelect
            label="University"
            onChange={(university) => updateFilters({ university })}
            options={courseUniversities}
            placeholder="Any university"
            searchPlaceholder="Search university..."
            value={filters.university}
          />
          {toolbarFilters.map((filter) => {
            const key = filter.label === "Study level" ? "level" : filter.label.toLowerCase();
            const value = filters[key as keyof CourseFilterValues] as string;

            return (
              <label className="filter-field" key={filter.label}>
                <span className="visually-hidden">{filter.label}</span>
                <SearchableSelect
                  label={filter.label}
                  options={filter.options}
                  value={value}
                  placeholder={filter.placeholder}
                  onChange={(nextValue) => updateFilters({ [key]: nextValue })}
                  searchPlaceholder={`Search ${filter.label.toLowerCase()}...`}
                />
              </label>
            );
          })}
        </div>
        <div className="filter-actions">
          <button
            className="advanced-filters"
            type="button"
            aria-expanded={isAdvancedOpen}
            aria-controls="advanced-course-filters"
            onClick={() => setIsAdvancedOpen((open) => !open)}
          >
            <span aria-hidden="true">☷</span>
            Advanced filters
          </button>
          <button className="save-search" type="button">
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <path d="M5.5 3.5h9v13l-4.5-3-4.5 3v-13Z" />
            </svg>
            Save search
          </button>
        </div>
      </div>
      {isAdvancedOpen && (
        <section className="advanced-filter-panel" id="advanced-course-filters" aria-label="Advanced course filters">
          <div className="advanced-filter-grid">
            <label className="advanced-filter-field">
              <span>Stream</span>
              <SearchableSelect
                label="Stream"
                options={advancedCourseFilterOptions.streams}
                value={filters.stream}
                placeholder="Any stream"
                onChange={(value) => updateFilters({ stream: value })}
                searchPlaceholder="Search stream..."
              />
            </label>
            <label className="advanced-filter-field">
              <span>Faculty</span>
              <SearchableSelect
                label="Faculty"
                options={courseFaculties}
                value={filters.faculty}
                placeholder="Any faculty"
                onChange={(value) => updateFilters({ faculty: value })}
                searchPlaceholder="Search faculty..."
              />
            </label>
            <label className="advanced-filter-field">
              <span>Specialization</span>
              <SearchableSelect
                label="Specialization"
                options={courseSpecializations}
                value={filters.specialization}
                placeholder="Any specialization"
                onChange={(value) => updateFilters({ specialization: value })}
                searchPlaceholder="Search specialization..."
              />
            </label>
            <label className="advanced-filter-field">
              <span>Partner</span>
              <SearchableSelect
                label="Partner"
                options={courseFilterOptions[3].options}
                value={filters.partner}
                placeholder="Any partner"
                onChange={(value) => updateFilters({ partner: value })}
                searchPlaceholder="Search partner..."
              />
            </label>
            <label className="advanced-filter-field">
              <span>Course duration</span>
              <SearchableSelect
                label="Course duration"
                options={advancedCourseFilterOptions.durations}
                value={filters.duration}
                placeholder="Any duration"
                onChange={(value) => updateFilters({ duration: value })}
                searchPlaceholder="Search duration..."
              />
            </label>
            <fieldset className="advanced-filter-field tuition-filter">
              <legend>Tuition fee</legend>
              <div>
                <label>
                  <span className="visually-hidden">Minimum fee</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder="Minimum fee"
                    value={filters.minimumTuition}
                    onChange={(event) => updateFilters({ minimumTuition: event.target.value })}
                  />
                </label>
                <label>
                  <span className="visually-hidden">Maximum fee</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder="Maximum fee"
                    value={filters.maximumTuition}
                    onChange={(event) => updateFilters({ maximumTuition: event.target.value })}
                  />
                </label>
              </div>
            </fieldset>
            <fieldset className="advanced-filter-field scholarship-filter">
              <legend>Scholarship</legend>
              <SearchableSelect
                label="Scholarship"
                options={[{ value: "available", label: "Available" }, { value: "unavailable", label: "Not available" }]}
                value={filters.scholarship}
                placeholder="Any scholarship status"
                onChange={(value) => updateFilters({ scholarship: value })}
                searchPlaceholder="Search scholarship status..."
              />
              <div className="scholarship-mode" role="group" aria-label="Scholarship range unit">
                <button
                  type="button"
                  aria-pressed={filters.scholarshipMode === "flat"}
                  onClick={() => updateFilters({ scholarshipMode: "flat", minimumScholarship: "", maximumScholarship: "" })}
                >
                  Flat amount
                </button>
                <button
                  type="button"
                  aria-pressed={filters.scholarshipMode === "percentage"}
                  onClick={() => updateFilters({ scholarshipMode: "percentage", minimumScholarship: "", maximumScholarship: "" })}
                >
                  Percentage
                </button>
              </div>
              <div className="scholarship-range">
                <label>
                  <span className="visually-hidden">Minimum scholarship {filters.scholarshipMode}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    aria-label={`Minimum scholarship ${filters.scholarshipMode}`}
                    placeholder={filters.scholarshipMode === "flat" ? "Min amount" : "Min %"}
                    value={filters.minimumScholarship}
                    onChange={(event) => updateFilters({ minimumScholarship: event.target.value })}
                  />
                </label>
                <label>
                  <span className="visually-hidden">Maximum scholarship {filters.scholarshipMode}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    aria-label={`Maximum scholarship ${filters.scholarshipMode}`}
                    placeholder={filters.scholarshipMode === "flat" ? "Max amount" : "Max %"}
                    value={filters.maximumScholarship}
                    onChange={(event) => updateFilters({ maximumScholarship: event.target.value })}
                  />
                </label>
              </div>
              <span className="scholarship-filter-note">
                Flat amounts use each course’s listed currency; percentages are of tuition.
              </span>
            </fieldset>
            <label className="advanced-filter-field">
              <span>Course language</span>
              <SearchableSelect
                label="Course language"
                options={courseLanguages}
                value={filters.language}
                placeholder="Any language"
                onChange={(value) => updateFilters({ language: value })}
                searchPlaceholder="Search language..."
              />
            </label>
            <label className="verified-filter">
              <input
                type="checkbox"
                checked={filters.verified}
                onChange={(event) => updateFilters({ verified: event.target.checked })}
              />
              Verified courses
            </label>
            <label className="verified-filter">
              <input
                type="checkbox"
                checked={filters.interviewNeeded}
                onChange={(event) => updateFilters({ interviewNeeded: event.target.checked })}
              />
              Interview needed
            </label>
          </div>
          <div className="advanced-filter-actions">
            <button type="button" onClick={() => onFiltersChange(emptyFilters)}>
              Clear filters
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

const emptyFilters: CourseFilterValues = {
  country: "",
  university: "",
  level: "",
  stream: "",
  faculty: "",
  specialization: "",
  duration: "",
  minimumTuition: "",
  maximumTuition: "",
  scholarship: "",
  scholarshipMode: "flat",
  minimumScholarship: "",
  maximumScholarship: "",
  intake: "",
  language: "",
  verified: false,
  interviewNeeded: false,
  partner: "",
};