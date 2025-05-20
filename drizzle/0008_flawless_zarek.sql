CREATE TABLE "ojtclassroom-finalproj_meeting" (
	"id" serial PRIMARY KEY NOT NULL,
	"classroom_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"time" varchar(50) NOT NULL,
	"meeting_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_meeting" ADD CONSTRAINT "ojtclassroom-finalproj_meeting_classroom_id_ojtclassroom-finalproj_classroom_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."ojtclassroom-finalproj_classroom"("id") ON DELETE no action ON UPDATE no action;