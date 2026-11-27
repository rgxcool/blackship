package http

import (
	"context"
	"errors"
	"log"
	nethttp "net/http"

	"centralize-directory/internal/course/domain"
	"centralize-directory/internal/course/port"
	"centralize-directory/internal/infrastructure/auth"

	"github.com/danielgtaylor/huma/v2"
)

func viewer(ctx context.Context) (domain.Viewer, error) {
	v, ok := auth.FromContext(ctx)
	if !ok {
		return domain.Viewer{}, huma.Error401Unauthorized("no enterprise on the request")
	}
	return domain.Viewer{EnterpriseID: v.EnterpriseID, IsPlatform: v.IsPlatform}, nil
}

// httpErr turns a domain error into the right HTTP status.
func httpErr(err error) error {
	switch {
	case errors.Is(err, domain.ErrNotFound):
		return huma.Error404NotFound(err.Error())
	case errors.Is(err, domain.ErrForbidden):
		return huma.Error403Forbidden(err.Error())
	case errors.Is(err, domain.ErrUnknownField):
		return huma.Error400BadRequest(err.Error())
	case errors.Is(err, domain.ErrInvalid),
		errors.Is(err, domain.ErrUniversityNotFound),
		errors.Is(err, domain.ErrEnterpriseNotFound),
		errors.Is(err, domain.ErrSlugTaken):
		return huma.Error422UnprocessableEntity(err.Error())
	default:
		log.Printf("course: unexpected error: %v", err)
		return huma.Error500InternalServerError("internal error")
	}
}

// Register adds the course routes to the Huma API. FX calls it at start-up.
func Register(api huma.API, svc port.Service) {
	huma.Register(api, huma.Operation{
		OperationID: "create-course", Method: nethttp.MethodPost, Path: "/courses",
		Summary: "Create a course (starts as DRAFT)", DefaultStatus: nethttp.StatusCreated,
		Tags: []string{"courses"},
	}, func(ctx context.Context, in *CreateInput) (*CourseOutput, error) {
		v, err := viewer(ctx)
		if err != nil {
			return nil, err
		}
		c, err := svc.Create(ctx, v, toCreateInput(in.Body))
		if err != nil {
			return nil, httpErr(err)
		}
		return &CourseOutput{Body: toDTO(*c)}, nil
	})

	huma.Register(api, huma.Operation{
		OperationID: "get-course", Method: nethttp.MethodGet, Path: "/courses/{id}",
		Summary: "Get one course with YOUR private data", Tags: []string{"courses"},
	}, func(ctx context.Context, in *IDInput) (*CourseOutput, error) {
		v, err := viewer(ctx)
		if err != nil {
			return nil, err
		}
		c, err := svc.Get(ctx, v, in.ID)
		if err != nil {
			return nil, httpErr(err)
		}
		return &CourseOutput{Body: toDTO(*c)}, nil
	})

	huma.Register(api, huma.Operation{
		OperationID: "search-courses", Method: nethttp.MethodGet, Path: "/courses",
		Summary: "Search courses", Tags: []string{"courses"},
	}, func(ctx context.Context, in *SearchInput) (*SearchOutput, error) {
		v, err := viewer(ctx)
		if err != nil {
			return nil, err
		}
		page, err := svc.Search(ctx, v, toFilter(*in))
		if err != nil {
			return nil, httpErr(err)
		}
		out := &SearchOutput{}
		out.Body.Items = make([]CourseDTO, 0, len(page.Items))
		for _, c := range page.Items {
			out.Body.Items = append(out.Body.Items, toDTO(c))
		}
		out.Body.Total, out.Body.Page, out.Body.PageSize = page.Total, page.Page, page.PageSize
		return out, nil
	})

	huma.Register(api, huma.Operation{
		OperationID: "set-course-private", Method: nethttp.MethodPut, Path: "/courses/{id}/private/{field}",
		Summary: "Save YOUR company's value for one private field", DefaultStatus: nethttp.StatusNoContent,
		Tags: []string{"courses"},
	}, func(ctx context.Context, in *PrivateInput) (*struct{}, error) {
		v, err := viewer(ctx)
		if err != nil {
			return nil, err
		}
		if err := svc.SetPrivate(ctx, v, in.ID, in.Field, in.RawBody); err != nil {
			return nil, httpErr(err)
		}
		return nil, nil
	})

	huma.Register(api, huma.Operation{
		OperationID: "publish-course", Method: nethttp.MethodPost, Path: "/courses/{id}/publish",
		Summary: "Make a draft visible to every company with access", DefaultStatus: nethttp.StatusNoContent,
		Tags: []string{"courses"},
	}, func(ctx context.Context, in *IDInput) (*struct{}, error) {
		v, err := viewer(ctx)
		if err != nil {
			return nil, err
		}
		if err := svc.Publish(ctx, v, in.ID); err != nil {
			return nil, httpErr(err)
		}
		return nil, nil
	})

	huma.Register(api, huma.Operation{
		OperationID: "delete-course", Method: nethttp.MethodDelete, Path: "/courses/{id}",
		Summary: "Soft delete (creator or platform only)", DefaultStatus: nethttp.StatusNoContent,
		Tags: []string{"courses"},
	}, func(ctx context.Context, in *IDInput) (*struct{}, error) {
		v, err := viewer(ctx)
		if err != nil {
			return nil, err
		}
		if err := svc.Delete(ctx, v, in.ID); err != nil {
			return nil, httpErr(err)
		}
		return nil, nil
	})
}