import { mockEquipment } from "@/lib/mockData";
import EquipmentCard from "@/components/equipment/EquipmentCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FeaturedEquipment = () => {
  const featuredItems = mockEquipment.slice(0, 3);

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14 lg:mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              Featured Equipment
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              High-demand equipment from verified businesses
            </p>
          </div>
          <Link to="/browse">
            <Button variant="outline" className="gap-2">
              View All Equipment
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
