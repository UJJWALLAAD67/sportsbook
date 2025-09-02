# SportsBook - Sports Facility Booking Platform

<div align="center">
  <h3>🏸 Book Your Favorite Sports Facilities 🏸</h3>
  <p>A comprehensive platform for discovering, booking, and managing sports facilities with real-time availability and secure payments.</p>
</div>

---

## 📖 Project Overview

**SportsBook** is a full-stack web application that connects sports enthusiasts with local sports facilities. Whether you're looking to book a badminton court, tennis court, football field, or any other sports venue, SportsBook provides a seamless booking experience with real-time availability, secure payments, and community features.

### 🎯 Key Features

- **🔍 Smart Venue Discovery**: Advanced search and filtering by sport, location, price, and ratings
- **📅 Real-time Booking**: Conflict-free booking system with concurrency control
- **💳 Secure Payments**: Integrated payment processing with Stripe (ready for implementation)
- **👥 Multi-role Support**: Users, Facility Owners, and Admins with tailored experiences
- **📱 Responsive Design**: Optimized for mobile and desktop experiences
- **⚡ Modern Tech Stack**: Built with Next.js 15, TypeScript, Prisma, and Tailwind CSS

---

## 🏗️ Architecture & Tech Stack

### **Frontend**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Icons**: Heroicons
- **Forms**: React Hook Form + Zod validation
- **Authentication**: NextAuth.js

### **Backend**
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT-based sessions
- **Email**: Nodemailer
- **API**: Next.js API Routes

### **Development Tools**
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Build Tool**: Turbopack (Next.js)

---

## 🚀 Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18.0 or higher)
- **pnpm** (recommended) or npm/yarn
- **PostgreSQL** database
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sportsbook.git
cd sportsbook
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory and add the following environment variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/sportsbook"

# NextAuth Configuration
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (for OTP verification)
EMAIL_USER="your-gmail-account@gmail.com"
EMAIL_PASS="your-gmail-app-password"
EMAIL_FROM="SportsBook <noreply@sportsbook.com>"

# Stripe Configuration (optional - for payment integration)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database with sample data
npx prisma db seed
```

### 5. Start Development Server

```bash
# Using pnpm
pnpm dev

# Using npm
npm run dev

# Using yarn
yarn dev
```

The application will be available at `http://localhost:3000`

---

## 📱 Usage Guide

### **For Users (Sports Enthusiasts)**

1. **Registration**: Sign up with email verification via OTP
2. **Browse Venues**: Search and filter sports facilities by location, sport, price
3. **View Details**: Check venue amenities, photos, reviews, and court availability  
4. **Book Courts**: Select date, time, and duration with real-time availability
5. **Manage Bookings**: View upcoming/past bookings, cancel if needed
6. **Leave Reviews**: Rate and review venues after completed bookings

### **For Facility Owners**

1. **Owner Registration**: Sign up as a facility owner during registration
2. **Add Venues**: Create venue listings with detailed information
3. **Manage Courts**: Add multiple courts with different sports and pricing
4. **Dashboard**: View booking statistics, earnings, and performance metrics
5. **Booking Oversight**: Monitor all bookings for your facilities
6. **Approval Process**: Wait for admin approval for new venues

### **For Administrators**

1. **Platform Oversight**: Monitor user activity, bookings, and revenue
2. **Facility Approval**: Review and approve/reject new venue submissions
3. **User Management**: Manage users and handle reported issues
4. **Analytics**: View platform-wide statistics and trends

---

## 🗂️ Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin-only pages
│   │   ├── dashboard/            # Admin dashboard
│   │   └── facilities/           # Facility approval system
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   └── bookings/             # Booking management API
│   ├── auth/                     # Authentication pages
│   │   ├── login/                # Login page
│   │   └── register/             # Registration with OTP
│   ├── book/                     # Booking flow pages
│   ├── bookings/                 # User booking management
│   ├── owner/                    # Facility owner pages
│   │   ├── dashboard/            # Owner dashboard
│   │   └── venues/               # Venue management
│   ├── venues/                   # Public venue browsing
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── layout/                   # Layout components (Navbar)
│   └── providers/                # Context providers
├── lib/                          # Utility libraries
│   ├── hash.ts                   # Password hashing
│   ├── mailer.ts                 # Email functionality
│   ├── otp.ts                    # OTP generation/verification
│   └── prisma.ts                 # Database client
└── types/                        # TypeScript type definitions
    └── next-auth.d.ts            # NextAuth type extensions
```

---

## 🔐 User Roles & Permissions

### **USER Role**
- Browse and search venues
- Book courts and manage bookings
- Leave reviews and ratings
- View booking history

### **OWNER Role** 
- All USER permissions
- Create and manage venues
- Add/edit courts and pricing
- View booking analytics and earnings
- Manage facility details

### **ADMIN Role**
- Platform-wide oversight
- Approve/reject venue submissions
- Manage users and handle reports
- View system analytics
- Moderate content and resolve issues

---

## 🛡️ Security Features

### **Authentication & Authorization**
- **JWT-based sessions** with NextAuth.js
- **Role-based access control** with middleware protection
- **Email verification** with OTP system
- **Password hashing** with bcrypt

### **Booking System Security**
- **Concurrency control** prevents double-bookings
- **Idempotency keys** prevent duplicate requests
- **Database transactions** ensure data consistency
- **Input validation** with Zod schemas

### **Data Protection**
- **Environment variables** for sensitive configuration
- **SQL injection prevention** with Prisma ORM
- **CSRF protection** built into Next.js
- **Secure headers** and best practices

---

## 🔧 Advanced Features

### **Booking System**
- **Real-time availability** checking
- **Conflict prevention** with optimistic locking
- **Multi-hour booking** support
- **Automatic pricing** calculation
- **Cancellation policies** (2-hour advance notice)

### **Search & Discovery**
- **Multi-parameter filtering** (sport, location, price, rating)
- **Pagination** for performance
- **URL parameter support** for shareable searches
- **Empty states** with helpful guidance

### **Admin Tools**
- **Venue approval workflow** with comments
- **User management** dashboard
- **Platform analytics** and KPIs
- **Moderation tools** for content management

---

## 🚧 Future Enhancements

### **Payment Integration**
```bash
# Install Stripe dependencies
npm install stripe @stripe/stripe-js

# Add environment variables
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **Photo Upload**
- **Cloudinary integration** for image management
- **Multiple photo upload** for venues
- **Image optimization** and compression

### **Real-time Features**
- **WebSocket integration** for live updates
- **Push notifications** for booking confirmations
- **Live chat support** between users and owners

### **Advanced Features**
- **Review system** with photo uploads
- **Loyalty programs** and discounts
- **Group booking** functionality
- **Calendar integration** for users
- **Mobile app** development

---

## 🐛 Troubleshooting

### **Common Issues**

**Database Connection Issues:**
```bash
# Check PostgreSQL is running
pg_ctl status

# Reset database schema
npx prisma db push --force-reset
npx prisma generate
```

**Environment Variables:**
```bash
# Verify .env.local file exists and has correct values
# Restart development server after changes
```

**Authentication Problems:**
```bash
# Clear browser cookies and local storage
# Verify NEXTAUTH_SECRET is set
# Check database user table exists
```

### **Development Commands**

```bash
# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run ESLint
pnpm lint

# Database operations
npx prisma studio          # Database GUI
npx prisma db push         # Push schema changes
npx prisma generate        # Regenerate client
npx prisma migrate dev     # Create migrations
```

---

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with the following key models:

- **User**: User accounts with role-based permissions
- **FacilityOwner**: Extended profile for venue owners
- **Venue**: Sports facilities with location and amenities
- **Court**: Individual courts within venues
- **Booking**: Booking records with payment integration
- **Payment**: Payment tracking with Stripe integration ready
- **Review**: User reviews and ratings system
- **EmailOtp**: OTP verification system

---

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**

- Follow **TypeScript** best practices
- Use **Tailwind CSS** for styling
- Write **responsive components** first
- Add **proper error handling**
- Include **loading states** for async operations
- Validate **user inputs** with Zod schemas

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Prisma Team** for the excellent ORM
- **Tailwind CSS** for the utility-first CSS framework
- **Heroicons** for the beautiful icon set
- **Vercel** for deployment platform

---

## 📞 Support

For support, email support@sportsbook.com or join our Discord community.

**Built with ❤️ for the sports community**

---

## 🔗 Quick Links

- [📋 Project Mockups](https://link.excalidraw.com/l/65VNwvy7c4X/AU4FuaybEgm)
- [🚀 Live Demo](#) (Coming Soon)
- [📖 API Documentation](#) (Coming Soon)
- [🎨 Design System](#) (Coming Soon)

---

<div align="center">
  <sub>Built with Next.js 15, TypeScript, Prisma, and Tailwind CSS</sub>
</div>
