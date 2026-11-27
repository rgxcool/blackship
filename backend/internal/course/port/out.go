package port

import (
	"context"
	"encoding/json"

	"centralize-directory/internal/course/domain"
)

type Repository interface {
	Insert(ctx context.Context, c *domain.Course, private map[string]json.RawMessage) error
	Get(ctx context.Context, v domain.Viewer, id string) (*domain.Course, error)
	Search(ctx context.Context, v domain.Viewer, f domain.Filter) ([]domain.Course, int64, error)
	SetPrivate(ctx context.Context, v domain.Viewer, id, field string, value json.RawMessage) error
	Publish(ctx context.Context, v domain.Viewer, id string) error
	SoftDelete(ctx context.Context, v domain.Viewer, id string) error
}


type UniversityReader interface {
	Visible(ctx context.Context, v domain.Viewer, universityID string) (bool, error)
}
