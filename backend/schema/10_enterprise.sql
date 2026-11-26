CREATE TABLE enterprise (
    enterprise_id   uuid PRIMARY KEY DEFAULT uuidv7(),
    name            text NOT NULL,
    slug            text NOT NULL,
    god_registry_id text,
    status          varchar(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);

CREATE UNIQUE INDEX enterprise_slug_key
    ON enterprise (slug) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX enterprise_god_registry_id_key
    ON enterprise (god_registry_id) WHERE deleted_at IS NULL;