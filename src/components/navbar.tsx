
"use client"

import Link from "next/link"
import { Trophy, User, Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { useUser, useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"

export function Navbar() {
  const { user } = useUser()
  const auth = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth)
      router.push("/")
    }
  }

  const isAdmin = user?.email === "admin@turfista.com"

  return (
    <nav className="sticky top-0 z-50 w-full glass-card border-b border-white/10 px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Trophy className="h-6 w-6 text-background fill-current" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tighter text-neon">
            TURFISTA
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Find Turfs</Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
          
          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-accent hover:opacity-80 transition-opacity">Admin Portal</Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-white/10 w-48">
              {!user ? (
                <DropdownMenuItem asChild>
                  <Link href="/login" className="cursor-pointer">Admin Login</Link>
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem className="text-muted-foreground text-xs truncate">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-white/10">
              <DropdownMenuItem asChild>
                <Link href="/">Find Turfs</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/about">About</Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="text-accent">Admin Portal</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-white/10" />
              {!user ? (
                <DropdownMenuItem asChild>
                  <Link href="/login">Admin Login</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
