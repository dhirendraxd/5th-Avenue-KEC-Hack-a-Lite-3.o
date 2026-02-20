interface BackgroundIllustrationsProps {
  variant?: "marketplace" | "dashboard" | "hero";
}

const variantStyles: Record<Required<BackgroundIllustrationsProps>["variant"], string> = {
  hero: "bg-primary/5",
  marketplace: "bg-accent/5",
  dashboard: "bg-success/5",
};

const BackgroundIllustrations = ({ variant = "marketplace" }: BackgroundIllustrationsProps) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className={`absolute -top-24 -left-16 h-80 w-80 rounded-full blur-3xl ${variantStyles[variant]}`} />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-muted/40 blur-3xl" />
    </div>
  );
};

export default BackgroundIllustrations;
