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

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'khbhargav@gmail.com';

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

  const isAdmin = user?.email === ADMIN_EMAIL

  return (
    <nav className="absolute top-0 z-50 w-full px-4 py-6 md:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/">
          <TurfistaLogo />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[13px] font-bold text-white/80 hover:text-white transition-colors">Find Turfs</Link>
          <Link href="/about" className="text-[13px] font-bold text-white/80 hover:text-white transition-colors">About</Link>
          
          {isAdmin && (
            <Link href="/admin" className="text-[13px] font-bold text-[#1AFF73] hover:opacity-80 transition-opacity">Admin Portal</Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-10 w-10">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/90 border-white/10 w-56 rounded-2xl p-2 backdrop-blur-xl">
              {!user ? (
                <DropdownMenuItem asChild className="rounded-xl h-12 focus:bg-[#1AFF73] focus:text-black font-bold cursor-pointer">
                  <Link href="/login">Admin Login</Link>
                </DropdownMenuItem>
              ) : (
                <>
                  <div className="px-3 py-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Authenticated As</p>
                    <p className="text-sm font-bold truncate text-[#1AFF73]">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10 mx-1" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:bg-red-500/10 focus:text-red-500 h-12 rounded-xl font-bold cursor-pointer mt-1">
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
              <Button variant="ghost" size="icon" className="h-10 w-10 text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-black border-white/10 rounded-2xl p-2 mt-2">
              <DropdownMenuItem asChild className="h-12 rounded-xl font-bold">
                <Link href="/">Find Turfs</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="h-12 rounded-xl font-bold">
                <Link href="/about">About</Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild className="h-12 rounded-xl font-bold text-[#1AFF73]">
                  <Link href="/admin">Admin Portal</Link>
                </DropdownMenuItem>
              )}
              {!user ? (
                <DropdownMenuItem asChild className="h-12 rounded-xl font-bold">
                  <Link href="/login">Admin Login</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 h-12 rounded-xl font-bold">
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
