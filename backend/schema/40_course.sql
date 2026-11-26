CREATE TABLE course (
    course_id                  uuid PRIMARY KEY DEFAULT uuidv7(),
    university_id              uuid NOT NULL REFERENCES university (university_id),
    created_by_enterprise_id   uuid NOT NULL REFERENCES enterprise (enterprise_id),
    is_asterconsult            boolean NOT NULL DEFAULT false,
    course_name                text NOT NULL,
    course_code                text,
    slug                       text NOT NULL,
    status                     varchar(20) NOT NULL DEFAULT 'DRAFT'
                               CHECK (status IN ('DRAFT', 'PUBLISHED')),
    is_online                  boolean NOT NULL DEFAULT false,
    is_verified                boolean NOT NULL DEFAULT false,
    level                      text,
    level_code                 text,
    degree                     text,
    stream                     text,
    faculty                    text,
    faculty_code               text,
    course_language            text,
    duration                   integer,
    duration_unit              text,
    duration_months            smallint,
    course_period              text,
    interview_required         boolean NOT NULL DEFAULT false,
    intake_months              text[] NOT NULL DEFAULT '{}',
    fee_currency               varchar(3),
    start_date                 timestamptz,
    next_start_date            timestamptz,
    deadline                   timestamptz,
    waiver_valid_until         date,
    country_service_id         text,
    basic_course_details       jsonb NOT NULL DEFAULT '{}',
    info                       jsonb NOT NULL DEFAULT '{}',
    specialization             jsonb NOT NULL DEFAULT '[]',
    campus_location            jsonb NOT NULL DEFAULT '[]',
    tags                       jsonb NOT NULL DEFAULT '[]',
    pathway                    jsonb NOT NULL DEFAULT '{}',
    course_metadata            jsonb NOT NULL DEFAULT '{}',

    -- PRIVATE maps, keyed by enterprise_id
    is_feature                 jsonb NOT NULL DEFAULT '{}',
    is_publish_to_provider_hub jsonb NOT NULL DEFAULT '{}',
    marquee                    jsonb NOT NULL DEFAULT '{}',
    intakes                    jsonb NOT NULL DEFAULT '{}',
    tuition_fee                jsonb NOT NULL DEFAULT '{}',
    application_fee_waiver     jsonb NOT NULL DEFAULT '{}',
    scholarship                jsonb NOT NULL DEFAULT '{}',
    requirement_overrides      jsonb NOT NULL DEFAULT '{}',
    proficiency_test_score     jsonb NOT NULL DEFAULT '{}',
    notes                      jsonb NOT NULL DEFAULT '{}',
    commission                 jsonb NOT NULL DEFAULT '{}',
    admission                  jsonb NOT NULL DEFAULT '{}',
    contacts                   jsonb NOT NULL DEFAULT '{}',
    document_checklist         jsonb NOT NULL DEFAULT '{}',

    created_at                 timestamptz NOT NULL DEFAULT now(),
    updated_at                 timestamptz NOT NULL DEFAULT now(),
    deleted_at                 timestamptz
);

CREATE UNIQUE INDEX course_university_slug_key
    ON course (university_id, slug) WHERE deleted_at IS NULL;

CREATE INDEX course_university_id_idx
    ON course (university_id);

CREATE INDEX course_created_by_enterprise_id_idx
    ON course (created_by_enterprise_id);

CREATE INDEX course_level_idx ON course (level);
CREATE INDEX course_stream_idx ON course (stream);
CREATE INDEX course_faculty_idx ON course (faculty);
CREATE INDEX course_course_language_idx ON course (course_language);
CREATE INDEX course_duration_months_idx ON course (duration_months);

CREATE INDEX course_intake_months_gin
    ON course USING gin (intake_months);

CREATE INDEX course_specialization_gin
    ON course USING gin (specialization);

CREATE INDEX course_is_feature_gin
    ON course USING gin (is_feature);

CREATE INDEX course_scholarship_gin
    ON course USING gin (scholarship);