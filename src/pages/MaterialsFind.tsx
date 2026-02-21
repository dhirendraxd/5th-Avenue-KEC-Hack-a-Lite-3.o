import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackgroundIllustrations from "@/components/layout/BackgroundIllustrations";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  materialCategoryLabels,
  materialConditionLabels,
  pickRandomCondition,
  type MaterialListing,
} from "@/lib/materialsMock";
import {
  createFirebaseMaterial,
  subscribeFirebaseMaterials,
} from "@/lib/firebase/materials";
import { createFirebaseMaterialRequest } from "@/lib/firebase/materialRequests";
import { isCloudinaryConfigured, uploadImagesToCloudinary } from "@/lib/cloudinary";
import {
  Camera,
  ChevronRight,
  MapPin,
  Phone,
  Search,
  SlidersHorizontal,
  X,
  Grid3X3,
  LayoutList,
  Package,
} from "lucide-react";

const DEFAULT_COORDINATES = { latitude: 27.7172, longitude: 85.324 };

type TabMode = "browse" | "list";
type MaterialSortOption = "closest" | "price_low" | "price_high" | "newest";

type ListingWithDistance = MaterialListing & { distance: number };

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
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get("tab") === "list" ? "list" : "browse";
  const [activeTab, setActiveTab] = useState<TabMode>(initialTab);

  const [allListings, setAllListings] = useState<MaterialListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  const [radius, setRadius] = useState("10");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<MaterialSortOption>("closest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [location, setLocation] = useState({ ...DEFAULT_COORDINATES, label: "Current location" });

  const [selectedListing, setSelectedListing] = useState<ListingWithDistance | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("Thamel");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "advance">("cod");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [condition, setCondition] = useState<string>(() => pickRandomCondition());
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [listLocation, setListLocation] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [listCoordinates, setListCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeFirebaseMaterials(
      (materials) => {
        setAllListings(materials);
        setIsLoadingListings(false);
      },
      () => {
        setIsLoadingListings(false);
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: "Current location",
        });
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const filteredListings = useMemo<ListingWithDistance[]>(() => {
    const maxDistance = Number(radius);
    return allListings
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
      .filter((listing) => categoryFilter === "all" || listing.category === categoryFilter)
      .filter((listing) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          listing.name.toLowerCase().includes(query) ||
          listing.locationName.toLowerCase().includes(query) ||
          listing.notes?.toLowerCase().includes(query)
        );
      });
  }, [allListings, radius, categoryFilter, searchQuery, location]);

  const listings = useMemo<ListingWithDistance[]>(() => {
    const result = [...filteredListings];
    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "closest":
      default:
        result.sort((a, b) => a.distance - b.distance);
        break;
    }

    return result;
  }, [filteredListings, sortBy]);

  const hasActiveFilters = searchQuery || categoryFilter !== "all" || radius !== "10";

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setRadius("10");
    setSortBy("closest");
  };

  const switchTab = (value: string) => {
    const next = value === "list" ? "list" : "browse";
    setActiveTab(next);
    setSearchParams(next === "list" ? { tab: "list" } : {});
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) return;
        setUploadedPhotos((prev) => (prev.length < 4 ? [...prev, result] : prev));
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  const handleUseListingLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setListCoordinates({ latitude, longitude });
        setListLocation(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handlePublish = async (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !category || !condition || !listLocation.trim() || uploadedPhotos.length === 0) {
      toast({
        title: "Missing fields",
        description: "Complete all required fields before publishing.",
        variant: "destructive",
      });
      return;
    }

    if (!isFree && Number(price) <= 0) {
      toast({
        title: "Invalid price",
        description: "Set a valid price or mark as free.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      let imageUrl = uploadedPhotos[0];
      if (isCloudinaryConfigured()) {
        const [cloudinaryUrl] = await uploadImagesToCloudinary([uploadedPhotos[0]]);
        imageUrl = cloudinaryUrl;
      }

      await createFirebaseMaterial({
        name: name.trim(),
        category: category as "wood" | "metal" | "concrete",
        condition: condition as "sealed" | "new" | "used",
        imageUrl,
        price: isFree ? 0 : Number(price),
        isFree,
        locationName: listLocation.trim(),
        latitude: listCoordinates?.latitude ?? DEFAULT_COORDINATES.latitude,
        longitude: listCoordinates?.longitude ?? DEFAULT_COORDINATES.longitude,
        contactName: user?.name || "Builder",
        contactPhone: "+977 9800000000",
        sellerId: user?.id,
      });

      toast({
        title: "Listing published",
        description: "Your material listing is stored successfully.",
      });

      setName("");
      setCategory("");
      setCondition(pickRandomCondition());
      setPrice("");
      setIsFree(false);
      setListLocation("");
      setUploadedPhotos([]);
      setListCoordinates(null);
      switchTab("browse");
    } catch {
      toast({
        title: "Publish failed",
        description: "Could not save listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const openRequestDialog = (listing: ListingWithDistance) => {
    setSelectedListing(listing);
    setPickupLocation("Thamel");
    setPaymentMethod("cod");
    setRequestDialogOpen(true);
  };

  const handleCreateRequest = async () => {
    if (!selectedListing) return;

    setIsSubmittingRequest(true);
    try {
      await createFirebaseMaterialRequest({
        materialId: selectedListing.id,
        materialName: selectedListing.name,
        materialImageUrl: selectedListing.imageUrl,
        sellerId: selectedListing.sellerId,
        sellerName: selectedListing.contactName,
        requesterId: user?.id,
        requesterName: user?.name || "Guest Buyer",
        pickupLocation,
        paymentMethod,
      });

      toast({
        title: "Request sent",
        description: "Your request has been submitted to the seller.",
      });
      setRequestDialogOpen(false);
    } catch {
      toast({
        title: "Request failed",
        description: "Could not submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIllustrations variant="marketplace" />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative z-10">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link to="/materials/find" className="hover:text-foreground transition-colors">Browse Materials</Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-foreground">
            {activeTab === "browse" ? "Browse Materials" : "List Material"}
          </span>
        </nav>

        <PageHeader
          title="Browse Materials"
          description="Find construction materials and scrap inventory near your site."
          actions={
            activeTab === "browse" ? (
              <Button variant="outline" onClick={() => switchTab("list")}>
                List Material
              </Button>
            ) : (
              <Button variant="outline" onClick={() => switchTab("browse")}>
                Browse Materials
              </Button>
            )
          }
        />

        <Card className="mb-6">
          <CardContent className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {isLoadingListings
                ? "Loading marketplace data"
                : `${allListings.length} total material listings available`}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{activeTab === "browse" ? "Browse" : "List"}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => switchTab(activeTab === "browse" ? "list" : "browse")}
              >
                {activeTab === "browse" ? "Go to Listing Form" : "Go to Marketplace"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={switchTab} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="browse">Browse Materials</TabsTrigger>
            <TabsTrigger value="list">List Material</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search materials, scrap, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full lg:w-[190px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      <SelectItem value="wood">Wood & Timber</SelectItem>
                      <SelectItem value="metal">Metal & Scrap</SelectItem>
                      <SelectItem value="concrete">Concrete & Blocks</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as MaterialSortOption)}>
                    <SelectTrigger className="w-full lg:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="closest">Closest</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={showFilters ? "secondary" : "outline"}
                    onClick={() => setShowFilters((prev) => !prev)}
                    className="gap-2 w-full lg:w-auto"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="info" className="ml-1">Active</Badge>
                    )}
                  </Button>
                </div>

                {showFilters && (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-muted-foreground">Distance from your location</div>
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          <X className="mr-1 h-3 w-3" />
                          Clear All
                        </Button>
                      )}
                    </div>
                    <div className="mt-3">
                      <Select value={radius} onValueChange={setRadius}>
                        <SelectTrigger className="w-full sm:w-[220px]">
                          <SelectValue placeholder="Radius" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">Within 5 miles</SelectItem>
                          <SelectItem value="10">Within 10 miles</SelectItem>
                          <SelectItem value="15">Within 15 miles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {listings.length} of {allListings.length} material listings
              </p>
              <div className="flex items-center gap-1 rounded-lg border border-border p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="xs"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="xs"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isLoadingListings ? (
              <Card>
                <CardContent className="py-10 text-sm text-muted-foreground">Loading listings...</CardContent>
              </Card>
            ) : listings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No construction material or scrap listings match your filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === "grid" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                {listings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden">
                    <div className={viewMode === "grid" ? "" : "sm:flex"}>
                      <div className={viewMode === "grid" ? "aspect-[16/10] overflow-hidden bg-muted" : "sm:w-64 sm:flex-shrink-0 overflow-hidden bg-muted"}>
                        <img src={listing.imageUrl} alt={listing.name} className={viewMode === "grid" ? "h-full w-full object-cover" : "h-48 w-full object-cover sm:h-full"} loading="lazy" />
                      </div>
                      <div className="flex-1">
                        <CardHeader>
                          <CardTitle className="text-base">{listing.name}</CardTitle>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{materialCategoryLabels[listing.category]}</Badge>
                            <Badge variant="outline">{materialConditionLabels[listing.condition]}</Badge>
                            <Badge variant="outline">{listing.distance.toFixed(1)} mi</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {listing.locationName}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {listing.contactPhone}
                          </div>
                          <p className="font-semibold text-foreground">
                            {listing.isFree ? "Free" : `NPR ${listing.price}`}
                          </p>
                          <Button className="w-full sm:w-auto" onClick={() => openRequestDialog(listing)}>
                            Request Material
                          </Button>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Publish a Material Listing</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="grid gap-5" onSubmit={handlePublish}>
                  <Input
                    placeholder="Material name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wood">Wood</SelectItem>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="concrete">Concrete</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sealed">Sealed</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                    <Input
                      type="number"
                      min="0"
                      placeholder={isFree ? "Free" : "Price (NPR)"}
                      value={isFree ? "" : price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isFree}
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={isFree} onCheckedChange={(v) => setIsFree(Boolean(v))} />
                      Free
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <Input
                      placeholder="Location"
                      value={listLocation}
                      onChange={(e) => setListLocation(e.target.value)}
                    />
                    <Button type="button" variant="outline" onClick={handleUseListingLocation}>
                      Use Current Location
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Images (max 4)</label>
                    <div className="rounded-lg border border-dashed border-border p-4">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Camera className="h-4 w-4" />
                          Upload images
                        </div>
                      </label>
                    </div>
                    {uploadedPhotos.length > 0 && (
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {uploadedPhotos.map((photo, idx) => (
                          <div key={idx} className="overflow-hidden rounded-lg border border-border bg-muted/40">
                            <img src={photo} alt={`Uploaded ${idx + 1}`} className="h-24 w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isPublishing}>
                      {isPublishing ? "Publishing..." : "Publish Listing"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Request</DialogTitle>
            <DialogDescription>
              Confirm pickup and payment method to send your request.
            </DialogDescription>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              <div className="text-sm">
                <p className="font-medium text-foreground">{selectedListing.name}</p>
                <p className="text-muted-foreground">Seller: {selectedListing.contactName}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pickup location</label>
                <Input value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment method</label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "cod" | "advance")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on delivery</SelectItem>
                    <SelectItem value="advance">Advance payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRequest} disabled={isSubmittingRequest}>
              {isSubmittingRequest ? "Submitting..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialsFind;
