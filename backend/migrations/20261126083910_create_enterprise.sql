-- Create "enterprise" table
CREATE TABLE "enterprise" (
  "enterprise_id" uuid NOT NULL DEFAULT uuidv7(),
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "god_registry_id" text NULL,
  "status" character varying(20) NOT NULL DEFAULT 'ACTIVE',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz NULL,
  PRIMARY KEY ("enterprise_id"),
  CONSTRAINT "enterprise_status_check" CHECK ((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'SUSPENDED'::character varying])::text[]))
);
-- Create index "enterprise_god_registry_id_key" to table: "enterprise"
CREATE UNIQUE INDEX "enterprise_god_registry_id_key" ON "enterprise" ("god_registry_id") WHERE (deleted_at IS NULL);
-- Create index "enterprise_slug_key" to table: "enterprise"
CREATE UNIQUE INDEX "enterprise_slug_key" ON "enterprise" ("slug") WHERE (deleted_at IS NULL);
