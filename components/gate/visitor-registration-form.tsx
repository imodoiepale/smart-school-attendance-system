'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

interface VisitorRegistrationFormProps {
  guardEmail: string
}

export function VisitorRegistrationForm({ guardEmail }: VisitorRegistrationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    id_number: '',
    phone_number: '',
    company_organization: '',
    purpose: '',
    host_staff_name: '',
    expected_duration_hours: 2
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const now = new Date()
      const expectedExit = new Date(now.getTime() + formData.expected_duration_hours * 60 * 60 * 1000)
      
      const response = await fetch('/api/gate/visitors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          entry_time: now.toISOString(),
          expected_exit_time: expectedExit.toISOString(),
          approved_by: guardEmail,
          entry_gate: 'Main Gate',
          status: 'on_premises'
        })
      })
      
      if (response.ok) {
        setFormData({
          full_name: '',
          id_number: '',
          phone_number: '',
          company_organization: '',
          purpose: '',
          host_staff_name: '',
          expected_duration_hours: 2
        })
        router.refresh()
        alert('Visitor registered successfully')
      } else {
        alert('Failed to register visitor')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Full Name *</Label>
          <Input
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>ID Number *</Label>
          <Input
            value={formData.id_number}
            onChange={(e) => setFormData(prev => ({ ...prev, id_number: e.target.value }))}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input
            type="tel"
            value={formData.phone_number}
            onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Company/Organization</Label>
          <Input
            value={formData.company_organization}
            onChange={(e) => setFormData(prev => ({ ...prev, company_organization: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Purpose of Visit *</Label>
        <Textarea
          value={formData.purpose}
          onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
          rows={3}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Host Staff Name</Label>
          <Input
            value={formData.host_staff_name}
            onChange={(e) => setFormData(prev => ({ ...prev, host_staff_name: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Expected Duration (hours)</Label>
          <Input
            type="number"
            min="1"
            max="24"
            value={formData.expected_duration_hours}
            onChange={(e) => setFormData(prev => ({ ...prev, expected_duration_hours: parseInt(e.target.value) }))}
          />
        </div>
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Registering...' : 'Register Visitor'}
      </Button>
    </form>
  )
}
