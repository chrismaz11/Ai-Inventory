# Smart Storage Inventory Management System

## Overview

This is a modern web application for inventory management with smart photo analysis and QR code scanning capabilities. The system allows users to organize items in storage units, scan QR codes to identify containers, and use AI to automatically identify items from photos.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL via Neon serverless
- **File Handling**: Multer for photo uploads
- **AI Integration**: OpenAI GPT-4o for image analysis
- **Session Management**: Express sessions with PostgreSQL store

### Key Components

#### Database Schema
- **Storage Units**: Containers with QR codes, locations, and metadata
- **Items**: Individual inventory items linked to storage units
- **Activities**: Audit log of all system actions
- **Relations**: Properly defined relationships between entities

#### AI Services
- **Photo Analysis**: GPT-4o vision model analyzes storage photos to identify items
- **Confidence Scoring**: AI provides confidence levels for item identification
- **Batch Processing**: Multiple photos can be processed simultaneously

#### QR Code System
- **Code Generation**: Unique QR codes in format "SU-XXXXXXXX"
- **Validation**: Client and server-side QR code format validation
- **Camera Integration**: Mobile-friendly camera access for scanning

#### File Management
- **Photo Upload**: Supports multiple image formats up to 10MB
- **Memory Storage**: Uses multer memory storage for processing
- **Base64 Conversion**: Images converted for AI analysis

## Data Flow

1. **Storage Unit Creation**: Users create storage units with auto-generated QR codes
2. **QR Scanning**: Mobile camera scans QR codes to identify storage units
3. **Photo Upload**: Users upload photos of storage contents
4. **AI Analysis**: OpenAI analyzes photos and identifies items with confidence scores
5. **Item Creation**: Identified items are automatically added to the database
6. **Activity Logging**: All actions are logged for audit trails
7. **Search & Filter**: Users can search items by name, category, or storage unit

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **openai**: Official OpenAI API client for image analysis
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **multer**: File upload middleware
- **nanoid**: Unique ID generation for QR codes

### Development Tools
- **vite**: Fast build tool and dev server
- **typescript**: Type safety across the stack
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development plugins

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with hot reload
- **Database**: Neon PostgreSQL with connection pooling
- **Environment**: NODE_ENV=development with tsx for TypeScript execution

### Production
- **Build Process**: Vite builds frontend, esbuild bundles server
- **Server Bundle**: Single ESM bundle with external packages
- **Static Assets**: Frontend built to dist/public directory
- **Database Migrations**: Drizzle migrations in ./migrations directory

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `OPENAI_API_KEY`: OpenAI API key for image analysis
- `NODE_ENV`: Environment mode (development/production)

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```