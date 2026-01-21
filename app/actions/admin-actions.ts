'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionResponse = {
  success: boolean
  message: string
  data?: any
  error?: any
}

/**
 * Creates a new timetable template
 */
export async function createTimetableTemplate(data: {
  template_name: string
  description?: string
  day_of_week: number
  period_number: number
  period_name: string
  period_type: string
  start_time: string
  end_time: string
}): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { data: newTemplate, error } = await supabase
      .from('timetable_template')
      .insert([data])
      .select()
      .single()

    if (error) {
      console.error('Error creating timetable template:', error)
      return { success: false, message: 'Failed to create timetable template', error }
    }

    revalidatePath('/admin/timetables')
    return { success: true, message: 'Timetable template created successfully', data: newTemplate }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, message: 'An unexpected error occurred', error }
  }
}

/**
 * Creates a new special event
 */
export async function createSpecialEvent(data: {
  event_name: string
  event_type: string
  location: string
  start_datetime: string
  end_datetime: string
  description?: string // Note: DB schema might not have description, check 'notes' or specific fields
  participant_ids: string[]
  created_by: string
}): Promise<ActionResponse> {
  const supabase = await createClient()

  // Map input to schema
  const dbPayload = {
    event_name: data.event_name,
    event_type: data.event_type,
    event_location: data.location,
    start_datetime: data.start_datetime,
    end_datetime: data.end_datetime,
    participant_ids: data.participant_ids,
    participant_count: data.participant_ids.length,
    created_by: data.created_by,
    notes: data.description
  }

  try {
    const { data: newEvent, error } = await supabase
      .from('special_events')
      .insert([dbPayload])
      .select()
      .single()

    if (error) {
      console.error('Error creating special event:', error)
      return { success: false, message: 'Failed to create special event', error }
    }

    revalidatePath('/admin/events')
    return { success: true, message: 'Special event created successfully', data: newEvent }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, message: 'An unexpected error occurred', error }
  }
}

/**
 * Registers a new camera
 */
export async function registerCamera(data: {
  device_id: string
  display_name: string
  location_tag: string
  building?: string
  floor?: string
  rtsp_url?: string
}): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { data: newCamera, error } = await supabase
      .from('camera_metadata')
      .insert([data])
      .select()
      .single()

    if (error) {
      console.error('Error registering camera:', error)
      return { success: false, message: 'Failed to register camera', error }
    }

    revalidatePath('/admin/cameras')
    return { success: true, message: 'Camera registered successfully', data: newCamera }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, message: 'An unexpected error occurred', error }
  }
}
