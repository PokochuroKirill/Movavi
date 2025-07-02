
import React from "react";
import { cn } from "@/lib/utils";

interface LoaderSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Универсальный компонент спиннера Loader (стандартный div-спиннер как на странице проектов).
 * Использование:
 * <LoaderSpinner /> // стандартный размер
 * <LoaderSpinner size="lg" className="mb-4" />
 */
const LoaderSpinner: React.FC<LoaderSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-b-2 border-primary",
        sizeClasses[size],
        className
      )}
    />
  );
};

export default LoaderSpinner;
