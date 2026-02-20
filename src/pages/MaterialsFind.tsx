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
import { MapPin, Phone, CircleDollarSign, Lightbulb, TrendingUp, Users, Upload } from "lucide-react";
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

  const areaInsights = useMemo(() => {
    const counts = listings.reduce<Record<string, number>>((acc, listing) => {
      acc[listing.locationName] = (acc[listing.locationName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [listings]);

  const categoryInsights = useMemo(() => {
    const counts = listings.reduce<Record<string, number>>((acc, listing) => {
      const label = materialCategoryLabels[listing.category];
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts);
  }, [listings]);

  const handleOpenDialog = (listing: MaterialListing) => {
    setSelected(listing);
    setSelectedPickupLocation("Thamel");
    setPaymentMethod("cod");
    setSelectedGateway(null);
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

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIllustrations variant="marketplace" />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative materials-shell">
        <div className="materials-ambient" aria-hidden="true" />
        <div className="relative z-10">
          <PageHeader
            title="Find It"
            description="See materials available within 5-10 miles of your location."
            actions={
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link to="/materials/list">List it</Link>
                </Button>
                <Select value={radius} onValueChange={setRadius}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Within 5 miles</SelectItem>
                    <SelectItem value="10">Within 10 miles</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[160px]">
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

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <Card className="overflow-hidden card-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Nearby availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-muted p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current location</p>
                        <p className="text-lg font-semibold text-foreground">{location.label}</p>
                      </div>
                      <Badge variant={locationStatus === "error" ? "destructive" : "secondary"}>
                        {locationStatus === "loading"
                          ? "Locating"
                          : locationStatus === "error"
                            ? "GPS unavailable"
                            : "GPS ready"}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-card/80 p-3 shadow-sm">
                        <p className="text-xs text-muted-foreground">Listings in range</p>
                        <p className="text-2xl font-semibold text-foreground">{listings.length}</p>
                      </div>
                      <div className="rounded-xl bg-card/80 p-3 shadow-sm">
                        <p className="text-xs text-muted-foreground">Radius</p>
                        <p className="text-2xl font-semibold text-foreground">{radius} mi</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Move around to refresh GPS. Listings are sorted by distance.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Availability insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {categoryInsights.length > 0 ? (
                      categoryInsights.map(([label, count]) => (
                        <Badge key={label} variant="secondary">
                          {label} · {count}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No listings yet.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Top areas</p>
                    {areaInsights.length > 0 ? (
                      <div className="grid gap-2">
                        {areaInsights.map(([area, count]) => (
                          <div key={area} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{area}</span>
                            <span className="text-muted-foreground">{count} listings</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No areas detected yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    Search trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3">
                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Most searched</p>
                      <p className="font-semibold text-foreground">TMT Steel Rods</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Best deals</p>
                      <p className="font-semibold text-foreground">Free items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Quick tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Widen radius for more options</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Filter by category to narrow down</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Contact sellers during business hours</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-blue-500" />
                    Marketplace stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Total listings</p>
                    <p className="text-2xl font-bold text-foreground">{listings.length}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Active locations</p>
                    <p className="text-2xl font-bold text-foreground">{new Set(listings.map((l) => l.locationName)).size}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Upload className="h-4 w-4 text-primary" />
                    List your materials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Have surplus construction materials? Share them with local builders and earn money.
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/materials/list">
                      <Upload className="mr-2 h-4 w-4" />
                      Start selling
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

          <div className="space-y-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="card-shadow">
                <CardHeader className="space-y-2">
                    <div className="overflow-hidden rounded-2xl border border-border bg-muted/40">
                    <img
                      src={listing.imageUrl}
                      alt={listing.name}
                        className="block h-52 w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-lg">{listing.name}</CardTitle>
                    <Badge variant="outline">
                      {listing.distance.toFixed(1)} mi away
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {materialCategoryLabels[listing.category]}
                    </Badge>
                    <Badge variant="secondary">
                      {materialConditionLabels[listing.condition]}
                    </Badge>
                    {listing.isFree ? (
                      <Badge>Free</Badge>
                    ) : (
                      <Badge variant="outline" className="gap-2">
                        <CircleDollarSign className="h-3 w-3" />
                        <span className="text-base font-semibold">NPR</span>
                        <span className="text-base font-semibold">{listing.price}</span>
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {listing.locationName}
                  </div>
                  {listing.notes && (
                    <p className="text-sm text-muted-foreground">{listing.notes}</p>
                  )}
                  <Button className="w-full" onClick={() => handleOpenDialog(listing)}>
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            ))}

            {listings.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No listings match your radius. Try widening the search.
                </CardContent>
              </Card>
            )}
          </div>
          </div>
        </div>
      </main>
      <Footer />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coordinate pickup</DialogTitle>
            <DialogDescription>
              Reach out to confirm availability and pickup time.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border border-border bg-muted/40 p-3">
                <img
                  src={selected.imageUrl}
                  alt={selected.name}
                  className="block w-full max-h-64 object-contain"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Item</p>
                <p className="font-semibold text-foreground">{selected.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-semibold text-foreground">{selected.contactName}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {selected.contactPhone}
              </div>
              
              <div className="border-t border-border pt-4">
                <label className="text-sm text-muted-foreground">Pickup location</label>
                <Select value={selectedPickupLocation} onValueChange={setSelectedPickupLocation}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kathmandu_locations.map((loc) => (
                      <SelectItem key={loc.label} value={loc.label}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Payment method</label>
                <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as "cod" | "advance")}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery (COD)</SelectItem>
                    <SelectItem value="advance">Advance Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "advance" && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground mb-3">Choose payment gateway</p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => handlePaymentGateway("khalti")}>
                      <span className="text-base font-bold text-purple-600 mr-2">₭</span>
                      Pay with Khalti
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handlePaymentGateway("esewa")}>
                      <span className="text-base font-bold text-green-600 mr-2">e</span>
                      Pay with eSewa
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handlePaymentGateway("bank")}>
                      <span className="text-base font-bold text-blue-600 mr-2">🏦</span>
                      Bank Transfer
                    </Button>
                  </div>
                  <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Account:</span> Nepal Builder's Bank, Branch: Thamel
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Account No:</span> 123456789
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selected && (
              <Button variant="outline" asChild>
                <a href={`tel:${selected.contactPhone.replace(/\s+/g, "")}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </a>
              </Button>
            )}
            <Button onClick={handlePurchase}>Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialsFind;
