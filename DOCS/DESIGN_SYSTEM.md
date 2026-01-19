# SmartSchool Sentinel - Design System

Based on the Scholarly app design reference images.

## Color Palette

### Primary Colors
- **Primary Blue**: `#1E40AF` (blue-800)
- **Light Blue**: `#3B82F6` (blue-500)
- **Accent Blue**: `#60A5FA` (blue-400)
- **Background**: `#F8FAFC` (slate-50)
- **White**: `#FFFFFF`

### Status Colors
- **Success/Present**: `#10B981` (green-500)
- **Warning/Late**: `#F59E0B` (amber-500)
- **Error/Absent**: `#EF4444` (red-500)
- **Info/Holiday**: `#8B5CF6` (purple-500)
- **Neutral**: `#6B7280` (gray-500)

### Text Colors
- **Primary Text**: `#0F172A` (slate-900)
- **Secondary Text**: `#64748B` (slate-500)
- **Muted Text**: `#94A3B8` (slate-400)

## Typography

### Font Sizes
- **Heading 1**: `text-3xl` (30px) - Page titles
- **Heading 2**: `text-2xl` (24px) - Section headers
- **Heading 3**: `text-xl` (20px) - Card titles
- **Body**: `text-base` (16px) - Regular text
- **Small**: `text-sm` (14px) - Labels, captions
- **Tiny**: `text-xs` (12px) - Timestamps, badges

### Font Weights
- **Bold**: `font-bold` (700) - Headings
- **Semibold**: `font-semibold` (600) - Subheadings
- **Medium**: `font-medium` (500) - Buttons, labels
- **Normal**: `font-normal` (400) - Body text

## Layout Components

### 1. Dashboard Header (Top Bar)
```
┌─────────────────────────────────────────────────────────────┐
│ Page Title          [Search]  [F] [🔔] [Profile ▼]         │
│ Subtitle                                                     │
└─────────────────────────────────────────────────────────────┘
```
- Height: `80px`
- Background: White
- Border bottom: `1px solid #E2E8F0`
- Sticky position

### 2. Attendance Table View (Image 1)
```
┌─────────────────────────────────────────────────────────────┐
│ [Date Selector] [Filter ▼]  Legend: ● Holiday ● On time... │
├─────────────────────────────────────────────────────────────┤
│ ☐ Student Profile | 23 | 24 | 25 | 26 | 27 | 28 | 29      │
│                   |Mon |Tue |Wed |Thu |Fri |Sat |Sun       │
├─────────────────────────────────────────────────────────────┤
│ ☐ [👤] Maria Adams  │ On  │ On  │Holiday│ On  │ On  │ On  │
│ ☐ [👤] Robin Logan  │Absent│ On  │(Sick) │ On  │ On  │ On  │
│ ☐ [👤] Cruz French  │ On  │ On  │ On  │ On  │ On  │Late  │
└─────────────────────────────────────────────────────────────┘
```

### 3. Student Profile Card (Image 2)
```
┌─────────────────────────────────────────────────────────────┐
│ UNI - 2456826                          [📞] [💬] [Search]  │
│ Student unique identifier                                   │
├─────────────────────────────────────────────────────────────┤
│ [Photo]  Mithun Ray                                         │
│          ID: UN-2455826  Number: +88...  Email: ...         │
│          Address: 245 Deo Street                            │
│                                                              │
│ [📅 25 Days]  [📅 10 Days]  [⚠️ 2 Days]                    │
│ Total Attendance Last Attendance Total Absent               │
├─────────────────────────────────────────────────────────────┤
│ Academic Performance                                         │
│ [Bar Chart showing grades]                                   │
├─────────────────────────────────────────────────────────────┤
│ Grades & Assignments Section | Recent Notice                │
│ [Table with subjects]        | [Notice cards]               │
└─────────────────────────────────────────────────────────────┘
```

### 4. Dashboard Cards (Image 3)
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 📚 Course    │ │ 📊 Attendance│ │ 📝 Assignments│
│ Progress     │ │ Rate         │ │              │
│ 75% ▲12%     │ │ 92% ▲02%     │ │ 64% ▲18%     │
│ 22 out of 64 │ │ Based on...  │ │ Based on...  │
└──────────────┘ └──────────────┘ └──────────────┘
```

## UI Patterns

### Cards
- Background: White
- Border radius: `12px` (rounded-xl)
- Shadow: `shadow-sm` on hover `shadow-md`
- Padding: `p-6`
- Border: `1px solid #E2E8F0`

### Buttons
- **Primary**: Blue background, white text, rounded-lg
- **Secondary**: White background, blue border, blue text
- **Ghost**: Transparent, hover gray background
- Height: `40px` (h-10)
- Padding: `px-4 py-2`

### Status Badges
- **On time**: Green background `bg-green-50`, green text `text-green-700`
- **Late**: Yellow background `bg-yellow-50`, yellow text `text-yellow-700`
- **Absent**: Red background `bg-red-50`, red text `text-red-700`
- **Holiday**: Purple background `bg-purple-50`, purple text `text-purple-700`
- Border radius: `rounded-full`
- Padding: `px-3 py-1`
- Font size: `text-xs`

### Avatar Images
- Size: `w-10 h-10` (40px) for list items
- Size: `w-20 h-20` (80px) for profile headers
- Border radius: `rounded-full`
- Border: `2px solid white` with shadow

### Tables
- Header: Gray background `bg-gray-50`
- Rows: White background, hover `bg-gray-50`
- Border: `border-b border-gray-200`
- Cell padding: `px-4 py-3`
- Sticky header on scroll

### Search Input
- Height: `40px`
- Border radius: `rounded-lg`
- Border: `1px solid #E2E8F0`
- Icon: Left-aligned with `pl-10`
- Placeholder: Gray text

## Spacing System

- **xs**: `4px` (1)
- **sm**: `8px` (2)
- **md**: `16px` (4)
- **lg**: `24px` (6)
- **xl**: `32px` (8)
- **2xl**: `48px` (12)

## Component Specifications

### Attendance Cell
```tsx
// On time
<div className="px-3 py-2 text-center text-sm">
  <span className="text-gray-700">On time</span>
</div>

// Late
<div className="px-3 py-2 text-center text-sm bg-yellow-50 rounded">
  <span className="text-yellow-700 font-medium">Late</span>
  <span className="text-xs text-yellow-600 block">(9:42 Jan)</span>
</div>

// Absent
<div className="px-3 py-2 text-center text-sm bg-red-50 rounded">
  <span className="text-red-700 font-medium">Absent</span>
  <span className="text-xs text-red-600 block">(Health Problem)</span>
</div>

// Holiday
<div className="px-3 py-2 text-center text-sm bg-purple-50 rounded">
  <span className="text-purple-700">Holiday</span>
</div>
```

### Date Selector
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full">
  <Calendar className="w-4 h-4" />
  <span>23 Sep - 29 Sep 2024</span>
</button>
```

### Legend
```tsx
<div className="flex items-center gap-4 text-sm">
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
    <span>Holiday</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full bg-green-500"></div>
    <span>On time 82%</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
    <span>Late 10%</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full bg-red-500"></div>
    <span>Absent 8%</span>
  </div>
</div>
```

## Animation & Interactions

- **Hover**: Scale 1.02, shadow increase
- **Active**: Scale 0.98
- **Transition**: `transition-all duration-200`
- **Loading**: Pulse animation on skeletons

## Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

---

**Design Goal**: Clean, modern, professional interface with excellent readability and intuitive navigation.
