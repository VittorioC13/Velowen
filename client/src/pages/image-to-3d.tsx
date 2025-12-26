import { useState, useCallback } from "react";
import { Link } from "wouter";
import { useDropzone, FileRejection } from "react-dropzone";
import { Upload, X, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import ProcessingStatusComponent from "../components/ProcessingStatus";
import GaussianViewer from "../components/GaussianViewer";

type ProcessingStatus = "idle" | "uploading" | "processing" | "generating" | "complete" | "error";

export default function ImageTo3DPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        const errorCode = rejection.errors[0]?.code;
        let error: string;

        if (errorCode === "file-too-large") {
          const sizeMB = (rejection.file.size / (1024 * 1024)).toFixed(1);
          error = `File too large (${sizeMB}MB). Maximum size is 4.5MB.`;
        } else if (errorCode === "file-invalid-type") {
          error = "Invalid file type. Please use PNG, JPG, or WEBP.";
        } else {
          error = rejection.errors[0]?.message || "File could not be uploaded.";
        }

        setErrorMessage(error);
        setStatus("error");
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setErrorMessage(null);
        setStatus("idle");

        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  });

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setStatus("uploading");
    setProgress(10);
    setErrorMessage(null);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:image/...;base64, prefix
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      setStatus("processing");
      setProgress(30);

      // Call API endpoint
      const response = await fetch("/api/generate-3d", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64 }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate 3D scene");
      }

      setProgress(80);
      setStatus("generating");

      const result = await response.json();
      
      if (!result.success || !result.plyUrl) {
        throw new Error(result.error || "No PLY URL received");
      }

      // Use the URL directly (either Vercel Blob URL or data URL for local dev)
      setModelUrl(result.plyUrl);

      setProgress(100);
      setStatus("complete");
    } catch (error) {
      console.error("Error generating 3D:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to generate 3D scene"
      );
      setStatus("error");
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setStatus("idle");
    setProgress(0);
    setErrorMessage(null);
    setModelUrl(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Image to 3D</h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Upload Section */}
        {!modelUrl && (
          <div className="mb-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full max-h-96 mx-auto rounded-lg mb-4"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSelection();
                    }}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="mt-4">
                    <Button onClick={handleGenerate} disabled={status !== "idle"}>
                      {status === "uploading" || status === "processing" || status === "generating" ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Generate 3D Scene"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">
                    {isDragActive ? "Drop your image here" : "Upload an image"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Drag and drop or click to select a photo. We'll transform it into an
                    interactive 3D scene.
                  </p>
                  <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <span>PNG, JPG, WEBP</span>
                    <span>Max 4.5MB</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processing Status */}
        {(status === "uploading" ||
          status === "processing" ||
          status === "generating" ||
          status === "error") && (
          <div className="mb-8">
            <ProcessingStatusComponent
              status={status}
              progress={progress}
              errorMessage={errorMessage || undefined}
            />
          </div>
        )}

        {/* 3D Viewer */}
        {modelUrl && status === "complete" && (
          <div className="mb-8">
            <GaussianViewer modelUrl={modelUrl} modelType="ply" />
            <div className="mt-4 flex justify-center">
              <Button onClick={clearSelection} variant="outline">
                Generate Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

