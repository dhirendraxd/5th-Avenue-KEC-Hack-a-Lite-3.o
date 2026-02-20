import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackgroundIllustrations from "@/components/layout/BackgroundIllustrations";
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
import { MapPin, Phone, CircleDollarSign } from "lucide-react";
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
  const [radius, setRadius] = useState("10");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "error">("idle");
  const [selected, setSelected] = useState<MaterialListing | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleOpenDialog = (listing: MaterialListing) => {
    setSelected(listing);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIllustrations variant="marketplace" />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative z-10">
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

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Nearby availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 via-background to-muted p-6">
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
                  <div className="rounded-lg bg-card/80 p-3 shadow-sm">
                    <p className="text-xs text-muted-foreground">Listings in range</p>
                    <p className="text-2xl font-semibold text-foreground">{listings.length}</p>
                  </div>
                  <div className="rounded-lg bg-card/80 p-3 shadow-sm">
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

          <div className="space-y-4">
            {listings.map((listing) => (
              <Card key={listing.id}>
                <CardHeader className="space-y-2">
                  <div className="overflow-hidden rounded-lg border border-border">
                    <img
                      src={listing.imageUrl}
                      alt={listing.name}
                      className="h-44 w-full object-cover"
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
                      <Badge variant="outline">
                        <CircleDollarSign className="mr-1 h-3 w-3" />
                        {listing.price}
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
                    I Want This
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
            <div className="space-y-3">
              <div className="overflow-hidden rounded-lg border border-border">
                <img
                  src={selected.imageUrl}
                  alt={selected.name}
                  className="h-40 w-full object-cover"
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
            <Button onClick={() => setDialogOpen(false)}>Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialsFind;
