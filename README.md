# TrainTrackDesk - OJT Classroom Management System

TrainTrackDesk is a web-based On-the-Job Training (OJT) tracking system designed to facilitate classroom management, student assignments, and training progress monitoring. The platform provides different interfaces and capabilities for students, professors, and administrators.

## Features

- **User Authentication & Role Management**
  - Secure user authentication via Clerk
  - Role-based access control (student, professor, admin)
  - Profile management

- **Classroom Management**
  - Create and manage classrooms
  - Upload classroom materials (documents, images)
  - Manage student enrollment
  - Real-time updates on classroom activities

- **File Upload System**
  - Secure file uploads using UploadThing
  - Support for images and documents (PDF, DOCX)
  - File management with appropriate permissions

- **Database Integration**
  - PostgreSQL database with Drizzle ORM
  - Efficient data querying and management
  - Structured data modeling

## Technology Stack

- **Front-end**
  - React.js for UI components
  - Next.js for server-side rendering and API routes
  - TailwindCSS for styling

- **Back-end**
  - Next.js API Routes
  - PostgreSQL database
  - Drizzle ORM for database interactions

- **Authentication & Users**
  - Clerk for authentication and user management

- **Storage**
  - UploadThing for file uploads and storage

- **Deployment**
  - Vercel for hosting and deployment

## Setup Guide

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (we use Neon)

### Environment Setup

1. Clone the repository
2. Create a `.env` file with the following variables:

```
# Database
DATABASE_URL=your_postgresql_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# UploadThing
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
NEXT_PUBLIC_UPLOADTHING_URL=your_uploadthing_url

# Environment
NODE_ENV=development
```

### Installation

```bash
# Install dependencies
npm install

# Generate database migrations
npm run db:generate

# Push schema to database
npm run db:push

# Set up initial data
npm run db:setup

# Start development server
npm run dev
```

### Access the Application

Once the server is running, access the application at:

```
http://localhost:3000
```

## License

This project is licensed under the MIT License.
