import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusIndicatorVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      status: {
        pending: "bg-warning/10 text-warning",
        active: "bg-success/10 text-success",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        error: "bg-destructive/10 text-destructive",
        info: "bg-primary/10 text-primary",
        neutral: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      status: "neutral",
    },
  }
);

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusIndicatorVariants> {
  pulse?: boolean;
}

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ className, status, pulse = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(statusIndicatorVariants({ status }), className)}
        {...props}
      >
        {pulse && (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              status === "pending" && "bg-warning animate-pulse",
              status === "active" && "bg-success animate-pulse",
              status === "success" && "bg-success",
              status === "warning" && "bg-warning animate-pulse",
              status === "error" && "bg-destructive animate-pulse",
              status === "info" && "bg-primary",
              status === "neutral" && "bg-muted-foreground"
            )}
          />
        )}
        {children}
      </div>
    );
  }
);
StatusIndicator.displayName = "StatusIndicator";

export { StatusIndicator, statusIndicatorVariants };
