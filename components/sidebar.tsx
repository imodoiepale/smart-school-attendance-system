"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  BarChart3,
  Users,
  Clock,
  AlertCircle,
  Settings,
  LogOut,
  Calendar,
  Home,
  BookOpen,
  Camera,
  MapPin,
  Activity,
  FileText,
  AlertTriangle,
} from "lucide-react"
import { memo } from "react"

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/attendance", label: "Attendance", icon: Clock },
  { href: "/admin/whereabouts", label: "Whereabouts", icon: MapPin },
  { href: "/admin/student-movements", label: "Movements", icon: Activity },
  { href: "/teachers", label: "Reports", icon: BarChart3 },
]

const adminNavItems = [
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/absence-requests", label: "Absence Requests", icon: FileText },
  { href: "/admin/flagged-students", label: "Flagged Students", icon: AlertTriangle },
  { href: "/admin/cameras", label: "Cameras", icon: Camera },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/timetables", label: "Timetables", icon: Clock },
  { href: "/admin/system-logs", label: "System Logs", icon: FileText },
]

const NavItem = memo(({ item, isActive }: { item: typeof mainNavItems[0], isActive: boolean }) => {
  const Icon = item.icon
  return (
    <Link href={item.href} prefetch={true}>
      <div
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
          isActive
            ? "bg-white text-blue-900 shadow-lg"
            : "text-blue-100 hover:bg-blue-700"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium text-sm">{item.label}</span>
      </div>
    </Link>
  )
})

NavItem.displayName = 'NavItem'

export const Sidebar = memo(function Sidebar() {
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
        <Link href="/dashboard" prefetch={true}>
          <div className="flex items-center gap-2 mb-1 cursor-pointer">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">SmartSchool</h1>
              <p className="text-xs text-blue-200">Sentinel</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Main Navigation */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-blue-300 uppercase mb-3 px-2">Main</p>
          <div className="space-y-2">
            {mainNavItems.map((item) => (
              <NavItem key={item.href} item={item} isActive={pathname.startsWith(item.href)} />
            ))}
          </div>
        </div>

        {/* Admin Section */}
        <div>
          <p className="text-xs font-semibold text-blue-300 uppercase mb-3 px-2">Administration</p>
          <div className="space-y-2">
            {adminNavItems.map((item) => (
              <NavItem key={item.href} item={item} isActive={pathname.startsWith(item.href)} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-blue-700 space-y-2">
        <Link href="/settings" prefetch={true}>
          <div className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-blue-100 hover:bg-blue-700 transition-all cursor-pointer">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </div>
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
})
