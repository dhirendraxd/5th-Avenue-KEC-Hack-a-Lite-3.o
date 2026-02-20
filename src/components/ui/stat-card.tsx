import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
  variant?: "default" | "highlight" | "minimal";
}

const StatCard = ({
  label,
  value,
  icon: Icon,
  iconColor = "text-primary",
  trend,
  subtitle,
  className,
  variant = "default",
}: StatCardProps) => {
  if (variant === "minimal") {
    return (
      <div className={cn("p-4 rounded-xl bg-card border border-border", className)}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          {Icon && <Icon className={cn("h-4 w-4", iconColor)} />}
        </div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-border/80",
        variant === "highlight" && "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20",
        className
      )}
    >
      {/* Decorative gradient */}
      {variant === "highlight" && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
      )}
      
      <div className="flex items-start gap-4">
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
              variant === "highlight" ? "bg-primary/15" : "bg-muted"
            )}
          >
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
              {value}
            </p>
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md",
                  trend.isPositive
                    ? "text-success bg-success/10"
                    : "text-destructive bg-destructive/10"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export { StatCard };
