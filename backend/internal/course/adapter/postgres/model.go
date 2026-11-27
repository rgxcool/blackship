package postgres

import (
	"encoding/json"
	"time"

	"centralize-directory/internal/course/domain"

	"github.com/lib/pq"
)

// CourseShared holds the SHARED columns only. Private columns are never part
// of an insert: they start as '{}' and are changed one key at a time.
type CourseShared struct {
	CourseID              string         `gorm:"column:course_id;primaryKey"`
	UniversityID          string         `gorm:"column:university_id"`
	CreatedByEnterpriseID string         `gorm:"column:created_by_enterprise_id"`
	IsAsterconsult        bool           `gorm:"column:is_asterconsult"`
	CourseName            string         `gorm:"column:course_name"`
	CourseCode            *string        `gorm:"column:course_code"`
	Slug                  string         `gorm:"column:slug"`
	Status                string         `gorm:"column:status"`
	IsOnline              bool           `gorm:"column:is_online"`
	IsVerified            bool           `gorm:"column:is_verified"`
	Level                 string         `gorm:"column:level"`
	LevelCode             *string        `gorm:"column:level_code"`
	Degree                *string        `gorm:"column:degree"`
	Stream                *string        `gorm:"column:stream"`
	Faculty               *string        `gorm:"column:faculty"`
	FacultyCode           *string        `gorm:"column:faculty_code"`
	CourseLanguage        *string        `gorm:"column:course_language"`
	Duration              *int           `gorm:"column:duration"`
	DurationUnit          *string        `gorm:"column:duration_unit"`
	DurationMonths        *int16         `gorm:"column:duration_months"`
	CoursePeriod          *string        `gorm:"column:course_period"`
	InterviewRequired     bool           `gorm:"column:interview_required"`
	IntakeMonths          pq.StringArray `gorm:"column:intake_months;type:text[]"`
	FeeCurrency           *string        `gorm:"column:fee_currency"`
	StartDate             *time.Time     `gorm:"column:start_date"`
	NextStartDate         *time.Time     `gorm:"column:next_start_date"`
	Deadline              *time.Time     `gorm:"column:deadline"`
	WaiverValidUntil      *time.Time     `gorm:"column:waiver_valid_until"`
	CountryServiceID      *string        `gorm:"column:country_service_id"`
	BasicCourseDetails    string         `gorm:"column:basic_course_details;type:jsonb"`
	Info                  string         `gorm:"column:info;type:jsonb"`
	Specialization        string         `gorm:"column:specialization;type:jsonb"`
	CampusLocation        string         `gorm:"column:campus_location;type:jsonb"`
	Tags                  string         `gorm:"column:tags;type:jsonb"`
	Pathway               string         `gorm:"column:pathway;type:jsonb"`
	CourseMetadata        string         `gorm:"column:course_metadata;type:jsonb"`
	CreatedAt             time.Time      `gorm:"column:created_at"`
	UpdatedAt             time.Time      `gorm:"column:updated_at"`
}

func (CourseShared) TableName() string { return "course" }

// courseRow is what a read returns: shared columns plus ONE json blob
// ("private") that holds only the viewer's own entry of each private column.
type courseRow struct {
	CourseShared `gorm:"embedded"`
	Private      string `gorm:"column:private"`
}

func ptr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func deref(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func toWrite(c *domain.Course) CourseShared {
	return CourseShared{
		CourseID: c.ID, UniversityID: c.UniversityID, CreatedByEnterpriseID: c.CreatedByEnterpriseID,
		IsAsterconsult: c.IsAsterconsult, CourseName: c.Name, CourseCode: ptr(c.Code), Slug: c.Slug,
		Status: string(c.Status), IsOnline: c.IsOnline, IsVerified: c.IsVerified,
		Level: c.Level, LevelCode: ptr(c.LevelCode), Degree: ptr(c.Degree), Stream: ptr(c.Stream),
		Faculty: ptr(c.Faculty), FacultyCode: ptr(c.FacultyCode), CourseLanguage: ptr(c.Language),
		Duration: c.Duration, DurationUnit: ptr(c.DurationUnit), DurationMonths: c.DurationMonths,
		CoursePeriod: ptr(c.CoursePeriod), InterviewRequired: c.InterviewRequired,
		IntakeMonths: pq.StringArray(c.IntakeMonths), FeeCurrency: ptr(c.FeeCurrency),
		StartDate: c.StartDate, NextStartDate: c.NextStartDate, Deadline: c.Deadline,
		WaiverValidUntil: c.WaiverValidUntil, CountryServiceID: ptr(c.CountryServiceID),
		BasicCourseDetails: string(c.BasicCourseDetails), Info: string(c.Info),
		Specialization: string(c.Specialization), CampusLocation: string(c.CampusLocation),
		Tags: string(c.Tags), Pathway: string(c.Pathway), CourseMetadata: string(c.CourseMetadata),
		CreatedAt: c.CreatedAt, UpdatedAt: c.UpdatedAt,
	}
}

func (r courseRow) toDomain() domain.Course {
	c := domain.Course{
		ID: r.CourseID, UniversityID: r.UniversityID, CreatedByEnterpriseID: r.CreatedByEnterpriseID,
		IsAsterconsult: r.IsAsterconsult, Name: r.CourseName, Code: deref(r.CourseCode), Slug: r.Slug,
		Status: domain.Status(r.Status), IsOnline: r.IsOnline, IsVerified: r.IsVerified,
		Level: r.Level, LevelCode: deref(r.LevelCode), Degree: deref(r.Degree), Stream: deref(r.Stream),
		Faculty: deref(r.Faculty), FacultyCode: deref(r.FacultyCode), Language: deref(r.CourseLanguage),
		Duration: r.Duration, DurationUnit: deref(r.DurationUnit), DurationMonths: r.DurationMonths,
		CoursePeriod: deref(r.CoursePeriod), InterviewRequired: r.InterviewRequired,
		IntakeMonths: []string(r.IntakeMonths), FeeCurrency: deref(r.FeeCurrency),
		StartDate: r.StartDate, NextStartDate: r.NextStartDate, Deadline: r.Deadline,
		WaiverValidUntil: r.WaiverValidUntil, CountryServiceID: deref(r.CountryServiceID),
		BasicCourseDetails: json.RawMessage(r.BasicCourseDetails), Info: json.RawMessage(r.Info),
		Specialization: json.RawMessage(r.Specialization), CampusLocation: json.RawMessage(r.CampusLocation),
		Tags: json.RawMessage(r.Tags), Pathway: json.RawMessage(r.Pathway),
		CourseMetadata: json.RawMessage(r.CourseMetadata),
		CreatedAt:      r.CreatedAt, UpdatedAt: r.UpdatedAt,
		Private: map[string]json.RawMessage{},
	}
	var all map[string]json.RawMessage
	if r.Private != "" && json.Unmarshal([]byte(r.Private), &all) == nil {
		for k, v := range all {
			if string(v) != "null" && domain.IsPrivateField(k) {
				c.Private[k] = v
			}
		}
	}
	return c
}