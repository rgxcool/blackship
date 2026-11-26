export interface Course {
  id: string;
  title: string;
  university: string;
  city: string;
  country: string;
  partner: string;
  level: string;
  stream: string;
  faculty: string;
  specialization: string;
  durationMonths: number;
  scholarship: {
    amount: number;
    currency: string;
    percentage: number;
  } | null;
  intakes: string[];
  language: string;
  verified: boolean;
  tuition: {
    amount: number;
    currency: string;
    period: string;
  };
}



export interface CourseFilterValues {
  country: string;
  university: string;
  level: string;
  stream: string;
  faculty: string;
  specialization: string;
  duration: string;
  minimumTuition: string;
  maximumTuition: string;
  scholarship: string;
  scholarshipMode: "flat" | "percentage";
  minimumScholarship: string;
  maximumScholarship: string;
  intake: string;
  language: string;
  verified: boolean;
  partner: string;
}