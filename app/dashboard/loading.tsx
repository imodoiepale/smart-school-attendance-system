"use client"

import { Card } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card sticky top-0 z-50 p-6">
        <div className="max-w-7xl mx-auto h-8 w-48 bg-muted rounded animate-pulse" />
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-4 w-24 bg-muted rounded mb-2" />
              <div className="h-8 w-16 bg-muted rounded" />
            </Card>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-4 h-80 bg-muted animate-pulse" />
          <Card className="p-4 h-80 bg-muted animate-pulse" />
        </div>
      </main>
    </div>
  )
}
