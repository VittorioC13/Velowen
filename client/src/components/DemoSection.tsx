"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Upload } from "lucide-react";
import GaussianViewer from "./GaussianViewer";

interface DemoSectionProps {
  /** URL to the 2D demo image */
  demoImageUrl: string;
  /** URL to the pre-generated PLY file (optional - will show image even without PLY) */
  plyUrl?: string;
  /** Demo title */
  title?: string;
  /** Demo description */
  description?: string;
}

export default function DemoSection({
  demoImageUrl,
  plyUrl,
  title = "Try Our Demo",
  description = "Click the image to see how we transform 2D photos into interactive 3D worlds",
}: DemoSectionProps) {
  const [isViewing, setIsViewing] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(demoImageUrl);
  const viewerKeyRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = useCallback(async () => {
    if (!plyUrl) {
      // Generate PLY on the fly from the demo image
      setIsViewing(true);
      setIsReplaying(true);
      
      try {
        // Convert image to base64
        const response = await fetch(demoImageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          
          // Call generate-3d API
          // Use current image (might be data URL from upload)
          let imageBase64 = base64;
          if (currentImageUrl.startsWith('data:')) {
            imageBase64 = currentImageUrl.split(',')[1];
          }
          
          const genResponse = await fetch('/api/generate-3d', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageBase64 }),
          });
          
          if (genResponse.ok) {
            const result = await genResponse.json();
            if (result.plyUrl) {
              // Update config and reload viewer
              viewerKeyRef.current += 1;
              // Store PLY URL for this session
              sessionStorage.setItem('demoPlyUrl', result.plyUrl);
            }
          }
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Failed to generate PLY:', error);
      }
      return;
    }
    
    setIsViewing(true);
    setIsReplaying(true);
    // Force re-render of viewer to replay the loading animation
    viewerKeyRef.current += 1;
  }, [plyUrl, demoImageUrl, currentImageUrl]);

  const handleReset = useCallback(() => {
    setIsViewing(false);
    setIsReplaying(false);
    viewerKeyRef.current += 1;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <AnimatePresence mode="wait">
        {!isViewing ? (
          <motion.div
            key="thumbnail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative group cursor-pointer"
            onClick={handleImageClick}
          >
            {/* 2D Photo Thumbnail */}
            <div className="relative w-full max-w-2xl mx-auto aspect-[4/3] rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.02]">
              <img
                src={currentImageUrl}
                alt="Demo - Click to view 3D"
                className="w-full h-full object-cover"
                style={{ imageRendering: 'auto' }}
                onError={() => {
                  // If image fails to load, show placeholder
                  setCurrentImageUrl('/demo/yukino.jpg');
                }}
              />
              
              {/* Upload button overlay - top right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100 z-20"
                title="Replace image"
              >
                <Upload className="w-4 h-4 text-gray-900" />
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
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              
              {/* Overlay with play button */}
              {true && (
                <>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                        <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  {/* Hint text */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg bg-white/95 text-sm text-gray-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {plyUrl ? 'Click to view in 3D' : 'Click to generate 3D'}
                  </div>
                </>
              )}
            </div>

            {/* Demo info */}
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="viewer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full"
          >
            {/* Back button */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={2} />
                <span>Back to Demo</span>
              </button>
            </div>

            {/* 3D Viewer with replay capability */}
            <div className="relative w-full h-[60vh] bg-white rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {(plyUrl || sessionStorage.getItem('demoPlyUrl')) ? (
                <GaussianViewer
                  key={viewerKeyRef.current}
                  modelUrl={plyUrl || sessionStorage.getItem('demoPlyUrl') || ''}
                  modelType="ply"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Generating 3D scene...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Replay hint */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Drag to rotate • Scroll to fly through
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

