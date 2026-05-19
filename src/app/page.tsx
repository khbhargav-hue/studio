
"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Zap, Users, Trophy, ChevronRight, MapPin, Swords } from "lucide-react"
import Link from "next/link"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { collection, query, limit, getDocs } from "firebase/firestore"
import { TurfCard } from "@/components/turf-card"
import { useEffect } from "react"

export default function Home() {
  const db = useFirestore()
  
  // Network Data Feeds - Simplified for resilience
  const turfsQuery = useMemoFirebase(() => query(collection(db, "turfs"), limit(4)), [db])
  const challengesQuery = useMemoFirebase(() => query(collection(db, "challenges"), limit(3)), [db])
  const teamsQuery = useMemoFirebase(() => query(collection(db, "teams"), limit(4)), [db])

  const { data: turfs } = useCollection(turfs => {
    if (turfs) {
      console.log("FETCH_SUCCESS: homepage", turfs.length);
      console.log(turfs);
    }
  }, turfsQuery)
  
  const { data: challenges } = useCollection(challengesQuery)
  const { data: teams } = useCollection(teamsQuery)

  // Audit Fetch for Console Debugging
  useEffect(() => {
    async function runAudit() {
      if (!db) return;
      console.log("FETCH_START: homepage");
      try {
        const snapshot = await getDocs(collection(db, "turfs"));
        console.log("FETCH_SUCCESS: homepage snapshot", snapshot.docs.length);
      } catch (err) {
        console.error("FETCH_ERROR: homepage", err);
      }
    }
    runAudit();
  }, [db]);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pb-32">
        {/* Grassroots Hero */}
        <section className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              <span className="animate-pulse">●</span> Mysuru Sports Network
            </div>
            <h1 className="max-w-3xl">
              Play More. <br />
              <span className="text-primary text-neon">Connect Local.</span>
            </h1>
            <p className="text-[#888] text-lg font-medium max-w-xl italic">
              Find players, teams, match challenges and sports turfs across Mysuru. 
              Built for the city's active sporting community.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild className="h-14 px-10 bg-primary text-black font-black uppercase tracking-widest text-xs">
                <Link href="/#turfs">Find Turf</Link>
              </Button>
              <Button asChild variant="outline" className="h-14 px-10 border-[#222] text-white font-black uppercase tracking-widest text-xs">
                <Link href="/teams">Join Team</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 1. Open Challenges / Needed Players Today */}
        <section className="px-4 max-w-7xl mx-auto mb-20">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <h2 className="flex items-center gap-3"><Swords className="h-5 w-5 text-primary" /> Open Challenges</h2>
            <Link href="/challenges" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {challenges?.map((challenge: any) => (
              <div key={challenge.id} className="bg-card border border-border p-6 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">{challenge.sport} • {challenge.date}</p>
                  <h3 className="text-lg font-black uppercase italic mb-1">{challenge.teamName} <span className="text-[#444] mx-2">VS</span> ???</h3>
                  <p className="text-xs text-[#888] flex items-center gap-1"><MapPin className="h-3 w-3" /> {challenge.turf || "Location Pending"}</p>
                </div>
                <Button asChild size="sm" className="mt-6 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-primary hover:text-black">
                  <Link href={`/challenges`}>Accept Match</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Nearby Turfs */}
        <section id="turfs" className="px-4 max-w-7xl mx-auto mb-20 scroll-mt-20">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <h2 className="flex items-center gap-3"><Zap className="h-5 w-5 text-primary" /> Top Venues</h2>
            <Link href="/#turfs" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Refresh</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {turfs?.map((turf) => (
              <TurfCard key={turf.id} turf={turf as any} />
            ))}
          </div>
          {!turfs || turfs.length === 0 && (
             <div className="py-20 text-center border border-dashed border-border rounded-xl">
                <p className="text-muted text-sm italic font-medium">No turfs yet. Synchronization in progress.</p>
             </div>
          )}
        </section>

        {/* 3. Featured Teams */}
        <section className="px-4 max-w-7xl mx-auto mb-20">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <h2 className="flex items-center gap-3"><Users className="h-5 w-5 text-primary" /> Active Squads</h2>
            <Link href="/teams" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Browse Roster</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {teams?.map((team: any) => (
              <Link key={team.id} href={`/teams/${team.id}`} className="bg-card border border-border p-6 hover:border-primary group">
                <div className="h-12 w-12 bg-primary/10 flex items-center justify-center mb-4 text-primary font-black italic">
                  {team.name ? team.name[0] : 'T'}
                </div>
                <h3 className="font-black uppercase italic text-sm group-hover:text-primary truncate">{team.name}</h3>
                <p className="text-[10px] text-[#444] font-bold uppercase tracking-widest mt-1">{team.sport} • {team.area}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}
