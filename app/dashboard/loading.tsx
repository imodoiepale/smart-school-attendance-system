"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-card sticky top-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats skeleton - 5 cards to match actual layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-9 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts & Data */}
          <div className="lg:col-span-2 space-y-6">
            {/* Attendance Chart Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 w-48 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>

            {/* Recent Activity Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 w-40 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Active Alerts Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg border-l-2 border-orange-400">
                      <div className="h-4 w-4 bg-muted rounded animate-pulse mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-full bg-muted rounded animate-pulse" />
                        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Student Search Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
