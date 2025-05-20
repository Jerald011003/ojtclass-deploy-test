CREATE TYPE "public"."report_status" AS ENUM('pending', 'submitted', 'reviewed', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('daily', 'weekly', 'activity_log');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'completed', 'overdue');--> statement-breakpoint
CREATE TABLE "ojtclassroom-finalproj_report" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"type" "report_type" DEFAULT 'daily' NOT NULL,
	"due_date" date,
	"classroom_id" integer,
	"student_id" integer,
	"status" "report_status" DEFAULT 'pending',
	"submission_url" text,
	"feedback" text,
	"is_template" boolean DEFAULT false,
	"parent_template_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ojtclassroom-finalproj_task" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"due_date" date,
	"classroom_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"status" "task_status" DEFAULT 'pending' NOT NULL,
	"priority" varchar(50) DEFAULT 'medium',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ojtclassroom-finalproj_time_entry" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"classroom_id" integer NOT NULL,
	"date" date NOT NULL,
	"hours" integer NOT NULL,
	"description" text,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_student_classroom" ALTER COLUMN "status" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_classroom" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_classroom" ADD COLUMN "invite_code" varchar(8);--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_report" ADD CONSTRAINT "ojtclassroom-finalproj_report_classroom_id_ojtclassroom-finalproj_classroom_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."ojtclassroom-finalproj_classroom"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_report" ADD CONSTRAINT "ojtclassroom-finalproj_report_student_id_ojtclassroom-finalproj_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."ojtclassroom-finalproj_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_task" ADD CONSTRAINT "ojtclassroom-finalproj_task_classroom_id_ojtclassroom-finalproj_classroom_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."ojtclassroom-finalproj_classroom"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_task" ADD CONSTRAINT "ojtclassroom-finalproj_task_student_id_ojtclassroom-finalproj_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."ojtclassroom-finalproj_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_time_entry" ADD CONSTRAINT "ojtclassroom-finalproj_time_entry_student_id_ojtclassroom-finalproj_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."ojtclassroom-finalproj_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_time_entry" ADD CONSTRAINT "ojtclassroom-finalproj_time_entry_classroom_id_ojtclassroom-finalproj_classroom_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."ojtclassroom-finalproj_classroom"("id") ON DELETE no action ON UPDATE no action;