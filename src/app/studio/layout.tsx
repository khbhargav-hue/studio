
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  BarChart3,
  LogOut, 
  Loader2, 
  Trophy, 
  Users, 
  Zap, 
  Megaphone,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { TurfistaLogo } from '@/components/brand-logo';
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = 'khbhargav@gmail.com';

export default function StudioLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.email !== ADMIN_EMAIL) {
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
    { label: "Dashboard", icon: BarChart3, href: "/studio" },
    { label: "Venues", icon: Zap, href: "/studio" },
    { label: "Teams", icon: Users, href: "/studio" },
    { label: "Challenges", icon: Trophy, href: "/studio" },
    { label: "Messages", icon: MessageSquare, href: "/messages" },
    { label: "Ads", icon: Megaphone, href: "/studio/media" },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background selection:bg-primary selection:text-black">
        <Sidebar className="w-[240px] bg-card border-r border-border">
          <SidebarHeader className="h-[64px] px-6 flex items-center border-b border-border">
            <Link href="/"><TurfistaLogo size="sm" /></Link>
          </SidebarHeader>
          <SidebarContent className="p-0 space-y-0 pt-4">
            <SidebarMenu>
              {MENU_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton 
                      asChild 
                      className={cn(
                        "h-12 w-full justify-start rounded-none pl-5 transition-all duration-200",
                        isActive 
                          ? "bg-[#1A1A1A] text-primary border-l-[3px] border-primary" 
                          : "text-[#888] border-l-0 hover:bg-[#111] hover:text-white"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className={cn("h-4 w-4 mr-4", isActive ? "text-primary" : "text-[#888]")} />
                        <span className="text-[13px] font-black uppercase tracking-widest">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
