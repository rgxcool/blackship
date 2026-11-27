package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"centralize-directory/internal/infrastructure/auth"
	"centralize-directory/internal/infrastructure/config"

	"github.com/casdoor/casdoor-go-sdk/casdoorsdk"

	"go.uber.org/fx"
)

func NewServer(
	lc fx.Lifecycle,
	cfg *config.Config,
	casdoor *casdoorsdk.Client,
) *http.Server {

	server := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.AppPort),
		Handler:      cors(cfg.FrontendOrigin, auth.Handler(casdoor, http.NewServeMux())),
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

// cors lets the frontend origin call the API. It runs before auth because
// preflight requests carry no token.
func cors(origin string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
