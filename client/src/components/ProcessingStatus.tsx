import { motion } from "framer-motion";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

interface ProcessingStatusProps {
  status: "uploading" | "processing" | "generating" | "complete" | "error";
  progress?: number;
  errorMessage?: string;
}

export default function ProcessingStatus({
  status,
  progress = 0,
  errorMessage,
}: ProcessingStatusProps) {
  if (status === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200">
              Processing Failed
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400">
              {errorMessage || "Something went wrong. Please try again."}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const getStatusInfo = () => {
    switch (status) {
      case "uploading":
        return {
          label: "Uploading Image",
          description: "Transferring your image to the server",
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
        };
      case "processing":
        return {
          label: "Analyzing Scene",
          description: "Running neural network inference",
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
        };
      case "generating":
        return {
          label: "Generating 3D",
          description: "Creating 3D representation",
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
        };
      case "complete":
        return {
          label: "Complete",
          description: "Your 3D scene is ready to explore",
          icon: <CheckCircle2 className="w-5 h-5" />,
        };
      default:
        return {
          label: "Processing",
          description: "Please wait...",
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const isComplete = status === "complete";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isComplete
              ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
              : "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          }`}
        >
          {statusInfo.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`font-medium ${
                isComplete
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {statusInfo.label}
            </span>
            {!isComplete && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {progress}%
              </span>
            )}
          </div>
          {!isComplete && (
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
              <motion.div
                className={`h-full ${
                  isComplete
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {statusInfo.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

