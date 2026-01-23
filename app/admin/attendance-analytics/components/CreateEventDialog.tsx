"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, Plus, Loader2, Camera, GraduationCap, Users, CheckCircle2 } from "lucide-react"
import { Student, Camera as CameraType } from "../types"

interface CreateEventDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCreateEvent: (eventData: EventFormData) => Promise<void>
  cameras?: CameraType[]
  students?: Student[]
}

export interface EventFormData {
  name: string
  description: string
  event_type: string
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  location: string
  camera_ids: string[]
  participant_forms: string[]
  participant_ids: string[]
  track_attendance: boolean
}

const EVENT_TYPES = [
  { value: 'assembly', label: 'Assembly' },
  { value: 'sports', label: 'Sports Event' },
  { value: 'exam', label: 'Examination' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'trip', label: 'School Trip' },
  { value: 'ceremony', label: 'Ceremony' },
  { value: 'other', label: 'Other' },
]

const FORM_OPTIONS = ['Form 1', 'Form 2', 'Form 3', 'Form 4']

export function CreateEventDialog({ isOpen, onOpenChange, onCreateEvent, cameras = [], students = [] }: CreateEventDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    event_type: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    location: '',
    camera_ids: [],
    participant_forms: [],
    participant_ids: [],
    track_attendance: false,
  })

  // Get students for selected forms
  const selectedStudents = students.filter(s => 
    formData.participant_forms.length === 0 || formData.participant_forms.includes(s.form || '')
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.event_type || !formData.start_date) return

    setIsSubmitting(true)
    try {
      await onCreateEvent(formData)
      setFormData({
        name: '',
        description: '',
        event_type: '',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        location: '',
        camera_ids: [],
        participant_forms: [],
        participant_ids: [],
        track_attendance: false,
      })
      setShowAdvanced(false)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleCamera = (cameraId: string) => {
    setFormData(prev => ({
      ...prev,
      camera_ids: prev.camera_ids.includes(cameraId)
        ? prev.camera_ids.filter(id => id !== cameraId)
        : [...prev.camera_ids, cameraId]
    }))
  }

  const toggleForm = (form: string) => {
    setFormData(prev => ({
      ...prev,
      participant_forms: prev.participant_forms.includes(form)
        ? prev.participant_forms.filter(f => f !== form)
        : [...prev.participant_forms, form]
    }))
  }

  const selectAllForms = () => {
    setFormData(prev => ({
      ...prev,
      participant_forms: prev.participant_forms.length === FORM_OPTIONS.length ? [] : [...FORM_OPTIONS]
    }))
  }

  const selectAllCameras = () => {
    setFormData(prev => ({
      ...prev,
      camera_ids: prev.camera_ids.length === cameras.length ? [] : cameras.map(c => c.camera_id)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            Create New Event
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Set up event details, select participants, and configure attendance tracking</p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded"></div>
                Basic Information
              </h3>
              {/* Event Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Sports Day 2026, Science Fair"
                  className="h-10 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Event Type */}
                <div className="space-y-2">
                  <Label htmlFor="event_type" className="text-sm font-medium">Event Type *</Label>
                  <Select value={formData.event_type} onValueChange={(value) => updateField('event_type', value)}>
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="e.g., Main Hall, Sports Field"
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Provide details about the event..."
                  className="text-sm min-h-[80px]"
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Date & Time Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-4 bg-green-600 rounded"></div>
                Date & Time
              </h3>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-green-600" /> Start Date *
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => updateField('start_date', e.target.value)}
                    className="h-10 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date" className="text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-green-600" /> End Date
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => updateField('end_date', e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time" className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-green-600" /> Start Time
                  </Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => updateField('start_time', e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time" className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-green-600" /> End Time
                  </Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => updateField('end_time', e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Attendance Tracking */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-4 bg-purple-600 rounded"></div>
                  Attendance Tracking
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs"
                >
                  {showAdvanced ? 'Hide' : 'Show'} Options
                </Button>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Checkbox
                  id="track_attendance"
                  checked={formData.track_attendance}
                  onCheckedChange={(checked) => updateField('track_attendance', checked)}
                />
                <Label htmlFor="track_attendance" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  Enable attendance tracking for this event
                </Label>
              </div>

              {showAdvanced && formData.track_attendance && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                  {/* Camera Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Camera className="w-4 h-4 text-blue-600" />
                        Select Cameras ({formData.camera_ids.length} selected)
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={selectAllCameras}
                        className="h-7 text-xs"
                      >
                        {formData.camera_ids.length === cameras.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-white rounded border">
                      {cameras.map(camera => (
                        <div key={camera.camera_id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`camera-${camera.camera_id}`}
                            checked={formData.camera_ids.includes(camera.camera_id)}
                            onCheckedChange={() => toggleCamera(camera.camera_id)}
                          />
                          <Label htmlFor={`camera-${camera.camera_id}`} className="text-xs cursor-pointer truncate">
                            {camera.display_name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form/Class Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-green-600" />
                        Select Forms/Classes ({formData.participant_forms.length} selected)
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={selectAllForms}
                        className="h-7 text-xs"
                      >
                        {formData.participant_forms.length === FORM_OPTIONS.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {FORM_OPTIONS.map(form => (
                        <Badge
                          key={form}
                          variant={formData.participant_forms.includes(form) ? 'default' : 'outline'}
                          className="cursor-pointer hover:bg-primary/80 px-3 py-1.5"
                          onClick={() => toggleForm(form)}
                        >
                          {form}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Participant Summary */}
                  {formData.participant_forms.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          {selectedStudents.length} students will be tracked
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        From: {formData.participant_forms.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </form>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-gray-500">
              {formData.track_attendance && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  Attendance tracking enabled
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={(e) => {
                  e.preventDefault()
                  const form = e.currentTarget.closest('form') as HTMLFormElement
                  if (form) form.requestSubmit()
                }}
                disabled={isSubmitting || !formData.name || !formData.event_type || !formData.start_date}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
