package auth

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"slices"
	"strings"

	"centralize-directory/internal/infrastructure/config"

	"github.com/casdoor/casdoor-go-sdk/casdoorsdk"
)

const signinPath = "/api/signin"

func NewClient(cfg *config.Config) *casdoorsdk.Client {
	return casdoorsdk.NewClient(
		cfg.CasdoorEndpoint,
		cfg.CasdoorClientID,
		cfg.CasdoorClientSecret,
		cfg.CasdoorCertificate,
		cfg.CasdoorOrganization,
		cfg.CasdoorApplication,
	)
}

// Handler registers the sign-in route on mux and requires a valid access token
// for every other request, so new routes are protected by default.
func Handler(client *casdoorsdk.Client, mux *http.ServeMux) http.Handler {
	mux.HandleFunc("POST "+signinPath, signin(client))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != signinPath {
			token, ok := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
			if !ok || verify(client, token) != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}
		}
		mux.ServeHTTP(w, r)
	})
}

// verify checks signature and expiry, and that the token is an access token
// issued to this application (organizations can share one certificate).
func verify(client *casdoorsdk.Client, token string) error {
	claims, err := client.ParseJwtToken(token)
	if err != nil {
		return err
	}
	if claims.IsRefreshToken() {
		return errors.New("refresh token used as access token")
	}
	if !slices.Contains(claims.Audience, client.ClientId) {
		return errors.New("token issued to another application")
	}
	return nil
}

func signin(client *casdoorsdk.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		code := r.URL.Query().Get("code")
		if code == "" {
			http.Error(w, "code is required", http.StatusBadRequest)
			return
		}

		token, err := client.GetOAuthToken(code, r.URL.Query().Get("state"))
		if err == nil {
			err = verify(client, token.AccessToken)
		}
		if err != nil {
			log.Println("casdoor sign-in failed:", err)
			http.Error(w, "sign-in failed", http.StatusUnauthorized)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-store")
		_ = json.NewEncoder(w).Encode(map[string]string{"access_token": token.AccessToken})
	}
}
