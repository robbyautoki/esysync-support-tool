# RMA Support System

## Overview

This is a modern support ticket system designed specifically for handling display/monitor RMA (Return Merchandise Authorization) requests. The application features a step-by-step guided process with a glassmorphism design aesthetic inspired by Apple's modern UI patterns. Built as a full-stack web application using React frontend with Express.js backend and PostgreSQL database via Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom glassmorphism design system
- **UI Components**: Radix UI primitives via shadcn/ui component library
- **State Management**: React hooks for local state, TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds
- **Animations**: Framer Motion for smooth transitions and micro-interactions

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL store
- **Validation**: Zod for runtime type validation
- **API Design**: RESTful API endpoints for customer validation, RMA generation, and ticket creation

### Database Design
- **Primary Database**: PostgreSQL (configured for both local development and production)
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Tables**:
  - `users`: User authentication (id, username, password)
  - `customers`: Customer information (id, customer_number, email, name)
  - `support_tickets`: RMA tickets (id, rma_number, customer_number, error_type, shipping_method, restart_confirmed, created_at)

## Key Components

### Multi-Step Support Flow
1. **Hero Section**: Welcome screen with support initiation
2. **Error Selection**: Display problem categorization with mandatory restart confirmation
3. **Shipping Options**: Multiple shipping methods with pricing
4. **Customer Validation**: Real-time customer number verification
5. **PDF Generation**: Automated RMA document creation and ticket submission

### Customer Validation System
- Real-time API validation of customer numbers
- Pre-populated demo customers for testing (KD123456, KD789012, KD345678)
- Immediate feedback on customer number validity

### RMA Generation
- Automatic RMA number generation with year-based formatting (RMA-YYYY-XXXXXX)
- Unique ticket creation with comprehensive tracking information

### Design System
- Custom glassmorphism CSS variables and utilities
- Apple-inspired color palette and visual hierarchy
- Responsive design optimized for both desktop and mobile
- Smooth animations and transitions throughout the user journey

## Data Flow

1. **User Journey Initiation**: User lands on hero section and begins support process
2. **Error Classification**: User selects error type and confirms restart attempt
3. **Service Selection**: User chooses preferred shipping/service method
4. **Customer Verification**: System validates customer number against database
5. **Ticket Creation**: Backend generates RMA number and creates support ticket record
6. **Document Generation**: System creates PDF documentation for the RMA request

### API Endpoints
- `GET /api/customers/:customerNumber/validate`: Customer validation
- `POST /api/rma/generate`: RMA number generation
- `POST /api/support-tickets`: Support ticket creation

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React ecosystem with modern hooks
- **Styling**: TailwindCSS with PostCSS processing
- **Component Library**: Comprehensive Radix UI component set
- **Data Fetching**: TanStack Query for efficient server state management
- **Form Handling**: React Hook Form with Zod validation integration
- **Animation**: Framer Motion for enhanced user experience

### Backend Dependencies
- **Database**: Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM with full TypeScript support
- **Session Store**: PostgreSQL-backed session management
- **Validation**: Zod schema validation throughout the stack

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: TypeScript for type safety across the entire codebase
- **Database Management**: Drizzle Kit for schema migrations and introspection

## Deployment Strategy

### Replit Configuration
- **Runtime**: Node.js 20 with PostgreSQL 16 module
- **Development Server**: Runs on port 5000 with automatic reload
- **Production Build**: Vite build process with Express.js serving static assets
- **Database**: Automatic PostgreSQL provisioning via DATABASE_URL environment variable

### Build Process
1. **Development**: `npm run dev` - Concurrent frontend and backend development
2. **Production Build**: `npm run build` - Vite frontend build + esbuild backend bundle
3. **Database Setup**: `npm run db:push` - Schema deployment via Drizzle

### Environment Requirements
- DATABASE_URL for PostgreSQL connection
- Node.js 20+ runtime environment
- Static file serving capability for built frontend assets

## Changelog

Changelog:
- June 18, 2025. Initial setup
- June 18, 2025. Added PostgreSQL database with full data persistence
- June 18, 2025. Added Admin Dashboard with dynamic error type management at /admin

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

✓ PostgreSQL Database Implementation
- Migrated from in-memory storage to persistent PostgreSQL database
- Added database tables: users, customers, support_tickets, error_types
- Implemented full CRUD operations with Drizzle ORM

✓ Admin Dashboard System
- Created admin authentication system (username: admin, password: admin123)
- Built admin interface at /admin route (not visible on landing page)
- Dynamic error type management: create, view, delete error types
- Real-time synchronization between admin changes and support form

✓ Dynamic Error Selection
- Error types now loaded from database instead of hardcoded
- Support form automatically updates when admin adds/removes problems
- Maintains glassmorphism design with dynamic icon mapping

✓ Enhanced Data Architecture
- Customer validation through database
- RMA ticket creation with full persistence
- Admin session management for secure access

✓ Color Scheme Update (June 18, 2025)
- Changed entire application color scheme from blue to purple
- Updated all buttons, icons, borders, and hover states to purple (#6d0ef0)
- Maintained glassmorphism design aesthetic with new purple accent color

✓ Logo Integration (June 18, 2025)
- Added company logo to top left header on both support and admin pages
- Logo sourced from esysync.com and integrated with Vite asset pipeline
- Fixed header with glassmorphism background and responsive design

✓ Comprehensive Customer Data Collection (June 18, 2025)
- Replaced simple customer number validation with detailed data collection form
- New customer data fields: Account Number, Display Number, Display Location, Return Address, Email
- Updated database schema with migration from customer_number to comprehensive fields
- Enhanced Kanban board to display detailed customer and display information
- Updated PDF generation to include all customer data fields
- Maintained glassmorphism design throughout new customer data form

✓ Professional Admin Dashboard Redesign (June 18, 2025)
- Redesigned admin dashboard with fixed left sidebar navigation (320px width)
- Added fullscreen mode for Kanban board with backdrop blur overlay
- Enhanced Apple-style glassmorphism design with improved card hover effects
- Implemented professional layout with better spacing and responsive grid
- Fixed admin session management to persist login state across page refreshes
- Added comprehensive status tracking with visual indicators in Kanban columns

✓ Minimalistisches ClickUp-Style Kanban Board (June 18, 2025)
- Redesigned Kanban board with clean, minimalistic ClickUp-inspired design
- Compact ticket cards for better overview when handling many tickets
- Simplified visual elements focusing on essential information only
- Real-time search functionality with instant ticket filtering
- Clean white background with subtle borders and minimal colors
- Efficient space usage for maximum ticket visibility
- Quick action buttons for status changes
- Streamlined fullscreen mode for large-scale ticket management

✓ Kunden-Übersicht im Admin Dashboard (June 18, 2025)
- Added comprehensive customer overview in admin navigation
- Table view showing all customers who submitted support requests
- Display first and last ticket submission dates for each customer
- Customer details including account number, email, display info, and location
- Total ticket count and pending tickets per customer
- Search and sorting functionality by name, date, or ticket count
- Statistics dashboard with customer and ticket metrics
- Real-time data from support ticket database

✓ E-Mail-Einstellungen & Automatisierung (June 18, 2025)
- Added comprehensive email settings section in admin dashboard
- Configurable reminder emails after 7 and 14 days for unprocessed tickets
- Automatic ticket closure after 21 days with notification email
- Customizable email templates with variable placeholders
- Template editor with subject and body customization
- Email timing configuration (reminder days and auto-close)
- Toggle switches to enable/disable individual email templates
- Variable system for dynamic content (RMA number, customer data, dates)