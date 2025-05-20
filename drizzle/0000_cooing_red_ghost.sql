CREATE TYPE "public"."activity_type" AS ENUM('student', 'professor', 'company', 'system');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'professor', 'admin');--> statement-breakpoint
CREATE TABLE "ojtclassroom-finalproj_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "activity_type" NOT NULL,
	"action" text NOT NULL,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ojtclassroom-finalproj_company" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ojtclassroom-finalproj_system_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"system_load" integer NOT NULL,
	"storage_usage" integer NOT NULL,
	"last_backup" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ojtclassroom-finalproj_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ojtclassroom-finalproj_user_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_activity" ADD CONSTRAINT "ojtclassroom-finalproj_activity_user_id_ojtclassroom-finalproj_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ojtclassroom-finalproj_user"("id") ON DELETE no action ON UPDATE no action;