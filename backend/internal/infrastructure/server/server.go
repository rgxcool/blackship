package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"centralize-directory/internal/infrastructure/config"

	"go.uber.org/fx"
)

func NewServer(
	lc fx.Lifecycle,
	cfg *config.Config,
) *http.Server {

	server := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.AppPort),
		Handler:      http.NewServeMux(),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {

			go func() {
				log.Printf("HTTP server listening on %s", server.Addr)

				if err := server.ListenAndServe(); err != nil &&
					err != http.ErrServerClosed {
					log.Printf("HTTP server error: %v", err)
				}
			}()

			return nil
		},

		OnStop: func(ctx context.Context) error {
			log.Println("Shutting down HTTP server...")

			return server.Shutdown(ctx)
		},
	})

	return server
}