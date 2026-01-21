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
import { createTimetableTemplate } from '@/app/actions/admin-actions'

export function CreateTimetableModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        template_name: '',
        day_of_week: '1',
        period_number: '1',
        period_name: '',
        period_type: 'class',
        start_time: '08:00',
        end_time: '09:00',
    })

    // Days mapping
    const days = [
        { value: '1', label: 'Monday' },
        { value: '2', label: 'Tuesday' },
        { value: '3', label: 'Wednesday' },
        { value: '4', label: 'Thursday' },
        { value: '5', label: 'Friday' },
        { value: '6', label: 'Saturday' },
        { value: '7', label: 'Sunday' },
    ]

    // Period types
    const periodTypes = [
        { value: 'class', label: 'Class' },
        { value: 'assembly', label: 'Assembly' },
        { value: 'break', label: 'Break' },
        { value: 'lunch', label: 'Lunch' },
        { value: 'roll_call', label: 'Roll Call' },
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
                template_name: formData.template_name,
                day_of_week: parseInt(formData.day_of_week),
                period_number: parseInt(formData.period_number),
                period_name: formData.period_name,
                period_type: formData.period_type,
                start_time: formData.start_time,
                end_time: formData.end_time,
            }

            const result = await createTimetableTemplate(payload)

            if (result.success) {
                setOpen(false)
                // Reset form or handle success toast?
                // User didn't ask for Toast, so keeping it simple for now.
                setFormData({
                    template_name: '',
                    day_of_week: '1',
                    period_number: '1',
                    period_name: '',
                    period_type: 'class',
                    start_time: '08:00',
                    end_time: '09:00',
                })
            } else {
                alert(result.message) // Simple error handling
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
                    <Plus className="mr-2 h-4 w-4" /> New Timetable
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Create New Timetable Template</DialogTitle>
                    <DialogDescription>
                        Add a new period to a timetable template.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="template_name" className="text-right">
                            Template Name
                        </Label>
                        <Input
                            id="template_name"
                            name="template_name"
                            placeholder="e.g. Standard Week A"
                            className="col-span-3"
                            value={formData.template_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="day_of_week" className="text-right">
                            Day
                        </Label>
                        <div className="col-span-3">
                            <Select
                                name="day_of_week"
                                value={formData.day_of_week}
                                onValueChange={(val) => handleSelectChange('day_of_week', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {days.map((day) => (
                                        <SelectItem key={day.value} value={day.value}>
                                            {day.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="period_number" className="text-right">
                            Period #
                        </Label>
                        <Input
                            id="period_number"
                            name="period_number"
                            type="number"
                            className="col-span-3"
                            value={formData.period_number}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="period_name" className="text-right">
                            Period Name
                        </Label>
                        <Input
                            id="period_name"
                            name="period_name"
                            placeholder="e.g. Mathematics"
                            className="col-span-3"
                            value={formData.period_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="period_type" className="text-right">
                            Type
                        </Label>
                        <div className="col-span-3">
                            <Select
                                name="period_type"
                                value={formData.period_type}
                                onValueChange={(val) => handleSelectChange('period_type', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periodTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start_time" className="text-right">
                            Start Time
                        </Label>
                        <Input
                            id="start_time"
                            name="start_time"
                            type="time"
                            className="col-span-3"
                            value={formData.start_time}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="end_time" className="text-right">
                            End Time
                        </Label>
                        <Input
                            id="end_time"
                            name="end_time"
                            type="time"
                            className="col-span-3"
                            value={formData.end_time}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Template'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
