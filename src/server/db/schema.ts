import { sql, relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTableCreator,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  date,
  time,
  numeric,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator(
  (name) => `ojtclassroom-finalproj_${name}`,
);

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "student",
  "professor",
  "admin",
]);
export const activityTypeEnum = pgEnum("activity_type", [
  "student",
  "professor",
  "company",
  "system",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "submitted",
  "reviewed",
  "approved",
  "rejected",
]);
export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "overdue",
]);

export const reportType = pgEnum('report_type', ['daily', 'weekly', 'activity_log']);

// Users table
export const users = createTable("user", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Companies table
export const companies = createTable("company", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activities table
export const activities = createTable("activity", {
  id: serial("id").primaryKey(),
  type: activityTypeEnum("type").notNull(),
  action: text("action").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// System metrics table
export const systemMetrics = createTable("system_metrics", {
  id: serial("id").primaryKey(),
  systemLoad: integer("system_load").notNull(),
  storageUsage: integer("storage_usage").notNull(),
  lastBackup: timestamp("last_backup").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meetings = createTable("meeting", {
  id: serial("id").primaryKey(),
  classroomId: integer("classroom_id")
    .references(() => classrooms.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  date: date("date").notNull(),
  time: varchar("time", { length: 50 }).notNull(),
  meetingUrl: text("meeting_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Classrooms table
export const classrooms = createTable("classroom", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  professorId: integer("professor_id")
    .references(() => users.id)
    .notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  ojtHours: integer('ojt_hours').default(600),
  inviteCode: varchar("invite_code", { length: 8 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// StudentClassrooms table (for many-to-many relationship)
export const studentClassrooms = createTable("student_classroom", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .references(() => users.id)
    .notNull(),
  classroomId: integer("classroom_id")
    .references(() => classrooms.id)
    .notNull(),
  status: integer("status").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// TimeEntries table for tracking student hours
export const timeEntries = createTable("time_entry", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id),
  classroomId: integer("classroom_id").notNull().references(() => classrooms.id),
  date: date("date").notNull(),
  hours: numeric("hours", { precision: 4, scale: 2 }).notNull(),
  timeIn: time("time_in"),
  timeOut: time("time_out"),
  breakMinutes: integer("break_minutes").default(0),
  description: text("description"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reports table for student report submissions
export const reports = createTable("report", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: reportType("type").notNull().default("daily"),
  dueDate: date("due_date"),
  classroomId: integer("classroom_id").references(() => classrooms.id),
  studentId: integer("student_id").references(() => users.id),
  status: reportStatusEnum("status").default("pending"),
  submissionUrl: text("submission_url"),
  feedback: text("feedback"),
  taskId: integer("task_id").references(() => tasks.id),
  isTemplate: boolean("is_template").default(false),
  parentTemplateId: integer("parent_template_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table for student tasks/assignments
export const tasks = createTable("task", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: date("due_date"),
  classroomId: integer("classroom_id")
    .references(() => classrooms.id)
    .notNull(),
  studentId: integer("student_id")
    .references(() => users.id)
    .notNull(),
  status: taskStatusEnum("status").default("pending").notNull(),
  priority: varchar("priority", { length: 50 }).default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const classroomsRelations = relations(classrooms, ({ one }) => ({
  professor: one(users, {
    fields: [classrooms.professorId],
    references: [users.id],
  }),
}));


export const meetingsRelations = relations(meetings, ({ one }) => ({
  classroom: one(classrooms, {
    fields: [meetings.classroomId],
    references: [classrooms.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  student: one(users, {
    fields: [reports.studentId],
    references: [users.id],
  }),
  classroom: one(classrooms, {
    fields: [reports.classroomId],
    references: [classrooms.id],
  }),
  task: one(tasks, {
    fields: [reports.taskId],
    references: [tasks.id],
  }),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  student: one(users, {
    fields: [timeEntries.studentId],
    references: [users.id],
  }),
  classroom: one(classrooms, {
    fields: [timeEntries.classroomId],
    references: [classrooms.id],
    
  }),
}));