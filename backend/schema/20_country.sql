CREATE TABLE country (
  country_iso  varchar(3) PRIMARY KEY CHECK (char_length(country_iso) = 3),
  currency_iso varchar(3),
  name         text NOT NULL,
  logo_url      text,
  description   text, 
  visa_information jsonb NOT NULL DEFAULT '{}'::jsonb,
  living_expenses jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);