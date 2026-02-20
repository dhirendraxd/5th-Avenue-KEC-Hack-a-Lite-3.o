import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import PickupReturnChecklist from "@/components/rental/PickupReturnChecklist";
import ExtensionRequestDialog from "@/components/rental/ExtensionRequestDialog";
import ConditionLogForm from "@/components/rental/ConditionLogForm";
import { TaskFlagDialog } from "@/components/rental/TaskFlagging";
import { useLogsForRental } from "@/lib/conditionLogStore";
import {
  mockRentalRequests,
  statusColors,
  ChecklistItem,
} from "@/lib/mockData";
import {
  ArrowLeft,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  CalendarPlus,
  CheckCircle,
  AlertCircle,
  FileText,
  Camera,
  Flag,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

const RentalOperations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const rental = mockRentalRequests.find((r) => r.id === id);
  
  const [extensionDialogOpen, setExtensionDialogOpen] = useState(false);
  const [pickupChecklist, setPickupChecklist] = useState<ChecklistItem[]>(
    rental?.pickupChecklist || []
  );
  const [returnChecklist, setReturnChecklist] = useState<ChecklistItem[]>(
    rental?.returnChecklist || []
  );
  const [extensionRequest, setExtensionRequest] = useState(rental?.extensionRequest);
  const [pickupLogCompleted, setPickupLogCompleted] = useState(false);
  const [returnLogCompleted, setReturnLogCompleted] = useState(false);
  
  const conditionLogs = useLogsForRental(id || '');

  if (!rental) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Rental Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The rental you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </main>
      </div>
    );
  }

  const today = new Date();
  const daysUntilPickup = differenceInDays(rental.startDate, today);
  const daysUntilReturn = differenceInDays(rental.endDate, today);
  const isActive = rental.status === "active";
  const isApproved = rental.status === "approved";
  const isCompleted = rental.status === "completed";
  const pickupCompleted = pickupChecklist.every((item) => item.checked);
  const returnCompleted = returnChecklist.every((item) => item.checked);

  const handlePickupComplete = (items: ChecklistItem[]) => {
    setPickupChecklist(items);
  };

  const handleReturnComplete = (items: ChecklistItem[]) => {
    setReturnChecklist(items);
    toast({
      title: "Rental Completed",
      description: "Thank you for using GearShift! Please leave a review.",
    });
  };

  const handleExtensionSubmit = (
    newEndDate: Date,
    additionalDays: number,
    additionalCost: number
  ) => {
    setExtensionRequest({
      newEndDate,
      additionalDays,
      additionalCost,
      status: "pending",
    });
    toast({
      title: "Extension Requested",
      description: `Your request to extend until ${format(
        newEndDate,
        "MMM d, yyyy"
      )} has been sent to the owner.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-8 gap-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
              <img
                src={rental.equipment.images[0]}
                alt={rental.equipment.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {rental.equipment.name}
                </h1>
                <Badge
                  variant="outline"
                  className={`${statusColors[rental.status].bg} ${
                    statusColors[rental.status].text
                  } border-0`}
                >
                  {statusColors[rental.status].label}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Owner: {rental.equipment.owner.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{rental.equipment.owner.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          {(isActive || isApproved) && (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <TaskFlagDialog rentalId={rental.id} />
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setExtensionDialogOpen(true)}
              >
                <CalendarPlus className="h-4 w-4" />
                Request Extension
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column - Rental details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Timeline card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Rental Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground">Pickup</p>
                    <p className="font-medium text-foreground">
                      {format(rental.startDate, "EEEE, MMM d, yyyy")}
                    </p>
                    {isApproved && daysUntilPickup > 0 && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-0">
                        In {daysUntilPickup} days
                      </Badge>
                    )}
                    {isApproved && daysUntilPickup === 0 && (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-0">
                        Today!
                      </Badge>
                    )}
                  </div>
                  <div className="hidden h-16 w-px bg-border sm:block" />
                  <div className="flex-1 text-center">
                    <Clock className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p className="mt-1 text-lg font-bold text-foreground">
                      {rental.totalDays} days
                    </p>
                  </div>
                  <div className="hidden h-16 w-px bg-border sm:block" />
                  <div className="flex-1 text-right space-y-1">
                    <p className="text-sm text-muted-foreground">Return</p>
                    <p className="font-medium text-foreground">
                      {format(rental.endDate, "EEEE, MMM d, yyyy")}
                    </p>
                    {isActive && daysUntilReturn > 0 && (
                      <Badge variant="outline" className="bg-success/10 text-success border-0">
                        {daysUntilReturn} days left
                      </Badge>
                    )}
                    {isActive && daysUntilReturn <= 1 && (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-0">
                        Return soon!
                      </Badge>
                    )}
                  </div>
                </div>

                {extensionRequest && (
                  <>
                    <Separator className="my-4" />
                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarPlus className="h-4 w-4 text-accent" />
                          <span className="font-medium text-foreground">
                            Extension Requested
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            extensionRequest.status === "pending"
                              ? "bg-warning/10 text-warning border-0"
                              : extensionRequest.status === "approved"
                              ? "bg-success/10 text-success border-0"
                              : "bg-destructive/10 text-destructive border-0"
                          }
                        >
                          {extensionRequest.status.charAt(0).toUpperCase() +
                            extensionRequest.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        New end date: {format(extensionRequest.newEndDate, "MMM d, yyyy")} (+
                        {extensionRequest.additionalDays} days, NPR {extensionRequest.additionalCost})
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>


            {/* Condition Logs & Checklists */}
            <Tabs defaultValue="condition">
              <TabsList className="w-full">
                <TabsTrigger value="condition" className="flex-1 gap-2">
                  <Camera className="h-4 w-4" />
                  Condition
                </TabsTrigger>
                <TabsTrigger value="pickup" className="flex-1 gap-2">
                  {pickupCompleted && <CheckCircle className="h-4 w-4 text-success" />}
                  Pickup
                </TabsTrigger>
                <TabsTrigger value="return" className="flex-1 gap-2">
                  {returnCompleted && <CheckCircle className="h-4 w-4 text-success" />}
                  Return
                </TabsTrigger>
              </TabsList>
              <TabsContent value="condition" className="mt-4 space-y-4">
                {(isApproved || isActive) && !pickupLogCompleted && conditionLogs.filter(l => l.type === 'pickup').length === 0 && (
                  <ConditionLogForm
                    type="pickup"
                    rentalId={rental.id}
                    equipmentId={rental.equipment.id}
                    equipmentName={rental.equipment.name}
                    onComplete={() => setPickupLogCompleted(true)}
                  />
                )}
                {(pickupLogCompleted || conditionLogs.filter(l => l.type === 'pickup').length > 0) && (
                  <Card className="bg-success/5 border-success/20">
                    <CardContent className="p-4 flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium text-foreground">Pickup Condition Logged</p>
                        <p className="text-sm text-muted-foreground">Equipment condition documented with photos</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {isActive && !returnLogCompleted && conditionLogs.filter(l => l.type === 'return').length === 0 && (
                  <ConditionLogForm
                    type="return"
                    rentalId={rental.id}
                    equipmentId={rental.equipment.id}
                    equipmentName={rental.equipment.name}
                    onComplete={() => setReturnLogCompleted(true)}
                  />
                )}
                {(returnLogCompleted || conditionLogs.filter(l => l.type === 'return').length > 0) && (
                  <Card className="bg-success/5 border-success/20">
                    <CardContent className="p-4 flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium text-foreground">Return Condition Logged</p>
                        <p className="text-sm text-muted-foreground">Equipment returned and condition verified</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="pickup" className="mt-4">
                <PickupReturnChecklist
                  type="pickup"
                  items={pickupChecklist}
                  onComplete={handlePickupComplete}
                  isCompleted={pickupCompleted || isCompleted}
                />
              </TabsContent>
              <TabsContent value="return" className="mt-4">
                <PickupReturnChecklist
                  type="return"
                  items={returnChecklist}
                  onComplete={handleReturnComplete}
                  isCompleted={returnCompleted || isCompleted}
                />
              </TabsContent>
            </Tabs>

            {/* Owner notes */}
            {rental.ownerNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Owner Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{rental.ownerNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - Cost & Policy */}
          <div className="space-y-8">
            {/* Cost summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Cost Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Rental ({rental.totalDays} days × NPR {rental.equipment.pricePerDay})
                  </span>
                  <span className="font-medium">NPR {rental.rentalFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service fee</span>
                  <span className="font-medium">NPR {rental.serviceFee}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Total Paid</span>
                  <span className="text-xl font-bold text-foreground">
                    NPR {rental.totalPrice}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Security deposit (hold)</span>
                  <span className="font-medium">NPR {rental.equipment.securityDeposit}</span>
                </div>
              </CardContent>
            </Card>

            {/* Cancellation policy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  Cancellation Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {rental.equipment.cancellationPolicy}
                </p>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Need help with this rental?
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Extension Dialog */}
      <ExtensionRequestDialog
        open={extensionDialogOpen}
        onOpenChange={setExtensionDialogOpen}
        currentEndDate={rental.endDate}
        pricePerDay={rental.equipment.pricePerDay}
        serviceFeePercent={rental.equipment.serviceFeePercent}
        onSubmit={handleExtensionSubmit}
      />
    </div>
  );
};

export default RentalOperations;
