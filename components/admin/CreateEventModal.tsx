'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createSpecialEvent } from '@/app/actions/admin-actions'

export function CreateEventModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        event_name: '',
        event_type: 'assembly',
        location: '',
        start_datetime: '',
        end_datetime: '',
        description: '',
    })

    // Event types
    const eventTypes = [
        { value: 'assembly', label: 'Assembly' },
        { value: 'exam', label: 'Exam' },
        { value: 'holiday', label: 'Holiday' },
        { value: 'trip', label: 'Field Trip' },
        { value: 'sport', label: 'Sporting Event' },
    ]

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                event_name: formData.event_name,
                event_type: formData.event_type,
                location: formData.location,
                start_datetime: new Date(formData.start_datetime).toISOString(),
                end_datetime: new Date(formData.end_datetime).toISOString(),
                description: formData.description,
                participant_ids: [], // Default to empty for now
                created_by: 'admin', // Placeholder, ideally from auth context
            }

            const result = await createSpecialEvent(payload)

            if (result.success) {
                setOpen(false)
                setFormData({
                    event_name: '',
                    event_type: 'assembly',
                    location: '',
                    start_datetime: '',
                    end_datetime: '',
                    description: '',
                })
            } else {
                alert(result.message)
            }
        } catch (error) {
            console.error(error)
            alert("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Create Special Event</DialogTitle>
                    <DialogDescription>
                        Schedule a new school event.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="event_name" className="text-right">
                            Event Name
                        </Label>
                        <Input
                            id="event_name"
                            name="event_name"
                            placeholder="e.g. Morning Assembly"
                            className="col-span-3"
                            value={formData.event_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="event_type" className="text-right">
                            Type
                        </Label>
                        <div className="col-span-3">
                            <Select
                                name="event_type"
                                value={formData.event_type}
                                onValueChange={(val) => handleSelectChange('event_type', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {eventTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">
                            Location
                        </Label>
                        <Input
                            id="location"
                            name="location"
                            placeholder="e.g. Main Hall"
                            className="col-span-3"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start_datetime" className="text-right">
                            Start
                        </Label>
                        <Input
                            id="start_datetime"
                            name="start_datetime"
                            type="datetime-local"
                            className="col-span-3"
                            value={formData.start_datetime}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="end_datetime" className="text-right">
                            End
                        </Label>
                        <Input
                            id="end_datetime"
                            name="end_datetime"
                            type="datetime-local"
                            className="col-span-3"
                            value={formData.end_datetime}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Description
                        </Label>
                        <Input
                            id="description"
                            name="description"
                            placeholder="Optional notes"
                            className="col-span-3"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Event'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
