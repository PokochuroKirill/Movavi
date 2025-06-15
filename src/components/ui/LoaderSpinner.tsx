
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderSpinnerProps {
  size?: number;
  className?: string;
}

/**
 * Универсальный компонент спиннера Loader (анимированный "шарик").
 * Использование:
 * <LoaderSpinner /> // стандартный размер
 * <LoaderSpinner size={32} className="mb-4" />
 */
const LoaderSpinner: React.FC<LoaderSpinnerProps> = ({
  size = 32,
  className = "",
}) => (
  <Loader2
    className={cn(
      "animate-spin text-devhub-purple",
      className
    )}
    style={{ width: size, height: size }}
  />
);

export default LoaderSpinner;
