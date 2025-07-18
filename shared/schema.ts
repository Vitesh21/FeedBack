import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  isPublished: boolean("is_published").default(false),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'text', 'multiple_choice', 'rating'
  options: jsonb("options"), // For multiple choice options
  isRequired: boolean("is_required").default(false),
  orderIndex: integer("order_index").notNull(),
});

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  submittedAt: timestamp("submitted_at").defaultNow(),
  respondentName: text("respondent_name"),
  respondentEmail: text("respondent_email"),
});

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id").notNull().references(() => responses.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  value: text("value").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  forms: many(forms),
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  creator: one(users, {
    fields: [forms.createdBy],
    references: [users.id],
  }),
  questions: many(questions),
  responses: many(responses),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  form: one(forms, {
    fields: [questions.formId],
    references: [forms.id],
  }),
  answers: many(answers),
}));

export const responsesRelations = relations(responses, ({ one, many }) => ({
  form: one(forms, {
    fields: [responses.formId],
    references: [forms.id],
  }),
  answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  response: one(responses, {
    fields: [answers.responseId],
    references: [responses.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFormSchema = createInsertSchema(forms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  submittedAt: true,
});

export const insertAnswerSchema = createInsertSchema(answers).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type Response = typeof responses.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
