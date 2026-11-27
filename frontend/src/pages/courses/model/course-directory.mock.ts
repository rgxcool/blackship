import { courses } from "./courses.mock";

const directoryCounts = {
  universities: 5466,
  courses: 10438,
  destinations: 55,
  enterprisePartners: 6,
} as const;

export const directoryStats = [
  { label: "Universities", value: directoryCounts.universities, icon: "⌂" },
  { label: "Courses", value: directoryCounts.courses, icon: "▤" },
  { label: "Destinations", value: directoryCounts.destinations, icon: "◎" },
  { label: "Enterprise partners", value: directoryCounts.enterprisePartners, icon: "◇" },
] as const;

export const directoryTabs = [
  { label: "Universities", count: directoryCounts.universities },
  { label: "Courses", count: directoryCounts.courses },
] as const;

const unique = (values: string[]) => Array.from(new Set(values));
const intakeMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const courseFilterOptions = [
  {
    label: "Country",
    placeholder: "Any country",
    options: [],
  },
  { label: "Study level", placeholder: "Any level", options: unique(courses.map((course) => course.level)) },
  { label: "Intake", placeholder: "Any intake", options: intakeMonths },
  { label: "Partner", placeholder: "Any partner", options: unique(courses.map((course) => course.partner)) },
] as const;

export const advancedCourseFilterOptions = {
  streams: ["Science", "Management", "Arts", "Technology"],
  durations: ["Under 1 Year", "1–2 Years", "2–3 Years", "3+ Years"],
} as const;

export const courseUniversities = unique(courses.map((course) => course.university));
export const courseFaculties = unique(courses.map((course) => course.faculty));
export const courseSpecializations = unique(courses.map((course) => course.specialization));
export const courseLanguages = unique(courses.map((course) => course.language));

export const courseSortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "tuition-low", label: "Tuition: low to high" },
  { value: "tuition-high", label: "Tuition: high to low" },
] as const;

export const initialCourseSort = courseSortOptions[0].value;
export const initialCourseSearchQuery = "comput";