# Church Management System

## Overview

This is a comprehensive church management system built with a modern full-stack architecture. The application provides functionality for managing members, tracking attendance, recording donations, organizing events, and maintaining church resources. It features a bilingual interface (French/English) with role-based access control and a responsive design optimized for both desktop and mobile use.

## System Architecture

The application follows a monorepo structure with clear separation between frontend, backend, and shared components:

- **Frontend**: React-based SPA with TypeScript, using Vite for build tooling
- **Backend**: Express.js server with TypeScript for API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with session-based authentication
- **UI Framework**: Tailwind CSS with shadcn/ui components for consistent design

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and caching
- **React Hook Form** with Zod validation for form handling
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for styling with custom design tokens

### Backend Architecture
- **Express.js** server with TypeScript
- **Passport.js** for authentication with local strategy
- **Session management** using connect-pg-simple for PostgreSQL session store
- **Password hashing** using Node.js crypto scrypt function
- **Role-based access control** with four user roles: super_admin, admin, user, member

### Database Schema
The system uses PostgreSQL with the following core entities:
- **Users**: Authentication and role management
- **Members**: Church member information with address details
- **Events**: Calendar events with types (service, meeting, activity, retreat)
- **Attendance**: Event attendance tracking with member participation
- **Donations**: Financial contributions with type categorization
- **Groups**: Member groups and group memberships
- **Resources**: Document and media resource management
- **Photo Albums & Photos**: Gallery functionality
- **Audit Log**: System activity tracking

## Data Flow

1. **Authentication Flow**: Users log in through Passport.js local strategy, sessions stored in PostgreSQL
2. **API Layer**: RESTful endpoints handle CRUD operations with role-based authorization
3. **State Management**: TanStack Query manages server state with optimistic updates
4. **Form Handling**: React Hook Form with Zod validation ensures data integrity
5. **Database Operations**: Drizzle ORM provides type-safe database queries

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection with Neon compatibility
- **Drizzle ORM**: Type-safe database toolkit
- **bcryptjs**: Password hashing (backup to native crypto)
- **date-fns**: Date manipulation and formatting
- **Radix UI**: Headless UI components for accessibility

### Development Tools
- **Vite**: Build tool with HMR and optimized bundling
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

### Build Process
- **Development**: `npm run dev` - Runs with tsx for TypeScript execution
- **Production Build**: `npm run build` - Vite builds frontend, esbuild bundles backend
- **Start**: `npm run start` - Runs production build with Node.js

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **Sessions**: SESSION_SECRET for secure session management
- **Port Configuration**: Configured for port 5000 with external port 80

### Replit Integration
- **Modules**: nodejs-20, web, postgresql-16
- **Autoscale Deployment**: Configured for automatic scaling
- **Development Tools**: Cartographer and runtime error overlay for debugging

The application uses a monolithic deployment strategy where both frontend and backend are served from the same Express server, with static assets served from the dist/public directory.

## Recent Changes
- July 5, 2025: **Completely resolved Forum member name display and achieved comprehensive mobile responsiveness**
  - **RESOLVED**: Both Forum main page AND topic detail pages now correctly display actual member names (e.g., "Keza Nyota Toussaint", "Grace DONGMO WANDJI") instead of "Utilisateur #1" 
  - Fixed critical API timing issue by replacing faulty apiRequest with direct fetch for proper user name resolution on ALL Forum pages
  - **COMPREHENSIVE MOBILE OPTIMIZATION**: Completely transformed topic detail page with responsive padding (p-2 sm:p-4 lg:p-6), responsive text scaling (text-xs sm:text-sm, text-base sm:text-lg), and optimized mobile layouts
  - Enhanced metadata display with responsive icon sizing (w-3 h-3 sm:w-4 sm:h-4) and improved mobile stacking (flex-col sm:flex-row)
  - Improved reply cards with responsive padding, better mobile admin control positioning, and enhanced content readability
  - Updated all components with semantic dark mode styling and proper theme-aware color classes throughout
  - Enhanced container sizing (max-w-4xl) with responsive spacing and better mobile text wrapping
  - Forum system now provides complete mobile-first experience with consistent member name resolution and fully responsive design across all screen sizes

- July 5, 2025: **Implemented comprehensive admin delete functionality for Forum comments and archived topics**
  - Added delete reply mutation with confirmation dialog and proper error handling
  - Added delete topic mutation that navigates back to forum after successful deletion
  - Added delete buttons with trash icons for both replies and topics (topics only deletable when archived)
  - Added comprehensive French and English translations for all delete functionality
  - Added admin visibility/archive controls for topics with proper UI
  - Both backend API endpoints already exist and are properly secured with admin authentication
  - Admins can now delete any reply with confirmation dialog, delete archived topics, hide/show topics and replies, and archive/unarchive topics

- July 5, 2025: **Enhanced Forum responsiveness for mobile devices with complete layout fixes**
  - Fixed Create Category button overlap by implementing vertical stacking instead of horizontal layout
  - Restructured category admin buttons to appear below category names preventing cramped layouts
  - Enhanced breakpoint strategy using xl: instead of lg: for better tablet and mobile stacking
  - Improved control bar layout with proper mobile stacking for search and category selection
  - Enhanced topic cards with responsive badges, word-breaking titles, and compact admin buttons
  - Added proper mobile spacing and padding throughout the Forum interface with responsive text sizing
  - Implemented flexible grid layout that adapts seamlessly from mobile to desktop
  - Used semantic color classes for proper dark mode compatibility across all screen sizes

- July 5, 2025: **Fixed Forum topic detail functionality with proper URL parameter extraction**
  - Fixed URL parameter extraction issue by replacing wouter hooks with direct path parsing
  - Topic detail page now correctly extracts topic ID from URLs like /topic/21
  - Resolved "Topic not found" error that was showing Topic ID: 0 instead of actual ID
  - Added missing backToForum translation key to French translations ("Retour au forum")
  - All Forum functionality fully working: topic listing, detail view, content display, reply system, and admin controls
  - Users can successfully click on topics to view full content and add replies

- July 5, 2025: **Implemented complete file upload system for Gallery media**
  - Added multer middleware for handling real file uploads to uploads/gallery directory
  - Created FormData-based file upload endpoint accepting images and videos up to 50MB
  - Updated Gallery frontend to display actual uploaded media as thumbnails instead of placeholder icons
  - Implemented proper static file serving for uploaded content via /uploads route
  - Fixed backend API parameter validation and error handling for file uploads
  - Gallery now supports real device file selection with automatic media type detection
- July 5, 2025: **Enhanced Gallery with complete French translations and improved media display**
  - Added comprehensive French translations for all Gallery elements (albums, addMedia, createAlbum, etc.)
  - Improved media card display to show filename, file size, and media type clearly
  - Enhanced media thumbnails with better visual indicators for photos vs videos
  - Translated dialog boxes, buttons, form labels, and error messages to French
  - Improved media grid layout with clearer file information display
  - Added proper translation keys for album management and media operations

- July 5, 2025: **Enhanced Gallery with device file upload and removed mock data**
  - Implemented proper device file selection with accept="image/*,video/*" input type
  - Added automatic media type detection based on file MIME type (photo vs video)
  - Enhanced file upload form with automatic filename, file size, and media type population
  - Added tags input field with comma-separated tag parsing for content organization
  - Removed mock/sample gallery data from database for clean production state
  - Fixed form reset functionality to clear all fields when upload dialog opens
  - Gallery now supports real file uploads from user devices instead of manual filename entry

- July 5, 2025: **Fixed Gallery album creation error with proper API validation**
  - Corrected API parameter order from apiRequest(url, method, data) to apiRequest(method, url, data)
  - Added comprehensive Zod schema validation in backend for album and photo creation
  - Enhanced error handling with detailed validation messages for debugging
  - Fixed Event interface date field mismatch (startDate vs date) preventing album creation
  - All Gallery mutations now work correctly with proper data validation and error reporting

- July 4, 2025: **Completed comprehensive Gallery system implementation replacing resource management**
  - Removed resource management functionality completely from the application (navigation, routing, page files, and database dependencies)
  - Enhanced database schema with comprehensive Gallery support: photos table now includes mediaType field for both images and videos, tags array for categorization and filtering
  - Added complete Gallery API routes for authenticated album creation, media upload, retrieval, filtering by album/mediatype/tags, and management operations  
  - Enhanced storage interface with new gallery methods: getAllPhotos with advanced filtering, deletePhoto, updatePhoto for complete media lifecycle management
  - Updated navigation sidebar to replace Resources with Gallery option maintaining clean user interface
  - Implemented comprehensive Gallery page with album organization, grid/list view modes, media type filtering, tag-based organization, and role-based access control
  - Added album creation with optional event association, media upload with metadata, media detail viewing, and admin deletion capabilities
  - Gallery system supports both photos and videos with file size tracking, duration for videos, and flexible tagging system for content organization
  - Enhanced role-based permissions: all authenticated users can access Gallery, admins can delete media, maintaining security while enabling church media sharing
  - Complete replacement of resource management with modern media gallery functionality suitable for church photo/video documentation and event memories

- July 4, 2025: Fixed resource creation validation errors by aligning frontend form with backend schema
  - Corrected form fields to match church resources schema (name, type, capacity, description)
  - Updated type dropdown options to proper values: room (Salle), equipment (Équipement), vehicle (Véhicule)
  - Removed invalid fields (URL, category) that don't exist in backend schema
  - Added capacity field for tracking resource capacity with proper number input validation
  - Fixed frontend-backend mismatch that was causing 400 validation errors during resource creation
  - Resources form now properly validates and creates church physical resources

- July 4, 2025: Fixed attendance chart translation display issues for proper French text
  - Added missing French translation keys for "Présence par Genre" (Attendance by Gender)
  - Fixed empty state messages showing proper French text instead of technical keys
  - Enhanced time period selector labels with proper French translations (7 derniers jours, 30 derniers jours, 3 derniers mois)
  - Updated chart data labels to display "Présent" instead of untranslated "present"
  - Attendance chart now displays completely in French with proper labels and messages

- July 4, 2025: Enhanced dashboard statistics with actual monthly data and comparison metrics
  - Updated dashboard stats to show real percentage changes instead of static placeholder numbers
  - Total Members card now displays monthly attendance change percentage for current month context
  - Sunday Attendance shows actual percentage change vs previous Sunday with live calculations
  - Monthly Donations displays real percentage change vs previous month with authentic trends
  - Upcoming Events shows current month name (e.g., "juillet") instead of generic "Ce mois"
  - Enhanced backend to calculate month-over-month comparisons for donations and attendance
  - Added previous period statistics for meaningful percentage change calculations
  - Dashboard now provides genuine insights into church growth and engagement patterns
  - All statistics reflect authentic church activity data rather than mock information

- July 4, 2025: Implemented comprehensive year/month filtering for donation reports with enhanced flexibility
  - Added year selection dropdown supporting current year plus 5 previous years for historical reporting
  - Enhanced fiscal reports with per-member and per-year filtering capabilities for precise tax documentation
  - Implemented month/year selection for monthly reports allowing analysis of any specific month/year combination
  - Updated donation history reports to filter by selected year instead of showing all historical data
  - Enhanced Excel export with intelligent filename generation including year and member information
  - Added dynamic button labels showing active filters (e.g., "Fiscal Report (2025)", "Monthly Report (Juillet 2025)")
  - Improved report titles to clearly indicate selected year and month for better documentation
  - All PDF reports now include selected filter information in headers for complete transparency
  - Enhanced member filtering works seamlessly with new year/month filtering for precise data analysis
  - System now provides complete control over reporting periods enabling accurate financial analysis by year, month, and member

- July 4, 2025: Enhanced donation reporting system with professional church documentation features
  - Replaced problematic jsPDF with HTML-to-PDF approach using browser's native print functionality for better reliability
  - Added centered Mission Évangélique Boanergès logo header to all PDF reports using logo_boanerges_ico.jpg
  - Implemented member-specific report filtering with dropdown selection for all report types
  - Added church registration number (1167158-7) to fiscal report header for official documentation
  - Created dedicated fiscal report with pastor signature section and official attestation statement
  - Added "Pasteur Eric Kouadio Tanoh" as signing authority for fiscal reports with proper certification text
  - Separated fiscal report generation function to include signature section while keeping other reports clean
  - Fiscal reports now suitable for official church documentation with registration number and pastor certification

- July 4, 2025: Fixed navbar user profile positioning to always be the rightmost element
  - Moved user profile dropdown to be the absolute last item in header navigation
  - Ensured user profile remains in upper right corner regardless of other elements
  - Action buttons now appear before user profile instead of after
  - Improved header layout consistency and user experience

- July 4, 2025: Fixed calendar date alignment issue by implementing proper week grid calculation
  - Corrected July 2025 to start on Tuesday instead of incorrectly showing Sunday
  - Updated calendar grid to include days from previous/next months for complete week view
  - Added startOfWeek/endOfWeek calculations with Sunday as first day of week (weekStartsOn: 0)
  - Calendar now properly aligns dates with their correct weekdays for accurate month display

- July 4, 2025: Streamlined dashboard by removing welcome section for cleaner interface
  - Removed welcome to dashboard section completely from dashboard page
  - Dashboard now starts directly with stats cards and main content
  - Cleaner, more focused interface without redundant welcome messaging
  - Maintained all functional components while removing visual clutter

- July 4, 2025: Streamlined user interface by moving member information to header
  - Removed user information section completely from sidebar for cleaner navigation
  - Header now displays only member's first name (or username for admins) as clickable text
  - Clicking name in header opens dropdown with full details, settings access, and logout
  - Eliminated notification bell from header as requested
  - Simplified design maintains all functionality while reducing visual clutter
  - Settings page accessible through clean header dropdown interface
  
- July 4, 2025: Implemented personal attendance tracking for members
  - Created PersonalAttendance component showing member's total past attendance to past events only
  - Members now see their complete attendance history organized by month with event details
  - Dashboard displays PersonalAttendance for members vs RecentAttendance for admins/staff
  - Personal attendance shows total count, monthly breakdown, and individual event attendance records
  - Only past events are included in personal attendance tracking (future events excluded)
  - Added comprehensive translation support for personal attendance features

- July 4, 2025: Enhanced member profile and donation currency display
  - Updated all donation amounts from € to $ currency format across personal donation components
  - Enhanced sidebar to display member's first name instead of username for personalized experience
  - Implemented comprehensive profile dropdown for members featuring member code display, profile settings placeholders (password change, profile picture), and logout functionality
  - Added member data fetching API endpoint and custom hook for seamless member information retrieval
  - Enhanced sidebar user experience with role-based profile options and member-specific interface elements

- July 4, 2025: Implemented comprehensive role-based dashboard restrictions for members
  - Added personal attendance filtering showing only member's own attendance records instead of all church attendance
  - Created PersonalDonations component displaying member's individual donation history and totals
  - Removed admin-only statistics (Total Members, Attendance by Gender charts) from member dashboard view
  - Members now see personalized dashboard with only their personal data (past attendance, donations, upcoming events)
  - Fixed member data access using username as memberCode for proper personal data filtering
  - Added translation support for personal donation functionality in both French and English
  - Enhanced member dashboard security by preventing access to aggregated church statistics

- July 4, 2025: Reimplemented comprehensive role-based access control system
  - Created useRoleProtection hook for consistent permission checking across all components
  - Implemented sidebar navigation filtering based on user roles (super_admin, admin, user, member)
  - Added page-level access protection with automatic redirection for unauthorized users
  - Restricted admin-only actions in Members page: Add Member, Edit Member, Delete Member buttons only visible to admins
  - Added access denied page for Donations module (admin-only access)
  - Settings menu item now only visible to super_admin and admin roles
  - Role permissions: super_admin/admin (full access), user (limited access, no donations/admin actions), member (basic modules only)
  - Regular members can now only access: Dashboard, Calendar, Forum, About, Gallery
  - Enhanced security by preventing unauthorized access to sensitive church management functions

- July 4, 2025: Enhanced attendance recording functionality and fixed navigation
  - Fixed Record Attendance to include all events (past and future) instead of only upcoming events
  - Updated event selection logic to sort events by date (most recent first) for easier navigation
  - Improved auto-selection to choose the most recent event rather than next upcoming event
  - Removed Quick Actions section from dashboard for cleaner interface
  - Fixed "View Calendar" button to properly navigate to calendar page using wouter Link component
  - Dashboard now displays only essential components: Stats Cards, Attendance Chart, Donations Chart, Recent Attendance, and Upcoming Events

- July 4, 2025: Completed comprehensive dark mode implementation across Dashboard and Record Attendance components
  - Fixed hardcoded colors in stats-cards.tsx (icon backgrounds), attendance-chart.tsx (empty state and legend text), donations-chart.tsx (empty state), recent-attendance.tsx (cards and backgrounds), recent-activity.tsx (text colors)
  - Fixed Record Attendance dialog dark mode issues: event selection header (bg-white → bg-background), member cards (bg-white → bg-card), search icons (text-gray-400 → text-muted-foreground), status text (text-gray-600 → text-muted-foreground), QR code section colors
  - Replaced problematic colors like bg-gray-50, text-gray-900, text-gray-600, border-gray-300 with semantic dark mode classes
  - Updated all components to use semantic Tailwind classes: text-muted-foreground, border-border, bg-muted/50, text-foreground, bg-card
  - Fixed specific elements: Attendance by Gender charts (no data states and legend), Total presences, Events sections, Donations by Type (empty states), Members/Visitors counts, QR code sections
  - Replaced hardcoded icon background colors (bg-blue-100 dark:bg-blue-900/20) with semantic color/opacity approach (bg-blue-500/10)
  - Enhanced empty state styling with proper dark mode support using bg-muted/50 and border-border
  - Fixed individual attendance and donation card backgrounds to use bg-card with border-border
  - Dashboard and Record Attendance dialog now fully support both light and dark themes with consistent styling across all visual elements

- July 4, 2025: Fixed critical "Topic not found" error by correcting TanStack Query configuration
  - Identified root cause: default query function only used first element of multi-part queryKey arrays
  - Changed from `["/api/forum/topics", topicId]` to `["/api/forum/topics/${topicId}"]` format
  - Applied same fix to topic replies query for consistent data fetching behavior
  - Resolved issue where topics were clickable but showed "Topic not found" despite API working correctly
  - Topic detail pages now load properly with full content, replies, and admin controls
  - Fixed TypeScript errors caused by empty topic object due to failed query execution

- July 4, 2025: Fixed critical topic navigation issue by replacing window.location.href with proper React Router navigation
  - Replaced problematic window.location.href navigation with wouter's setLocation hook for proper SPA navigation
  - Added useLocation import from wouter for seamless single-page application routing
  - Topic clicks now trigger smooth navigation without full page reloads
  - Preserved topic view tracking functionality during navigation transitions
  - Enhanced user experience with proper React Router navigation patterns
  - Fixed potential navigation issues that could break forum user experience

- July 4, 2025: Fixed topic detail display issue by correcting database schema mismatches
  - Updated ForumTopic interface to include missing isLocked field matching database schema
  - Changed isPinned to isSticky field reference to match actual database column names
  - Updated ForumCategory interface to use order instead of displayOrder field
  - Corrected lastActivityAt to lastReplyAt field reference for proper topic data display
  - Fixed frontend TypeScript interfaces to exactly match backend API response structure
  - Created topics now display correctly with proper view counts and reply functionality
  - Topic detail page now loads successfully instead of showing "Topic not found" error

- July 4, 2025: Completed comprehensive admin category creation system
  - Fixed critical topic creation bug by correcting API request parameter order (url, method) to (method, url, data)
  - Implemented complete admin category creation dialog with form validation and proper authentication checks
  - Added "Create Category" button in categories section with comprehensive UI dialog interface
  - Extended translation system with category creation keys for both French and English languages
  - Resolved duplicate translation keys and missing Label import issues for proper functionality
  - Category creation includes proper form validation, loading states, and success notifications
  - Admin-only functionality properly restricted with authentication requirements
  - Backend API endpoint for POST /api/forum/categories fully functional for creating new categories

- July 4, 2025: Completed comprehensive topic detail navigation system
  - Fixed topic detail page implementation with proper routing (/topic/:id)
  - Enhanced forum topics to navigate to detail pages when clicked
  - Added comprehensive translation keys for topic detail page in both French and English
  - Fixed Header component calls throughout topic detail page with required title props
  - Removed duplicate translation keys that were causing build warnings
  - Topic detail page now displays full content, replies, and allows authenticated users to post new replies
  - Implemented proper back navigation to forum with "Back to Forum" button
  - Users can now click any topic to view full details instead of just logging to console

- July 4, 2025: Completed comprehensive category management with deletion and topic preservation
  - Added category deletion buttons (red trash icons) with admin-only access control
  - Implemented automatic topic transfer to "Uncategorized" category during deletion
  - Created confirmation dialog with clear warnings about data transfer process
  - Built backend DELETE API endpoint with proper topic migration logic
  - Enhanced translation system with category deletion keys for both French and English
  - Ensured data integrity by preventing topic loss when categories are deleted
  - Category deletion requires admin authentication and includes loading states with success notifications

- July 4, 2025: Implemented advanced topic analytics and click tracking
  - Added topic view count tracking that increments when users click on topics
  - Made topic cards fully clickable with proper cursor styling and hover effects
  - Implemented backend API endpoint for view tracking (POST /api/forum/topics/:id/view)
  - Added proper event handling to prevent admin buttons from triggering topic clicks
  - Enhanced topic display with real-time view counts and reply counts from database
  - Topic analytics stored in PostgreSQL with view_count and reply_count columns
  - Click tracking works seamlessly with existing forum functionality and admin controls

- July 4, 2025: Enhanced forum with topic counts and admin category editing
  - Added topic counts display in parentheses next to category names (e.g., "Général (3)")
  - Implemented admin-only edit buttons on each category with pencil icons
  - Created comprehensive category editing dialog with name and description fields
  - Added complete translation support for category editing functionality in French and English
  - Built backend API route (PATCH /api/forum/categories/:id) for updating forum categories
  - Enhanced forum administration capabilities with real-time category management
  - Category editing includes proper form validation, loading states, and success notifications

- July 4, 2025: Streamlined forum interface and removed test data
  - Removed recent topics section from forum layout for cleaner interface
  - Updated forum to show only categories sidebar and main topics area
  - Modified topic sorting to display latest topics first (by creation date descending)
  - Cleaned up test/mock forum data from database while preserving legitimate content
  - Backend now sorts topics by creation date instead of last reply date for consistency
  - Forum layout now uses simplified grid with categories sidebar and main content area

- July 4, 2025: Fixed forum layout structure and topic creation functionality
  - Resolved sidebar visibility issue by implementing proper layout structure with Sidebar and Header components
  - Updated forum page to match other protected pages layout pattern using flex container structure
  - Enhanced topic creation with comprehensive error handling, loading states, and success notifications
  - Added missing translation keys: "creating" (English) and "création..." (French) for loading states
  - Fixed topic creation mutation with proper toast notifications and cache invalidation
  - Forum now has consistent navigation experience with sidebar visible and fully functional topic creation
  - Topic creation includes disabled state during submission and proper form validation

- July 4, 2025: Fixed comprehensive forum database schema mismatches and restored functionality
  - Corrected forum_categories schema to use `order` column instead of `displayOrder` (matches actual database)
  - Updated forum_topics schema to match database structure: `isSticky`, `lastReplyAt`, `replyCount` vs previous `isPinned`, `lastActivityAt`
  - Fixed all forum storage methods to use correct column names from actual database schema
  - Resolved database query errors that were preventing forum from loading
  - Enhanced reply creation to properly update topic statistics (reply count, last reply info)
  - Removed duplicate translation keys causing build warnings in English translations
  - Forum now fully functional with categories loading, topics displaying, and archive system operational
  - Added test forum data including archived topics to verify archive functionality works correctly

- July 3, 2025: Synchronized translation files and enhanced landing page
  - Fixed missing translation keys between fr.ts and en.ts files
  - Added all missing keys: activityCalendar, donationManagement, generalDonation, offerings, tithes, recentDonations, quickDonationActions, totalThisMonth, photoGallery, boanerges, topicArchiveStatusUpdated
  - Enhanced landing page: replaced pastor icons with professional images, centered Upcoming Events and Our Services sections
  - Removed duplicate "search" key warning from French translations
  - Complete translation synchronization ensures proper bilingual functionality

- July 2, 2025: Completed comprehensive forum archive functionality
  - Added isArchived boolean field to forum topics database schema with default false value
  - Implemented archive/unarchive API endpoints with admin-only authentication
  - Created topic archive mutation with success/error handling for frontend admin controls
  - Added Archive/Unarchive admin buttons in topic details with proper icon indicators
  - Implemented archive status indicators (orange Archive icon) throughout forum topic lists
  - Disabled reply form for archived topics with clear status messaging
  - Updated ForumTopic interfaces across client to include isArchived field
  - Archive system properly sorts topics (archived appear at bottom) and prevents new replies
  - Admin controls allow toggling archive status with immediate UI feedback
  - Clear messaging explains topic status when archived or locked

- July 1, 2025: Fixed comprehensive forum administration features
  - Fixed topic hiding functionality by correcting API endpoint URL in client-side mutation
  - Changed from `/api/forum/topics/${topicId}` to `/api/forum/topics/${topicId}/visibility` 
  - Implemented admin controls for hiding/unhiding forum replies with proper authentication
  - Updated database queries to show all replies (including hidden ones) to admins while filtering hidden replies for regular users
  - Added admin-only eye/eyeoff buttons on replies for visibility management
  - Enhanced forum moderation capabilities with full admin control over content visibility
  - Both topic hiding and reply hiding now fully functional for administrators

- July 1, 2025: Completed comprehensive member authentication and automatic account creation
  - Fixed password hashing for all 14 member users to use birth year as password
  - All members can now log in using member code + birth year format (e.g., MEB230201/1998)
  - Fixed authentication system to properly handle scrypt password format for member accounts
  - Updated passwords for all member codes: MEB010101/2000, MEB010102/2000, MEB030101/2001, MEB030801/2005, MEB041101/1978, MEB060601/2000, MEB100501/1981, MEB110301/2008, MEB130801/1985, MEB130802/2010, MEB140601/1994, MEB201201/1999, MEB230201/1998, MEB231001/2001
  - Fixed login redirect: all users now go to dashboard after login instead of member-specific routes
  - Fixed date formatting errors in member portal to prevent runtime exceptions
  - Implemented automatic user account creation: new members automatically get user accounts with "member" role
  - Fixed database schema issues in member-to-user account creation process

- July 1, 2025: Completed comprehensive forum system translation
  - Finalized translation of all remaining forum UI elements in main Forum component
  - Converted hardcoded text to translation keys: "Rechercher" → {t("search")}
  - Updated category section header and description to use translation system
  - Translated topic count display and "no categories available" message
  - Forum system now fully supports bilingual operation (French/English)
  - All forum dialogs, forms, and main component text properly internationalized

- July 1, 2025: Enhanced forum functionality and improved UX
  - Switched forum layout: Recent Topics now appears first (left side), Categories second (right side)
  - Made forum topics clickable with hover effects and interactive styling
  - Added comprehensive forum translations to both French (fr.ts) and English (en.ts) language files
  - Fixed recent topics endpoint to fetch from all categories instead of just category 1
  - Enhanced in-memory topic storage to properly persist and display newly created topics
  - Updated forum styling with better visual feedback for user interactions
  - Improved topic display with proper click handlers for future navigation implementation

- July 1, 2025: Separated translation files into individual language modules
  - Split `client/src/lib/i18n.ts` into separate French and English translation files
  - Created `client/src/lib/translations/fr.ts` for French translations
  - Created `client/src/lib/translations/en.ts` for English translations  
  - Added `client/src/lib/translations/index.ts` for centralized exports
  - Improved organization and maintainability of translation resources
  - All existing translation keys preserved and functionality maintained

- July 1, 2025: Integrated members into unified user authentication system
  - Replaced separate member authentication with unified users table approach
  - Members now automatically get user accounts with "member" role upon creation
  - Member login uses member code as username and birth year as password
  - Added memberCode field to users table for member identification
  - Simplified authentication - no more separate endpoints or PIN systems
  - Member credentials: MEB130801 / password: 1985 (birth year)
  - Auto-sync between members and users tables for data consistency

- June 26, 2025: Fixed calendar date alignment issue
  - Corrected calendar grid to start with Sunday as first day of week
  - Fixed date calculation logic to properly align dates with weekdays
  - Calendar now correctly shows July 1, 2025 as Tuesday (proper weekday)
  - Updated day headers to standard Sunday-first week layout (Dim, Lun, Mar, Mer, Jeu, Ven, Sam)

- June 25, 2025: Implemented comprehensive role-based access control system
  - Created granular permission system for regular users with specific module access
  - Regular users can view dashboard (attendance by gender, upcoming events, total members, sunday attendance)
  - Members module: view-only list access without details or modification rights
  - Attendance: full access for regular users
  - Donations: completely blocked access for regular users
  - Calendar: view-only access without creation/modification permissions
  - Gallery: view-only access without upload/modification capabilities
  - Resources: view-only access without upload/modification/deletion rights
  - About: view-only access maintained
  - Settings: no access for regular users
  - Updated sidebar navigation to show only permitted modules based on user role
  - Enhanced UI with permission-based button visibility and access restriction messages

- June 25, 2025: Fixed critical authentication system issues
  - Resolved password comparison function to handle both bcrypt and scrypt formats
  - Fixed bcrypt import and authentication strategy implementation
  - Updated admin password hash to use proper bcrypt format
  - Both admin and member login systems now fully functional
  - Session serialization working correctly for both user types
  - Admin credentials: erickt23 / password
  - Member credentials: MEB110301 / 2008

- June 24, 2025: Implemented comprehensive RBAC system with member portal
  - Added member authentication using member code + birth year login
  - Created dual login system (admin/user credentials + member code/birth year)
  - Implemented role-based permissions: super_admin, admin, user, member
  - Added member portal with access to events, donations, and forum based on permissions
  - Created forum schema and basic forum functionality structure
  - Updated database schema with member permissions (hasForumAccess, canViewEvents, canViewDonations)
  - Added member login page and member portal dashboard
  - Implemented content access restrictions based on member permissions
  - Enhanced landing page with separate member and admin login options

- June 24, 2025: Enhanced attendance system with comprehensive past event modification capabilities
  - Added ability to modify attendance for past events with proper date/time tracking
  - Implemented deactivated member prevention for attendance registration
  - Created attendance history interface with edit/delete functionality
  - Fixed dark mode styling issues in attendance registration dialog
  - Added retroactive attendance marking with audit trails
  - Updated API routes to include all events (past and future) for attendance management

## Changelog
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.