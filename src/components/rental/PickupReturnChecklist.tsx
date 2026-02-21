import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChecklistItem } from "@/lib/mockData";
import { CheckCircle, ClipboardCheck, Camera, MessageSquare } from "lucide-react";

interface PickupReturnChecklistProps {
  type: "pickup" | "return";
  items: ChecklistItem[];
  onComplete: (items: ChecklistItem[]) => void;
  isCompleted?: boolean;
  canEdit?: boolean;
}

const PickupReturnChecklist = ({
  type,
  items: initialItems,
  onComplete,
  isCompleted = false,
  canEdit = true,
}: PickupReturnChecklistProps) => {
  const { toast } = useToast();
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const allChecked = items.every((item) => item.checked);
  const checkedCount = items.filter((item) => item.checked).length;
  const criticalCount = items.filter((item) => item.assessment === "critical").length;
  const attentionCount = items.filter((item) => item.assessment === "attention").length;

  const criteriaByType =
    type === "pickup"
      ? [
          "External condition and visible damage",
          "Core functionality and startup behavior",
          "Accessories/attachments completeness",
          "Safety readiness and operating compliance",
        ]
      : [
          "Return condition versus pickup state",
          "New wear, damage, or missing parts",
          "Operational status after use",
          "Cleanliness and handoff readiness",
        ];

  const handleToggle = (itemId: string) => {
    if (isCompleted || !canEdit) return;
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleAssessmentChange = (
    itemId: string,
    assessment: "pass" | "attention" | "critical",
  ) => {
    if (isCompleted || !canEdit) return;
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, assessment } : item,
      ),
    );
  };

  const handleAddNote = (itemId: string) => {
    if (!notes[itemId]) return;
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, notes: notes[itemId] } : item
      )
    );
    setNotes((prev) => ({ ...prev, [itemId]: "" }));
  };

  const handleComplete = () => {
    onComplete(items);
    toast({
      title: `${type === "pickup" ? "Pickup" : "Return"} Confirmed`,
      description: `All ${type} checklist items have been verified.`,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            {type === "pickup" ? "Pickup Checklist" : "Return Checklist"}
          </CardTitle>
          <Badge
            variant="outline"
            className={
              allChecked || isCompleted
                ? "bg-success/10 text-success border-0"
                : "bg-warning/10 text-warning border-0"
            }
          >
            {isCompleted ? "Completed" : `${checkedCount}/${items.length} verified`}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {type === "pickup"
            ? "Verify equipment condition before taking possession"
            : "Confirm equipment is returned in proper condition"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Inspection Criteria
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {criteriaByType.map((criterion) => (
              <li key={criterion}>• {criterion}</li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-success/10 text-success border-0">
              Pass: {items.length - attentionCount - criticalCount}
            </Badge>
            <Badge variant="outline" className="bg-warning/10 text-warning border-0">
              Attention: {attentionCount}
            </Badge>
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-0">
              Critical: {criticalCount}
            </Badge>
          </div>
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-lg border transition-colors ${
              item.checked
                ? "bg-success/5 border-success/20"
                : "bg-background border-border"
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id={item.id}
                checked={item.checked}
                onCheckedChange={() => handleToggle(item.id)}
                disabled={isCompleted || !canEdit}
                className="mt-0.5"
              />
              <div className="flex-1 space-y-2">
                <label
                  htmlFor={item.id}
                  className={`text-sm font-medium cursor-pointer ${
                    item.checked ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  {item.label}
                </label>
                
                {item.notes && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                    <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{item.notes}</span>
                  </div>
                )}

                {!isCompleted && !item.notes && canEdit && (
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add note about this item..."
                      value={notes[item.id] || ""}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      className="text-sm h-16"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddNote(item.id)}
                      disabled={!notes[item.id]}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {!isCompleted && canEdit && (
                  <div className="space-y-2 rounded-md border border-border/60 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Assessment
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <label className="inline-flex items-center gap-1.5">
                        <Checkbox
                          checked={(item.assessment || "pass") === "pass"}
                          onCheckedChange={() => handleAssessmentChange(item.id, "pass")}
                        />
                        <span>Pass</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5">
                        <Checkbox
                          checked={item.assessment === "attention"}
                          onCheckedChange={() => handleAssessmentChange(item.id, "attention")}
                        />
                        <span>Attention</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5">
                        <Checkbox
                          checked={item.assessment === "critical"}
                          onCheckedChange={() => handleAssessmentChange(item.id, "critical")}
                        />
                        <span>Critical</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {!isCompleted && canEdit && (
          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" className="gap-2">
              <Camera className="h-4 w-4" />
              Add Photo
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!allChecked}
              className="gap-2 flex-1"
            >
              <CheckCircle className="h-4 w-4" />
              Confirm {type === "pickup" ? "Pickup" : "Return"}
            </Button>
          </div>
        )}
        {!isCompleted && !canEdit && (
          <p className="text-sm text-muted-foreground">
            Only the renter can complete this {type} report.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PickupReturnChecklist;
