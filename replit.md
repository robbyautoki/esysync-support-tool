# RMA Support System

## Overview
This project is a modern, full-stack web application designed for managing Return Merchandise Authorization (RMA) requests for displays/monitors. It provides a guided, step-by-step support process with a glassmorphism UI inspired by Apple's design principles. The system automates RMA generation, customer validation, and support ticket creation. Its vision is to streamline the RMA process, enhance customer support efficiency, and provide comprehensive data insights for businesses handling display returns.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design Aesthetic**: Glassmorphism with an Apple-inspired color palette and visual hierarchy.
- **Responsiveness**: Optimized for both desktop and mobile devices.
- **Animations**: Smooth transitions and micro-interactions using Framer Motion.
- **Components**: Radix UI primitives via shadcn/ui for consistent and accessible UI elements.
- **Color Scheme**: Uses a primary purple accent color (#6d0ef0) for buttons, icons, and highlights.

### Technical Implementation
- **Frontend**: React 18 with TypeScript, TailwindCSS for styling, Wouter for routing, TanStack Query for server state management, and Vite as the build tool.
- **Backend**: Express.js with TypeScript, Zod for data validation, and RESTful API design.
- **Database**: PostgreSQL managed with Drizzle ORM for type-safe schema and migrations.
- **Session Management**: Express sessions with a PostgreSQL store for persistence.

### Key Features
- **Multi-Step Support Flow**: Guided process including error selection, shipping options, customer validation, and PDF generation.
- **Customer Validation**: Real-time API validation of customer numbers.
- **RMA Generation**: Automatic, year-based RMA number generation.
- **Dynamic Error Selection**: Error types are loaded from the database and are manageable via an admin dashboard.
- **Comprehensive Customer Data Collection**: Detailed form for collecting customer, display, and return information.
- **Admin Dashboard**: Secure administrative interface for managing error types, employees, customer overview, email settings, video tutorials, and system logs.
- **Kanban Board**: Minimalistic, ClickUp-inspired board for managing support tickets with real-time search, aging system (color-coded tickets based on age), and visual status indicators.
- **Statistics & Analytics**: Dashboard with problem frequency analysis, key performance metrics, status distribution charts, and trend analysis.
- **Customer Status Tracking**: Public-facing page for customers to track their RMA status via unique links. Progress adapts based on chosen shipping method.
- **Activity Logging System**: Comprehensive logging of critical system activities, including anomaly detection and user activity heatmaps.
- **Employee Management System**: Full CRUD for employee accounts with role-based access control and distinct login tracking.
- **Video Tutorial Management**: Integration of video links for problem types, controllable via the admin dashboard.
- **Enhanced PDF Generation**: Professional PDF layouts for RMA documents with branding, comprehensive data, and return address inclusion.
- **Hierarchical Problem Organization**: 3-category system (Hardware, Software, Network) for structured problem selection.
- **Advanced Shipping & Contact Details**: Option for different shipping addresses and contact person selection in the support form.
- **Full Ticket Database**: Comprehensive archive of all tickets (active + archived) with extensive search, filtering, and CSV export capabilities. Each ticket has a log modal for history.

## External Dependencies

### Frontend
- **UI Framework**: React ecosystem
- **Styling**: TailwindCSS
- **Component Library**: Radix UI
- **Data Fetching**: TanStack Query
- **Form Handling**: React Hook Form with Zod
- **Animation**: Framer Motion

### Backend
- **Database**: Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **Session Store**: PostgreSQL-backed session management
- **Validation**: Zod

### Development Tools
- **Build System**: Vite
- **Code Quality**: TypeScript
- **Database Management**: Drizzle Kit