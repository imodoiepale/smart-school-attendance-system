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
import { registerCamera } from '@/app/actions/admin-actions'

export function AddCameraModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        device_id: '',
        display_name: '',
        location_tag: '',
        building: '',
        floor: '',
        rtsp_url: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                device_id: formData.device_id,
                display_name: formData.display_name,
                location_tag: formData.location_tag,
                building: formData.building,
                floor: formData.floor,
                rtsp_url: formData.rtsp_url,
            }

            const result = await registerCamera(payload)

            if (result.success) {
                setOpen(false)
                setFormData({
                    device_id: '',
                    display_name: '',
                    location_tag: '',
                    building: '',
                    floor: '',
                    rtsp_url: '',
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
                    <Plus className="mr-2 h-4 w-4" /> Add Camera
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Add New Camera</DialogTitle>
                    <DialogDescription>
                        Register a new camera device.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="device_id" className="text-right">
                            Device ID
                        </Label>
                        <Input
                            id="device_id"
                            name="device_id"
                            placeholder="e.g. CAM-001"
                            className="col-span-3"
                            value={formData.device_id}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="display_name" className="text-right">
                            Display Name
                        </Label>
                        <Input
                            id="display_name"
                            name="display_name"
                            placeholder="e.g. Main Gate Entry"
                            className="col-span-3"
                            value={formData.display_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location_tag" className="text-right">
                            Location Tag
                        </Label>
                        <Input
                            id="location_tag"
                            name="location_tag"
                            placeholder="e.g. gate_entry"
                            className="col-span-3"
                            value={formData.location_tag}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="building" className="text-right">
                            Building
                        </Label>
                        <Input
                            id="building"
                            name="building"
                            placeholder="e.g. A"
                            className="col-span-3"
                            value={formData.building}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="floor" className="text-right">
                            Floor
                        </Label>
                        <Input
                            id="floor"
                            name="floor"
                            placeholder="e.g. Ground"
                            className="col-span-3"
                            value={formData.floor}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="rtsp_url" className="text-right">
                            RTSP URL
                        </Label>
                        <Input
                            id="rtsp_url"
                            name="rtsp_url"
                            placeholder="Optional: rtsp://..."
                            className="col-span-3"
                            value={formData.rtsp_url}
                            onChange={handleChange}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Registering...' : 'Add Camera'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
