# Admin System & Management

## Admin Panel Architecture

### Access Control
- **Route**: `/admin`
- **Required Role**: `ADMIN`
- **Protection**: Server-side role checking
- **Redirect**: Non-admin users redirected to dashboard

### Admin Components
- `components/admin/admin-dashboard.tsx` - Main dashboard
- `components/admin/user-management.tsx` - User management interface
- `app/admin/page.tsx` - Admin page server component

## Admin Dashboard Features

### Statistics Overview
- Total users count
- Active subscriptions count
- Total revenue (from payment history)
- Real-time data via server components

### User Management
- View all users with roles and token balances
- Update user roles (USER/PREMIUM/ADMIN/BANNED)
- Modify user token balances
- View subscription status and history

### Subscription Management
- Monitor active subscriptions
- View subscription details and payment history
- Track subscription lifecycle events
- Revenue analytics and reporting

## Admin API Endpoints

### User Management
```typescript
// POST /api/admin/update-user
{
  userId: string,
  role?: UserRole,
  tokens?: number
}
```

### Security Features
- Role-based access control
- Request validation
- Audit logging (implement as needed)
- Rate limiting for admin actions

## Admin User Setup

### Setup Process
1. User signs in normally (creates database record)
2. Set `ADMIN_EMAIL` environment variable
3. Run `npm run db:setup-admin` script
4. Script promotes user to ADMIN role

### Setup Script (`prisma/seed-admin.ts`)
```typescript
// Finds user by email and promotes to ADMIN
const adminUser = await prisma.user.update({
  where: { email: process.env.ADMIN_EMAIL },
  data: { role: UserRole.ADMIN }
});
```

## Admin Functions

### User Role Management
```typescript
// lib/subscription.ts
export const isUserAdmin = async (userId: string): Promise<boolean>
export const updateUserMembership = async (
  userId: string,
  stripeProductId: string | null,
  membershipStatus: MembershipStatus
)
```

### Subscription Management
```typescript
// lib/stripe-admin.ts
export const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction: boolean
)
```

## Admin Dashboard Data

### User Statistics
- Total user count
- Role distribution (USER/PREMIUM/ADMIN/BANNED)
- Token usage statistics
- Registration trends

### Revenue Analytics
- Total revenue from payments
- Revenue by subscription tier
- Monthly/yearly revenue trends
- Payment success rates

### Subscription Metrics
- Active subscription count
- Churn rate analysis
- Subscription tier popularity
- Trial conversion rates

## Admin Permissions

### Current Permissions
- View all users and their data
- Update user roles
- Modify user token balances
- View subscription and payment data
- Access system statistics

### Role Preservation
- Admin role preserved during subscription changes
- Multiple admin users supported
- Admin role cannot be removed via normal subscription flow

## Admin UI Components

### Dashboard Layout
- Statistics cards with key metrics
- User management table
- Subscription overview
- Navigation between admin sections

### User Management Interface
- Sortable user table
- Role selection dropdown
- Token balance input
- Bulk action support (future enhancement)

### Data Visualization
- Revenue charts
- User growth graphs
- Subscription distribution
- Token usage analytics

## Security Considerations

### Access Control
- Server-side role validation
- Protected API routes
- Session-based authentication
- Input validation and sanitization

### Audit Trail
- Log admin actions (implement as needed)
- Track user role changes
- Monitor subscription modifications
- Payment and token transaction logs

