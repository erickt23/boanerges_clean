import { pgTable, text, serial, integer, boolean, timestamp, date, decimal, varchar, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["super_admin", "admin", "user", "member"] }).notNull().default("member"),
  email: text("email"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Members table
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  memberCode: varchar("member_code", { length: 20 }).notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: text("gender", { enum: ["M", "F"] }).notNull(),
  phone: text("phone"),
  email: text("email"),
  // Address components
  apartment: text("apartment"),
  buildingNumber: text("building_number"),
  street: text("street").notNull(),
  city: text("city").notNull(),
  province: text("province"),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("Canada"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Events/Calendar table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type", { enum: ["service", "meeting", "activity", "retreat"] }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringPattern: text("recurring_pattern"),
  isSpecial: boolean("is_special").notNull().default(false),
  showOnLandingPage: boolean("show_on_landing_page").notNull().default(false),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Attendance table
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  memberId: integer("member_id").references(() => members.id),
  visitorFirstName: text("visitor_first_name"),
  visitorLastName: text("visitor_last_name"),
  attendanceMethod: text("attendance_method", { enum: ["manual", "qr_code", "visitor"] }).notNull(),
  recordedBy: integer("recorded_by").references(() => users.id).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// Donations table
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => members.id),
  donationType: text("donation_type", { enum: ["tithe", "offering", "general"] }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  donationDate: date("donation_date").notNull(),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  notes: text("notes"),
  receiptNumber: text("receipt_number"),
  recordedBy: integer("recorded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Groups table
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  leaderId: integer("leader_id").references(() => members.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Group memberships table
export const groupMemberships = pgTable("group_memberships", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id).notNull(),
  memberId: integer("member_id").references(() => members.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Resources table
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["room", "equipment", "vehicle"] }).notNull(),
  description: text("description"),
  capacity: integer("capacity"),
  isAvailable: boolean("is_available").notNull().default(true),
});

// Resource reservations table
export const resourceReservations = pgTable("resource_reservations", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").references(() => resources.id).notNull(),
  eventId: integer("event_id").references(() => events.id),
  reservedBy: integer("reserved_by").references(() => users.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  purpose: text("purpose"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Photo albums table
export const photoAlbums = pgTable("photo_albums", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  eventId: integer("event_id").references(() => events.id),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Media (Photos and Videos) table
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  albumId: integer("album_id").references(() => photoAlbums.id).notNull(),
  name: text("name").notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  caption: text("caption"),
  mediaType: text("media_type", { enum: ["photo", "video"] }).notNull().default("photo"),
  fileSize: integer("file_size"), // in bytes
  duration: integer("duration"), // in seconds for videos
  tags: text("tags").array(), // Array of tags for categorization
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Forum Categories table
export const forumCategories = pgTable("forum_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Forum Topics table
export const forumTopics = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => forumCategories.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  isSticky: boolean("is_sticky").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  replyCount: integer("reply_count").notNull().default(0),
  lastReplyAt: timestamp("last_reply_at"),
  lastReplyBy: integer("last_reply_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isHidden: boolean("is_hidden").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
});

// Forum Replies table
export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").references(() => forumTopics.id).notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  isHidden: boolean("is_hidden").notNull().default(false),
  parentReplyId: integer("parent_reply_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit log table
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  tableName: text("table_name").notNull(),
  recordId: integer("record_id"),
  oldValues: text("old_values"),
  newValues: text("new_values"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  member: one(members, { fields: [users.id], references: [members.userId] }),
  createdEvents: many(events),
  recordedAttendance: many(attendance),
  recordedDonations: many(donations),
  auditLogs: many(auditLog),
  createdForumCategories: many(forumCategories),
  forumTopics: many(forumTopics),
  forumReplies: many(forumReplies),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  user: one(users, { fields: [members.userId], references: [users.id] }),
  attendance: many(attendance),
  donations: many(donations),
  groupMemberships: many(groupMemberships),
  ledGroups: many(groups),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, { fields: [events.createdBy], references: [users.id] }),
  attendance: many(attendance),
  resourceReservations: many(resourceReservations),
  photoAlbums: many(photoAlbums),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  event: one(events, { fields: [attendance.eventId], references: [events.id] }),
  member: one(members, { fields: [attendance.memberId], references: [members.id] }),
  recorder: one(users, { fields: [attendance.recordedBy], references: [users.id] }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  member: one(members, { fields: [donations.memberId], references: [members.id] }),
  recorder: one(users, { fields: [donations.recordedBy], references: [users.id] }),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  leader: one(members, { fields: [groups.leaderId], references: [members.id] }),
  memberships: many(groupMemberships),
}));

export const groupMembershipsRelations = relations(groupMemberships, ({ one }) => ({
  group: one(groups, { fields: [groupMemberships.groupId], references: [groups.id] }),
  member: one(members, { fields: [groupMemberships.memberId], references: [members.id] }),
}));

export const resourcesRelations = relations(resources, ({ many }) => ({
  reservations: many(resourceReservations),
}));

export const resourceReservationsRelations = relations(resourceReservations, ({ one }) => ({
  resource: one(resources, { fields: [resourceReservations.resourceId], references: [resources.id] }),
  event: one(events, { fields: [resourceReservations.eventId], references: [events.id] }),
  reserver: one(users, { fields: [resourceReservations.reservedBy], references: [users.id] }),
}));

export const photoAlbumsRelations = relations(photoAlbums, ({ one, many }) => ({
  event: one(events, { fields: [photoAlbums.eventId], references: [events.id] }),
  creator: one(users, { fields: [photoAlbums.createdBy], references: [users.id] }),
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  album: one(photoAlbums, { fields: [photos.albumId], references: [photoAlbums.id] }),
  uploader: one(users, { fields: [photos.uploadedBy], references: [users.id] }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, { fields: [auditLog.userId], references: [users.id] }),
}));

export const forumCategoriesRelations = relations(forumCategories, ({ many }) => ({
  topics: many(forumTopics),
}));

export const forumTopicsRelations = relations(forumTopics, ({ one, many }) => ({
  category: one(forumCategories, { fields: [forumTopics.categoryId], references: [forumCategories.id] }),
  author: one(users, { fields: [forumTopics.authorId], references: [users.id] }),
  replies: many(forumReplies),
}));

export const forumRepliesRelations = relations(forumReplies, ({ one }) => ({
  topic: one(forumTopics, { fields: [forumReplies.topicId], references: [forumTopics.id] }),
  author: one(users, { fields: [forumReplies.authorId], references: [users.id] }),
  parentReply: one(forumReplies, { fields: [forumReplies.parentReplyId], references: [forumReplies.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  memberCode: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  recordedAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  receiptNumber: true,
  createdAt: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
});

export const insertGroupMembershipSchema = createInsertSchema(groupMemberships).omit({
  id: true,
  joinedAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
});

export const insertResourceReservationSchema = createInsertSchema(resourceReservations).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoAlbumSchema = createInsertSchema(photoAlbums).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  uploadedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLog).omit({
  id: true,
  timestamp: true,
});

export const insertForumCategorySchema = createInsertSchema(forumCategories).omit({
  id: true,
  createdAt: true,
});

export const insertForumTopicSchema = createInsertSchema(forumTopics).omit({
  id: true,
  viewCount: true,
  replyCount: true,
  lastReplyAt: true,
  lastReplyBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type GroupMembership = typeof groupMemberships.$inferSelect;
export type InsertGroupMembership = z.infer<typeof insertGroupMembershipSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type ResourceReservation = typeof resourceReservations.$inferSelect;
export type InsertResourceReservation = z.infer<typeof insertResourceReservationSchema>;
export type PhotoAlbum = typeof photoAlbums.$inferSelect;
export type InsertPhotoAlbum = z.infer<typeof insertPhotoAlbumSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;
export type ForumTopic = typeof forumTopics.$inferSelect;
export type InsertForumTopic = z.infer<typeof insertForumTopicSchema>;
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
