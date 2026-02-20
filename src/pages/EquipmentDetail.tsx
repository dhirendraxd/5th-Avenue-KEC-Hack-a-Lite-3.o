import { useState } from "react";
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
import { mockEquipment, categoryLabels, conditionLabels } from "@/lib/mockData";
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
import { format, differenceInDays, isWithinInterval, isSameDay } from "date-fns";
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

  const equipment = mockEquipment.find((e) => e.id === id);
  const favorite = equipment ? isFavorite(equipment.id) : false;

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

  const totalDays =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from) + 1
      : 0;

  const isValidRentalDuration = totalDays >= equipment.availability.minRentalDays;

  // Check if a date is blocked or unavailable
  const isDateDisabled = (date: Date) => {
    // Past dates
    if (date < new Date()) return true;
    
    // Blocked dates
    if (equipment.availability.blockedDates.some(blocked => isSameDay(blocked, date))) {
      return true;
    }
    
    // Check if within available ranges
    const inRange = equipment.availability.availableRanges.some(range =>
      isWithinInterval(date, { start: range.start, end: range.end })
    );
    
    return !inRange;
  };

  const handleRentalRequest = async () => {
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
        description: `This equipment requires a minimum of ${equipment.availability.minRentalDays} days rental.`,
        variant: "destructive",
      });
      return;
    }

    setIsRequesting(true);
    setTimeout(() => {
      setIsRequesting(false);
      toast({
        title: "Request Submitted",
        description: `Your rental request for ${equipment.name} has been sent to ${equipment.owner.name}. You'll receive a response within 24 hours.`,
      });
    }, 1500);
  };

  const averageRating =
    equipment.reviews.length > 0
      ? equipment.reviews.reduce((acc, r) => acc + r.rating, 0) / equipment.reviews.length
      : 0;

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
              <img
                src={equipment.images[0]}
                alt={equipment.name}
                className="h-full w-full object-cover"
              />
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
                {equipment.availability.minRentalDays > 1 && (
                  <Badge variant="secondary">
                    Min {equipment.availability.minRentalDays} days
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
                  {equipment.reviews.length > 0 && (
                    <span>({equipment.reviews.length} reviews)</span>
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
                        {equipment.owner.name}
                      </span>
                      {equipment.owner.verified && (
                        <Badge variant="outline" className="gap-1 border-success/30 text-success">
                          <CheckCircle className="h-3 w-3" />
                          Verified Business
                        </Badge>
                      )}
                      {equipment.owner.repeatRenter && (
                        <Badge variant="secondary" className="gap-1">
                          <Repeat className="h-3 w-3" />
                          Repeat Partner
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {equipment.owner.location}
                        {equipment.owner.distance && ` (${equipment.owner.distance} mi)`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        {equipment.owner.rating} ({equipment.owner.totalRentals} rentals)
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 pt-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
                      <span>Response rate: {equipment.owner.responseRate}%</span>
                      <span>Responds {equipment.owner.responseTime}</span>
                      <span>Member since {equipment.owner.memberSince.getFullYear()}</span>
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
                {equipment.features.map((feature) => (
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
                <ReviewHighlights reviews={equipment.reviews} />
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
            <Card className="sticky top-24 card-shadow">
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
                <AvailabilityInfo availability={equipment.availability} />

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
                      Minimum {equipment.availability.minRentalDays} days required
                    </p>
                  )}
                </div>

                {/* Cost Breakdown */}
                <CostBreakdown equipment={equipment} totalDays={totalDays} />

                {/* Request Button */}
                <Button
                  onClick={handleRentalRequest}
                  disabled={totalDays === 0 || !isValidRentalDuration || isRequesting}
                  className="w-full"
                  size="lg"
                >
                  {isRequesting ? "Submitting..." : "Request Rental"}
                </Button>

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
