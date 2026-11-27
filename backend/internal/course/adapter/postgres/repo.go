package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"centralize-directory/internal/course/domain"

	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"
)

type Repo struct{ db *gorm.DB }

func NewRepo(db *gorm.DB) *Repo { return &Repo{db: db} }

// sharedCols are the columns every company may read.
const sharedCols = `c.course_id, c.university_id, c.created_by_enterprise_id, c.is_asterconsult,
 c.course_name, c.course_code, c.slug, c.status, c.is_online, c.is_verified, c.level, c.level_code,
 c.degree, c.stream, c.faculty, c.faculty_code, c.course_language, c.duration, c.duration_unit,
 c.duration_months, c.course_period, c.interview_required, c.intake_months, c.fee_currency,
 c.start_date, c.next_start_date, c.deadline, c.waiver_valid_until, c.country_service_id,
 c.basic_course_details, c.info, c.specialization, c.campus_location, c.tags, c.pathway,
 c.course_metadata, c.created_at, c.updated_at`

// privateSelect builds ONE json object holding only the viewer's own entry of
// every private column. The column names come from the allow-list in the domain.
func privateSelect(viewer string) (string, []any) {
	parts := make([]string, 0, len(domain.PrivateFields))
	args := make([]any, 0, len(domain.PrivateFields))
	for _, f := range domain.PrivateFields {
		parts = append(parts, fmt.Sprintf("'%s', c.%s -> ?::text", f, f))
		args = append(args, viewer)
	}
	return "jsonb_build_object(" + strings.Join(parts, ", ") + ") AS private", args
}

// visible is the draft rule: a draft is seen only by its creator and the platform.
const visible = "(c.status = 'PUBLISHED' OR c.created_by_enterprise_id = ? OR ?)"

func (r *Repo) Get(ctx context.Context, v domain.Viewer, id string) (*domain.Course, error) {
	sel, args := privateSelect(v.EnterpriseID)
	var row courseRow
	res := r.db.WithContext(ctx).Table("course AS c").
		Select(sharedCols+", "+sel, args...).
		Where("c.course_id = ? AND c.deleted_at IS NULL", id).
		Where(visible, v.EnterpriseID, v.IsPlatform).
		Limit(1).Scan(&row)
	if res.Error != nil {
		return nil, res.Error
	}
	if res.RowsAffected == 0 {
		return nil, domain.ErrNotFound
	}
	c := row.toDomain()
	return &c, nil
}

func (r *Repo) Insert(ctx context.Context, c *domain.Course, private map[string]json.RawMessage) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		w := toWrite(c)
		if err := tx.Create(&w).Error; err != nil {
			return mapErr(err)
		}
		for field, raw := range private {
			if err := setPrivateKey(tx, field, c.CreatedByEnterpriseID, c.ID, raw); err != nil {
				return err
			}
		}
		return nil
	})
}

// setPrivateKey changes ONE key of one private column. jsonb_set touches only
// the viewer's key, so two companies saving at the same time cannot overwrite
// each other. field must already be checked against the allow-list.
func setPrivateKey(tx *gorm.DB, field, viewer, id string, raw json.RawMessage) error {
	if !domain.IsPrivateField(field) {
		return domain.ErrUnknownField
	}
	sql := fmt.Sprintf(`UPDATE course
		SET %[1]s = jsonb_set(COALESCE(%[1]s, '{}'::jsonb), ARRAY[?]::text[], ?::jsonb, true),
		    updated_at = now()
		WHERE course_id = ? AND deleted_at IS NULL`, field)
	res := tx.Exec(sql, viewer, string(raw), id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *Repo) SetPrivate(ctx context.Context, v domain.Viewer, id, field string, raw json.RawMessage) error {
	if !domain.IsPrivateField(field) {
		return domain.ErrUnknownField
	}
	sql := fmt.Sprintf(`UPDATE course c
		SET %[1]s = jsonb_set(COALESCE(c.%[1]s, '{}'::jsonb), ARRAY[?]::text[], ?::jsonb, true),
		    updated_at = now()
		WHERE c.course_id = ? AND c.deleted_at IS NULL
		  AND `+visible, field)
	res := r.db.WithContext(ctx).Exec(sql, v.EnterpriseID, string(raw), id, v.EnterpriseID, v.IsPlatform)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *Repo) Publish(ctx context.Context, v domain.Viewer, id string) error {
	return r.changeOwned(ctx, v, id, "status = 'PUBLISHED'")
}

func (r *Repo) SoftDelete(ctx context.Context, v domain.Viewer, id string) error {
	return r.changeOwned(ctx, v, id, "deleted_at = now()")
}

// changeOwned runs an update that only the creator or the platform may do.
// Ownership is part of the same UPDATE, so a stranger changes nothing and
// gets "not found". set is always a constant written in this file.
func (r *Repo) changeOwned(ctx context.Context, v domain.Viewer, id, set string) error {
	res := r.db.WithContext(ctx).Exec(
		"UPDATE course SET "+set+", updated_at = now() "+
			"WHERE course_id = ? AND deleted_at IS NULL AND (created_by_enterprise_id = ? OR ?)",
		id, v.EnterpriseID, v.IsPlatform)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func mapErr(err error) error {
	var pg *pgconn.PgError
	if errors.As(err, &pg) {
		switch {
		case pg.Code == "23505" && pg.ConstraintName == "course_slug_uq":
			return domain.ErrSlugTaken
		case pg.Code == "23503" && pg.ConstraintName == "course_university_fk":
			return domain.ErrUniversityNotFound
		case pg.Code == "23503" && pg.ConstraintName == "course_enterprise_fk":
			return domain.ErrEnterpriseNotFound
		}
	}
	return err
}