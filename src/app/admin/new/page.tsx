
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft, Sparkles, Loader2, Save, Image as ImageIcon } from "lucide-react"
import { generateTurfDescriptionForAdmin } from "@/ai/flows/generate-turf-description-for-admin"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useUser, useDoc } from "@/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

function NewTurfForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const db = useFirestore()
  const { user, loading: userLoading } = useUser()
  const editId = searchParams.get("id")
  const { data: existingTurf, loading: loadingExisting } = useDoc(editId ? doc(db!, "turfs", editId) : null)

  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    location: "",
    pricePerHour: 1000,
    description: "",
    amenities: ["Floodlights", "Parking"],
    sportTypes: ["Football"] as string[],
    courtTypes: ["Full Court"] as string[],
    rating: 4.5,
    reviewCount: 0,
    openingHours: "06:00 AM - 10:30 PM",
    contactNumber: "",
    whatsappNumber: "",
    images: ["https://picsum.photos/seed/turf1/800/600"]
  })

  useEffect(() => {
    if (!userLoading && (!user || user.email !== "admin@turfista.com")) {
      router.push("/login")
    }
  }, [user, userLoading, router])

  useEffect(() => {
    if (existingTurf) {
      setFormData({
        ...existingTurf,
        pricePerHour: existingTurf.pricePerHour || 1000
      })
    }
  }, [existingTurf])

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.area) {
      toast({
        title: "Information Required",
        description: "Please enter the turf name and area before generating a description.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateTurfDescriptionForAdmin({
        turfName: formData.name,
        location: `${formData.area}, Mysuru`,
        sportTypes: formData.sportTypes as ("Football" | "Cricket")[],
        pricePerHour: formData.pricePerHour,
        amenities: formData.amenities,
        uniqueFeatures: `Located in ${formData.area}, Mysuru with premium facilities.`
      })
      setFormData(prev => ({ ...prev, description: result.description }))
      toast({
        title: "AI Description Generated",
        description: "A compelling marketing description has been created for you."
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Generation Failed",
        description: "There was an error generating the description. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!db) return

    const id = editId || formData.name.toLowerCase().replace(/\s+/g, '-')
    const turfRef = doc(db, "turfs", id)
    
    setDoc(turfRef, {
      ...formData,
      id,
      updatedAt: serverTimestamp()
    }, { merge: true })
    .catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: turfRef.path,
        operation: editId ? 'update' : 'create',
        requestResourceData: formData
      })
      errorEmitter.emit('permission-error', permissionError)
    })

    toast({
      title: editId ? "Turf Updated" : "Turf Created",
      description: `${formData.name} has been saved successfully.`
    })
    router.push("/admin")
  }

  if (userLoading || (editId && loadingExisting)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-6 hover:bg-white/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Basic Information</CardTitle>
                <CardDescription>Enter the essential details for your sports venue.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Turf Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g., Champions Arena" 
                      className="bg-background/50 border-white/10"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area in Mysuru</Label>
                    <Input 
                      id="area" 
                      placeholder="e.g., Vijayanagar" 
                      className="bg-background/50 border-white/10"
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pricePerHour">Price Per Hour (₹)</Label>
                    <Input 
                      id="pricePerHour" 
                      type="number" 
                      className="bg-background/50 border-white/10"
                      value={formData.pricePerHour}
                      onChange={(e) => setFormData({...formData, pricePerHour: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sports Supported</Label>
                    <div className="flex gap-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="football" 
                          checked={formData.sportTypes.includes("Football")}
                          onCheckedChange={(checked) => {
                            if (checked) setFormData({...formData, sportTypes: [...formData.sportTypes, "Football"]})
                            else setFormData({...formData, sportTypes: formData.sportTypes.filter(s => s !== "Football")})
                          }}
                        />
                        <label htmlFor="football" className="text-sm font-medium">Football</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="cricket" 
                          checked={formData.sportTypes.includes("Cricket")}
                          onCheckedChange={(checked) => {
                            if (checked) setFormData({...formData, sportTypes: [...formData.sportTypes, "Cricket"]})
                            else setFormData({...formData, sportTypes: formData.sportTypes.filter(s => s !== "Cricket")})
                          }}
                        />
                        <label htmlFor="cricket" className="text-sm font-medium">Cricket</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (0-5)</Label>
                    <Input 
                      id="rating" 
                      type="number" 
                      step="0.1"
                      className="bg-background/50 border-white/10"
                      value={formData.rating}
                      onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number (e.g., 919900000001)</Label>
                    <Input 
                      id="whatsapp" 
                      placeholder="91..." 
                      className="bg-background/50 border-white/10"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-2xl">Description</CardTitle>
                  <CardDescription>Tell players why they should book your venue.</CardDescription>
                </div>
                <Button 
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="bg-accent text-accent-foreground font-bold hover:opacity-90"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  AI Write
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Tell people about your turf..." 
                  className="min-h-[200px] bg-background/50 border-white/10"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-accent">Venue Media</CardTitle>
                <CardDescription>Add the public image URL for this turf.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input 
                    id="image" 
                    placeholder="https://..." 
                    className="bg-background/50 border-white/10"
                    value={formData.images[0]}
                    onChange={(e) => setFormData({...formData, images: [e.target.value]})}
                  />
                </div>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/20 flex items-center justify-center">
                  {formData.images[0] ? (
                    <img src={formData.images[0]} alt="Preview" className="object-cover w-full h-full" />
                  ) : (
                    <div className="text-muted-foreground text-center p-8">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>Image Preview</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1 h-14 bg-primary text-primary-foreground font-bold text-lg rounded-2xl shadow-lg shadow-primary/20">
                <Save className="mr-2 h-5 w-5" /> {editId ? "Update Listing" : "Save Listing"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.back()} className="h-14 px-8 border border-white/10 rounded-2xl">
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewTurfPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <NewTurfForm />
    </Suspense>
  )
}
