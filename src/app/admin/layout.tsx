'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { LayoutDashboard, PlusCircle, LogOut, Loader2, Palette } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { TurfistaLogo } from '@/components/brand-logo';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'khbhargav@gmail.com';

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
                  <Link href="/admin">
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Add New Turf" className="h-14 rounded-2xl font-bold uppercase tracking-widest text-xs px-4">
                  <Link href="/admin/new">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    <span>Add New Turf</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Branding" className="h-14 rounded-2xl font-bold uppercase tracking-widest text-xs px-4">
                  <Link href="/admin/branding">
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
