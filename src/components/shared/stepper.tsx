import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: string;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  const normalizedCurrent = currentStep.toLowerCase().replace(/_/g, " ");
  const currentIndex = steps.findIndex(
    (step) => step.toLowerCase().replace(/_/g, " ") === normalizedCurrent
  );

  return (
    <div className={cn("w-full py-4 overflow-x-auto", className)}>
      <div className="flex items-center min-w-[600px] justify-between relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-border -translate-y-1/2 z-0" />
        
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isPending = index > currentIndex;
          const stepLabel = step.replace(/_/g, " ");

          return (
            <div key={step} className="flex flex-col items-center relative z-10 bg-white px-3">
              {/* Dot */}
              <div
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center border text-[11px] font-mono font-bold transition-all duration-200",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isActive && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20 scale-110",
                  isPending && "bg-white border-border text-foreground/30"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5 stroke-[3px]" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Text Label */}
              <span
                className={cn(
                  "font-mono text-[9px] font-bold tracking-widest uppercase mt-2 whitespace-nowrap",
                  isActive ? "text-foreground" : "text-foreground/40"
                )}
              >
                {stepLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
