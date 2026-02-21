import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackgroundIllustrations from "@/components/layout/BackgroundIllustrations";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Phone, CircleDollarSign, Lightbulb, TrendingUp, Users, Upload, History, CheckCircle, Lock, Package } from "lucide-react";
import {
  materialCategoryLabels,
  materialConditionLabels,
  mockMaterialListings,
  type MaterialListing,
} from "@/lib/materialsMock";

const DEFAULT_LOCATION = {
  latitude: 27.7172,
  longitude: 85.324,
  label: "Kathmandu",
};

const kathmandu_locations = [
  { label: "Thamel", lat: 27.7164, lng: 85.3277 },
  { label: "Koteshwor", lat: 27.7089, lng: 85.3574 },
  { label: "Patan", lat: 27.6737, lng: 85.3199 },
  { label: "Kalanki", lat: 27.7345, lng: 85.2708 },
];

const toRadians = (value: number) => (value * Math.PI) / 180;

/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * This determines how far a listing is from the user's current location
 * @param lat1, lon1 - User's current coordinates
 * @param lat2, lon2 - Material listing coordinates
 * @returns Distance in miles
 */
const distanceInMiles = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const earthRadius = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

const MaterialsFind = () => {
  const { toast } = useToast();
  const [radius, setRadius] = useState("10");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "error">("idle");
  const [selected, setSelected] = useState<MaterialListing | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState("Thamel");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "advance">("cod");
  const [selectedGateway, setSelectedGateway] = useState<"khalti" | "esewa" | "bank" | null>(null);
  const [showOfferMode, setShowOfferMode] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerStatus, setOfferStatus] = useState<"idle" | "sent" | "accepted" | "rejected" | "counter">("idle");
  const [counterOfferAmount, setCounterOfferAmount] = useState<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: "Your location",
        });
        setLocationStatus("idle");
      },
      () => {
        setLocationStatus("error");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  /**
   * Filter and sort listings based on:
   * - Distance from user's current location (within selected radius)
   * - Material category (or "all")
   * - Calculates distance for each listing using Haversine formula
   * - Returns listings sorted by distance (closest first)
   */
  const listings = useMemo(() => {
    const maxDistance = Number(radius);
    return mockMaterialListings
      .map((listing) => ({
        ...listing,
        distance: distanceInMiles(
          location.latitude,
          location.longitude,
          listing.latitude,
          listing.longitude,
        ),
      }))
      .filter((listing) => listing.distance <= maxDistance)
      .filter((listing) => category === "all" || listing.category === category)
      .sort((a, b) => a.distance - b.distance);
  }, [radius, category, location]);

  /**
   * Calculate area insights for sidebar
   * Shows top 3 locations with most material listings
   * Used to display "Top Areas" in the insights card
   */
  const areaInsights = useMemo(() => {
    const counts = listings.reduce<Record<string, number>>((acc, listing) => {
      acc[listing.locationName] = (acc[listing.locationName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [listings]);

  /**
   * Calculate category insights for sidebar
   * Groups available materials by category and counts occurrences
   * Shows category distribution as badges in insights card
   */
  const categoryInsights = useMemo(() => {
    const counts = listings.reduce<Record<string, number>>((acc, listing) => {
      const label = materialCategoryLabels[listing.category];
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts);
  }, [listings]);

  /**
   * Open purchase dialog for selected material
   * Resets all offer/payment states to initial values
   * Prepares UI for buyer interaction (offer or direct payment)
   */
  const handleOpenDialog = (listing: MaterialListing) => {
    setSelected(listing);
    setSelectedPickupLocation("Thamel");
    setPaymentMethod("cod");
    setSelectedGateway(null);
    setShowOfferMode(false);
    setOfferAmount("");
    setOfferStatus("idle");
    setCounterOfferAmount(null);
    setDialogOpen(true);
  };

  const handlePurchase = () => {
    if (!selected) return;
    
    if (paymentMethod === "cod") {
      toast({
        title: "Order Confirmed! ✓",
        description: `${selected.name} - Pickup at ${selectedPickupLocation}\nPayment: Cash on Delivery\n\nCalling ${selected.contactName}...`,
        duration: 5000,
      });
    } else {
      toast({
        title: "Proceed to Payment",
        description: `${selected.name}\nAmount: NPR ${selected.price}\n\nSelect payment method above`,
        duration: 4000,
      });
      return;
    }
    
    setDialogOpen(false);
  };

  const handlePaymentGateway = (gateway: "khalti" | "esewa" | "bank") => {
    if (!selected) return;
    
    setSelectedGateway(gateway);
    
    let gatewayName = "";
    if (gateway === "khalti") gatewayName = "Khalti";
    else if (gateway === "esewa") gatewayName = "eSewa";
    else gatewayName = "Bank Transfer";
    
    toast({
      title: `Redirecting to ${gatewayName}...`,
      description: `Amount: NPR ${selected.price}\nItem: ${selected.name}`,
      duration: 3000,
    });
    
    setTimeout(() => {
      toast({
        title: "Payment Processing",
        description: `Your payment of NPR ${selected.price} is being processed...`,
        duration: 4000,
      });
      setDialogOpen(false);
    }, 2000);
  };

  /**
   * Send offer to seller (OLX-style negotiation)
   * Validates offer amount and simulates seller response
   * Seller randomly accepts, rejects, or counter-offers
   */
  const handleSendOffer = () => {
    if (!selected || !offerAmount) {
      toast({
        title: "Enter an offer amount",
        variant: "destructive",
      });
      return;
    }

    const offer = Number(offerAmount);
    if (offer <= 0 || offer >= selected.price) {
      toast({
        title: "Invalid offer",
        description: "Offer must be less than asking price",
        variant: "destructive",
      });
      return;
    }

    // Update status and notify buyer
    setOfferStatus("sent");
    toast({
      title: "Offer sent! 📤",
      description: `NPR ${offer} offer sent to ${selected.contactName}. Waiting for response...`,
    });

    // Simulate seller response with 2-second delay
    setTimeout(() => {
      const responses = ["accepted", "counter", "rejected"] as const;
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      if (randomResponse === "accepted") {
        setOfferStatus("accepted");
        toast({
          title: "Offer accepted! ✓",
          description: `Great! ${selected.contactName} accepted your NPR ${offer} offer.`,
        });
      } else if (randomResponse === "counter") {
        // Seller suggests ~85% of original price as counter
        const counterPrice = Math.round(selected.price * 0.85);
        setCounterOfferAmount(counterPrice);
        setOfferStatus("counter");
        toast({
          title: "Counter offer received 🎯",
          description: `${selected.contactName} countered with NPR ${counterPrice}`,
        });
      } else {
        setOfferStatus("rejected");
        toast({
          title: "Offer declined",
          description: `Sorry, ${selected.contactName} rejected your offer.`,
          variant: "destructive",
        });
      }
    }, 2000);
  };

  /**
   * Accept seller's counter offer
   * Updates status and allows buyer to proceed to payment
   */
  const handleAcceptCounter = () => {
    if (!counterOfferAmount) return;
    
    toast({
      title: "Counter offer accepted! ✓",
      description: `You agreed to NPR ${counterOfferAmount}. Call ${selected?.contactName} to finalize.`,
    });
    setOfferStatus("accepted");
  };

  /**
   * Reject seller's counter offer and return to initial offer state
   * Buyer can send a new offer or try different amount
   */
  const handleRejectCounter = () => {
    setOfferStatus("idle");
    setCounterOfferAmount(null);
    setOfferAmount("");
    toast({
      title: "Counter offer rejected",
      description: "You can send a new offer.",
    });
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIllustrations variant="marketplace" />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative materials-shell">
        <div className="materials-ambient" aria-hidden="true" />
        <div className="relative z-10">
          <PageHeader
            title="Builder's Bazaar - Find Materials"
            description="Discover construction materials available nearby. Buy directly from local suppliers and builders."
            actions={
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="default" size="default">
                  <Link to="/materials/list">+ List Materials</Link>
                </Button>
                <Select value={radius} onValueChange={setRadius}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Within 5 miles</SelectItem>
                    <SelectItem value="10">Within 10 miles</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="wood">Wood</SelectItem>
                    <SelectItem value="metal">Metal</SelectItem>
                    <SelectItem value="concrete">Concrete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
          />

          <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
            <div className="space-y-5">
              <Card className="overflow-hidden card-shadow border-primary/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    Your Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-muted/30 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current location</p>
                        <p className="text-base font-semibold text-foreground mt-1">{location.label}</p>
                      </div>
                      <Badge variant={locationStatus === "error" ? "destructive" : "secondary"} className="flex-shrink-0">
                        {locationStatus === "loading"
                          ? "Locating..."
                          : locationStatus === "error"
                            ? "GPS Error"
                            : "Active"}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-3 grid-cols-2">
                      <div className="rounded-lg bg-card/90 backdrop-blur-sm p-3.5 border border-border/50">
                        <p className="text-xs font-medium text-muted-foreground">Materials Found</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{listings.length}</p>
                      </div>
                      <div className="rounded-lg bg-card/90 backdrop-blur-sm p-3.5 border border-border/50">
                        <p className="text-xs font-medium text-muted-foreground">Search Radius</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{radius} mi</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    📍 Listings sorted by proximity • Move to refresh GPS
                  </p>
                </CardContent>
              </Card>

              <Card className="card-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Material Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {categoryInsights.length > 0 ? (
                      categoryInsights.map(([label, count]) => (
                        <Badge key={label} variant="secondary" className="px-3 py-1">
                          {label} · {count}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No materials available in range.</p>
                    )}
                  </div>
                  <div className="space-y-2.5 pt-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Areas</p>
                    {areaInsights.length > 0 ? (
                      <div className="grid gap-2.5">
                        {areaInsights.map(([area, count]) => (
                          <div key={area} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <span className="font-medium text-foreground">{area}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No locations found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow border-accent/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    Trending Now
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <div className="grid gap-2.5">
                    <div className="rounded-lg border border-border bg-gradient-to-br from-accent/5 to-muted/40 p-3">
                      <p className="text-xs font-medium text-muted-foreground">Most Searched</p>
                      <p className="font-semibold text-foreground mt-0.5">TMT Steel Rods</p>
                    </div>
                    <div className="rounded-lg border border-border bg-gradient-to-br from-primary/5 to-muted/40 p-3">
                      <p className="text-xs font-medium text-muted-foreground">Best Deals</p>
                      <p className="font-semibold text-foreground mt-0.5">Free Materials</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow bg-gradient-to-br from-yellow-50/50 to-background border-yellow-200/40">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex gap-2.5 items-start">
                      <span className="text-primary text-lg leading-none mt-0.5">•</span>
                      <span>Increase radius to see more materials</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-primary text-lg leading-none mt-0.5">•</span>
                      <span>Use category filters for specific items</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-primary text-lg leading-none mt-0.5">•</span>
                      <span>Contact sellers during business hours</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Users className="h-4 w-4 text-blue-600" />
                    Market Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2.5">
                  <div className="rounded-lg border border-border bg-gradient-to-br from-blue-50/50 to-muted/40 p-3.5">
                    <p className="text-xs font-medium text-muted-foreground">Total Listings</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{listings.length}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-gradient-to-br from-green-50/50 to-muted/40 p-3.5">
                    <p className="text-xs font-medium text-muted-foreground">Active Locations</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{new Set(listings.map((l) => l.locationName)).size}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow bg-gradient-to-br from-primary/10 via-accent/5 to-muted border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Upload className="h-5 w-5 text-primary" />
                    Sell Your Materials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Got surplus construction materials? List them and connect with local builders.
                  </p>
                  <Button asChild className="w-full shadow-sm" size="lg">
                    <Link to="/materials/list">
                      <Upload className="mr-2 h-4 w-4" />
                      Start Listing
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

          <div className="space-y-5">
            {listings.map((listing) => (
              <Card key={listing.id} className="card-shadow hover:card-shadow-hover transition-all duration-200 border-border/70">
                <CardHeader className="space-y-3 pb-4">
                    <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
                    <img
                      src={listing.imageUrl}
                      alt={listing.name}
                        className="block h-56 w-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <CardTitle className="text-lg font-bold leading-tight">{listing.name}</CardTitle>
                    <Badge variant="outline" className="flex-shrink-0">
                      📍 {listing.distance.toFixed(1)} mi
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="px-3 py-1">
                      {materialCategoryLabels[listing.category]}
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      {materialConditionLabels[listing.condition]}
                    </Badge>
                    {listing.isFree ? (
                      <Badge className="bg-green-600 hover:bg-green-700 px-3 py-1">🎁 Free</Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1.5 px-3 py-1 border-primary/30">
                        <CircleDollarSign className="h-3.5 w-3.5" />
                        <span className="text-sm font-bold">NPR {listing.price}</span>
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-2.5">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">{listing.locationName}</span>
                  </div>
                  {listing.notes && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{listing.notes}</p>
                  )}
                  <Button className="w-full shadow-sm" size="lg" onClick={() => handleOpenDialog(listing)}>
                    View & Purchase
                  </Button>
                </CardContent>
              </Card>
            ))}

            {listings.length === 0 && (
              <Card className="card-shadow border-dashed">
                <CardContent className="py-16 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-base font-medium text-foreground mb-2">No materials found</p>
                  <p className="text-sm text-muted-foreground">Try increasing your search radius or changing the category filter.</p>
                </CardContent>
              </Card>
            )}
          </div>
          </div>
        </div>
      </main>
      <Footer />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Purchase Material</DialogTitle>
            <DialogDescription className="text-sm">
              Coordinate pickup details and payment with the seller below.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="overflow-hidden rounded-xl border border-border bg-muted/40 shadow-sm">
                <img
                  src={selected.imageUrl}
                  alt={selected.name}
                  className="block w-full max-h-72 object-contain py-4"
                  loading="lazy"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Item</p>
                  <p className="font-semibold text-foreground text-base">{selected.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact</p>
                  <p className="font-semibold text-foreground text-base">{selected.contactName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm bg-muted/40 rounded-lg p-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-medium">{selected.contactPhone}</span>
              </div>
              
              {/* Item History Timeline */}
              {selected.history && selected.history.length > 0 && (
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <History className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">Item History</p>
                  </div>
                  
                  <div className="space-y-3">
                    {selected.history
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((event, index) => {
                        const getEventIcon = () => {
                          switch (event.type) {
                            case "listed":
                              return <Upload className="h-4 w-4 text-blue-500" />;
                            case "reserved":
                              return <Lock className="h-4 w-4 text-yellow-500" />;
                            case "sold":
                              return <CheckCircle className="h-4 w-4 text-green-500" />;
                            case "condition_change":
                              return <Package className="h-4 w-4 text-orange-500" />;
                            default:
                              return null;
                          }
                        };
                        
                        const getEventColor = () => {
                          switch (event.type) {
                            case "listed":
                              return "bg-blue-50 border-blue-200";
                            case "reserved":
                              return "bg-yellow-50 border-yellow-200";
                            case "sold":
                              return "bg-green-50 border-green-200";
                            case "condition_change":
                              return "bg-orange-50 border-orange-200";
                            default:
                              return "bg-muted border-border";
                          }
                        };
                        
                        return (
                          <div key={index} className={`flex gap-3 p-3 rounded-lg border ${getEventColor()}`}>
                            <div className="flex-shrink-0 mt-1">
                              {getEventIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {event.description}
                              </p>
                              {event.owner && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Owner: {event.owner}
                                </p>
                              )}
                              {event.condition && (
                                <p className="text-xs text-muted-foreground">
                                  Condition: {materialConditionLabels[event.condition]}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(event.date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
              
              <div className="border-t border-border pt-5\">
                <div className="flex items-center justify-between mb-4\">
                  <label className="text-sm font-semibold text-foreground\">Pricing</label>
                  <span className="text-2xl font-bold text-primary\">NPR {selected.price}</span>
                </div>
                
                {!showOfferMode ? (
                  <div className="grid gap-3">
                    <Button 
                      variant="default" 
                      className="w-full shadow-sm"
                      size="lg"
                      onClick={() => setShowOfferMode(true)}
                    >
                      💰 Make an Offer
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">Or proceed with listed price</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {offerStatus === "idle" && (
                      <>
                        <Input
                          type="number"
                          placeholder="Enter your offer amount"
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                          min="1"
                          max={selected.price - 1}
                        />
                        <Button 
                          className="w-full"
                          onClick={handleSendOffer}
                        >
                          Send Offer
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowOfferMode(false)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    
                    {offerStatus === "sent" && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-center">
                        <p className="text-sm font-medium text-blue-900">Waiting for seller response...</p>
                      </div>
                    )}
                    
                    {offerStatus === "accepted" && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded text-center">
                        <p className="text-sm font-bold text-green-900">✓ Offer Accepted!</p>
                        <p className="text-xs text-green-800">Proceed to payment below</p>
                      </div>
                    )}
                    
                    {offerStatus === "rejected" && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-center">
                        <p className="text-sm font-medium text-red-900">Offer declined</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => {
                            setOfferStatus("idle");
                            setOfferAmount("");
                          }}
                        >
                          Try Again
                        </Button>
                      </div>
                    )}
                    
                    {offerStatus === "counter" && counterOfferAmount && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded space-y-2">
                        <p className="text-sm font-medium text-yellow-900">Counter Offer: NPR {counterOfferAmount}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            size="sm"
                            className="w-full"
                            onClick={handleAcceptCounter}
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={handleRejectCounter}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-5">
                <label className="text-sm font-semibold text-foreground block mb-3">Pickup Location</label>
                <Select value={selectedPickupLocation} onValueChange={setSelectedPickupLocation}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kathmandu_locations.map((loc) => (
                      <SelectItem key={loc.label} value={loc.label}>
                        📍 {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground block">Payment Method</label>
                <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as "cod" | "advance")}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">💵 Cash on Delivery (COD)</SelectItem>
                    <SelectItem value="advance">💳 Advance Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "advance" && (
                <div className="border-t border-border pt-5 space-y-4">
                  <p className="text-sm font-semibold text-foreground">Choose Payment Gateway</p>
                  <div className="space-y-2.5">
                    <Button variant="outline" className="w-full justify-start h-12 hover:border-purple-400" onClick={() => handlePaymentGateway("khalti")}>
                      <span className="text-lg font-bold text-purple-600 mr-3">₭</span>
                      <span className="font-medium">Pay with Khalti</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 hover:border-green-400" onClick={() => handlePaymentGateway("esewa")}>
                      <span className="text-lg font-bold text-green-600 mr-3">e</span>
                      <span className="font-medium">Pay with eSewa</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 hover:border-blue-400" onClick={() => handlePaymentGateway("bank")}>
                      <span className="text-lg mr-3">🏦</span>
                      <span className="font-medium">Bank Transfer</span>
                    </Button>
                  </div>
                  <div className="mt-4 p-4 bg-muted/60 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Bank:</span> Nepal Builder's Bank, Thamel Branch
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-semibold text-foreground">Account:</span> 123456789
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            {selected && (
              <Button variant="outline" asChild size="lg">
                <a href={`tel:${selected.contactPhone.replace(/\s+/g, "")}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call Seller
                </a>
              </Button>
            )}
            <Button onClick={handlePurchase} size="lg" className="shadow-sm">
              ✓ Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialsFind;
