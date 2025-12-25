# ApniSec - Cybersecurity Solutions Platform

A professional cybersecurity solutions platform built with Next.js 15+, featuring secure authentication, rate limiting, email integration, and a modern Neo Brutalism UI design.

## 🚀 Features

### Core Functionality
- **User Authentication** - Secure JWT-based authentication with access & refresh tokens
- **Issue Management** - Full CRUD operations for security issues
- **Rate Limiting** - Protection against brute force attacks (100 requests/15 minutes)
- **Email Notifications** - Automated emails via Resend for key actions

### Security Services
- **Cloud Security** - Multi-cloud compliance and data protection
- **VAPT** - Vulnerability Assessment and Penetration Testing
- **Red Team Assessments** - Advanced threat simulation

### Technical Highlights
- **OOP Architecture** - Clean, maintainable class-based backend
- **TypeScript** - Full type safety throughout the application
- **Prisma ORM** - Type-safe database operations with PostgreSQL
- **SEO Optimized** - 80%+ Lighthouse score with full metadata

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- PostgreSQL database (Supabase recommended)
- Resend account for email service

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/apnisec-app.git
cd apnisec-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@host:5432/database"
JWT_ACCESS_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-key"
RESEND_API_KEY="re_your_key"
EMAIL_FROM="noreply@yourdomain.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set up the database
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start the development server
```bash
npm run dev
```

Visit `http://localhost:3000` to view the application.

## 📁 Project Structure

```
apnisec-app/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   ├── manifest.json          # PWA manifest
│   └── robots.txt             # SEO robots file
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── issues/        # Issue management endpoints
│   │   │   └── users/         # User profile endpoints
│   │   ├── dashboard/         # Dashboard page
│   │   ├── login/             # Login page
│   │   ├── profile/           # Profile page
│   │   ├── register/          # Registration page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── Footer.tsx         # Footer component
│   │   ├── Navbar.tsx         # Navigation component
│   │   └── ProtectedRoute.tsx # Auth wrapper
│   ├── context/
│   │   └── AuthContext.tsx    # Auth state management
│   ├── lib/
│   │   ├── auth/              # Authentication utilities
│   │   ├── database/          # Database connection
│   │   ├── email/             # Email service
│   │   ├── errors/            # Error classes
│   │   ├── handlers/          # API handlers
│   │   ├── rate-limiter/      # Rate limiting
│   │   ├── repositories/      # Data access layer
│   │   ├── services/          # Business logic
│   │   └── validators/        # Input validation
│   └── types/
│       └── index.ts           # TypeScript types
└── package.json
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh access token |

### User Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update user profile |

### Issues
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/issues` | List all issues |
| POST | `/api/issues` | Create new issue |
| GET | `/api/issues/:id` | Get issue details |
| PUT | `/api/issues/:id` | Update issue |
| DELETE | `/api/issues/:id` | Delete issue |

## 🏗️ Architecture

### Backend Architecture (OOP)
```
HTTP Request
    ↓
┌─────────────┐
│   Handler   │  ← Rate Limiting, Validation
└─────────────┘
    ↓
┌─────────────┐
│   Service   │  ← Business Logic
└─────────────┘
    ↓
┌─────────────┐
│ Repository  │  ← Data Access
└─────────────┘
    ↓
  Database
```

### Key Classes
- **Handlers** - Handle HTTP requests, apply rate limiting and validation
- **Services** - Implement business logic, coordinate between repositories
- **Repositories** - Abstract database operations
- **Validators** - Validate and sanitize input data
- **Error Classes** - Structured error handling

## 🎨 Design System

### Neo Brutalism UI
- **Primary Color**: `#4ade80` (Green)
- **Secondary Color**: `#1a1a2e` (Dark Blue)
- **Accent Color**: `#fbbf24` (Yellow)
- **Bold Borders**: 3-4px solid black
- **Strong Shadows**: 4-6px offset shadows
- **Clean Typography**: Inter font family

## 🔒 Security Features

### Rate Limiting
- Default: 100 requests per 15 minutes
- Auth routes: 50 requests per 15 minutes
- Strict routes: 10 requests per 15 minutes

### Authentication
- JWT with short-lived access tokens (15 minutes)
- Secure HTTP-only cookies for refresh tokens
- Password hashing with bcrypt (12 salt rounds)
- CSRF protection via same-site cookies

### Input Validation
- Email format validation
- Password strength requirements
- Input sanitization
- SQL injection prevention via Prisma

## 📧 Email Templates

The application sends styled HTML emails for:
- Welcome email on registration
- Issue creation confirmation
- Profile update notification
- Password reset (planned)

## 🌐 SEO Optimization

- Comprehensive meta tags
- Open Graph tags for social sharing
- Twitter Card support
- Structured data (JSON-LD)
- Semantic HTML structure
- robots.txt configuration
- PWA manifest

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## 📦 Build & Deployment

### Build for production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
vercel --prod
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

- **Your Name** - Full Stack Developer

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the powerful ORM
- Resend for reliable email delivery
- Tailwind CSS for utility-first styling

---

Built with ❤️ by ApniSec Team
