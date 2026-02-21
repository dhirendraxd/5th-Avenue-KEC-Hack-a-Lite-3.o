import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import ReviewHighlights from "@/components/equipment/ReviewHighlights";
import CostBreakdown from "@/components/equipment/CostBreakdown";
import AvailabilityInfo from "@/components/equipment/AvailabilityInfo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFavoritesStore } from "@/lib/favoritesStore";
import {
  getBusinessProfileFromFirebase,
  isBusinessKycComplete,
} from "@/lib/firebase/businessProfile";
import { subscribeFirebaseEquipmentById } from "@/lib/firebase/equipment";
import { createFirebaseRentalRequest, subscribeFirebaseRentals, createNotificationForOwner } from "@/lib/firebase/rentals";
import { Equipment, RentalRequest } from "@/lib/mockData";
import { categoryLabels, conditionLabels } from "@/lib/constants";
import {
  ArrowLeft,
  Shield,
  Star,
  MapPin,
  CheckCircle,
  Building2,
  Calendar as CalendarIcon,
  Info,
  Heart,
  Award,
  Clock,
  Repeat,
  XCircle,
} from "lucide-react";
import { addDays, differenceInDays, format, isWithinInterval, isSameDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isRequesting, setIsRequesting] = useState(false);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [allRentals, setAllRentals] = useState<RentalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // New state for additional info (must be declared unconditionally)
  const [purpose, setPurpose] = useState("");
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeFirebaseEquipmentById(
      id,
      (selectedEquipment) => {
        setEquipment(selectedEquipment);
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to load equipment details:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const unsubscribe = subscribeFirebaseRentals(
      (rentals) => setAllRentals(rentals),
      (error) => {
        console.error("Failed to load rentals for detail availability:", error);
        toast({
          title: "Could not load availability",
          description:
            "Failed to load rental availability. Some dates may be missing. Check your connection or permissions.",
          variant: "destructive",
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const favorite = equipment ? isFavorite(equipment.id) : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading equipment details...</p>
        </main>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Equipment not found</h1>
          <Link to="/browse">
            <Button className="mt-4">Browse Equipment</Button>
          </Link>
        </main>
      </div>
    );
  }

    // Defensive defaults to avoid render-time exceptions when backend data is incomplete
    const reviews = Array.isArray(equipment.reviews) ? equipment.reviews : [];
    const availability = equipment.availability || {
      minRentalDays: 1,
      blockedDates: [],
      availableRanges: [{ start: new Date(), end: addDays(new Date(), 365) }],
      bufferDays: 0,
    };
    const owner = equipment.owner || {
      name: "Unknown",
      location: "",
      rating: 0,
      totalRentals: 0,
      verified: false,
      repeatRenter: false,
      responseRate: 0,
      responseTime: "",
      memberSince: new Date().toISOString(),
    };

    const totalDays =
      dateRange?.from && dateRange?.to
        ? differenceInDays(dateRange.to, dateRange.from) + 1
        : 0;

    const isValidRentalDuration = totalDays >= (availability.minRentalDays || 1);

    const bookedDateRanges = allRentals
      .filter(
        (rental) =>
          rental.equipment.id === equipment.id &&
          (rental.status === "approved" || rental.status === "active")
      )
      .map((rental) => ({
        start: rental.startDate,
        end: addDays(rental.endDate, availability.bufferDays || 0),
      }));

    // Check if a date is blocked or unavailable
    const isDateDisabled = (date: Date) => {
      // Past dates
      if (date < new Date()) return true;
    
      // Blocked dates
      if ((availability.blockedDates || []).some((blocked: Date) => isSameDay(blocked, date))) {
        return true;
      }

      if (bookedDateRanges.some((range) => isWithinInterval(date, range))) {
        return true;
      }
    
      // Check if within available ranges
      const inRange = (availability.availableRanges || []).some((range: { start: Date; end: Date }) =>
        isWithinInterval(date, { start: range.start, end: range.end })
      );
    
      return !inRange;
    };

  // New state for additional info
  

  const isOwner = isAuthenticated && user && equipment && equipment.owner && (user.id === equipment.owner.id || user.businessName === equipment.owner.name);

  const handleRentalRequest = async () => {
    if (isOwner) {
      toast({
        title: "Cannot rent your own equipment",
        description: "You cannot request to rent equipment you own.",
        variant: "destructive",
      });
      return;
    }
    if (!isAuthenticated || !user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to request a rental.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const kycProfile = await getBusinessProfileFromFirebase(user.id);
    if (!kycProfile || !isBusinessKycComplete(kycProfile)) {
      toast({
        title: "KYC required",
        description: "Please complete and save Citizenship, NID, and document images in Firebase from Dashboard > Business Info before renting.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Select Dates",
        description: "Please select your rental dates before requesting.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidRentalDuration) {
      toast({
        title: "Minimum Duration Required",
        description: `This equipment requires a minimum of ${availability.minRentalDays} days rental.`,
        variant: "destructive",
      });
      return;
    }

    setIsRequesting(true);
    try {
      const rental = await createFirebaseRentalRequest({
        equipment,
        renterId: user.id,
        renterName: user.name,
        renterLocation: user.businessName,
        startDate: dateRange.from,
        endDate: dateRange.to,
        purpose,
        destination,
        notes,
      });

      // Try to notify the owner via a notifications document
      try {
        await createNotificationForOwner(rental.owner.id, `New rental request for ${equipment.name}`, `${user.name} requested to rent ${equipment.name} from ${dateRange.from.toDateString()} to ${dateRange.to.toDateString()}`, { rentalId: rental.id, equipmentId: equipment.id });
        toast({
          title: "Request Submitted",
          description: `Your rental request for ${equipment.name} has been sent to ${owner.name}. The owner has been notified.`,
        });
      } catch (notifErr) {
        console.error("Notification creation failed:", notifErr);
        toast({
          title: "Request Submitted",
          description: `Request sent but failed to notify ${owner.name}. They may still see the request in their dashboard.`,
        });
      }

      setIsRequesting(false);
    } catch (error) {
      console.error("Failed to create rental request:", error);
      setIsRequesting(false);
      toast({
        title: "Request failed",
        description:
          error instanceof Error && error.message
            ? error.message
            : "Could not submit request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
  const rentalLocation = equipment.locationName?.trim() || owner.location;

  const nextAvailableAt = (() => {
    const now = new Date();
    const relevant = allRentals.filter(
      (rental) =>
        rental.equipment.id === equipment.id &&
        (rental.status === "approved" || rental.status === "active") &&
        rental.startDate <= now &&
        rental.endDate >= now
    );

    if (relevant.length === 0) return null;

    const latestEnd = relevant.reduce((latest, rental) =>
      rental.endDate > latest ? rental.endDate : latest,
    relevant[0].endDate);

    return addDays(latestEnd, availability.bufferDays || 0);
  })();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Back Link */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Browse
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => toggleFavorite(equipment.id)}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                favorite ? "fill-destructive text-destructive" : ""
              )}
            />
            {favorite ? "Saved" : "Save"}
          </Button>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image */}
            <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
              {equipment.images && equipment.images.length > 0 ? (
                <img
                  src={equipment.images[0]}
                  alt={equipment.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">No image available</div>
              )}
              {/* Badges */}
              <div className="absolute left-4 right-4 top-4 flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  {equipment.insuranceProtected && (
                    <Badge className="gap-1.5 bg-card/95 text-foreground backdrop-blur-sm">
                      <Shield className="h-3.5 w-3.5 text-accent" />
                      Insurance Protected
                    </Badge>
                  )}
                  {equipment.totalRentals > 50 && (
                    <Badge className="gap-1.5 bg-card/95 text-foreground backdrop-blur-sm">
                      <Award className="h-3.5 w-3.5 text-primary" />
                      Popular Choice
                    </Badge>
                  )}
                </div>
                <Badge
                  className={cn(
                    "bg-card/95 backdrop-blur-sm",
                    conditionLabels[equipment.condition].color
                  )}
                >
                  {conditionLabels[equipment.condition].label} Condition
                </Badge>
              </div>
            </div>

            {/* Title & Category */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {categoryLabels[equipment.category]}
                </Badge>
                {availability.minRentalDays > 1 && (
                  <Badge variant="secondary">
                    Min {availability.minRentalDays} days
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                {equipment.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium text-foreground">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
                  </span>
                  {reviews.length > 0 && (
                    <span>({reviews.length} reviews)</span>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <Repeat className="h-4 w-4" />
                  {equipment.totalRentals} rentals
                </span>
              </div>
            </div>

            {/* Owner Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-lg">
                        {owner.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1",
                          owner.verified
                            ? "border-success/30 text-success"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        <CheckCircle className="h-3 w-3" />
                        {owner.verified ? "Verified Business" : "Unverified"}
                      </Badge>
                      {owner.repeatRenter && (
                        <Badge variant="secondary" className="gap-1">
                          <Repeat className="h-3 w-3" />
                          Repeat Partner
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {owner.location}
                        {owner.distance && ` (${owner.distance} mi)`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        {owner.rating} ({owner.totalRentals} rentals)
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 pt-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
                      <span>Response rate: {owner.responseRate}%</span>
                      <span>Responds {owner.responseTime}</span>
                      <span>Member since {new Date(owner.memberSince).getFullYear()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Description</h2>
              <p className="text-muted-foreground">{equipment.description}</p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Features</h2>
              <div className="flex flex-wrap gap-2">
                {(equipment.features || []).map((feature) => (
                  <Badge key={feature} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Usage Notes */}
            <Card className="bg-muted/50 border-muted">
              <CardContent className="flex gap-3 p-4">
                <Info className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Usage Notes</p>
                  <p className="text-sm text-muted-foreground">{equipment.usageNotes}</p>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardContent className="p-6">
                <ReviewHighlights reviews={reviews} />
              </CardContent>
            </Card>

            {/* Policies */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="cancellation">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    Cancellation Policy
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {equipment.cancellationPolicy}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24 card-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-baseline justify-between">
                  <span>
                    NPR {equipment.pricePerDay}
                    <span className="text-base font-normal text-muted-foreground">
                      /day
                    </span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Availability Info */}
                <AvailabilityInfo availability={availability} />

                <Separator />

                {/* Rental Location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MapPin className="h-4 w-4" />
                    Rental Location
                  </div>
                  <p className="text-sm text-muted-foreground">{rentalLocation}</p>
                  {nextAvailableAt && (
                    <p className="text-xs text-warning">
                      Currently booked • Available from {format(nextAvailableAt, "PPP")}
                    </p>
                  )}
                  {equipment.locationMapUrl && (
                    <a
                      href={equipment.locationMapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Open location in map
                    </a>
                  )}
                </div>

                <Separator />

                {/* Calendar */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    Select Rental Dates
                  </div>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    disabled={isDateDisabled}
                    className="rounded-md border pointer-events-auto"
                  />
                  {totalDays > 0 && !isValidRentalDuration && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Minimum {availability.minRentalDays} days required
                    </p>
                  )}
                </div>

                {/* Cost Breakdown */}
                <CostBreakdown equipment={equipment} totalDays={totalDays} />

                {/* Additional Info Fields */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium">Purpose of Rental</label>
                  <input
                    className="input input-bordered w-full"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    placeholder="e.g. Construction project, event, etc."
                  />
                  <label className="block text-sm font-medium">Where will you use/take it?</label>
                  <input
                    className="input input-bordered w-full"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    placeholder="e.g. Project site, event location, etc."
                  />
                  <label className="block text-sm font-medium">Other Notes (optional)</label>
                  <textarea
                    className="input input-bordered w-full min-h-[60px]"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any special instructions or info for the owner"
                  />
                </div>

                {/* Request Button */}

                <Button
                  onClick={handleRentalRequest}
                  disabled={isOwner || totalDays === 0 || !isValidRentalDuration || isRequesting}
                  className="w-full mt-4"
                  size="lg"
                >
                  {isOwner ? "You own this equipment" : (isRequesting ? "Submitting..." : "Request Rental")}
                </Button>
                {isOwner && (
                  <p className="text-center text-xs text-destructive mt-2">You cannot rent your own equipment.</p>
                )}

                <p className="text-center text-xs text-muted-foreground">
                  You won't be charged until the owner approves your request
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EquipmentDetail;
