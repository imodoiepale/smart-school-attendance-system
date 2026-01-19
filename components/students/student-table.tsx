"use client"

import type { Student } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"

interface StudentTableProps {
  students: Student[]
}

export function StudentTable({ students }: StudentTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-semibold">ID</th>
            <th className="text-left py-3 px-4 font-semibold">Name</th>
            <th className="text-left py-3 px-4 font-semibold">Grade</th>
            <th className="text-left py-3 px-4 font-semibold">Status</th>
            <th className="text-left py-3 px-4 font-semibold">Admission Date</th>
            <th className="text-right py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-muted-foreground">
                No students found
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student.id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4">{student.student_id}</td>
                <td className="py-3 px-4 font-medium">
                  {student.first_name} {student.last_name}
                </td>
                <td className="py-3 px-4">{student.grade_level}</td>
                <td className="py-3 px-4">
                  <span className="capitalize px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {student.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : "-"}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
