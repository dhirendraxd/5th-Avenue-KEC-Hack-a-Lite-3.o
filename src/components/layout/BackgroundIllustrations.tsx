interface BackgroundIllustrationsProps {
  variant?: "marketplace" | "dashboard" | "hero";
}

const BackgroundIllustrations = ({ variant = "marketplace" }: BackgroundIllustrationsProps) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft gradient blurs */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float-gentle" style={{ animationDelay: "0s" }} />
      <div className="absolute top-1/3 right-10 w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-float-gentle" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-success/5 blur-3xl animate-float-gentle" style={{ animationDelay: "4s" }} />

      {variant === "marketplace" && (
        <>
          {/* Search/Discovery themed - Magnifying gear */}
          <svg
            className="absolute top-20 right-12 w-32 h-32 text-primary/[0.04] dark:text-primary/[0.06] animate-float-gentle"
            style={{ animationDelay: "1s" }}
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <circle cx="42" cy="42" r="28" fill="none" stroke="currentColor" strokeWidth="6"/>
            <line x1="62" y1="62" x2="90" y2="90" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
            <circle cx="42" cy="42" r="12"/>
          </svg>

          {/* Grid pattern - representing catalog */}
          <svg
            className="absolute bottom-32 left-8 w-40 h-40 text-muted-foreground/[0.03] dark:text-muted-foreground/[0.05] animate-float-gentle"
            style={{ animationDelay: "3s" }}
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <rect x="5" y="5" width="25" height="25" rx="4"/>
            <rect x="37" y="5" width="25" height="25" rx="4"/>
            <rect x="69" y="5" width="25" height="25" rx="4"/>
            <rect x="5" y="37" width="25" height="25" rx="4"/>
            <rect x="37" y="37" width="25" height="25" rx="4"/>
            <rect x="69" y="37" width="25" height="25" rx="4"/>
            <rect x="5" y="69" width="25" height="25" rx="4"/>
            <rect x="37" y="69" width="25" height="25" rx="4"/>
            <rect x="69" y="69" width="25" height="25" rx="4"/>
          </svg>

          {/* Location pin - nearby equipment */}
          <svg
            className="absolute top-1/2 left-6 w-24 h-24 text-accent/[0.05] dark:text-accent/[0.07] animate-sway"
            style={{ transformOrigin: "center bottom" }}
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <path d="M50 5C30 5 15 20 15 40c0 25 35 55 35 55s35-30 35-55c0-20-15-35-35-35zm0 50c-8.3 0-15-6.7-15-15s6.7-15 15-15 15 6.7 15 15-6.7 15-15 15z"/>
          </svg>

          {/* Forklift silhouette - bottom right */}
          <svg
            className="absolute bottom-16 right-16 w-36 h-36 text-primary/[0.03] dark:text-primary/[0.05] animate-float-gentle"
            style={{ animationDelay: "2.5s" }}
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <rect x="20" y="50" width="45" height="25" rx="3"/>
            <rect x="25" y="35" width="20" height="15" rx="2"/>
            <rect x="65" y="20" width="8" height="55"/>
            <rect x="62" y="15" width="14" height="5"/>
            <rect x="62" y="25" width="14" height="3"/>
            <rect x="62" y="35" width="14" height="3"/>
            <circle cx="30" cy="80" r="8"/>
            <circle cx="55" cy="80" r="8"/>
          </svg>
        </>
      )}

      {variant === "dashboard" && (
        <>
          {/* Chart/Analytics bars */}
          <svg
            className="absolute top-24 right-8 w-36 h-36 text-primary/[0.04] dark:text-primary/[0.06] animate-float-gentle"
            style={{ animationDelay: "0.5s" }}
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <rect x="10" y="60" width="15" height="35" rx="2"/>
            <rect x="30" y="40" width="15" height="55" rx="2"/>
            <rect x="50" y="25" width="15" height="70" rx="2"/>
            <rect x="70" y="45" width="15" height="50" rx="2"/>
          </svg>

          {/* Gear - settings/management - rotating */}
          <svg
            className="absolute top-1/3 left-6 w-28 h-28 text-muted-foreground/[0.04] dark:text-muted-foreground/[0.06] animate-rotate-slow"
            style={{ transformOrigin: "center center" }}
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <path d="M50 35a15 15 0 1 0 0 30 15 15 0 0 0 0-30zm0 25a10 10 0 1 1 0-20 10 10 0 0 1 0 10z"/>
            <path d="M90 42h-5a35 35 0 0 0-4-10l4-4-7-7-4 4a35 35 0 0 0-10-4v-5h-10v5a35 35 0 0 0-10 4l-4-4-7 7 4 4a35 35 0 0 0-4 10h-5v10h5a35 35 0 0 0 4 10l-4 4 7 7 4-4a35 35 0 0 0 10 4v5h10v-5a35 35 0 0 0 10-4l4 4 7-7-4-4a35 35 0 0 0 4-10h5v-10z"/>
          </svg>

          {/* Calendar icon */}
          <svg
            className="absolute bottom-20 left-12 w-32 h-32 text-accent/[0.04] dark:text-accent/[0.06] animate-float-gentle"
            style={{ animationDelay: "1.5s" }}
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <rect x="10" y="20" width="80" height="70" rx="8" fill="none" stroke="currentColor" strokeWidth="4"/>
            <line x1="10" y1="40" x2="90" y2="40" stroke="currentColor" strokeWidth="4"/>
            <rect x="25" y="10" width="8" height="20" rx="2"/>
            <rect x="67" y="10" width="8" height="20" rx="2"/>
            <rect x="25" y="52" width="12" height="12" rx="2"/>
            <rect x="44" y="52" width="12" height="12" rx="2"/>
            <rect x="63" y="52" width="12" height="12" rx="2"/>
            <rect x="25" y="70" width="12" height="12" rx="2"/>
            <rect x="44" y="70" width="12" height="12" rx="2"/>
          </svg>

          {/* Checkmark/approval */}
          <svg
            className="absolute bottom-1/3 right-10 w-24 h-24 text-success/[0.05] dark:text-success/[0.07] animate-float-gentle"
            style={{ animationDelay: "2s" }}
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.3"/>
            <polyline points="30,52 45,67 70,35"/>
          </svg>

          {/* Network nodes - connections */}
          <svg
            className="absolute top-2/3 right-1/4 w-28 h-28 text-primary/[0.04] dark:text-primary/[0.06] animate-sway"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <circle cx="50" cy="20" r="10"/>
            <circle cx="20" cy="70" r="10"/>
            <circle cx="80" cy="70" r="10"/>
            <line x1="50" y1="30" x2="25" y2="62" stroke="currentColor" strokeWidth="3"/>
            <line x1="50" y1="30" x2="75" y2="62" stroke="currentColor" strokeWidth="3"/>
            <line x1="30" y1="70" x2="70" y2="70" stroke="currentColor" strokeWidth="3"/>
          </svg>

          {/* Small gear - bottom right - rotating reverse */}
          <svg
            className="absolute bottom-40 right-6 w-20 h-20 text-muted-foreground/[0.03] dark:text-muted-foreground/[0.05] animate-rotate-slow-reverse"
            style={{ transformOrigin: "center center" }}
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <path d="M50 35a15 15 0 1 0 0 30 15 15 0 0 0 0-30zm0 25a10 10 0 1 1 0-20 10 10 0 0 1 0 10z"/>
            <path d="M90 42h-5a35 35 0 0 0-4-10l4-4-7-7-4 4a35 35 0 0 0-10-4v-5h-10v5a35 35 0 0 0-10 4l-4-4-7 7 4 4a35 35 0 0 0-4 10h-5v10h5a35 35 0 0 0 4 10l-4 4 7 7 4-4a35 35 0 0 0 10 4v5h10v-5a35 35 0 0 0 10-4l4 4 7-7-4-4a35 35 0 0 0 4-10h5v-10z"/>
          </svg>
        </>
      )}
    </div>
  );
};

export default BackgroundIllustrations;
