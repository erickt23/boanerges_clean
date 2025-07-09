# Boanerges Project

This is a full-stack application for managing church-related activities, including members, events, donations, and a forum.

## Setup Instructions

1.  **Environment Variables**: Create a `.env` file based on `.env.example` and fill in the necessary details.
2.  **Install Dependencies**: Run `npm install` or `yarn install`.
3.  **Database Setup**: Ensure your PostgreSQL database is running and configured. Run `npm run db:push` to apply schema migrations.
4.  **Run Development Server**: `npm run dev`
5.  **Build for Production**: `npm run build`
6.  **Start Production Server**: `npm run start`

## Project Structure

-   `client/`: Frontend React application.
-   `server/`: Backend Node.js/Express application.
-   `shared/`: Shared code, including Drizzle ORM schema.

## Features

-   User and Member Management
-   Event and Attendance Tracking
-   Donation Management
-   Forum (Categories, Topics, Replies)
-   Resource Management
-   Photo Albums

## Technologies Used

-   **Frontend**: React, TypeScript, Tailwind CSS, Radix UI
-   **Backend**: Node.js, Express, TypeScript
-   **Database**: PostgreSQL, Drizzle ORM
-   **Build Tools**: Vite, esbuild
