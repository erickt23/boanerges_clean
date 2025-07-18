import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { storage } from "./storage";
import { registerForumRoutes } from "./routes-forum";
import { 
  insertMemberSchema, insertEventSchema, insertAttendanceSchema, 
  insertDonationSchema, insertGroupSchema, insertResourceSchema,
  insertUserSchema, insertPhotoAlbumSchema, insertPhotoSchema
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads/gallery');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Public routes (no authentication required)
  app.get("/api/events/public", async (req, res) => {
    try {
      const events = await storage.getPublicLandingPageEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching public events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Track event interactions (public)
  app.post("/api/events/track", async (req, res) => {
    try {
      const { eventId, action, timestamp } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      
      // Store the interaction in database
      await storage.trackEventInteraction({
        eventId: parseInt(eventId),
        action,
        ipAddress,
        userAgent,
        timestamp: new Date(timestamp)
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking event action:", error);
      res.status(500).json({ error: "Failed to track action" });
    }
  });

  // Get event analytics (admin only)
  app.get("/api/events/:id/analytics", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const eventId = parseInt(req.params.id);
      const analytics = await storage.getEventAnalytics(eventId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching event analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Members API
  app.get("/api/members", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const members = await storage.getAllMembers(limit, offset);
      res.json(members);
    } catch (error) {
      console.error("Members fetch error:", error);
      res.status(500).json({ message: "Failed to fetch members", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/members", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const memberData = insertMemberSchema.parse(req.body);
      const member = await storage.createMember(memberData);
      
      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "CREATE",
        tableName: "members",
        recordId: member.id,
        newValues: JSON.stringify(member)
      });
      
      res.status(201).json(member);
    } catch (error) {
      console.error("Member creation error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid member data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create member", error: error instanceof Error ? error.message : String(error) });
      }
    }
  });



  app.get("/api/members/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const member = await storage.getMember(id);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch member" });
    }
  });

  // Get member details by member code
  app.get("/api/members/code/:memberCode", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { memberCode } = req.params;
      const member = await storage.getMemberByCode(memberCode);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch member" });
    }
  });

  app.patch("/api/members/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const updates = insertMemberSchema.partial().parse(req.body);
      const member = await storage.updateMember(id, updates);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "UPDATE",
        tableName: "members",
        recordId: id,
        newValues: JSON.stringify(updates)
      });
      
      res.json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid member data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update member" });
      }
    }
  });

  app.put("/api/members/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const updates = insertMemberSchema.partial().parse(req.body);
      const member = await storage.updateMember(id, updates);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "UPDATE",
        tableName: "members",
        recordId: id,
        newValues: JSON.stringify(updates)
      });
      
      res.json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid member data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update member" });
      }
    }
  });

  app.patch("/api/members/:id/toggle-status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const memberId = parseInt(req.params.id);
      const member = await storage.getMember(memberId);
      
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      const updatedMember = await storage.updateMember(memberId, {
        isActive: !member.isActive
      });

      if (!updatedMember) {
        return res.status(500).json({ error: "Failed to update member status" });
      }

      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "UPDATE",
        tableName: "members",
        recordId: updatedMember.id,
        newValues: JSON.stringify({ isActive: updatedMember.isActive })
      });

      res.json(updatedMember);
    } catch (error) {
      console.error("Error toggling member status:", error);
      res.status(500).json({ error: "Failed to toggle member status" });
    }
  });

  app.delete("/api/members/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const member = await storage.getMember(id);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      // Only allow permanent deletion if member is already inactive
      if (member.isActive) {
        return res.status(400).json({ message: "Cannot delete active member. Please deactivate first." });
      }
      
      // Permanent delete from database
      const deleted = await storage.deleteMember(id);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete member" });
      }
      
      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "DELETE",
        tableName: "members",
        recordId: id,
        oldValues: JSON.stringify(member)
      });
      
      res.json({ message: "Member deleted permanently" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete member" });
    }
  });

  // Generate QR code data for a member
  app.get("/api/members/:id/qr", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const member = await storage.getMember(id);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      const qrData = JSON.stringify({
        memberId: member.id,
        memberCode: member.memberCode,
        type: 'attendance'
      });
      
      res.json({ qrData });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // Attendance registration via QR code
  app.post("/api/attendance/qr", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { qrData, eventId } = req.body;
      
      if (!qrData || !eventId) {
        return res.status(400).json({ message: "QR data and event ID are required" });
      }
      
      const memberData = JSON.parse(qrData);
      
      if (memberData.type !== 'attendance') {
        return res.status(400).json({ message: "Invalid QR code type" });
      }
      
      // Check if attendance already exists
      const existingAttendance = await storage.getMemberAttendance(memberData.memberId);
      const eventAttendance = existingAttendance.find(a => a.eventId === eventId);
      
      if (eventAttendance) {
        return res.status(409).json({ message: "Attendance already recorded for this member at this event" });
      }
      
      const attendance = await storage.createAttendance({
        eventId,
        memberId: memberData.memberId,
        attendanceMethod: "qr_code",
        recordedBy: req.user!.id,
        lastModifiedBy: req.user!.id, // Add this line
        lastModifiedAt: new Date(), // Add this line
      });
      
      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "CREATE",
        tableName: "attendance",
        recordId: attendance.id,
        newValues: JSON.stringify({ eventId, memberId: memberData.memberId, method: "qr_code" }),
      });
      
      res.status(201).json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to record attendance" });
    }
  });

  app.patch("/api/members/:id/toggle-status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const member = await storage.getMember(id);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      const newStatus = !member.isActive;
      const updatedMember = await storage.updateMember(id, { isActive: newStatus });
      
      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "UPDATE",
        tableName: "members",
        recordId: id,
        newValues: JSON.stringify({ isActive: newStatus })
      });
      
      res.json(updatedMember);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle member status" });
    }
  });

  // Events API
  app.get("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const events = await storage.getEvents(startDate, endDate);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Convert string dates to Date objects
      const processedBody = {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        createdBy: req.user!.id
      };
      
      const eventData = insertEventSchema.parse(processedBody);
      const event = await storage.createEvent(eventData);
      
      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "CREATE",
        tableName: "events",
        recordId: event.id,
        newValues: JSON.stringify(event)
      });
      
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid event data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create event" });
      }
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const eventId = parseInt(req.params.id);
      const processedBody = {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      };
      
      const eventData = insertEventSchema.partial().parse(processedBody);
      const event = await storage.updateEvent(eventId, eventData);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "UPDATE",
        tableName: "events",
        recordId: event.id,
        newValues: JSON.stringify(event)
      });
      
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid event data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update event" });
      }
    }
  });

  app.get("/api/events/:id/ics", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Generate ICS content
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mission Évangélique Boanergès//Church Management//EN
BEGIN:VEVENT
UID:event-${event.id}@churchflow.app
DTSTART:${new Date(event.startDate).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${event.endDate ? new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] : new Date(new Date(event.startDate).getTime() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || 'Mission Évangélique Boanergès'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
      
      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', `attachment; filename="${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`);
      res.send(icsContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate ICS file" });
    }
  });

  app.get("/api/events/upcoming", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await storage.getUpcomingEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming events" });
    }
  });

  // Attendance API
  app.post("/api/attendance", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { memberIds, ...rest } = req.body;

      if (Array.isArray(memberIds) && memberIds.length > 0) {
        // Handle multiple members
        const attendanceRecords = memberIds.map(memberId => ({
          ...rest,
          memberId,
          recordedBy: req.user!.id,
          lastModifiedBy: req.user!.id, // Add this line
          lastModifiedAt: new Date(), // Add this line
        }));
        const validatedRecords = z.array(insertAttendanceSchema).parse(attendanceRecords);
        const created = await storage.createManyAttendances(validatedRecords);
        res.status(201).json({ count: created.length });
      } else {
        // Handle single member or visitor
        const attendanceData = insertAttendanceSchema.parse({
          ...req.body,
          recordedBy: req.user!.id,
          lastModifiedBy: req.user!.id, // Add this line
          lastModifiedAt: new Date(), // Add this line
        });
        const attendance = await storage.createAttendance(attendanceData);
        res.status(201).json(attendance);
      }
    } catch (error) {
      console.error("Attendance error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid attendance data", errors: error.errors });
      } else {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({ message: "Failed to record attendance", error: errorMessage });
      }
    }
  });

  app.get("/api/attendance/event/:eventId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const eventId = parseInt(req.params.eventId);
      const attendance = await storage.getEventAttendance(eventId);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get("/api/attendance/member/:memberId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const memberId = parseInt(req.params.memberId);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const attendance = await storage.getMemberAttendance(memberId, startDate, endDate);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch member attendance" });
    }
  });

  app.get("/api/attendance/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const stats = await storage.getAttendanceStats(startDate, endDate);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance stats" });
    }
  });

  // Donations API
  app.post("/api/donations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const donationData = insertDonationSchema.parse({
        ...req.body,
        recordedBy: req.user!.id
      });
      const donation = await storage.createDonation(donationData);
      
      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "CREATE",
        tableName: "donations",
        recordId: donation.id,
        newValues: JSON.stringify(donation)
      });
      
      res.status(201).json(donation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid donation data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to record donation" });
      }
    }
  });

  app.get("/api/donations/recent", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const donations = await storage.getRecentDonations(limit);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent donations" });
    }
  });

  app.get("/api/donations/member/:memberId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const memberId = parseInt(req.params.memberId);
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const donations = await storage.getMemberDonations(memberId, year);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch member donations" });
    }
  });

  app.get("/api/donations/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const stats = await storage.getDonationStats(startDate, endDate);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donation stats" });
    }
  });

  // Groups API
  app.get("/api/groups", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const groups = await storage.getAllGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.post("/api/groups", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const groupData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(groupData);
      
      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "CREATE",
        tableName: "groups",
        recordId: group.id,
        newValues: JSON.stringify(group)
      });
      
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid group data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create group" });
      }
    }
  });

  app.get("/api/groups/:id/members", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const groupId = parseInt(req.params.id);
      const members = await storage.getGroupMembers(groupId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group members" });
    }
  });

  app.post("/api/groups/:id/members", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const groupId = parseInt(req.params.id);
      const { memberId } = req.body;
      const membership = await storage.addMemberToGroup(groupId, memberId);
      res.status(201).json(membership);
    } catch (error) {
      res.status(500).json({ message: "Failed to add member to group" });
    }
  });

  // Resources API
  app.get("/api/resources", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const resources = await storage.getAllResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.post("/api/resources", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const resourceData = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(resourceData);
      
      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "CREATE",
        tableName: "resources",
        recordId: resource.id,
        newValues: JSON.stringify(resource)
      });
      
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid resource data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create resource" });
      }
    }
  });

  app.delete("/api/resources/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const resourceId = parseInt(req.params.id);
      const success = await storage.deleteResource(resourceId);
      
      if (!success) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "DELETE",
        tableName: "resources",
        recordId: resourceId,
        newValues: null
      });
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete resource" });
    }
  });

  // User management routes
  app.get("/api/users", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Non autorisé" });
      }
      
      // Check if user has admin role
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Accès refusé" });
      }
      
      const users = await storage.getAllUsers();
      // Remove password from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Non autorisé" });
      }
      
      // Check if user has admin role
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Ce nom d'utilisateur existe déjà" });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      const userToCreate = { ...userData, password: hashedPassword };
      
      const newUser = await storage.createUser(userToCreate);
      const { password, ...safeUser } = newUser;
      
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Erreur lors de la création de l'utilisateur" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Non autorisé" });
      }

      const userId = parseInt(req.params.id);
      const updates = req.body;

      // Users can update their own profile, admins can update any profile
      if (req.user.id !== userId && req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Accès refusé" });
      }

      // If password is being updated, hash it
      if (updates.password) {
        updates.password = await hashPassword(updates.password);
      }

      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
    }
  });

  app.put("/api/users/:id/password", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Non autorisé" });
      }

      const userId = parseInt(req.params.id);
      const { currentPassword, newPassword } = req.body;

      // Users can only change their own password
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      // Verify current password
      const user = await storage.getUser(userId);
      if (!user || !(await comparePasswords(currentPassword, user.password))) {
        return res.status(400).json({ message: "Mot de passe actuel incorrect" });
      }

      const hashedNewPassword = await hashPassword(newPassword);
      const success = await storage.changePassword(userId, hashedNewPassword);
      
      if (success) {
        res.json({ message: "Mot de passe modifié avec succès" });
      } else {
        res.status(500).json({ message: "Erreur lors du changement de mot de passe" });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Erreur lors du changement de mot de passe" });
    }
  });

  // Dashboard API
  app.get("/api/dashboard/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Member search by code
  app.get("/api/members/search/:code", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const memberCode = req.params.code;
      const member = await storage.getMemberByCode(memberCode);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to search member" });
    }
  });

  // Gallery API Routes
  app.get("/api/gallery/albums", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const eventId = req.query.eventId ? parseInt(req.query.eventId as string) : undefined;
      const albums = await storage.getPhotoAlbums(eventId);
      res.json(albums);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photo albums" });
    }
  });

  app.post("/api/gallery/albums", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const albumData = insertPhotoAlbumSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const album = await storage.createPhotoAlbum(albumData);
      
      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "CREATE",
        tableName: "photo_albums",
        recordId: album.id,
        newValues: JSON.stringify(album)
      });
      
      res.status(201).json(album);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid album data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create photo album" });
      }
    }
  });

  app.patch("/api/gallery/albums/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "admin" && req.user.role !== "super_admin") return res.sendStatus(403);

    try {
      const albumId = parseInt(req.params.id);
      const updates = insertPhotoAlbumSchema.partial().parse(req.body);

      const updatedAlbum = await storage.updatePhotoAlbum(albumId, updates);

      if (!updatedAlbum) {
        return res.status(404).json({ message: "Album not found" });
      }

      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "UPDATE",
        tableName: "photo_albums",
        recordId: albumId,
        newValues: JSON.stringify(updates)
      });

      res.json(updatedAlbum);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid album data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update photo album" });
      }
    }
  });

  app.delete("/api/gallery/albums/:id", async (req, res) => {
    //console.log("Attempting to delete album");
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "admin" && req.user.role !== "super_admin") return res.sendStatus(403);

    try {
      const albumId = parseInt(req.params.id);
      const success = await storage.deletePhotoAlbum(albumId);

      if (!success) {
        return res.status(404).json({ message: "Album not found" });
      }

      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "DELETE",
        tableName: "photo_albums",
        recordId: albumId,
        newValues: JSON.stringify({ deleted: true })
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete photo album" });
    }
  });

  app.get("/api/gallery/albums/:id/photos", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const albumId = parseInt(req.params.id);
      const photos = await storage.getAlbumPhotos(albumId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch album photos" });
    }
  });

  app.post("/api/gallery/photos", upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const photoData = insertPhotoSchema.parse({
        albumId: parseInt(req.body.albumId),
        name: req.body.name,
        filename: req.file.filename,
        originalName: req.file.originalname,
        caption: req.body.caption || null,
        mediaType: req.file.mimetype.startsWith('video/') ? 'video' : 'photo',
        fileSize: req.file.size,
        tags: (req.body.tags && req.body.tags !== '') ? JSON.parse(req.body.tags) : [],
        uploadedBy: req.user!.id
      });
      
      const photo = await storage.addPhoto(photoData);
      
      // Log the action
      await storage.logAction({
        userId: req.user!.id,
        action: "CREATE",
        tableName: "photos",
        recordId: photo.id,
        newValues: JSON.stringify(photo)
      });
      
      res.status(201).json(photo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid photo data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add photo" });
      }
    }
  });

  app.get("/api/gallery/photos", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const mediaType = req.query.mediaType as string;
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
      const albumId = req.query.albumId ? parseInt(req.query.albumId as string) : undefined;
      
      const photos = await storage.getAllPhotos({ mediaType, tags, albumId });
      res.json(photos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ message: "Failed to fetch photos", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/gallery/photos/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const photoId = parseInt(req.params.id);
      const success = await storage.deletePhoto(photoId);
      
      if (success) {
        // Log the action
        await storage.logAction({
          userId: req.user!.id,
          action: "DELETE",
          tableName: "photos",
          recordId: photoId,
          newValues: JSON.stringify({ deleted: true })
        });
        
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Photo not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  app.patch("/api/gallery/photos/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const photoId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedPhoto = await storage.updatePhoto(photoId, updates);
      
      if (updatedPhoto) {
        // Log the action
        await storage.logAction({
          userId: req.user!.id,
          action: "UPDATE",
          tableName: "photos",
          recordId: photoId,
          newValues: JSON.stringify(updates)
        });
        
        res.json(updatedPhoto);
      } else {
        res.status(404).json({ message: "Photo not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update photo" });
    }
  });

  // Register forum routes
  registerForumRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
