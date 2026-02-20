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
      <div className="container relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] items-center px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto w-full max-w-4xl text-center">
          <h1 className="text-5xl font-bold leading-[1.03] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            A simple <span className="text-primary">equipment</span> rental platform.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base text-muted-foreground md:text-lg">
            Find the right equipment for your task in seconds with clear pricing and trusted business listings.
          </p>

          <div className="mt-10 flex items-center justify-center gap-8">
            <Link
              to="/dashboard"
              className="group relative inline-flex items-center gap-1 text-sm font-medium text-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/browse"
              className="relative text-sm text-muted-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-foreground hover:after:w-full"
            >
              Browse listings
            </Link>
          </div>

          <div className="mx-auto mt-12 w-full max-w-2xl">
            <div className="relative mx-auto w-full max-w-xl">
              <Sparkles className="pointer-events-none absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/90" />
              <Input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={typedPlaceholder}
                className="h-12 rounded-none border-0 border-b border-border/70 bg-transparent px-0 pl-8 text-sm shadow-none focus-visible:border-primary focus-visible:ring-0"
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
                        className="block border-b border-border/60 pb-3 text-sm"
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
