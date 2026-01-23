# SMARTSCHOOL SENTINEL - IMPLEMENTATION GUIDE

## Table of Contents
1. [Quick Start](#quick-start)
2. [Database Setup](#database-setup)
3. [API Routes Structure](#api-routes-structure)
4. [Component Architecture](#component-architecture)
5. [Page Structure](#page-structure)
6. [Real-Time Features](#real-time-features)
7. [Background Jobs](#background-jobs)
8. [Testing Strategy](#testing-strategy)

---

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- Supabase account
- PostgreSQL database

### Installation Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env.local

# 3. Run database migrations
psql -h your-db-host -U your-user -d your-db -f scripts/005-add-anomaly-system.sql
psql -h your-db-host -U your-user -d your-db -f scripts/006-add-gate-system.sql

# 4. Start development server
pnpm dev
```

---

## Database Setup

### Migration Order
1. `004-add-stream-column.sql` (existing)
2. `005-add-anomaly-system.sql` (NEW - Anomaly detection system)
3. `006-add-gate-system.sql` (NEW - Gate security system)

### Running Migrations

**Option 1: Supabase Dashboard**
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of each migration file
3. Execute in order

**Option 2: Command Line**
```bash
# Using psql
psql -h db.xxxxx.supabase.co -U postgres -d postgres -f scripts/005-add-anomaly-system.sql
psql -h db.xxxxx.supabase.co -U postgres -d postgres -f scripts/006-add-gate-system.sql

# Using Supabase CLI
supabase db push
```

### Verify Migrations
```sql
-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('anomalies', 'voice_interventions', 'gate_transactions', 'leave_approvals');

-- Check new columns in user_registry
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_registry' 
  AND column_name IN ('risk_level', 'risk_score', 'attendance_rate_30day');
```

---

## API Routes Structure

### Directory Structure
```
app/api/
├── anomalies/
│   ├── route.ts                    # GET, POST /api/anomalies
│   ├── active/route.ts             # GET /api/anomalies/active
│   ├── [id]/
│   │   ├── route.ts                # GET, PATCH /api/anomalies/[id]
│   │   ├── resolve/route.ts        # POST /api/anomalies/[id]/resolve
│   │   ├── escalate/route.ts       # POST /api/anomalies/[id]/escalate
│   │   └── assign/route.ts         # POST /api/anomalies/[id]/assign
│   └── stats/route.ts              # GET /api/anomalies/stats
│
├── interventions/
│   ├── voice/
│   │   ├── broadcast/route.ts      # POST /api/interventions/voice/broadcast
│   │   ├── tts/route.ts            # POST /api/interventions/voice/tts
│   │   ├── zones/route.ts          # GET /api/interventions/voice/zones
│   │   └── history/route.ts        # GET /api/interventions/voice/history
│   └── sms/route.ts                # POST /api/interventions/sms
│
├── gate/
│   ├── verify-entry/route.ts       # POST /api/gate/verify-entry
│   ├── verify-exit/route.ts        # POST /api/gate/verify-exit
│   ├── request-approval/route.ts   # POST /api/gate/request-approval
│   ├── approve/route.ts            # POST /api/gate/approve
│   ├── deny/route.ts               # POST /api/gate/deny
│   ├── transactions/route.ts       # GET /api/gate/transactions
│   └── visitors/
│       ├── register/route.ts       # POST /api/gate/visitors/register
│       └── active/route.ts         # GET /api/gate/visitors/active
│
├── leave/
│   ├── route.ts                    # GET, POST /api/leave
│   ├── pending/route.ts            # GET /api/leave/pending
│   ├── active/route.ts             # GET /api/leave/active
│   ├── [id]/
│   │   ├── approve/route.ts        # POST /api/leave/[id]/approve
│   │   ├── deny/route.ts           # POST /api/leave/[id]/deny
│   │   └── cancel/route.ts         # POST /api/leave/[id]/cancel
│
├── insights/
│   ├── generate/route.ts           # POST /api/insights/generate
│   ├── active/route.ts             # GET /api/insights/active
│   ├── [id]/
│   │   ├── acknowledge/route.ts    # POST /api/insights/[id]/acknowledge
│   │   └── action/route.ts         # POST /api/insights/[id]/action
│
├── compliance/
│   ├── start/route.ts              # POST /api/compliance/start
│   ├── check/route.ts              # GET /api/compliance/check
│   └── [id]/update/route.ts        # PATCH /api/compliance/[id]/update
│
└── realtime/
    ├── whereabouts/route.ts        # GET /api/realtime/whereabouts
    ├── anomalies/route.ts          # GET /api/realtime/anomalies
    └── stats/route.ts              # GET /api/realtime/stats
```

### Example API Route Implementation

**`app/api/anomalies/route.ts`**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const status = searchParams.get('status') || 'active'
  const severity = searchParams.get('severity')
  const limit = parseInt(searchParams.get('limit') || '50')
  
  let query = supabase
    .from('anomalies')
    .select('*')
    .eq('status', status)
    .order('detected_at', { ascending: false })
    .limit(limit)
  
  if (severity) {
    query = query.eq('severity', severity)
  }
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('anomalies')
    .insert([body])
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data }, { status: 201 })
}
```

**`app/api/interventions/voice/broadcast/route.ts`**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { anomaly_id, zone, message_text, admin_id, admin_name } = await request.json()
  
  // Get speaker zone details
  const { data: speakerZone } = await supabase
    .from('speaker_zones')
    .select('*')
    .eq('zone_code', zone)
    .single()
  
  if (!speakerZone) {
    return NextResponse.json({ error: 'Speaker zone not found' }, { status: 404 })
  }
  
  // Log the intervention
  const { data: intervention, error } = await supabase
    .from('voice_interventions')
    .insert([{
      anomaly_id,
      broadcast_type: 'live_voice',
      zone: speakerZone.zone_name,
      speaker_ids: speakerZone.speaker_ids,
      message_text,
      admin_id,
      admin_name,
      duration_seconds: Math.ceil(message_text.length / 10) // Estimate
    }])
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // TODO: Integrate with actual PA system API
  // await broadcastToSpeakers(speakerZone.speaker_ids, message_text)
  
  // Update anomaly with intervention details
  await supabase
    .from('anomalies')
    .update({
      intervention_type: 'voice',
      intervention_at: new Date().toISOString(),
      intervention_by: admin_name
    })
    .eq('id', anomaly_id)
  
  return NextResponse.json({ data: intervention })
}
```

---

## Component Architecture

### Shared Components (`components/`)

```
components/
├── ui/                             # shadcn/ui components
├── dashboard/
│   ├── stats-card.tsx              # Reusable stat card
│   ├── attendance-chart.tsx        # Chart component
│   └── sparkline.tsx               # Mini trend chart
├── anomalies/
│   ├── anomaly-card.tsx            # Individual anomaly display
│   ├── priority-queue.tsx          # Critical anomalies list
│   ├── warning-queue.tsx           # Warning anomalies list
│   ├── watchlist-queue.tsx         # At-risk monitoring
│   └── quick-actions.tsx           # Action buttons
├── interventions/
│   ├── voice-panel.tsx             # Voice broadcast interface
│   ├── zone-selector.tsx           # Speaker zone picker
│   ├── compliance-monitor.tsx      # Real-time compliance
│   └── evidence-panel.tsx          # Camera feed + context
├── gate/
│   ├── face-recognition-display.tsx # Live face detection
│   ├── entry-approval-card.tsx     # Entry/exit verification
│   ├── visitor-form.tsx            # Visitor registration
│   ├── guardian-verification.tsx   # ID & signature capture
│   └── leave-approval-list.tsx     # Expected exits/returns
├── analytics/
│   ├── student-master-table.tsx    # Student-wise view
│   ├── form-comparison.tsx         # Pivot analysis
│   ├── camera-utilization.tsx      # Hardware analytics
│   └── ai-insights-panel.tsx       # AI recommendations
└── realtime/
    ├── kinetic-map.tsx             # Campus map with locations
    ├── heatmap-overlay.tsx         # Crowd density
    └── student-markers.tsx         # Individual markers
```

### Example Component Implementation

**`components/anomalies/anomaly-card.tsx`**
```typescript
'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, User, Video, Mic, Phone } from 'lucide-react'
import { useState } from 'react'

interface AnomalyCardProps {
  anomaly: {
    id: string
    anomaly_type: string
    severity: 'critical' | 'warning' | 'watchlist'
    user_name: string
    detected_location: string
    expected_location: string
    detected_at: string
    duration_minutes: number
    description: string
  }
  onResolve?: (id: string) => void
  onEscalate?: (id: string) => void
  onVoiceIntervention?: (id: string) => void
}

export function AnomalyCard({ anomaly, onResolve, onEscalate, onVoiceIntervention }: AnomalyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-orange-100 text-orange-800 border-orange-300',
    watchlist: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  }
  
  const severityIcons = {
    critical: '🚨',
    warning: '⚠️',
    watchlist: '🟡'
  }
  
  return (
    <Card className={`border-l-4 ${severityColors[anomaly.severity]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{severityIcons[anomaly.severity]}</span>
            <div>
              <h3 className="font-semibold text-lg">{anomaly.description}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {anomaly.user_name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {anomaly.duration_minutes} mins ago
                </span>
              </div>
            </div>
          </div>
          <Badge variant={anomaly.severity === 'critical' ? 'destructive' : 'secondary'}>
            {anomaly.severity.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Current Location:</span>
            <p className="font-medium flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {anomaly.detected_location}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Expected Location:</span>
            <p className="font-medium">{anomaly.expected_location}</p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onVoiceIntervention?.(anomaly.id)}
          >
            <Mic className="w-4 h-4 mr-1" />
            Voice Intervention
          </Button>
          
          <Button size="sm" variant="outline">
            <Video className="w-4 h-4 mr-1" />
            View Feed
          </Button>
          
          <Button size="sm" variant="outline">
            <Phone className="w-4 h-4 mr-1" />
            Call Prefect
          </Button>
          
          <Button 
            size="sm" 
            variant="default"
            onClick={() => onResolve?.(anomaly.id)}
          >
            ✅ Mark Resolved
          </Button>
          
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => onEscalate?.(anomaly.id)}
          >
            ⬆️ Escalate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Page Structure

### New Pages to Create

```
app/
├── admin/
│   ├── action-queue/
│   │   └── page.tsx                # AI Action Queue Dashboard (PRIMARY)
│   ├── interventions/
│   │   └── page.tsx                # Anomaly Intervention Hub
│   ├── attendance-analytics/
│   │   └── page.tsx                # Deep-Dive Attendance Analytics
│   ├── live-map/
│   │   └── page.tsx                # Real-Time Kinetic Map
│   ├── student-risk/
│   │   └── page.tsx                # Student Risk Dashboard
│   └── insights/
│       └── page.tsx                # AI Insights Dashboard
│
├── gate-security/
│   ├── page.tsx                    # Gate Security Interface (REVAMPED)
│   ├── approvals/
│   │   └── page.tsx                # Pending Approvals Queue
│   └── visitors/
│       └── page.tsx                # Visitor Management
│
└── leave-management/
    ├── page.tsx                    # Leave Requests Dashboard
    ├── request/
    │   └── page.tsx                # Submit Leave Request
    └── calendar/
        └── page.tsx                # Leave Calendar View
```

### Example Page Implementation

**`app/admin/action-queue/page.tsx`**
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnomalyCard } from '@/components/anomalies/anomaly-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function ActionQueuePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  // Fetch active anomalies grouped by severity
  const [criticalData, warningData, watchlistData, resolvedTodayData, statsData] = await Promise.all([
    supabase
      .from('anomalies')
      .select('*')
      .eq('status', 'active')
      .eq('severity', 'critical')
      .order('detected_at', { ascending: false }),
    
    supabase
      .from('anomalies')
      .select('*')
      .eq('status', 'active')
      .eq('severity', 'warning')
      .order('detected_at', { ascending: false }),
    
    supabase
      .from('anomalies')
      .select('*')
      .eq('status', 'active')
      .eq('severity', 'watchlist')
      .order('detected_at', { ascending: false }),
    
    supabase
      .from('anomalies')
      .select('id')
      .eq('status', 'resolved')
      .gte('resolved_at', new Date().toISOString().split('T')[0]),
    
    supabase
      .from('user_registry')
      .select('current_status')
      .eq('person_type', 'student')
  ])
  
  const critical = criticalData.data || []
  const warnings = warningData.data || []
  const watchlist = watchlistData.data || []
  const resolvedToday = resolvedTodayData.data?.length || 0
  
  const students = statsData.data || []
  const onCampus = students.filter(s => s.current_status === 'on_campus').length
  const activeAlerts = critical.length + warnings.length
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-[1600px] mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">SmartSchool Sentinel - AI Action Queue</h1>
              <p className="text-muted-foreground">Don't hunt for problems. The AI assigns them to you.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">User: {user.email}</Badge>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{onCampus}</div>
                  <div className="text-sm text-muted-foreground">🟢 On Campus</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{activeAlerts}</div>
                  <div className="text-sm text-muted-foreground">🟡 Active Alerts</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{critical.length}</div>
                  <div className="text-sm text-muted-foreground">🔴 Critical</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{resolvedToday}</div>
                  <div className="text-sm text-muted-foreground">✅ Auto-Resolved Today</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Critical Queue */}
        {critical.length > 0 && (
          <Card className="border-red-300">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2">
                🔴 PRIORITY QUEUE - SECURITY BREACHES ({critical.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {critical.map(anomaly => (
                <AnomalyCard key={anomaly.id} anomaly={anomaly} />
              ))}
            </CardContent>
          </Card>
        )}
        
        {/* Warning Queue */}
        {warnings.length > 0 && (
          <Card className="border-orange-300">
            <CardHeader className="bg-orange-50">
              <CardTitle className="flex items-center gap-2">
                🟠 WARNING QUEUE - BEHAVIORAL ANOMALIES ({warnings.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {warnings.map(anomaly => (
                <AnomalyCard key={anomaly.id} anomaly={anomaly} />
              ))}
            </CardContent>
          </Card>
        )}
        
        {/* Watchlist Queue */}
        {watchlist.length > 0 && (
          <Card className="border-yellow-300">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="flex items-center gap-2">
                🟡 WATCHLIST - AT-RISK STUDENT MONITORING ({watchlist.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {watchlist.map(anomaly => (
                <AnomalyCard key={anomaly.id} anomaly={anomaly} />
              ))}
            </CardContent>
          </Card>
        )}
        
        {/* Zero Inbox State */}
        {critical.length === 0 && warnings.length === 0 && watchlist.length === 0 && (
          <Card className="border-green-300">
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">ZERO INBOX ACHIEVED!</h2>
              <p className="text-muted-foreground">All anomalies have been resolved. Great work!</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
```

---

## Real-Time Features

### Supabase Realtime Integration

**`lib/supabase/realtime.ts`**
```typescript
import { createClient } from '@/lib/supabase/client'

export function subscribeToAnomalies(callback: (payload: any) => void) {
  const supabase = createClient()
  
  const channel = supabase
    .channel('anomalies-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'anomalies',
        filter: 'status=eq.active'
      },
      callback
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToGateApprovals(callback: (payload: any) => void) {
  const supabase = createClient()
  
  const channel = supabase
    .channel('gate-approvals')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'gate_approval_requests',
        filter: 'status=eq.pending'
      },
      callback
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}
```

### Client Component with Real-Time Updates

```typescript
'use client'

import { useEffect, useState } from 'react'
import { subscribeToAnomalies } from '@/lib/supabase/realtime'

export function LiveAnomalyFeed() {
  const [anomalies, setAnomalies] = useState([])
  
  useEffect(() => {
    const unsubscribe = subscribeToAnomalies((payload) => {
      if (payload.eventType === 'INSERT') {
        setAnomalies(prev => [payload.new, ...prev])
        // Show notification
        new Notification('New Anomaly Detected', {
          body: payload.new.description
        })
      }
    })
    
    return unsubscribe
  }, [])
  
  return (
    <div>
      {/* Render anomalies */}
    </div>
  )
}
```

---

## Background Jobs

### Cron Jobs Setup (using Vercel Cron or similar)

**`app/api/cron/detect-anomalies/route.ts`**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const supabase = await createClient()
  
  // Get current period
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  // Find current period from timetable
  const { data: currentPeriod } = await supabase
    .from('timetable_template')
    .select('*')
    .lte('start_time', `${currentHour}:${currentMinute}`)
    .gte('end_time', `${currentHour}:${currentMinute}`)
    .eq('is_active', true)
    .single()
  
  if (!currentPeriod) {
    return NextResponse.json({ message: 'No active period' })
  }
  
  // Get all students and their current locations
  const { data: students } = await supabase
    .from('student_whereabouts')
    .select('*, user_registry(*)')
  
  // Get expected locations for current period
  const { data: schedules } = await supabase
    .from('class_schedule')
    .select('*')
    .eq('period_number', currentPeriod.period_number)
    .eq('day_of_week', now.getDay())
  
  const anomalies = []
  
  for (const student of students || []) {
    const expectedSchedule = schedules?.find(s => 
      s.expected_student_ids.includes(student.user_id)
    )
    
    if (!expectedSchedule) continue
    
    // Check if student is in wrong location
    if (student.current_location !== expectedSchedule.classroom_location) {
      // Check if anomaly already exists
      const { data: existing } = await supabase
        .from('anomalies')
        .select('id')
        .eq('user_id', student.user_id)
        .eq('status', 'active')
        .eq('anomaly_type', 'class_skipping')
        .single()
      
      if (!existing) {
        anomalies.push({
          anomaly_type: 'class_skipping',
          severity: 'warning',
          user_id: student.user_id,
          user_name: student.user_name,
          detected_location: student.current_location,
          expected_location: expectedSchedule.classroom_location,
          description: `${student.user_name} detected in ${student.current_location} during ${expectedSchedule.subject} class`,
          related_period: currentPeriod.period_number,
          context_data: {
            subject: expectedSchedule.subject,
            teacher_id: expectedSchedule.teacher_id
          }
        })
      }
    }
  }
  
  // Insert anomalies
  if (anomalies.length > 0) {
    await supabase.from('anomalies').insert(anomalies)
  }
  
  return NextResponse.json({ 
    detected: anomalies.length,
    timestamp: now.toISOString()
  })
}
```

**`vercel.json`** (for Vercel Cron)
```json
{
  "crons": [
    {
      "path": "/api/cron/detect-anomalies",
      "schedule": "*/2 * * * *"
    },
    {
      "path": "/api/cron/check-compliance",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/check-late-returns",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/generate-insights",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

---

## Testing Strategy

### Unit Tests (using Jest)

```typescript
// __tests__/api/anomalies.test.ts
import { GET, POST } from '@/app/api/anomalies/route'

describe('Anomalies API', () => {
  it('should fetch active anomalies', async () => {
    const request = new Request('http://localhost:3000/api/anomalies?status=active')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.data).toBeInstanceOf(Array)
  })
  
  it('should create new anomaly', async () => {
    const request = new Request('http://localhost:3000/api/anomalies', {
      method: 'POST',
      body: JSON.stringify({
        anomaly_type: 'class_skipping',
        severity: 'warning',
        user_id: 'STU001',
        user_name: 'Test Student',
        detected_location: 'Corridor A',
        expected_location: 'Classroom 1A',
        description: 'Test anomaly'
      })
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(201)
    expect(data.data.id).toBeDefined()
  })
})
```

### Integration Tests

```typescript
// __tests__/integration/anomaly-workflow.test.ts
describe('Anomaly Detection Workflow', () => {
  it('should detect, intervene, and auto-resolve anomaly', async () => {
    // 1. Create anomaly
    // 2. Send voice intervention
    // 3. Update student location
    // 4. Verify auto-resolution
  })
})
```

### E2E Tests (using Playwright)

```typescript
// e2e/action-queue.spec.ts
import { test, expect } from '@playwright/test'

test('Admin can view and resolve anomalies', async ({ page }) => {
  await page.goto('/admin/action-queue')
  
  // Check dashboard loads
  await expect(page.getByText('AI Action Queue')).toBeVisible()
  
  // Check stats cards
  await expect(page.getByText('On Campus')).toBeVisible()
  
  // Resolve an anomaly
  await page.getByRole('button', { name: 'Mark Resolved' }).first().click()
  await expect(page.getByText('Anomaly resolved')).toBeVisible()
})
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Run all database migrations
- [ ] Set up environment variables
- [ ] Configure Supabase RLS policies
- [ ] Set up cron jobs
- [ ] Test API routes
- [ ] Test real-time subscriptions

### Production Setup
- [ ] Configure SMS gateway (Twilio/Africa's Talking)
- [ ] Set up email service (SendGrid/Resend)
- [ ] Configure PA system API integration
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure analytics (Vercel Analytics)

### Post-Deployment
- [ ] Verify all features working
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Train staff on new features
- [ ] Collect user feedback

---

## Performance Optimization

### Database Indexes
All critical indexes are created in migration scripts:
- Anomaly status and severity
- Gate transaction types
- Leave approval status
- User risk levels

### Caching Strategy
```typescript
// Use React Server Components for automatic caching
// Use Supabase query caching
const { data } = await supabase
  .from('anomalies')
  .select('*')
  .eq('status', 'active')
  .cache(60) // Cache for 60 seconds
```

### Real-Time Optimization
- Use channel filters to reduce payload size
- Implement debouncing for frequent updates
- Use optimistic UI updates

---

## Security Considerations

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies.

### API Route Protection
```typescript
// Verify user authentication
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Verify user role
const { data: profile } = await supabase
  .from('user_profiles')
  .select('role')
  .eq('user_id', user.id)
  .single()

if (profile?.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### Data Validation
Use Zod for request validation:
```typescript
import { z } from 'zod'

const anomalySchema = z.object({
  anomaly_type: z.enum(['class_skipping', 'loitering', ...]),
  severity: z.enum(['critical', 'warning', 'watchlist']),
  user_id: z.string(),
  // ...
})

const body = anomalySchema.parse(await request.json())
```

---

**Document Version:** 1.0  
**Last Updated:** January 23, 2026  
**Status:** Ready for Implementation
