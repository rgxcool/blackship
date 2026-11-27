package course

import (
	"centralize-directory/internal/course/adapter/http"
	"centralize-directory/internal/course/adapter/postgres"
	"centralize-directory/internal/course/app"
	"centralize-directory/internal/course/port"

	"go.uber.org/fx"
)

var Module = fx.Module("course",
	fx.Provide(
		fx.Annotate(postgres.NewRepo, fx.As(new(port.Repository))),
		fx.Annotate(postgres.NewUniversityReader, fx.As(new(port.UniversityReader))),
		fx.Annotate(app.NewService, fx.As(new(port.Service))),
	),
	fx.Invoke(http.Register),
)