package port

import (
	"context"
	"encoding/json"
	"time"

	"centralize-directory/internal/course/domain"
)

// CreateInput is what the HTTP adapter hands to the service.
type CreateInput struct {
	UniversityID      string
	Name              string
	Code              string
	Level             string
	LevelCode         string
	Degree            string
	Stream            string
	Faculty           string
	FacultyCode       string
	Language          string
	Duration          *int
	DurationUnit      string
	CoursePeriod      string
	InterviewRequired bool
	IsOnline          bool
	IntakeMonths      []string
	FeeCurrency       string
	StartDate         *time.Time
	Deadline          *time.Time
	CountryServiceID  string

	BasicCourseDetails json.RawMessage
	Info               json.RawMessage
	Specialization     json.RawMessage
	CampusLocation     json.RawMessage
	Tags               json.RawMessage
	Pathway            json.RawMessage
	CourseMetadata     json.RawMessage

	// the creator's own private values, keyed by column name
	Private map[string]json.RawMessage
}

type Page struct {
	Items    []domain.Course
	Total    int64
	Page     int
	PageSize int
}

// Service is the inbound port: what the outside world can ask of courses.
type Service interface {
	Create(ctx context.Context, v domain.Viewer, in CreateInput) (*domain.Course, error)
	Get(ctx context.Context, v domain.Viewer, id string) (*domain.Course, error)
	Search(ctx context.Context, v domain.Viewer, f domain.Filter) (*Page, error)
	SetPrivate(ctx context.Context, v domain.Viewer, id, field string, value json.RawMessage) error
	Publish(ctx context.Context, v domain.Viewer, id string) error
	Delete(ctx context.Context, v domain.Viewer, id string) error
}