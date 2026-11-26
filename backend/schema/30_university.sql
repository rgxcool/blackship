CREATE TABLE university (
    university_id                  varchar(16) PRIMARY KEY DEFAULT left(replace(gen_random_uuid()::text, '-', ''), 16),
    created_by_enterprise_id       varchar(16) NOT NULL REFERENCES enterprise (enterprise_id),
    country_iso                    varchar(3) NOT NULL REFERENCES country (country_iso),
    is_asterconsult                boolean NOT NULL DEFAULT false,
    name                           text NOT NULL,
    match_version                  smallint NOT NULL,
    match_key                      text NOT NULL,
    match_text                     text NOT NULL,
    slug                           text NOT NULL,
    status                         varchar(20) NOT NULL DEFAULT 'DRAFT'
                                   CHECK (status IN ('DRAFT', 'PUBLISHED')),
    is_verified                    boolean NOT NULL DEFAULT false,
    logo_url                       text,
    website                        text,
    basic_description              text,
    email                          text,
    location                       text,
    state                          text,
    institution_service_country_id text,
    institution_id                 text,
    default_duration               text,
    default_stay_back_duration     text,
    education_levels               text[] NOT NULL DEFAULT '{}',
    campuses                       jsonb NOT NULL DEFAULT '[]',
    university_info                jsonb NOT NULL DEFAULT '{}',
    properties                     jsonb NOT NULL DEFAULT '{}',

    -- PRIVATE maps, keyed by enterprise_id
    ownership_type                 jsonb NOT NULL DEFAULT '{}',
    agreement_type                 jsonb NOT NULL DEFAULT '{}',
    marquee_status                 jsonb NOT NULL DEFAULT '{}',
    is_publish_to_provider_hub     jsonb NOT NULL DEFAULT '{}',
    indirect                       jsonb NOT NULL DEFAULT '{}',
    direct_contract                jsonb NOT NULL DEFAULT '{}',
    agreement_details              jsonb NOT NULL DEFAULT '{}',
    marquee_details                jsonb NOT NULL DEFAULT '{}',
    requirements                   jsonb NOT NULL DEFAULT '{}',
    english_requirements           jsonb NOT NULL DEFAULT '{}',
    financial_requirements         jsonb NOT NULL DEFAULT '{}',
    key_dates                      jsonb NOT NULL DEFAULT '{}',
    resources                      jsonb NOT NULL DEFAULT '{}',
    counselling_territories        jsonb NOT NULL DEFAULT '{}',
    contacts                       jsonb NOT NULL DEFAULT '{}',
    admission                      jsonb NOT NULL DEFAULT '{}',
    intakes                        jsonb NOT NULL DEFAULT '{}',
    profile                        jsonb NOT NULL DEFAULT '{}',
    contract                       jsonb NOT NULL DEFAULT '{}',
    documents                      jsonb NOT NULL DEFAULT '{}',

    created_at                     timestamptz NOT NULL DEFAULT now(),
    updated_at                     timestamptz NOT NULL DEFAULT now(),
    deleted_at                     timestamptz
);

CREATE UNIQUE INDEX university_slug_key
    ON university (slug) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX university_match_key_key
    ON university (match_key) WHERE deleted_at IS NULL;

CREATE INDEX university_country_iso_idx
    ON university (country_iso);

CREATE INDEX university_created_by_enterprise_id_idx
    ON university (created_by_enterprise_id);

CREATE INDEX university_education_levels_gin
    ON university USING gin (education_levels);

CREATE INDEX university_ownership_type_gin
    ON university USING gin (ownership_type);

CREATE TABLE university_slug_alias (
    slug          text PRIMARY KEY,
    university_id varchar(16) NOT NULL REFERENCES university (university_id),
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX university_slug_alias_university_id_idx
    ON university_slug_alias (university_id);