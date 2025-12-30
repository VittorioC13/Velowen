"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Upload } from "lucide-react";
import { useLocation } from "wouter";

interface DemoSectionProps {
  /** URL to the 2D demo image */
  demoImageUrl: string;
  /** URL to the pre-generated PLY file (optional - will show image even without PLY) */
  plyUrl?: string;
}

export default function DemoSection({
  demoImageUrl,
  plyUrl,
}: DemoSectionProps) {
  const [, setLocation] = useLocation();
  const [currentImageUrl, setCurrentImageUrl] = useState(demoImageUrl);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Demo panel clicked', { currentImageUrl, plyUrl });
    
    // Store demo info for full-screen viewer
    sessionStorage.setItem('demoImageUrl', currentImageUrl);
    sessionStorage.setItem('demoTrigger', Date.now().toString());
    if (plyUrl) {
      sessionStorage.setItem('demoPlyUrl', plyUrl);
    }
    
    // Force hard navigation to trigger useEffect
    window.location.href = '/image-to-3d?demo=true&t=' + Date.now();
  }, [currentImageUrl, plyUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div
        className="relative group cursor-pointer"
        onClick={handleImageClick}
      >
        {/* 2D Photo Thumbnail */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.03]">
          {!imageError ? (
            <img
              src={currentImageUrl}
              alt="Demo"
              className="w-full h-full object-cover"
              style={{ imageRendering: 'auto' }}
              onError={() => {
                console.error('Failed to load demo image:', currentImageUrl);
                setImageError(true);
              }}
              onLoad={() => {
                setImageError(false);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center text-gray-400 dark:text-gray-600">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">Image not found</p>
              </div>
            </div>
          )}
          
          {/* Upload button overlay - top right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100 z-20"
            title="Replace image"
          >
            <Upload className="w-3.5 h-3.5 text-gray-900" />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const result = event.target?.result as string;
                  setCurrentImageUrl(result);
                  setImageError(false);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          
          {/* Overlay with play button - no text */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-gray-900 ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
