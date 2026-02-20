import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Leaf, Building2, ChevronDown } from "lucide-react";
import AnimatedHeroVisual from "./AnimatedHeroVisual";
import { useParallax } from "@/hooks/useParallax";

const HeroSection = () => {
  const { offsetY, opacity } = useParallax();

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden hero-gradient flex items-center pt-8 lg:pt-0">
      {/* Bottom gradient divider for smooth transition */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/60 to-transparent" />
      {/* Parallax background elements */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translateY(${offsetY(0.3)}px)`,
          opacity: opacity(0, 600),
        }}
      >
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full bg-success/5 blur-3xl" />
      </div>

      {/* Theme illustrations - Equipment & Sharing patterns */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gear icon - top left */}
        <svg
          className="absolute -top-12 -left-16 w-64 h-64 text-primary/[0.04] dark:text-primary/[0.06]"
          style={{ transform: `translateY(${offsetY(0.15)}px) rotate(${offsetY(0.02)}deg)` }}
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 35a15 15 0 1 0 0 30 15 15 0 0 0 0-30zm0 25a10 10 0 1 1 0-20 10 10 0 0 1 0 20z"/>
          <path d="M97 42h-7.1a40.3 40.3 0 0 0-4.8-11.5l5-5a3 3 0 0 0 0-4.2l-7.4-7.4a3 3 0 0 0-4.2 0l-5 5A40.3 40.3 0 0 0 62 14.1V7a3 3 0 0 0-3-3h-10.5a3 3 0 0 0-3 3v7.1a40.3 40.3 0 0 0-11.5 4.8l-5-5a3 3 0 0 0-4.2 0l-7.4 7.4a3 3 0 0 0 0 4.2l5 5A40.3 40.3 0 0 0 17.6 42H10.5a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h7.1a40.3 40.3 0 0 0 4.8 11.5l-5 5a3 3 0 0 0 0 4.2l7.4 7.4a3 3 0 0 0 4.2 0l5-5a40.3 40.3 0 0 0 11.5 4.8v7.1a3 3 0 0 0 3 3H59a3 3 0 0 0 3-3v-7.1a40.3 40.3 0 0 0 11.5-4.8l5 5a3 3 0 0 0 4.2 0l7.4-7.4a3 3 0 0 0 0-4.2l-5-5a40.3 40.3 0 0 0 4.8-11.5H97a3 3 0 0 0 3-3V45a3 3 0 0 0-3-3z"/>
        </svg>

        {/* Forklift silhouette - bottom left */}
        <svg
          className="absolute bottom-16 left-8 w-40 h-40 text-muted-foreground/[0.04] dark:text-muted-foreground/[0.06]"
          style={{ transform: `translateY(${offsetY(-0.1)}px)` }}
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
          <circle cx="30" cy="80" r="4" className="text-background" fill="currentColor"/>
          <circle cx="55" cy="80" r="4" className="text-background" fill="currentColor"/>
        </svg>

        {/* Connection/sharing network - top right */}
        <svg
          className="absolute top-24 right-8 w-48 h-48 text-accent/[0.06] dark:text-accent/[0.08]"
          style={{ transform: `translateY(${offsetY(0.12)}px)` }}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="50" cy="20" r="8" fill="currentColor" opacity="0.5"/>
          <circle cx="20" cy="60" r="8" fill="currentColor" opacity="0.5"/>
          <circle cx="80" cy="60" r="8" fill="currentColor" opacity="0.5"/>
          <circle cx="50" cy="85" r="6" fill="currentColor" opacity="0.3"/>
          <line x1="50" y1="28" x2="25" y2="54"/>
          <line x1="50" y1="28" x2="75" y2="54"/>
          <line x1="28" y1="64" x2="72" y2="64"/>
          <line x1="50" y1="79" x2="26" y2="66"/>
          <line x1="50" y1="79" x2="74" y2="66"/>
        </svg>

        {/* Recycle/sustainability arrows - mid right */}
        <svg
          className="absolute top-1/2 -right-8 w-36 h-36 text-success/[0.05] dark:text-success/[0.07]"
          style={{ transform: `translateY(${offsetY(-0.08)}px) rotate(15deg)` }}
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 10L35 30h10v20h10V30h10L50 10z"/>
          <path d="M90 50L70 35v10H50v10h20v10L90 50z" transform="rotate(120 50 50)"/>
          <path d="M90 50L70 35v10H50v10h20v10L90 50z" transform="rotate(240 50 50)"/>
        </svg>

        {/* Small gears - bottom right */}
        <svg
          className="absolute bottom-32 right-24 w-24 h-24 text-primary/[0.05] dark:text-primary/[0.07]"
          style={{ transform: `translateY(${offsetY(0.18)}px) rotate(${-offsetY(0.03)}deg)` }}
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M35 25a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
          <path d="M62 25h-4a25 25 0 0 0-3-7l3-3-5-5-3 3a25 25 0 0 0-7-3v-4h-7v4a25 25 0 0 0-7 3l-3-3-5 5 3 3a25 25 0 0 0-3 7h-4v7h4a25 25 0 0 0 3 7l-3 3 5 5 3-3a25 25 0 0 0 7 3v4h7v-4a25 25 0 0 0 7-3l3 3 5-5-3-3a25 25 0 0 0 3-7h4v-7z"/>
        </svg>

        {/* Dotted connection lines - scattered */}
        <svg
          className="absolute top-40 left-1/4 w-32 h-32 text-border/30"
          style={{ transform: `translateY(${offsetY(0.05)}px)` }}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 6"
        >
          <path d="M10 50 Q 50 10, 90 50 Q 50 90, 10 50"/>
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {/* Left Content - slower parallax */}
          <div 
            className="space-y-10 animate-fade-in"
            style={{
              transform: `translateY(${offsetY(-0.1)}px)`,
            }}
          >
            <Badge variant="info" className="w-fit gap-2 px-5 py-2.5 text-sm">
              <Leaf className="h-4 w-4" />
              B2B Equipment Sharing Platform
            </Badge>

            <div className="space-y-8">
              <h1 
                className="text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance"
                style={{
                  transform: `translateY(${offsetY(-0.05)}px)`,
                }}
              >
                Professional Equipment Rentals for Business Teams
              </h1>
              <p 
                className="max-w-2xl text-xl text-muted-foreground md:text-2xl leading-relaxed"
                style={{
                  transform: `translateY(${offsetY(-0.02)}px)`,
                }}
              >
                Access verified listings, transparent pricing, and dependable partners across your local network.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row pt-4">
              <Link to="/browse">
                <Button size="lg" className="w-full px-10 py-6 text-lg sm:w-auto">
                  Find Equipment
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="w-full px-10 py-6 text-lg sm:w-auto">
                  List Equipment
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 pt-6">
              <div className="flex items-center gap-3 text-base text-muted-foreground">
                <Shield className="h-5 w-5 text-success" />
                Insurance Protected
              </div>
              <div className="flex items-center gap-3 text-base text-muted-foreground">
                <Building2 className="h-5 w-5 text-primary" />
                Verified Partners
              </div>
              <div className="flex items-center gap-3 text-base text-muted-foreground">
                <Leaf className="h-5 w-5 text-accent" />
                Sustainable Sharing
              </div>
            </div>
          </div>

          {/* Right Animated Visual - faster parallax */}
          <div 
            className="relative mx-auto w-full max-w-[36rem] sm:max-w-[40rem] lg:max-w-[46rem] xl:max-w-[52rem] animate-slide-in-right" 
            style={{ 
              animationDelay: '0.15s',
              transform: `translateY(${offsetY(0.08)}px)`,
            }}
          >
            <AnimatedHeroVisual />
            
            {/* Stats Overlay - different parallax speeds */}
            <div 
              className="absolute -bottom-8 -left-6 sm:-left-8 lg:-bottom-10 lg:-left-10 xl:-bottom-10 xl:-left-8 rounded-2xl bg-card/95 p-4 sm:p-5 lg:p-6 xl:p-7 card-shadow border border-border/70 backdrop-blur-sm animate-fade-in z-10" 
              style={{ 
                animationDelay: '0.4s',
                transform: `translateY(${offsetY(-0.15)}px) translateX(${offsetY(-0.03)}px)`,
              }}
            >
              <div className="text-2xl sm:text-3xl xl:text-4xl font-bold text-foreground tabular-nums leading-none">500+</div>
              <div className="mt-1 text-xs sm:text-sm xl:text-base font-medium text-muted-foreground">Active Listings</div>
            </div>
            <div 
              className="absolute -top-8 -right-4 sm:-right-8 lg:-top-10 lg:-right-10 xl:-top-12 xl:-right-10 rounded-2xl bg-card/95 p-4 sm:p-5 lg:p-6 xl:p-7 card-shadow border border-border/70 backdrop-blur-sm animate-fade-in z-10" 
              style={{ 
                animationDelay: '0.6s',
                transform: `translateY(${offsetY(0.12)}px) translateX(${offsetY(0.02)}px)`,
              }}
            >
              <div className="text-2xl sm:text-3xl xl:text-4xl font-bold text-success tabular-nums leading-none">NPR 2.4M</div>
              <div className="mt-1 text-xs sm:text-sm xl:text-base font-medium text-muted-foreground">Saved by Businesses</div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <Link
            to="/browse"
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm hover-scale"
            aria-label="Explore equipment"
          >
            <span>Explore equipment</span>
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
