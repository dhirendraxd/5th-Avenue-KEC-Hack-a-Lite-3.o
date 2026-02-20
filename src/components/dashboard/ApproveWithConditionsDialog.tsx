import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

interface ApproveWithConditionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentName: string;
  renterName: string;
  onApprove: (notes: string) => void;
}

const ApproveWithConditionsDialog = ({
  open,
  onOpenChange,
  equipmentName,
  renterName,
  onApprove,
}: ApproveWithConditionsDialogProps) => {
  const [notes, setNotes] = useState("");

  const handleApprove = () => {
    onApprove(notes);
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Rental Request</DialogTitle>
          <DialogDescription>
            Approve the rental of {equipmentName} to {renterName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Conditions or Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Please coordinate pickup time the day before. Equipment will be at main warehouse. Bring valid ID for verification."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              These notes will be shared with the renter upon approval
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApprove} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Approve Rental
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApproveWithConditionsDialog;
