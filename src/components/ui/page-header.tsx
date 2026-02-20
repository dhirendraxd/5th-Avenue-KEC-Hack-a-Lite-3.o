import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}

const PageHeader = ({
  title,
  description,
  actions,
  className,
  badge,
}: PageHeaderProps) => {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-muted-foreground max-w-2xl">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
};

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const SectionHeader = ({
  title,
  description,
  actions,
  className,
  icon,
}: SectionHeaderProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between mb-5",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export { PageHeader, SectionHeader };
