'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'

interface LeaveRequestFormProps {
  students: any[]
  userEmail: string
}

export function LeaveRequestForm({ students, userEmail }: LeaveRequestFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    student_id: '',
    student_name: '',
    class: '',
    leave_type: 'weekend_home',
    leave_reason: '',
    start_datetime: '',
    end_datetime: '',
    guardian_name: '',
    guardian_id_number: '',
    guardian_phone: '',
    guardian_relationship: 'parent'
  })
  
  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.user_id === studentId)
    if (student) {
      setFormData(prev => ({
        ...prev,
        student_id: studentId,
        student_name: student.full_name,
        class: student.class || student.grade || ''
      }))
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        router.push('/leave-management')
      } else {
        alert('Failed to submit leave request')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Student</Label>
          <Select value={formData.student_id} onValueChange={handleStudentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select student..." />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.user_id} value={student.user_id}>
                  {student.full_name} ({student.class || student.grade})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Leave Type</Label>
          <Select value={formData.leave_type} onValueChange={(value) => setFormData(prev => ({ ...prev, leave_type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekend_home">Weekend Home</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
              <SelectItem value="family_emergency">Family Emergency</SelectItem>
              <SelectItem value="school_trip">School Trip</SelectItem>
              <SelectItem value="sports_event">Sports Event</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Start Date & Time</Label>
          <Input
            type="datetime-local"
            value={formData.start_datetime}
            onChange={(e) => setFormData(prev => ({ ...prev, start_datetime: e.target.value }))}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>End Date & Time</Label>
          <Input
            type="datetime-local"
            value={formData.end_datetime}
            onChange={(e) => setFormData(prev => ({ ...prev, end_datetime: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Reason for Leave</Label>
        <Textarea
          value={formData.leave_reason}
          onChange={(e) => setFormData(prev => ({ ...prev, leave_reason: e.target.value }))}
          rows={4}
          required
        />
      </div>
      
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Guardian Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Guardian Name</Label>
            <Input
              value={formData.guardian_name}
              onChange={(e) => setFormData(prev => ({ ...prev, guardian_name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Guardian ID Number</Label>
            <Input
              value={formData.guardian_id_number}
              onChange={(e) => setFormData(prev => ({ ...prev, guardian_id_number: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Guardian Phone</Label>
            <Input
              type="tel"
              value={formData.guardian_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, guardian_phone: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Relationship</Label>
            <Select value={formData.guardian_relationship} onValueChange={(value) => setFormData(prev => ({ ...prev, guardian_relationship: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="guardian">Guardian</SelectItem>
                <SelectItem value="sibling">Sibling</SelectItem>
                <SelectItem value="relative">Relative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading || !formData.student_id}>
          {isLoading ? 'Submitting...' : 'Submit Leave Request'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
