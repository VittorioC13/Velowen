import { motion } from "framer-motion";
import { AlertCircle, Image, Cpu, Sparkles, CheckCircle2 } from "lucide-react";

interface ProcessingStatusProps {
  status: "uploading" | "processing" | "generating" | "complete" | "error";
  progress?: number;
  errorMessage?: string;
  stageProgress?: number;
  mode?: "upload" | "prompt";
}

type StageId = "uploading" | "processing" | "generating" | "complete";

interface Stage {
  id: StageId;
  label: string;
  labelComplete: string;
  description: string;
  descriptionComplete: string;
  estimatedSeconds: number;
  showTimeEstimate: boolean;
}

function getStages(mode: "upload" | "prompt"): Stage[] {
  const isPrompt = mode === "prompt";
  
  return [
    {
      id: "uploading",
      label: isPrompt ? "Generating Image" : "Uploading Image",
      labelComplete: isPrompt ? "Generated" : "Uploaded",
      description: isPrompt ? "Creating image from your prompt" : "Transferring your image to the server",
      descriptionComplete: isPrompt ? "Image generated from prompt" : "Image transferred to server",
      estimatedSeconds: isPrompt ? 8 : 5,
      showTimeEstimate: false,
    },
    {
      id: "processing",
      label: "Analyzing Scene",
      labelComplete: "Analyzed",
      description: "Running neural network inference",
      descriptionComplete: "Neural network inference complete",
      estimatedSeconds: 60,
      showTimeEstimate: true,
    },
    {
      id: "generating",
      label: "Generating 3D",
      labelComplete: "Generated",
      description: "Creating 3D representation",
      descriptionComplete: "3D representation created",
      estimatedSeconds: 10,
      showTimeEstimate: true,
    },
    {
      id: "complete",
      label: "Complete",
      labelComplete: "Complete",
      description: "Your 3D scene is ready to explore",
      descriptionComplete: "Your 3D scene is ready to explore",
      estimatedSeconds: 0,
      showTimeEstimate: false,
    },
  ];
}

function StageIcon({ 
  stageId, 
  isComplete, 
  isAnimating,
  className = "",
}: { 
  stageId: StageId; 
  isComplete: boolean;
  isAnimating: boolean;
  className?: string;
}) {
  if (isComplete) {
    return (
      <CheckCircle2
        className={`w-5 h-5 text-green-500 ${className}`}
      />
    );
  }

  const iconClassName = `text-white ${className}`;

  switch (stageId) {
    case "uploading":
      return <Image className={`w-5 h-5 ${iconClassName} ${isAnimating ? 'animate-pulse' : ''}`} />;
    case "processing":
      return <Cpu className={`w-5 h-5 ${iconClassName} ${isAnimating ? 'animate-pulse' : ''}`} />;
    case "generating":
      return <Sparkles className={`w-5 h-5 ${iconClassName} ${isAnimating ? 'animate-pulse' : ''}`} />;
    case "complete":
      return <CheckCircle2 className={`w-5 h-5 ${iconClassName} ${isAnimating ? 'animate-pulse' : ''}`} />;
    default:
      return null;
  }
}

export default function ProcessingStatus({
  status,
  progress = 0,
  errorMessage,
  stageProgress,
  mode = "upload",
}: ProcessingStatusProps) {
  const stages = getStages(mode);
  const currentIndex = stages.findIndex((s) => s.id === status);
  const currentStage = stages[currentIndex] || stages[0];
  const isComplete = status === "complete";

  const getTimeRemaining = () => {
    if (isComplete) return null;
    if (!currentStage.showTimeEstimate) return null;
    
    if (stageProgress !== undefined && stageProgress > 0) {
      const remaining = Math.max(1, Math.round((100 - stageProgress) / 100 * currentStage.estimatedSeconds));
      return remaining;
    }
    
    if (status === "processing") {
      const remaining = Math.max(1, Math.round((100 - progress) / 100 * currentStage.estimatedSeconds));
      return remaining;
    }
    
    return null;
  };

  const timeRemaining = getTimeRemaining();

  if (status === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-xl p-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-red-600 dark:text-red-400">Processing Failed</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {errorMessage || "Something went wrong. Please try again."}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const effectiveProgress = stageProgress !== undefined && status === "processing"
    ? Math.round(20 + (stageProgress / 100) * 60)
    : progress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            isComplete
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-gray-900 dark:bg-gray-100"
          }`}
        >
          <StageIcon
            stageId={currentStage.id}
            isComplete={isComplete}
            isAnimating={!isComplete}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-sm font-medium ${isComplete ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}>
              {isComplete ? currentStage.labelComplete : currentStage.label}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
              {effectiveProgress}%
            </span>
          </div>

          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-1.5">
            <motion.div
              className={`h-full rounded-full ${isComplete ? "bg-green-500" : "bg-gray-900 dark:bg-gray-100"}`}
              initial={{ width: 0 }}
              animate={{ width: `${effectiveProgress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {isComplete ? currentStage.descriptionComplete : currentStage.description}
            </p>
            {timeRemaining !== null && (
              <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums flex-shrink-0 ml-2">
                ~{timeRemaining}s
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
