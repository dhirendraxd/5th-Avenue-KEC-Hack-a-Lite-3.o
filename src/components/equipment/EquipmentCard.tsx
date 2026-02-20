import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Shield, MapPin, Heart, Repeat, Award } from "lucide-react";
import { Equipment, categoryLabels, conditionLabels } from "@/lib/mockData";
import { useFavoritesStore } from "@/lib/favoritesStore";
import { cn } from "@/lib/utils";

interface EquipmentCardProps {
  equipment: Equipment;
}

const EquipmentCard = ({ equipment }: EquipmentCardProps) => {
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const favorite = isFavorite(equipment.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(equipment.id);
  };

  const averageRating =
    equipment.reviews.length > 0
      ? equipment.reviews.reduce((acc, r) => acc + r.rating, 0) / equipment.reviews.length
      : 0;

  return (
    <Link to={`/equipment/${equipment.id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:card-shadow-hover card-shadow h-full">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={equipment.images[0]}
            alt={equipment.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Badges overlay */}
          <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              {equipment.insuranceProtected && (
                <Badge variant="secondary" className="gap-1 bg-card/90 backdrop-blur-sm text-xs">
                  <Shield className="h-3 w-3 text-accent" />
                  Protected
                </Badge>
              )}
              {equipment.totalRentals > 50 && (
                <Badge variant="secondary" className="gap-1 bg-card/90 backdrop-blur-sm text-xs">
                  <Award className="h-3 w-3 text-primary" />
                  Popular
                </Badge>
              )}
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card"
              onClick={handleFavoriteClick}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  favorite ? "fill-destructive text-destructive" : "text-muted-foreground"
                )}
              />
            </Button>
          </div>
          
          {/* Condition badge */}
          <div className="absolute bottom-3 left-3">
            <Badge 
              variant="secondary" 
              className={cn(
                "bg-card/90 backdrop-blur-sm text-xs",
                conditionLabels[equipment.condition].color
              )}
            >
              {conditionLabels[equipment.condition].label} Condition
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {categoryLabels[equipment.category]}
            </Badge>
            {equipment.availability.minRentalDays > 1 && (
              <span className="text-xs text-muted-foreground">
                Min {equipment.availability.minRentalDays} days
              </span>
            )}
          </div>
          <h3 className="mb-1 font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {equipment.name}
          </h3>
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
            {equipment.description}
          </p>

          <p className="mb-2 text-sm font-medium text-foreground">
            Listed by {equipment.owner.name}
          </p>
          
          {/* Owner info */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{equipment.owner.location}</span>
              {equipment.owner.distance && (
                <span className="text-xs">({equipment.owner.distance} mi)</span>
              )}
            </div>
            {equipment.owner.verified && (
              <Badge variant="outline" className="text-xs gap-1 border-success/30 text-success">
                Verified
              </Badge>
            )}
          </div>

          {/* Ratings and rentals */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-medium text-foreground">
                {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
              </span>
              {equipment.reviews.length > 0 && (
                <span>({equipment.reviews.length})</span>
              )}
            </span>
            <span className="flex items-center gap-1">
              <Repeat className="h-3.5 w-3.5" />
              {equipment.totalRentals} rentals
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <div>
              <span className="text-lg font-bold text-foreground">
                NPR {equipment.pricePerDay}
              </span>
              <span className="text-sm text-muted-foreground">/day</span>
            </div>
            <span className="text-xs text-muted-foreground">
              + NPR {equipment.securityDeposit} deposit
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EquipmentCard;
