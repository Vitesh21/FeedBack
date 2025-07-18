# FeedbackFlow - Form Builder Application

## Overview

FeedbackFlow is a full-stack web application that allows users to create, manage, and collect responses from custom forms. The application provides a form builder interface, response collection, and analytics dashboard. It's built with modern web technologies focusing on user experience and data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Bundler**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript throughout the application
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy and session-based auth

## Key Components

### Database Schema
Located in `shared/schema.ts`, the database includes:
- **Users**: Authentication and user management
- **Forms**: Form definitions with title, description, and publication status
- **Questions**: Individual form questions with types (text, multiple_choice, rating)
- **Responses**: User submissions to forms
- **Answers**: Individual answers to specific questions

### Authentication System
- Session-based authentication using Passport.js
- Password hashing with Node.js crypto module (scrypt)
- PostgreSQL session store for persistence
- Protected routes with authentication middleware

### Form Builder
- Dynamic form creation with multiple question types
- Real-time preview capabilities
- Question reordering and management
- Form publication controls

### Response Collection
- Public form submission without authentication
- Response analytics and export functionality
- CSV export capabilities for data analysis

## Data Flow

1. **User Registration/Login**: Users authenticate through Passport.js local strategy
2. **Form Creation**: Authenticated users create forms through the form builder
3. **Form Publication**: Forms can be published to make them publicly accessible
4. **Response Collection**: Anonymous users submit responses through public form URLs
5. **Analytics**: Form owners view responses and analytics through the dashboard

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with custom design tokens
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **Session Management**: express-session with connect-pg-simple
- **WebSocket**: ws for Neon database WebSocket connections
- **Validation**: Zod for runtime type validation

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- TypeScript compilation with strict mode enabled
- Automatic database migrations with Drizzle Kit
- Environment-specific configurations

### Production Build
- Vite builds the frontend with optimizations
- ESBuild bundles the backend with external packages
- Static assets served from Express
- Database migrations handled through Drizzle Kit

### Environment Configuration
- Database connection via DATABASE_URL environment variable
- Session secret for authentication security
- Build outputs separated (frontend to `dist/public`, backend to `dist`)

### Key Architectural Decisions

1. **Monorepo Structure**: Shared TypeScript types between frontend and backend in `shared/` directory
2. **Type Safety**: End-to-end TypeScript with Zod for runtime validation
3. **Session-based Auth**: Chosen over JWT for simplicity and security
4. **Serverless Database**: Neon PostgreSQL for scalability and ease of deployment
5. **Component Library**: shadcn/ui for consistent, accessible UI components
6. **Server-Side Rendering**: Not implemented - SPA approach for faster development

The application prioritizes developer experience with strong typing, modern tooling, and clear separation of concerns between frontend and backend while maintaining shared type definitions.