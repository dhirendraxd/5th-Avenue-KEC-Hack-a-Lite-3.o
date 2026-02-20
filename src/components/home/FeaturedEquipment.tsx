import { useEffect, useState } from "react";
import { Equipment } from "@/lib/mockData";
import EquipmentCard from "@/components/equipment/EquipmentCard";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getFirebaseEquipment } from "@/lib/firebase/equipment";

const FeaturedEquipment = () => {
  const [featuredItems, setFeaturedItems] = useState<Equipment[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadFeatured = async () => {
      try {
        const equipment = await getFirebaseEquipment();
        if (!isMounted) return;
        setFeaturedItems(equipment.slice(0, 3));
      } catch (error) {
        console.error("Failed to load featured equipment:", error);
      }
    };

    loadFeatured();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-28 lg:py-36 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 lg:mb-20 flex flex-col items-start justify-between gap-7 md:flex-row md:items-end">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              Featured Equipment
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              High-demand equipment from verified businesses
            </p>
          </div>
          <Link
            to="/browse"
            className="group inline-flex items-center gap-1.5 text-base font-medium text-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-primary hover:after:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 relative"
          >
            View All Equipment
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {featuredItems.map((equipment, index) => (
            <div
              key={equipment.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <EquipmentCard equipment={equipment} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEquipment;
