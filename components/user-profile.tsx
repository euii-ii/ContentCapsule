"use client"

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser
} from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { UserIcon, LogIn, UserPlus } from "lucide-react"

export function UserProfile() {
  const { user } = useUser()

  return (
    <div className="flex items-center gap-4 ml-auto">
      <div className="flex items-center gap-2">
        <SignedOut>
          {/* Show sign in/up buttons when user is not authenticated */}
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden md:inline">Sign In</span>
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden md:inline">Sign Up</span>
              </Button>
            </SignUpButton>
          </div>
        </SignedOut>

        <SignedIn>
          {/* Show user profile when authenticated */}
          <div className="flex items-center gap-2">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "shadow-lg border",
                  userButtonPopoverActionButton: "hover:bg-muted",
                }
              }}
              showName={false}
              userProfileMode="modal"
              afterSignOutUrl="/"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.emailAddresses?.[0]?.emailAddress || 'Pro Plan'}
              </p>
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  )
}
