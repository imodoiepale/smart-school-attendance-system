"use client"

import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Settings, Bell, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function DashboardHeader({ user }: { user: User }) {
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="block">
              <h1 className="text-2xl font-bold text-primary">SmartSchool Sentinel</h1>
            </Link>
            <p className="text-sm text-muted-foreground">Senior Master Command Center</p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" title="Notifications">
              <Bell className="w-5 h-5" />
            </Button>
            <Link href="/settings">
              <Button variant="ghost" size="icon" title="Settings">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="w-5 h-5" />
            </Button>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
