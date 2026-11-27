package http

import (
	"encoding/json"
	"time"

	"centralize-directory/internal/course/domain"
	"centralize-directory/internal/course/port"
)

// ---- requests ----

type createBody struct {
	UniversityID      string     `json:"university_id" minLength:"1" doc:"University this course belongs to"`
	CourseName        string     `json:"course_name" minLength:"3" maxLength:"255"`
	CourseCode        string     `json:"course_code,omitempty"`
	Level             string     `json:"level" minLength:"1"`
	LevelCode         string     `json:"level_code,omitempty"`
	Degree            string     `json:"degree,omitempty"`
	Stream            string     `json:"stream,omitempty"`
	Faculty           string     `json:"faculty,omitempty"`
	FacultyCode       string     `json:"faculty_code,omitempty"`
	Language          string     `json:"language,omitempty"`
	Duration          *int       `json:"duration,omitempty" minimum:"1"`
	DurationUnit      string     `json:"duration_unit,omitempty" enum:"year,month,week"`
	CoursePeriod      string     `json:"course_period,omitempty"`
	InterviewRequired bool       `json:"interview_required,omitempty"`
	IsOnline          bool       `json:"is_online,omitempty"`
	IntakeMonths      []string   `json:"intake_months,omitempty" doc:"Sep, Feb ... full names also accepted"`
	FeeCurrency       string     `json:"fee_currency,omitempty" maxLength:"3"`
	StartDate         *time.Time `json:"start_date,omitempty"`
	Deadline          *time.Time `json:"deadline,omitempty"`
	CountryServiceID  string     `json:"country_service_id,omitempty"`

	BasicCourseDetails any `json:"basic_course_details,omitempty"`
	Info               any `json:"info,omitempty"`
	Specialization     any `json:"specialization,omitempty" doc:"list of {name, code}"`
	CampusLocation     any `json:"campus_location,omitempty"`
	Tags               any `json:"tags,omitempty"`
	Pathway            any `json:"pathway,omitempty"`
	CourseMetadata     any `json:"course_metadata,omitempty"`

	Private map[string]any `json:"private,omitempty" doc:"the creator's own private values, by column name"`
}

type CreateInput struct{ Body createBody }

type IDInput struct {
	ID string `path:"id"`
}

type PrivateInput struct {
	ID      string `path:"id"`
	Field   string `path:"field" doc:"tuition_fee, scholarship, proficiency_test_score, ..."`
	RawBody []byte
}

type SearchInput struct {
	Q               string  `query:"q" doc:"course name contains"`
	UniversityID    string  `query:"university_id"`
	Country         string  `query:"country" doc:"ISO3 of the university country"`
	Level           string  `query:"level"`
	Stream          string  `query:"stream"`
	Intake          string  `query:"intake" doc:"intake month, e.g. Sep"`
	Specialization  string  `query:"specialization"`
	MinMonths       int     `query:"min_months"`
	MaxMonths       int     `query:"max_months"`
	FeeCurrency     string  `query:"fee_currency"`
	Featured        bool    `query:"featured" doc:"featured by YOUR company"`
	ScholarshipType string  `query:"scholarship_type" enum:"flat,percentage" doc:"in YOUR company's data"`
	MaxTuitionNPR   float64 `query:"max_tuition_npr" doc:"YOUR default_fee_npr is at most this"`
	Test            string  `query:"test" doc:"e.g. IELTS, used with score"`
	Score           float64 `query:"score" doc:"student score; matches courses whose min_score is at or below it"`
	Sort            string  `query:"sort" enum:"name,newest"`
	Page            int     `query:"page"`
	PageSize        int     `query:"page_size"`
}

// ---- responses ----

type CourseDTO struct {
	ID                string     `json:"course_id"`
	UniversityID      string     `json:"university_id"`
	CreatedBy         string     `json:"created_by_enterprise_id"`
	IsAsterconsult    bool       `json:"is_asterconsult"`
	CourseName        string     `json:"course_name"`
	CourseCode        string     `json:"course_code,omitempty"`
	Slug              string     `json:"slug"`
	Status            string     `json:"status"`
	IsOnline          bool       `json:"is_online"`
	IsVerified        bool       `json:"is_verified"`
	Level             string     `json:"level"`
	LevelCode         string     `json:"level_code,omitempty"`
	Degree            string     `json:"degree,omitempty"`
	Stream            string     `json:"stream,omitempty"`
	Faculty           string     `json:"faculty,omitempty"`
	FacultyCode       string     `json:"faculty_code,omitempty"`
	Language          string     `json:"language,omitempty"`
	Duration          *int       `json:"duration,omitempty"`
	DurationUnit      string     `json:"duration_unit,omitempty"`
	DurationMonths    *int16     `json:"duration_months,omitempty"`
	CoursePeriod      string     `json:"course_period,omitempty"`
	InterviewRequired bool       `json:"interview_required"`
	IntakeMonths      []string   `json:"intake_months"`
	FeeCurrency       string     `json:"fee_currency,omitempty"`
	StartDate         *time.Time `json:"start_date,omitempty"`
	NextStartDate     *time.Time `json:"next_start_date,omitempty"`
	Deadline          *time.Time `json:"deadline,omitempty"`
	WaiverValidUntil  *time.Time `json:"waiver_valid_until,omitempty"`
	CountryServiceID  string     `json:"country_service_id,omitempty"`

	BasicCourseDetails any `json:"basic_course_details"`
	Info               any `json:"info"`
	Specialization     any `json:"specialization"`
	CampusLocation     any `json:"campus_location"`
	Tags               any `json:"tags"`
	Pathway            any `json:"pathway"`
	CourseMetadata     any `json:"course_metadata"`

	// ONLY the calling company's own values
	Private map[string]any `json:"private"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CourseOutput struct{ Body CourseDTO }

type SearchOutput struct {
	Body struct {
		Items    []CourseDTO `json:"items"`
		Total    int64       `json:"total"`
		Page     int         `json:"page"`
		PageSize int         `json:"page_size"`
	}
}

// ---- mapping ----

func rawAny(raw json.RawMessage) any {
	if len(raw) == 0 {
		return nil
	}
	var v any
	if json.Unmarshal(raw, &v) != nil {
		return nil
	}
	return v
}

func toRaw(v any) json.RawMessage {
	if v == nil {
		return nil
	}
	b, err := json.Marshal(v)
	if err != nil {
		return nil
	}
	return b
}

func toCreateInput(b createBody) port.CreateInput {
	var private map[string]json.RawMessage
	if len(b.Private) > 0 {
		private = make(map[string]json.RawMessage, len(b.Private))
		for k, v := range b.Private {
			private[k] = toRaw(v)
		}
	}
	return port.CreateInput{
		UniversityID: b.UniversityID, Name: b.CourseName, Code: b.CourseCode, Level: b.Level,
		LevelCode: b.LevelCode, Degree: b.Degree, Stream: b.Stream, Faculty: b.Faculty,
		FacultyCode: b.FacultyCode, Language: b.Language, Duration: b.Duration,
		DurationUnit: b.DurationUnit, CoursePeriod: b.CoursePeriod,
		InterviewRequired: b.InterviewRequired, IsOnline: b.IsOnline, IntakeMonths: b.IntakeMonths,
		FeeCurrency: b.FeeCurrency, StartDate: b.StartDate, Deadline: b.Deadline,
		CountryServiceID:   b.CountryServiceID,
		BasicCourseDetails: toRaw(b.BasicCourseDetails), Info: toRaw(b.Info),
		Specialization: toRaw(b.Specialization), CampusLocation: toRaw(b.CampusLocation),
		Tags: toRaw(b.Tags), Pathway: toRaw(b.Pathway), CourseMetadata: toRaw(b.CourseMetadata),
		Private: private,
	}
}

func toFilter(in SearchInput) domain.Filter {
	return domain.Filter{
		Q: in.Q, UniversityID: in.UniversityID, CountryISO: in.Country, Level: in.Level,
		Stream: in.Stream, IntakeMonth: in.Intake, Specialization: in.Specialization,
		MinMonths: in.MinMonths, MaxMonths: in.MaxMonths, FeeCurrency: in.FeeCurrency,
		Featured: in.Featured, ScholarshipType: in.ScholarshipType, MaxTuitionNPR: in.MaxTuitionNPR,
		Test: in.Test, Score: in.Score, Sort: in.Sort, Page: in.Page, PageSize: in.PageSize,
	}
}

func toDTO(c domain.Course) CourseDTO {
	private := make(map[string]any, len(c.Private))
	for k, v := range c.Private {
		private[k] = rawAny(v)
	}
	months := c.IntakeMonths
	if months == nil {
		months = []string{}
	}
	return CourseDTO{
		ID: c.ID, UniversityID: c.UniversityID, CreatedBy: c.CreatedByEnterpriseID,
		IsAsterconsult: c.IsAsterconsult, CourseName: c.Name, CourseCode: c.Code, Slug: c.Slug,
		Status: string(c.Status), IsOnline: c.IsOnline, IsVerified: c.IsVerified, Level: c.Level,
		LevelCode: c.LevelCode, Degree: c.Degree, Stream: c.Stream, Faculty: c.Faculty,
		FacultyCode: c.FacultyCode, Language: c.Language, Duration: c.Duration,
		DurationUnit: c.DurationUnit, DurationMonths: c.DurationMonths, CoursePeriod: c.CoursePeriod,
		InterviewRequired: c.InterviewRequired, IntakeMonths: months, FeeCurrency: c.FeeCurrency,
		StartDate: c.StartDate, NextStartDate: c.NextStartDate, Deadline: c.Deadline,
		WaiverValidUntil: c.WaiverValidUntil, CountryServiceID: c.CountryServiceID,
		BasicCourseDetails: rawAny(c.BasicCourseDetails), Info: rawAny(c.Info),
		Specialization: rawAny(c.Specialization), CampusLocation: rawAny(c.CampusLocation),
		Tags: rawAny(c.Tags), Pathway: rawAny(c.Pathway), CourseMetadata: rawAny(c.CourseMetadata),
		Private: private, CreatedAt: c.CreatedAt, UpdatedAt: c.UpdatedAt,
	}
}