"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Users,
  Clock,
  AlertCircle,
  Settings,
  LogOut,
  Calendar,
  Home,
  Eye,
  BookOpen,
  Camera,
} from "lucide-react"

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/teachers", label: "Teacher Portal", icon: BookOpen },
  { href: "/gate-security", label: "Gate Security", icon: AlertCircle },
]

const adminNavItems = [
  { href: "/admin/students", label: "Student Management", icon: Users },
  { href: "/admin/timetables", label: "Timetable", icon: Clock },
  { href: "/admin/events", label: "Special Events", icon: Calendar },
  { href: "/admin/cameras", label: "Cameras", icon: Camera },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white min-h-screen flex flex-col fixed left-0 top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-blue-900" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">SmartSchool</h1>
            <p className="text-xs text-blue-200">Sentinel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Main Navigation */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-blue-300 uppercase mb-3 px-2">Main</p>
          <div className="space-y-2">
            {mainNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-white text-blue-900 shadow-lg"
                        : "text-blue-100 hover:bg-blue-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Admin Section */}
        <div>
          <p className="text-xs font-semibold text-blue-300 uppercase mb-3 px-2">Administration</p>
          <div className="space-y-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-white text-blue-900 shadow-lg"
                        : "text-blue-100 hover:bg-blue-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-blue-700 space-y-2">
        <Link href="/settings">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-blue-100 hover:bg-blue-700 transition-all">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </button>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-300 hover:bg-red-900/30 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
