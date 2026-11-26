-- 1. drop foreign keys
ALTER TABLE "course" DROP CONSTRAINT "course_university_id_fkey";
ALTER TABLE "course" DROP CONSTRAINT "course_created_by_enterprise_id_fkey";
ALTER TABLE "university" DROP CONSTRAINT "university_created_by_enterprise_id_fkey";
ALTER TABLE "university_slug_alias" DROP CONSTRAINT "university_slug_alias_university_id_fkey";

-- 2. drop old uuidv7() defaults
ALTER TABLE "enterprise" ALTER COLUMN "enterprise_id" DROP DEFAULT;
ALTER TABLE "university" ALTER COLUMN "university_id" DROP DEFAULT;
ALTER TABLE "course" ALTER COLUMN "course_id" DROP DEFAULT;

-- 3. change types
ALTER TABLE "enterprise" ALTER COLUMN "enterprise_id" TYPE character varying(16);
ALTER TABLE "university" ALTER COLUMN "university_id" TYPE character varying(16),
  ALTER COLUMN "created_by_enterprise_id" TYPE character varying(16);
ALTER TABLE "university_slug_alias" ALTER COLUMN "university_id" TYPE character varying(16);
ALTER TABLE "course" ALTER COLUMN "course_id" TYPE character varying(16),
  ALTER COLUMN "university_id" TYPE character varying(16),
  ALTER COLUMN "created_by_enterprise_id" TYPE character varying(16);

-- 4. new defaults
ALTER TABLE "enterprise" ALTER COLUMN "enterprise_id" SET DEFAULT left(replace(gen_random_uuid()::text, '-', ''), 16);
ALTER TABLE "university" ALTER COLUMN "university_id" SET DEFAULT left(replace(gen_random_uuid()::text, '-', ''), 16);
ALTER TABLE "course" ALTER COLUMN "course_id" SET DEFAULT left(replace(gen_random_uuid()::text, '-', ''), 16);

-- 5. re-add foreign keys
ALTER TABLE "university" ADD CONSTRAINT "university_created_by_enterprise_id_fkey"
  FOREIGN KEY ("created_by_enterprise_id") REFERENCES "enterprise" ("enterprise_id");
ALTER TABLE "university_slug_alias" ADD CONSTRAINT "university_slug_alias_university_id_fkey"
  FOREIGN KEY ("university_id") REFERENCES "university" ("university_id");
ALTER TABLE "course" ADD CONSTRAINT "course_university_id_fkey"
  FOREIGN KEY ("university_id") REFERENCES "university" ("university_id");
ALTER TABLE "course" ADD CONSTRAINT "course_created_by_enterprise_id_fkey"
  FOREIGN KEY ("created_by_enterprise_id") REFERENCES "enterprise" ("enterprise_id");