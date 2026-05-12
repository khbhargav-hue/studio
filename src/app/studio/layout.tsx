'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { LayoutDashboard, PlusCircle, LogOut, Loader2, Palette, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { TurfistaLogo } from '@/components/brand-logo';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'khbhargav@gmail.com';

export default function StudioLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.email !== ADMIN_EMAIL) {
        // Logged in but not an admin - redirect to home (keep studio hidden)
        router.replace('/');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        router.push('/');
      } catch (error) {
        console.error("Logout failed", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Secure Authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Layout check will redirect
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-white/5 bg-card/50 backdrop-blur-xl w-80">
          <SidebarHeader className="p-10">
            <Link href="/">
              <TurfistaLogo size="lg" />
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-6 space-y-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard" className="h-14 rounded-2xl font-bold uppercase tracking-widest text-xs px-4">
                  <Link href="/studio">
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Add New Turf" className="h-14 rounded-2xl font-bold uppercase tracking-widest text-xs px-4">
                  <Link href="/studio/new">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    <span>Add New Turf</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Branding" className="h-14 rounded-2xl font-bold uppercase tracking-widest text-xs px-4">
                  <Link href="/studio/branding">
                    <Palette className="h-5 w-5 mr-2" />
                    <span>Branding</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-8">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="h-14 rounded-2xl font-bold uppercase tracking-widest text-xs px-4 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="h-5 w-5 mr-2" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-y-auto px-6 py-10 md:px-12">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
