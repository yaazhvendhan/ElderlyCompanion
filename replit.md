# Digital Elderly Assistant - Replit.md

## Overview

The Digital Elderly Assistant is a compassionate web application designed specifically for elderly users. It provides a gentle, accessible interface with large buttons, high contrast design, and simple navigation to help seniors manage their daily tasks, medications, and stay connected with loved ones.

The application features a React frontend with TypeScript, an Express.js backend, and uses Drizzle ORM with PostgreSQL for data persistence. The UI is built with shadcn/ui components and styled with Tailwind CSS for a clean, modern appearance optimized for accessibility.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling
- **Development**: tsx for TypeScript execution in development

### Data Storage
- **Database**: PostgreSQL with Neon Database serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Shared TypeScript schema definitions with Zod validation
- **Migrations**: Drizzle-kit for database schema management

## Key Components

### Data Models
1. **Reminders**: Task and medication scheduling with frequency options
2. **Memories**: Personal notes and important information storage
3. **Chat Messages**: Conversation history with the companion chatbot
4. **Emergency Contacts**: Quick access to important phone numbers

### Core Features
1. **Task & Reminder Management**: Create, edit, and track daily tasks and medications
2. **Memory Board**: Store and retrieve personal notes and memories
3. **Chat Companion**: AI-powered conversational interface for emotional support
4. **Emergency Contacts**: Quick access to family and medical contacts
5. **Caregiver Dashboard**: Protected view for family members and caregivers
6. **Voice Input**: Speech recognition for hands-free interaction
7. **Notifications**: Browser notifications for timely reminders

### User Interface Components
- **Accessibility-First Design**: Large touch targets, high contrast colors, screen reader support
- **Responsive Layout**: Mobile-friendly with tablet and desktop optimizations
- **Voice Integration**: Web Speech API for voice input capabilities
- **Real-time Updates**: Live notification system for reminders and alerts

## Data Flow

1. **User Interaction**: Users interact through large, clearly labeled buttons and forms
2. **Form Validation**: Client-side validation using react-hook-form with Zod schemas
3. **API Communication**: RESTful API calls with proper error handling and loading states
4. **Data Persistence**: All user data stored in PostgreSQL with type-safe queries
5. **Real-time Features**: Browser notifications and scheduled reminders
6. **State Management**: React Query handles caching, synchronization, and background updates

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connection for serverless environments
- **drizzle-orm**: Type-safe database operations and query building
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation integration
- **date-fns**: Date manipulation and formatting utilities

### UI Framework
- **@radix-ui/***: Accessible component primitives for complex UI elements
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Dynamic className generation for component variants
- **cmdk**: Command palette and search functionality

### Development Tools
- **vite**: Build tool with HMR and optimized production builds
- **typescript**: Static type checking and enhanced developer experience
- **drizzle-kit**: Database schema management and migrations

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Module Replacement**: Instant feedback during development
- **TypeScript Compilation**: Real-time type checking and error reporting

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: esbuild compilation for Node.js deployment
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **Static Assets**: Served through Express with proper caching headers

### Database Setup
- **Schema Management**: Drizzle migrations in `./migrations` directory
- **Connection**: Serverless PostgreSQL through Neon Database
- **Type Safety**: Generated types from database schema

## Changelog

```
Changelog:
- June 30, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```