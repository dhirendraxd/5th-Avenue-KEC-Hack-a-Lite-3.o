import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles } from "lucide-react";
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
  const [prompt, setPrompt] = useState("");
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [typedPlaceholder, setTypedPlaceholder] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const placeholderPhrases = useMemo(
    () => [
      "Need a concrete mixer in Kathmandu...",
      "Looking for scaffolding for 3 days...",
      "Find a camera crane near Lalitpur...",
      "Need welding machine for site work...",
    ],
    [],
  );

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

  useEffect(() => {
    const currentPhrase = placeholderPhrases[phraseIndex % placeholderPhrases.length];

    const timeout = window.setTimeout(
      () => {
        if (!isDeleting) {
          const next = currentPhrase.slice(0, typedPlaceholder.length + 1);
          setTypedPlaceholder(next);

          if (next === currentPhrase) {
            setIsDeleting(true);
          }
        } else {
          const next = currentPhrase.slice(0, Math.max(0, typedPlaceholder.length - 1));
          setTypedPlaceholder(next);

          if (next.length === 0) {
            setIsDeleting(false);
            setPhraseIndex((index) => (index + 1) % placeholderPhrases.length);
          }
        }
      },
      !isDeleting && typedPlaceholder === currentPhrase
        ? 1200
        : isDeleting
          ? 35
          : 55,
    );

    return () => window.clearTimeout(timeout);
  }, [isDeleting, phraseIndex, placeholderPhrases, typedPlaceholder]);

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
    <section className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
      {/* Subtle ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[15%] top-[20%] h-[500px] w-[500px] rounded-full bg-primary/[0.02] blur-3xl" />
        <div className="absolute right-[15%] bottom-[15%] h-[600px] w-[600px] rounded-full bg-accent/[0.02] blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] items-center px-4 py-28 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto w-full max-w-5xl text-center">
          <h1 className="animate-fade-in text-6xl font-bold leading-[1.1] tracking-tight text-foreground md:text-7xl lg:text-8xl xl:text-[6.5rem]">
            <span className="whitespace-nowrap">A simple <span className="text-primary">equipment</span></span><br />rental platform.
          </h1>
          <p className="mx-auto mt-10 max-w-3xl animate-fade-in text-lg text-muted-foreground [animation-delay:150ms] md:text-xl lg:text-2xl lg:line-clamp-2">
            Find the right equipment for your task in seconds with clear pricing and trusted business listings.
          </p>

          <div className="mt-12 flex animate-fade-in items-center justify-center gap-10 [animation-delay:300ms]">
            <Link
              to="/dashboard"
              className="group relative inline-flex items-center gap-1.5 text-base font-medium text-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-primary hover:after:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:text-lg"
            >
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 md:h-5 md:w-5" />
            </Link>
            <Link
              to="/browse"
              className="relative text-base text-muted-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-foreground hover:after:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:text-lg"
            >
              Browse listings
            </Link>
          </div>

          <div className="mx-auto mt-14 w-full max-w-3xl animate-fade-in [animation-delay:450ms]">
            <div className="relative mx-auto w-full max-w-2xl">
              <Sparkles className="pointer-events-none absolute left-1 top-1/2 h-5 w-5 -translate-y-1/2 animate-pulse-gentle text-primary/90" />
              <Input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={typedPlaceholder + (prompt === '' ? '|' : '')}
                className="h-14 rounded-none border-0 border-b border-border/70 bg-transparent px-0 pl-9 text-base shadow-none transition-colors focus-visible:border-primary focus-visible:ring-0 md:text-lg"
              />
            </div>

            {prompt.trim() && (
              <div className="mt-5 text-left">
                {suggestions.length > 0 ? (
                  <div className="space-y-3">
                    {suggestions.map((equipment) => (
                      <Link
                        key={equipment.id}
                        to={`/equipment/${equipment.id}`}
                        className="block border-b border-border/60 pb-3 text-sm transition-all duration-300 hover:border-primary/50 hover:pl-2 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        <p className="line-clamp-1 font-medium text-foreground">{equipment.name}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {equipment.locationName || equipment.owner.location} · NPR {equipment.pricePerDay}/day
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No close match found. Try adding task type, equipment name, or location keywords.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
