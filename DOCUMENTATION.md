# ApniSec - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication System](#authentication-system)
4. [Rate Limiting](#rate-limiting)
5. [Email Service](#email-service)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Frontend Components](#frontend-components)
9. [Error Handling](#error-handling)
10. [Security Considerations](#security-considerations)

---

## Overview

ApniSec is a full-stack cybersecurity solutions platform built with modern technologies and best practices. The application follows a clean OOP architecture with separation of concerns, making it maintainable and scalable.

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15+, React 19, TypeScript |
| Styling | Tailwind CSS (Neo Brutalism) |
| Backend | Next.js API Routes, TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Authentication | Custom JWT (bcrypt + jsonwebtoken) |
| Email | Resend |
| Icons | Lucide React |

---

## Architecture

### Backend Architecture Pattern

The backend follows a layered architecture pattern with clear separation of responsibilities:

```
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                            │
│                    (Next.js API Routes)                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Handler Layer                          │
│   - Request parsing                                         │
│   - Rate limiting                                           │
│   - Input validation                                        │
│   - Response formatting                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                          │
│   - Business logic                                          │
│   - Data transformation                                     │
│   - Cross-cutting concerns                                  │
│   - Email notifications                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Repository Layer                         │
│   - Database operations                                     │
│   - Query building                                          │
│   - Data mapping                                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                         │
│                     (Prisma + PostgreSQL)                   │
└─────────────────────────────────────────────────────────────┘
```

### Class Diagram

```
┌──────────────────┐     ┌──────────────────┐
│   AuthHandler    │────▶│   AuthService    │
└──────────────────┘     └──────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
           ┌──────────────────┐         ┌──────────────────┐
           │  UserRepository  │         │   EmailService   │
           └──────────────────┘         └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│   UserHandler    │────▶│   UserService    │
└──────────────────┘     └──────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
           ┌──────────────────┐         ┌──────────────────┐
           │  UserRepository  │         │   EmailService   │
           └──────────────────┘         └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│  IssueHandler    │────▶│   IssueService   │
└──────────────────┘     └──────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
           ┌──────────────────┐         ┌──────────────────┐
           │ IssueRepository  │         │   EmailService   │
           └──────────────────┘         └──────────────────┘
```

---

## Authentication System

### Overview

The authentication system uses JWT (JSON Web Tokens) with a dual-token approach for enhanced security:

- **Access Token**: Short-lived (15 minutes), stored in memory
- **Refresh Token**: Long-lived (7 days), stored in HTTP-only cookie

### Token Flow

```
1. User Login
   └─▶ Validate credentials
       └─▶ Generate access token (15m)
       └─▶ Generate refresh token (7d)
       └─▶ Store refresh token in DB
       └─▶ Set refresh token in HTTP-only cookie
       └─▶ Return access token to client

2. API Request
   └─▶ Extract access token from Authorization header
       └─▶ Verify token signature
       └─▶ Check expiration
       └─▶ Attach user to request
       └─▶ Process request

3. Token Refresh
   └─▶ Extract refresh token from cookie
       └─▶ Verify token in database
       └─▶ Generate new access token
       └─▶ Return new access token

4. Logout
   └─▶ Clear refresh token from database
       └─▶ Clear HTTP-only cookie
```

### Implementation Details

#### Password Hashing
```typescript
class PasswordService {
  private static readonly SALT_ROUNDS = 12;
  
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }
  
  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

#### Token Generation
```typescript
class TokenService {
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: '15m'
    });
  }
  
  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: '7d'
    });
  }
}
```

### Security Headers

Cookies are set with the following security attributes:
- `httpOnly: true` - Prevents JavaScript access
- `secure: true` - Only sent over HTTPS (production)
- `sameSite: 'lax'` - CSRF protection
- `path: '/'` - Available for all routes

---

## Rate Limiting

### Overview

The rate limiting system protects against brute force attacks and API abuse using an in-memory sliding window algorithm.

### Configuration

| Limiter Type | Max Requests | Window |
|--------------|--------------|--------|
| Default | 100 | 15 minutes |
| Auth | 50 | 15 minutes |
| Strict | 10 | 15 minutes |

### Implementation

```typescript
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing requests
    const timestamps = this.requests.get(identifier) || [];
    
    // Filter to only include requests within window
    const validRequests = timestamps.filter(t => t > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
}
```

### Factory Pattern

```typescript
class RateLimiterFactory {
  private static defaultLimiter: RateLimiter;
  private static authLimiter: RateLimiter;
  private static strictLimiter: RateLimiter;

  static getDefaultLimiter(): RateLimiter {
    if (!this.defaultLimiter) {
      this.defaultLimiter = new RateLimiter(100, 15 * 60 * 1000);
    }
    return this.defaultLimiter;
  }
  
  // Similar for auth and strict limiters...
}
```

---

## Email Service

### Overview

The email service uses Resend for reliable email delivery with professional HTML templates.

### Email Types

1. **Welcome Email** - Sent after registration
2. **Issue Created** - Confirmation of new issue
3. **Profile Updated** - Notification of profile changes
4. **Password Reset** - Password reset link (planned)

### Template Structure

Each email template includes:
- Professional header with logo
- Clear call-to-action
- Responsive design
- ApniSec branding

### Usage Example

```typescript
const emailService = EmailServiceFactory.getInstance();

await emailService.sendWelcomeEmail(
  user.email,
  user.firstName
);
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────────┐
│    User     │───────│       Issue         │
├─────────────┤  1:N  ├─────────────────────┤
│ id          │       │ id                  │
│ email       │       │ title               │
│ password    │       │ description         │
│ firstName   │       │ type                │
│ lastName    │       │ priority            │
│ phone       │       │ status              │
│ company     │       │ userId (FK)         │
│ refreshToken│       │ createdAt           │
│ createdAt   │       │ updatedAt           │
│ updatedAt   │       └─────────────────────┘
└─────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────┐
│   RateLimitRecord   │
├─────────────────────┤
│ id                  │
│ identifier          │
│ count               │
│ windowStart         │
│ userId (FK)         │
└─────────────────────┘
```

### Enums

```prisma
enum IssueType {
  CLOUD_SECURITY
  RETEAM_ASSESSMENT
  VAPT
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum Status {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}
```

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/auth/login
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Issue Endpoints

#### GET /api/issues
List all issues for the authenticated user.

**Query Parameters:**
- `type` - Filter by issue type
- `status` - Filter by status
- `priority` - Filter by priority
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response (200):**
```json
{
  "issues": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### POST /api/issues
Create a new security issue.

**Request Body:**
```json
{
  "title": "Security Vulnerability",
  "description": "Detailed description...",
  "type": "VAPT",
  "priority": "HIGH"
}
```

---

## Frontend Components

### Component Hierarchy

```
App Layout
├── Navbar
│   ├── Logo
│   ├── Navigation Links
│   └── Auth Buttons / User Menu
├── Main Content
│   ├── Landing Page
│   │   ├── Hero Section
│   │   ├── Stats Section
│   │   ├── Services Section
│   │   ├── Features Section
│   │   └── Contact Section
│   ├── Dashboard
│   │   ├── Stats Cards
│   │   ├── Issue List
│   │   └── Issue Modal (Create/Edit)
│   ├── Profile
│   │   └── Profile Form
│   ├── Login
│   │   └── Login Form
│   └── Register
│       └── Registration Form
└── Footer
    ├── Quick Links
    ├── Services Links
    ├── Contact Info
    └── Copyright
```

### State Management

The application uses React Context for authentication state:

```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

### Protected Routes

Routes requiring authentication are wrapped with `ProtectedRoute`:

```typescript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

---

## Error Handling

### Error Class Hierarchy

```
BaseError
├── ValidationError (400)
├── BadRequestError (400)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
├── ConflictError (409)
├── RateLimitError (429)
└── InternalServerError (500)
```

### Error Response Format

```json
{
  "error": "Error Type",
  "message": "Human-readable message",
  "statusCode": 400
}
```

### Error Handler

```typescript
class ErrorHandler {
  static handle(error: Error): Response {
    if (error instanceof BaseError) {
      return NextResponse.json(
        { error: error.name, message: error.message },
        { status: error.statusCode }
      );
    }
    
    // Log unexpected errors
    console.error('Unexpected error:', error);
    
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
```

---

## Security Considerations

### Input Validation

All user inputs are validated using dedicated validator classes:

- **Email**: Format validation with regex
- **Password**: Minimum 8 characters, requires uppercase, lowercase, number, special character
- **Names**: Minimum 2 characters, maximum 50
- **Phone**: Optional, format validation

### SQL Injection Prevention

Prisma ORM uses parameterized queries, preventing SQL injection attacks by default.

### XSS Prevention

- React automatically escapes values in JSX
- HTTP-only cookies prevent token theft
- Content Security Policy headers (recommended)

### CSRF Protection

- SameSite cookie attribute
- Token-based authentication for API calls
- Origin validation on sensitive endpoints

### Password Security

- Bcrypt with 12 salt rounds
- Passwords never logged or exposed
- Secure password reset flow (planned)

### Rate Limiting

- Prevents brute force attacks
- Protects against DDoS
- Different limits for different endpoints

---

## Deployment Checklist

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Enable HTTPS
- [ ] Configure CORS if needed
- [ ] Set secure cookie settings
- [ ] Enable logging
- [ ] Set up monitoring
- [ ] Configure backup strategy
- [ ] Test all endpoints
- [ ] Run Lighthouse audit

---

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL format
   - Verify database server is running
   - Check network/firewall settings

2. **JWT verification failed**
   - Verify JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are set
   - Check token expiration
   - Ensure consistent secret across instances

3. **Email not sending**
   - Verify RESEND_API_KEY
   - Check email domain verification in Resend dashboard
   - Review Resend logs

4. **Rate limit hit unexpectedly**
   - Check rate limiter configuration
   - Verify identifier extraction
   - Consider increasing limits for development

---

*Documentation last updated: 2024*
