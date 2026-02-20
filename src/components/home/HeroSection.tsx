import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Leaf, Building2, ChevronDown, Sparkles } from "lucide-react";
import AnimatedHeroVisual from "./AnimatedHeroVisual";
import { useParallax } from "@/hooks/useParallax";
import { getFirebaseEquipment } from "@/lib/firebase/equipment";
import { Equipment } from "@/lib/mockData";

const buildMatchScore = (equipment: Equipment, query: string): number => {
  const text = [
    equipment.name,
    equipment.description,
    equipment.category,
    equipment.locationName || "",
    equipment.owner.name,
    equipment.owner.location,
    equipment.usageNotes,
    ...equipment.features,
  ]
    .join(" ")
    .toLowerCase();

  const words = query
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length === 0) return 0;

  let score = 0;
  for (const word of words) {
    if (equipment.name.toLowerCase().includes(word)) score += 6;
    if (equipment.category.toLowerCase().includes(word)) score += 4;
    if (text.includes(word)) score += 2;
  }

  return score;
};

const HeroSection = () => {
  const { offsetY, opacity } = useParallax();
  const [prompt, setPrompt] = useState("");
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadEquipment = async () => {
      try {
        const data = await getFirebaseEquipment();
        if (!isMounted) return;
        setAllEquipment(data);
      } catch (error) {
        console.error("Failed to load equipment for hero suggestions:", error);
      }
    };

    loadEquipment();

    return () => {
      isMounted = false;
    };
  }, []);

  const suggestions = useMemo(() => {
    const query = prompt.trim();
    if (!query) return [];

    return allEquipment
      .map((equipment) => ({ equipment, score: buildMatchScore(equipment, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.equipment);
  }, [allEquipment, prompt]);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden hero-gradient flex items-center pt-8 lg:pt-0">
      {/* Bottom gradient divider for smooth transition */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background via-background/60 to-transparent" />
      {/* Parallax background elements */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translateY(${offsetY(0.3)}px)`,
          opacity: opacity(0, 600),
        }}
      >
        <div className="absolute top-20 left-10 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-16 right-16 h-64 w-64 rounded-full bg-muted/40 blur-3xl" />
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
            <Badge variant="outline" className="w-fit gap-2 px-4 py-2 text-xs">
              <Leaf className="h-4 w-4" />
              B2B Equipment Sharing Platform
            </Badge>

            <div className="space-y-8">
              <h1 
                className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance"
                style={{
                  transform: `translateY(${offsetY(-0.05)}px)`,
                }}
              >
                Professional Equipment Rentals for Business Teams
              </h1>
              <p 
                className="max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
                style={{
                  transform: `translateY(${offsetY(-0.02)}px)`,
                }}
              >
                Access verified listings, transparent pricing, and dependable partners across your local network.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                  <Input
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Describe what you need (e.g., road work, concrete drilling, event lighting setup)"
                    className="h-12 pl-10"
                  />
                </div>
                <Link to="/dashboard" className="sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full px-7">
                    List Equipment
                  </Button>
                </Link>
              </div>
              {prompt.trim() && (
                <div>
                  {suggestions.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {suggestions.map((equipment) => (
                        <Link
                          key={equipment.id}
                          to={`/equipment/${equipment.id}`}
                          className="border-b border-border/70 pb-2 text-sm"
                        >
                          <p className="line-clamp-1 font-semibold text-foreground">{equipment.name}</p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {equipment.locationName || equipment.owner.location}
                          </p>
                          <p className="mt-1 text-sm font-medium text-primary">NPR {equipment.pricePerDay}/day</p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No close match yet. Try adding equipment type, task, location, or capacity keywords.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
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
            className="relative mx-auto w-full max-w-[34rem] sm:max-w-[38rem] lg:max-w-[42rem] xl:max-w-[46rem] animate-slide-in-right" 
            style={{ 
              animationDelay: '0.15s',
              transform: `translateY(${offsetY(0.08)}px)`,
            }}
          >
            <AnimatedHeroVisual />
          </div>
        </div>

        {/* Scroll cue */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <Link
            to="/browse"
            className="pointer-events-auto inline-flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground"
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
