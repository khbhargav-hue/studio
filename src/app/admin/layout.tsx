'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { LayoutDashboard, PlusCircle, Settings, LogOut, Trophy, Eye, MousePointerClick } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'admin@turfista.com';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-white/5 bg-card/50 backdrop-blur-xl">
          <SidebarHeader className="p-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <Trophy className="h-6 w-6 text-background fill-current" />
              </div>
              <span className="font-headline text-xl font-bold tracking-tighter text-neon">
                TURFISTA
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link href="/admin">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Add New Turf">
                  <Link href="/admin/new">
                    <PlusCircle className="h-5 w-5" />
                    <span>Add New Turf</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
