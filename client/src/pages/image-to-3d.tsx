import { useState, useCallback, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Upload,
  Wand2,
  Box,
} from "lucide-react";
import ImageUpload from "../components/ImageUpload";
import PromptInput from "../components/PromptInput";
import GaussianViewer from "../components/GaussianViewer";
import ProcessingStatus from "../components/ProcessingStatus";
import PixelatedImage from "../components/PixelatedImage";

type AppState = "upload" | "processing" | "viewing" | "error";
type ProcessingStage = "uploading" | "processing" | "generating" | "complete" | "error";
type ModelType = "ply" | "glb" | "gltf";

export default function ImageTo3DPage() {
  const [appState, setAppState] = useState<AppState>("upload");
  const [activeTab, setActiveTab] = useState<"upload" | "prompt">("prompt");
  const [processingStage, setProcessingStage] = useState<ProcessingStage>("uploading");
  const [processingMode, setProcessingMode] = useState<"upload" | "prompt">("upload");
  const [progress, setProgress] = useState(0);
  const [stageProgress, setStageProgress] = useState<number | undefined>(undefined);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelType, setModelType] = useState<ModelType>("ply");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSceneName, setCurrentSceneName] = useState<string | null>(null);

  const handleImageSelect = useCallback(async (file: File) => {
    setAppState("processing");
    setProcessingMode("upload");
    setProcessingStage("uploading");
    setProgress(0);
    setStageProgress(undefined);
    setError(null);

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    const fileName = file.name.replace(/\.[^/.]+$/, "") || "Scene";
    setCurrentSceneName(fileName);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      setProgress(10);
      setProcessingStage("processing");
      setStageProgress(0);

      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setProgress(20);

      // Start progress estimation timer
      const estimatedDuration = 60000;
      const startTime = Date.now();
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const rawProgress = Math.min(95, (elapsed / estimatedDuration) * 100);
        const easedProgress = rawProgress < 50 
          ? rawProgress 
          : 50 + (rawProgress - 50) * 0.5;
        setStageProgress(Math.min(95, easedProgress));
      }, 500);

      const response = await fetch("/api/generate-3d", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64 }),
      });

      clearInterval(progressInterval);
      progressInterval = null;
      setStageProgress(100);
      setProgress(30);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate 3D scene");
      }

      const result = await response.json();

      if (!result.success || !result.plyUrl) {
        throw new Error(result.error || "No PLY URL received");
      }

      setStageProgress(undefined);

      for (let i = 30; i <= 90; i += 10) {
        await new Promise((r) => setTimeout(r, 200));
        setProgress(i);
      }

      setProcessingStage("generating");
      setProgress(95);
      setProcessingStage("complete");
      setProgress(100);

      setModelUrl(result.plyUrl);
      setModelType("ply");

      await new Promise((r) => setTimeout(r, 500));
      setAppState("viewing");
    } catch (err) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      console.error("Processing error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setProcessingStage("error");
      setAppState("error");
    }
  }, []);

  const handlePromptSubmit = useCallback(async (prompt: string) => {
    setAppState("processing");
    setProcessingMode("prompt");
    setProcessingStage("uploading");
    setProgress(0);
    setStageProgress(undefined);
    setError(null);

    const sceneName = prompt.length > 50 ? prompt.substring(0, 47) + "..." : prompt;
    setCurrentSceneName(sceneName);

    // For now, prompt mode is not implemented - just show error
    setError("Prompt mode not yet implemented. Please use Upload mode.");
    setProcessingStage("error");
    setAppState("error");
  }, []);

  const handleReset = useCallback(() => {
    setAppState("upload");
    setProcessingStage("uploading");
    setProgress(0);
    setStageProgress(undefined);
    setModelUrl(null);
    setModelType("ply");
    setPreviewUrl(null);
    setError(null);
    setCurrentSceneName(null);
  }, []);

  const handleBackDuringProcessing = useCallback(() => {
    setAppState("upload");
    setProcessingStage("uploading");
    setProgress(0);
    setStageProgress(undefined);
    setPreviewUrl(null);
    setError(null);
    setCurrentSceneName(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Back to Home
            </button>
          </Link>
          <h1 className="text-xl font-bold">Velowen</h1>
          <div className="w-24" />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-12 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {appState === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Hero Section */}
                <div className="mb-10">
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight mb-1"
                  >
                    World Model
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-snug"
                  >
                    Transform any photo into an interactive 3D scene.
                  </motion.p>
                </div>

                {/* Tab Selector */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mb-6"
                >
                  <div className="inline-flex p-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setActiveTab("prompt")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === "prompt"
                          ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                      }`}
                    >
                      <Wand2 className="w-4 h-4" strokeWidth={2} />
                      <span>Prompt</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("upload")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === "upload"
                          ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                      }`}
                    >
                      <Upload className="w-4 h-4" strokeWidth={2} />
                      <span>Upload</span>
                    </button>
                  </div>
                </motion.div>

                {/* Upload Zone / Prompt Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-10"
                >
                  <AnimatePresence mode="wait">
                    {activeTab === "upload" ? (
                      <motion.div
                        key="upload-tab"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ImageUpload 
                          onImageSelect={handleImageSelect}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="prompt-tab"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <PromptInput
                          onSubmit={handlePromptSubmit}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}

            {appState === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-xl mx-auto pt-8"
              >
                <div className="mb-6">
                  <button
                    onClick={handleBackDuringProcessing}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Back to home"
                  >
                    <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>

                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold mb-2">
                    Creating Your 3D Scene
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Analyzing your image and generating a 3D representation...
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    You can go back while this processes
                  </p>
                </div>

                <div className="relative w-full max-w-sm mx-auto aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-8 bg-white dark:bg-gray-800">
                  {previewUrl ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0"
                    >
                      <PixelatedImage
                        src={previewUrl}
                        alt="Processing"
                        className="absolute inset-0 w-full h-full"
                      />
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <ProcessingStatus
                  status={processingStage}
                  progress={progress}
                  errorMessage={error || undefined}
                  stageProgress={processingStage === "processing" ? stageProgress : undefined}
                  mode={processingMode}
                />
              </motion.div>
            )}

            {appState === "viewing" && modelUrl && (
              <motion.div
                key="viewing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-8"
              >
                <div className="mb-6">
                  <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                    <button
                      onClick={handleReset}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                      aria-label="Back to home"
                    >
                      <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <h2 className="text-2xl font-semibold truncate">
                      {currentSceneName || "Your 3D Scene"}
                    </h2>
                  </div>
                </div>

                <GaussianViewer
                  modelUrl={modelUrl}
                  modelType={modelType}
                />
              </motion.div>
            )}

            {appState === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-xl mx-auto pt-24"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mx-auto mb-6 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Processing Failed
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {error || "Something went wrong while processing your image."}
                  </p>
                </div>

                <div className="text-center">
                  <button 
                    onClick={handleReset} 
                    className="px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
                  >
                    <span>Try Again</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Powered by{" "}
              <a
                href="https://github.com/apple/ml-sharp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 dark:text-gray-100 hover:underline"
              >
                ML-SHARP
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
