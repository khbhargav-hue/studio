'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2, Cloud } from "lucide-react";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CloudinaryPickerProps {
  onSelect: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
}

export function CloudinaryPicker({ 
  onSelect, 
  folder = "Turfista", 
  label = "Choose from Library",
  className,
  variant = "outline"
}: CloudinaryPickerProps) {
  const { toast } = useToast();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  const openMediaLibrary = () => {
    if (!cloudName || !apiKey) {
      toast({
        variant: "destructive",
        title: "Configuration Required",
        description: "Please define NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY in your .env file."
      });
      return;
    }

    if (!(window as any).cloudinary) return;

    setIsOpening(true);

    try {
      (window as any).cloudinary.openMediaLibrary(
        {
          cloud_name: cloudName,
          api_key: apiKey,
          insert_caption: "Insert into Turfista",
          multiple: false,
          folder: {
            path: folder,
            resource_type: "image"
          },
          default_transformations: [
            { quality: "auto", fetch_format: "auto" }
          ]
        },
        {
          insertHandler: (data: any) => {
            const url = data.assets[0].secure_url;
            onSelect(url);
          }
        }
      );
    } catch (err) {
      console.error("Cloudinary Widget Error:", err);
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <>
      <Script 
        src="https://media-library.cloudinary.com/global/all.js" 
        onLoad={() => setIsScriptLoaded(true)}
      />
      <Button
        type="button"
        variant={variant}
        onClick={openMediaLibrary}
        disabled={!isScriptLoaded || isOpening}
        className={cn(
          "font-black uppercase tracking-widest text-[9px] h-10 px-6 rounded-xl gap-2",
          variant === "outline" && "border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-black",
          className
        )}
      >
        {isOpening ? <Loader2 className="h-3 w-3 animate-spin" /> : <Database className="h-3 w-3" />}
        {label}
      </Button>
    </>
  );
}
