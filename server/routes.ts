import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertFormSchema, insertQuestionSchema, insertResponseSchema, insertAnswerSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Form routes
  app.get("/api/forms", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const forms = await storage.getFormsByUser(req.user!.id);
      
      // Get response counts for each form
      const formsWithCounts = await Promise.all(
        forms.map(async (form) => {
          const responseCount = await storage.getResponseCount(form.id);
          return { ...form, responseCount };
        })
      );
      
      res.json(formsWithCounts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/forms/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const form = await storage.getForm(parseInt(req.params.id));
      if (!form) return res.sendStatus(404);
      if (form.createdBy !== req.user!.id) return res.sendStatus(403);
      
      const questions = await storage.getQuestionsByForm(form.id);
      res.json({ ...form, questions });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/forms", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const formData = insertFormSchema.parse({
        ...req.body,
        createdBy: req.user!.id,
      });
      const form = await storage.createForm(formData);
      res.status(201).json(form);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/forms/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const form = await storage.getForm(parseInt(req.params.id));
      if (!form) return res.sendStatus(404);
      if (form.createdBy !== req.user!.id) return res.sendStatus(403);
      
      const updateData = insertFormSchema.partial().parse(req.body);
      const updatedForm = await storage.updateForm(form.id, updateData);
      res.json(updatedForm);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/forms/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const form = await storage.getForm(parseInt(req.params.id));
      if (!form) return res.sendStatus(404);
      if (form.createdBy !== req.user!.id) return res.sendStatus(403);
      
      await storage.deleteForm(form.id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Question routes
  app.post("/api/forms/:formId/questions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const form = await storage.getForm(parseInt(req.params.formId));
      if (!form) return res.sendStatus(404);
      if (form.createdBy !== req.user!.id) return res.sendStatus(403);
      
      const questionData = insertQuestionSchema.parse({
        ...req.body,
        formId: form.id,
      });
      const question = await storage.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/questions/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const updateData = insertQuestionSchema.partial().parse(req.body);
      const question = await storage.updateQuestion(parseInt(req.params.id), updateData);
      if (!question) return res.sendStatus(404);
      res.json(question);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/questions/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      await storage.deleteQuestion(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Public form routes
  app.get("/api/public/forms/:id", async (req, res, next) => {
    try {
      const form = await storage.getPublicForm(parseInt(req.params.id));
      if (!form || !form.isPublished) return res.sendStatus(404);
      
      const questions = await storage.getQuestionsByForm(form.id);
      res.json({ ...form, questions });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/public/forms/:id/responses", async (req, res, next) => {
    try {
      const form = await storage.getPublicForm(parseInt(req.params.id));
      if (!form || !form.isPublished) return res.sendStatus(404);
      
      const { respondentName, respondentEmail, answers } = req.body;
      
      // Create response
      const responseData = insertResponseSchema.parse({
        formId: form.id,
        respondentName,
        respondentEmail,
      });
      const response = await storage.createResponse(responseData);
      
      // Create answers
      if (answers && Array.isArray(answers)) {
        await Promise.all(
          answers.map(async (answer: any) => {
            const answerData = insertAnswerSchema.parse({
              responseId: response.id,
              questionId: answer.questionId,
              value: answer.value,
            });
            return storage.createAnswer(answerData);
          })
        );
      }
      
      res.status(201).json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Response routes
  app.get("/api/forms/:id/responses", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const form = await storage.getForm(parseInt(req.params.id));
      if (!form) return res.sendStatus(404);
      if (form.createdBy !== req.user!.id) return res.sendStatus(403);
      
      const responses = await storage.getResponsesByForm(form.id);
      res.json(responses);
    } catch (error) {
      next(error);
    }
  });

  // CSV export route
  app.get("/api/forms/:id/export", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const form = await storage.getForm(parseInt(req.params.id));
      if (!form) return res.sendStatus(404);
      if (form.createdBy !== req.user!.id) return res.sendStatus(403);
      
      const responses = await storage.getResponsesByForm(form.id);
      const questions = await storage.getQuestionsByForm(form.id);
      
      // Generate CSV
      const headers = ['Submitted At', 'Name', 'Email', ...questions.map(q => q.title)];
      const rows = responses.map(response => {
        const row = [
          response.submittedAt?.toISOString() || '',
          response.respondentName || '',
          response.respondentEmail || '',
        ];
        
        questions.forEach(question => {
          const answer = response.answers.find(a => a.questionId === question.id);
          row.push(answer?.value || '');
        });
        
        return row;
      });
      
      const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${form.title}-responses.csv"`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
