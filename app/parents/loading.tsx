"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto p-6">
          <div className="h-9 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-5 w-64 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Children Cards Skeleton */}
        <div>
          <div className="h-8 w-40 bg-muted rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-2 w-full bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-12 bg-muted rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-8 flex-1 bg-muted rounded animate-pulse" />
                    <div className="h-8 flex-1 bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Activity Card Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
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
