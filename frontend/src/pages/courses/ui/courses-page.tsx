import { useState } from "react";
import { logout } from "@/shared/auth";
import { initialCourseSearchQuery } from "../model/course-directory.mock";
import type { Course, CourseFilterValues } from "../model/course";
import { courses } from "../model/courses.mock";
import { getCountryIso3 } from "@/shared/lib/countries";
import { CourseFilters } from "./course-filters";
import { CourseRow } from "./course-row";
import { CourseSearchBar } from "./course-search-bar";
import { DirectoryTabs } from "./directory-tabs";
import { ResultsHeader } from "./results-header";
import { StatsCards } from "./stats-cards";
import "./courses-page.css";

export function CoursesPage() {
  const [view, setView] = useState<"list" | "grid">("list");
  const [query, setQuery] = useState(initialCourseSearchQuery);
  const [filters, setFilters] = useState<CourseFilterValues>({
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
  });
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const filteredCourses = filterCourses(courses, query, filters);
  const allCoursesSelected = filteredCourses.length > 0 && filteredCourses.every((course) => selectedCourseIds.includes(course.id));

  const toggleCourseSelection = (courseId: string, selected: boolean) => {
    setSelectedCourseIds((selectedIds) =>
      selected
        ? Array.from(new Set([...selectedIds, courseId]))
        : selectedIds.filter((selectedId) => selectedId !== courseId),
    );
  };

  return (
    <main className="courses-page">
      <div className="page-shell">
        <header className="page-heading">
          <button type="button" className="logout-button" onClick={() => void logout()}>
            Log out
          </button>
          <p className="page-eyebrow">Global education directory</p>
          <h1>Course directory</h1>
          <p className="page-description">
            Explore courses from universities around the world.
          </p>
        </header>

        <StatsCards />

        <section className="directory-panel" aria-label="Find courses">
          <DirectoryTabs />
          <div className="search-area">
            <CourseSearchBar query={query} onQueryChange={setQuery} />
            <CourseFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </section>

        <section className="course-results" aria-label="Course results">
          <ResultsHeader
            view={view}
            onViewChange={setView}
            resultCount={filteredCourses.length}
            query={query}
          />
          <div className="course-table" data-view={view}>
            <div className="course-table-header">
              <span>
                <input
                  type="checkbox"
                  aria-label="Select all courses"
                  checked={allCoursesSelected}
                  onChange={(event) =>
                    setSelectedCourseIds((selectedIds) => event.target.checked
                      ? Array.from(new Set([...selectedIds, ...filteredCourses.map((course) => course.id)]))
                      : selectedIds.filter((id) => !filteredCourses.some((course) => course.id === id))
                    )
                  }
                />
              </span>
              <span>Course &amp; institution</span>
              <span>Study level</span>
              <span>Intakes</span>
              <span>Tuition</span>
              <span className="course-table-count">{filteredCourses.length} results</span>
            </div>
            <div className="course-list" data-view={view} aria-live="polite">
              {filteredCourses.length ? filteredCourses.map((course) => (
                <CourseRow
                  course={course}
                  key={course.id}
                  selected={selectedCourseIds.includes(course.id)}
                  onSelectionChange={(selected) => toggleCourseSelection(course.id, selected)}
                />
              )) : <p className="empty-course-results">No courses match your filters.</p>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function filterCourses(coursesToFilter: Course[], query: string, filters: CourseFilterValues) {
  const normalizedQuery = query.trim().toLowerCase();

  return coursesToFilter.filter((course) => {
    const searchableText = course.title.toLowerCase();
    if (normalizedQuery && !searchableText.includes(normalizedQuery)) return false;
    if (filters.country && getCountryIso3(course.country) !== filters.country) return false;
    if (filters.university && course.university !== filters.university) return false;
    if (filters.level && !course.level.startsWith(filters.level)) return false;
    if (filters.stream && course.stream !== filters.stream) return false;
    if (filters.faculty && course.faculty !== filters.faculty) return false;
    if (filters.specialization && course.specialization !== filters.specialization) return false;
    if (filters.partner && course.partner !== filters.partner) return false;
    if (filters.duration === "Under 1 Year" && course.durationMonths >= 12) return false;
    if (filters.duration === "1–2 Years" && (course.durationMonths < 12 || course.durationMonths > 24)) return false;
    if (filters.duration === "2–3 Years" && (course.durationMonths <= 24 || course.durationMonths > 36)) return false;
    if (filters.duration === "3+ Years" && course.durationMonths <= 36) return false;
    if (filters.minimumTuition && course.tuition.amount < Number(filters.minimumTuition)) return false;
    if (filters.maximumTuition && course.tuition.amount > Number(filters.maximumTuition)) return false;
    if (filters.scholarship === "available" && !course.scholarship) return false;
    if (filters.scholarship === "unavailable" && course.scholarship) return false;
    if (filters.minimumScholarship || filters.maximumScholarship) {
      if (!course.scholarship) return false;
      const scholarshipValue = filters.scholarshipMode === "percentage"
        ? course.scholarship.percentage
        : course.scholarship.amount;
      if (filters.minimumScholarship && scholarshipValue < Number(filters.minimumScholarship)) return false;
      if (filters.maximumScholarship && scholarshipValue > Number(filters.maximumScholarship)) return false;
    }
    if (filters.intake && !course.intakes.some((intake) => intake.toLowerCase().startsWith(filters.intake.slice(0, 3).toLowerCase()))) return false;
    if (filters.language && course.language !== filters.language) return false;
    if (filters.verified && !course.verified) return false;
    return true;
  });
}
