'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  Loader2, 
  Palette, 
  Trophy, 
  Users, 
  Zap, 
  Waves, 
  Database,
  Globe,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { TurfistaLogo } from '@/components/brand-logo';

const ADMIN_EMAIL = 'khbhargav@gmail.com';

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
        // Fallback for demo, in production we use users/{uid}.role === "admin"
        router.replace('/');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  const MENU_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/studio" },
    { label: "Turfs", icon: Zap, href: "/studio/inventory?tab=turfs" },
    { label: "Teams", icon: Users, href: "/studio/inventory?tab=teams" },
    { label: "Challenges", icon: Trophy, href: "/studio/inventory?tab=challenges" },
    { label: "Coaching", icon: UserCheck, href: "/studio/inventory?tab=coaching" },
    { label: "Pools", icon: Waves, href: "/studio/inventory?tab=pools" },
    { label: "Users", icon: Users, href: "/studio/inventory?tab=users" },
    { label: "SEO", icon: Globe, href: "/studio/branding" },
    { label: "Ads", icon: TrendingUp, href: "/studio/media" },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background selection:bg-primary selection:text-black">
        <Sidebar className="w-[240px] bg-card border-r border-border">
          <SidebarHeader className="h-[64px] px-6 flex items-center border-b border-border">
            <Link href="/"><TurfistaLogo size="sm" /></Link>
          </SidebarHeader>
          <SidebarContent className="p-4 space-y-1">
            <SidebarMenu>
              {MENU_ITEMS.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild className="h-11 rounded-[10px] text-muted hover:bg-surface hover:text-primary transition-all">
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4 mr-3" />
                      <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border">
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start h-11 text-destructive hover:bg-destructive/10 rounded-[10px]">
              <LogOut className="h-4 w-4 mr-3" /> 
              <span className="text-[11px] font-black uppercase tracking-widest">Terminate</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 p-8 overflow-y-auto mt-[64px] md:mt-0">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
