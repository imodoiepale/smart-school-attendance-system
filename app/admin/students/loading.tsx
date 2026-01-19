"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-card sticky top-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-9 w-64 bg-muted rounded animate-pulse" />
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            <div className="h-10 w-40 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Search Bar Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 border-b">
                  <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                  <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
