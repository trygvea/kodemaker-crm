CREATE TYPE "public"."event_entity" AS ENUM('company', 'contact', 'lead');--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity" "event_entity" NOT NULL,
	"entity_id" integer NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
