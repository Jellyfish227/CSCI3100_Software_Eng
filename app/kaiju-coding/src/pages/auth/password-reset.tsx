import type React from "react"
import { useState } from "react"
import { Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function PasswordReset() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ email })
    // Handle password reset logic here
    setIsSubmitted(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
        </CardHeader>
        {isSubmitted ? (
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                If an account exists with the email <strong>{email}</strong>, you will receive password reset
                instructions.
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Please check your email inbox and spam folder. The reset link will expire in 1 hour.
              </p>
              <Button type="button" variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
                Try another email
              </Button>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#4aafbf] hover:bg-[#3d9aa9]">
                Send reset instructions
              </Button>
            </CardContent>
          </form>
        )}
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <a href="/sign-in" className="text-[#4aafbf] hover:underline inline-flex items-center">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to sign in
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
