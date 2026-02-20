import { Separator } from "@/components/ui/separator";
import { Equipment } from "@/lib/mockData";

interface CostBreakdownProps {
  equipment: Equipment;
  totalDays: number;
}

const CostBreakdown = ({ equipment, totalDays }: CostBreakdownProps) => {
  const rentalFee = totalDays * equipment.pricePerDay;
  const serviceFee = Math.round(rentalFee * (equipment.serviceFeePercent / 100));
  const grandTotal = rentalFee + serviceFee;

  if (totalDays === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        Select dates to see pricing breakdown
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg bg-muted/50 p-4">
      <h4 className="font-semibold text-foreground">Cost Breakdown</h4>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Equipment rental ({totalDays} {totalDays === 1 ? 'day' : 'days'})
          </span>
          <span className="text-foreground">${rentalFee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            Platform fee ({equipment.serviceFeePercent}%)
            <span className="text-xs text-muted-foreground/60">
              (includes support)
            </span>
          </span>
          <span className="text-foreground">${serviceFee.toLocaleString()}</span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between font-semibold">
        <span className="text-foreground">Rental Total</span>
        <span className="text-foreground">${grandTotal.toLocaleString()}</span>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Security deposit
            <span className="text-xs ml-1">(refundable)</span>
          </span>
          <span className="text-foreground">${equipment.securityDeposit.toLocaleString()}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Deposit is held and returned within 3-5 business days after successful return.
        </p>
      </div>

      <div className="rounded-md bg-primary/5 p-3 mt-4">
        <div className="flex justify-between items-center">
          <span className="font-medium text-foreground">Due at booking</span>
          <span className="text-lg font-bold text-primary">
            ${(grandTotal + equipment.securityDeposit).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdown;
