# Velowen - 3D World Visualization Platform

## Overview

Velowen is a 3D interactive visualization application that allows users to "imagine worlds in 3D". The application features a particle-based point cloud rendering system with dynamic camera controls and an immersive user interface. Built with React Three Fiber for 3D graphics and Express for the backend, it provides a modern full-stack architecture for creating and exploring procedurally generated 3D environments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React + TypeScript + Vite + React Three Fiber

**Key Design Decisions**:

- **3D Rendering Engine**: Uses React Three Fiber (@react-three/fiber) as a React renderer for Three.js, enabling declarative 3D scene composition within React components
  - **Rationale**: Provides React-friendly API for Three.js while maintaining performance
  - **Trade-off**: Adds abstraction layer but significantly improves developer experience and component reusability

- **Particle System**: Implements a 50,000-particle point cloud system with animated transitions between initial spherical distribution and final terrain-like positions
  - **Rationale**: Creates visually engaging morphing effect while demonstrating computational capabilities
  - **Performance Consideration**: Uses Float32Array for efficient memory usage and WebGL rendering

- **UI Component Library**: Radix UI primitives with Tailwind CSS for styling
  - **Rationale**: Provides accessible, unstyled components that can be customized while maintaining WCAG compliance
  - **Benefits**: Comprehensive set of headless UI components (accordion, dialog, dropdown, etc.)

- **State Management**: Zustand for lightweight state management
  - **Rationale**: Simpler than Redux, minimal boilerplate, works well with React hooks
  - **Use Cases**: Game phase management, audio controls

- **Styling System**: Tailwind CSS with custom design tokens and CSS variables
  - **Rationale**: Utility-first approach enables rapid UI development with consistent design system
  - **Customization**: Uses CSS custom properties for theming (colors, radius, spacing)

### Backend Architecture

**Technology Stack**: Node.js + Express + TypeScript

**Key Design Decisions**:

- **Development vs Production Modes**: Separate entry points (index-dev.ts, index-prod.ts) with different static file serving strategies
  - **Development**: Integrates Vite dev server middleware for HMR and on-demand compilation
  - **Production**: Serves pre-built static assets from dist/public directory
  - **Rationale**: Optimizes developer experience in development while ensuring production performance

- **Modular Route Registration**: Centralized route registration in registerRoutes function
  - **Current State**: Routes are prefixed with /api and intended to be added as the application grows
  - **Design Pattern**: Separation of concerns between route definition and server setup

- **Storage Layer Abstraction**: IStorage interface with MemStorage implementation
  - **Rationale**: Enables easy swapping between in-memory storage (development) and persistent database (production)
  - **Current Implementation**: In-memory Map-based storage for users
  - **Future Path**: Can be replaced with PostgresStorage implementation using Drizzle ORM

- **Logging Middleware**: Custom logging that captures request/response details including JSON response bodies
  - **Rationale**: Provides visibility into API behavior during development
  - **Implementation**: Intercepts res.json to capture response data before logging

### Data Storage

**Database Configuration**: Drizzle ORM with PostgreSQL dialect

**Schema Design**:
- **Users Table**: Basic user entity with id (serial), username (unique text), password (text)
- **Validation**: Zod schemas for type-safe input validation using Drizzle-Zod integration

**Current State**: 
- Database integration is configured but not actively used
- MemStorage provides in-memory data persistence for development
- Drizzle migrations directory configured at ./migrations

**Design Decision**: 
- Chosen Drizzle ORM for type-safe, SQL-like query building
- **Benefits**: TypeScript-first, lightweight, generates types from schema
- **Trade-off**: Less mature ecosystem than Prisma but better SQL control

### External Dependencies

**Database**:
- PostgreSQL via Neon serverless driver (@neondatabase/serverless)
- Connection managed through DATABASE_URL environment variable
- Drizzle Kit for schema management and migrations

**3D Graphics Libraries**:
- Three.js (via React Three Fiber) - Core 3D rendering engine
- @react-three/drei - Helper components and abstractions for common Three.js patterns
- @react-three/postprocessing - Post-processing effects pipeline
- vite-plugin-glsl - GLSL shader support for custom WebGL shaders

**Asset Support**:
- Configured to handle 3D model formats (GLTF, GLB)
- Audio file support (MP3, OGG, WAV)
- Custom font loading (@fontsource/inter)

**UI Framework**:
- Radix UI - Comprehensive collection of accessible UI primitives
- Tailwind CSS - Utility-first CSS framework
- class-variance-authority - Type-safe variant management for component styling
- cmdk - Command palette component

**State & Data Fetching**:
- TanStack Query (@tanstack/react-query) - Server state management and caching
- Zustand - Client-side state management
- React Hook Form - Form state and validation (imported but not actively used)

**Development Tools**:
- Vite - Build tool and dev server
- TypeScript - Type safety across frontend and backend
- tsx - TypeScript execution for Node.js
- esbuild - Production bundling for server code
- @replit/vite-plugin-runtime-error-modal - Enhanced error reporting in Replit environment

**Session Management**:
- connect-pg-simple - PostgreSQL session store for Express sessions
- Configured but not actively implemented in current codebase