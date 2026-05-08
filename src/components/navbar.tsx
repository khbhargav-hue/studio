"use client"

import Link from "next/link"
import { Trophy, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export function Navbar() {
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
          <Link href="/admin" className="text-sm font-medium text-accent hover:opacity-80 transition-opacity">Admin Portal</Link>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
            <User className="h-5 w-5" />
          </Button>
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
              <DropdownMenuItem asChild>
                <Link href="/admin" className="text-accent">Admin Portal</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}