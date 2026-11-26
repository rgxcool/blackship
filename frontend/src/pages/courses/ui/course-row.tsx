import { useState } from "react";
import type { Course } from "../model/course";

interface CourseRowProps {
  course: Course;
  selected: boolean;
  onSelectionChange: (selected: boolean) => void;
}

export function CourseRow({ course, selected, onSelectionChange }: CourseRowProps) {
  const [isSaved, setIsSaved] = useState(false);
  const tuition = new Intl.NumberFormat(course.tuition.currency === "NPR" ? "en-IN" : "en", {
    maximumFractionDigits: 0,
  }).format(course.tuition.amount);
  const currencySymbols: Record<string, string> = { AUD: "$", CAD: "$", GBP: "£", NPR: "" };
  const currencySymbol = currencySymbols[course.tuition.currency] ?? course.tuition.currency;

  return (
    <article className="course-row">
      <input
        className="course-selection"
        type="checkbox"
        aria-label={`Select ${course.title}`}
        checked={selected}
        onChange={(event) => onSelectionChange(event.target.checked)}
      />
      <div className="course-main">
        <h3>{course.title}</h3>
        <p className="course-university">{course.university}</p>
        <p className="course-location">
          {course.city}, {course.country} <span aria-hidden="true">·</span> {course.partner}
        </p>
      </div>
      <span className={`level-badge${course.level.startsWith("Master") ? " is-masters" : ""}`}>
        {course.level}
      </span>
      <div className="course-intakes">{course.intakes.join(" · ")}</div>
      <div className="tuition">
        <strong>{course.tuition.currency} {currencySymbol}{tuition}</strong>
        <span>{course.tuition.period}</span>
      </div>
      <div className="course-actions">
        <button className="view-course" type="button">
          View course
          <span aria-hidden="true">→</span>
        </button>
        <button
          className={`save-course${isSaved ? " is-saved" : ""}`}
          type="button"
          aria-label={isSaved ? `Unsave ${course.title}` : `Save ${course.title}`}
          aria-pressed={isSaved}
          onClick={() => setIsSaved((saved) => !saved)}
        >
          <svg aria-hidden="true" viewBox="0 0 20 20">
            <path d="M5.5 3.5h9v13l-4.5-3-4.5 3v-13Z" />
          </svg>
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>
    </article>
  );
}