ADMIN PORTAL 2.0 - COMPLETE LAYOUT
2.1 THE AI ACTION QUEUE (Home Dashboard)
Philosophy: "Don't hunt for problems. The AI assigns them to you."
Goal: Achieve "Zero Inbox" - all issues either handled or auto-resolved.
Layout Structure
┌────────────────────────────────────────────────────────────────────┐
│  SMARTSCHOOL SENTINEL - AI ACTION QUEUE           [User ▼] [⚙️]   │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📊 Dashboard Stats:                                               │
│  🟢 1,127 On Campus  |  🟡 43 Active Alerts  |  🔴 2 Critical     │
│                                                                     │
│  ┌─────────────┬─────────────┬─────────────┬──────────────────┐  │
│  │ 🔴 CRITICAL │ 🟠 WARNINGS │ 🟡 WATCHLIST│ ✅ AUTO-RESOLVED │  │
│  │    (2)      │    (23)     │    (18)     │   (156 today)    │  │
│  └─────────────┴─────────────┴─────────────┴──────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 🔴 PRIORITY QUEUE - SECURITY BREACHES                        │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │                                                               │ │
│  │  #402 🚨 Unknown Face Detected at Main Gate                 │ │
│  │  📸 Camera 4 (Main Gate) • 2 mins ago                       │ │
│  │  [📹 VIEW FEED] [🚨 SOUND ALARM] [📞 CALL SECURITY]         │ │
│  │  [✅ MARK RESOLVED]                                          │ │
│  │  ──────────────────────────────────────────────────────────  │ │
│  │                                                               │ │
│  │  #398 ⚠️ Student at Perimeter (Out of Bounds)              │ │
│  │  👤 James Mutua (Form 3B) • Library Hallway                │ │
│  │  ⏱️ 15 mins in restricted zone                              │ │
│  │  [📹 VIEW FEED] [🎤 VOICE INTERVENE] [📱 NOTIFY PREFECT]   │ │
│  │  [⬆️ ESCALATE TO SENIOR STAFF]                              │ │
│  │                                                               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 🟠 WARNING QUEUE - BEHAVIORAL ANOMALIES                      │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │                                                               │ │
│  │  #395 📍 Class Skipping Detected                            │ │
│  │  👤 Sarah Wanjiku (Form 2A) • Should be in Math Class      │ │
│  │  📍 Currently: Dining Hall • 8 mins ago                     │ │
│  │  Expected: Classroom 2A (Math - Period 3)                    │ │
│  │  [📊 VIEW TIMELINE] [🎤 VOICE INTERVENTION]                 │ │
│  │  [✅ AUTO-RESOLVE IF COMPLIES]                              │ │
│  │  ──────────────────────────────────────────────────────────  │ │
│  │                                                               │ │
│  │  #389 🍽️ Double Meal Attempt Blocked                       │ │
│  │  👤 John Kamau (Form 1C) • Lunch already logged            │ │
│  │  Status: ✅ System auto-blocked second entry                │ │
│  │  Action: No intervention needed (fraud prevented)            │ │
│  │  [📝 MARK REVIEWED] [⚠️ FLAG FOR COUNSELOR]                │ │
│  │                                                               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 🟡 WATCHLIST - AT-RISK STUDENT MONITORING                   │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │                                                               │ │
│  │  📊 AI Pattern Alert: Michael Omondi (Form 4A)              │ │
│  │  Concerning Trends Detected:                                 │ │
│  │  • Attendance dropped 15% this week (from 98% to 83%)        │ │
│  │  • Skipped 2 meals yesterday (breakfast, lunch)             │ │
│  │  • Increased time in dormitory (6 hours vs. 2 hour avg)     │ │
│  │  • Last seen: Dorm Room B-14 (20 mins ago)                  │ │
│  │                                                               │ │
│  │  [📋 VIEW FULL PROFILE] [👨‍⚕️ NOTIFY COUNSELOR]             │ │
│  │  [📱 ALERT PARENT] [📝 ADD NOTE]                            │ │
│  │                                                               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  [🔄 REFRESH] [⚙️ CONFIGURE RULES] [📊 VIEW ANALYTICS]            │
└────────────────────────────────────────────────────────────────────┘
The Self-Fixing Loop (Complete Workflow)
Example Scenario: Student loitering in corridor during class time
Step 1: TRIGGER (14:35:22)

Camera 4 (Library Hallway) detects James Kamau (Form 3A)
Time check: 14:35 = Period 7 (Math Class)
Expected location: Classroom 3B
Actual location: Corridor B (Library Hallway)
Result: MISMATCH = Anomaly created

Step 2: TASK CREATION (14:35:23)
json{
  "anomaly_id": 402,
  "type": "class_skipping",
  "severity": "warning",
  "student": {
    "id": 1089,
    "name": "James Kamau",
    "form": "3A",
    "photo_url": "/photos/students/1089.jpg"
  },
  "location": {
    "current": "Corridor B (Library Hallway)",
    "expected": "Classroom 3B",
    "camera_id": "CAM-004"
  },
  "duration": "0 minutes",
  "detected_at": "2026-01-21T14:35:22Z",
  "status": "active"
}
Dashboard Update:

New task appears in 🟠 WARNING QUEUE
Alert sound plays (optional)
Browser notification: "New anomaly: James Kamau - Class Skipping"

Step 3: ADMIN REVIEW (14:37:00)
Admin clicks on task #402:

Left Panel: Task details
Right Panel:

Live camera feed from Corridor B
Snapshot of James (captured at detection)
Student profile (photo, form, house, recent history)
Timeline: Where James has been today



Step 4: ADMIN INTERVENTION (14:37:45)
Admin decides to use voice intervention:

Clicks "🎤 VOICE INTERVENTION" button
Zone selector auto-selects: "Corridor B (West Wing)" - 3 speakers
Admin holds "HOLD TO SPEAK" button
Speaks: "James Kamau, please return to Mathematics class in Room 3B immediately."
Releases button
Message broadcasts through 3 Corridor B speakers
System logs intervention:

json{
  "audio_log_id": 5478,
  "broadcast_type": "live_voice",
  "zone": "Corridor B",
  "message": "James Kamau, please return to Mathematics class...",
  "audio_file_url": "/audio_logs/5478.mp3",
  "admin_id": 12,
  "duration": 7,
  "timestamp": "2026-01-21T14:37:45Z"
}
Step 5: COMPLIANCE MONITORING (14:38:00 - 14:42:30)
System actively monitors James' location:
TimeLocationStatus14:38:15Corridor B⏳ Still in wrong location14:39:30Corridor B⏳ Still in wrong location14:40:45Classroom 3B Door (CAM-015)🟡 Moving to correct location14:41:10Inside Classroom 3B (CAM-016)✅ COMPLIANCE ACHIEVED
Step 6: AUTO-RESOLUTION (14:41:15)
System detects James has entered Classroom 3B:

Updates anomaly record:

json{
  "anomaly_id": 402,
  "status": "resolved",
  "resolution_method": "auto",
  "resolved_at": "2026-01-21T14:41:10Z",
  "compliance_time_seconds": 348,
  "admin_action": "Voice intervention via Corridor B speakers"
}

Task moves from WARNING QUEUE to ✅ AUTO-RESOLVED
Admin receives notification: "✅ James Kamau has returned to class"
Task card turns green with checkmark
Complete audit trail saved for review

Step 7: ESCALATION PATH (If Non-Compliant)
If James had NOT returned to class within 10 minutes:

Automatic Escalation (14:47:45)

Task severity upgrades: 🟠 WARNING → 🔴 CRITICAL
Moves to top of PRIORITY QUEUE
Additional notifications:

SMS to Class Teacher: "James Kamau has not returned to class after intervention"
Alert to Housemaster
Flag in student's record




Secondary Intervention Options

Call House Prefect
Send security staff to locate student
Contact parent via SMS
Disciplinary note in student file



Key Features of the Action Queue:
✅ Smart Prioritization: Critical security always at top, then warnings, then watchlist
✅ Context-Rich Display: Every task shows full context (photo, timeline, suggested actions)
✅ One-Click Interventions: Voice, SMS, alerts - all single button
✅ Auto-Resolution Detection: System monitors cameras to verify compliance
✅ Bulk Actions: Handle multiple similar issues together
✅ Historical Patterns: View student's past anomalies to spot repeat behaviors
✅ Configurable Rules: Customize what triggers alerts and how they're prioritized

2.2 DEEP-DIVE ATTENDANCE ANALYTICS
Purpose: The Single Source of Truth for all attendance data.
Navigation: Tabbed interface with multiple view perspectives
┌────────────────────────────────────────────────────────────────────┐
│  ATTENDANCE ANALYTICS                    [Export ▼] [Reports ▼]    │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [📊 All Students] [📋 Form View] [🏫 Stream View] [📹 Camera]    │
│  [🎯 Events/Meals] [📈 Trends] [🔍 Search]                         │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
View A: Student-Wise Master Table
┌──────────────────────────────────────────────────────────────────────────────────┐
│  STUDENT MASTER VIEW                          [Export Excel] [Generate Report]   │
├──────────────────────────────────────────────────────────────────────────────────┤
│  Filters: [Form: All ▼] [Stream: All ▼] [Status: All ▼] [Date: Today ▼]        │
│  Search: [_______________________________] 🔍                                     │
├──────┬───────────────┬──────┬────────┬──────────┬───────┬────────────┬──────────┤
│ ID   │ Name + Photo  │ Form │ Status │ Today %  │ Punct.│ 30-Day     │ Last Seen│
│      │               │      │        │          │ Score │ Sparkline  │          │
├──────┼───────────────┼──────┼────────┼──────────┼───────┼────────────┼──────────┤
│ 1001 │ 🧑 John Doe   │ 4A   │🟢 Live │  100%    │ 98.5  │ ▁▃▅▇█▇▅▃  │ Class 4A │
│      │ [Photo]       │      │        │  (8/8)   │       │            │ 2 min ago│
├──────┼───────────────┼──────┼────────┼──────────┼───────┼────────────┼──────────┤
│ 1002 │ 👧 Sarah W.   │ 3B   │🔴 Miss │  62.5%   │ 87.3  │ ▁▁▃▃▁▁▁▁  │ Dining   │
│      │ [Photo]       │      │        │  (5/8)   │       │            │ 15min ago│
├──────┼───────────────┼──────┼────────┼──────────┼───────┼────────────┼──────────┤
│ 1003 │ 🧑 James M.   │ 2C   │🟡 Query│  87.5%   │ 92.1  │ ▇▇▅▇▇▃▅▅  │ Sick Bay │
│      │ [Photo]       │      │        │  (7/8)   │       │            │ 1 hour   │
└──────┴───────────────┴──────┴────────┴──────────┴───────┴────────────┴──────────┘

Legend:
🟢 Live    = Currently in correct location for scheduled activity
🔴 Missing = Not detected where expected or absent
🟡 Query   = Anomaly under review or valid excuse pending

Interactive Features:
- Click name → Full student profile with complete timeline
- Click photo → Face recognition history + similar faces
- Click sparkline → 90-day detailed attendance graph with annotations
- Click status badge → Quick actions (mark excused, send alert, view details)
- Hover any cell → Tooltip with additional context
Key Metrics Explained:

Today's %: Attended classes ÷ expected classes × 100
Punctuality Score: On-time arrivals ÷ total arrivals × 100 (rolling 30 days)
Sparkline: Miniature line graph showing daily attendance percentage over 30 days
Last Seen: Most recent camera detection with time elapsed


View B: Form & Stream Pivot (Comparison Analysis)
┌────────────────────────────────────────────────────────────────────┐
│  FORM & STREAM COMPARISON ANALYSIS                                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Left Panel: Tree View          Right Panel: Visual Analytics      │
│  ┌──────────────────────┐       ┌─────────────────────────────┐  │
│  │ 📂 Form 1 (320)      │       │  Attendance Rate Comparison │  │
│  │   ├─ North (160)     │       │  ┌────────────────────────┐ │  │
│  │   └─ South (160)     │       │  │ █████████ 94% North    │ │  │
│  │                       │       │  │ ██████ 87% South       │ │  │
│  │ 📂 Form 2 (315)      │       │  └────────────────────────┘ │  │
│  │   ├─ North (155)     │       │                             │  │
│  │   └─ South (160)     │       │  ⚠️ Alert: 7% disparity    │  │
│  │                       │       │  Recommendation: Investigate│  │
│  │ 📂 Form 3 (298)      │       │  Form 1 South              │  │
│  │   ├─ North (149)     │       │                             │  │
│  │   └─ South (149)     │       │  Weekly Heatmap:            │  │
│  │                       │       │  Mon Tue Wed Thu Fri        │  │
│  │ 📂 Form 4 (267)      │       │  █▓▓▓▒ Form 1 North        │  │
│  │   ├─ North (132)     │       │  ▓▓▓▒░ Form 1 South        │  │
│  │   └─ South (135)     │       │                             │  │
│  │                       │       │  Peak Issue: Fridays        │  │
│  └──────────────────────┘       │  12% drop across all forms  │  │
│                                  └─────────────────────────────┘  │
│                                                                     │
│  [📊 Generate Comparison Report] [📧 Email to HODs]                │
└────────────────────────────────────────────────────────────────────┘
AI-Generated Insights:
💡 INSIGHTS DETECTED:

1. Form 1 South has 7% lower attendance than North
   → Possible causes: Different class teacher, schedule conflicts
   → Recommendation: Interview Form 1 South class teacher
   → Action: [Schedule Meeting] [View Teacher Schedule]

2. Fridays show 12% attendance drop across ALL forms
   → Pattern consistent for 8 consecutive weeks
   → Possible cause: Friday afternoon fatigue, anticipation of weekend
   → Recommendation: Consider Friday schedule adjustments
   → Action: [View Friday Schedules] [Propose Changes]

3. Form 4A perfect attendance streak: 23 days
   → Outstanding performance by class teacher Mrs. Njeri
   → Recommendation: Recognition and best practice sharing
   → Action: [Send Commendation] [Request Best Practices Report]

View C: Camera-Wise Hardware Utilization
┌──────────────────────────────────────────────────────────────────────────┐
│  CAMERA HARDWARE UTILIZATION & PERFORMANCE ANALYTICS                     │
├──────────────────────────────────────────────────────────────────────────┤
│  Date Range: [Last 7 Days ▼]                    [Export Report]          │
├──────────┬─────────────┬────────┬────────┬──────────┬────────────────────┤
│ Camera   │ Location    │ Today  │ Unique │ Peak     │ 24-Hour Activity   │
│ ID       │             │ Detect │ Faces  │ Time     │ Heat Chart         │
├──────────┼─────────────┼────────┼────────┼──────────┼────────────────────┤
│ CAM-001  │ Main Gate   │ 1,247  │  892   │ 8:15 AM  │ ▁▁███▇▅▃▁▁▁▁▁▁    │
│ ✅       │ Entry       │        │        │          │ 6am        6pm     │
│          │             │        │        │          │ Normal pattern     │
├──────────┼─────────────┼────────┼────────┼──────────┼────────────────────┤
│ CAM-004  │ Library     │  324   │  187   │ 3:45 PM  │ ▁▁▁▃▅███▇▃▁▁▁▁    │
│ ✅       │ Hallway     │        │        │          │ Afternoon peak     │
│          │             │        │        │          │ Normal pattern     │
├──────────┼─────────────┼────────┼────────┼──────────┼────────────────────┤
│ CAM-012  │ Back Gate   │  178   │  156   │ 2:30 PM  │ ▁▁▁▁▁▁▁▅███▇▃▁    │
│ 🚨       │ (Service)   │        │        │          │ CLASS TIME SPIKE!  │
│          │             │        │        │          │ ⚠️ INVESTIGATION   │
├──────────┼─────────────┼────────┼────────┼──────────┼────────────────────┤
│ CAM-028  │ Library     │   12   │    8   │11:00 AM  │ ▁▁▁▁▁▁▁▁▁▁▁▁▁▁    │
│ ⚠️       │ Study Area  │        │        │          │ UNDERUTILIZED      │
│          │ (Back)      │        │        │          │ Consider relocate  │
└──────────┴─────────────┴────────┴────────┴──────────┴────────────────────┘

🚨 ALERTS & RECOMMENDATIONS:

1. CAM-012 (Back Gate): Suspicious Activity Pattern
   • 50+ detections during class hours (10 AM - 2 PM)
   • 87% are registered students (not visitors)
   • Possible sneak-out location
   • Recommendation: Increase security presence, add signage
   • Action: [Notify Security] [Schedule Patrol] [Review Footage]

2. CAM-028 (Library Back): Underutilized Asset
   • Only 12 detections today (vs. 300+ average for library cameras)
   • Camera positioned in rarely-used study area
   • ROI concern: Hardware not earning its value
   • Recommendation: Relocate to higher-traffic area (e.g., dining hall)
   • Action: [Schedule Relocation] [Get Cost Estimate]

View D: Event & Meal Attendance
┌──────────────────────────────────────────────────────────────────┐
│  EVENT ATTENDANCE VERIFICATION                                    │
│  Event: Morning Assembly                                         │
│  Date: 2026-01-21  Time: 7:30 AM  Expected: 1,200              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────┐  ┌──────────────────────────┐  │
│  │ ✅ PRESENT (1,156 / 96.3%)  │  │ ❌ MISSING (44 / 3.7%)  │  │
│  ├─────────────────────────────┤  ├──────────────────────────┤  │
│  │                             │  │                          │  │
│  │ All students detected       │  │ 1. John Kamau (F2A)     │  │
│  │ between 7:25-7:45 AM        │  │ 2. Sarah Wanjiku (F3B)  │  │
│  │                             │  │ 3. Michael O. (F1C)     │  │
│  │ Detection Window:           │  │ 4. Grace Muthoni (F4A)  │  │
│  │ • Start: 7:25 AM            │  │ ...                     │  │
│  │ • End: 7:45 AM              │  │ (40 more students)      │  │
│  │ • Method: Assembly Ground   │  │                          │  │
│  │   cameras (CAM-20 to 25)    │  │ Known Absences: 2       │  │
│  │                             │  │ • Medical: 1            │  │
│  │ [📥 Export Present List]    │  │ • Approved Leave: 1     │  │
│  │                             │  │                          │  │
│  │                             │  │ Unaccounted: 42 ⚠️      │  │
│  │                             │  │                          │  │
│  │                             │  │ [📱 WhatsApp Parents]   │  │
│  │                             │  │ [📧 Email Teachers]     │  │
│  │                             │  │ [📋 Mark Excused]       │  │
│  │                             │  │ [🚨 Flag for Follow-up] │  │
│  └─────────────────────────────┘  └──────────────────────────┘  │
│                                                                   │
│  Quick Actions:                                                   │
│  [📱 Send Bulk SMS to 42 Parents: "Your child was absent..."]   │
│  [📧 Email Report to Deputy Head]                                │
│  [📋 Generate Absentee Report for Records]                       │
│  [🔄 Schedule Follow-Up (1 hour): Check if students arrived]    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

MEAL ATTENDANCE TRACKING:

┌──────────────────────────────────────────────────────────────────┐
│  LUNCH ATTENDANCE - Wednesday, January 21, 2026                  │
│  Time Window: 1:00 PM - 1:45 PM  Expected: 1,200               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Detection Method: Dining Hall Cameras (CAM-08, 09, 10, 11)     │
│                                                                   │
│  Results:                                                         │
│  ✅ Attended: 1,187 students (98.9%)                             │
│  ❌ Missed: 13 students (1.1%)                                   │
│                                                                   │
│  Missing Students Investigation:                                  │
│  • 8 students in Medical Center (valid excuse)                   │
│  • 3 students in Library (flagged - should be eating)           │
│  • 2 students NOT DETECTED ANYWHERE (⚠️ serious concern)         │
│                                                                   │
│  Automatic Actions Taken:                                         │
│  ✅ Notifications sent to library students: "Proceed to lunch"   │
│  🚨 Critical alert for 2 undetected students                     │
│  📱 SMS sent to parents of 2 undetected students                 │
│  👮 Security dispatched to locate 2 students                      │
│                                                                   │
│  Food Service Optimization:                                       │
│  📊 Actual attendance: 1,187                                     │
│  📉 Kitchen prepared for: 1,250 (5% buffer)                      │
│  ✅ Waste minimized: 63 meals saved (previous waste: ~150)       │
│  💰 Daily savings: ~3,150 KES                                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

2.3 ANOMALIES & INTERVENTION HUB
Purpose: Dedicated incident command center for real-time intervention.
Layout: Split-pane interface (Incident Feed + Evidence Panel)
┌────────────────────────────────────────────────────────────────────────┐
│  ANOMALY INTERVENTION CENTER                             [Exit] [⚙️]   │
├───────────────────────┬────────────────────────────────────────────────┤
│  LEFT: INCIDENT FEED  │  RIGHT: EVIDENCE & CONTROL PANEL               │
│  ┌─────────────────┐  │  ┌──────────────────────────────────────────┐ │
│  │ 🔴 ACTIVE (23)  │  │  │  📸 LIVE CAMERA FEED: Corridor B         │ │
│  ├─────────────────┤  │  │  ┌────────────────────────────────────┐ │ │
│  │                 │  │  │  │                                    │ │ │
│  │ 🟠 Loitering    │  │  │  │    [LIVE VIDEO STREAM]             │ │ │
│  │ 📍 Corridor B   │  │  │  │    🎥 Camera 8 - West Wing         │ │ │
│  │ 👤 James K. 3A  │  │  │  │                                    │ │ │
│  │ ⏱️ 15 minutes   │  │  │  │    [Student highlighted with       │ │ │
│  │ [SELECT >]      │  │  │  │     green bounding box]            │ │ │
│  │─────────────────│  │  │  │                                    │ │ │
│  │ 🟠 Uniform      │  │  │  └────────────────────────────────────┘ │ │
│  │ 📍 Dining Hall  │  │  │                                          │ │
│  │ 👤 Mary J. 2C   │  │  │  STUDENT CONTEXT:                        │ │
│  │ ⏱️ 8 minutes    │  │  │  Name: James Kamani                      │ │
│  │ [SELECT]        │  │  │  Form: 3A | House: Livingstone           │ │
│  │─────────────────│  │  │  Current Status: ⚠️ Out of Class         │ │
│  │ 🟡 Missing      │  │  │  Expected Location: Math (Room 4B)       │ │
│  │ 👤 John D. 4B   │  │  │  Reason for Alert: Detected in Corridor  │ │
│  │ ⏱️ 2 hours      │  │  │                    during class time     │ │
│  │ [SELECT]        │  │  │                                          │ │
│  │                 │  │  │  RECENT TIMELINE:                        │ │
│  │ [Show All]      │  │  │  14:25 - Class 3A (Math period started)  │ │
│  └─────────────────┘  │  │  14:30 - Detected in Corridor B          │ │
│                        │  │  14:35 - Still in Corridor B (current)   │ │
│  🟡 WATCHLIST (18)     │  │                                          │ │
│  ✅ RESOLVED (156)     │  │  ─────────────────────────────────────── │ │
│                        │  │                                          │ │
│                        │  │  🎤 VOICE INTERVENTION PANEL             │ │
│                        │  │  ┌────────────────────────────────────┐ │ │
│                        │  │  │ Broadcast Zone: Corridor B         │ │ │
│                        │  │  │ Speakers: 3 units (CB-01,02,03)    │ │ │
│                        │  │  │                                    │ │ │
│                        │  │  │ Method: [⦿ Live Voice]             │ │ │
│                        │  │  │         [○ Text-to-Speech]         │ │ │
│                        │  │  │         [○ Pre-Recorded]           │ │ │
│                        │  │  │                                    │ │ │
│                        │  │  │ [████ HOLD TO SPEAK ████]          │ │ │
│                        │  │  │ [████ Release to stop ████]        │ │ │
│                        │  │  │                                    │ │ │
│                        │  │  │ 🔴 Recording: ● 00:00              │ │ │
│                        │  │  │ (Auto-saved for audit trail)       │ │ │
│                        │  │  └────────────────────────────────────┘ │ │
│                        │  │                                          │ │
│                        │  │  QUICK ACTIONS:                          │ │
│                        │  │  [🔔 Alert House Prefect]                │ │
│                        │  │  [📞 Call Housemaster]                   │ │
│                        │  │  [📱 SMS Parent]                         │ │
│                        │  │  [📝 Add Disciplinary Note]              │ │
│                        │  │  [✅ Mark Excused (valid reason)]        │ │
│                        │  │  [⬆️ Escalate to Critical]               │ │
│                        │  │                                          │ │
│                        │  │  RESOLUTION TRACKING:                    │ │
│                        │  │  ⏱️ Monitoring for compliance...         │ │
│                        │  │  ✅ Auto-resolve if James enters Room 4B │ │
│                        │  │     within next 5 minutes                │ │
│                        │  │  ⚠️ Escalate if still non-compliant     │ │
│                        │  │     after 10 minutes                     │ │
│                        │  │                                          │ │
│                        │  │  [✅ MARK RESOLVED] [❌ CLOSE]           │ │
│                        │  └──────────────────────────────────────────┘ │
└───────────────────────┴────────────────────────────────────────────────┘
Voice-Down Control Panel - Detailed Breakdown
Method 1: Live Voice (Hold-to-Talk)
┌──────────────────────────────────────────────────────────────────┐
│  🎤 LIVE VOICE INTERVENTION                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Microphone Source: [Computer Microphone ▼]                      │
│  Volume Level: [▓▓▓▓▓▓▓▓░░] 80%                                 │
│                                                                   │
│  Broadcast Zone: [Corridor B (West Wing) ▼]                      │
│  Active Speakers: 3 units                                        │
│  • CB-01: Corridor B North End                                   │
│  • CB-02: Corridor B Center                                      │
│  • CB-03: Corridor B South End                                   │
│                                                                   │
│  Instructions:                                                    │
│  1. Hold the button below                                        │
│  2. Speak clearly into your microphone                           │
│  3. Release when finished                                        │
│                                                                   │
│  [████████████████████████████████]                              │
│  [████ HOLD TO BROADCAST ████████]                              │
│  [████████████████████████████████]                              │
│                                                                   │
│  Recording Status: ⚪ Ready                                       │
│  Audio Quality: ████████░░ Good                                 │
│                                                                   │
│  ⚠️ This broadcast will be recorded for audit purposes           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
Method 2: Text-to-Speech (AI Voice)
┌──────────────────────────────────────────────────────────────────┐
│  💬 TEXT-TO-SPEECH BROADCAST                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Message to Broadcast:                                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Students in Corridor B, please clear the hallway and     │   │
│  │ proceed to your scheduled classes immediately.            │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│  Character Count: 92 / 500                                       │
│                                                                   │
│  Voice Settings:                                                  │
│  Gender: [⦿ Male  ○ Female]                                      │
│  Language: [English ▼] (Also available: Swahili)                 │
│  Speed: [Normal ▼] (Options: Slow, Normal, Fast)                 │
│  Tone: [Neutral ▼] (Options: Neutral, Firm, Friendly)            │
│                                                                   │
│  [🔊 PREVIEW MESSAGE]  [📣 BROADCAST NOW]                        │
│                                                                   │
│  Benefits of TTS:                                                 │
│  • Anonymous (students don't recognize voice)                    │
│  • Consistent tone and clarity                                   │
│  • Multi-language support                                        │
│  • No need for quality microphone                                │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
Method 3: Pre-Recorded Messages
┌──────────────────────────────────────────────────────────────────┐
│  📻 PRE-RECORDED MESSAGE LIBRARY                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  QUICK ACTIONS (One-Click Playback):                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ [▶️ Please proceed to your scheduled class]                │ │
│  │ Duration: 4 seconds | Used: 47 times today                 │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ [▶️ Dining hall is now closed]                             │ │
│  │ Duration: 3 seconds | Used: 3 times today                  │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ [▶️ Assembly will begin in 5 minutes]                      │ │
│  │ Duration: 5 seconds | Used: 1 time today                   │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ [▶️ All students to dormitories immediately]               │ │
│  │ Duration: 5 seconds | Used: 0 times today                  │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ [▶️ Evening study time has begun]                          │ │
│  │ Duration: 4 seconds | Used: 1 time today                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  CUSTOM MESSAGES:                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ [▶️ Form 4 students report to assembly ground]             │ │
│  │ Created by: Mrs. Njeri | Date: 2026-01-15                  │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ [▶️ Library closes in 10 minutes]                          │ │
│  │ Created by: Mr. Kamau | Date: 2026-01-10                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  [➕ RECORD NEW MESSAGE] [✏️ EDIT LIBRARY] [🗑️ DELETE]          │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
Method 4: Sound Effects Library
┌──────────────────────────────────────────────────────────────────┐
│  🔔 SOUND EFFECTS & ALERTS                                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ROUTINE SOUNDS:                                                  │
│  [🔔 School Bell - Class Change]        (3 rings, 8 seconds)    │
│  [🔔 Break Bell]                        (2 rings, 5 seconds)    │
│  [📯 Attention Chime]                   (Pleasant tone, 3 sec)  │
│  [🎵 National Anthem]                   (Full, 90 seconds)      │
│                                                                   │
│  EMERGENCY SOUNDS:                                                │
│  [🚨 Fire Alarm Siren]                  (Continuous, manual stop)│
│  [⚠️ Emergency Alert Beep]              (Rapid beeps, 10 sec)   │
│  [🔴 Evacuation Alarm]                  (Loud siren, continuous) │
│                                                                   │
│  BEHAVIORAL CUES:                                                 │
│  [⚠️ Warning Beep]                      (3 short beeps)         │
│  [✅ Positive Chime]                    (Uplifting tone)        │
│  [📢 Attention Getter]                  (2-tone alert)          │
│                                                                   │
│  Note: Emergency sounds require confirmation before playback     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

2.4 CCTV MATRIX (Live Surveillance Wall)
Purpose: Traditional security monitoring enhanced with AI overlays.
┌────────────────────────────────────────────────────────────────────────┐
│  LIVE SURVEILLANCE MATRIX                    [Grid: 3x3 ▼] [⚙️]       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┬──────────────┬──────────────┐                       │
│  │ CAM-001      │ CAM-004      │ CAM-007      │                       │
│  │ Main Gate    │ Corridor B   │ Dining Hall  │                       │
│  │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │                       │
│  │ │ [VIDEO]  │ │ │ [VIDEO]  │ │ │ [VIDEO]  │ │                       │
│  │ │  Live    │ │ │  Live    │ │ │  Live    │ │                       │
│  │ │  stream  │ │ │  🟢👤×3  │ │ │  🟢👤×47 │ │                       │
│  │ │  with AI │ │ │  Names:  │ │ │  Eating  │ │                       │
│  │ │  overlay │ │ │  James K │ │ │          │ │                       │
│  │ │          │ │ │  Sarah W │ │ │  [ZOOM]  │ │                       │
│  │ └──────────┘ │ └──────────┘ │ └──────────┘ │                       │
│  │ 🔊 🎤 🔍 📹  │ │ 🔊 🎤 🔍 📹  │ │ 🔊 🎤 🔍 📹  │                       │
│  ├──────────────┼──────────────┼──────────────┤                       │
│  │ CAM-010      │ CAM-013      │ CAM-016      │                       │
│  │ Form 4A      │ Library      │ Sports Field │                       │
│  │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │                       │
│  │ │ [VIDEO]  │ │ │ [VIDEO]  │ │ │ [VIDEO]  │ │                       │
│  │ │  🟢👤×28 │ │ │  🟢👤×15 │ │ │  🟢👤×0  │ │                       │
│  │ │  Math    │ │ │  Study   │ │ │  Empty   │ │                       │
│  │ │  Class   │ │ │  Session │ │ │          │ │                       │
│  │ └──────────┘ │ └──────────┘ │ └──────────┘ │                       │
│  │ 🔊 🎤 🔍 📹  │ │ 🔊 🎤 🔍 📹  │ │ 🔊 🎤 🔍 📹  │                       │
│  ├──────────────┼──────────────┼──────────────┤                       │
│  │ CAM-020      │ CAM-024      │ CAM-028      │                       │
│  │ Assembly     │ Dorm Block A │ Sick Bay     │                       │
│  │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │                       │
│  │ │ [VIDEO]  │ │ │ [VIDEO]  │ │ │ [VIDEO]  │ │                       │
│  │ │  Empty   │ │ │  🟢👤×12 │ │ │  🟢👤×1  │ │                       │
│  │ │          │ │ │  Rest    │ │ │  Patient │ │                       │
│  │ └──────────┘ │ └──────────┘ │ └──────────┘ │                       │
│  │ 🔊 🎤 🔍 📹  │ │ 🔊 🎤 🔍 📹  │ │ 🔊 🎤 🔍 📹  │                       │
│  └──────────────┴──────────────┴──────────────┘                       │
│                                                                         │
│  Legend:                                                                │
│  🔊 Listen (Unmute microphone)     🎤 Speak (Talk through speaker)     │
│  🔍 Zoom (Fullscreen view)         📹 Record (Start recording)         │
│  🟢 Face detected with name        👤 Person count                     │
│                                                                         │
│  Grid Options: [1 Big] [2×2] [3×3] [4×4] [1 Big + 5 Small]            │
│  [🔄 Auto-Rotate Every 30s] [⏸️ Pause Rotation]                        │
└────────────────────────────────────────────────────────────────────────┘
AI Overlay Features:

Face Bounding Boxes:

Green squares automatically drawn around every detected face
Real-time tracking as people move
Confidence score displayed (e.g., 98.7%)


Name Labels:

Student/staff name floats above their head
Form and house information (e.g., "James K. - Form 3A")
Click name to open profile


Person Counting:

Live count of people in frame
Distinguishes between students, staff, visitors, unknown
Capacity alerts (e.g., "47/50 dining hall capacity")


Motion Detection:

Highlights unusual movements
Flags stationary people (potential medical issue)
Tracks entry/exit patterns



Interactive Controls:

🔊 Listen Mode: Click to unmute camera microphone, hear conversations (for supervision, not espionage)
🎤 Speak Mode: Click to activate speaker at that location, admin can speak through it
🔍 Zoom Mode: Expand camera to fullscreen for detailed viewing
📹 Record Mode: Start recording specific camera feed (auto-saved with timestamp)

Alert Indicators:

🔴 Red Border: Critical alert (unknown face, perimeter breach)
🟠 Orange Border: Warning (anomaly detected, requires attention)
🟢 Green: Normal operation
⚫ Gray: Camera offline or error

Grid Layout Options:

1 Big: Single camera fullscreen (incident monitoring)
2×2: Four cameras (focus on key areas)
3×3: Nine cameras (standard overview)
4×4: Sixteen cameras (comprehensive monitoring)
1 Big + 5 Small: Primary camera large, five context cameras small (active incident + surrounding areas)


2.5 REAL-TIME KINETIC MAP
Purpose: Live, animated visualization of student movement across campus.
Technology: SVG-based vector graphics with Framer Motion animations
┌────────────────────────────────────────────────────────────────────┐
│  LIVE CAMPUS MAP                    [Layers ▼] [Zoom +/-] [Reset] │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                   SCHOOL CAMPUS FLOOR PLAN                   │  │
│  │                     (SVG Interactive Map)                    │  │
│  │                                                              │  │
│  │    ┌──────────┐                      ┌─────────────┐        │  │
│  │    │  Main    │  👤👤 (moving dots) │  Dining Hall│        │  │
│  │    │ Building │  ════════════════►  │   👤👤👤   │        │  │
│  │    │[4A][4B]  │                      │             │        │  │
│  │    │[3A][3B]  │   ┌──────────────┐  └─────────────┘        │  │
│  │    └──────────┘   │   Library    │                          │  │
│  │         ▲         │     👤       │  ┌──────────────┐        │  │
│  │         ║         └──────────────┘  │ Dormitories  │        │  │
│  │    👤👤👤 (dots                      │  🟢🟢🟢🟢   │        │  │
│  │         ║    moving)                 │  🟡🔴       │        │  │
│  │    ┌────┴────┐                       └──────────────┘        │  │
│  │    │  Main   │   🚨 OUT OF BOUNDS                           │  │
│  │    │  Gate   │   ╔════════════════╗                         │  │
│  │    │  🚪     │   ║  Perimeter     ║                         │  │
│  │    └─────────┘   ║  Fence (RED)   ║                         │  │
│  │                  ╚════════════════╝                         │  │
│  │                                                              │  │
│  │  Legend:                                                     │  │
│  │  👤 Student dot (click for details)                         │  │
│  │  Animated dots = Currently moving                           │  │
│  │  Static dots = Stationary                                   │  │
│  │  🟢 Green = In correct location                             │  │
│  │  🟡 Yellow = Needs attention                                │  │
│  │  🔴 Red = Alert/Missing/Out of bounds                       │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─ Hover Tooltip (when hovering over a dot) ──────────────────┐  │
│  │ John Kamau (Form 2A)                                        │  │
│  │ 📍 Walking: Dining Hall → Classroom 2A                      │  │
│  │ 🕐 ETA: 2 minutes                                           │  │
│  │ Status: 🟢 On schedule for Period 5 (Science)               │  │
│  │ [View Full Timeline] [View Profile]                         │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Layer Controls:                                                    │
│  [✅ Show Students (1,127)]  [✅ Show Movement Routes]              │
│  [☐ Show Cameras (50)]       [☐ Show Speakers (30)]                │
│  [☐ Heatmap Mode]            [☐ Zone Boundaries]                   │
│                                                                     │
│  Quick Filters:                                                     │
│  [All Students] [My Form 4A Only] [Out of Place] [On Leave]       │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
How the "Moving" Animation Works
Technical Implementation:
Step 1: SVG Map Creation
xml<!-- SVG structure (simplified) -->
<svg width="1200" height="800" viewBox="0 0 1200 800">
  <!-- Buildings -->
  <g id="main-building">
    <rect x="100" y="100" width="300" height="400" fill="#e5e7eb"/>
    <g id="classroom-4a" data-location="classroom-4a" data-coords="150,150">
      <rect x="150" y="150" width="80" height="60" fill="#ffffff"/>
      <text x="190" y="185">4A</text>
    </g>
    <g id="classroom-4b" data-location="classroom-4b" data-coords="250,150">
      <rect x="250" y="150" width="80" height="60" fill="#ffffff"/>
      <text x="290" y="185">4B</text>
    </g>
  </g>
  
  <!-- Paths between locations -->
  <path id="dining-to-4a" d="M 800,400 L 600,400 L 400,300 L 190,180" 
        stroke="#cbd5e1" stroke-width="4" fill="none"/>
  
  <!-- Restricted zones -->
  <rect id="perimeter-fence" x="50" y="50" width="1100" height="700" 
        fill="none" stroke="red" stroke-width="3" stroke-dasharray="10,5"/>
</svg>
Step 2: Student Dot Component (React + Framer Motion)
typescriptinterface StudentDot {
  student_id: number;
  name: string;
  current_location: string;
  coordinates: {x: number, y: number};
  status: 'correct' | 'attention' | 'alert';
}

const MovingStudentDot: React.FC<StudentDot> = ({ student, newLocation }) => {
  const [position, setPosition] = useState(student.coordinates);
  
  // Subscribe to real-time location updates
  useEffect(() => {
    const subscription = supabase
      .channel(`student-${student.student_id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'current_locations',
        filter: `student_id=eq.${student.student_id}`
      }, (payload) => {
        const newCoords = getCoordinatesForLocation(payload.new.location);
        animateToNewPosition(newCoords);
      })
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, [student.student_id]);
  
  const animateToNewPosition = (newCoords: {x: number, y: number}) => {
    setPosition(newCoords);
  };
  
  return (
    <motion.circle
      cx={position.x}
      cy={position.y}
      r={8}
      fill={getColorForStatus(student.status)}
      animate={{ cx: position.x, cy: position.y }}
      transition={{
        duration: 2,
        ease: "easeInOut"
      }}
      whileHover={{ scale: 1.5 }}
      onClick={() => showStudentProfile(student)}
    >
      <title>{student.name}</title>
    </motion.circle>
  );
};
Step 3: Path Calculation
typescript// Calculate smooth path between two locations
function calculatePath(from: Location, to: Location): Point[] {
  // Use A* pathfinding or simple interpolation
  const waypoints = getWaypointsFromMap(from, to);
  
  // Example: Direct interpolation
  return [
    { x: from.x, y: from.y },
    ...waypoints,
    { x: to.x, y: to.y }
  ];
}

// Animate along path
<motion.div
  animate={{
    x: path.map(p => p.x),
    y: path.map(p => p.y)
  }}
  transition={{
    duration: path.length * 0.5, // 0.5 seconds per waypoint
    ease: "linear"
  }}
/>
Step 4: Real-Time Updates
typescript// When camera detects student at new location:
// Backend publishes to Supabase Realtime

// Database update triggers real-time broadcast
UPDATE current_locations 
SET location = 'classroom-4a', 
    coordinates = '{x: 190, y: 180}',
    updated_at = NOW()
WHERE student_id = 1089;

// Frontend receives update via WebSocket
// React component re-renders with new coordinates
// Framer Motion smoothly animates dot from old position to new position
// Entire process: <1 second from camera detection to map animation
Advanced Map Features
1. Heatmap Layer
Toggle "Heatmap Mode" to visualize crowd density:

🔴 Red = Very crowded (50+ people)
🟠 Orange = Crowded (20-50 people)
🟡 Yellow = Moderate (10-20 people)
🟢 Green = Light (5-10 people)
🔵 Blue/White = Empty (<5 people)

Updates every 30 seconds based on camera detections
Helps identify bottlenecks, popular areas, underutilized spaces
2. Zone Fencing (Restricted Areas)
Red boundaries drawn around out-of-bounds areas:
- Construction zones
- Service areas
- Perimeter fence
- Staff-only areas

If any student dot crosses red line:
→ Instant alert with red screen flash
→ Alarm sound plays
→ Notification sent to admin
→ Camera at that zone auto-focuses
3. Room Zoom & Occupancy
Click any classroom/room on map:
→ Zooms into that SVG group
→ Shows list of current occupants
→ Displays capacity: "28/40 students present"
→ Expected vs. Actual comparison
→ Quick action: "Mark all as attended"
4. Movement Routes
Toggle "Show Movement Routes" to see:
- Dotted lines connecting student's last 5 locations
- Time stamps at each waypoint
- Average speed of movement
- Identifies students who are wandering (possible distress)

STUDENT MOVEMENT & PERMISSION MANAGEMENT
3.1 LEAVE MANAGEMENT SYSTEM
Purpose: Complete digital workflow for students leaving campus temporarily.
Leave Types & Approval Requirements
Leave TypeDescriptionApproval ChainMax DurationDay LeaveLeave and return same dayClass Teacher → Admin< 12 hoursWeekend LeaveFriday evening to SundayClass Teacher → Housemaster2-3 daysExtended LeaveMultiple days (family emergency)Class Teacher → Deputy Head → Principal3+ daysMedical LeaveHospital visit or treatmentNurse → AdminVariableEvent/FunctionSchool trip or inter-school eventOrganizing Teacher → AdminVariableEmergency LeaveUrgent family matterDeputy Head (expedited process)Variable
Digital Leave Request Workflow
Step 1: Request Creation
THREE WAYS TO CREATE REQUEST:

1. ADMIN PORTAL (Teacher/Admin Creates)
┌──────────────────────────────────────────────────────────────────┐
│  CREATE LEAVE REQUEST                                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Student Selection:                                               │
│  [Search by name or ID: Sarah Wanjiku_________] 🔍               │
│  Selected: Sarah Wanjiku (Form 3B, ID: 3245)                     │
│                                                                   │
│  Leave Type: [Day Leave ▼]                                       │
│  Options: Day Leave, Weekend, Extended, Medical, Emergency        │
│                                                                   │
│  Duration:                                                        │
│  Start: [📅 2026-01-25] [08:00]                                 │
│  End:   [📅 2026-01-27] [18:00]                                 │
│                                                                   │
│  Destination:                                                     │
│  Location: [Home___________________________]                     │
│  Town/City: [Nairobi______________________]                     │
│                                                                   │
│  Reason:                                                          │
│  [Family function - attending cousin's wedding_____________]     │
│  [______________________________________________________]         │
│                                                                   │
│  Guardian Information:                                            │
│  Name:         [Mrs. Jane Wanjiku______________]                 │
│  Relationship: [Mother ▼]                                        │
│  Phone:        [+254 712 345 678______________]                 │
│  ID Number:    [12345678______________________]                 │
│                                                                   │
│  Attach Documents: [📎 Choose File] parent_consent.pdf           │
│                                                                   │
│  Transport Arrangement:                                           │
│  ⦿ Guardian will pick up                                         │
│  ○ School transport                                              │
│  ○ Public transport (requires additional approval)               │
│                                                                   │
│  Auto-Notifications:                                              │
│  ☑️ Send WhatsApp to parent for confirmation                     │
│  ☑️ Email approval workflow to Class Teacher                     │
│  ☑️ SMS reminder to student 1 day before leave                   │
│                                                                   │
│  [💾 SAVE DRAFT] [📤 SUBMIT FOR APPROVAL] [❌ CANCEL]            │
└──────────────────────────────────────────────────────────────────┘

2. PARENT PORTAL (Parent Submits Directly)
- Parent logs in via SMS OTP
- Fills same form (auto-populated with student/guardian info)
- Attaches consent letter
- Submits to school for approval

3. BULK UPLOAD (For Group Events)
- Upload Excel file with columns: Student ID, Reason, Dates
- System auto-creates leave requests for all students
- Common for inter-school competitions, trips, functions
Step 2: Approval Workflow
MULTI-LEVEL APPROVAL CHAIN:

Leave Request #234 - Sarah Wanjiku
─────────────────────────────────

Stage 1: Class Teacher Review (Due: 24 hours)
├─ Checks: Academic standing, recent behavior, attendance record
├─ Actions: ✅ Approve | ❌ Reject | 💬 Request More Info
└─ Status: ✅ Approved by Mr. Kamau (Jan 22, 10:30 AM)
    Comment: "Excellent student, no concerns. Approved."

Stage 2: Housemaster Review (Due: 24 hours)
├─ Checks: Dorm conduct, any pending issues, room cleanliness
├─ Actions: ✅ Approve | ❌ Reject | 💬 Request More Info
└─ Status: ✅ Approved by Mrs. Njeri (Jan 22, 2:15 PM)
    Comment: "Model student in dormitory. Approved."

Stage 3: Deputy Head Final Approval (Due: 24 hours)
├─ Checks: Overall clearance, school obligations, previous leaves
├─ Actions: ✅ Approve | ❌ Reject | 💬 Request More Info
└─ Status: ✅ Approved by Mr. Omondi (Jan 22, 4:00 PM)
    Comment: "All clear. Have a good weekend, Sarah."

FINAL STATUS: ✅ FULLY APPROVED
Parent notified: Jan 22, 4:05 PM (SMS + Email)
Student notified: Jan 22, 4:05 PM (Portal notification)
Email Notification to Each Approver:
Subject: Leave Request Approval Needed - Sarah Wanjiku (Form 3B)

Dear Mr. Kamau,

A leave request requires your approval:

Student: Sarah Wanjiku (Form 3B)
Leave Type: Weekend Leave
Duration: January 25-27, 2026
Reason: Family function (wedding)
Guardian: Mrs. Jane Wanjiku (Mother)

[✅ APPROVE] [❌ REJECT] [💬 REQUEST MORE INFO]

View full details: https://smartschool.nsait.ke/leave/234

This request will auto-escalate if not reviewed within 24 hours.
Step 3: Parent Confirmation
Once fully approved, parent receives:
📱 SMS to Parent:
─────────────────
SmartSchool Sentinel: Sarah's leave request (#234) has been APPROVED.

Details:
- Departure: Fri Jan 25, 8:00 AM
- Return: Sun Jan 27, 6:00 PM
- Pickup: Main Gate

What to bring:
✅ Your ID (12345678)
✅ This SMS as reference
✅ Signed consent letter

Questions? Call +254 717 308 051

Link: https://smartschool.nsait.ke/leave/234
Step 4: Gate Exit Process
FRIDAY, JAN 25 - 8:00 AM - MAIN GATE

┌─────────────────────────────────────────────────────────────┐
│  GATE TABLET DISPLAY (Guard View)                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🟢 FACE RECOGNIZED: Sarah Wanjiku                          │
│  ✅ EXPECTED EXIT - Leave #234                              │
│                                                              │
│  Leave Details:                                              │
│  • Type: Weekend Home Visit                                 │
│  • Duration: Jan 25-27, 2026                                │
│  • Return Due: Sunday 6:00 PM                               │
│  • Reason: Family function                                  │
│                                                              │
│  Guardian Information:                                       │
│  • Name: Mrs. Jane Wanjiku (Mother)                         │
│  • Phone: +254 712 345 678                                  │
│  • ID: 12345678                                             │
│  • Status: ✅ Pre-verified                                  │
│                                                              │
│  VERIFICATION CHECKLIST:                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. ☐ Verify guardian ID matches: 12345678              │ │
│  │ 2. ☐ Capture guardian photo                            │ │
│  │ 3. ☐ Guardian signs digitally on tablet                │ │
│  │ 4. ☐ Confirm pickup time recorded                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [📸 CAPTURE GUARDIAN PHOTO]                                │
│  [✍️ DIGITAL SIGNATURE PAD]                                 │
│  [✅ CONFIRM EXIT]                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Guard actions:
1. Checks Mrs. Wanjiku's ID (matches 12345678) ✅
2. Takes photo of guardian using tablet camera ✅
3. Guardian signs on tablet screen ✅
4. Guard clicks "Confirm Exit" ✅

System actions:
1. Logs exit: "Sarah Wanjiku left with Mrs. Wanjiku at 8:12 AM"
2. Updates leave status: "In Progress - Student Off Campus"
3. Sends SMS to parent: "Sarah left school safely at 8:12 AM"
4. Sets return reminder: "Sunday 4:00 PM - Remind parent"
Step 5: Return Monitoring & Auto-Resolution
RETURN MONITORING TIMELINE:

Saturday 4:00 PM (2 hours before expected return)
├─ System sends SMS to parent:
   "Reminder: Sarah is expected back at school by 6:00 PM tomorrow."

Sunday 6:00 PM (Expected return time)
├─ System actively monitors Main Gate camera
├─ Status: Waiting for Sarah to return

Sunday 6:05 PM - SARAH ARRIVES AT GATE
├─ Camera detects Sarah's face
├─ System checks: "Does Sarah have active leave #234?"
├─ Result: YES → This is an expected return
│
System Display on Gate Tablet:
┌─────────────────────────────────────────────────────────┐
│  ✅ EXPECTED RETURN                                     │
│  Sarah Wanjiku - Leave #234                             │
│  Weekend Home Visit                                     │
│  Status: ON TIME (Due 6:00 PM, Arrived 6:05 PM)        │
│                                                          │
│  [✅ CONFIRM RETURN] (Guard clicks)                     │
└─────────────────────────────────────────────────────────┘
│
Automatic Actions:
├─ Leave status updated: "Completed - Returned Successfully"
├─ SMS to parent: "Sarah returned to school safely at 6:05 PM"
├─ Student marked as: "On Campus" in all systems
├─ Complete audit trail saved
└─ Guard receives: "✅ Return logged successfully"

LATE RETURN SCENARIO (If Sarah didn't return):

Sunday 7:00 PM (1 hour overdue)
├─ Status changes to: "⚠️ OVERDUE"
├─ Auto-actions triggered:
│   ├─ SMS to parent: "Sarah has not returned. Please confirm status."
│   ├─ Alert to Duty Master
│   └─ Flag in system as "Overdue Return"

Sunday 8:00 PM (2 hours overdue)
├─ Status escalates to: "🚨 VERY LATE"
├─ Auto-actions:
│   ├─ Phone call attempt to parent (automated)
│   ├─ SMS to Deputy Head
│   ├─ Security team notified
│   └─ Incident log created

Sunday 9:00 PM (3 hours overdue)
├─ Status: "🔴 CRITICAL - Missing Student Protocol"
├─ Full escalation:
│   ├─ Principal notified
│   ├─ Parents called by admin staff
│   ├─ Formal incident report generated
│   └─ Police notification prepared (if no contact)

3.2 BULK LEAVE FOR EVENTS
Scenario: Inter-School Science Competition - 24 students
┌──────────────────────────────────────────────────────────────────┐
│  BULK LEAVE REQUEST - GROUP EVENT                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Event Information:                                               │
│  Event Name: [Inter-School Science Competition__________]        │
│  Organizer:  [St. Mary's School, Nairobi____________]           │
│  Date:       [📅 2026-02-05]                                     │
│  Departure:  [07:00]  Return: [17:00]                           │
│  Location:   [St. Mary's School, Westlands, Nairobi]            │
│                                                                   │
│  Student Selection:                                               │
│  ⦿ Upload Excel List    ○ Select by Form    ○ Manual Select     │
│                                                                   │
│  📎 Upload Participant List:                                     │
│  [Choose File: competition_participants.xlsx] ✅ Uploaded        │
│                                                                   │
│  Preview: 24 students loaded                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ID   │ Name              │ Form │ Parent Contact        │   │
│  ├──────┼───────────────────┼──────┼───────────────────────┤   │
│  │ 1001 │ John Kamau        │ 4A   │ +254 712 111 222      │   │
│  │ 1023 │ Sarah Wanjiku     │ 3B   │ +254 712 333 444      │   │
│  │ 1045 │ Michael Omondi    │ 4B   │ +254 712 555 666      │   │
│  │ ...  │ ...               │ ...  │ ...                   │   │
│  └──────┴───────────────────┴──────┴───────────────────────┘   │
│                                                                   │
│  Chaperones/Teachers:                                             │
│  [+ Add Teacher]                                                  │
│  Selected: • Mr. Kamau (Biology)                                 │
│           • Mrs. Njeri (Chemistry)                               │
│                                                                   │
│  Transport:                                                       │
│  Vehicle: [School Bus #1 ▼]                                      │
│  Driver:  [James Mwangi_________]                                │
│  Driver Phone: [+254 700 111 222]                                │
│                                                                   │
│  GPS Tracking:                                                    │
│  ☑️ Enable live GPS tracking (via chaperone phone app)           │
│  ☑️ Send location updates to parents every 30 minutes            │
│                                                                   │
│  Automated Actions:                                               │
│  ☑️ Notify all 24 parents via SMS                                │
│  ☑️ Create absence exception (auto-excused from classes)         │
│  ☑️ Require check-in at destination venue                        │
│  ☑️ Require check-in upon return to school                       │
│                                                                   │
│  [✅ CREATE GROUP LEAVE] [❌ CANCEL]                              │
└──────────────────────────────────────────────────────────────────┘

PARENT COMMUNICATION (Auto-sent to all 24 parents):

📱 SMS:
SmartSchool: Your child [Student Name] is participating in Inter-School 
Science Competition on Feb 5. Departure 7 AM, Return 5 PM. Chaperones: 
Mr. Kamau & Mrs. Njeri. Track live: https://smartschool.nsait.ke/event/445

LIVE EVENT TRACKING (Parent View):

┌──────────────────────────────────────────────────────────────────┐
│  EVENT TRACKING: Inter-School Science Competition                 │
│  Status: 🟢 IN PROGRESS                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📍 LIVE LOCATION MAP                                            │
│  [MAP showing school bus location moving on road]                │
│                                                                   │
│  Timeline:                                                        │
│  ✅ 7:00 AM - Departed school (All 24 students boarded)          │
│  ✅ 7:15 AM - En route (GPS: Thika Road)                         │
│  ✅ 7:45 AM - En route (GPS: Limuru Road)                        │
│  ✅ 8:30 AM - Arrived St. Mary's School ✅                       │
│  ✅ 8:35 AM - Check-in confirmed (24/24 students present)        │
│  ⏳ 12:00 PM - Lunch break (awaiting check-in)                   │
│  ⏳ 4:30 PM - Expected departure from venue                      │
│  ⏳ 5:30 PM - Expected return to school                          │
│                                                                   │
│  Chaperone Contact:                                               │
│  Mr. Kamau: +254 700 123 456                                     │
│  Mrs. Njeri: +254 700 234 567                                    │
│                                                                   │
│  [📞 CALL CHAPERONE] [💬 SEND MESSAGE]                           │
└──────────────────────────────────────────────────────────────────┘

3.3 HOLIDAY STAYOVER MANAGEMENT
Purpose: Track students remaining on campus during school holidays.
┌──────────────────────────────────────────────────────────────────┐
│  HOLIDAY MANAGEMENT: April Mid-Term Break                         │
│  Duration: April 15-21, 2026 (7 days)                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  PHASE 1: COLLECT STUDENT INTENTIONS (Deadline: April 10)        │
│  ─────────────────────────────────────────────────────────────   │
│                                                                   │
│  Form Sent to All Students:                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ "Will you be going home for mid-term break?"                │  │
│  │                                                              │  │
│  │ ⦿ Yes, I will go home                                       │  │
│  │   (Guardian must arrange pickup)                            │  │
│  │                                                              │  │
│  │ ⦿ No, I will stay in school                                 │  │
│  │   (Requires parent consent + payment if applicable)         │  │
│  │                                                              │  │
│  │ Reason for staying (if applicable):                         │  │
│  │ [_________________________________________________]          │  │
│  │                                                              │  │
│  │ [SUBMIT RESPONSE]                                           │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Response Summary:                                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Total Students: 1,200                                       │  │
│  │ Responded: 1,156 (96.3%)                                    │  │
│  │ Not Responded: 44 (3.7%) 🚨                                 │  │
│  │                                                              │  │
│  │ Going Home: 1,089 students (91%)                            │  │
│  │ Staying: 67 students (6%)                                   │  │
│  │                                                              │  │
│  │ [📧 SEND REMINDER TO 44 NON-RESPONDERS]                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  PHASE 2: STAYOVER APPROVAL (Auto + Manual)                      │
│  ─────────────────────────────────────────────────────────────   │
│                                                                   │
│  Auto-Approval Conditions:                                        │
│  ✅ Parent consent form received                                 │
│  ✅ Payment for holiday boarding (if applicable)                 │
│  ✅ No disciplinary holds                                        │
│  ✅ Medical clearance (if needed)                                │
│                                                                   │
│  Status:                                                          │
│  • Auto-Approved: 58 students (87%)                              │
│  • Pending Manual Review: 9 students (13%)                       │
│                                                                   │
│  Pending Review Cases:                                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 1. John Kamau (Form 2A) - Missing parent consent          │  │
│  │    Action: [📱 SMS Parent] [📧 Email Form] [✅ Approve]   │  │
│  │                                                              │  │
│  │ 2. Grace Muthoni (Form 3B) - Outstanding fees             │  │
│  │    Action: [View Account] [✅ Approve] [❌ Deny]           │  │
│  │                                                              │  │
│  │ 3. Michael Omondi (Form 4A) - Disciplinary hold           │  │
│  │    Action: [View Case] [Clear Hold] [❌ Deny]              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  PHASE 3: HOLIDAY OPERATIONS SETUP                               │
│  ─────────────────────────────────────────────────────────────   │
│                                                                   │
│  Stayover List: 67 students                                       │
│  Staff On Duty: Mr. Kamau (Duty Master), 2 Security Guards       │
│  Meal Schedule: Modified (2 meals/day - Lunch & Dinner)          │
│  Curfew: 8:00 PM (Strictly enforced)                             │
│  Emergency Contact: +254 712 999 000                              │
│                                                                   │
│  [📧 Email Stayover List to Staff]                               │
│  [🔄 Sync to Access Control System]                              │
│  [📱 Send Info Pack to Stayover Students]                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

HOLIDAY MONITORING DASHBOARD:

┌──────────────────────────────────────────────────────────────────┐
│  HOLIDAY CAMPUS MONITORING (Live)                                 │
│  Date: April 17, 2026 | Day 3 of 7                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Campus Population: 67/67 students accounted for ✅              │
│                                                                   │
│  Today's Activity Log:                                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 8:00 AM  - Wake-up bell                                    │  │
│  │ 12:00 PM - Lunch: 64/67 attended                           │  │
│  │            Missing: John K., Sarah W., Michael O.          │  │
│  │            Status: All 3 confirmed sick (medical center)   │  │
│  │                                                              │  │
│  │ 3:00 PM  - Recreation: 45 students (sports field)         │  │
│  │            22 students (library/dorms)                     │  │
│  │                                                              │  │
│  │ 7:00 PM  - Dinner: 67/67 attended ✅                       │  │
│  │                                                              │  │
│  │ 8:00 PM  - Curfew check: 67/67 in dormitories ✅          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Current Location Breakdown:                                      │
│  • Library: 12 students                                          │
│  • Sports Field: 0 students                                      │
│  • Dining Hall: 0 students                                       │
│  • Dormitories: 55 students                                      │
│  • Medical Center: 0 students                                    │
│                                                                   │
│  🚨 Alerts: NONE (All students in authorized zones)              │
│                                                                   │
│  [📊 VIEW FULL TIMELINE] [📧 DAILY REPORT TO PARENTS]            │
└──────────────────────────────────────────────────────────────────┘

AUTO-GENERATED PARENT UPDATE (Sent daily at 8 PM):

📱 SMS to Parent:
Holiday Update - Day 3/7

Your child [Student Name] is safe and well:
✅ Attended all meals today
✅ Participated in activities
✅ In dormitory for curfew (8 PM)

No concerns. Next update: Tomorrow 8 PM

Questions? Call Duty Master: +254 712 999 000

GATE MANAGEMENT SYSTEM
4.1 GATE GUARD TABLET - COMPLETE INTERFACE
┌────────────────────────────────────────────────────────────────────┐
│  SMARTSCHOOL SENTINEL - GATE CONTROL                                │
│  📍 Main Gate | 🕐 14:35:22 | Guard: Samuel Mwangi                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  LIVE CAMERA FEED:                                                  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                                                               │ │
│  │    [LIVE VIDEO - Main Gate Camera]                           │ │
│  │                                                               │ │
│  │    Detection Zone: █████████████████████████                 │ │
│  │                   (3 meters in front of gate)                │ │
│  │                                                               │ │
│  │    Waiting for person to enter detection zone...             │ │
│  │                                                               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Recent Activity (Last 10):                                        │
│  14:32 - ✅ John Kamau (Form 4A) - Entry                           │
│  14:28 - ✅ Mr. Ochieng (Teacher) - Entry                          │
│  14:15 - 🚨 Unknown Face - DENIED (Visitor registered)             │
│  14:10 - ✅ Sarah Wanjiku (Form 3B) - Exit (Leave #234)            │
│  14:05 - ✅ Grace Muthoni (Form 2A) - Entry                        │
│  13:58 - ✅ Supply Truck - Service Gate redirected                 │
│  13:45 - ✅ Michael Omondi (Form 1C) - Entry (Late arrival)        │
│  13:30 - ✅ Parent Visitor - Mrs. Kamau (Registered)               │
│  13:15 - ✅ James Mutua (Form 3B) - Entry                          │
│  13:00 - ✅ Lunch delivery - Authorized vendor                     │
│                                                                     │
│  [📊 View Full Log] [🚨 Emergency Unlock All] [⚙️ Settings]        │
└────────────────────────────────────────────────────────────────────┘

WHEN PERSON ENTERS DETECTION ZONE - 6 SCENARIOS:
SCENARIO 1: Authorized Student Entry (Normal)
┌──────────────────────────────────────────────────────────────────┐
│  🟢 DETECTION: Face Recognized                                    │
│  ┌────────────┬──────────────────────────────────────────────┐   │
│  │   📸       │  ✅ AUTHORIZED STUDENT                        │   │
│  │  [Photo]   │  Name: John Kamau                            │   │
│  │   John K.  │  ID: 1089                                    │   │
│  │            │  Form: 4A | House: Churchill                 │   │
│  │            │  Status: 🟢 REGULAR STUDENT (No leave)       │   │
│  │            │  Time Check: 2:35 PM (Within school hours)   │   │
│  │            │                                               │   │
│  │            │  ✅ ENTRY APPROVED                            │   │
│  │            │  Action: Wave student through                 │   │
│  └────────────┴──────────────────────────────────────────────┘   │
│                                                                   │
│  [✅ CONFIRM ENTRY] (Auto-clicks in 3 seconds)                   │
│                                                                   │
│  System Auto-Actions:                                             │
│  ✅ Entry logged at 2:35 PM                                      │
│  ✅ Location updated: "On Campus"                                │
│  ✅ No alerts (normal entry)                                     │
└──────────────────────────────────────────────────────────────────┘

Guard action: Simply wave student through (< 2 seconds total)
SCENARIO 2: Student on Approved Leave (Exit)
┌──────────────────────────────────────────────────────────────────┐
│  🟢 DETECTION: Face Recognized                                    │
│  ┌────────────┬──────────────────────────────────────────────┐   │
│  │   📸       │  ✅ EXPECTED EXIT - APPROVED LEAVE            │   │
│  │  [Photo]   │  Name: Sarah Wanjiku                         │   │
│  │  Sarah W.  │  ID: 3245                                    │   │
│  │            │  Form: 3B | House: Livingstone               │   │
│  │            │  Status: 🟢 ON APPROVED LEAVE                │   │
│  │            │                                               │   │
│  │            │  Leave Details: #234                          │   │
│  │            │  • Type: Weekend Home Visit                  │   │
│  │            │  • Duration: Jan 25-27, 2026                 │   │
│  │            │  • Return Due: Sunday 6:00 PM                │   │
│  │            │  • Reason: Family function                   │   │
│  └────────────┴──────────────────────────────────────────────┘   │
│                                                                   │
│  GUARDIAN VERIFICATION REQUIRED:                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Expected Guardian: Mrs. Jane Wanjiku (Mother)              │  │
│  │ ID Number: 12345678                                        │  │
│  │ Phone: +254 712 345 678                                    │  │
│  │                                                              │  │
│  │ Please verify:                                              │  │
│  │ ☐ Check guardian's ID (must match 12345678)               │  │
│  │ ☐ Capture guardian photo                                  │  │
│  │ ☐ Guardian signature on tablet                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  [📸 CAPTURE GUARDIAN PHOTO] [✍️ SIGNATURE PAD]                  │
│  [✅ CONFIRM EXIT] [❌ DENY EXIT] [📞 CALL ADMIN]                │
└──────────────────────────────────────────────────────────────────┘

Guard actions:
1. Ask guardian for ID
2. Verify ID matches 12345678
3. Click "Capture Guardian Photo" → Takes photo
4. Click "Signature Pad" → Guardian signs
5. Click "Confirm Exit"

System auto-logs everything + SMS to parent
SCENARIO 3: Student Without Leave Approval (Unauthorized Exit)
┌──────────────────────────────────────────────────────────────────┐
│  🚨 ALERT: Unauthorized Exit Attempt                              │
│  ┌────────────┬──────────────────────────────────────────────┐   │
│  │   📸       │  ❌ NO LEAVE APPROVAL                         │   │
│  │  [Photo]   │  Name: Michael Omondi                        │   │
│  │ Michael O. │  ID: 1134                                    │   │
│  │            │  Form: 2C | House: Rhodes                    │   │
│  │            │  Status: 🚨 ATTEMPTING UNAUTHORIZED EXIT     │   │
│  │            │                                               │   │
│  │            │  ⚠️ NO ACTIVE LEAVE REQUEST                  │   │
│  │            │  Current Time: 3:45 PM (Class time)          │   │
│  │            │                                               │   │
│  │            │  🚫 DO NOT ALLOW EXIT                        │   │
│  └────────────┴──────────────────────────────────────────────┘   │
│                                                                   │
│  [🛑 STOP] Alert Sound Playing: ⚠️ BEEP BEEP BEEP                │
│                                                                   │
│  Actions:                                                         │
│  [🚫 DENY EXIT - Send Back to Campus]                            │
│  [📞 REQUEST ADMIN APPROVAL] (Emergency exit?)                   │
│  [📝 LOG INCIDENT] (Attempt recorded)                            │
│                                                                   │
│  Auto-Actions Triggered:                                          │
│  ✅ Screenshot sent to admin dashboard                           │
│  ✅ Alert notification to security team                          │
│  ✅ Incident logged for review                                   │
└──────────────────────────────────────────────────────────────────┘

Guard script:
"I'm sorry Michael, you don't have exit approval. Please return 
to campus. If this is an emergency, I'll contact administration."

If genuine emergency:
Guard clicks "Request Admin Approval" → Admin portal shows request
→ Admin reviews → Approves or denies → Tablet updates instantly
SCENARIO 4: Unknown Face (Unauthorized Person)
┌──────────────────────────────────────────────────────────────────┐
│  🚨 CRITICAL ALERT: UNKNOWN PERSON DETECTED                       │
│  ┌────────────┬──────────────────────────────────────────────┐   │
│  │   📸       │  ❌ FACE NOT RECOGNIZED                       │   │
│  │  [Photo]   │  Status: NOT IN SYSTEM DATABASE              │   │
│  │  Unknown   │                                               │   │
│  │  Person    │  ⚠️ UNAUTHORIZED INDIVIDUAL                   │   │
│  │            │                                               │   │
│  │            │  ACTIONS REQUIRED:                            │   │
│  │            │  1. Stop person immediately                   │   │
│  │            │  2. Request identification                    │   │
│  │            │  3. Verify with administration                │   │
│  └────────────┴──────────────────────────────────────────────┘   │
│                                                                   │
│  [🚨 SOUND ALARM] Loud Alert: 🚨 BEEEEP BEEEEP BEEEEP            │
│                                                                   │
│  Quick Actions:                                                   │
│  [🚫 DENY ENTRY] (Unauthorized - Turn away)                      │
│  [📝 REGISTER AS VISITOR] (Legitimate visitor)                   │
│  [📞 CALL SECURITY] (Suspicious person)                          │
│  [📞 CALL ADMIN] (Verify if expected)                            │
│                                                                   │
│  Auto-Actions Already Taken:                                      │
│  ✅ Screenshot captured and sent to admin                        │
│  ✅ Security team alerted                                        │
│  ✅ Timestamp and location logged                                │
│  ⏳ Awaiting guard response...                                   │
└──────────────────────────────────────────────────────────────────┘

Guard script:
"Please wait here. May I see your identification?"

Person response determines next action:
→ Legitimate visitor? Click "Register as Visitor"
→ Suspicious? Click "Call Security"
→ Delivery/vendor? Verify and register
SCENARIO 5: Registered Visitor (Within Visit Window)
┌──────────────────────────────────────────────────────────────────┐
│  🟢 DETECTION: Registered Visitor                                 │
│  ┌────────────┬──────────────────────────────────────────────┐   │
│  │   📸       │  ✅ APPROVED VISITOR                          │   │
│  │  [Photo]   │  Name: Mr. John Doe                          │   │
│  │  John D.   │  ID: 98765432                                │   │
│  │            │  Phone: +254 700 111 222                     │   │
│  │            │  Status: 🟢 ACTIVE VISITOR                   │   │
│  │            │                                               │   │
│  │            │  Visit Details:                              │   │
│  │            │  • Purpose: Meeting with Principal           │   │
│  │            │  • Entry Time: 2:00 PM                       │   │
│  │            │  • Expected Exit: 4:00 PM (2 hours)          │   │
│  │            │  • Current Time: 2:30 PM                     │   │
│  │            │  • Time Remaining: 1 hour 30 mins            │   │
│  │            │                                               │   │
│  │            │  ✅ WITHIN APPROVED WINDOW                    │   │
│  └────────────┴──────────────────────────────────────────────┘   │
│                                                                   │
│  [✅ ALLOW ENTRY] [📝 EXTEND VISIT] [📞 CALL HOST]               │
│                                                                   │
│  System Actions:                                                  │
│  ✅ Entry logged                                                 │
│  ✅ Host (Principal) notified: "Your visitor has arrived"        │
│  ⏰ Auto-reminder at 3:45 PM (15 mins before expected exit)      │
└──────────────────────────────────────────────────────────────────┘

Guard action: Wave visitor through
SCENARIO 6: Visitor Overstaying (Exit After Expected Time)
┌──────────────────────────────────────────────────────────────────┐
│  ⚠️ NOTICE: Visitor Overstay                                      │
│  ┌────────────┬──────────────────────────────────────────────┐   │
│  │   📸       │  ⚠️ VISIT EXCEEDED EXPECTED DURATION          │   │
│  │  [Photo]   │  Name: Mr. John Doe                          │   │
│  │  John D.   │  Entry: 2:00 PM                              │   │
│  │            │  Expected Exit: 4:00 PM                      │   │
│  │            │  Actual Exit: 5:30 PM                        │   │
│  │            │  Overstay: 1 hour 30 minutes                 │   │
│  │            │                                               │   │
│  │            │  Status: 🟡 OVERSTAYED (Not critical)        │   │
│  └────────────┴──────────────────────────────────────────────┘   │
│                                                                   │
│  [✅ CONFIRM EXIT] (Normal - just overstayed)                     │
│  [📝 LOG NOTE] (Add reason for overstay)                          │
│  [🚨 REPORT ISSUE] (Suspicious - escalate)                        │
│                                                                   │
│  System Actions:                                                  │
│  ✅ Exit logged with overstay flag                               │
│  ✅ Host notified of overstay                                    │
│  📊 Analytics: Track average visit duration                      │
└──────────────────────────────────────────────────────────────────┘

4.2 VISITOR REGISTRATION FLOW
┌──────────────────────────────────────────────────────────────────┐
│  REGISTER NEW VISITOR                                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Step 1: Photo Capture                                            │
│  ┌────────────────────┐                                          │
│  │   [LIVE CAMERA]    │  [📸 CAPTURE PHOTO]                      │
│  │   Position face    │                                          │
│  │   in frame...      │  Photo Quality: ████████░░ Good          │
│  └────────────────────┘                                          │
│                                                                   │
│  Step 2: Visitor Information                                      │
│  Full Name:    [John Doe_______________________________]         │
│  ID Number:    [98765432_______________________________]         │
│  Phone:        [+254 700 111 222________________________]         │
│                                                                   │
│  Step 3: Visit Details                                            │
│  Purpose:      [Meeting with Principal ▼]                        │
│  Options: Meeting, Delivery, Contractor, Parent Visit, Interview │
│                                                                   │
│  Person to Visit:                                                 │
│  [Search staff/student: Principal__________] 🔍                  │
│  Selected: Mr. James Omondi (Principal)                          │
│                                                                   │
│  Expected Duration: [2 hours ▼]                                  │
│  Entry Time: 2:00 PM (Auto)                                      │
│  Expected Exit: 4:00 PM (Auto-calculated)                        │
│                                                                   │
│  Step 4: ID Verification                                          │
│  [📸 SCAN ID CARD] or [✅ Manually Verified]                     │
│                                                                   │
│  Step 5: Approval Request                                         │
│  ☑️ Send notification to Mr. Omondi for approval                 │
│                                                                   │
│  [✅ SUBMIT FOR APPROVAL] [❌ CANCEL]                             │
│                                                                   │
│  ⏳ Waiting for approval from Mr. Omondi...                      │
│                                                                   │
│  ──── 30 seconds later ────                                      │
│                                                                   │
│  ✅ APPROVED by Mr. Omondi                                       │
│  Visitor may enter campus                                         │
│                                                                   │
│  [✅ ALLOW ENTRY] (Guard clicks)                                 │
│                                                                   │
│  Note: Visitor's face temporarily added to system for duration   │
│  of visit. Auto-removed after exit.                              │
└──────────────────────────────────────────────────────────────────┘

APPROVAL NOTIFICATION (Sent to Mr. Omondi):

📱 SMS + Portal Notification:
─────────────────────────────
Visitor at Main Gate:
Name: John Doe
ID: 98765432
Purpose: Meeting with you
Expected Duration: 2 hours

[✅ APPROVE] [❌ DENY] [💬 CALL GATE]

Mr. Omondi clicks "Approve" → Gate tablet updates instantly →
Guard allows visitor to enter

4.3 MULTIPLE GATE COORDINATION
┌────────────────────────────────────────────────────────────────────┐
│  ALL GATES OVERVIEW (Admin Dashboard View)                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐    │
│  │ Main Gate    │ Back Gate    │ Service Gate │ Emergency    │    │
│  │ Status: 🟢   │ Status: 🟢   │ Status: 🟢   │ Status: 🔴   │    │
│  │ Guard: S.M.  │ Guard: J.K.  │ Guard: M.O.  │ LOCKED       │    │
│  ├──────────────┼──────────────┼──────────────┼──────────────┤    │
│  │ Today:       │ Today:       │ Today:       │ Today:       │    │
│  │ 247 entries  │ 23 entries   │ 8 deliveries │ 0 uses       │    │
│  │ 189 exits    │ 12 exits     │ 8 exits      │              │    │
│  │              │              │              │              │    │
│  │ Last Activity│ Last Activity│ Last Activity│              │    │
│  │ 2:35 PM      │ 1:20 PM      │ 12:10 PM     │ N/A          │    │
│  │ Sarah W.     │ John K.      │ Food Delivery│              │    │
│  │ (Exit-Leave) │ (Entry-Late) │ (Authorized) │              │    │
│  │              │              │              │              │    │
│  │ [View Feed]  │ [View Feed]  │ [View Feed]  │ [🔓 Unlock]  │    │
│  │ [View Log]   │ [View Log]   │ [View Log]   │ [Emergency]  │    │
│  └──────────────┴──────────────┴──────────────┴──────────────┘    │
│                                                                     │
│  Recent Cross-Gate Alerts:                                         │
│  • 2:15 PM - Unknown face at Main Gate (Resolved - Visitor reg.)  │
│  • 1:45 PM - Student exit attempt at Back Gate (Denied - No leave)│
│  • 12:30 PM - Delivery at Service Gate (Approved - Food vendor)   │
│                                                                     │
│  Quick Actions:                                                     │
│  [🔐 LOCK ALL GATES] [🔓 UNLOCK ALL GATES] [🚨 EMERGENCY MODE]    │
│  [📊 GENERATE GATE REPORT] [⚙️ CONFIGURE GATES]                   │
└────────────────────────────────────────────────────────────────────┘

EMERGENCY UNLOCK ALL:
When admin clicks "Unlock All Gates" (e.g., fire evacuation):
→ All gates instantly unlock
→ All gate tablets display: "🚨 EMERGENCY - ALL GATES OPEN"
→ Guards notified
→ Gates remain open until admin clicks "Lock All Gates"

5. AUDIO & ALERT SYSTEM
5.1 Sound Infrastructure
Speaker Network Deployment:
Location TypeNumber of SpeakersCoverage PurposeClassrooms32 units (2 per room)Class announcements, individual room addressingCorridors15 unitsMovement guidance, crowd controlDining Hall4 units (high-power)Meal time announcements, seating instructionsAssembly Ground6 units (outdoor)Morning assembly, large gatheringsDormitories16 units (2 per block)Wake-up calls, curfew announcementsSports Fields4 units (weatherproof)Sports day, outdoor eventsGate Areas6 units (3 gates × 2)Entry/exit instructions, security alertsAdministration2 unitsOffice area announcementsTOTAL85 speakersCampus-wide coverage
Technical Specifications:

Connection: IP-based network audio (PoE powered)
Latency: <100ms from trigger to audio output
Audio Quality: 16-bit, 44.1kHz sampling
Volume Control: Individual speaker level adjustment (0-100%)
Failover: Local caching if network temporarily unavailable
Control: Zone-based addressing (individual or group)


5.2 Zone-Based Broadcasting System
┌──────────────────────────────────────────────────────────────────┐
│  AUDIO BROADCAST CONTROL PANEL                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Target Selection:                                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Broadcast Zone: [Select target area ▼]                     │  │
│  │                                                              │  │
│  │ Predefined Zones:                                           │  │
│  │ ⦿ Entire Campus (85 speakers)                               │  │
│  │ ○ Academic Block (48 speakers - classrooms + corridors)    │  │
│  │ ○ Dormitories (16 speakers - all dorm blocks)              │  │
│  │ ○ Dining & Social (10 speakers - dining + assembly)        │  │
│  │ ○ Outdoor Areas (10 speakers - sports fields + open areas) │  │
│  │ ○ Specific Location (1-4 speakers)                         │  │
│  │                                                              │  │
│  │ If "Specific Location" selected:                            │  │
│  │ [Search location: Corridor B__________] 🔍                 │  │
│  │ Found: 3 speakers (CB-01, CB-02, CB-03)                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Volume Control:                                                  │
│  Master Volume: [▓▓▓▓▓▓▓▓░░] 80%                                │
│  ☑️ Override individual speaker volumes (emergency mode)         │
│                                                                   │
│  [PROCEED TO BROADCAST METHOD →]                                 │
└──────────────────────────────────────────────────────────────────┘

5.3 Emergency Alert Protocols
┌──────────────────────────────────────────────────────────────────┐
│  EMERGENCY ALERT SYSTEM                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🔴 CRITICAL: These sounds trigger immediate campus-wide response│
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 1. 🔥 FIRE EMERGENCY                                        │  │
│  │                                                              │  │
│  │ Sound Pattern:                                              │  │
│  │ Continuous high-pitched siren (10 seconds)                  │  │
│  │ + Voice: "Fire alarm activated. This is not a drill.       │  │
│  │   Evacuate immediately via the nearest exit. Proceed        │  │
│  │   calmly to the designated assembly point."                 │  │
│  │                                                              │  │
│  │ Repetition: Message repeats every 30 seconds               │  │
│  │ Duration: Until manually stopped by admin                   │  │
│  │                                                              │  │
│  │ Automated Actions:                                          │  │
│  │ • All gates auto-unlock                                     │  │
│  │ • Emergency lights activate                                 │  │
│  │ • Notification sent to fire department                      │  │
│  │ • All cameras begin continuous recording                    │  │
│  │                                                              │  │
│  │ [🚨 TRIGGER FIRE ALARM] (Requires confirmation)            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 2. 🏥 MEDICAL EMERGENCY                                     │  │
│  │                                                              │  │
│  │ Sound Pattern:                                              │  │
│  │ Three short beeps (repeated 3 times)                        │  │
│  │ + Voice: "Medical emergency. Nursing staff and first       │  │
│  │   responders report to [location] immediately. All other    │  │
│  │   students remain in current locations."                    │  │
│  │                                                              │  │
│  │ Target: Campus-wide alert (all students stay put)          │  │
│  │ Broadcast: Single announcement (not repeated)               │  │
│  │                                                              │  │
│  │ Location: [Enter emergency location: ____________] 🔍      │  │
│  │                                                              │  │
│  │ [🚨 TRIGGER MEDICAL ALERT]                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 3. 🔒 SECURITY LOCKDOWN                                     │  │
│  │                                                              │  │
│  │ Sound Pattern:                                              │  │
│  │ Low continuous tone (5 seconds)                             │  │
│  │ + Voice: "Security lockdown is now in effect. All students │  │
│  │   and staff remain in your current location. Lock           │  │
│  │   classroom and office doors. Do not leave until the        │  │
│  │   all-clear is announced."                                  │  │
│  │                                                              │  │
│  │ Automated Actions:                                          │  │
│  │ • All gates lock automatically                              │  │
│  │ • Security team notified                                    │  │
│  │ • All cameras record continuously                           │  │
│  │ • Location tracking intensifies                             │  │
│  │                                                              │  │
│  │ [🚨 TRIGGER LOCKDOWN]                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 4. ⚠️ INTRUDER ALERT                                        │  │
│  │                                                              │  │
│  │ Sound Pattern:                                              │  │
│  │ Rapid intermittent beeping                                  │  │
│  │ + Voice: "Unauthorized person detected on campus. Security │  │
│  │   is responding. Students remain in classrooms with doors   │  │
│  │   locked. Teachers account for all students."               │  │
│  │                                                              │  │
│  │ Trigger Conditions:                                         │  │
│  │ • Unknown face detected by multiple cameras                 │  │
│  │ • Security guard manually triggers alert                    │  │
│  │ • Perimeter breach detected                                 │  │
│  │                                                              │  │
│  │ [🚨 TRIGGER INTRUDER ALERT]                                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 5. ✅ ALL CLEAR                                             │  │
│  │                                                              │  │
│  │ Sound Pattern:                                              │  │
│  │ Three ascending tones (pleasant, reassuring)                │  │
│  │ + Voice: "The emergency has been resolved. All clear.      │  │
│  │   Normal school operations may now resume. Thank you for    │  │
│  │   your cooperation."                                        │  │
│  │                                                              │  │
│  │ Use: After any emergency to signal return to normal        │  │
│  │                                                              │  │
│  │ [✅ BROADCAST ALL CLEAR]                                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ⚠️ All emergency alerts require admin confirmation before       │
│  activation to prevent accidental triggering.                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

5.4 Routine Scheduled Audio Events
┌──────────────────────────────────────────────────────────────────┐
│  AUTOMATED DAILY SCHEDULE                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Monday - Friday Schedule:                                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 6:00 AM  🔔 Wake-up Bell (Dormitories only)               │  │
│  │          Duration: 15 seconds                               │  │
│  │          Sound: Gentle ascending chime                      │  │
│  │                                                              │  │
│  │ 7:30 AM  🎵 National Anthem (Assembly Ground)              │  │
│  │          Duration: 90 seconds                               │  │
│  │          Auto-plays before morning assembly                 │  │
│  │                                                              │  │
│  │ 8:00 AM  🔔 Class Bell - Period 1 Begins                   │  │
│  │          Campus-wide: 3 rings                               │  │
│  │                                                              │  │
│  │ 10:00 AM 🔔 Break Bell                                      │  │
│  │          Campus-wide: 2 rings                               │  │
│  │                                                              │  │
│  │ 10:20 AM 🔔 Period 3 Begins                                 │  │
│  │          Campus-wide: 3 rings                               │  │
│  │                                                              │  │
│  │ 1:00 PM  🍽️ Lunch Bell (Dining areas)                      │  │
│  │          Voice: "Lunch is now being served"                 │  │
│  │                                                              │  │
│  │ 2:00 PM  🔔 Afternoon Sessions Begin                        │  │
│  │          Campus-wide: 3 rings                               │  │
│  │                                                              │  │
│  │ 4:00 PM  🔔 End of Classes                                  │  │
│  │          Campus-wide: 3 rings                               │  │
│  │                                                              │  │
│  │ 7:00 PM  🍽️ Dinner Bell                                    │  │
│  │          Dining areas + dormitories                         │  │
│  │                                                              │  │
│  │ 9:00 PM  ⚠️ Curfew Warning (Dormitories)                   │  │
│  │          Voice: "Curfew in 30 minutes. Return to dorms"    │  │
│  │                                                              │  │
│  │ 9:30 PM  🌙 Lights Out (Dormitories only)                  │  │
│  │          Voice: "Lights out. Good night."                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  [✏️ EDIT SCHEDULE] [➕ ADD EVENT] [🔕 DISABLE TODAY]            │
│                                                                   │
│  Special Events Override:                                         │
│  ☑️ Cancel regular schedule during exams                         │
│  ☑️ Custom schedule for sports day                               │
│  ☑️ Modified timing during short days                            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

5.5 Intelligent Alert Triggers (AI-Generated Audio)
System automatically generates audio based on anomaly detection:
SCENARIO-BASED AUDIO INTERVENTIONS:

1. LOITERING DETECTED
   ├─ 0-5 minutes: Silent (no action)
   ├─ 5-10 minutes: Gentle reminder
   │   Sound: Attention chime
   │   Voice: "Students in [location], please proceed to your
   │           scheduled activity."
   │   Zone: Specific location only
   │
   └─ 10+ minutes: Direct intervention
       Sound: Two-tone alert
       Voice: "[Student Name], report to [expected location]
               immediately."
       Zone: Specific location
       Escalation: Task created in Action Queue

2. UNAUTHORIZED ZONE ENTRY
   ├─ Immediate trigger: Student enters restricted area
   ├─ Sound: Warning beep (3 short)
   ├─ Voice: "You are in a restricted area. Leave immediately."
   ├─ Zone: Restricted area only
   ├─ Escalation: If not compliant in 2 minutes → Security alert
   └─ Camera: Auto-focuses on restricted area

3. MISSING STUDENT ALERTS
   ├─ 15 minutes missing: Silent flag in system
   ├─ 30 minutes: Admin notification (no public announcement)
   ├─ 1 hour: General announcement
   │   Sound: Attention chime
   │   Voice: "Will [Student Name] please report to the
   │           administration office immediately."
   │   Zone: Campus-wide
   └─ 2 hours: Emergency protocols

4. GATE ANOMALY
   ├─ Unknown face detected at gate
   ├─ Sound: Alert beep (gate area only)
   ├─ Voice: "Please wait for verification."
   ├─ Zone: Gate speakers only
   └─ Action: Guard intervention required

5. CROWD DETECTION
   ├─ Trigger: >20 students in non-gathering area during class
   ├─ Sound: Attention chime
   ├─ Voice: "Students in [location], disperse and return to
   │          your scheduled classes."
   ├─ Zone: Specific location
   └─ Monitoring: If crowd persists → Security dispatch

6. CLASS CHANGE REMINDER
   ├─ Trigger: 2 minutes before period ends
   ├─ Sound: Soft chime
   ├─ Voice: "Class change in 2 minutes. Prepare to move to
   │          next period."
   ├─ Zone: Classrooms only
   └─ Purpose: Smooth transitions

All automated audio interventions:
✅ Logged in audio_logs table
✅ Include timestamp, location, trigger reason
✅ Accessible via admin dashboard for review
✅ Can be disabled per location if needed

5.6 Audio Log & Audit Trail
┌──────────────────────────────────────────────────────────────────┐
│  AUDIO BROADCAST HISTORY & AUDIT LOG                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Date Range: [Last 7 Days ▼]  Zone: [All ▼]  Type: [All ▼]     │
│  Search: [___________________________] 🔍                         │
│                                                                   │
│  ┌──────┬────────┬──────────┬─────────┬──────────┬───────────┐  │
│  │ Time │ Type   │ Zone     │ Admin   │ Message  │ Playback  │  │
│  ├──────┼────────┼──────────┼─────────┼──────────┼───────────┤  │
│  │14:37 │ Live   │Corridor B│Mr.Kamau │"James,   │[🔊 Play]  │  │
│  │      │ Voice  │          │         │ return..." │[⬇️ Down] │  │
│  ├──────┼────────┼──────────┼─────────┼──────────┼───────────┤  │
│  │13:15 │ TTS    │Campus    │Mrs.Njeri│"Assembly │[🔊 Play]  │  │
│  │      │        │          │         │ in 5..." │[⬇️ Down] │  │
│  ├──────┼────────┼──────────┼─────────┼──────────┼───────────┤  │
│  │12:05 │Pre-Rec │Dining    │Auto     │"Lunch    │[🔊 Play]  │  │
│  │      │        │          │ Sched   │ served"  │[⬇️ Down] │  │
│  ├──────┼────────┼──────────┼─────────┼──────────┼───────────┤  │
│  │11:48 │Alert   │Gate 1    │System   │Unknown   │[🔊 Play]  │  │
│  │      │        │          │ Auto    │ face alert│[⬇️ Down] │  │
│  └──────┴────────┴──────────┴─────────┴──────────┴───────────┘  │
│                                                                   │
│  Total broadcasts today: 47                                       │
│  Live voice: 12  |  TTS: 8  |  Pre-recorded: 23  |  Alerts: 4   │
│                                                                   │
│  Storage: All broadcasts retained for 90 days                     │
│  Purpose: Audit trail, dispute resolution, compliance             │
│                                                                   │
│  [📊 GENERATE REPORT] [⬇️ EXPORT CSV] [🗑️ DELETE OLD LOGS]      │
│                                                                   │
│  Compliance Notes:                                                │
│  • All live broadcasts automatically recorded                     │
│  • Audio files encrypted and stored securely                      │
│  • Access logged (who played/downloaded which recording)          │
│  • Retention policy: 90 days (configurable)                       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

6. HOLIDAY & EVENT MANAGEMENT
6.1 School Calendar Integration
┌──────────────────────────────────────────────────────────────────┐
│  ACADEMIC CALENDAR & EVENT MANAGEMENT                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📅 JANUARY 2026                          [Month View ▼] [+Event]│
│  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐            │
│  │ Sun  │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Sat  │            │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤            │
│  │      │      │      │  1   │  2   │  3   │  4   │            │
│  │      │      │      │  🟢  │  🟢  │  🟢  │  🟡  │            │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤            │
│  │  5   │  6   │  7   │  8   │  9   │  10  │  11  │            │
│  │  🟡  │  🟢  │  🟢  │  🟢  │  🟢  │  🟢  │  🟡  │            │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤            │
│  │  12  │  13  │  14  │  15  │  16  │  17  │  18  │            │
│  │  🟡  │  🟢  │  🟢  │  🟡  │  🟢  │  🟢  │  🟡  │            │
│  │      │      │      │ Sports│      │      │      │            │
│  │      │      │      │  Day  │      │      │      │            │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤            │
│  │  19  │  20  │  21  │  22  │  23  │  24  │  25  │            │
│  │  🟡  │  🟢  │  🟢  │  🟢  │  🟢  │  🟢  │  🔴  │            │
│  │      │      │      │      │      │      │ Holiday│           │
│  └──────┴──────┴──────┴──────┴──────┴──────┴──────┘            │
│                                                                   │
│  Legend:                                                          │
│  🟢 Normal school day  🟡 Half day/Event  🔴 Holiday/Break       │
│                                                                   │
│  Upcoming Events:                                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Jan 15 - Sports Day (All-school event)                     │  │
│  │          Expected: 1,200 students                           │  │
│  │          Status: 🟢 Tracking configured                     │  │
│  │          [VIEW DETAILS] [ATTENDANCE REPORT]                 │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ Jan 24 - Inter-School Competition (24 students)            │  │
│  │          Status: 🟢 Group leave approved                    │  │
│  │          [TRACK EVENT] [PARENT NOTIFICATIONS]               │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ Feb 1-3 - Mid-Term Break (3 days)                          │  │
│  │          Status: ⚠️ Stayover requests open                 │  │
│  │          Responses: 856/1,200 (71%)                         │  │
│  │          [MANAGE STAYOVERS] [SEND REMINDERS]                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  [➕ CREATE EVENT] [📊 ANALYTICS] [📧 PARENT COMMUNICATION]      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

6.2 Event-Specific Attendance Tracking
┌──────────────────────────────────────────────────────────────────┐
│  CREATE EVENT-SPECIFIC TRACKING                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Event Details:                                                   │
│  Name: [Sports Day 2026________________________]                 │
│  Date: [📅 2026-01-15]  Time: [08:00 - 16:00]                   │
│                                                                   │
│  Event Type:                                                      │
│  ⦿ All-School (Mandatory for all students)                       │
│  ○ Form/Class-Specific (Select forms)                            │
│  ○ Optional Participation (Students sign up)                     │
│                                                                   │
│  Expected Participants:                                           │
│  Auto-calculated: 1,200 students (All enrolled)                  │
│  Manual override: [____] (leave blank for auto)                  │
│                                                                   │
│  Primary Location:                                                │
│  [Sports Field ▼]                                                │
│  Associated Cameras: CAM-30, CAM-31, CAM-32, CAM-33              │
│                                                                   │
│  Alternative Valid Locations:                                     │
│  (Students may legitimately be in these areas)                   │
│  ☑️ Medical Center (injuries, first aid)                         │
│  ☑️ Library (students with medical exemptions)                   │
│  ☑️ Dining Hall (during meal breaks)                             │
│  ☐ Dormitories (not valid during event)                         │
│                                                                   │
│  Detection Window:                                                │
│  Start: 08:00 (Event opens)                                      │
│  Initial Check: 08:30 (30 min grace period)                      │
│  Final Check: 09:00 (Full attendance required)                   │
│  Event End: 16:00                                                │
│                                                                   │
│  Automated Actions:                                               │
│  ☑️ Flag students not detected in primary/alternative locations  │
│  ☑️ Send SMS to parents of missing students                      │
│  ☑️ Notify class teachers of absentees                           │
│  ☑️ Auto-excuse students on approved leave                       │
│                                                                   │
│  Exception Handling:                                              │
│  Students on approved leave: Auto-excluded (don't flag)          │
│  Students in Medical Center: Valid (mark as "Excused - Medical") │
│  Students not detected anywhere: Critical alert                  │
│                                                                   │
│  [✅ CREATE EVENT TRACKING] [❌ CANCEL]                           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

EVENT DAY - LIVE MONITORING:

┌──────────────────────────────────────────────────────────────────┐
│  SPORTS DAY 2026 - LIVE ATTENDANCE                                │
│  Time: 09:15 AM | Status: Event In Progress                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Overall Attendance: 1,187 / 1,200 (98.9%)                       │
│                                                                   │
│  Location Breakdown:                                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Sports Field (Primary):    1,145 students (95.4%)          │  │
│  │ Medical Center:             28 students (2.3%)             │  │
│  │ Dining Hall (Break):        14 students (1.2%)             │  │
│  │ Library (Exemptions):        0 students (0%)               │  │
│  │                                                              │  │
│  │ Missing/Unaccounted:        13 students (1.1%) 🚨          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Missing Students (Action Required):                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 1. John Kamau (Form 2A) - Last seen: Dorm 20 mins ago     │  │
│  │    [📱 SMS Parent] [📞 Call Prefect] [📋 Mark Excused]    │  │
│  │                                                              │  │
│  │ 2. Sarah Wanjiku (Form 3B) - On approved leave ✅          │  │
│  │    (Auto-excluded from missing list)                       │  │
│  │                                                              │  │
│  │ 3. Michael Omondi (Form 1C) - Not detected anywhere 🚨    │  │
│  │    [🚨 ESCALATE] [👮 NOTIFY SECURITY] [📱 CALL PARENT]    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Automated Notifications Sent:                                    │
│  ✅ 09:05 AM - SMS to parents of 13 missing students             │
│  ✅ 09:10 AM - Email to class teachers with absentee list        │
│  ⏳ 09:30 AM - Scheduled follow-up check                         │
│                                                                   │
│  [🔄 REFRESH] [📊 GENERATE REPORT] [📧 SEND UPDATES]             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

6.3 Parent Communication for Events
┌──────────────────────────────────────────────────────────────────┐
│  EVENT PARENT COMMUNICATION TIMELINE                              │
│  Event: Inter-School Science Competition (Feb 5, 2026)           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Automated Message Schedule:                                      │
│                                                                   │
│  Day -7 (Jan 29):                                                │
│  ✅ Initial Announcement                                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Subject: Your child selected for Science Competition       │  │
│  │                                                              │  │
│  │ Dear Parent,                                                │  │
│  │                                                              │  │
│  │ [Student Name] has been selected to represent our school   │  │
│  │ at the Inter-School Science Competition.                    │  │
│  │                                                              │  │
│  │ Event Details:                                              │  │
│  │ • Date: February 5, 2026                                    │  │
│  │ • Departure: 7:00 AM from Main Gate                        │  │
│  │ • Return: 5:00 PM (approximate)                            │  │
│  │ • Venue: St. Mary's School, Westlands                      │  │
│  │ • Chaperones: Mr. Kamau & Mrs. Njeri                       │  │
│  │                                                              │  │
│  │ What your child needs:                                      │  │
│  │ • Packed lunch (breakfast provided at school)              │  │
│  │ • Water bottle                                             │  │
│  │ • Full school uniform                                       │  │
│  │ • Scientific calculator                                     │  │
│  │                                                              │  │
│  │ Please provide consent:                                     │  │
│  │ [GIVE CONSENT] [REQUEST MORE INFO]                         │  │
│  │                                                              │  │
│  │ Track live on event day: smartschool.nsait.ke/event/445    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Day -3 (Feb 2):                                                 │
│  ✅ Reminder + Final Details                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Reminder: Science Competition - Feb 5                      │  │
│  │                                                              │  │
│  │ Final reminders:                                            │  │
│  │ • Departure time: 7:00 AM sharp (please arrive by 6:50)   │  │
│  │ • What to bring: Packed lunch, water, calculator           │  │
│  │ • Chaperone contacts: Mr. Kamau (+254 700 123 456)         │  │
│  │                                                              │  │
│  │ Live tracking available on event day.                       │  │
│  │ Link sent on Feb 5 at 6:45 AM.                             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Day 0 (Feb 5) - LIVE EVENT UPDATES:                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 6:45 AM: 🚌 "Students boarding school bus. Departure soon."│  │
│  │ 7:15 AM: ✅ "Bus departed school. ETA venue: 8:30 AM"      │  │
│  │          GPS tracking: [Live Map Link]                      │  │
│  │                                                              │  │
│  │ 8:35 AM: ✅ "Arrived safely at St. Mary's School"          │  │
│  │ 8:40 AM: ✅ "Check-in complete. All 24 students present"   │  │
│  │                                                              │  │
│  │ 1:00 PM: ✅ "Lunch break. All students accounted for"      │  │
│  │                                                              │  │
│  │ 4:45 PM: ✅ "Competition complete. Departing for school"   │  │
│  │ 6:10 PM: ✅ "All students returned safely to campus"       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Post-Event (Feb 6):                                             │
│  ✅ Thank You + Results                                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Thank you for supporting your child's participation!       │  │
│  │                                                              │  │
│  │ Results: Our school placed 2nd overall! 🥈                 │  │
│  │ Individual awards: [View full results]                     │  │
│  │                                                              │  │
│  │ Event photos will be shared on the portal by Feb 8.        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Message Templates Library:                                       │
│  [✏️ Edit Templates] [➕ Add New Template]                       │
│                                                                   │
│  Template Categories:                                             │
│  • Event Invitations                                             │
│  • Consent Requests                                              │
│  • Departure Notifications                                       │
│  • Arrival Confirmations                                         │
│  • Progress Updates                                              │
│  • Return Confirmations                                          │
│  • Thank You Messages                                            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

7. COMPLETE USER FLOWS
7.1 Daily Admin Workflow
A Day in the Life of a School Administrator:
TIME: 6:30 AM - Admin arrives at office

STEP 1: Morning Dashboard Review
╔═══════════════════════════════════════════════════════════╗
║ Open SmartSchool Sentinel Admin Portal                    ║
║                                                            ║
║ Quick Status Check:                                        ║
║ • AI Action Queue: 0 Critical, 2 Warnings, 8 Watchlist   ║
║ • Campus Population: 1,127 students (1,200 expected)      ║
║ • System Status: All cameras online ✅                    ║
║ • Overnight alerts: None ✅                                ║
║                                                            ║
║ Action: Mark 2 warnings from last night as "Reviewed"     ║
║ Time taken: 2 minutes                                      ║
╚═══════════════════════════════════════════════════════════╝

TIME: 7:00-7:30 AM - Morning Entry Rush

STEP 2: Gate Monitoring
╔═══════════════════════════════════════════════════════════╗
║ Switch to "All Gates Overview" dashboard                  ║
║                                                            ║
║ Main Gate Status:                                          ║
║ • 247 entries processed (smooth flow)                     ║
║ • All students automatically recognized                    ║
║ • No unknown faces detected ✅                            ║
║ • Average entry time: <2 seconds per student              ║
║                                                            ║
║ Back Gate Status:                                          ║
║ • 23 entries (late arrivals)                              ║
║ • System flagged 3 students as "Late" (after 7:15 AM)    ║
║                                                            ║
║ Action: None needed - system handling automatically       ║
║ Time investment: 1 minute (just monitoring)               ║
╚═══════════════════════════════════════════════════════════╝

TIME: 7:30 AM - Morning Assembly

STEP 3: Assembly Attendance Verification
╔═══════════════════════════════════════════════════════════╗
║ Assembly ground cameras auto-detecting students           ║
║                                                            ║
║ Results (7:45 AM):                                         ║
║ • Present: 1,156 / 1,200 students (96.3%)                ║
║ • Missing: 44 students                                     ║
║ • Known absences: 2 (approved leave)                      ║
║ • Unaccounted: 42 students 🚨                             ║
║                                                            ║
║ Automated Action:                                          ║
║ System generates list of 42 missing students              ║
║                                                            ║
║ Admin Action:                                              ║
║ Click "Send Bulk SMS to Parents"                          ║
║ → 42 SMS sent: "Your child was absent from assembly"     ║
║                                                            ║
║ Time taken: 30 seconds (1 button click)                   ║
╚═══════════════════════════════════════════════════════════╝

TIME: 8:15 AM - First Anomaly Alert of the Day

STEP 4: Handle Class Skipping
╔═══════════════════════════════════════════════════════════╗
║ 🟠 WARNING ALERT appears in AI Action Queue:              ║
║                                                            ║
║ Student: James Kamau (Form 3A)                            ║
║ Issue: Detected in Corridor B during Math class           ║
║ Duration: 8 minutes                                        ║
║ Expected location: Classroom 3B                            ║
║                                                            ║
║ Admin Response:                                            ║
║ 1. Click alert to view full details                       ║
║ 2. Review: Live camera feed shows James in corridor       ║
║ 3. Check timeline: He left class 8 minutes ago            ║
║ 4. Decision: Voice intervention                           ║
║                                                            ║
║ Intervention Steps:                                        ║
║ 1. Click "🎤 Voice Intervention"                          ║
║ 2. Zone auto-selects: Corridor B (3 speakers)             ║
║ 3. Hold mic button                                         ║
║ 4. Speak: "James Kamau, return to Room 3B immediately"   ║
║ 5. Release button                                          ║
║                                                            ║
║ System Auto-Monitoring:                                    ║
║ Watching for James to enter Classroom 3B...               ║
║ 3 minutes later: James detected in Room 3B ✅             ║
║ Task auto-marks as "Resolved"                             ║
║ Admin receives: "✅ James has returned to class"          ║
║                                                            ║
║ Total admin time: 1 minute (voice message only)           ║
║ Total resolution time: 11 minutes (detection to fix)      ║
╚═══════════════════════════════════════════════════════════╝

TIME: 10:30 AM - Break Time

STEP 5: Crowd Monitoring
╔═══════════════════════════════════════════════════════════╗
║ Switch to Real-Time Kinetic Map                           ║
║                                                            ║
║ Current distribution:                                      ║
║ • Dining Hall: 340 students (normal)                      ║
║ • Library: 28 students                                     ║
║ • Sports Field: 85 students                                ║
║ • Classrooms: 0 students (as expected for break)          ║
║                                                            ║
║ Heatmap view:                                              ║
║ 🔴 Dining Hall (very crowded - normal for break)          ║
║ 🟢 Most other areas (light crowd - normal)                ║
║                                                            ║
║ Action: Monitor for 5 minutes, all patterns normal ✅     ║
║ Time: 5 minutes (passive monitoring)                       ║
╚═══════════════════════════════════════════════════════════╝

TIME: 1:00 PM - Lunch Monitoring

STEP 6: Meal Attendance Tracking
╔═══════════════════════════════════════════════════════════╗
║ Dining hall cameras auto-tracking meal attendance         ║
║                                                            ║
║ Results (1:30 PM):                                         ║
║ • Expected: 1,200 students                                 ║
║ • Detected: 1,187 students (98.9%)                        ║
║ • Missing: 13 students                                     ║
║                                                            ║
║ System Analysis:                                           ║
║ • 8 in Medical Center (valid excuse) ✅                   ║
║ • 3 in Library (investigating)                            ║
║ • 2 NOT DETECTED ANYWHERE 🚨                               ║
║                                                            ║
║ Admin Investigation:                                       ║
║ Click on 2 undetected students                            ║
║ → View timeline: Both last seen in dormitory              ║
║ → Action: Send prefect to check dorm                      ║
║                                                            ║
║ 10 minutes later:                                          ║
║ Prefect reports: Both students were sleeping (sick)       ║
║ → Mark as "Excused - Medical"                             ║
║ → Alert nurse to check on them                            ║
║                                                            ║
║ Time taken: 15 minutes (investigation + follow-up)        ║
╚═══════════════════════════════════════════════════════════╝

TIME: 2:45 PM - Security Alert

STEP 7: Unknown Face Detection
╔═══════════════════════════════════════════════════════════╗
║ 🚨 CRITICAL ALERT: Unknown face at Back Gate              ║
║                                                            ║
║ Details:                                                   ║
║ • Camera: CAM-012 (Back Gate)                              ║
║ • Time: 2:45 PM                                            ║
║ • Screenshot captured automatically                        ║
║ • Gate guard notified automatically                        ║
║                                                            ║
║ Admin Review:                                              ║
║ 1. Click alert to view camera snapshot                    ║
║ 2. See: Older male (not in system)                        ║
║ 3. Gate guard report (via tablet): "Supplier delivery"    ║
║ 4. Verification: Unauthorized (not on approved list)      ║
║                                                            ║
║ Admin Action:                                              ║
║ 1. Click "Register Visitor" on behalf of guard            ║
║ 2. Enter details: Name, ID, company, purpose              ║
║ 3. Approve 1-hour access                                   ║
║ 4. System adds face to temp database                       ║
║ 5. Auto-reminder set for exit                             ║
║                                                            ║
║ Time taken: 3 minutes (registration process)              ║
╚═══════════════════════════════════════════════════════════╝

TIME: 4:30 PM - End of Day

STEP 8: Generate Daily Reports
╔═══════════════════════════════════════════════════════════╗
║ One-click report generation:                              ║
║                                                            ║
║ Reports Generated:                                         ║
║ 1. Daily Attendance Summary                                ║
║    • Overall: 98.2% attendance                            ║
║    • By form: All above 95%                               ║
║    • Trends: Friday attendance dip noted                  ║
║                                                            ║
║ 2. Anomaly Report                                          ║
║    • Total incidents: 3                                    ║
║    • Resolved: 3 (100%)                                    ║
║    • Avg resolution time: 12 minutes                       ║
║                                                            ║
║ 3. Meal Participation                                      ║
║    • Breakfast: 97.5%                                      ║
║    • Lunch: 98.9%                                          ║
║    • Food waste estimate: 63 meals saved                   ║
║                                                            ║
║ Action: Click "Email to Principal"                         ║
║ Result: All reports sent automatically                     ║
║                                                            ║
║ Time taken: 30 seconds (automated)                         ║
╚═══════════════════════════════════════════════════════════╝

TIME: 5:00 PM - Sign Off

STEP 9: Final Review
╔═══════════════════════════════════════════════════════════╗
║ AI Action Queue Final Status:                             ║
║ • Tasks handled today: 15                                  ║
║ • Auto-resolved: 14 ✅                                     ║
║ • Manual intervention: 1 (voice message to James)         ║
║ • Open critical issues: 0 ✅                               ║
║                                                            ║
║ Achievement: ZERO INBOX! 🎉                                ║
║                                                            ║
║ Total admin time on system: ~25 minutes                    ║
║ (vs. 3+ hours with manual attendance tracking)            ║
║                                                            ║
║ Time saved: 2 hours 35 minutes                             ║
╚═══════════════════════════════════════════════════════════╝

SUMMARY OF ADMIN'S DAY:
✅ 1,200 students tracked automatically
✅ 15 anomalies detected and resolved
✅ 42 parents notified of absences
✅ 3 incidents handled via voice intervention
✅ 1 security breach managed
✅ 3 comprehensive reports generated
✅ Total system interaction time: 25 minutes
✅ Zero manual attendance registers filled

7.2 Gate Guard Workflow
Hour-by-Hour Gate Operations:
SCENARIO 1: Normal Morning Entry (7:00-7:30 AM)

┌─────────────────────────────────────────────────────────────┐
│ Student approaches Main Gate                                 │
│ ↓                                                            │
│ Camera detects face (0.3 seconds)                           │
│ ↓                                                            │
│ Tablet displays: ✅ "Sarah Wanjiku (Form 3B)"               │
│ ↓                                                            │
│ Guard sees green confirmation                                │
│ ↓                                                            │
│ Guard waves student through                                  │
│ ↓                                                            │
│ System logs: Entry at 7:15 AM                               │
└─────────────────────────────────────────────────────────────┘

Guard action: NONE (fully automated, < 2 seconds)
Students processed per hour: 900+ during peak time


SCENARIO 2: Late Student Arrival (8:45 AM)

┌─────────────────────────────────────────────────────────────┐
│ Student approaches gate                                      │
│ ↓                                                            │
│ Camera detects: John Kamau (Form 2A)                        │
│ ↓                                                            │
│ Tablet displays:                                             │
│ ⚠️ "LATE ARRIVAL"                                            │
│ "Classes started 45 minutes ago"                            │
│ "Reason required"                                            │
│ ↓                                                            │
│ Guard asks: "Why are you late?"                             │
│ ↓                                                            │
│ Student: "Medical appointment with my mother"                │
│ ↓                                                            │
│ Guard actions:                                               │
│ 1. Click "View Leave Records" → No approval found           │
│ 2. Click "Request Admin Approval"                           │
│ 3. Type reason: "Medical appointment - parent present"      │
│ 4. Submit                                                    │
│ ↓                                                            │
│ Wait 30 seconds...                                           │
│ ↓                                                            │
│ Admin approves via dashboard                                 │
│ ↓                                                            │
│ Tablet updates: ✅ "APPROVED - Entry allowed"               │
│ ↓                                                            │
│ Guard allows entry                                           │
│ ↓                                                            │
│ System logs: Late entry approved, reason recorded            │
└─────────────────────────────────────────────────────────────┘

Guard time: 2 minutes (mostly waiting for approval)
Admin time: 15 seconds (quick review + approve)


SCENARIO 3: Unknown Person (2:30 PM)

┌─────────────────────────────────────────────────────────────┐
│ Person approaches gate                                       │
│ ↓                                                            │
│ Camera detects: UNKNOWN FACE                                 │
│ ↓                                                            │
│ Tablet displays:                                             │
│ 🚨 "NOT RECOGNIZED - STOP"                                   │
│ Loud alert beep: BEEP BEEP BEEP                             │
│ Screenshot sent to admin dashboard                           │
│ ↓                                                            │
│ Guard stops person: "Please wait. ID please?"               │
│ ↓                                                            │
│ Person: "I'm here to see the Principal"                     │
│ Shows ID: Mr. John Doe                                       │
│ ↓                                                            │
│ Guard actions:                                               │
│ 1. Click "Register Visitor"                                  │
│ 2. Tablet camera activates                                   │
│ 3. Take photo of visitor                                     │
│ 4. Scan ID card (auto-fills details)                        │
│ 5. Enter purpose: "Meeting with Principal"                   │
│ 6. Expected duration: 2 hours                                │
│ 7. Click "Request Approval"                                  │
│ ↓                                                            │
│ Notification sent to Principal's phone                       │
│ ↓                                                            │
│ Principal clicks "Approve" (30 seconds)                      │
│ ↓                                                            │
│ Tablet shows: ✅ "APPROVED - 2 hour window"                  │
│ ↓                                                            │
│ Guard allows entry                                           │
│ ↓                                                            │
│ Visitor's face added to system temporarily                   │
│ Auto-reminder set for 4:15 PM (15 mins before exit)         │
└─────────────────────────────────────────────────────────────┘

Guard time: 3 minutes (registration process)
Visitor processing time: 3.5 minutes total


SCENARIO 4: Student on Approved Leave Exiting (3:15 PM)

┌─────────────────────────────────────────────────────────────┐
│ Student approaches exit                                      │
│ ↓                                                            │
│ Camera detects: Sarah Wanjiku                                │
│ ↓                                                            │
│ Tablet displays:                                             │
│ ✅ "EXPECTED EXIT"                                           │
│ "Leave #234: Weekend Home Visit"                            │
│ "Guardian: Mrs. Jane Wanjiku (Mother)"                      │
│ "Return due: Sunday 6:00 PM"                                │
│ ↓                                                            │
│ Guardian arrives (Mrs. Wanjiku)                              │
│ ↓                                                            │
│ Guard actions:                                               │
│ 1. Ask for ID                                                │
│ 2. Verify ID matches: 12345678 ✅                           │
│ 3. Click "Capture Guardian Photo"                           │
│ 4. Photo automatically taken and saved                       │
│ 5. Click "Signature Pad"                                     │
│ 6. Guardian signs on tablet screen                           │
│ 7. Click "Confirm Exit"                                      │
│ ↓                                                            │
│ System auto-actions:                                         │
│ • Log exit: "Sarah left with Mrs. Wanjiku at 3:20 PM"      │
│ • Update leave status: "In Progress - Off Campus"           │
│ • SMS to parent: "Sarah left school safely at 3:20 PM"     │
│ • Set return reminder: "Sunday 4:00 PM"                     │
└─────────────────────────────────────────────────────────────┘

Guard time: 2 minutes (verification + signature)
Parent receives confirmation instantly via SMS


SCENARIO 5: Unauthorized Exit Attempt (4:00 PM)

┌─────────────────────────────────────────────────────────────┐
│ Student approaches exit                                      │
│ ↓                                                            │
│ Camera detects: Michael Omondi                               │
│ ↓                                                            │
│ Tablet displays:                                             │
│ 🚨 "NO LEAVE APPROVAL"                                       │
│ "STOP - Do not allow exit"                                  │
│ Alert sound plays                                            │
│ Screenshot sent to admin + security                          │
│ ↓                                                            │
│ Guard script:                                                │
│ "I'm sorry Michael, you don't have exit approval.           │
│  Please return to campus. If this is an emergency,          │
│  I'll contact administration."                               │
│ ↓                                                            │
│ Student: "I just need to go to the shop quickly"            │
│ ↓                                                            │
│ Guard: "Let me check with admin"                            │
│ Guard clicks "Request Exit Approval"                         │
│ ↓                                                            │
│ Admin dashboard receives request                             │
│ Admin reviews: Student should be in class                    │
│ Admin denies request                                         │
│ ↓                                                            │
│ Tablet updates: ❌ "DENIED - Return to campus"              │
│ ↓                                                            │
│ Guard directs student back to campus                         │
│ ↓                                                            │
│ System logs:                                                 │
│ • Unauthorized exit attempt recorded                         │
│ • Incident flagged for class teacher review                 │
│ • Student's behavior record updated                          │
└─────────────────────────────────────────────────────────────┘

Guard time: 3 minutes (request + redirect)
Admin time: 20 seconds (review + deny)
Security breach prevented ✅