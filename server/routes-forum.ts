import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { insertForumCategorySchema, insertForumTopicSchema, insertForumReplySchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Authentication middleware to check if user is admin
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

const requireAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

export function registerForumRoutes(app: Express) {
  // Get all forum categories
  app.get("/api/forum/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getForumCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching forum categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Create forum category (admin only)
  app.post("/api/forum/categories", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertForumCategorySchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const category = await storage.createForumCategory(validatedData);
      res.status(201).json(category);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error creating forum category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // Update forum category (admin only)
  app.patch("/api/forum/categories/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const updates = req.body;
      
      const category = await storage.updateForumCategory(categoryId, updates);
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error updating forum category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  // Delete forum category (admin only)
  app.delete("/api/forum/categories/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const success = await storage.deleteForumCategoryWithTopicTransfer(categoryId);
      
      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting forum category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Get topics by category or all topics
  app.get("/api/forum/topics", async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const includeHidden = req.user?.role === 'admin' || req.user?.role === 'super_admin';
      
      const topics = await storage.getForumTopics(categoryId, includeHidden);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching forum topics:", error);
      res.status(500).json({ error: "Failed to fetch topics" });
    }
  });

  // Get recent topics
  app.get("/api/forum/topics/recent", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const topics = await storage.getRecentForumTopics(limit);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching recent topics:", error);
      res.status(500).json({ error: "Failed to fetch recent topics" });
    }
  });

  // Get single topic
  app.get("/api/forum/topics/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const topic = await storage.getForumTopic(id);
      
      if (!topic) {
        return res.status(404).json({ error: "Topic not found" });
      }

      // Increment view count
      await storage.incrementTopicViews(id);
      
      res.json(topic);
    } catch (error) {
      console.error("Error fetching forum topic:", error);
      res.status(500).json({ error: "Failed to fetch topic" });
    }
  });

  // Create forum topic
  app.post("/api/forum/topics", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertForumTopicSchema.parse({
        ...req.body,
        authorId: req.user!.id
      });
      
      const topic = await storage.createForumTopic(validatedData);
      res.status(201).json(topic);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error creating forum topic:", error);
      res.status(500).json({ error: "Failed to create topic" });
    }
  });

  // Update topic visibility (admin only)
  app.patch("/api/forum/topics/:id/visibility", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { isHidden } = req.body;
      
      const success = await storage.toggleTopicVisibility(id, isHidden);
      
      if (!success) {
        return res.status(404).json({ error: "Topic not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating topic visibility:", error);
      res.status(500).json({ error: "Failed to update topic visibility" });
    }
  });

  // Update topic archive status (admin only)
  app.patch("/api/forum/topics/:id/archive", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { isArchived } = req.body;
      
      const success = await storage.toggleTopicArchive(id, isArchived);
      
      if (!success) {
        return res.status(404).json({ error: "Topic not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating topic archive status:", error);
      res.status(500).json({ error: "Failed to update topic archive status" });
    }
  });

  // Delete topic (admin only)
  app.delete("/api/forum/topics/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteForumTopic(id);
      
      if (!success) {
        return res.status(404).json({ error: "Topic not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting forum topic:", error);
      res.status(500).json({ error: "Failed to delete topic" });
    }
  });

  // Get topic replies
  app.get("/api/forum/topics/:id/replies", async (req: Request, res: Response) => {
    try {
      const topicId = parseInt(req.params.id);
      const includeHidden = req.user?.role === 'admin' || req.user?.role === 'super_admin';
      
      const replies = await storage.getForumReplies(topicId, includeHidden);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching forum replies:", error);
      res.status(500).json({ error: "Failed to fetch replies" });
    }
  });

  // Create forum reply
  app.post("/api/forum/topics/:id/replies", requireAuth, async (req: Request, res: Response) => {
    try {
      const topicId = parseInt(req.params.id);
      
      const validatedData = insertForumReplySchema.parse({
        ...req.body,
        topicId,
        authorId: req.user!.id
      });
      
      const reply = await storage.createForumReply(validatedData);
      res.status(201).json(reply);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error creating forum reply:", error);
      res.status(500).json({ error: "Failed to create reply" });
    }
  });

  // Update reply visibility (admin only)
  app.patch("/api/forum/replies/:id/visibility", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { isHidden } = req.body;
      
      const success = await storage.toggleReplyVisibility(id, isHidden);
      
      if (!success) {
        return res.status(404).json({ error: "Reply not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating reply visibility:", error);
      res.status(500).json({ error: "Failed to update reply visibility" });
    }
  });

  // Delete reply (admin only)
  app.delete("/api/forum/replies/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteForumReply(id);
      
      if (!success) {
        return res.status(404).json({ error: "Reply not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting forum reply:", error);
      res.status(500).json({ error: "Failed to delete reply" });
    }
  });

  // Track topic view
  app.post("/api/forum/topics/:id/view", async (req: Request, res: Response) => {
    try {
      const topicId = parseInt(req.params.id);
      await storage.incrementTopicViews(topicId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking topic view:", error);
      res.status(500).json({ error: "Failed to track view" });
    }
  });

  // Get user display names by IDs
  app.post("/api/forum/user-names", async (req: Request, res: Response) => {
    try {
      const { userIds } = req.body;
      if (!Array.isArray(userIds)) {
        return res.status(400).json({ error: "userIds must be an array" });
      }

      const userNames: { [key: number]: string } = {};
      
      for (const userId of userIds) {
        const user = await storage.getUser(userId);
        if (user) {
          // Check if user role is member and try to get member data
          if (user.role === 'member') {
            // For members, try to find member data by username (which is their member code)
            const member = await storage.getMemberByCode(user.username);
            if (member) {
              userNames[userId] = `${member.firstName} ${member.lastName}`;
            } else {
              userNames[userId] = user.username;
            }
          } else {
            userNames[userId] = user.username;
          }
        } else {
          userNames[userId] = `Utilisateur #${userId}`;
        }
      }

      res.json(userNames);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user names" });
    }
  });
}