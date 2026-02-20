import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, X, Save } from "lucide-react";
import { format } from "date-fns";

interface AvailabilityControlsProps {
  equipmentId: string;
  equipmentName: string;
  initialBlockedDates?: Date[];
  initialMinDays?: number;
  initialBufferDays?: number;
  onSave?: (settings: {
    blockedDates: Date[];
    minRentalDays: number;
    bufferDays: number;
  }) => void;
}

const AvailabilityControls = ({
  equipmentName,
  initialBlockedDates = [],
  initialMinDays = 1,
  initialBufferDays = 0,
  onSave,
}: AvailabilityControlsProps) => {
  const { toast } = useToast();
  const [blockedDates, setBlockedDates] = useState<Date[]>(initialBlockedDates);
  const [minRentalDays, setMinRentalDays] = useState(initialMinDays);
  const [bufferDays, setBufferDays] = useState(initialBufferDays);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleAddBlockedDate = () => {
    if (selectedDate && !blockedDates.some((d) => d.getTime() === selectedDate.getTime())) {
      setBlockedDates([...blockedDates, selectedDate]);
      setSelectedDate(undefined);
    }
  };

  const handleRemoveBlockedDate = (date: Date) => {
    setBlockedDates(blockedDates.filter((d) => d.getTime() !== date.getTime()));
  };

  const handleSave = () => {
    onSave?.({ blockedDates, minRentalDays, bufferDays });
    toast({
      title: "Availability Updated",
      description: `Settings for ${equipmentName} have been saved.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Availability Settings</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Configure rental constraints for {equipmentName}
        </p>
      </div>

      {/* Minimum Rental Duration */}
      <div className="space-y-2">
        <Label htmlFor="minDays">Minimum Rental Duration (days)</Label>
        <Input
          id="minDays"
          type="number"
          min={1}
          max={30}
          value={minRentalDays}
          onChange={(e) => setMinRentalDays(parseInt(e.target.value) || 1)}
          className="w-32"
        />
        <p className="text-xs text-muted-foreground">
          Renters must book at least this many days
        </p>
      </div>

      {/* Buffer Days */}
      <div className="space-y-2">
        <Label htmlFor="bufferDays">Buffer Days Between Rentals</Label>
        <Input
          id="bufferDays"
          type="number"
          min={0}
          max={7}
          value={bufferDays}
          onChange={(e) => setBufferDays(parseInt(e.target.value) || 0)}
          className="w-32"
        />
        <p className="text-xs text-muted-foreground">
          Days blocked after each rental for maintenance
        </p>
      </div>

      {/* Blocked Dates */}
      <div className="space-y-3">
        <Label>Blocked Dates</Label>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Select date to block"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) =>
                  date < new Date() ||
                  blockedDates.some((d) => d.toDateString() === date.toDateString())
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="secondary"
            onClick={handleAddBlockedDate}
            disabled={!selectedDate}
          >
            Add
          </Button>
        </div>

        {blockedDates.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {blockedDates
              .sort((a, b) => a.getTime() - b.getTime())
              .map((date) => (
                <Badge
                  key={date.toISOString()}
                  variant="outline"
                  className="gap-1 bg-destructive/10 text-destructive border-0"
                >
                  {format(date, "MMM d, yyyy")}
                  <button
                    onClick={() => handleRemoveBlockedDate(date)}
                    className="ml-1 hover:text-destructive/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
          </div>
        )}
      </div>

      <Button onClick={handleSave} className="gap-2">
        <Save className="h-4 w-4" />
        Save Settings
      </Button>
    </div>
  );
};

export default AvailabilityControls;
