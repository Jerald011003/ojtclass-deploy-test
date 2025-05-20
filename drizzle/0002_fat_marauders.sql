CREATE TABLE "ojtclassroom-finalproj_classroom" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"professor_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ojtclassroom-finalproj_student_classroom" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"classroom_id" integer NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_classroom" ADD CONSTRAINT "ojtclassroom-finalproj_classroom_professor_id_ojtclassroom-finalproj_user_id_fk" FOREIGN KEY ("professor_id") REFERENCES "public"."ojtclassroom-finalproj_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_student_classroom" ADD CONSTRAINT "ojtclassroom-finalproj_student_classroom_student_id_ojtclassroom-finalproj_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."ojtclassroom-finalproj_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ojtclassroom-finalproj_student_classroom" ADD CONSTRAINT "ojtclassroom-finalproj_student_classroom_classroom_id_ojtclassroom-finalproj_classroom_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."ojtclassroom-finalproj_classroom"("id") ON DELETE no action ON UPDATE no action;