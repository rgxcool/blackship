-- Create "country" table
CREATE TABLE "country" (
  "country_iso" character varying(3) NOT NULL,
  "currency_iso" character varying(3) NULL,
  "name" text NOT NULL,
  "logo_url" text NULL,
  "description" text NULL,
  "visa_information" jsonb NOT NULL DEFAULT '{}',
  "living_expenses" jsonb NOT NULL DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("country_iso"),
  CONSTRAINT "country_country_iso_check" CHECK (char_length((country_iso)::text) = 3)
);
