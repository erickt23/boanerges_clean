import { 
  users, members, events, attendance, donations, groups, groupMemberships,
  resources, resourceReservations, photoAlbums, photos, auditLog,
  forumCategories, forumTopics, forumReplies,
  type User, type InsertUser, type Member, type InsertMember, 
  type Event, type InsertEvent, type Attendance, type InsertAttendance,
  type Donation, type InsertDonation, type Group, type InsertGroup,
  type GroupMembership, type InsertGroupMembership, type Resource, type InsertResource,
  type ResourceReservation, type InsertResourceReservation, type PhotoAlbum, type InsertPhotoAlbum,
  type Photo, type InsertPhoto, type AuditLog, type InsertAuditLog,
  type ForumCategory, type InsertForumCategory, type ForumTopic, type InsertForumTopic,
  type ForumReply, type InsertForumReply
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql, like, count, sum, or, arrayOverlaps } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  changePassword(id: number, newPassword: string): Promise<boolean>;
  
  // Members
  getMember(id: number): Promise<Member | undefined>;
  getMemberByCode(memberCode: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, updates: Partial<InsertMember>): Promise<Member | undefined>;
  deleteMember(id: number): Promise<boolean>;
  getAllMembers(limit?: number, offset?: number): Promise<Member[]>;
  generateMemberCode(dateOfBirth: string): Promise<string>;
  
  // Events
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  getEvents(startDate?: Date, endDate?: Date): Promise<Event[]>;
  getUpcomingEvents(limit?: number): Promise<Event[]>;
  getPublicLandingPageEvents(): Promise<Event[]>;
  
  // Attendance
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  createManyAttendances(attendances: InsertAttendance[]): Promise<Attendance[]>;
  getEventAttendance(eventId: number): Promise<Attendance[]>;
  getMemberAttendance(memberId: number, startDate?: Date, endDate?: Date): Promise<Attendance[]>;
  getAttendanceStats(startDate?: Date, endDate?: Date): Promise<any>;
  
  // Donations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getMemberDonations(memberId: number, year?: number): Promise<Donation[]>;
  getDonationStats(startDate?: Date, endDate?: Date): Promise<any>;
  getRecentDonations(limit?: number): Promise<any[]>;
  generateReceiptNumber(): Promise<string>;
  
  // Groups
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, updates: Partial<InsertGroup>): Promise<Group | undefined>;
  getAllGroups(): Promise<Group[]>;
  addMemberToGroup(groupId: number, memberId: number): Promise<GroupMembership>;
  removeMemberFromGroup(groupId: number, memberId: number): Promise<boolean>;
  getGroupMembers(groupId: number): Promise<Member[]>;
  
  // Resources
  createResource(resource: InsertResource): Promise<Resource>;
  getAllResources(): Promise<Resource[]>;
  deleteResource(id: number): Promise<boolean>;
  createResourceReservation(reservation: InsertResourceReservation): Promise<ResourceReservation>;
  getResourceReservations(resourceId: number, startDate?: Date, endDate?: Date): Promise<ResourceReservation[]>;
  
  // Photo Albums & Gallery
  createPhotoAlbum(album: InsertPhotoAlbum): Promise<PhotoAlbum>;
  updatePhotoAlbum(id: number, updates: Partial<InsertPhotoAlbum>): Promise<PhotoAlbum | undefined>;
  deletePhotoAlbum(id: number): Promise<boolean>;
  getPhotoAlbums(eventId?: number): Promise<PhotoAlbum[]>;
  addPhoto(photo: InsertPhoto): Promise<Photo>;
  getAlbumPhotos(albumId: number): Promise<Photo[]>;
  getAllPhotos(filters?: { mediaType?: string; tags?: string[]; albumId?: number }): Promise<Photo[]>;
  deletePhoto(id: number): Promise<boolean>;
  updatePhoto(id: number, updates: Partial<InsertPhoto>): Promise<Photo | undefined>;
  
  // Audit Log
  logAction(log: InsertAuditLog): Promise<AuditLog>;
  
  // Dashboard Stats
  getDashboardStats(): Promise<any>;
  
  // Event Analytics
  trackEventInteraction(interaction: {
    eventId: number;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
  }): Promise<void>;
  getEventAnalytics(eventId: number): Promise<any>;
  
  // Forum
  createForumCategory(category: InsertForumCategory): Promise<ForumCategory>;
  getForumCategories(): Promise<ForumCategory[]>;
  updateForumCategory(id: number, updates: Partial<InsertForumCategory>): Promise<ForumCategory | undefined>;
  deleteForumCategory(id: number): Promise<boolean>;
  deleteForumCategoryWithTopicTransfer(id: number): Promise<boolean>;
  
  createForumTopic(topic: InsertForumTopic): Promise<ForumTopic>;
  getForumTopic(id: number): Promise<ForumTopic | undefined>;
  getForumTopics(categoryId?: number, includeHidden?: boolean): Promise<ForumTopic[]>;
  getRecentForumTopics(limit?: number): Promise<ForumTopic[]>;
  updateForumTopic(id: number, updates: Partial<InsertForumTopic>): Promise<ForumTopic | undefined>;
  deleteForumTopic(id: number): Promise<boolean>;
  toggleTopicVisibility(id: number, isHidden: boolean): Promise<boolean>;
  toggleTopicArchive(id: number, isArchived: boolean): Promise<boolean>;
  incrementTopicViews(id: number): Promise<void>;
  
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  getForumReplies(topicId: number, includeHidden?: boolean): Promise<ForumReply[]>;
  updateForumReply(id: number, updates: Partial<InsertForumReply>): Promise<ForumReply | undefined>;
  deleteForumReply(id: number): Promise<boolean>;
  toggleReplyVisibility(id: number, isHidden: boolean): Promise<boolean>;
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.username);
  }

  async changePassword(id: number, newPassword: string): Promise<boolean> {
    const result = await db.update(users).set({ password: newPassword }).where(eq(users.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Members
  async getMember(id: number): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member || undefined;
  }

  async getMemberByCode(memberCode: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.memberCode, memberCode));
    return member || undefined;
  }

  async generateMemberCode(dateOfBirth: string): Promise<string> {
    const date = new Date(dateOfBirth);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const dayMonth = day + month;
    
    // Find existing members with same birth day/month
    const existingMembers = await db
      .select({ memberCode: members.memberCode })
      .from(members)
      .where(like(members.memberCode, `MEB${dayMonth}%`));
    
    const sequenceNumbers = existingMembers
      .map(m => parseInt(m.memberCode.slice(-2)))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);
    
    let nextSequence = 1;
    for (const seq of sequenceNumbers) {
      if (seq === nextSequence) {
        nextSequence++;
      } else {
        break;
      }
    }
    
    return `MEB${dayMonth}${nextSequence.toString().padStart(2, '0')}`;
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const memberCode = await this.generateMemberCode(insertMember.dateOfBirth);
    const [member] = await db
      .insert(members)
      .values({ ...insertMember, memberCode })
      .returning();
    
    // Generate QR code data for the member
    const qrData = JSON.stringify({
      memberId: member.id,
      memberCode: member.memberCode,
      type: 'attendance'
    });
    
    return { ...member, qrData };
  }

  async updateMember(id: number, updates: Partial<InsertMember>): Promise<Member | undefined> {
    const [member] = await db.update(members).set(updates).where(eq(members.id, id)).returning();
    return member || undefined;
  }

  async deleteMember(id: number): Promise<boolean> {
    // Delete related attendance records
    await db.delete(attendance).where(eq(attendance.memberId, id));
    // Delete related donation records
    await db.delete(donations).where(eq(donations.memberId, id));
    // Delete the member
    const result = await db.delete(members).where(eq(members.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAllMembers(limit = 50, offset = 0): Promise<Member[]> {
    return await db
      .select()
      .from(members)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(members.createdAt));
  }

  // Events
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(insertEvent).returning();
    return event;
  }

  async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    const [event] = await db.update(events).set(updates).where(eq(events.id, id)).returning();
    return event || undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount > 0;
  }

  async getEvents(startDate?: Date, endDate?: Date): Promise<Event[]> {
    let query = db.select().from(events);
    
    if (startDate && endDate) {
      query = query.where(and(
        gte(events.startDate, startDate),
        lte(events.startDate, endDate)
      ));
    }
    
    return await query.orderBy(events.startDate);
  }

  async getUpcomingEvents(limit = 10): Promise<Event[]> {
    const now = new Date();
    // Include events from 12 hours ago to allow attendance recording for events that have recently started
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    
    return await db
      .select()
      .from(events)
      .where(
        or(
          gte(events.startDate, twelveHoursAgo),
          and(
            lte(events.startDate, now),
            events.endDate ? gte(events.endDate, now) : gte(events.startDate, twelveHoursAgo)
          )
        )
      )
      .orderBy(events.startDate)
      .limit(limit);
  }

  async getPublicLandingPageEvents(): Promise<Event[]> {
    const now = new Date();
    
    return await db
      .select()
      .from(events)
      .where(
        and(
          gte(events.startDate, now),
          eq(events.showOnLandingPage, true)
        )
      )
      .orderBy(events.startDate)
      .limit(6);
  }

  // Attendance
  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    try {
      const [attendanceRecord] = await db.insert(attendance).values(insertAttendance).returning();
      return attendanceRecord;
    } catch (error: any) {
      if (error?.code === '23505') { // PostgreSQL unique constraint violation
        throw new Error('Cette personne est déjà marquée présente pour cet événement');
      }
      throw error;
    }
  }

  async createManyAttendances(attendances: InsertAttendance[]): Promise<Attendance[]> {
    try {
      const created = await db.insert(attendance).values(attendances).returning();
      return created;
    } catch (error: any) {
      if (error?.code === '23505') { // PostgreSQL unique constraint violation
        throw new Error('Certains membres sont déjà marqués présents pour cet événement');
      }
      throw error;
    }
  }

  async getEventAttendance(eventId: number): Promise<any[]> {
    const result = await db
      .select()
      .from(attendance)
      .leftJoin(members, eq(attendance.memberId, members.id))
      .where(eq(attendance.eventId, eventId));
    
    return result.map((row: any) => ({
      id: row.attendance.id,
      eventId: row.attendance.eventId,
      memberId: row.attendance.memberId,
      visitorFirstName: row.attendance.visitorFirstName,
      visitorLastName: row.attendance.visitorLastName,
      attendanceMethod: row.attendance.attendanceMethod,
      recordedBy: row.attendance.recordedBy,
      recordedAt: row.attendance.recordedAt,
      member: row.members ? {
        id: row.members.id,
        firstName: row.members.firstName,
        lastName: row.members.lastName,
        memberCode: row.members.memberCode,
        gender: row.members.gender,
        email: row.members.email,
        phone: row.members.phone
      } : null
    }));
  }

  async getMemberAttendance(memberId: number, startDate?: Date, endDate?: Date): Promise<Attendance[]> {
    let query = db
      .select()
      .from(attendance)
      .where(eq(attendance.memberId, memberId));
    
    if (startDate && endDate) {
      query = query.innerJoin(events, eq(attendance.eventId, events.id))
        .where(and(
          eq(attendance.memberId, memberId),
          gte(events.startDate, startDate),
          lte(events.startDate, endDate)
        ));
    }
    
    return await query;
  }

  async getAttendanceStats(startDate?: Date, endDate?: Date): Promise<any> {
    // Get attendance by gender and total for the period
    const genderStats = await db
      .select({
        gender: members.gender,
        count: count(attendance.id)
      })
      .from(attendance)
      .innerJoin(members, eq(attendance.memberId, members.id))
      .innerJoin(events, eq(attendance.eventId, events.id))
      .where(startDate && endDate ? and(
        gte(events.startDate, startDate),
        lte(events.startDate, endDate)
      ) : sql`1=1`)
      .groupBy(members.gender);

    const totalAttendance = await db
      .select({ count: count(attendance.id) })
      .from(attendance)
      .innerJoin(events, eq(attendance.eventId, events.id))
      .where(startDate && endDate ? and(
        gte(events.startDate, startDate),
        lte(events.startDate, endDate)
      ) : sql`1=1`);

    // Get attendance by date for chart display
    const dailyAttendance = await db
      .select({
        date: sql<string>`DATE(${events.startDate})`,
        present: count(attendance.id),
        eventTitle: events.title,
        eventId: events.id
      })
      .from(attendance)
      .innerJoin(events, eq(attendance.eventId, events.id))
      .where(startDate && endDate ? and(
        gte(events.startDate, startDate),
        lte(events.startDate, endDate)
      ) : sql`1=1`)
      .groupBy(sql`DATE(${events.startDate})`, events.title)
      .orderBy(sql`DATE(${events.startDate})`);

    // Get total member count
    const totalMembers = await db
      .select({ count: count(members.id) })
      .from(members)
      .where(eq(members.isActive, true));

    // Format daily attendance data for chart
    const chartData = dailyAttendance.map(item => ({
      date: item.date,
      present: item.present,
      total: totalMembers[0]?.count || 0,
      eventTitle: item.eventTitle
    }));

    return {
      byGender: genderStats,
      total: totalAttendance[0]?.count || 0,
      dailyData: chartData
    };
  }

  // Donations
  async generateReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const latestReceipt = await db
      .select({ receiptNumber: donations.receiptNumber })
      .from(donations)
      .where(like(donations.receiptNumber, `${year}-%`))
      .orderBy(desc(donations.receiptNumber))
      .limit(1);

    let nextNumber = 1;
    if (latestReceipt.length > 0 && latestReceipt[0].receiptNumber) {
      const lastNumber = parseInt(latestReceipt[0].receiptNumber.split('-')[1]);
      nextNumber = lastNumber + 1;
    }

    return `${year}-${nextNumber.toString().padStart(6, '0')}`;
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const receiptNumber = await this.generateReceiptNumber();
    const [donation] = await db
      .insert(donations)
      .values({ ...insertDonation, receiptNumber })
      .returning();
    return donation;
  }

  async getMemberDonations(memberId: number, year?: number): Promise<Donation[]> {
    let query = db
      .select()
      .from(donations)
      .where(eq(donations.memberId, memberId));

    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.where(and(
        eq(donations.memberId, memberId),
        gte(donations.donationDate, startDate),
        lte(donations.donationDate, endDate)
      ));
    }

    return await query.orderBy(desc(donations.donationDate));
  }

  async getDonationStats(startDate?: Date, endDate?: Date): Promise<any> {
    const stats = await db
      .select({
        donationType: donations.donationType,
        total: sum(donations.amount),
        count: count(donations.id)
      })
      .from(donations)
      .where(startDate && endDate ? and(
        gte(donations.donationDate, startDate.toISOString().split('T')[0]),
        lte(donations.donationDate, endDate.toISOString().split('T')[0])
      ) : sql`1=1`)
      .groupBy(donations.donationType);

    const totalAmount = await db
      .select({ total: sum(donations.amount) })
      .from(donations)
      .where(startDate && endDate ? and(
        gte(donations.donationDate, startDate.toISOString().split('T')[0]),
        lte(donations.donationDate, endDate.toISOString().split('T')[0])
      ) : sql`1=1`);

    return {
      byType: stats,
      total: totalAmount[0]?.total || 0
    };
  }

  async getRecentDonations(limit = 10): Promise<any[]> {
    const result = await db.select({
      id: donations.id,
      donationType: donations.donationType,
      amount: donations.amount,
      donationDate: donations.donationDate,
      isAnonymous: donations.isAnonymous,
      memberFirstName: members.firstName,
      memberLastName: members.lastName,
      createdAt: donations.createdAt
    })
    .from(donations)
    .leftJoin(members, eq(donations.memberId, members.id))
    .orderBy(desc(donations.createdAt))
    .limit(limit);

    return result;
  }

  // Groups
  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const [group] = await db.insert(groups).values(insertGroup).returning();
    return group;
  }

  async updateGroup(id: number, updates: Partial<InsertGroup>): Promise<Group | undefined> {
    const [group] = await db.update(groups).set(updates).where(eq(groups.id, id)).returning();
    return group || undefined;
  }

  async getAllGroups(): Promise<Group[]> {
    return await db
      .select()
      .from(groups)
      .where(eq(groups.isActive, true))
      .orderBy(groups.name);
  }

  async addMemberToGroup(groupId: number, memberId: number): Promise<GroupMembership> {
    const [membership] = await db
      .insert(groupMemberships)
      .values({ groupId, memberId })
      .returning();
    return membership;
  }

  async removeMemberFromGroup(groupId: number, memberId: number): Promise<boolean> {
    const result = await db
      .delete(groupMemberships)
      .where(and(
        eq(groupMemberships.groupId, groupId),
        eq(groupMemberships.memberId, memberId)
      ));
    return result.rowCount > 0;
  }

  async getGroupMembers(groupId: number): Promise<Member[]> {
    return await db
      .select(members)
      .from(members)
      .innerJoin(groupMemberships, eq(members.id, groupMemberships.memberId))
      .where(eq(groupMemberships.groupId, groupId));
  }

  // Resources
  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db.insert(resources).values(insertResource).returning();
    return resource;
  }

  async getAllResources(): Promise<Resource[]> {
    return await db.select().from(resources).orderBy(resources.id);
  }

  async deleteResource(id: number): Promise<boolean> {
    const result = await db.delete(resources).where(eq(resources.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async createResourceReservation(insertReservation: InsertResourceReservation): Promise<ResourceReservation> {
    const [reservation] = await db.insert(resourceReservations).values(insertReservation).returning();
    return reservation;
  }

  async getResourceReservations(resourceId: number, startDate?: Date, endDate?: Date): Promise<ResourceReservation[]> {
    let query = db
      .select()
      .from(resourceReservations)
      .where(eq(resourceReservations.resourceId, resourceId));

    if (startDate && endDate) {
      query = query.where(and(
        eq(resourceReservations.resourceId, resourceId),
        gte(resourceReservations.startTime, startDate),
        lte(resourceReservations.endTime, endDate)
      ));
    }

    return await query.orderBy(resourceReservations.startTime);
  }

  // Photo Albums
  async createPhotoAlbum(insertAlbum: InsertPhotoAlbum): Promise<PhotoAlbum> {
    const [album] = await db.insert(photoAlbums).values(insertAlbum).returning();
    return album;
  }

  async updatePhotoAlbum(id: number, updates: Partial<InsertPhotoAlbum>): Promise<PhotoAlbum | undefined> {
    const [album] = await db.update(photoAlbums).set(updates).where(eq(photoAlbums.id, id)).returning();
    return album || undefined;
  }

  async deletePhotoAlbum(id: number): Promise<boolean> {
    try {
      // Delete all photos associated with the album first
      await db.delete(photos).where(eq(photos.albumId, id));
      // Then delete the album
      const result = await db.delete(photoAlbums).where(eq(photoAlbums.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting photo album:", error);
      return false;
    }
  }

  async getPhotoAlbums(eventId?: number): Promise<PhotoAlbum[]> {
    let query = db.select().from(photoAlbums);
    
    if (eventId) {
      query = query.where(eq(photoAlbums.eventId, eventId));
    }
    
    return await query.orderBy(desc(photoAlbums.createdAt));
  }

  async addPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    try {
      const [photo] = await db.insert(photos).values({
        albumId: insertPhoto.albumId,
        filename: insertPhoto.filename,
        originalName: insertPhoto.originalName,
        caption: insertPhoto.caption,
        mediaType: insertPhoto.mediaType,
        fileSize: insertPhoto.fileSize,
        duration: insertPhoto.duration,
        tags: insertPhoto.tags,
        uploadedBy: insertPhoto.uploadedBy,
      }).returning();
      return photo;
    } catch (error) {
      console.error("Error in addPhoto:", error);
      throw error;
    }
  }

  async getAlbumPhotos(albumId: number): Promise<Photo[]> {
    return await db
      .select()
      .from(photos)
      .where(eq(photos.albumId, albumId))
      .orderBy(photos.uploadedAt);
  }

  async getAllPhotos(filters?: { mediaType?: string; tags?: string[]; albumId?: number }): Promise<Photo[]> {
    try {
      let query = db.select({
        id: photos.id,
        albumId: photos.albumId,
        filename: photos.filename,
        originalName: photos.originalName,
        caption: photos.caption,
        mediaType: photos.mediaType,
        fileSize: photos.fileSize,
        duration: photos.duration,
        tags: photos.tags,
        uploadedBy: photos.uploadedBy,
        uploadedAt: photos.uploadedAt,
      }).from(photos);
      
      const conditions = [];
      
      if (filters?.mediaType) {
        conditions.push(eq(photos.mediaType, filters.mediaType));
      }
      
      if (filters?.albumId) {
        conditions.push(eq(photos.albumId, filters.albumId));
      }
      
      if (filters?.tags && filters.tags.length > 0) {
        // Filter by tags using PostgreSQL array overlap operator
        conditions.push(sql`${photos.tags} ?| ${sql.array(filters.tags)}`);
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      } else {
        query = query; // No conditions, fetch all photos
      }
      
      return await query.orderBy(desc(photos.uploadedAt));
    } catch (error) {
      console.error("Error in getAllPhotos with filters:", filters, error);
      throw error; // Re-throw to be caught by the route handler
    }
  }

  async deletePhoto(id: number): Promise<boolean> {
    const result = await db.delete(photos).where(eq(photos.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updatePhoto(id: number, updates: Partial<InsertPhoto>): Promise<Photo | undefined> {
    const [updatedPhoto] = await db
      .update(photos)
      .set(updates)
      .where(eq(photos.id, id))
      .returning();
    return updatedPhoto;
  }

  // Audit Log
  async logAction(insertLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLog).values(insertLog).returning();
    return log;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<any> {
    const totalMembers = await db.select({ count: count() }).from(members).where(eq(members.isActive, true));
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Previous month for comparison
    const startOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const monthlyDonations = await this.getDonationStats(startOfMonth, endOfMonth);
    const monthlyAttendance = await this.getAttendanceStats(startOfMonth, endOfMonth);
    
    // Previous month stats for comparison
    const prevMonthDonations = await this.getDonationStats(startOfPrevMonth, endOfPrevMonth);
    const prevMonthAttendance = await this.getAttendanceStats(startOfPrevMonth, endOfPrevMonth);
    
    // Calculate total monthly donations (all types combined)
    const monthlyDonationsTotal = await db
      .select({ total: sum(donations.amount) })
      .from(donations)
      .where(and(
        gte(donations.donationDate, startOfMonth.toISOString().split('T')[0]),
        lte(donations.donationDate, endOfMonth.toISOString().split('T')[0])
      ));
    
    const prevMonthDonationsTotal = await db
      .select({ total: sum(donations.amount) })
      .from(donations)
      .where(and(
        gte(donations.donationDate, startOfPrevMonth.toISOString().split('T')[0]),
        lte(donations.donationDate, endOfPrevMonth.toISOString().split('T')[0])
      ));
    
    const upcomingEvents = await this.getUpcomingEvents(5);
    
    // Get last Sunday's attendance
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - today.getDay());
    lastSunday.setHours(0, 0, 0, 0);
    
    const nextSunday = new Date(lastSunday);
    nextSunday.setDate(lastSunday.getDate() + 1);
    
    // Previous Sunday for comparison
    const prevSunday = new Date(lastSunday);
    prevSunday.setDate(lastSunday.getDate() - 7);
    const prevSundayEnd = new Date(prevSunday);
    prevSundayEnd.setDate(prevSunday.getDate() + 1);
    
    const sundayAttendance = await this.getAttendanceStats(lastSunday, nextSunday);
    const prevSundayAttendance = await this.getAttendanceStats(prevSunday, prevSundayEnd);

    // Calculate percentage changes
    const currentDonations = monthlyDonationsTotal[0]?.total || 0;
    const previousDonations = prevMonthDonationsTotal[0]?.total || 0;
    const donationChange = previousDonations > 0 ? 
      Math.round(((currentDonations - previousDonations) / previousDonations) * 100) : 0;

    const attendanceChange = prevSundayAttendance.total > 0 ? 
      Math.round(((sundayAttendance.total - prevSundayAttendance.total) / prevSundayAttendance.total) * 100) : 0;

    const monthlyAttendanceChange = prevMonthAttendance.total > 0 ? 
      Math.round(((monthlyAttendance.total - prevMonthAttendance.total) / prevMonthAttendance.total) * 100) : 0;

    // Get current month name
    const currentMonthName = startOfMonth.toLocaleDateString('fr-FR', { month: 'long' });

    return {
      totalMembers: totalMembers[0]?.count || 0,
      monthlyDonations: currentDonations,
      monthlyAttendance: monthlyAttendance.total,
      sundayAttendance: sundayAttendance.total,
      upcomingEvents: upcomingEvents.length,
      attendanceByGender: monthlyAttendance.byGender,
      // Comparison data
      donationChange,
      attendanceChange,
      monthlyAttendanceChange,
      currentMonthName,
      previousDonations,
      prevMonthAttendance: prevMonthAttendance.total,
      prevSundayAttendance: prevSundayAttendance.total
    };
  }

  async trackEventInteraction(interaction: {
    eventId: number;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
  }): Promise<void> {
    await db.execute(sql`
      INSERT INTO event_interactions (event_id, action, ip_address, user_agent, timestamp)
      VALUES (${interaction.eventId}, ${interaction.action}, ${interaction.ipAddress}, ${interaction.userAgent}, ${interaction.timestamp})
    `);
  }

  async getEventAnalytics(eventId: number): Promise<any> {
    const interactions = await db.execute(sql`
      SELECT 
        action,
        COUNT(*) as count,
        COUNT(DISTINCT ip_address) as unique_count
      FROM event_interactions 
      WHERE event_id = ${eventId}
      GROUP BY action
    `);

    const analytics = {
      interested: { total: 0, unique: 0 },
      attending: { total: 0, unique: 0 },
      downloads: { total: 0, unique: 0 }
    };

    interactions.rows.forEach((row: any) => {
      if (row.action === 'interested') {
        analytics.interested = { total: row.count, unique: row.unique_count };
      } else if (row.action === 'attending') {
        analytics.attending = { total: row.count, unique: row.unique_count };
      } else if (row.action === 'download') {
        analytics.downloads = { total: row.count, unique: row.unique_count };
      }
    });

    return analytics;
  }

  // Forum methods
  async createForumCategory(insertCategory: InsertForumCategory): Promise<ForumCategory> {
    const result = await db.insert(forumCategories).values(insertCategory).returning();
    return result[0];
  }

  async getForumCategories(): Promise<ForumCategory[]> {
    return await db.select().from(forumCategories).where(eq(forumCategories.isActive, true)).orderBy(forumCategories.order);
  }

  async updateForumCategory(id: number, updates: Partial<InsertForumCategory>): Promise<ForumCategory | undefined> {
    const result = await db.update(forumCategories).set(updates).where(eq(forumCategories.id, id)).returning();
    return result[0];
  }

  async deleteForumCategory(id: number): Promise<boolean> {
    const result = await db.update(forumCategories).set({ isActive: false }).where(eq(forumCategories.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async deleteForumCategoryWithTopicTransfer(id: number): Promise<boolean> {
    // Check if category exists
    const category = await db.select().from(forumCategories).where(eq(forumCategories.id, id));
    if (category.length === 0) {
      return false;
    }

    // Find or create "Uncategorized" category
    let uncategorizedCategory = await db.select().from(forumCategories)
      .where(eq(forumCategories.name, "Uncategorized"))
      .limit(1);
    
    if (uncategorizedCategory.length === 0) {
      // Create the uncategorized category
      const newUncategorized = await db.insert(forumCategories).values({
        name: "Uncategorized",
        description: "Topics that have been moved from deleted categories",
        order: 9999,
        isActive: true,
        createdBy: 1, // Default to first admin user
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      uncategorizedCategory = newUncategorized;
    }

    const uncategorizedId = uncategorizedCategory[0].id;

    // Transfer all topics from the deleted category to uncategorized
    await db.update(forumTopics)
      .set({ categoryId: uncategorizedId })
      .where(eq(forumTopics.categoryId, id));

    // Delete the category
    const result = await db.delete(forumCategories).where(eq(forumCategories.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async createForumTopic(insertTopic: InsertForumTopic): Promise<ForumTopic> {
    const result = await db.insert(forumTopics).values(insertTopic).returning();
    return result[0];
  }

  async getForumTopic(id: number): Promise<ForumTopic | undefined> {
    const result = await db.select().from(forumTopics).where(eq(forumTopics.id, id));
    return result[0];
  }

  async getForumTopics(categoryId?: number, includeHidden = false): Promise<ForumTopic[]> {
    let conditions = [];
    
    if (categoryId) {
      conditions.push(eq(forumTopics.categoryId, categoryId));
    }
    
    if (!includeHidden) {
      conditions.push(eq(forumTopics.isHidden, false));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    return await db.select().from(forumTopics)
      .where(whereClause)
      .orderBy(desc(forumTopics.isSticky), desc(forumTopics.createdAt));
  }

  async getRecentForumTopics(limit = 10): Promise<ForumTopic[]> {
    return await db.select().from(forumTopics)
      .where(and(eq(forumTopics.isHidden, false), eq(forumTopics.isArchived, false)))
      .orderBy(desc(forumTopics.lastReplyAt))
      .limit(limit);
  }

  async updateForumTopic(id: number, updates: Partial<InsertForumTopic>): Promise<ForumTopic | undefined> {
    const result = await db.update(forumTopics)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forumTopics.id, id))
      .returning();
    return result[0];
  }

  async deleteForumTopic(id: number): Promise<boolean> {
    try {
      // First delete all replies associated with this topic
      await db.delete(forumReplies).where(eq(forumReplies.topicId, id));
      
      // Then delete the topic itself
      const result = await db.delete(forumTopics).where(eq(forumTopics.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting forum topic:', error);
      return false;
    }
  }

  async toggleTopicVisibility(id: number, isHidden: boolean): Promise<boolean> {
    const result = await db.update(forumTopics)
      .set({ isHidden, updatedAt: new Date() })
      .where(eq(forumTopics.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async toggleTopicArchive(id: number, isArchived: boolean): Promise<boolean> {
    const result = await db.update(forumTopics)
      .set({ isArchived, updatedAt: new Date() })
      .where(eq(forumTopics.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async incrementTopicViews(id: number): Promise<void> {
    await db.update(forumTopics)
      .set({ viewCount: sql`${forumTopics.viewCount} + 1` })
      .where(eq(forumTopics.id, id));
  }

  async createForumReply(insertReply: InsertForumReply): Promise<ForumReply> {
    const result = await db.insert(forumReplies).values(insertReply).returning();
    
    // Update topic's last reply info
    await db.update(forumTopics)
      .set({ 
        lastReplyAt: new Date(),
        lastReplyBy: insertReply.authorId,
        replyCount: sql`${forumTopics.replyCount} + 1`
      })
      .where(eq(forumTopics.id, insertReply.topicId));
    
    return result[0];
  }

  async getForumReplies(topicId: number, includeHidden = false): Promise<ForumReply[]> {
    let conditions = [eq(forumReplies.topicId, topicId)];
    
    if (!includeHidden) {
      conditions.push(eq(forumReplies.isHidden, false));
    }
    
    return await db.select().from(forumReplies)
      .where(and(...conditions))
      .orderBy(forumReplies.createdAt);
  }

  async updateForumReply(id: number, updates: Partial<InsertForumReply>): Promise<ForumReply | undefined> {
    const result = await db.update(forumReplies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forumReplies.id, id))
      .returning();
    return result[0];
  }

  async deleteForumReply(id: number): Promise<boolean> {
    const result = await db.delete(forumReplies).where(eq(forumReplies.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async toggleReplyVisibility(id: number, isHidden: boolean): Promise<boolean> {
    const result = await db.update(forumReplies)
      .set({ isHidden, updatedAt: new Date() })
      .where(eq(forumReplies.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
