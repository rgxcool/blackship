package config

import (
	"encoding/base64"
	"fmt"

	"github.com/spf13/viper"
)

type Config struct {
	AppPort        string `mapstructure:"APP_PORT"`
	DatabaseURL    string `mapstructure:"DATABASE_URL"`
	FrontendOrigin string `mapstructure:"FRONTEND_ORIGIN"`

	CasdoorEndpoint     string `mapstructure:"CASDOOR_ENDPOINT"`
	CasdoorClientID     string `mapstructure:"CASDOOR_CLIENT_ID"`
	CasdoorClientSecret string `mapstructure:"CASDOOR_CLIENT_SECRET"`
	CasdoorCertificate  string `mapstructure:"CASDOOR_CERTIFICATE"`
	CasdoorOrganization string `mapstructure:"CASDOOR_ORGANIZATION"`
	CasdoorApplication  string `mapstructure:"CASDOOR_APPLICATION"`
}

func Load() (*Config, error) {

	viper.SetConfigFile(".env")
	viper.SetConfigType("env")

	// Read .env file
	if err := viper.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("failed to read config: %w", err)
	}

	// Read environment variables
	viper.AutomaticEnv()

	cfg := &Config{
		AppPort:        viper.GetString("APP_PORT"),
		DatabaseURL:    viper.GetString("DATABASE_URL"),
		FrontendOrigin: viper.GetString("FRONTEND_ORIGIN"),

		CasdoorEndpoint:     viper.GetString("CASDOOR_ENDPOINT"),
		CasdoorClientID:     viper.GetString("CASDOOR_CLIENT_ID"),
		CasdoorClientSecret: viper.GetString("CASDOOR_CLIENT_SECRET"),
		CasdoorOrganization: viper.GetString("CASDOOR_ORGANIZATION"),
		CasdoorApplication:  viper.GetString("CASDOOR_APPLICATION"),
	}

	if cfg.AppPort == "" {
		cfg.AppPort = "8080"
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	if cfg.FrontendOrigin == "" {
		cfg.FrontendOrigin = "http://localhost:5173"
	}

	for _, key := range []string{
		"CASDOOR_ENDPOINT", "CASDOOR_CLIENT_ID", "CASDOOR_CLIENT_SECRET",
		"CASDOOR_CERTIFICATE", "CASDOOR_ORGANIZATION", "CASDOOR_APPLICATION",
	} {
		if viper.GetString(key) == "" {
			return nil, fmt.Errorf("%s is required", key)
		}
	}

	cert, err := base64.StdEncoding.DecodeString(viper.GetString("CASDOOR_CERTIFICATE"))
	if err != nil {
		return nil, fmt.Errorf("CASDOOR_CERTIFICATE must be base64: %w", err)
	}
	cfg.CasdoorCertificate = string(cert)

	return cfg, nil
}
