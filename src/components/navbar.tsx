
"use client"

import Link from "next/link"
import { User, Menu, LogOut } from "lucide-react"
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
import { TurfistaLogo } from "./brand-logo"

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

  const isAdmin = user?.email === "khbhargav@gmail.com"

  return (
    <nav className="sticky top-0 z-50 w-full glass-card border-b border-white/10 px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/">
          <TurfistaLogo />
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link href="/" className="text-xs font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">Find Turfs</Link>
          <Link href="/about" className="text-xs font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">Partner Program</Link>
          
          {isAdmin && (
            <Link href="/admin" className="text-xs font-black uppercase tracking-[0.2em] text-accent hover:opacity-80 transition-opacity">Admin Portal</Link>
          )}

          <div className="h-6 w-px bg-white/10 mx-2" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/10 hover:text-primary h-12 w-12 border border-transparent hover:border-primary/20">
                <User className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-white/10 w-56 rounded-2xl p-2 shadow-2xl">
              {!user ? (
                <DropdownMenuItem asChild className="rounded-xl h-12 focus:bg-primary focus:text-background font-bold cursor-pointer">
                  <Link href="/login">Admin Login</Link>
                </DropdownMenuItem>
              ) : (
                <>
                  <div className="px-3 py-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Authenticated As</p>
                    <p className="text-sm font-bold truncate text-primary">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10 mx-1" />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive h-12 rounded-xl font-bold cursor-pointer mt-1">
                    <LogOut className="mr-3 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/5">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-white/10 rounded-2xl p-2 mt-2">
              <DropdownMenuItem asChild className="h-12 rounded-xl font-bold">
                <Link href="/">Find Turfs</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="h-12 rounded-xl font-bold">
                <Link href="/about">About</Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild className="h-12 rounded-xl font-bold text-accent">
                  <Link href="/admin">Admin Portal</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-white/10 mx-1" />
              {!user ? (
                <DropdownMenuItem asChild className="h-12 rounded-xl font-bold">
                  <Link href="/login">Admin Login</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleLogout} className="text-destructive h-12 rounded-xl font-bold">
                  <LogOut className="mr-3 h-4 w-4" /> Logout
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
