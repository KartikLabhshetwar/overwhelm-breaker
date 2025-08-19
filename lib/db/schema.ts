import { pgTable, text, integer, timestamp, jsonb, vector } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  timezone: text("timezone").default("UTC"),
  workHours: jsonb("work_hours").$type<{ start: string; end: string }>().default({ start: "09:00", end: "17:00" }),
  energyProfile: jsonb("energy_profile").$type<{ morning: number; afternoon: number; evening: number }>(),
  defaultChunkMinutes: integer("default_chunk_minutes").default(10),
  oauthGoogleId: text("oauth_google_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const projects = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  deadline: timestamp("deadline"),
  priority: text("priority", { enum: ["low", "medium", "high"] }).default("medium"),
  status: text("status", { enum: ["active", "completed", "archived"] }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const tasks = pgTable("tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  projectId: text("project_id")
    .references(() => projects.id)
    .notNull(),
  title: text("title").notNull(),
  notes: text("notes"),
  estimateMin: integer("estimate_min"),
  status: text("status", { enum: ["todo", "in_progress", "completed"] }).default("todo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const chunks = pgTable("chunks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  taskId: text("task_id")
    .references(() => tasks.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  durationMin: integer("duration_min").notNull(),
  deps: jsonb("deps").$type<string[]>().default([]),
  energy: text("energy", { enum: ["low", "med", "high"] }).default("med"),
  resources: jsonb("resources").$type<string[]>().default([]),
  acceptanceCriteria: text("acceptance_criteria"),
  orderIndex: integer("order_index").notNull(),
  scheduledStart: timestamp("scheduled_start"),
  scheduledEnd: timestamp("scheduled_end"),
  status: text("status", { enum: ["todo", "doing", "done", "snoozed", "stuck"] }).default("todo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const sessions = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  chunkId: text("chunk_id")
    .references(() => chunks.id)
    .notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  outcome: text("outcome", { enum: ["done", "stuck", "snoozed"] }),
  actualMin: integer("actual_min"),
  reflection: text("reflection"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const checkins = pgTable("checkins", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  sessionId: text("session_id")
    .references(() => sessions.id)
    .notNull(),
  tPlusMin: integer("t_plus_min").notNull(),
  sentiment: text("sentiment", { enum: ["good", "neutral", "stuck"] }),
  blockerTag: text("blocker_tag"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const integrations = pgTable("integrations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  provider: text("provider", { enum: ["gcal", "gtasks", "notion", "todoist"] }).notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  scopes: jsonb("scopes").$type<string[]>(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const embeddings = pgTable("embeddings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  ownerType: text("owner_type", { enum: ["project", "task", "chunk", "note"] }).notNull(),
  ownerId: text("owner_id").notNull(),
  vector: vector("vector", { dimensions: 1536 }),
  model: text("model").default("text-embedding-3-small"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const plans = pgTable("plans", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  inputBlob: jsonb("input_blob").notNull(),
  planJson: jsonb("plan_json").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})
