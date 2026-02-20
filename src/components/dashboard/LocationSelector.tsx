import { Location } from '@/lib/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package } from 'lucide-react';

interface LocationSelectorProps {
  locations: Location[];
  selectedLocationId: string | 'all';
  onLocationChange: (locationId: string | 'all') => void;
  showEquipmentCount?: boolean;
}

const LocationSelector = ({
  locations,
  selectedLocationId,
  onLocationChange,
  showEquipmentCount = true,
}: LocationSelectorProps) => {
  const totalEquipment = locations.reduce((sum, loc) => sum + loc.equipmentCount, 0);

  return (
    <Select value={selectedLocationId} onValueChange={onLocationChange}>
      <SelectTrigger className="w-full sm:w-[280px]">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Select location" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <div className="flex items-center justify-between w-full">
            <span>All Locations</span>
            {showEquipmentCount && (
              <Badge variant="outline" className="ml-2 gap-1">
                <Package className="h-3 w-3" />
                {totalEquipment}
              </Badge>
            )}
          </div>
        </SelectItem>
        {locations.map((location) => (
          <SelectItem key={location.id} value={location.id}>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <span className="flex items-center gap-1">
                  {location.name}
                  {location.isDefault && (
                    <Badge variant="secondary" className="text-xs py-0 px-1">
                      Default
                    </Badge>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {location.city}, {location.state}
                </span>
              </div>
              {showEquipmentCount && (
                <Badge variant="outline" className="ml-2 gap-1">
                  <Package className="h-3 w-3" />
                  {location.equipmentCount}
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LocationSelector;
