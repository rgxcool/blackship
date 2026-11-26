import { useState } from "react";
import { SearchableSelect, Select } from "@/shared/ui";
import { iso3166Countries } from "@/shared/lib/countries";
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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const toolbarFilters = courseFilterOptions.filter((filter) => filter.label !== "Country" && filter.label !== "Partner");
  const updateFilters = (updates: Partial<CourseFilterValues>) =>
    onFiltersChange({ ...filters, ...updates });

  return (
    <div className="course-filters" aria-label="Course filters">
      <div className="course-filter-toolbar">
        <div className="filter-selects">
          <SearchableSelect
            label="Country"
            onChange={(country) => updateFilters({ country })}
            options={iso3166Countries.map(({ name, iso3 }) => ({
              label: `${name} (${iso3})`,
              value: iso3,
              keywords: [name, iso3],
            }))}
            placeholder="Any country"
            searchPlaceholder="Search country or ISO-3 code..."
            value={filters.country}
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
                <Select
                  value={value}
                  aria-label={filter.label}
                  options={filter.options}
                  placeholder={filter.placeholder}
                  onChange={(nextValue) => updateFilters({ [key]: nextValue })}
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
              <Select
                value={filters.stream}
                options={advancedCourseFilterOptions.streams}
                placeholder="Any stream"
                onChange={(value) => updateFilters({ stream: value })}
              />
            </label>
            <label className="advanced-filter-field">
              <span>Faculty</span>
              <Select
                value={filters.faculty}
                options={courseFaculties}
                placeholder="Any faculty"
                onChange={(value) => updateFilters({ faculty: value })}
              />
            </label>
            <label className="advanced-filter-field">
              <span>Specialization</span>
              <Select
                value={filters.specialization}
                options={courseSpecializations}
                placeholder="Any specialization"
                onChange={(value) => updateFilters({ specialization: value })}
              />
            </label>
            <label className="advanced-filter-field">
              <span>Partner</span>
              <Select
                value={filters.partner}
                options={courseFilterOptions[3].options}
                placeholder="Any partner"
                onChange={(value) => updateFilters({ partner: value })}
              />
            </label>
            <label className="advanced-filter-field">
              <span>Course duration</span>
              <Select
                value={filters.duration}
                options={advancedCourseFilterOptions.durations}
                placeholder="Any duration"
                onChange={(value) => updateFilters({ duration: value })}
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
              <Select
                value={filters.scholarship}
                options={[{ value: "available", label: "Available" }, { value: "unavailable", label: "Not available" }]}
                placeholder="Any scholarship status"
                aria-label="Scholarship availability"
                onChange={(value) => updateFilters({ scholarship: value })}
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
              <Select
                value={filters.language}
                options={courseLanguages}
                placeholder="Any language"
                onChange={(value) => updateFilters({ language: value })}
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
  partner: "",
};