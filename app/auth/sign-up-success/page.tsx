import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto" />
          <CardTitle className="text-2xl">Account Created!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground space-y-2">
            <p>Your account has been created successfully.</p>
            <p>Please check your email to confirm your account before signing in.</p>
          </div>
          <Button asChild className="w-full">
            <Link href="/auth/login">Go to Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
