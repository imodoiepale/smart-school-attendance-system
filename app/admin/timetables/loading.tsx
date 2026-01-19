"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-muted rounded animate-pulse" />
          <div className="h-5 w-80 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-40 bg-muted rounded animate-pulse" />
      </div>

      {/* Timetable Grid Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
