import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CalendarPlus, Clock, DollarSign } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";

interface ExtensionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEndDate: Date;
  pricePerDay: number;
  serviceFeePercent: number;
  onSubmit: (newEndDate: Date, additionalDays: number, additionalCost: number) => void;
}

const ExtensionRequestDialog = ({
  open,
  onOpenChange,
  currentEndDate,
  pricePerDay,
  serviceFeePercent,
  onSubmit,
}: ExtensionRequestDialogProps) => {
  const [newEndDate, setNewEndDate] = useState<Date | undefined>();

  const minDate = addDays(currentEndDate, 1);
  const additionalDays = newEndDate
    ? differenceInDays(newEndDate, currentEndDate)
    : 0;
  const additionalRental = additionalDays * pricePerDay;
  const additionalServiceFee = Math.round(additionalRental * (serviceFeePercent / 100));
  const totalAdditional = additionalRental + additionalServiceFee;

  const handleSubmit = () => {
    if (newEndDate) {
      onSubmit(newEndDate, additionalDays, totalAdditional);
      setNewEndDate(undefined);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" />
            Request Rental Extension
          </DialogTitle>
          <DialogDescription>
            Extend your rental period. The owner will need to approve your request.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Current end date: </span>
            <span className="font-medium text-foreground">
              {format(currentEndDate, "EEEE, MMMM d, yyyy")}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Select new end date
            </label>
            <Calendar
              mode="single"
              selected={newEndDate}
              onSelect={setNewEndDate}
              disabled={(date) => date <= currentEndDate}
              initialFocus
              className="rounded-md border"
            />
          </div>

          {newEndDate && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium text-foreground">Additional Costs</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {additionalDays} additional days × NPR {pricePerDay}/day
                    </span>
                    <span className="font-medium">NPR {additionalRental}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Service fee ({serviceFeePercent}%)
                    </span>
                    <span className="font-medium">NPR {additionalServiceFee}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Additional Total
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    NPR {totalAdditional}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Payment will be collected after owner approval
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!newEndDate} className="gap-2">
            <CalendarPlus className="h-4 w-4" />
            Submit Extension Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExtensionRequestDialog;
