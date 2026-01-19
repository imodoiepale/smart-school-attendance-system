# SmartSchool Sentinel - Routes Guide

## 🗺️ Complete Application Routes

### Public Routes
- `/` - Redirects to `/dashboard`
- `/auth/login` - Login page
- `/auth/signup` - Registration page
- `/auth/sign-up-success` - Success confirmation page

### Protected Routes (Require Authentication)

#### Main Navigation

##### 1. Dashboard (Senior Master)
- **Route:** `/dashboard`
- **Layout:** `app/dashboard/layout.tsx`
- **Page:** `app/dashboard/page.tsx`
- **Loading:** `app/dashboard/loading.tsx`
- **Features:**
  - Real-time attendance stats (5 cards)
  - Attendance chart
  - Active alerts
  - Recent activity feed
  - Student search
- **Data Fetching:** ✅ Active (fetches from `attendance`, `students`, `alerts` tables)

##### 2. Teacher Portal
- **Route:** `/teachers`
- **Layout:** `app/teachers/layout.tsx`
- **Page:** `app/teachers/page.tsx`
- **Loading:** `app/teachers/loading.tsx`
- **Features:**
  - Today's attendance stats
  - Class attendance table
  - Present/Late/Absent counts
  - Verify attendance actions
- **Data Fetching:** ✅ Active (fetches from `attendance`, `students` tables)

##### 3. Parent Portal
- **Route:** `/parents`
- **Layout:** `app/parents/layout.tsx`
- **Page:** `app/parents/page.tsx`
- **Loading:** `app/parents/loading.tsx`
- **Features:**
  - Children overview cards
  - Attendance rate per child
  - Current status (on/off campus)
  - Recent attendance activity
  - Absence requests table
  - Request new absence button
- **Data Fetching:** ✅ Active (fetches from `students`, `attendance`, `absence_requests`, `profiles` tables)

##### 4. Gate Security
- **Route:** `/gate-security`
- **Layout:** `app/gate-security/layout.tsx`
- **Page:** `app/gate-security/page.tsx`
- **Loading:** `app/gate-security/loading.tsx`
- **Features:**
  - Students on campus list
  - Recent exit activity
  - Mark exit actions
  - Exit verification
- **Data Fetching:** ✅ Active (fetches from `students`, `attendance` tables)

#### Admin Section

##### 5. Student Management
- **Route:** `/admin/students`
- **Layout:** `app/admin/layout.tsx`
- **Page:** `app/admin/students/page.tsx`
- **Loading:** `app/admin/students/loading.tsx`
- **Features:**
  - Student list with photos
  - Search bar (UI ready)
  - Add student button
  - Bulk import CSV button
  - Edit/Delete actions
  - Status badges
- **Data Fetching:** ✅ Active (fetches from `students` table)

##### 6. Timetable Management
- **Route:** `/admin/timetables`
- **Layout:** `app/admin/layout.tsx`
- **Page:** `app/admin/timetables/page.tsx`
- **Loading:** `app/admin/timetables/loading.tsx`
- **Features:**
  - Timetable grid view
  - Create timetable button
  - Period management
- **Data Fetching:** ⚠️ Needs verification (should fetch from `timetable_periods` table)

##### 7. Camera Management
- **Route:** `/admin/cameras`
- **Layout:** `app/admin/layout.tsx`
- **Page:** `app/admin/cameras/page.tsx`
- **Loading:** `app/admin/cameras/loading.tsx`
- **Features:**
  - Camera list with status
  - Online/Offline indicators
  - Stats (Total, Online, Offline)
  - Last heartbeat tracking
  - Add camera button
- **Data Fetching:** ✅ Active (fetches from `cameras` table)

##### 8. Special Events
- **Route:** `/admin/events`
- **Layout:** `app/admin/layout.tsx`
- **Page:** `app/admin/events/page.tsx`
- **Loading:** `app/admin/events/loading.tsx`
- **Features:**
  - Events grid view
  - Event cards with details
  - Create event button
  - Status badges
  - Participant count
- **Data Fetching:** ✅ Active (fetches from `special_events`, `event_participants` tables)

#### Settings

##### 9. Settings
- **Route:** `/settings`
- **Layout:** `app/settings/layout.tsx`
- **Page:** `app/settings/page.tsx`
- **Features:**
  - User profile settings
  - Notification preferences
  - System configuration
- **Data Fetching:** ⚠️ Needs verification

## 🔄 Route Isolation

Each route has its own:
- ✅ **Layout file** - Wraps content with Sidebar
- ✅ **Page file** - Main content component
- ✅ **Loading file** - Skeleton while data loads

All routes are **independent** and navigate separately without affecting each other.

## 📊 Data Fetching Status

### ✅ Working (Fetching from Database)
- `/dashboard` - Fetches attendance, students, alerts
- `/teachers` - Fetches attendance, students
- `/parents` - Fetches students, attendance, absence_requests
- `/gate-security` - Fetches students, attendance
- `/admin/students` - Fetches students
- `/admin/cameras` - Fetches cameras
- `/admin/events` - Fetches special_events, event_participants

### ⚠️ Needs Verification
- `/admin/timetables` - Check if fetching from timetable_periods
- `/settings` - Check if fetching user preferences

## 🎯 Navigation Flow

```
Root (/) 
  → Redirects to /dashboard

Main Navigation:
  ├── /dashboard (Senior Master Dashboard)
  ├── /teachers (Teacher Portal)
  ├── /parents (Parent Portal) ← NEW
  └── /gate-security (Gate Security)

Admin Section:
  ├── /admin/students (Student Management)
  ├── /admin/timetables (Timetable Management)
  ├── /admin/events (Special Events)
  └── /admin/cameras (Camera Management)

Settings:
  └── /settings (User Settings)

Auth:
  ├── /auth/login
  ├── /auth/signup
  └── /auth/sign-up-success
```

## 🔐 Route Protection

All protected routes check authentication via:
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  redirect("/auth/login")
}
```

## 📝 Database Tables Used

| Route | Tables Queried |
|-------|---------------|
| `/dashboard` | `attendance`, `students`, `alerts` |
| `/teachers` | `attendance`, `students`, `profiles` |
| `/parents` | `students`, `attendance`, `absence_requests`, `profiles` |
| `/gate-security` | `students`, `attendance` |
| `/admin/students` | `students` |
| `/admin/cameras` | `cameras` |
| `/admin/events` | `special_events`, `event_participants` |
| `/admin/timetables` | `timetable_periods` (needs verification) |

## 🚀 Performance Optimizations

Each route benefits from:
- ✅ Server-side data fetching (Next.js App Router)
- ✅ Parallel queries with `Promise.all()`
- ✅ Optimized queries (specific columns, LIMIT clauses)
- ✅ Loading skeletons for better UX
- ✅ Memoized navigation components
- ✅ Link prefetching enabled

## 🎨 Layout Consistency

All protected routes use the same layout structure:
```tsx
<div className="flex min-h-screen bg-gray-50">
  <Sidebar />
  <main className="flex-1 ml-64">
    {children}
  </main>
</div>
```

## 📱 Responsive Design

All routes are responsive with:
- Mobile: Single column layouts
- Tablet: 2-column grids
- Desktop: 3+ column grids

## 🔧 Next Steps for Each Route

### Dashboard
- ✅ Complete - All features working

### Teachers
- [ ] Implement mark attendance manually
- [ ] Add student profile modal
- [ ] Add class filter dropdown
- [ ] Export attendance reports

### Parents (NEW)
- [ ] Implement absence request form
- [ ] Add child detail modal
- [ ] Enable notifications
- [ ] Add attendance history chart

### Gate Security
- [ ] Implement mark exit functionality
- [ ] Add exit approval workflow
- [ ] Real-time updates

### Admin - Students
- [ ] Add student form modal
- [ ] Implement search functionality
- [ ] Bulk import CSV
- [ ] Face sync to cameras

### Admin - Cameras
- [ ] Add camera form modal
- [ ] Test connection functionality
- [ ] Real-time status updates

### Admin - Events
- [ ] Create event form modal
- [ ] Departure tracking
- [ ] Return tracking
- [ ] Generate reports

### Admin - Timetables
- [ ] Verify data fetching
- [ ] Create/edit timetable forms
- [ ] Period management

---

**Last Updated:** 2026-01-19
**Total Routes:** 13 (9 protected + 4 auth)
**Data Fetching:** 7/9 verified working
