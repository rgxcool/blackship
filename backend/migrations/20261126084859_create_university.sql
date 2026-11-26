-- Create "university" table
CREATE TABLE "university" (
  "university_id" uuid NOT NULL DEFAULT uuidv7(),
  "created_by_enterprise_id" uuid NOT NULL,
  "country_iso" character varying(3) NOT NULL,
  "is_asterconsult" boolean NOT NULL DEFAULT false,
  "name" text NOT NULL,
  "match_version" smallint NOT NULL,
  "match_key" text NOT NULL,
  "match_text" text NOT NULL,
  "slug" text NOT NULL,
  "status" character varying(20) NOT NULL DEFAULT 'DRAFT',
  "is_verified" boolean NOT NULL DEFAULT false,
  "logo_url" text NULL,
  "website" text NULL,
  "basic_description" text NULL,
  "email" text NULL,
  "location" text NULL,
  "state" text NULL,
  "institution_service_country_id" text NULL,
  "institution_id" text NULL,
  "default_duration" text NULL,
  "default_stay_back_duration" text NULL,
  "education_levels" text[] NOT NULL DEFAULT '{}',
  "campuses" jsonb NOT NULL DEFAULT '[]',
  "university_info" jsonb NOT NULL DEFAULT '{}',
  "properties" jsonb NOT NULL DEFAULT '{}',
  "ownership_type" jsonb NOT NULL DEFAULT '{}',
  "agreement_type" jsonb NOT NULL DEFAULT '{}',
  "marquee_status" jsonb NOT NULL DEFAULT '{}',
  "is_publish_to_provider_hub" jsonb NOT NULL DEFAULT '{}',
  "indirect" jsonb NOT NULL DEFAULT '{}',
  "direct_contract" jsonb NOT NULL DEFAULT '{}',
  "agreement_details" jsonb NOT NULL DEFAULT '{}',
  "marquee_details" jsonb NOT NULL DEFAULT '{}',
  "requirements" jsonb NOT NULL DEFAULT '{}',
  "english_requirements" jsonb NOT NULL DEFAULT '{}',
  "financial_requirements" jsonb NOT NULL DEFAULT '{}',
  "key_dates" jsonb NOT NULL DEFAULT '{}',
  "resources" jsonb NOT NULL DEFAULT '{}',
  "counselling_territories" jsonb NOT NULL DEFAULT '{}',
  "contacts" jsonb NOT NULL DEFAULT '{}',
  "admission" jsonb NOT NULL DEFAULT '{}',
  "intakes" jsonb NOT NULL DEFAULT '{}',
  "profile" jsonb NOT NULL DEFAULT '{}',
  "contract" jsonb NOT NULL DEFAULT '{}',
  "documents" jsonb NOT NULL DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz NULL,
  PRIMARY KEY ("university_id"),
  CONSTRAINT "university_country_iso_fkey" FOREIGN KEY ("country_iso") REFERENCES "country" ("country_iso") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "university_created_by_enterprise_id_fkey" FOREIGN KEY ("created_by_enterprise_id") REFERENCES "enterprise" ("enterprise_id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "university_status_check" CHECK ((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PUBLISHED'::character varying])::text[]))
);
-- Create index "university_country_iso_idx" to table: "university"
CREATE INDEX "university_country_iso_idx" ON "university" ("country_iso");
-- Create index "university_created_by_enterprise_id_idx" to table: "university"
CREATE INDEX "university_created_by_enterprise_id_idx" ON "university" ("created_by_enterprise_id");
-- Create index "university_education_levels_gin" to table: "university"
CREATE INDEX "university_education_levels_gin" ON "university" USING GIN ("education_levels");
-- Create index "university_match_key_key" to table: "university"
CREATE UNIQUE INDEX "university_match_key_key" ON "university" ("match_key") WHERE (deleted_at IS NULL);
-- Create index "university_ownership_type_gin" to table: "university"
CREATE INDEX "university_ownership_type_gin" ON "university" USING GIN ("ownership_type");
-- Create index "university_slug_key" to table: "university"
CREATE UNIQUE INDEX "university_slug_key" ON "university" ("slug") WHERE (deleted_at IS NULL);
-- Create "university_slug_alias" table
CREATE TABLE "university_slug_alias" (
  "slug" text NOT NULL,
  "university_id" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("slug"),
  CONSTRAINT "university_slug_alias_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "university" ("university_id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "university_slug_alias_university_id_idx" to table: "university_slug_alias"
CREATE INDEX "university_slug_alias_university_id_idx" ON "university_slug_alias" ("university_id");
