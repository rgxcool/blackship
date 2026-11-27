package app

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"centralize-directory/internal/course/domain"
	"centralize-directory/internal/course/port"
)

const maxSlugAttempts = 10

type Service struct {
	repo port.Repository
	unis port.UniversityReader
	now  func() time.Time
}

func NewService(repo port.Repository, unis port.UniversityReader) *Service {
	return &Service{repo: repo, unis: unis, now: time.Now}
}

func requireViewer(v domain.Viewer) error {
	if strings.TrimSpace(v.EnterpriseID) == "" {
		return domain.ErrForbidden
	}
	return nil
}

func newID() (string, error) {
	b := make([]byte, 12)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return "crs_" + hex.EncodeToString(b), nil
}

func orDefault(raw json.RawMessage, def string) json.RawMessage {
	if len(raw) == 0 || string(raw) == "null" {
		return json.RawMessage(def)
	}
	return raw
}

func (s *Service) Create(ctx context.Context, v domain.Viewer, in port.CreateInput) (*domain.Course, error) {
	if err := requireViewer(v); err != nil {
		return nil, err
	}

	months, err := domain.NormalizeIntakeMonths(in.IntakeMonths)
	if err != nil {
		return nil, err
	}

	c := &domain.Course{
		UniversityID:          strings.TrimSpace(in.UniversityID),
		CreatedByEnterpriseID: v.EnterpriseID,
		IsAsterconsult:        v.IsPlatform, // copied once, never edited
		Name:                  strings.TrimSpace(in.Name),
		Code:                  in.Code,
		Status:                domain.StatusDraft,
		IsOnline:              in.IsOnline,
		Level:                 strings.TrimSpace(in.Level),
		LevelCode:             in.LevelCode,
		Degree:                in.Degree,
		Stream:                in.Stream,
		Faculty:               in.Faculty,
		FacultyCode:           in.FacultyCode,
		Language:              in.Language,
		Duration:              in.Duration,
		DurationUnit:          in.DurationUnit,
		CoursePeriod:          in.CoursePeriod,
		InterviewRequired:     in.InterviewRequired,
		IntakeMonths:          months,
		FeeCurrency:           strings.ToUpper(strings.TrimSpace(in.FeeCurrency)),
		StartDate:             in.StartDate,
		Deadline:              in.Deadline,
		CountryServiceID:      in.CountryServiceID,
		BasicCourseDetails:    orDefault(in.BasicCourseDetails, "{}"),
		Info:                  orDefault(in.Info, "{}"),
		Specialization:        orDefault(in.Specialization, "[]"),
		CampusLocation:        orDefault(in.CampusLocation, "[]"),
		Tags:                  orDefault(in.Tags, "[]"),
		Pathway:               orDefault(in.Pathway, "{}"),
		CourseMetadata:        orDefault(in.CourseMetadata, "{}"),
	}
	if err := c.Validate(); err != nil {
		return nil, err
	}

	if in.Duration != nil {
		m, err := domain.ToMonths(*in.Duration, in.DurationUnit)
		if err != nil {
			return nil, err
		}
		c.DurationMonths = &m
	}

	for field, raw := range in.Private {
		if err := domain.ValidatePrivate(field, raw); err != nil {
			return nil, err
		}
	}

	ok, err := s.unis.Visible(ctx, v, c.UniversityID)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, domain.ErrUniversityNotFound
	}

	if c.ID, err = newID(); err != nil {
		return nil, err
	}
	now := s.now().UTC()
	c.CreatedAt, c.UpdatedAt = now, now

	// the slug is made once, and a clash inside the university adds a number
	base := domain.Slugify(c.Name)
	for attempt := 0; attempt < maxSlugAttempts; attempt++ {
		c.Slug = domain.SlugCandidate(base, attempt)
		err = s.repo.Insert(ctx, c, in.Private)
		if !errors.Is(err, domain.ErrSlugTaken) {
			break
		}
	}
	if err != nil {
		return nil, err
	}
	return s.repo.Get(ctx, v, c.ID)
}

func (s *Service) Get(ctx context.Context, v domain.Viewer, id string) (*domain.Course, error) {
	if err := requireViewer(v); err != nil {
		return nil, err
	}
	return s.repo.Get(ctx, v, id)
}

func (s *Service) Search(ctx context.Context, v domain.Viewer, f domain.Filter) (*port.Page, error) {
	if err := requireViewer(v); err != nil {
		return nil, err
	}
	f.Normalize()
	if f.ScholarshipType != "" && f.ScholarshipType != "flat" && f.ScholarshipType != "percentage" {
		return nil, fmt.Errorf("%w: scholarship_type must be flat or percentage", domain.ErrInvalid)
	}
	if f.IntakeMonth != "" {
		m, err := domain.NormalizeIntakeMonths([]string{f.IntakeMonth})
		if err != nil {
			return nil, err
		}
		f.IntakeMonth = m[0]
	}
	items, total, err := s.repo.Search(ctx, v, f)
	if err != nil {
		return nil, err
	}
	return &port.Page{Items: items, Total: total, Page: f.Page, PageSize: f.PageSize}, nil
}

// SetPrivate saves ONE company's value for ONE private column.
// Only the viewer's own key is written.
func (s *Service) SetPrivate(ctx context.Context, v domain.Viewer, id, field string, value json.RawMessage) error {
	if err := requireViewer(v); err != nil {
		return err
	}
	if err := domain.ValidatePrivate(field, value); err != nil {
		return err
	}
	return s.repo.SetPrivate(ctx, v, id, field, value)
}

func (s *Service) Delete(ctx context.Context, v domain.Viewer, id string) error {
	if err := requireViewer(v); err != nil {
		return err
	}
	return s.repo.SoftDelete(ctx, v, id)
}

// Publish makes a draft visible to every company with access.
// Only the creator or the platform enterprise can do it.
func (s *Service) Publish(ctx context.Context, v domain.Viewer, id string) error {
	if err := requireViewer(v); err != nil {
		return err
	}
	return s.repo.Publish(ctx, v, id)
}