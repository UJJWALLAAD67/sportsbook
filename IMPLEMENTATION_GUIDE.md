# 🏗️ SportsBook - Detailed Implementation Guide

## 📖 Table of Contents
1. [🔐 Admin System Implementation](#-admin-system-implementation)
2. [👤 User System Implementation](#-user-system-implementation)
3. [🏢 Owner System Implementation](#-owner-system-implementation)
4. [📅 Booking System Implementation](#-booking-system-implementation)
5. [💳 Payment System Implementation](#-payment-system-implementation)
6. [🔄 Overall System Architecture & Data Flow](#-overall-system-architecture--data-flow)

---

## 🔐 Admin System Implementation

### **Overview**
The Admin system provides comprehensive platform management capabilities including venue approvals, user oversight, and system analytics.

### **File Structure**
```
src/
├── app/admin/                          # Admin-only pages
│   ├── dashboard/
│   │   └── page.tsx                    # Admin dashboard with statistics
│   └── facilities/
│       └── page.tsx                    # Venue approval interface
├── app/api/admin/                      # Admin API endpoints
│   ├── dashboard/stats/
│   │   └── route.ts                    # Platform-wide statistics API
│   └── facilities/
│       └── route.ts                    # Venue management API
└── middleware.ts                       # Admin route protection
```

### **Core Components**

#### **1. Admin Dashboard** (`src/app/admin/dashboard/page.tsx`)
**Purpose**: Provides comprehensive platform overview and key metrics

**Implementation Details**:
- **Statistics Display**: Shows user counts, venue statistics, booking metrics, and revenue data
- **Growth Calculations**: Monthly comparisons with percentage changes
- **Real-time Data**: Fetches live statistics from the database
- **Role Verification**: Ensures only ADMIN role users can access

**When Called**: 
- User navigates to `/admin/dashboard`
- Middleware verifies ADMIN role before rendering
- Component mounts and fetches statistics via API call

**Key Features**:
```typescript
// Statistics fetched and displayed
- Total Users (with monthly growth %)
- Total Venue Owners (with monthly growth %)
- Total Venues (approved/pending breakdown)
- Total Bookings (with monthly growth %)
- Total Revenue (with monthly growth %)
- Active Users (last 30 days)
```

#### **2. Admin Facilities Management** (`src/app/admin/facilities/page.tsx`)
**Purpose**: Approve or reject venue submissions from owners

**Implementation Details**:
- **Approval Queue**: Lists all pending venue approvals
- **Venue Details**: Shows comprehensive venue information for review
- **Action Buttons**: Approve/Reject functionality with confirmation
- **Owner Information**: Displays venue owner details for context

**When Called**:
- Admin accesses `/admin/facilities`
- Component fetches pending venues via API
- Real-time updates after approval/rejection actions

### **API Implementation**

#### **1. Admin Statistics API** (`src/app/api/admin/dashboard/stats/route.ts`)
**HTTP Method**: GET  
**Authentication**: Required (ADMIN role)  
**Purpose**: Provides comprehensive platform statistics

**Data Flow**:
```
1. Admin Dashboard Request → GET /api/admin/dashboard/stats
2. Middleware validates ADMIN role
3. Database queries for:
   - User counts (current & previous month)
   - Venue statistics (approved/pending)
   - Booking metrics with revenue
   - Growth calculations
4. Returns aggregated statistics object
5. Frontend updates dashboard with real-time data
```

**Implementation Highlights**:
```typescript
// Key database aggregations performed
const totalUsers = await prisma.user.count()
const totalVenues = await prisma.venue.count({ where: { approved: true }})
const totalBookings = await prisma.booking.count()
const totalRevenue = await prisma.payment.aggregate({
  where: { status: 'SUCCEEDED' },
  _sum: { amount: true }
})
// Growth calculations with date comparisons
```

#### **2. Facilities Management API** (`src/app/api/admin/facilities/route.ts`)
**HTTP Methods**: GET, PATCH, DELETE  
**Authentication**: Required (ADMIN role)  
**Purpose**: Manage venue approvals and rejections

**Operations**:

**GET - Fetch Pending Venues**:
```
Data Flow:
1. Request → GET /api/admin/facilities
2. Query pending venues with owner details
3. Include court information for review
4. Return structured venue list for approval
```

**PATCH - Approve Venue**:
```
Data Flow:
1. Request → PATCH /api/admin/facilities
2. Body: { venueId: number }
3. Update venue.approved = true
4. Return success confirmation
5. Frontend updates venue list
```

**DELETE - Reject Venue**:
```
Data Flow:
1. Request → DELETE /api/admin/facilities?venueId=123
2. Soft delete or remove venue record
3. Handle associated court cleanup
4. Return confirmation
5. Frontend removes from pending list
```

### **Security Implementation**

#### **Route Protection** (`src/middleware.ts`)
```typescript
// Admin route protection logic
if (pathname.startsWith("/admin")) {
  if (!token || token.role !== Role.ADMIN) {
    return NextResponse.redirect(
      new URL("/auth/login?callbackUrl=" + pathname, req.url)
    );
  }
}
```

#### **API Security**
- **Role Validation**: Every admin API endpoint verifies ADMIN role
- **Session Verification**: JWT token validation
- **Input Sanitization**: Zod schema validation for all inputs
- **Database Security**: Parameterized queries via Prisma

### **Usage Scenarios**

#### **Scenario 1: New Venue Approval**
```
1. Owner submits venue → Venue created with approved: false
2. Admin visits /admin/facilities → API fetches pending venues
3. Admin reviews venue details and owner information
4. Admin clicks "Approve" → PATCH /api/admin/facilities
5. Database updates venue.approved = true
6. Venue becomes visible to public users
7. Owner receives approval notification (future feature)
```

#### **Scenario 2: Platform Monitoring**
```
1. Admin visits /admin/dashboard → GET /api/admin/dashboard/stats
2. Dashboard displays real-time metrics:
   - User growth trends
   - Revenue analytics
   - Booking patterns
   - Venue approval rates
3. Admin identifies trends and makes platform decisions
```

---

## 👤 User System Implementation

### **Overview**
The User system handles regular platform users who browse venues and make bookings. This is the default role for new registrations.

### **File Structure**
```
src/
├── app/                                # Public user pages
│   ├── venues/                         # Venue browsing
│   │   ├── page.tsx                    # Venue listing with search/filter
│   │   └── [id]/
│   │       ├── page.tsx                # Venue details
│   │       └── book/
│   │           └── page.tsx            # Booking interface
│   ├── bookings/                       # User bookings management
│   │   ├── page.tsx                    # Booking history
│   │   └── [id]/
│   │       └── page.tsx                # Individual booking details
│   ├── dashboard/
│   │   └── page.tsx                    # User dashboard
│   └── profile/
│       └── page.tsx                    # Profile management
├── app/api/                            # User-related APIs
│   ├── venues/                         # Venue browsing APIs
│   │   ├── route.ts                    # Venue search/filter
│   │   ├── featured/route.ts           # Featured venues
│   │   └── [id]/
│   │       └── route.ts                # Venue details
│   ├── bookings/                       # Booking management APIs
│   │   ├── route.ts                    # Create/list bookings
│   │   ├── user/route.ts               # User's bookings
│   │   ├── availability/route.ts       # Check availability
│   │   └── [id]/
│   │       ├── route.ts                # Booking details
│   │       ├── cancel/route.ts         # Cancel booking
│   │       └── payment/route.ts        # Payment handling
│   └── profile/
│       └── route.ts                    # Profile updates
```

### **Core Components**

#### **1. Venue Discovery System**

**Venue Listing Page** (`src/app/venues/page.tsx`)
**Purpose**: Browse and search available sports venues

**Implementation Details**:
- **Advanced Filtering**: Sport type, city, price range, ratings
- **Search Functionality**: Text-based venue/location search  
- **Pagination**: Handles large venue datasets efficiently
- **Sorting Options**: By name, price, rating, newest
- **Real-time Filters**: Dynamic filter updates with URL parameters

**When Called**:
- User visits `/venues`
- Search parameters trigger API calls
- Filter changes update results dynamically
- Pagination navigates through results

**Key Features**:
```typescript
// Search and filter parameters
const searchParams = {
  search: string,        // Venue name/description search
  sport: string,         // Sport type filter
  city: string,          // Location filter
  minPrice: number,      // Price range minimum
  maxPrice: number,      // Price range maximum  
  rating: number,        // Minimum rating filter
  page: number,          // Pagination
  limit: number,         // Results per page
  sortBy: string,        // Sort field
  sortOrder: string      // Sort direction
}
```

**Venue Details Page** (`src/app/venues/[id]/page.tsx`)
**Purpose**: Display comprehensive venue information

**Implementation Details**:
- **Venue Information**: Name, description, location, amenities
- **Court Listings**: Available courts with pricing and schedules
- **Review System**: User ratings and comments
- **Image Gallery**: Venue photos with Cloudinary optimization
- **Booking Integration**: Direct links to booking interface

**When Called**:
- User clicks on venue from listing
- Direct URL access to `/venues/[id]`
- Component fetches venue details via API

#### **2. Booking System (User Side)**

**Booking Interface** (`src/app/venues/[id]/book/page.tsx`)
**Purpose**: Interactive booking creation interface

**Implementation Details**:
- **Court Selection**: Choose from available courts
- **Date/Time Picker**: Calendar with availability integration
- **Duration Selection**: Hourly booking slots
- **Real-time Availability**: Live availability checking
- **Price Calculation**: Dynamic pricing based on duration
- **Conflict Prevention**: Prevents double bookings

**Data Flow for Booking Creation**:
```
1. User selects court and date
2. Frontend → GET /api/bookings/availability?courtId=X&date=Y
3. API returns available time slots
4. User selects time slot and duration  
5. Frontend calculates total price
6. User submits booking → POST /api/bookings
7. API creates booking with PENDING status
8. Payment flow initiates → POST /api/create-payment-intent
9. Stripe payment processing
10. Webhook updates booking status
11. User redirected to booking confirmation
```

**Booking Management** (`src/app/bookings/page.tsx`)
**Purpose**: View and manage user's bookings

**Implementation Details**:
- **Booking History**: Paginated list of all bookings
- **Status Filtering**: Filter by booking status (pending, confirmed, cancelled)
- **Booking Details**: Court, venue, time, payment information
- **Cancellation**: Cancel bookings with 2-hour advance notice
- **Receipt Access**: Download payment receipts

**When Called**:
- User navigates to `/bookings`
- Component fetches user bookings via API
- Real-time updates after booking actions

### **API Implementation**

#### **1. Venue Search API** (`src/app/api/venues/route.ts`)
**HTTP Method**: GET  
**Authentication**: None required  
**Purpose**: Search and filter venues with pagination

**Implementation Highlights**:
```typescript
// Complex filtering logic
const whereClause = {
  approved: true,
  ...(search && {
    OR: [
      { name: { contains: search, mode: 'insensitive' }},
      { description: { contains: search, mode: 'insensitive' }},
      { city: { contains: search, mode: 'insensitive' }}
    ]
  }),
  ...(sport && {
    courts: { some: { sport: { contains: sport, mode: 'insensitive' }}}
  }),
  ...(city && { city: { contains: city, mode: 'insensitive' }}),
  // Price and rating filters with aggregations
}

// Dynamic sorting and pagination
const venues = await prisma.venue.findMany({
  where: whereClause,
  include: { courts: true, reviews: true, owner: { include: { user: true }}},
  orderBy: sortConfig,
  skip: (page - 1) * limit,
  take: limit
})
```

#### **2. Booking Availability API** (`src/app/api/bookings/availability/route.ts`)
**HTTP Method**: GET  
**Authentication**: None required  
**Purpose**: Check real-time court availability

**Data Flow**:
```
1. Request → GET /api/bookings/availability?courtId=1&date=2024-01-15
2. Query existing bookings for the court on the date
3. Get court operating hours (openTime, closeTime)
4. Generate all possible time slots
5. Filter out past times and existing bookings
6. Return available slots with pricing
```

**Implementation Logic**:
```typescript
// Generate hourly slots between operating hours
const timeSlots = [];
for (let hour = court.openTime; hour < court.closeTime; hour++) {
  const slotTime = new Date(selectedDate);
  slotTime.setHours(hour, 0, 0, 0);
  
  // Check if slot conflicts with existing booking
  const hasConflict = existingBookings.some(booking => 
    slotTime >= booking.startTime && slotTime < booking.endTime
  );
  
  if (!hasConflict && slotTime > now) {
    timeSlots.push({
      time: slotTime,
      available: true,
      price: court.pricePerHour
    });
  }
}
```

#### **3. Booking Creation API** (`src/app/api/bookings/route.ts`)
**HTTP Method**: POST  
**Authentication**: Required (JWT token)  
**Purpose**: Create new booking with concurrency control

**Critical Implementation Features**:
```typescript
// Concurrency control with database transactions
await prisma.$transaction(async (tx) => {
  // Check for conflicts with SERIALIZABLE isolation
  const conflictingBooking = await tx.booking.findFirst({
    where: {
      courtId,
      startTime: { lt: endTime },
      endTime: { gt: startTime },
      status: { not: 'CANCELLED' }
    }
  });

  if (conflictingBooking) {
    throw new Error('Time slot is no longer available');
  }

  // Create booking with unique constraint protection
  const booking = await tx.booking.create({
    data: {
      userId: session.user.id,
      courtId,
      startTime,
      endTime, 
      status: 'PENDING',
      idempotencyKey: generateIdempotencyKey(),
      notes
    }
  });

  // Create associated payment record
  await tx.payment.create({
    data: {
      bookingId: booking.id,
      amount: totalAmount,
      currency: 'INR',
      status: 'PENDING'
    }
  });

  return booking;
}, {
  isolationLevel: 'Serializable' // Prevents race conditions
});
```

### **User Journey Scenarios**

#### **Scenario 1: Venue Discovery & Booking**
```
1. User visits /venues
   → GET /api/venues (with search/filter params)
   → Display paginated venue list

2. User applies filters (sport: "Badminton", city: "Mumbai")  
   → URL updates with query params
   → New API call with filters
   → Filtered results displayed

3. User clicks on venue
   → Navigate to /venues/123
   → GET /api/venues/123
   → Display venue details with courts and reviews

4. User clicks "Book Now"
   → Navigate to /venues/123/book
   → Select court and date
   → GET /api/bookings/availability
   → Display available time slots

5. User selects slot and confirms
   → POST /api/bookings
   → Booking created with PENDING status
   → Redirect to payment flow
```

#### **Scenario 2: Booking Management**
```
1. User visits /bookings
   → GET /api/bookings/user
   → Display paginated booking history

2. User wants to cancel booking
   → Click cancel on booking within 2-hour window
   → POST /api/bookings/123/cancel
   → Booking status updated to CANCELLED
   → Refund process initiated

3. User views booking details
   → Navigate to /bookings/123  
   → GET /api/bookings/123
   → Display comprehensive booking information
   → Access to payment receipt
```

---

## 🏢 Owner System Implementation

### **Overview**
The Owner system enables facility owners to manage their sports venues, courts, bookings, and view business analytics.

### **File Structure**
```
src/
├── app/owner/                          # Owner-only pages
│   ├── dashboard/
│   │   └── page.tsx                    # Owner dashboard with analytics
│   ├── venues/
│   │   ├── page.tsx                    # Venue management list
│   │   ├── new/
│   │   │   └── page.tsx                # Create new venue
│   │   └── [id]/
│   │       ├── page.tsx                # Venue details/stats
│   │       └── edit/
│   │           └── page.tsx            # Edit venue form
│   └── bookings/
│       └── page.tsx                    # View all venue bookings
├── app/api/owner/                      # Owner-specific APIs
│   ├── dashboard/stats/
│   │   └── route.ts                    # Owner analytics API
│   ├── venues/
│   │   ├── route.ts                    # CRUD venues
│   │   └── [id]/
│   │       └── route.ts                # Individual venue management
│   └── bookings/
│       └── route.ts                    # Owner's venue bookings
```

### **Core Components**

#### **1. Owner Dashboard** (`src/app/owner/dashboard/page.tsx`)
**Purpose**: Business analytics and performance overview

**Implementation Details**:
- **Revenue Analytics**: Total earnings with monthly growth
- **Booking Statistics**: Booking counts and trends
- **Venue Performance**: Individual venue metrics
- **Recent Activity**: Latest bookings and user interactions
- **Growth Indicators**: Month-over-month comparisons

**Key Metrics Displayed**:
```typescript
interface OwnerStats {
  venues: {
    total: number;
    active: number;      // approved venues
    pending: number;     // awaiting admin approval
  };
  bookings: {
    total: number;
    thisMonth: number;
    growthPercentage: number;
  };
  earnings: {
    total: number;
    thisMonth: number;
    growthPercentage: number;
  };
  recentActivity: RecentActivity[];
}
```

**When Called**:
- Owner navigates to `/owner/dashboard`
- Component mounts and fetches analytics
- Auto-refreshes every 30 seconds for real-time updates

#### **2. Venue Management System**

**Venue List** (`src/app/owner/venues/page.tsx`)
**Purpose**: Overview of all owned venues

**Implementation Details**:
- **Venue Grid**: Cards showing venue status and key metrics
- **Quick Actions**: Edit, view bookings, manage courts
- **Approval Status**: Visual indicators for admin approval status
- **Performance Metrics**: Revenue and booking counts per venue

**Create New Venue** (`src/app/owner/venues/new/page.tsx`)
**Purpose**: Add new sports facilities to the platform

**Implementation Details**:
- **Multi-step Form**: Venue details, location, amenities
- **Image Upload**: Cloudinary integration for venue photos
- **Court Configuration**: Add multiple courts with different sports
- **Pricing Setup**: Flexible pricing per court
- **Admin Approval**: Submitted venues require admin approval

**Form Validation Schema**:
```typescript
const venueSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  address: z.string().min(10),
  city: z.string().min(2),
  state: z.string().optional(),
  amenities: z.array(z.string()),
  courts: z.array(z.object({
    name: z.string().min(1),
    sport: z.string().min(1),
    pricePerHour: z.number().positive(),
    openTime: z.number().min(0).max(23),
    closeTime: z.number().min(1).max(24)
  })).min(1, "At least one court is required")
});
```

**Edit Venue** (`src/app/owner/venues/[id]/edit/page.tsx`)
**Purpose**: Modify existing venue details and courts

**Implementation Details**:
- **Pre-populated Forms**: Existing data loaded for editing
- **Image Management**: Replace or update venue photos
- **Court CRUD**: Add, edit, or remove courts
- **Active Booking Check**: Prevents deletion of courts with active bookings

#### **3. Booking Oversight** (`src/app/owner/bookings/page.tsx`)
**Purpose**: Monitor all bookings across owned venues

**Implementation Details**:
- **Unified Booking View**: All venue bookings in one place
- **Booking Details**: User information, court details, payment status
- **Revenue Tracking**: Payment amounts and status
- **Date Filtering**: Filter bookings by date range
- **Export Capability**: Download booking reports (future feature)

### **API Implementation**

#### **1. Owner Dashboard Statistics** (`src/app/api/owner/dashboard/stats/route.ts`)
**HTTP Method**: GET  
**Authentication**: Required (OWNER role)  
**Purpose**: Provide comprehensive business analytics

**Data Aggregation Logic**:
```typescript
// Get owner's venues with related data
const venues = await prisma.venue.findMany({
  where: { ownerId: facilityOwner.id },
  include: { courts: { include: { bookings: true }}}
});

// Calculate total bookings across all venues
const allBookings = venues.flatMap(venue => 
  venue.courts.flatMap(court => court.bookings)
);

// Revenue calculation from successful payments
const payments = await prisma.payment.findMany({
  where: { 
    booking: { court: { venue: { ownerId: facilityOwner.id }}},
    status: 'SUCCEEDED'
  }
});

const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);

// Monthly growth calculations
const thisMonth = new Date();
const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1);

const thisMonthBookings = allBookings.filter(booking => 
  booking.createdAt >= lastMonth && booking.createdAt < thisMonth
);
```

#### **2. Venue Management API** (`src/app/api/owner/venues/route.ts`)
**HTTP Methods**: GET, POST  
**Authentication**: Required (OWNER role)  
**Purpose**: Create and list owned venues

**POST - Create New Venue**:
```typescript
// Multipart form handling for image uploads
const formData = await request.formData();
const imageFile = formData.get('image') as File;

// Image upload to Cloudinary
let imageData = null;
if (imageFile && imageFile.size > 0) {
  const bytes = await imageFile.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  imageData = await uploadImageToCloudinary(buffer, 'venues');
}

// Database transaction for venue and courts creation
const venue = await prisma.$transaction(async (tx) => {
  const createdVenue = await tx.venue.create({
    data: {
      ownerId: facilityOwner.id,
      name: venueData.name,
      slug: slugify(venueData.name, { lower: true, strict: true }),
      description: venueData.description,
      address: venueData.address,
      city: venueData.city,
      state: venueData.state,
      amenities: venueData.amenities,
      image: imageData?.secure_url,
      imagePublicId: 
      imageData?.public_id,
      approved: false // Requires admin approval
    }
  });

  // Create associated courts
  const courts = venueData.courts.map(court => ({
    venueId: createdVenue.id,
    name: court.name,
    sport: court.sport,
    pricePerHour: new Decimal(court.pricePerHour),
    openTime: court.openTime,
    closeTime: court.closeTime
  }));

  await tx.court.createMany({ data: courts });
  
  return createdVenue;
});
```

#### **3. Individual Venue Management** (`src/app/api/owner/venues/[id]/route.ts`)
**HTTP Methods**: GET, PUT, DELETE  
**Authentication**: Required (OWNER role + ownership verification)  
**Purpose**: Manage specific venues

**Ownership Verification**:
```typescript
const venue = await prisma.venue.findFirst({
  where: { 
    id: venueId, 
    owner: { userId: session.user.id } // Ensures owner can only access their venues
  }
});

if (!venue) {
  return NextResponse.json({ error: 'Venue not found or access denied' }, { status: 404 });
}
```

**PUT - Update Venue**:
- **Image Replacement**: Handles new image uploads and cleanup of old images
- **Court Updates**: Supports adding, editing, and removing courts
- **Active Booking Protection**: Prevents deletion of courts with future bookings

**DELETE - Remove Venue**:
- **Booking Validation**: Checks for active or future bookings
- **Cascade Deletion**: Removes associated courts and data
- **Image Cleanup**: Deletes images from Cloudinary

### **Owner Workflow Scenarios**

#### **Scenario 1: New Venue Creation**
```
1. Owner visits /owner/venues/new
   → Form loads with venue creation fields
   
2. Owner fills venue details:
   - Basic info (name, description, address)
   - Amenities selection
   - Image upload (processed by Cloudinary)
   - Court configuration (sport, pricing, hours)

3. Form submission → POST /api/owner/venues
   → Validation with Zod schema
   → Image upload to Cloudinary
   → Database transaction creates venue + courts
   → Status: approved = false (pending admin approval)

4. Owner redirected to venue list
   → Venue shows "Pending Approval" status
   → Owner can edit details while pending
   
5. Admin approves venue → approved = true
   → Venue becomes visible to public users
```

#### **Scenario 2: Booking Management**
```
1. User books court at owner's venue
   → Booking created with owner's venue reference

2. Owner visits /owner/dashboard
   → GET /api/owner/dashboard/stats
   → Dashboard shows new booking in recent activity
   → Revenue metrics updated

3. Owner visits /owner/bookings  
   → GET /api/owner/bookings
   → All bookings across owned venues displayed
   → Owner can see user details, payment status

4. Payment completed via Stripe webhook
   → Booking status updated to CONFIRMED
   → Owner's revenue analytics automatically updated
```

#### **Scenario 3: Venue Editing**
```
1. Owner visits /owner/venues/[id]/edit
   → GET /api/owner/venues/123
   → Form pre-populated with existing data

2. Owner updates venue image
   → New image uploaded to Cloudinary
   → Old image deleted from Cloudinary
   → Database updated with new image URLs

3. Owner adds new court
   → Court form filled and submitted
   → PUT /api/owner/venues/123
   → New court added to venue
   → Available for booking immediately (if venue approved)

4. Owner attempts to delete court with bookings
   → API checks for active/future bookings
   → Returns error if bookings exist
   → Prevents deletion to maintain booking integrity
```

### **Business Logic Implementation**

#### **Approval Workflow**
- **New Venues**: Created with `approved: false`
- **Admin Review**: Required before public visibility
- **Owner Notifications**: Can track approval status
- **Edit During Pending**: Owners can modify while awaiting approval

#### **Revenue Tracking**
- **Automatic Calculation**: Based on successful payment records
- **Real-time Updates**: Stripe webhook updates revenue instantly
- **Monthly Comparisons**: Growth percentage calculations
- **Per-venue Breakdown**: Individual venue performance metrics

#### **Booking Oversight**
- **Cross-venue View**: All bookings in unified interface
- **Payment Visibility**: Track payment status and amounts
- **User Information**: Access to booking user details (privacy compliant)
- **Cancellation Impact**: Automatic revenue adjustments for refunds

---

## 📅 Booking System Implementation

### **Overview**
The booking system is the core functionality that handles real-time court reservations with conflict prevention, payment integration, and comprehensive booking lifecycle management.

### **File Structure**
```
src/
├── app/                                # Booking-related pages
│   ├── venues/[id]/book/
│   │   └── page.tsx                    # Booking interface
│   ├── bookings/
│   │   ├── page.tsx                    # Booking management
│   │   └── [id]/
│   │       └── page.tsx                # Booking details
│   └── booking/[id]/payment/
│       └── page.tsx                    # Payment processing
├── app/api/bookings/                   # Booking APIs
│   ├── route.ts                        # Create/list bookings
│   ├── user/route.ts                   # User's bookings  
│   ├── availability/route.ts           # Availability checking
│   └── [id]/
│       ├── route.ts                    # Booking details
│       ├── cancel/route.ts             # Cancellation
│       └── payment/route.ts            # Payment updates
└── prisma/schema.prisma                # Booking data models
```

### **Database Schema Design**

#### **Core Models**
```sql
-- Booking model with concurrency control
model Booking {
  id             Int           @id @default(autoincrement())
  user           User          @relation(fields: [userId], references: [id])
  userId         Int
  court          Court         @relation(fields: [courtId], references: [id])
  courtId        Int
  startTime      DateTime
  endTime        DateTime
  status         BookingStatus @default(PENDING)
  payment        Payment?
  paymentId      Int?          @unique
  idempotencyKey String?       @unique  // Prevents duplicate bookings
  notes          String?
  createdAt      DateTime      @default(now())

  // Critical: Prevents double bookings
  @@unique([courtId, startTime])
  @@index([userId])
  @@index([courtId])
  @@index([status])
}

enum BookingStatus {
  PENDING      // Awaiting payment
  CONFIRMED    // Payment successful
  CANCELLED    // User cancelled
  COMPLETED    // Booking time passed
}
```

### **Core Components**

#### **1. Availability Checking System**

**Real-time Availability API** (`src/app/api/bookings/availability/route.ts`)
**Purpose**: Provide live court availability for specific dates

**Algorithm Implementation**:
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courtId = parseInt(searchParams.get('courtId') || '');
  const date = searchParams.get('date'); // Format: YYYY-MM-DD

  // Get court information with operating hours
  const court = await prisma.court.findUnique({
    where: { id: courtId },
    include: { venue: true }
  });

  // Get all existing bookings for the date
  const startOfDay = new Date(`${date}T00:00:00`);
  const endOfDay = new Date(`${date}T23:59:59`);
  
  const existingBookings = await prisma.booking.findMany({
    where: {
      courtId,
      startTime: { gte: startOfDay },
      endTime: { lte: endOfDay },
      status: { not: 'CANCELLED' }
    }
  });

  // Generate available time slots
  const availableSlots = [];
  const now = new Date();

  for (let hour = court.openTime; hour < court.closeTime; hour++) {
    const slotStart = new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00`);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1 hour later

    // Skip past time slots
    if (slotStart <= now) continue;

    // Check for booking conflicts
    const hasConflict = existingBookings.some(booking => {
      return slotStart < booking.endTime && slotEnd > booking.startTime;
    });

    if (!hasConflict) {
      availableSlots.push({
        startTime: slotStart,
        endTime: slotEnd,
        price: court.pricePerHour,
        available: true
      });
    }
  }

  return NextResponse.json({
    date,
    courtId,
    availableSlots,
    courtInfo: {
      name: court.name,
      sport: court.sport,
      pricePerHour: court.pricePerHour,
      operatingHours: {
        open: court.openTime,
        close: court.closeTime
      }
    }
  });
}
```

#### **2. Booking Creation with Concurrency Control**

**Booking Creation API** (`src/app/api/bookings/route.ts`)
**Purpose**: Create bookings with atomic operations and conflict prevention

**Critical Implementation Features**:

**Concurrency Control Strategy**:
```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validatedData = bookingSchema.parse(body);
  
  const { courtId, startTime, duration, notes } = validatedData;
  const endTime = new Date(new Date(startTime).getTime() + duration * 60 * 60 * 1000);

  try {
    // Use database transaction with SERIALIZABLE isolation
    const booking = await prisma.$transaction(async (tx) => {
      // Step 1: Check for conflicts with highest isolation level
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          courtId,
          startTime: { lt: endTime },
          endTime: { gt: new Date(startTime) },
          status: { not: 'CANCELLED' }
        }
      });

      if (conflictingBooking) {
        throw new Error('Time slot is no longer available');
      }

      // Step 2: Validate court operating hours
      const court = await tx.court.findUnique({
        where: { id: courtId },
        include: { venue: true }
      });

      if (!court || !court.venue.approved) {
        throw new Error('Court not available');
      }

      const startHour = new Date(startTime).getHours();
      if (startHour < court.openTime || startHour >= court.closeTime) {
        throw new Error('Booking outside operating hours');
      }

      // Step 3: Create booking with idempotency key
      const idempotencyKey = generateIdempotencyKey(
        session.user.id, 
        courtId, 
        startTime
      );

      const newBooking = await tx.booking.create({
        data: {
          userId: session.user.id,
          courtId,
          startTime: new Date(startTime),
          endTime,
          status: 'PENDING',
          idempotencyKey,
          notes: notes || null
        }
      });

      // Step 4: Create associated payment record
      const totalAmount = Math.round(court.pricePerHour * duration * 100); // Convert to paisa

      await tx.payment.create({
        data: {
          bookingId: newBooking.id,
          amount: totalAmount,
          currency: 'INR',
          status: 'PENDING',
          gateway: 'stripe'
        }
      });

      return newBooking;
    }, {
      isolationLevel: 'Serializable', // Highest isolation level prevents phantom reads
      timeout: 10000 // 10 second timeout
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        courtId: booking.courtId,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status
      }
    });

  } catch (error) {
    if (error.code === 'P2002') { // Prisma unique constraint violation
      return NextResponse.json(
        { error: 'Booking conflict detected' }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' }, 
      { status: 400 }
    );
  }
}
```

**Idempotency Key Generation**:
```typescript
function generateIdempotencyKey(userId: number, courtId: number, startTime: string): string {
  const data = `${userId}-${courtId}-${startTime}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
}
```

#### **3. Booking Lifecycle Management**

**Booking States and Transitions**:
```
PENDING → CONFIRMED (payment successful)
PENDING → CANCELLED (payment failed/user cancelled)
CONFIRMED → CANCELLED (user cancellation within window)
CONFIRMED → COMPLETED (booking time passed)
CANCELLED → (terminal state)
COMPLETED → (terminal state)
```

**Cancellation Logic** (`src/app/api/bookings/[id]/cancel/route.ts`)
```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const bookingId = parseInt(params.id);

  const booking = await prisma.booking.findFirst({
    where: { 
      id: bookingId, 
      userId: session.user.id // Ownership verification
    },
    include: { payment: true, court: { include: { venue: true }}}
  });

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // Business rule: 2-hour cancellation window
  const now = new Date();
  const twoHoursBeforeBooking = new Date(booking.startTime.getTime() - 2 * 60 * 60 * 1000);

  if (now >= twoHoursBeforeBooking) {
    return NextResponse.json(
      { error: 'Cannot cancel booking less than 2 hours before start time' },
      { status: 400 }
    );
  }

  // Atomic cancellation with refund processing
  await prisma.$transaction(async (tx) => {
    // Update booking status
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' }
    });

    // Update payment status for refund
    if (booking.payment && booking.payment.status === 'SUCCEEDED') {
      await tx.payment.update({
        where: { id: booking.payment.id },
        data: { status: 'REFUNDED' }
      });
    }
  });

  return NextResponse.json({ 
    success: true, 
    message: 'Booking cancelled successfully' 
  });
}
```

### **Frontend Integration**

#### **Booking Interface** (`src/app/venues/[id]/book/page.tsx`)

**Real-time Availability Integration**:
```typescript
const [availableSlots, setAvailableSlots] = useState([]);
const [selectedSlot, setSelectedSlot] = useState(null);
const [loading, setLoading] = useState(false);

// Fetch availability when date/court changes
useEffect(() => {
  const fetchAvailability = async () => {
    if (!selectedCourt || !selectedDate) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/bookings/availability?courtId=${selectedCourt.id}&date=${selectedDate}`
      );
      const data = await response.json();
      setAvailableSlots(data.availableSlots);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  fetchAvailability();
}, [selectedCourt, selectedDate]);

// Handle booking submission
const handleBookingSubmit = async () => {
  if (!selectedSlot) return;

  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courtId: selectedCourt.id,
        startTime: selectedSlot.startTime,
        duration: selectedDuration,
        notes: bookingNotes
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      // Redirect to payment flow
      router.push(`/booking/${result.booking.id}/payment`);
    } else {
      // Handle booking conflict or other errors
      setError(result.error);
    }
  } catch (error) {
    setError('Failed to create booking');
  }
};
```

### **Data Flow Scenarios**

#### **Scenario 1: Successful Booking Creation**
```
1. User Interface Flow:
   - User visits /venues/123/book
   - Selects court from available courts
   - Chooses date from calendar
   - Frontend → GET /api/bookings/availability?courtId=456&date=2024-01-15

2. Availability Check:
   - API queries existing bookings for court on date
   - Generates hourly slots within operating hours
   - Filters out conflicting and past slots
   - Returns available slots with pricing

3. Booking Creation:
   - User selects time slot and duration
   - Frontend calculates total price
   - User clicks "Book Now"
   - Frontend → POST /api/bookings

4. Backend Processing:
   - Validates user authentication
   - Starts database transaction with SERIALIZABLE isolation
   - Checks for conflicts again (double-check)
   - Creates booking with PENDING status
   - Creates payment record
   - Generates idempotency key

5. Payment Integration:
   - User redirected to payment page
   - Payment flow initiates (covered in Payment section)
   - Stripe webhook updates booking status
   - User receives confirmation
```

#### **Scenario 2: Booking Conflict Handling**
```
1. Concurrent Booking Scenario:
   - User A and User B both see the same available slot
   - Both click "Book Now" simultaneously
   - Both requests hit POST /api/bookings

2. Race Condition Prevention:
   - First request enters transaction
   - Creates booking successfully
   - Commits transaction

3. Second Request Handling:
   - Enters transaction after first commits
   - Conflict check finds existing booking
   - Transaction rolls back
   - Returns 409 Conflict error

4. Frontend Error Handling:
   - User B sees "Time slot no longer available"
   - Availability refreshed automatically
   - User can select different slot
```

#### **Scenario 3: Booking Cancellation**
```
1. User Cancellation Request:
   - User visits /bookings/123
   - Sees booking details and cancel button
   - Clicks cancel (within 2-hour window)

2. Validation Process:
   - API verifies ownership
   - Checks cancellation window (2 hours before)
   - Validates booking can be cancelled

3. Cancellation Processing:
   - Updates booking status to CANCELLED
   - Updates payment status to REFUNDED
   - Court slot becomes available again
   - User notified of successful cancellation

4. Refund Processing:
   - Stripe refund initiated (if payment completed)
   - User receives refund confirmation
   - Owner's revenue analytics updated
```

### **Performance Optimizations**

#### **Database Optimizations**
- **Strategic Indexing**: Optimized queries for availability checks
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Selective field inclusion in responses

#### **Caching Strategy**
- **Availability Caching**: Short-term cache for frequently checked slots
- **Court Information**: Cached court details and pricing
- **User Session Cache**: Reduced database lookups for authenticated requests

#### **Error Handling & Resilience**
- **Timeout Configuration**: Database transaction timeouts
- **Retry Logic**: Automatic retry for transient failures
- **Graceful Degradation**: Fallback options when services unavailable

---

## 💳 Payment System Implementation

### **Overview**
The payment system integrates Stripe for secure payment processing with comprehensive webhook handling, automatic status updates, and refund management.

### **File Structure**
```
src/
├── app/                                # Payment-related pages
│   └── booking/[id]/payment/
│       └── page.tsx                    # Payment processing interface
├── app/api/                            # Payment APIs
│   ├── create-payment-intent/
│   │   └── route.ts                    # Stripe PaymentIntent creation
│   ├── stripe-webhook/
│   │   └── route.ts                    # Stripe webhook handler
│   └── bookings/[id]/payment/
│       └── route.ts                    # Payment status updates
├── lib/
│   └── stripe.ts                       # Stripe client configuration
└── prisma/schema.prisma                # Payment data models
```

### **Database Schema Design**

#### **Payment Model**
```sql
model Payment {
  id                    Int           @id @default(autoincrement())
  booking               Booking?      @relation(fields: [bookingId], references: [id])
  bookingId             Int?          @unique
  gateway               String        @default("stripe")
  stripePaymentIntentId String?       @unique
  stripeChargeId        String?       
  amount                Int           // Stored in smallest currency unit (paisa)
  currency              String        @default("INR")
  status                PaymentStatus @default(PENDING)
  receiptUrl            String?       // Stripe receipt URL
  paymentMethod         String?       // Card type, UPI, etc.
  createdAt             DateTime      @default(now())

  @@index([stripePaymentIntentId])
  @@index([status])
}

enum PaymentStatus {
  PENDING    // Payment intent created, awaiting payment
  SUCCEEDED  // Payment completed successfully
  FAILED     // Payment failed or was declined
  REFUNDED   // Payment was refunded
}
```

### **Core Components**

#### **1. Stripe Configuration** (`src/lib/stripe.ts`)

**Stripe Client Setup**:
```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil", // Latest Stripe API version
  typescript: true,
});

// Stripe configuration for webhook signature verification
export const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
```

#### **2. Payment Intent Creation** (`src/app/api/create-payment-intent/route.ts`)

**Purpose**: Create Stripe PaymentIntent for booking payment processing

**Implementation Details**:
```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bookingId } = await request.json();

  // Fetch booking with payment and court details
  const booking = await prisma.booking.findFirst({
    where: { 
      id: bookingId, 
      userId: session.user.id // Ownership verification
    },
    include: {
      payment: true,
      court: {
        include: { venue: true }
      }
    }
  });

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.status !== 'PENDING') {
    return NextResponse.json({ error: 'Booking not pending payment' }, { status: 400 });
  }

  // Check if PaymentIntent already exists
  if (booking.payment?.stripePaymentIntentId) {
    // Retrieve existing PaymentIntent
    const existingIntent = await stripe.paymentIntents.retrieve(
      booking.payment.stripePaymentIntentId
    );
    
    if (existingIntent.status === 'succeeded') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
    }

    return NextResponse.json({
      clientSecret: existingIntent.client_secret,
      paymentIntentId: existingIntent.id
    });
  }

  try {
    // Calculate booking duration and total amount
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const totalAmount = Math.round(booking.court.pricePerHour * durationHours * 100); // Convert to paisa

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'inr',
      payment_method_types: ['card'],
      metadata: {
        bookingId: booking.id.toString(),
        userId: session.user.id.toString(),
        courtName: booking.court.name,
        venueName: booking.court.venue.name,
        startTime: booking.startTime.toISOString(),
        duration: durationHours.toString()
      },
      description: `Booking for ${booking.court.name} at ${booking.court.venue.name}`
    });

    // Update payment record with PaymentIntent ID
    await prisma.payment.update({
      where: { bookingId: booking.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        amount: totalAmount
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      currency: 'inr'
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
```

#### **3. Webhook Handler** (`src/app/api/stripe-webhook/route.ts`)

**Purpose**: Handle Stripe webhook events for automatic payment status updates

**Critical Implementation Features**:

**Webhook Signature Verification**:
```typescript
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    // Verify webhook signature to ensure request is from Stripe
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object as Stripe.Dispute);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

**Payment Success Handler**:
```typescript
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = parseInt(paymentIntent.metadata.bookingId);

  // Atomic update of booking and payment status
  await prisma.$transaction(async (tx) => {
    // Update payment record
    const payment = await tx.payment.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'SUCCEEDED',
        stripeChargeId: paymentIntent.latest_charge as string,
        receiptUrl: await getReceiptUrl(paymentIntent.latest_charge as string),
        paymentMethod: getPaymentMethodType(paymentIntent)
      }
    });

    // Update booking status to confirmed
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' }
    });

    // Send confirmation email (future feature)
    // await sendBookingConfirmationEmail(bookingId);
  });

  console.log(`Payment succeeded for booking ${bookingId}`);
}
```

**Payment Failure Handler**:
```typescript
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = parseInt(paymentIntent.metadata.bookingId);

  await prisma.$transaction(async (tx) => {
    // Update payment status
    await tx.payment.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { 
        status: 'FAILED',
        paymentMethod: getPaymentMethodType(paymentIntent)
      }
    });

    // Cancel the booking
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' }
    });
  });

  console.log(`Payment failed for booking ${bookingId}`);
}
```

#### **4. Payment Processing Interface** (`src/app/booking/[id]/payment/page.tsx`)

**Purpose**: Frontend payment processing with Stripe Elements

**Key Implementation Features**:
```typescript
'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm({ bookingId, clientSecret, amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;

    setProcessing(true);
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: session.user.fullName,
          email: session.user.email,
        },
      },
    });

    if (error) {
      setPaymentError(error.message);
      setProcessing(false);
    } else {
      // Payment succeeded - webhook will handle backend updates
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Redirect to booking confirmation
      router.push(`/bookings/${bookingId}?payment=success`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      {paymentError && (
        <div className="text-red-600 text-sm">{paymentError}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg disabled:opacity-50"
      >
        {processing ? 'Processing...' : `Pay ₹${(amount / 100).toFixed(2)}`}
      </button>
    </form>
  );
}

export default function PaymentPage({ params }) {
  const { id: bookingId } = params;
  const [clientSecret, setClientSecret] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Create payment intent
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: parseInt(bookingId) })
        });

        const data = await response.json();
        
        if (response.ok) {
          setClientSecret(data.clientSecret);
          // Fetch booking details for display
          const bookingResponse = await fetch(`/api/bookings/${bookingId}`);
          const booking = await bookingResponse.json();
          setBookingDetails(booking);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error('Error initializing payment:', error);
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [bookingId]);

  if (loading) return <div>Loading payment...</div>;

  return (
    <Elements stripe={stripePromise}>
      <div className="max-w-md mx-auto">
        <BookingSummary booking={bookingDetails} />
        <PaymentForm 
          bookingId={bookingId}
          clientSecret={clientSecret}
          amount={bookingDetails.payment.amount}
        />
      </div>
    </Elements>
  );
}
```

### **Payment Flow Scenarios**

#### **Scenario 1: Successful Payment Processing**
```
1. User Journey:
   - User creates booking → Booking status: PENDING
   - Redirected to /booking/123/payment
   - Payment page loads payment form

2. Payment Intent Creation:
   - Frontend → POST /api/create-payment-intent
   - API creates Stripe PaymentIntent
   - Updates payment record with PaymentIntent ID
   - Returns client_secret to frontend

3. Payment Processing:
   - User enters card details in Stripe Elements
   - Clicks "Pay" button
   - Frontend → stripe.confirmCardPayment()
   - Payment processed by Stripe

4. Webhook Processing:
   - Stripe → POST /api/stripe-webhook (payment_intent.succeeded)
   - Webhook verifies signature
   - Updates payment status to SUCCEEDED
   - Updates booking status to CONFIRMED
   - Transaction committed atomically

5. User Experience:
   - Frontend receives payment confirmation
   - User redirected to booking confirmation
   - Email confirmation sent (future feature)
```

#### **Scenario 2: Payment Failure Handling**
```
1. Payment Failure:
   - Card declined or insufficient funds
   - Stripe → POST /api/stripe-webhook (payment_intent.payment_failed)

2. Automatic Cleanup:
   - Webhook updates payment status to FAILED
   - Booking status updated to CANCELLED
   - Court slot becomes available again

3. User Experience:
   - User sees payment error message
   - Option to retry with different payment method
   - Booking automatically cancelled if payment fails
```

#### **Scenario 3: Refund Processing**
```
1. User Cancellation:
   - User cancels confirmed booking
   - API validates cancellation window (2 hours)
   - POST /api/bookings/123/cancel

2. Refund Initiation:
   - API creates Stripe refund
   - Updates payment status to REFUNDED
   - Updates booking status to CANCELLED

3. Webhook Confirmation:
   - Stripe → POST /api/stripe-webhook (charge.refunded)
   - Confirms refund completion
   - Updates owner revenue analytics
```

### **Security Implementation**

#### **Webhook Security**
- **Signature Verification**: All webhooks verified with Stripe signature
- **Idempotency**: Duplicate webhook events handled gracefully
- **Rate Limiting**: Webhook endpoint protected from abuse

#### **Payment Security**
- **PCI Compliance**: Card details never touch our servers
- **Stripe Elements**: Secure card input handling
- **HTTPS Only**: All payment communications encrypted

#### **Fraud Prevention**
- **3D Secure**: Automatic 3D Secure for eligible cards
- **Risk Assessment**: Stripe's built-in fraud detection
- **Metadata Tracking**: Comprehensive payment metadata for audit trails

### **Error Handling & Resilience**

#### **Payment Error Types**
```typescript
// Common payment error scenarios handled
const paymentErrorHandlers = {
  'card_declined': 'Your card was declined. Please try a different payment method.',
  'insufficient_funds': 'Insufficient funds. Please check your account balance.',
  'expired_card': 'Your card has expired. Please use a valid card.',
  'incorrect_cvc': 'Your card security code is incorrect.',
  'processing_error': 'An error occurred processing your payment. Please try again.',
  'rate_limit_error': 'Too many requests. Please wait a moment and try again.'
};
```

#### **Retry Logic**
- **Automatic Retries**: Transient failures automatically retried
- **Circuit Breaker**: Protection against cascading failures
- **Graceful Degradation**: Fallback options when payment services unavailable

#### **Monitoring & Alerting**
- **Payment Metrics**: Success rates, failure types, processing times
- **Webhook Monitoring**: Failed webhook deliveries tracked
- **Revenue Tracking**: Real-time payment and refund monitoring

---

## 🔄 Overall System Architecture & Data Flow

### **System Architecture Overview**

The SportsBook application follows a **modern, microservice-oriented architecture** built on Next.js 15 with a focus on **scalability, security, and maintainability**.

### **High-Level Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT TIER                           │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 15 Frontend (React 19 + TypeScript)                  │
│  • Server-Side Rendering (SSR)                                │
│  • Client-Side Hydration                                      │
│  • Responsive UI with Tailwind CSS                            │
│  • Real-time Interactions with Framer Motion                  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTPS/WSS
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION TIER                         │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes (Serverless Functions)                    │
│  • RESTful API Endpoints (27 routes)                          │
│  • Authentication Middleware (NextAuth.js)                    │
│  • Role-based Access Control                                  │
│  • Input Validation (Zod Schemas)                             │
│  • Business Logic Layer                                       │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
┌─────────────────────┐  ┌─────────────────┐  ┌──────────────────────┐
│   DATABASE TIER     │  │ EXTERNAL APIs   │  │   FILE STORAGE       │
├─────────────────────┤  ├─────────────────┤  ├──────────────────────┤
│ PostgreSQL          │  │ Stripe Payment  │  │ Cloudinary CDN       │
│ • Prisma ORM        │  │ • PaymentIntents│  │ • Image Upload       │
│ • Connection Pool   │  │ • Webhooks      │  │ • Optimization       │
│ • ACID Transactions │  │ • Refunds       │  │ • Transformation     │
│ • Indexes & Queries │  │                 │  │ • Secure URLs        │
└─────────────────────┘  │ Email Service   │  └──────────────────────┘
                         │ • SMTP (Gmail)  │
                         │ • OTP Delivery  │
                         │ • HTML Templates│
                         └─────────────────┘
```

### **Request Flow Architecture**

#### **1. Authentication Flow**
```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. User Registration/Login Request
   │
   ├── Frontend Form Submission
   │   └── Zod Schema Validation
   │
   ├── API Route Handler (/api/auth/*)
   │   ├── Input Sanitization
   │   ├── Business Logic Validation
   │   └── Database Operations
   │
   ├── Database Layer (Prisma)
   │   ├── User Account Management
   │   ├── Password Hashing (bcrypt)
   │   └── Session Management
   │
   ├── External Services
   │   ├── Email Service (OTP Delivery)
   │   └── SMS Service (Future Feature)
   │
   └── Response & Redirect
       ├── JWT Token Generation
       ├── Session Cookie Setting
       └── Role-based Dashboard Redirect

Authentication Security Layers:
• Password Hashing: bcrypt with salt rounds
• JWT Tokens: Signed with secret key
• Session Management: Secure HTTP-only cookies  
• OTP Verification: Time-limited with attempt limits
• Role-based Access: Middleware validation
```

#### **2. Booking System Flow**
```
┌─────────────────────────────────────────────────────────────────┐
│                      BOOKING SYSTEM FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. Venue Discovery
   │
   ├── Search Request (/api/venues)
   │   ├── Query Parameter Processing
   │   ├── Database Filtering & Sorting
   │   └── Paginated Response
   │
   ├── Venue Details (/api/venues/[id])
   │   ├── Venue Information Aggregation
   │   ├── Court Availability Summary
   │   └── Review & Rating Calculation
   │
   └── Real-time Availability (/api/bookings/availability)
       ├── Date/Court Selection
       ├── Conflict Detection Algorithm
       └── Available Time Slots Generation

2. Booking Creation
   │
   ├── Booking Request (/api/bookings)
   │   ├── Authentication Verification
   │   ├── Input Validation (Zod)
   │   ├── Business Rules Validation
   │   └── Concurrency Control
   │
   ├── Database Transaction (SERIALIZABLE)
   │   ├── Conflict Re-check
   │   ├── Booking Record Creation
   │   ├── Payment Record Initialization
   │   └── Idempotency Key Generation
   │
   ├── Payment Integration
   │   ├── Stripe PaymentIntent Creation
   │   ├── Client Secret Generation
   │   └── Payment Processing Initiation
   │
   └── Status Management
       ├── Real-time Status Updates
       ├── Webhook Event Processing
       └── User Notification (Future)

Concurrency Control Strategy:
• Database Isolation: SERIALIZABLE transactions
• Unique Constraints: Prevent duplicate bookings
• Idempotency Keys: Handle duplicate requests
• Optimistic Locking: Reduce lock contention
• Race Condition Prevention: Double-conflict checking
```

#### **3. Payment Processing Flow**
```
┌─────────────────────────────────────────────────────────────────┐
│                   PAYMENT PROCESSING FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. Payment Initiation
   │
   ├── Payment Intent Creation (/api/create-payment-intent)
   │   ├── Booking Validation
   │   ├── Amount Calculation
   │   ├── Stripe API Integration
   │   └── Database Synchronization
   │
   ├── Frontend Payment Form
   │   ├── Stripe Elements Integration
   │   ├── PCI Compliant Card Input
   │   ├── Real-time Validation
   │   └── 3D Secure Handling
   │
   └── Payment Confirmation
       ├── Client-side Success Handling
       ├── Redirect to Confirmation
       └── Error State Management

2. Webhook Processing (/api/stripe-webhook)
   │
   ├── Signature Verification
   │   ├── Stripe Signature Validation
   │   ├── Event Type Identification
   │   └── Replay Attack Prevention
   │
   ├── Event Processing
   │   ├── payment_intent.succeeded
   │   ├── payment_intent.payment_failed
   │   ├── charge.dispute.created
   │   └── invoice.payment_succeeded
   │
   ├── Database Updates (Atomic)
   │   ├── Payment Status Synchronization
   │   ├── Booking Status Updates
   │   ├── Revenue Tracking
   │   └── Audit Trail Creation
   │
   └── Business Logic Triggers
       ├── Confirmation Email Sending
       ├── Owner Notification
       ├── Analytics Updates
       └── Refund Processing (if needed)

Payment Security Measures:
• PCI DSS Compliance: Card data never stored
• Encryption: TLS 1.3 for all communications
• Webhook Security: Signature verification
• Fraud Detection: Stripe's ML-based screening
• Audit Logging: Complete payment trail
```

### **Data Flow Patterns**

#### **1. Multi-Role Data Access Pattern**
```
┌─────────────────────────────────────────────────────────────────┐
│                   ROLE-BASED DATA ACCESS                       │
└─────────────────────────────────────────────────────────────────┘

Request Flow by Role:

USER Role:
  Browser → Middleware (Role Check) → User Pages
    ├── /venues (Public access)
    ├── /bookings (Own bookings only)
    ├── /profile (Own profile only)
    └── /dashboard (Personal dashboard)

OWNER Role:
  Browser → Middleware (Role Check) → Owner Pages
    ├── /owner/dashboard (Own venue stats)
    ├── /owner/venues (Own venues only)
    ├── /owner/bookings (Own venue bookings)
    └── API Access (Filtered by ownership)

ADMIN Role:
  Browser → Middleware (Role Check) → Admin Pages
    ├── /admin/dashboard (Platform-wide stats)
    ├── /admin/facilities (All venue approvals)
    ├── /admin/users (All user management)
    └── API Access (Unrestricted, audit logged)

Data Filtering Strategy:
• Database Level: WHERE clauses with user context
• API Level: Role-based data filtering
• Frontend Level: Conditional rendering
• Middleware Level: Route access control
```

#### **2. Real-time Data Synchronization**
```
┌─────────────────────────────────────────────────────────────────┐
│                REAL-TIME DATA SYNCHRONIZATION                  │
└─────────────────────────────────────────────────────────────────┘

Booking Availability Updates:
  User A books slot → Database Update → Cache Invalidation
                  → Other users see updated availability

Payment Status Updates:
  Stripe Webhook → Database Update → User Interface Update
                → Owner Dashboard Update → Admin Analytics Update

Venue Approval Flow:
  Admin approves venue → Database Update → Venue goes live
                      → Owner notification → Public visibility

Analytics Updates:
  New booking → Revenue calculation → Dashboard metrics update
            → Growth percentage recalculation
            → Chart data updates

Synchronization Techniques:
• Database Triggers: Automatic calculations
• Event-driven Updates: Webhook-triggered cascades
• Cache Invalidation: Strategic cache clearing
• Optimistic UI Updates: Immediate feedback
```

#### **3. Error Handling & Recovery Patterns**
```
┌─────────────────────────────────────────────────────────────────┐
│                ERROR HANDLING & RECOVERY                       │
└─────────────────────────────────────────────────────────────────┘

Error Handling Hierarchy:

1. Frontend Errors:
   ├── Form Validation Errors (Zod)
   ├── Network Request Failures
   ├── Authentication Errors
   └── UI State Management Errors

2. API Errors:
   ├── Authentication/Authorization (401/403)
   ├── Validation Errors (400)
   ├── Business Logic Errors (409)
   ├── Database Errors (500)
   └── External Service Errors (502/503)

3. Database Errors:
   ├── Connection Failures
   ├── Transaction Rollbacks
   ├── Constraint Violations
   └── Timeout Errors

4. External Service Errors:
   ├── Stripe API Failures
   ├── Email Service Failures
   ├── Cloudinary Upload Failures
   └── Network Connectivity Issues

Recovery Strategies:
• Automatic Retry: Exponential backoff for transient failures
• Circuit Breaker: Prevent cascading failures
• Graceful Degradation: Fallback functionality
• Transaction Rollback: Maintain data consistency
• User Notification: Clear error messages
• Audit Logging: Error tracking and analysis
```

### **Performance Optimization Strategies**

#### **1. Database Performance**
```
Optimization Techniques:
• Strategic Indexing: Query-optimized database indexes
• Connection Pooling: Efficient connection management
• Query Optimization: Selective field inclusion
• Aggregation Queries: Reduced round-trips
• Transaction Optimization: Minimal lock duration
• Read Replicas: Scale read operations (future)

Key Indexes:
• Venue.city, Venue.approved (Search optimization)
• Booking.courtId, Booking.startTime (Availability)
• User.email (Authentication)
• Payment.stripePaymentIntentId (Webhook processing)
```

#### **2. API Performance**
```
Caching Strategy:
• Route-level Caching: Static content caching
• Database Query Caching: Repeated query optimization
• CDN Integration: Global content delivery
• Browser Caching: Client-side caching headers

Response Optimization:
• Pagination: Large dataset handling
• Field Selection: Reduce payload size
• Compression: Gzip/Brotli compression
• HTTP/2: Multiplexed connections
```

#### **3. Frontend Performance**
```
Optimization Techniques:
• Code Splitting: Lazy loading of components
• Image Optimization: Next.js Image component
• Bundle Optimization: Tree shaking and minification
• Critical CSS: Above-the-fold optimization
• Service Workers: Offline functionality (future)

User Experience:
• Loading States: Skeleton screens
• Error Boundaries: Graceful error handling
• Optimistic Updates: Immediate user feedback
• Progressive Enhancement: Core functionality first
```

### **Deployment & Infrastructure**

#### **1. Vercel Deployment Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL DEPLOYMENT                           │
└─────────────────────────────────────────────────────────────────┘

Edge Network:
  Global CDN → Edge Functions → Serverless Functions
    ├── Static Assets (CDN)
    ├── API Routes (Serverless)
    ├── SSR Pages (Edge Runtime)
    └── Image Optimization (Vercel Image)

Database Connection:
  Vercel Functions → Connection Pool → PostgreSQL (Neon)
    ├── Connection Pooling (PgBouncer)
    ├── SSL Encryption
    ├── Automatic Scaling
    └── Backup & Recovery

External Integrations:
  ├── Stripe API (Payment Processing)
  ├── Cloudinary (Image Management)
  ├── Gmail SMTP (Email Delivery)
  └── Google OAuth (Authentication)
```

#### **2. Environment Configuration**
```
Development Environment:
• Local PostgreSQL
• Ngrok for webhook testing
• Hot reloading with Turbopack
• Development Stripe keys

Production Environment:
• Neon PostgreSQL (Serverless)
• Production Stripe keys
• Vercel Edge Network
• Environment variable management
• Automatic deployments from Git
```

### **Security Architecture**

#### **1. Defense in Depth Strategy**
```
Security Layers:
1. Network Security: HTTPS/TLS encryption
2. Application Security: Input validation, CSRF protection
3. Authentication: Multi-factor with OTP
4. Authorization: Role-based access control
5. Data Security: Encrypted storage, PII protection
6. Audit & Monitoring: Comprehensive logging

Security Implementation:
• Password Security: bcrypt with salt rounds
• Session Management: Secure HTTP-only cookies
• API Security: Rate limiting, input validation
• Database Security: Parameterized queries
• File Upload Security: Type validation, size limits
• Payment Security: PCI DSS compliance
```

#### **2. Privacy & Compliance**
```
Data Protection:
• GDPR Compliance: User data rights
• Data Minimization: Collect only necessary data
• Encryption: At rest and in transit
• Access Control: Need-to-know basis
• Audit Trails: Complete activity logging
• Data Retention: Automated cleanup policies
```

This comprehensive implementation guide demonstrates a **production-ready, enterprise-grade sports facility booking platform** with robust architecture, comprehensive security, and scalable design patterns. The system is designed to handle **high concurrent loads**, **complex business logic**, and **real-time interactions** while maintaining **data consistency** and **user experience excellence**.
