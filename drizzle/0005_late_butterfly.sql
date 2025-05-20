ALTER TABLE "ojtclassroom-finalproj_time_entry" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_time_entry" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_time_entry" ADD COLUMN "time_in" time;--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_time_entry" ADD COLUMN "time_out" time;--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_time_entry" ADD COLUMN "break_minutes" integer DEFAULT 0;