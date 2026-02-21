import { Separator } from "@/components/ui/separator";
import { Equipment } from "@/lib/mockData";

interface CostBreakdownProps {
  equipment: Equipment;
  totalDays: number;
  operatorRequested?: boolean;
}

const CostBreakdown = ({ equipment, totalDays, operatorRequested = false }: CostBreakdownProps) => {
  const rentalFee = totalDays * equipment.pricePerDay;
  
  // Calculate operator fee
  const operatorFee = operatorRequested && equipment.operatorAvailable
    ? (equipment.operatorIncluded ? 0 : (equipment.operatorPricePerDay || 0) * totalDays)
    : 0;
  
  const subtotal = rentalFee + operatorFee;
  const serviceFee = Math.round(subtotal * (equipment.serviceFeePercent / 100));
  const grandTotal = subtotal + serviceFee;

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
          <span className="text-foreground">NPR {rentalFee.toLocaleString()}</span>
        </div>
        
        {operatorRequested && equipment.operatorAvailable && !equipment.operatorIncluded && operatorFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Operator service ({totalDays} {totalDays === 1 ? 'day' : 'days'})
            </span>
            <span className="text-foreground">NPR {operatorFee.toLocaleString()}</span>
          </div>
        )}

        {operatorRequested && equipment.operatorAvailable && equipment.operatorIncluded && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Operator service
            </span>
            <span className="text-success text-sm font-medium">Included</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            Platform fee ({equipment.serviceFeePercent}%)
            <span className="text-xs text-muted-foreground/60">
              (includes support)
            </span>
          </span>
          <span className="text-foreground">NPR {serviceFee.toLocaleString()}</span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between font-semibold">
        <span className="text-foreground">Rental Total</span>
        <span className="text-foreground">NPR {grandTotal.toLocaleString()}</span>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Security deposit
            <span className="text-xs ml-1">(refundable)</span>
          </span>
          <span className="text-foreground">NPR {equipment.securityDeposit.toLocaleString()}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Deposit is held and returned within 3-5 business days after successful return.
        </p>
      </div>

      <div className="rounded-md bg-primary/5 p-3 mt-4">
        <div className="flex justify-between items-center">
          <span className="font-medium text-foreground">Due at booking</span>
          <span className="text-lg font-bold text-primary">
            NPR {(grandTotal + equipment.securityDeposit).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdown;
