# SmartSchool Sentinel - Complete UI/PRD Documentation

## PAGE 8: ADMIN PANEL - SPECIAL EVENTS (CONTINUED)

### D. Event Detail Page (Continued)

**Requirements:**
- FR-10.4.16: Display comprehensive event information:
  - Event name, type, category
  - Date, time, location
  - Status timeline:
    - Created (timestamp)
    - Scheduled (start time)
    - Departure confirmed (timestamp, count)
    - In progress
    - Return confirmed (timestamp, count)
    - Completed
  - Participant management:
    - Full list with photos
    - Status per student (departed, returned, pending)
    - Quick actions (mark departed, mark returned, mark picked up by parent)
  - Supervising teachers list
  - Modified schedule details (if applicable)
  - Absence exemptions status (auto-created, confirmed)
  - Transportation details (if provided)
  - Notes and comments (chronological log)

- FR-10.4.17: Departure Tracking Section:
  - Real-time departure counter: "25/25 students departed"
  - Checklist view with student names
  - Bulk actions:
    - Mark all departed (one click)
    - Mark selected departed
  - Individual actions:
    - Click student name → Mark departed (timestamp recorded)
  - Alert if departure time passed and not all departed
  - Generate departure report (PDF)

- FR-10.4.18: Return Tracking Section:
  - Real-time return counter: "23/25 students returned"
  - Time-based alerts:
    - Yellow: Expected return time approaching (30 min)
    - Red: Past expected return time and students missing
  - Student return checklist:
    - Green checkmark: Returned
    - Yellow clock: Expected but not yet returned
    - Red warning: Late return
  - Bulk actions:
    - Mark all returned
    - Mark selected returned
  - Individual actions:
    - Click student name → Mark returned (timestamp recorded)
    - Add return note (picked up by parent, arrived with bus, etc.)
  - Generate return report

- FR-10.4.19: Parent Pickup Integration:
  - Allow marking students as "Picked up by parent at event location"
  - Requires parent name and timestamp
  - Updates student status to "off_campus" with return location = event location
  - Notifications sent to school admin

- FR-10.4.20: Staggered Return Handling:
  - Support multiple return groups (Bus 1, Bus 2, Parent Pickup)
  - Track each group separately
  - Display which students are in which group
  - Mark returns group by group

- FR-10.4.21: Event Notes Section:
  - Chronological log of all event-related activities
  - Types of notes:
    - System notes (auto-generated: event created, student departed, etc.)
    - Teacher notes (manual entries)
    - Incident reports (accidents, behavior issues)
  - Add note button → Open modal with:
    - Note type (General, Incident, Medical, Transportation)
    - Note text (max 1000 chars)
    - Visibility (Public, Teachers Only, Admin Only)
  - Display all notes with timestamps and author names

- FR-10.4.22: Generate Event Report:
  - Comprehensive PDF report including:
    - Event details
    - Participant list (departed/returned status)
    - Timeline of key moments
    - Teacher notes
    - Incident reports (if any)
    - Attendance impact analysis
  - Download or email to specified recipients

**UI Elements:**
- Page layout with multiple sections:
  - Header with event name and status badge
  - Timeline visualization (horizontal or vertical)
  - Participant grid with photos and status indicators
  - Departure/Return tracking panels (side by side)
  - Notes section at bottom
  - Floating action button for quick notes
- Real-time updates via Supabase Real-time
- Progress bars for departure/return counts
- Color-coded status indicators throughout
- Print-friendly view option
- Export to PDF button

### E. Edit Event Modal

**Requirements:**
- FR-10.4.23: Click "Edit Event" → Open modal with current event data pre-filled
- FR-10.4.24: Allow editing of:
  - Event name
  - Date/time (with validation: cannot change if event already started)
  - Location
  - Participants (add/remove students)
  - Supervising teachers (add/remove)
  - Expected departure/return times
  - Schedule impact settings
- FR-10.4.25: Validation:
  - Cannot remove students who already departed
  - Cannot change date to past
  - Must have at least one supervising teacher
- FR-10.4.26: Submit → Update `special_events` record
- FR-10.4.27: If participants changed:
  - Add absence exemptions for newly added students
  - Remove exemptions for removed students (if event not yet started)
  - Notify affected teachers
- FR-10.4.28: Show success toast

**UI Elements:**
- Modal similar to Create Event but with pre-filled data
- "Save Changes" button
- Disabled fields if event already in progress (e.g., cannot change date)
- Confirmation dialog if removing students who departed

### F. Monitor Return Modal

**Requirements:**
- FR-10.4.29: Click "Monitor Return" → Open modal with live return tracking
- FR-10.4.30: Display:
  - Real-time countdown to expected return time
  - List of students not yet returned (with photos)
  - Last known status for each student
  - Quick mark returned buttons
- FR-10.4.31: Auto-refresh every 30 seconds
- FR-10.4.32: Alert notifications:
  - Play sound when student returns (marked)
  - Show toast notification
  - Update counter
- FR-10.4.33: Bulk actions:
  - Mark all remaining students as returned (with confirmation)
  - Send SMS to parents of missing students (if 30+ min late)
- FR-10.4.34: Close modal when all students returned

**UI Elements:**
- Modal with live timer
- Grid of student cards (not returned)
- Green "Mark Returned" button per student
- Alert banner if past expected time
- Auto-close option when complete
- Sound toggle (enable/disable notification sounds)

---

## IMPLEMENTATION PRIORITY & TIMELINE

### Phase 1: Core Infrastructure (Weeks 1-2)
1. Database schema deployment (Supabase)
2. MQTT broker setup (Railway EMQX)
3. Node.js MQTT subscriber service
4. Camera configuration (all 50 cameras)
5. Test end-to-end data flow

**Deliverables:**
- Database fully deployed with all tables
- MQTT broker operational with cameras connected
- Subscriber service processing messages correctly
- Sample data flowing from cameras to database

### Phase 2: Essential Dashboards (Weeks 3-4)
1. Senior Master Dashboard (Page 1)
2. Teacher Portal (Page 2)
3. Gate Security Interface (Page 3)
4. Basic authentication and RBAC

**Deliverables:**
- Three core dashboards functional
- Real-time updates working
- Role-based access control implemented
- Mobile-responsive design

### Phase 3: Parent & Admin Tools (Weeks 5-6)
1. Parent Portal (Page 4)
2. Admin - Student Management (Page 5)
3. Bulk import/export functionality
4. Notification system (email + in-app)

**Deliverables:**
- Parent portal with absence submission
- Student management with bulk operations
- Email notifications operational
- Face sync to cameras working

### Phase 4: Advanced Admin Features (Weeks 7-8)
1. Admin - Timetable Management (Page 6)
2. Admin - Camera Management (Page 7)
3. Admin - Special Events (Page 8)
4. Reporting and analytics

**Deliverables:**
- Complete timetable management system
- Camera configuration and monitoring tools
- Special events tracking (field trips, etc.)
- Comprehensive reporting suite

### Phase 5: Refinement & Launch (Weeks 9-10)
1. Performance optimization
2. Security audit
3. User training and documentation
4. Pilot testing with subset of students
5. Bug fixes and refinements
6. Full campus rollout

**Deliverables:**
- System fully optimized
- All security measures in place
- User manuals and training materials
- Successful pilot test completion
- School-wide deployment

---

## TECHNICAL STACK

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **Component Library:** shadcn/ui
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod validation
- **State Management:** React Context + Zustand (for complex state)
- **Real-time:** Supabase Real-time subscriptions
- **Video Streaming:** HLS.js for RTSP-to-HLS conversion

### Backend
- **Database:** Supabase (PostgreSQL)
- **MQTT Broker:** EMQX (Railway deployment)
- **MQTT Subscriber:** Node.js with mqtt.js library
- **File Storage:** Supabase Storage
- **Authentication:** Supabase Auth
- **API:** Next.js API Routes + Supabase RPC functions

### Infrastructure
- **Hosting:** Vercel (Next.js app)
- **MQTT Broker:** Railway (EMQX)
- **Database:** Supabase Cloud
- **CDN:** Vercel Edge Network
- **Monitoring:** Sentry (error tracking) + Vercel Analytics

### DevOps
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions + Vercel auto-deploy
- **Environment Management:** .env files with Vercel env variables
- **Testing:** Jest (unit) + Playwright (E2E)

---

## SECURITY CONSIDERATIONS

### Data Protection
1. **Encryption:**
   - TLS 1.3 for all MQTT communications
   - AES-256 for facial data at rest
   - HTTPS for all web traffic
   - End-to-end encryption for sensitive parent communications

2. **Access Control:**
   - Row-Level Security (RLS) on all Supabase tables
   - Role-Based Access Control (RBAC) with 5 roles
   - Two-factor authentication for admin accounts
   - Session management with 30-min inactivity timeout

3. **Privacy Compliance:**
   - GDPR/local data protection law compliance
   - Parental consent for facial recognition
   - Right to access, erasure, and object
   - Data minimization principles
   - 90-day auto-deletion of capture images

4. **Audit Logging:**
   - All admin actions logged
   - Access logs with IP addresses
   - Data modification tracking
   - Failed login attempt monitoring

### Camera Security
1. **Network Isolation:**
   - Cameras on separate VLAN
   - Firewall rules limiting external access
   - No direct internet access from cameras

2. **Authentication:**
   - Strong MQTT credentials (generated, not default)
   - Regular password rotation
   - Device-specific credentials

3. **Monitoring:**
   - Heartbeat tracking for all cameras
   - Anomaly detection (unusual message patterns)
   - Unauthorized access alerts

---

## PERFORMANCE TARGETS

### Response Times
- Dashboard load: <2 seconds
- API responses: <500ms (p95)
- Real-time updates: <1 second latency
- Search queries: <300ms
- Report generation: <5 seconds (standard reports)

### Scalability
- Support 1,500+ students
- Handle 100+ concurrent users
- Process 5,000+ attendance logs per day
- Store 90 days of capture images (~500GB)
- Support 50+ cameras with 24/7 uptime

### Uptime & Reliability
- System uptime: 99.5% (excluding planned maintenance)
- Database backups: Daily automated + point-in-time recovery (7 days)
- Failover: Camera redundancy with backup camera designation
- Data durability: 99.999% (Supabase guarantees)

---

## USER TRAINING PLAN

### Senior Master Training (2 hours)
- Dashboard navigation and interpretation
- Alert management and escalation
- Report generation and export
- Search and discovery features
- System settings configuration

### Teacher Training (1 hour)
- Attendance review and verification
- Adding manual notes
- Understanding status indicators
- Export and print options
- Parent communication workflow

### Gate Guard Training (30 minutes)
- Exit verification process
- Approved vs. unauthorized exits
- Using the tablet interface
- Emergency procedures
- Incident reporting

### Parent Orientation (Video + FAQ)
- Portal registration and login
- Viewing child's daily timeline
- Submitting absence reasons
- Requesting early dismissals
- Notification preferences

### Admin Training (4 hours)
- Student management (add, edit, bulk import)
- Timetable configuration
- Camera management and troubleshooting
- Special event creation and tracking
- System maintenance tasks

---

## SUCCESS METRICS

### System Performance
- **Attendance Accuracy:** >99% (compared to manual roll call)
- **Detection Rate:** >95% of students detected per period
- **False Positive Rate:** <2%
- **Camera Uptime:** >98%
- **System Response Time:** <2 seconds for all dashboards

### User Adoption
- **Teacher Usage:** >90% of teachers using system daily within 1 month
- **Parent Portal Registration:** >80% of parents registered within 2 months
- **Admin Efficiency:** 75% reduction in time spent on attendance-related admin tasks

### School Impact
- **Attendance Improvement:** 5% increase in overall attendance rate in first semester
- **Absenteeism Reduction:** 30% reduction in chronic absenteeism cases
- **Parent Engagement:** 50% increase in parent-school communication
- **Safety Enhancement:** 100% tracking of student exits (vs. 60% manual)

### Cost Savings
- **Time Savings:** 20 hours/week saved on manual attendance and roll calls
- **Meal Tracking Accuracy:** Improved funding compliance reporting
- **Reduced Truancy:** Earlier intervention reducing dropout rates
- **Operational Efficiency:** 40% faster response to attendance-related issues

---

## SUPPORT & MAINTENANCE

### Ongoing Support
- **Help Desk:** Email support (support@smartschoolsentinel.com)
- **Response Times:**
  - Critical issues: 1 hour
  - High priority: 4 hours
  - Normal priority: 24 hours
- **Knowledge Base:** Online documentation with FAQs and video tutorials
- **User Community:** Forum for teachers and admins to share best practices

### Maintenance Schedule
- **Daily:** Automated database backups at 2 AM
- **Weekly:** Camera health check and report
- **Monthly:** System performance review and optimization
- **Quarterly:** Security audit and updates
- **Annually:** Full system review and upgrade planning

### Update Policy
- **Security Patches:** Applied within 24 hours of release
- **Bug Fixes:** Deployed weekly (non-critical) or immediately (critical)
- **Feature Updates:** Monthly release cycle with testing period
- **Major Versions:** Annually with thorough testing and user training

---

## RISK MITIGATION

### Technical Risks
1. **Camera Failures:**
   - Mitigation: Backup camera designation, redundant coverage
   - Response: Automated alerts, IT team intervention within 1 hour

2. **Network Outages:**
   - Mitigation: Offline mode with local caching, automatic retry
   - Response: Fallback to manual roll call, sync when connection restored

3. **Database Corruption:**
   - Mitigation: Daily backups, point-in-time recovery
   - Response: Restore from backup within 30 minutes

4. **MQTT Broker Downtime:**
   - Mitigation: Railway auto-restart, health monitoring
   - Response: Automatic recovery, manual restart if needed

### Operational Risks
1. **Low User Adoption:**
   - Mitigation: Comprehensive training, intuitive UI, ongoing support
   - Response: Additional training sessions, feedback collection

2. **Privacy Concerns:**
   - Mitigation: Transparent communication, parental consent, compliance with laws
   - Response: Privacy officer designation, regular audits

3. **Data Breaches:**
   - Mitigation: Encryption, access control, security audits
   - Response: Incident response plan, notification protocols

### Compliance Risks
1. **Data Protection Violations:**
   - Mitigation: Legal review, privacy by design, regular compliance checks
   - Response: Immediate remediation, consultation with legal counsel

2. **Facial Recognition Regulations:**
   - Mitigation: Monitor regulatory changes, flexible system design
   - Response: Adapt system configuration to meet new requirements

---

## FUTURE ENHANCEMENTS (Post-Launch)

### Phase 2 Features (6-12 months)
1. **SMS Notifications:** Twilio integration for critical alerts
2. **Mobile Apps:** Native iOS/Android apps for parents and teachers
3. **Advanced Analytics:** Predictive modeling for at-risk students
4. **Integration with SIS:** Two-way sync with Student Information System
5. **Behavior Tracking:** Link attendance with behavior incidents
6. **Academic Performance Correlation:** Analyze attendance vs. grades

### Phase 3 Features (12-24 months)
1. **Multi-School Support:** District-wide deployment
2. **Advanced Reporting:** Custom report builder with drag-and-drop
3. **API for Third Parties:** Allow integration with other school systems
4. **AI-Powered Insights:** Recommendations for interventions
5. **Visitor Management:** Extend system to track visitors
6. **Transportation Integration:** Track students on school buses

---

## CONCLUSION

SmartSchool Sentinel represents a comprehensive, AI-powered attendance management solution that addresses the critical needs of modern educational institutions. By leveraging facial recognition technology, MQTT-based real-time communications, and intuitive web-based dashboards, the system provides:

1. **Accuracy:** 99%+ attendance tracking accuracy
2. **Efficiency:** 75% reduction in administrative overhead
3. **Safety:** 100% tracking of student movements
4. **Transparency:** Real-time visibility for all stakeholders
5. **Compliance:** Built-in privacy protection and data security

The phased implementation approach ensures a smooth rollout with minimal disruption to daily operations, while the comprehensive training plan guarantees high user adoption and maximum system value.

With its symbiotic camera network, context-aware attendance logic, smart exit management, and field trip tracking capabilities, SmartSchool Sentinel goes beyond simple attendance marking to provide a holistic view of student presence and safety throughout the school day.

The system is designed for scalability, security, and long-term sustainability, with ongoing support, regular updates, and a clear roadmap for future enhancements. By implementing SmartSchool Sentinel, schools can focus more on education and less on attendance administration, while ensuring every student is accounted for and safe.

---

**Document Version:** 1.0  
**Last Updated:** January 13, 2026  
**Author:** SmartSchool Sentinel Development Team  
**Status:** Final - Ready for Implementation