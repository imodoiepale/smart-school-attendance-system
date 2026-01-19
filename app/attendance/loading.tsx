"use client"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <main className="max-w-[1600px] mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-10 w-48 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
          <div className="flex gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="h-12 w-24 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
