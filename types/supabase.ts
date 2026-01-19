export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string | null
          full_name: string | null
          role: string
          created_at: string
          updated_at: string
        }
      }
      students: {
        Row: {
          id: string
          student_id: string
          full_name: string
          grade: string
          class: string
          house: string | null
          photo_url: string | null
          parent_email: string | null
          parent_phone: string | null
          status: string
          last_seen_location: string | null
          last_seen_time: string | null
          created_at: string
          updated_at: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          event_type: string
          status: string
          timestamp: string
          camera_id: string | null
          confidence: number | null
          created_at: string
        }
      }
      absences: {
        Row: {
          id: string
          student_id: string
          reason: string
          start_date: string
          end_date: string
          status: string
          approved_by: string | null
          document_url: string | null
          created_at: string
          updated_at: string
        }
      }
      special_events: {
        Row: {
          id: string
          name: string
          type: string
          date_start: string
          date_end: string | null
          location: string | null
          expected_return_time: string | null
          status: string
          created_by: string
          created_at: string
          updated_at: string
        }
      }
      event_participants: {
        Row: {
          id: string
          event_id: string
          student_id: string
          status: string
          departed_at: string | null
          returned_at: string | null
          created_at: string
        }
      }
      cameras: {
        Row: {
          id: string
          camera_id: string
          name: string
          location: string | null
          ip_address: string | null
          status: string
          last_heartbeat: string | null
          detection_count_today: number
          uptime_percentage: number | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
