"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  CardFooter
} from "@/components/ui/card"
import { ArrowLeft, Sparkles, Loader2, Save, Image as ImageIcon } from "lucide-react"
import { generateTurfDescriptionForAdmin } from "@/ai/flows/generate-turf-description-for-admin"
import { useToast } from "@/hooks/use-toast"

export default function NewTurfPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    area: "",
    price: 1000,
    description: "",
    amenities: ["Floodlights", "Parking"],
    sportTypes: ["Football"] as ("Football" | "Cricket")[]
  })

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
        sportTypes: formData.sportTypes,
        pricePerHour: formData.price,
        amenities: formData.amenities,
        uniqueFeatures: "Located in the heart of Mysuru with premium amenities."
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
    toast({
      title: "Success",
      description: "New turf listing created successfully!"
    })
    router.push("/admin")
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
                    <Label htmlFor="price">Price Per Hour (₹)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      className="bg-background/50 border-white/10"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
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
                <CardTitle className="font-headline text-2xl text-accent">Upload Media</CardTitle>
                <CardDescription>High-quality images get 3x more bookings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer group">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 group-hover:text-primary transition-colors" />
                  <p className="font-bold text-lg mb-1">Click to upload photos</p>
                  <p className="text-sm text-muted-foreground">Or drag and drop images here</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1 h-14 bg-primary text-primary-foreground font-bold text-lg rounded-2xl">
                <Save className="mr-2 h-5 w-5" /> Save Listing
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