import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import PhotoUploadGrid from "./PhotoUploadGrid";
import { ConditionPhoto, useConditionLogStore } from "@/lib/conditionLogStore";
import {
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  Shield,
  Camera,
} from "lucide-react";

/** Equipment condition rating scale */
type ConditionRating = 'excellent' | 'good' | 'fair' | 'damaged';

/**
 * Condition Log Form Component
 * 
 * Critical documentation system for equipment rental transactions
 * Used at both pickup and return to create verifiable condition records
 * 
 * Purpose:
 * - Protect both parties from false damage claims
 * - Create audit trail for insurance/disputes
 * - Track equipment deterioration over time
 * - Standardize condition assessment process
 * 
 * Requirements:
 * - Minimum 2 photos (visual evidence)
 * - Condition rating selection
 * - Signature/acknowledgment
 * - Optional damage reporting with description
 * 
 * @param type - "pickup" or "return" to determine context
 * @param rentalId - Associates log with specific rental transaction
 * @param equipmentId - Which equipment is being documented
 * @param equipmentName - Display name for user context
 * @param onComplete - Callback fired after successful submission
 * @param isCompleted - Whether log has already been completed (shows success state)
 */
interface ConditionLogFormProps {
  type: "pickup" | "return";
  rentalId: string;
  equipmentId: string;
  equipmentName: string;
  onComplete: () => void;
  isCompleted?: boolean;
}

/**
 * Predefined condition rating options with descriptions
 * Helps users make consistent assessments across different equipment
 */
const conditionOptions: { value: ConditionRating; label: string; description: string; color: string }[] = [
  { value: 'excellent', label: 'Excellent', description: 'Like new, no visible wear', color: 'text-success' },
  { value: 'good', label: 'Good', description: 'Minor wear, fully functional', color: 'text-primary' },
  { value: 'fair', label: 'Fair', description: 'Noticeable wear, works properly', color: 'text-warning' },
  { value: 'damaged', label: 'Damaged', description: 'Visible damage, needs repair', color: 'text-destructive' },
];

const ConditionLogForm = ({
  type,
  rentalId,
  equipmentId,
  equipmentName,
  onComplete,
  isCompleted = false,
}: ConditionLogFormProps) => {
  const { toast } = useToast();
  const addLog = useConditionLogStore((state) => state.addLog);
  
  // Form state
  const [condition, setCondition] = useState<ConditionRating>('good');  // Default to "good"
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<ConditionPhoto[]>([]);
  const [damageReported, setDamageReported] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);  // Digital signature

  // Validation: Require minimum photos and acknowledgment
  const hasRequiredPhotos = photos.length >= 2;
  const canSubmit = hasRequiredPhotos && acknowledged && (!damageReported || damageDescription.trim());

  /**
   * Submit condition log to store
   * Saves to localStorage via Zustand store
   * In production, would also sync to backend database
   */
  const handleSubmit = () => {
    addLog({
      rentalId,
      equipmentId,
      type,
      condition,
      notes,
      photos,
      verifiedBy: 'Current User', // In real app, get from auth context
      damageReported,
      damageDescription: damageReported ? damageDescription : undefined,
    });

    toast({
      title: `${type === 'pickup' ? 'Pickup' : 'Return'} Condition Logged`,
      description: `Equipment condition has been documented with ${photos.length} photos.`,
    });

    onComplete();
  };

  /**
   * Success state: Show when log has already been completed
   * Prevents duplicate logging and provides visual confirmation
   */
  if (isCompleted) {
    return (
      <Card className="bg-success/5 border-success/20">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-success mb-3" />
          <h3 className="font-semibold text-foreground">
            {type === 'pickup' ? 'Pickup' : 'Return'} Condition Logged
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Equipment condition has been documented and verified
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            {type === 'pickup' ? 'Pickup' : 'Return'} Condition Log
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Camera className="h-3 w-3" />
            {photos.length}/6 photos
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Document the condition of <span className="font-medium">{equipmentName}</span> before {type}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Condition Rating */}
        <div className="space-y-3">
          <Label className="text-base">Equipment Condition</Label>
          <RadioGroup
            value={condition}
            onValueChange={(value) => setCondition(value as ConditionRating)}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {conditionOptions.map((option) => (
              <div key={option.value}>
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={option.value}
                  className={`flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                    hover:bg-muted/50 border-border`}
                >
                  <span className={`font-medium ${option.color}`}>{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Photo Upload */}
        <PhotoUploadGrid
          photos={photos}
          onPhotosChange={setPhotos}
          type={type}
          maxPhotos={6}
        />
        {!hasRequiredPhotos && (
          <p className="text-sm text-warning flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            At least 2 photos are required
          </p>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Condition Notes</Label>
          <Textarea
            id="notes"
            placeholder="Describe the overall condition, any scratches, wear patterns, or other observations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-24"
          />
        </div>

        {/* Damage Reporting */}
        <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-start gap-3">
            <Checkbox
              id="damage"
              checked={damageReported}
              onCheckedChange={(checked) => setDamageReported(checked as boolean)}
            />
            <div>
              <Label htmlFor="damage" className="font-medium text-foreground cursor-pointer">
                Report Damage or Issue
              </Label>
              <p className="text-sm text-muted-foreground">
                Check this if you notice any damage that wasn't previously documented
              </p>
            </div>
          </div>
          
          {damageReported && (
            <div className="space-y-2 mt-3">
              <Label htmlFor="damageDescription" className="text-destructive">
                Damage Description *
              </Label>
              <Textarea
                id="damageDescription"
                placeholder="Describe the damage in detail, including location and severity..."
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                className="h-20 border-destructive/50"
              />
            </div>
          )}
        </div>

        {/* Acknowledgment */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <Checkbox
            id="acknowledge"
            checked={acknowledged}
            onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
          />
          <div>
            <Label htmlFor="acknowledge" className="font-medium text-foreground cursor-pointer">
              I confirm this condition report is accurate
            </Label>
            <p className="text-sm text-muted-foreground">
              This log will be used for asset protection and dispute resolution
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full gap-2"
          size="lg"
        >
          <Shield className="h-4 w-4" />
          Complete {type === 'pickup' ? 'Pickup' : 'Return'} Log
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConditionLogForm;
