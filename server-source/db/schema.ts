import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
export const classrooms = sqliteTable("classrooms", {
  id: text("id").primaryKey(), code: text("code").notNull().unique(),
  name: text("name").notNull(), className: text("class_name").notNull(),
  mode: text("mode").notNull(), opened: integer("opened").notNull().default(1),
  paused: integer("paused").notNull().default(0), created: integer("created").notNull(),
});
export const learners = sqliteTable("learners", {
  id: text("id").primaryKey(), roomId: text("room_id").notNull().references(()=>classrooms.id),
  label: text("label").notNull(), tokenHash: text("token_hash").notNull(),
  completed: integer("completed").notNull().default(0), lastSeen: integer("last_seen").notNull(),
}, table=>[uniqueIndex("room_label").on(table.roomId,table.label)]);
export const records = sqliteTable("records", {
  id: text("id").primaryKey(), learnerId: text("learner_id").notNull().references(()=>learners.id),
  stage: integer("stage").notNull(), draft: text("draft").notNull().default("{}"),
  attempts: integer("attempts").notNull().default(0), passed: integer("passed").notNull().default(0),
  feedback: text("feedback").notNull().default(""), updated: integer("updated").notNull(),
}, table=>[uniqueIndex("learner_stage").on(table.learnerId,table.stage)]);
export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(), expires: integer("expires").notNull(),
});
