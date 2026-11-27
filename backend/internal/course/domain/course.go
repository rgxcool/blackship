package domain

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

type Status string

const (
	StatusDraft     Status = "DRAFT"
	StatusPublished Status = "PUBLISHED"
)
type Viewer struct {
	EnterpriseID string
	IsPlatform   bool
}


type Course struct {
	ID                    string
	UniversityID          string
	CreatedByEnterpriseID string
	IsAsterconsult        bool
	Name                  string
	Code                  string
	Slug                  string
	Status                Status
	IsOnline              bool
	IsVerified            bool
	Level                 string
	LevelCode             string
	Degree                string
	Stream                string
	Faculty               string
	FacultyCode           string
	Language              string
	Duration              *int
	DurationUnit          string
	DurationMonths        *int16
	CoursePeriod          string
	InterviewRequired     bool
	IntakeMonths          []string
	FeeCurrency           string
	StartDate             *time.Time
	NextStartDate         *time.Time
	Deadline              *time.Time
	WaiverValidUntil      *time.Time
	CountryServiceID      string

	BasicCourseDetails json.RawMessage
	Info               json.RawMessage
	Specialization     json.RawMessage
	CampusLocation     json.RawMessage
	Tags               json.RawMessage
	Pathway            json.RawMessage
	CourseMetadata     json.RawMessage

	Private map[string]json.RawMessage

	CreatedAt time.Time
	UpdatedAt time.Time
}

func (c *Course) Validate() error {
	if strings.TrimSpace(c.UniversityID) == "" {
		return fmt.Errorf("%w: university_id is required", ErrInvalid)
	}
	if len(strings.TrimSpace(c.Name)) < 3 {
		return fmt.Errorf("%w: course_name must have at least 3 characters", ErrInvalid)
	}
	if strings.TrimSpace(c.Level) == "" {
		return fmt.Errorf("%w: level is required", ErrInvalid)
	}
	if c.FeeCurrency != "" && len(c.FeeCurrency) != 3 {
		return fmt.Errorf("%w: fee_currency must be a 3 letter code", ErrInvalid)
	}
	return nil
}