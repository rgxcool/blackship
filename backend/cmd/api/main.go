package main

import (
	"log"
	"net/http"

	"centralize-directory/internal/course"
	"centralize-directory/internal/infrastructure/auth"
	"centralize-directory/internal/infrastructure/config"
	"centralize-directory/internal/infrastructure/database"
	"centralize-directory/internal/infrastructure/server"

	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/fx"
)

func main() {

	fx.New(

		fx.Provide(
			config.Load,
			database.NewPostgres,
			database.NewGorm,
			auth.NewClient,
			server.NewRouter,
			server.NewAPI,
			server.NewServer,
		),

		course.Module,

		fx.Invoke(func(
			db *pgxpool.Pool,
			httpServer *http.Server,
		) {
			log.Println("PostgreSQL connected successfully!")
			log.Println("HTTP server initialized:", httpServer.Addr)
		}),
	).Run()
}
