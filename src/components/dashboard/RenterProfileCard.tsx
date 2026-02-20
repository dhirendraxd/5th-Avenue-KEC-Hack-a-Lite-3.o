import { Business } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  Star, 
  MapPin, 
  CheckCircle, 
  Repeat, 
  Calendar 
} from "lucide-react";
import { format } from "date-fns";

interface RenterProfileCardProps {
  renter: Business;
}

const RenterProfileCard = ({ renter }: RenterProfileCardProps) => {
  return (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground">{renter.name}</h4>
              {renter.verified && (
                <Badge variant="outline" className="bg-success/10 text-success border-0 gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              {renter.repeatRenter && (
                <Badge variant="outline" className="bg-accent/10 text-accent border-0 gap-1">
                  <Repeat className="h-3 w-3" />
                  Repeat Renter
                </Badge>
              )}
            </div>
            
            <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{renter.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                <span>{renter.rating} rating</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Member since {format(renter.memberSince, "MMM yyyy")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Repeat className="h-3.5 w-3.5" />
                <span>{renter.totalRentals} past rentals</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-sm sm:flex-row sm:items-center sm:gap-4">
          <div>
            <span className="text-muted-foreground">Response rate: </span>
            <span className="font-medium text-foreground">{renter.responseRate}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Responds in: </span>
            <span className="font-medium text-foreground">{renter.responseTime}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RenterProfileCard;
