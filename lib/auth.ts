import { createClient } from "@/lib/supabase/server"

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  const { data: userData } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  return {
    ...user,
    role: userData?.role || "donor",
  }
}

export async function getCurrentUserRole() {
  const user = await getCurrentUser()
  return user?.role || null
}

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "view_all",
    "manage_students",
    "manage_donors",
    "manage_campaigns",
    "manage_donations",
    "manage_users",
    "view_reports",
    "export_data",
  ],
  staff: ["view_all", "manage_donors", "manage_campaigns", "manage_donations", "view_reports"],
  donor: ["view_campaigns", "make_donations", "view_impact"],
  parent: ["view_child_profile", "view_sponsorship"],
}

export function hasPermission(role: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission)
}
