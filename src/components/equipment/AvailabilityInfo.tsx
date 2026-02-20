import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { AvailabilitySettings } from "@/lib/mockData";

interface AvailabilityInfoProps {
  availability: AvailabilitySettings;
}

const AvailabilityInfo = ({ availability }: AvailabilityInfoProps) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">Availability Rules</h4>
      
      <div className="grid gap-2">
        {availability.minRentalDays > 1 && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              Minimum rental: <span className="text-foreground font-medium">{availability.minRentalDays} days</span>
            </span>
          </div>
        )}
        
        {availability.bufferDays > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              Buffer between rentals: <span className="text-foreground font-medium">{availability.bufferDays} day{availability.bufferDays > 1 ? 's' : ''}</span>
            </span>
          </div>
        )}
        
        {availability.blockedDates.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
            <span className="text-muted-foreground">
              <span className="text-foreground font-medium">{availability.blockedDates.length} date{availability.blockedDates.length > 1 ? 's' : ''}</span> blocked by owner
            </span>
          </div>
        )}
      </div>

      {availability.minRentalDays > 1 && (
        <Badge variant="outline" className="text-xs">
          {availability.minRentalDays}+ day rentals only
        </Badge>
      )}
    </div>
  );
};

export default AvailabilityInfo;
