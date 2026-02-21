import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Equipment } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight } from "lucide-react";
import { getFirebaseEquipment } from "@/lib/firebase/equipment";

interface EquipmentMiniCardProps {
  equipmentId: string;
}

/**
 * Equipment Mini Card Component
 * 
 * Renders a compact, clickable equipment card shown in chat messages
 * When AI assistant recommends equipment, it includes [EQUIP:e123] tags
 * that get replaced with these interactive cards
 * 
 * Features:
 * - Loads equipment data from Firebase by ID
 * - Displays thumbnail, name, price, rating, and condition
 * - Links to full equipment detail page
 * - Hover effects for better UX
 */
const EquipmentMiniCard = ({ equipmentId }: EquipmentMiniCardProps) => {
  const [equipment, setEquipment] = useState<Equipment | null>(null);

  /**
   * Load equipment data from Firebase when component mounts or ID changes
   * 
   * Uses cleanup pattern to prevent state updates on unmounted component:
   * - isMounted flag tracks if component is still mounted
   * - Return cleanup function sets flag to false
   * - Only update state if component is still mounted
   */
  useEffect(() => {
    let isMounted = true;

    const loadEquipment = async () => {
      try {
        // Fetch all equipment from Firebase
        const equipmentList = await getFirebaseEquipment();
        
        // Check if component unmounted during fetch
        if (!isMounted) return;

        // Find matching equipment by ID
        const item = equipmentList.find((entry) => entry.id === equipmentId) || null;
        setEquipment(item);
      } catch (error) {
        console.error("Failed to load chat equipment card:", error);
      }
    };

    loadEquipment();

    // Cleanup: prevent state update on unmounted component
    return () => {
      isMounted = false;
    };
  }, [equipmentId]);

  // Don't render anything if equipment not found or still loading
  if (!equipment) return null;

  /**
   * Calculate average rating from all reviews
   * Returns null if no reviews exist
   * Formatted to 1 decimal place for display
   */
  const avgRating =
    equipment.reviews.length > 0
      ? (equipment.reviews.reduce((a, r) => a + r.rating, 0) / equipment.reviews.length).toFixed(1)
      : null;

  return (
    <Link
      to={`/equipment/${equipment.id}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 transition-all hover:shadow-md hover:border-primary/30 group my-2 no-underline"
    >
      <img
        src={equipment.images[0]}
        alt={equipment.name}
        className="h-14 w-14 rounded-md object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {equipment.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-medium text-primary">NPR {equipment.pricePerDay}/day</span>
          {avgRating && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-warning text-warning" />
              {avgRating}
            </span>
          )}
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {equipment.condition}
          </Badge>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
    </Link>
  );
};

export default EquipmentMiniCard;
