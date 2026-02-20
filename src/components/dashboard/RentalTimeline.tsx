import { RentalRequest } from "@/lib/mockData";
import { statusColors } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, addDays, startOfDay, isWithinInterval } from "date-fns";
import { Calendar, ArrowRight, Clock } from "lucide-react";

interface RentalTimelineProps {
  rentals: RentalRequest[];
  onRentalClick?: (rental: RentalRequest) => void;
}

const RentalTimeline = ({ rentals, onRentalClick }: RentalTimelineProps) => {
  const today = startOfDay(new Date());
  const timelineStart = addDays(today, -7);
  const timelineEnd = addDays(today, 30);
  const totalDays = differenceInDays(timelineEnd, timelineStart);

  const getPositionPercent = (date: Date) => {
    const daysDiff = differenceInDays(startOfDay(date), timelineStart);
    return Math.max(0, Math.min(100, (daysDiff / totalDays) * 100));
  };

  const isActiveToday = (rental: RentalRequest) => {
    return isWithinInterval(today, { start: rental.startDate, end: rental.endDate });
  };

  // Generate week markers
  const weekMarkers = [];
  for (let i = 0; i <= 5; i++) {
    const date = addDays(timelineStart, i * 7);
    weekMarkers.push(date);
  }

  return (
    <div className="space-y-6">
      {/* Timeline header with week markers */}
      <div className="relative h-10 border-b border-border/50 ml-52">
        {weekMarkers.map((date, i) => (
          <div
            key={i}
            className="absolute flex flex-col items-start"
            style={{ left: `${(i * 7 / totalDays) * 100}%` }}
          >
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {format(date, "MMM d")}
            </span>
            <div className="w-px h-2 bg-border mt-1" />
          </div>
        ))}
        {/* Today indicator */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center z-10"
          style={{ left: `${getPositionPercent(today)}%` }}
        >
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
            Today
          </span>
          <div className="w-0.5 flex-1 bg-primary/60 mt-1" />
        </div>
      </div>

      {/* Rentals */}
      {rentals.length === 0 ? (
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No upcoming rentals</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Approved requests will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rentals.map((rental) => {
            const isActive = isActiveToday(rental);
            const statusColor = statusColors[rental.status];

            return (
              <div
                key={rental.id}
                className="group flex items-center gap-4 py-1.5 cursor-pointer hover:bg-muted/30 rounded-lg px-2 -mx-2 transition-colors"
                onClick={() => onRentalClick?.(rental)}
              >
                {/* Equipment info - fixed width */}
                <div className="w-48 shrink-0">
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {rental.equipment.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {rental.renter.name}
                  </p>
                </div>

                {/* Rental bar - simplified, no positioning issues */}
                <div
                  className={`flex items-center justify-between h-10 px-3 rounded-lg flex-1 transition-all duration-200 group-hover:shadow-sm ${
                    isActive ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""
                  } ${statusColor.bg}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className={`h-3.5 w-3.5 ${statusColor.text} shrink-0 opacity-70`} />
                    <span className={`text-sm font-medium ${statusColor.text}`}>
                      {format(rental.startDate, "MMM d")}
                    </span>
                    <ArrowRight className={`h-3.5 w-3.5 ${statusColor.text} shrink-0`} />
                    <span className={`text-sm font-medium ${statusColor.text}`}>
                      {format(rental.endDate, "MMM d")}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${statusColor.bg} ${statusColor.text} border-0 text-[10px] font-semibold shrink-0 uppercase tracking-wide ml-2`}
                  >
                    {statusColor.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RentalTimeline;
