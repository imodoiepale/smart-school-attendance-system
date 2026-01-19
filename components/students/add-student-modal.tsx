"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface AddStudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddStudentModal({ open, onOpenChange }: AddStudentModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    student_id: "",
    full_name: "",
    photo_url: "",
    class: "",
    stream: "",
    email: "",
    phone_number: "",
    address: "",
    date_of_birth: "",
    grade: "",
    house: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    status: "on_campus",
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let photoUrl = formData.photo_url

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${formData.student_id}_${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('student-photos')
          .upload(fileName, imageFile)

        if (uploadError) {
          alert(`Image upload failed: ${uploadError.message}`)
          setLoading(false)
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('student-photos')
          .getPublicUrl(fileName)
        
        photoUrl = publicUrl
      }

      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, photo_url: photoUrl }),
      })

      if (response.ok) {
        onOpenChange(false)
        router.refresh()
        setFormData({
          student_id: "",
          full_name: "",
          photo_url: "",
          class: "",
          stream: "",
          email: "",
          phone_number: "",
          address: "",
          date_of_birth: "",
          grade: "",
          house: "",
          parent_name: "",
          parent_phone: "",
          parent_email: "",
          status: "on_campus",
        })
        setImageFile(null)
        setImagePreview(null)
      } else {
        alert("Failed to add student")
      }
    } catch (error) {
      console.error("Error adding student:", error)
      alert("Error adding student")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-sm text-blue-900">Required Information *</h3>
            
            <div className="space-y-2">
              <Label htmlFor="photo">Student Photo * (Required)</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-lg object-cover border-2 border-blue-300" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center bg-white">
                    <Upload className="w-8 h-8 text-blue-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload student photo (JPG, PNG)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID * (Required)</Label>
                <Input
                  id="student_id"
                  required
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  placeholder="STU001"
                  className="border-blue-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name * (Required)</Label>
                <Input
                  id="full_name"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                  className="border-blue-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class * (Required)</Label>
                <Input
                  id="class"
                  required
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  placeholder="Form 1A"
                  className="border-blue-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stream">Stream * (Required)</Label>
                <Input
                  id="stream"
                  required
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  placeholder="Science"
                  className="border-blue-300"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Additional Information (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@school.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={`Grade ${i + 1}`}>
                        Grade {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="house">House</Label>
                <Input
                  id="house"
                  value={formData.house}
                  onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                  placeholder="Red House"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Parent/Guardian Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent_name">Parent Name</Label>
                <Input
                  id="parent_name"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent_phone">Parent Phone</Label>
                <Input
                  id="parent_phone"
                  value={formData.parent_phone}
                  onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="parent_email">Parent Email</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                  placeholder="parent@email.com"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
