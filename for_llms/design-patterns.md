# Design Patterns & Architecture

## Core Patterns Used

### 1. Repository Pattern
- Database operations centralized in `lib/` functions
- Clean separation between data access and business logic
- Example: `lib/subscription.ts` handles all subscription-related DB operations

### 2. Provider Pattern
- React context for session management: `components/providers/session-provider.tsx`
- NextAuth session provider wraps the entire app
- Centralizes user authentication state

### 3. Hook Pattern
- Custom hooks for data fetching and state management
- Server-side data fetching with Next.js server components
- Client-side state management with React hooks

### 4. Adapter Pattern
- NextAuth Prisma adapter: `@next-auth/prisma-adapter`
- Stripe webhook event handling with standardized response format
- Database model adapters for Stripe data synchronization

### 5. Factory Pattern
- Stripe client configuration in `lib/stripe.ts`
- Prisma client singleton pattern
- Component factory pattern for ShadcnUI components

## Architectural Principles

### 1. Single Source of Truth
- Stripe products are the primary data source
- Database models reference Stripe IDs directly
- Automatic synchronization via webhooks

### 2. Separation of Concerns
- `/app` - Next.js routing and page components
- `/lib` - Business logic and data access
- `/components` - UI components and presentation logic
- `/prisma` - Database schema and migrations

### 3. Configuration Over Convention
- Environment variables for all external integrations
- Metadata-driven token allocation
- Flexible role-based access control

### 4. Defensive Programming
- Input validation on all API endpoints
- Error handling with graceful fallbacks
- Webhook signature verification
- Database transaction safety

## Code Organization

### File Naming
- PascalCase for React components
- kebab-case for utility files
- Descriptive names reflecting functionality

### Component Structure
- Props interface definitions
- Default exports for components
- Named exports for utilities
- Consistent import ordering

### Error Handling
- Try-catch blocks for async operations
- Consistent error logging
- User-friendly error messages
- Fallback UI components

## Performance Patterns

### 1. Caching Strategy
- Product sync cache (5-minute intervals)
- Next.js static generation where possible
- Database query optimization

### 2. Data Fetching
- Server components for initial data loading
- Client components for interactive features
- Optimistic updates for better UX

### 3. Bundle Optimization
- Dynamic imports for heavy components
- Tree shaking for unused code
- Next.js automatic code splitting