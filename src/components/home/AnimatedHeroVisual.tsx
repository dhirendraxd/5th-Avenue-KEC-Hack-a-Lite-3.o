import { Package, Truck, Wrench, Cog, Factory, Zap, ArrowUpRight, BarChart3, Hammer, Drill, HardHat, Forklift } from "lucide-react";

const AnimatedHeroVisual = () => {
  // Generate particle positions
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 4,
  }));

  return (
    <div className="relative w-full aspect-square lg:aspect-[4/3] lg:scale-110 lg:translate-x-4 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-muted to-accent/5 border border-border/50">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-primary/40 animate-particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Moving equipment silhouettes - left to right */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] animate-silhouette-lr" style={{ animationDelay: '0s' }}>
          <Forklift className="h-16 w-16 text-primary/10" />
        </div>
        <div className="absolute top-[60%] animate-silhouette-lr" style={{ animationDelay: '4s' }}>
          <Truck className="h-20 w-20 text-accent/10" />
        </div>
        <div className="absolute top-[40%] animate-silhouette-lr" style={{ animationDelay: '8s' }}>
          <HardHat className="h-14 w-14 text-primary/10" />
        </div>
      </div>

      {/* Moving equipment silhouettes - right to left */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[35%] animate-silhouette-rl" style={{ animationDelay: '2s' }}>
          <Drill className="h-10 w-10 text-accent/10" />
        </div>
        <div className="absolute top-[75%] animate-silhouette-rl" style={{ animationDelay: '6s' }}>
          <Hammer className="h-12 w-12 text-primary/10" />
        </div>
      </div>

      {/* Floating equipment icons */}
      <div className="absolute top-[15%] left-[10%] animate-float-slow">
        <div className="p-5 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-sm hover:scale-110 transition-transform">
          <Truck className="h-10 w-10 text-primary" />
        </div>
      </div>

      <div className="absolute top-[25%] right-[15%] animate-float-medium">
        <div className="p-5 rounded-xl bg-accent/10 border border-accent/20 backdrop-blur-sm hover:scale-110 transition-transform">
          <Factory className="h-10 w-10 text-accent" />
        </div>
      </div>

      <div className="absolute bottom-[30%] left-[20%] animate-float-fast">
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 backdrop-blur-sm hover:scale-110 transition-transform">
          <Wrench className="h-8 w-8 text-warning" />
        </div>
      </div>

      <div className="absolute top-[50%] right-[25%] animate-float-slow" style={{ animationDelay: '1s' }}>
        <div className="p-4 rounded-lg bg-success/10 border border-success/20 backdrop-blur-sm hover:scale-110 transition-transform">
          <Cog className="h-8 w-8 text-success animate-spin-slow" />
        </div>
      </div>

      <div className="absolute bottom-[20%] right-[10%] animate-float-medium" style={{ animationDelay: '0.5s' }}>
        <div className="p-5 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-sm hover:scale-110 transition-transform">
          <Package className="h-9 w-9 text-primary" />
        </div>
      </div>

      {/* Orbiting dots around center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-64 h-64">
          <div className="absolute inset-0 animate-orbit">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary/60" />
          </div>
          <div className="absolute inset-0 animate-orbit-reverse">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent/60" />
          </div>
          <div className="absolute inset-0 animate-orbit" style={{ animationDuration: '12s' }}>
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-success/60" />
          </div>
        </div>
      </div>

      {/* Central animated element */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Pulsing rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-2 border-primary/20 animate-ping-slow" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-56 rounded-full border border-primary/10 animate-ping-slower" />
          </div>
          
          {/* Center icon */}
          <div className="relative z-10 p-8 rounded-2xl bg-card border border-border shadow-xl animate-scale-in hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-primary text-primary-foreground animate-pulse-glow">
                <Zap className="h-10 w-10" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">5th Avenue</p>
                <p className="text-base text-muted-foreground">Professional Rentals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.4 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 10% 15% Q 50% 50% 85% 25%"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          className="animate-dash"
        />
        <path
          d="M 20% 70% Q 50% 50% 90% 80%"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          className="animate-dash"
          style={{ animationDelay: '1s' }}
        />
        <path
          d="M 5% 50% Q 30% 30% 50% 50%"
          fill="none"
          stroke="url(#lineGradient2)"
          strokeWidth="1"
          className="animate-dash"
          style={{ animationDelay: '2s' }}
        />
        <path
          d="M 50% 50% Q 70% 70% 95% 50%"
          fill="none"
          stroke="url(#lineGradient2)"
          strokeWidth="1"
          className="animate-dash"
          style={{ animationDelay: '3s' }}
        />
      </svg>

      {/* Floating stat cards */}
      <div className="absolute bottom-[10%] left-[5%] animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/90 backdrop-blur border border-border shadow-lg hover:scale-105 transition-transform">
          <ArrowUpRight className="h-4 w-4 text-success" />
          <span className="text-sm font-semibold text-foreground">24% Growth</span>
        </div>
      </div>

      <div className="absolute top-[10%] left-[40%] animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/90 backdrop-blur border border-border shadow-lg hover:scale-105 transition-transform">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Active Rentals</span>
        </div>
      </div>

      {/* Additional floating stat */}
      <div className="absolute bottom-[25%] right-[5%] animate-fade-in" style={{ animationDelay: '0.9s' }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/90 backdrop-blur border border-border shadow-lg hover:scale-105 transition-transform">
          <Package className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-foreground">500+ Items</span>
        </div>
      </div>
    </div>
  );
};

export default AnimatedHeroVisual;
