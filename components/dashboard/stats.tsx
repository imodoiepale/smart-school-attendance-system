"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle, AlertCircle, LogOut, HelpCircle } from "lucide-react"

interface StatsProps {
  stats: {
    total: number
    present: number
    absent: number
    offCampus: number
    unknown: number
    presentPercentage: number
  }
}

export function AttendanceStats({ stats }: StatsProps) {
  const statCards = [
    {
      title: "Total Students",
      value: stats.total,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Present",
      value: stats.present,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      subtext: `${stats.presentPercentage}%`,
    },
    {
      title: "Absent",
      value: stats.absent,
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
    },
    {
      title: "Off Campus",
      value: stats.offCampus,
      icon: LogOut,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Unknown Location",
      value: stats.unknown,
      icon: HelpCircle,
      color: "text-yellow-600 dark:text-yellow-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  {stat.subtext && <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>}
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
