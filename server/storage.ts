import { 
  users, forms, questions, responses, answers,
  type User, type InsertUser,
  type Form, type InsertForm,
  type Question, type InsertQuestion,
  type Response, type InsertResponse,
  type Answer, type InsertAnswer
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Form methods
  getFormsByUser(userId: number): Promise<Form[]>;
  getForm(id: number): Promise<Form | undefined>;
  getPublicForm(id: number): Promise<Form | undefined>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: number, form: Partial<InsertForm>): Promise<Form | undefined>;
  deleteForm(id: number): Promise<void>;

  // Question methods
  getQuestionsByForm(formId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question | undefined>;
  deleteQuestion(id: number): Promise<void>;

  // Response methods
  getResponsesByForm(formId: number): Promise<(Response & { answers: (Answer & { question: Question })[] })[]>;
  createResponse(response: InsertResponse): Promise<Response>;
  getResponseCount(formId: number): Promise<number>;

  // Answer methods
  createAnswer(answer: InsertAnswer): Promise<Answer>;

  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getFormsByUser(userId: number): Promise<Form[]> {
    return await db
      .select()
      .from(forms)
      .where(eq(forms.createdBy, userId))
      .orderBy(desc(forms.createdAt));
  }

  async getForm(id: number): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form || undefined;
  }

  async getPublicForm(id: number): Promise<Form | undefined> {
    const [form] = await db
      .select()
      .from(forms)
      .where(eq(forms.id, id));
    return form || undefined;
  }

  async createForm(form: InsertForm): Promise<Form> {
    const [newForm] = await db
      .insert(forms)
      .values(form)
      .returning();
    return newForm;
  }

  async updateForm(id: number, form: Partial<InsertForm>): Promise<Form | undefined> {
    const [updatedForm] = await db
      .update(forms)
      .set({ ...form, updatedAt: new Date() })
      .where(eq(forms.id, id))
      .returning();
    return updatedForm || undefined;
  }

  async deleteForm(id: number): Promise<void> {
    await db.delete(forms).where(eq(forms.id, id));
  }

  async getQuestionsByForm(formId: number): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.formId, formId))
      .orderBy(asc(questions.orderIndex));
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db
      .insert(questions)
      .values(question)
      .returning();
    return newQuestion;
  }

  async updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question | undefined> {
    const [updatedQuestion] = await db
      .update(questions)
      .set(question)
      .where(eq(questions.id, id))
      .returning();
    return updatedQuestion || undefined;
  }

  async deleteQuestion(id: number): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  async getResponsesByForm(formId: number): Promise<(Response & { answers: (Answer & { question: Question })[] })[]> {
    const formResponses = await db.query.responses.findMany({
      where: eq(responses.formId, formId),
      with: {
        answers: {
          with: {
            question: true,
          },
        },
      },
      orderBy: desc(responses.submittedAt),
    });
    return formResponses;
  }

  async createResponse(response: InsertResponse): Promise<Response> {
    const [newResponse] = await db
      .insert(responses)
      .values(response)
      .returning();
    return newResponse;
  }

  async getResponseCount(formId: number): Promise<number> {
    const result = await db
      .select({ count: responses.id })
      .from(responses)
      .where(eq(responses.formId, formId));
    return result.length;
  }

  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const [newAnswer] = await db
      .insert(answers)
      .values(answer)
      .returning();
    return newAnswer;
  }
}

export const storage = new DatabaseStorage();
