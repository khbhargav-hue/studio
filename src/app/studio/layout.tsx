'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, PlusCircle, LogOut, Loader2, Palette, ShieldCheck, Globe } from 'lucide-react';
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
        // Logged in but not an admin - silent redirect to home
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
        console.error("Studio termination failed", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">Establishing Secure Node...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background selection:bg-primary selection:text-black">
        <Sidebar className="border-r border-white/5 bg-card/60 backdrop-blur-3xl w-80">
          <SidebarHeader className="p-12">
            <Link href="/">
              <TurfistaLogo size="lg" />
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-6 space-y-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard" className="h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] px-6 transition-all hover:bg-primary/5 hover:text-primary data-[active=true]:bg-primary data-[active=true]:text-black">
                  <Link href="/studio">
                    <LayoutDashboard className="h-5 w-5 mr-3" />
                    <span>Intelligence</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Add New Turf" className="h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] px-6 transition-all hover:bg-primary/5 hover:text-primary">
                  <Link href="/studio/new">
                    <PlusCircle className="h-5 w-5 mr-3" />
                    <span>Deploy Arena</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Branding" className="h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] px-6 transition-all hover:bg-primary/5 hover:text-primary">
                  <Link href="/studio/branding">
                    <Palette className="h-5 w-5 mr-3" />
                    <span>Visual Assets</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-10">
            <div className="flex flex-col gap-4">
              <Button asChild variant="outline" className="h-14 rounded-2xl border-white/5 bg-white/5 font-black uppercase tracking-widest text-[9px]">
                <Link href="/" target="_blank"><Globe className="h-4 w-4 mr-2" /> Live Portal</Link>
              </Button>
              <Button onClick={handleLogout} variant="ghost" className="h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] text-destructive hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Terminate Access
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-y-auto px-8 py-12 md:px-16 md:py-20">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
