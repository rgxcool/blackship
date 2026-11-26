-- Create "course" table
CREATE TABLE "course" (
  "course_id" uuid NOT NULL DEFAULT uuidv7(),
  "university_id" uuid NOT NULL,
  "created_by_enterprise_id" uuid NOT NULL,
  "is_asterconsult" boolean NOT NULL DEFAULT false,
  "course_name" text NOT NULL,
  "course_code" text NULL,
  "slug" text NOT NULL,
  "status" character varying(20) NOT NULL DEFAULT 'DRAFT',
  "is_online" boolean NOT NULL DEFAULT false,
  "is_verified" boolean NOT NULL DEFAULT false,
  "level" text NULL,
  "level_code" text NULL,
  "degree" text NULL,
  "stream" text NULL,
  "faculty" text NULL,
  "faculty_code" text NULL,
  "course_language" text NULL,
  "duration" integer NULL,
  "duration_unit" text NULL,
  "duration_months" smallint NULL,
  "course_period" text NULL,
  "interview_required" boolean NOT NULL DEFAULT false,
  "intake_months" text[] NOT NULL DEFAULT '{}',
  "fee_currency" character varying(3) NULL,
  "start_date" timestamptz NULL,
  "next_start_date" timestamptz NULL,
  "deadline" timestamptz NULL,
  "waiver_valid_until" date NULL,
  "country_service_id" text NULL,
  "basic_course_details" jsonb NOT NULL DEFAULT '{}',
  "info" jsonb NOT NULL DEFAULT '{}',
  "specialization" jsonb NOT NULL DEFAULT '[]',
  "campus_location" jsonb NOT NULL DEFAULT '[]',
  "tags" jsonb NOT NULL DEFAULT '[]',
  "pathway" jsonb NOT NULL DEFAULT '{}',
  "course_metadata" jsonb NOT NULL DEFAULT '{}',
  "is_feature" jsonb NOT NULL DEFAULT '{}',
  "is_publish_to_provider_hub" jsonb NOT NULL DEFAULT '{}',
  "marquee" jsonb NOT NULL DEFAULT '{}',
  "intakes" jsonb NOT NULL DEFAULT '{}',
  "tuition_fee" jsonb NOT NULL DEFAULT '{}',
  "application_fee_waiver" jsonb NOT NULL DEFAULT '{}',
  "scholarship" jsonb NOT NULL DEFAULT '{}',
  "requirement_overrides" jsonb NOT NULL DEFAULT '{}',
  "proficiency_test_score" jsonb NOT NULL DEFAULT '{}',
  "notes" jsonb NOT NULL DEFAULT '{}',
  "commission" jsonb NOT NULL DEFAULT '{}',
  "admission" jsonb NOT NULL DEFAULT '{}',
  "contacts" jsonb NOT NULL DEFAULT '{}',
  "document_checklist" jsonb NOT NULL DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz NULL,
  PRIMARY KEY ("course_id"),
  CONSTRAINT "course_created_by_enterprise_id_fkey" FOREIGN KEY ("created_by_enterprise_id") REFERENCES "enterprise" ("enterprise_id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "course_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "university" ("university_id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "course_status_check" CHECK ((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PUBLISHED'::character varying])::text[]))
);
-- Create index "course_course_language_idx" to table: "course"
CREATE INDEX "course_course_language_idx" ON "course" ("course_language");
-- Create index "course_created_by_enterprise_id_idx" to table: "course"
CREATE INDEX "course_created_by_enterprise_id_idx" ON "course" ("created_by_enterprise_id");
-- Create index "course_duration_months_idx" to table: "course"
CREATE INDEX "course_duration_months_idx" ON "course" ("duration_months");
-- Create index "course_faculty_idx" to table: "course"
CREATE INDEX "course_faculty_idx" ON "course" ("faculty");
-- Create index "course_intake_months_gin" to table: "course"
CREATE INDEX "course_intake_months_gin" ON "course" USING GIN ("intake_months");
-- Create index "course_is_feature_gin" to table: "course"
CREATE INDEX "course_is_feature_gin" ON "course" USING GIN ("is_feature");
-- Create index "course_level_idx" to table: "course"
CREATE INDEX "course_level_idx" ON "course" ("level");
-- Create index "course_scholarship_gin" to table: "course"
CREATE INDEX "course_scholarship_gin" ON "course" USING GIN ("scholarship");
-- Create index "course_specialization_gin" to table: "course"
CREATE INDEX "course_specialization_gin" ON "course" USING GIN ("specialization");
-- Create index "course_stream_idx" to table: "course"
CREATE INDEX "course_stream_idx" ON "course" ("stream");
-- Create index "course_university_id_idx" to table: "course"
CREATE INDEX "course_university_id_idx" ON "course" ("university_id");
-- Create index "course_university_slug_key" to table: "course"
CREATE UNIQUE INDEX "course_university_slug_key" ON "course" ("university_id", "slug") WHERE (deleted_at IS NULL);
