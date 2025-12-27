import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Upload, X, ArrowRight, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PixelatedImage from "./PixelatedImage";

// 4.5MB limit
const MAX_FILE_SIZE = 4.5 * 1024 * 1024;

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
  onDisabledClick?: () => void;
  onError?: (error: string) => void;
}

export default function ImageUpload({
  onImageSelect,
  disabled,
  onDisabledClick,
  onError,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setFileSizeError(null);
      
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
        
        setFileSizeError(error);
        onError?.(error);
        return;
      }
      
      if (acceptedFiles.length > 0 && !disabled) {
        const file = acceptedFiles[0];
        
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        onImageSelect(file);
      }
    },
    [onImageSelect, disabled, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled,
    noClick: disabled,
    noDrag: disabled,
  });

  const handleDisabledClick = () => {
    if (disabled && onDisabledClick) {
      onDisabledClick();
    }
  };

  const clearPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setFileName(null);
    setFileSizeError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div
        {...getRootProps()}
        onClick={disabled ? handleDisabledClick : getRootProps().onClick}
        className={`upload-zone relative min-h-[256px] flex flex-col justify-center ${isDragActive ? "active" : ""} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative"
            >
              <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <PixelatedImage
                  src={preview}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full"
                />

                {!disabled && (
                  <button
                    onClick={clearPreview}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-all border border-gray-200 dark:border-gray-700 shadow-sm hover:scale-105"
                  >
                    <X className="w-4 h-4 text-gray-900" />
                  </button>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <ImageIcon className="w-4 h-4" />
                    <span className="truncate">{fileName}</span>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400"
              >
                <span>Processing will begin automatically</span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <motion.div
                animate={isDragActive ? { scale: 1.05 } : {}}
                transition={{ duration: 0.15 }}
                className="relative"
              >
                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
              </motion.div>

              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  {isDragActive ? "Drop your image here" : "Upload an image"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm leading-relaxed">
                  Drag and drop or click to select a photo. We&apos;ll transform
                  it into an interactive world.
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  PNG, JPG, WEBP
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Max 4.5MB
                </span>
              </div>

              {fileSizeError && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
                >
                  {fileSizeError}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

