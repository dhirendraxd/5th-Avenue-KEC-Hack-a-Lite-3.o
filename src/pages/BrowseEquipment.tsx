import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import BackgroundIllustrations from "@/components/layout/BackgroundIllustrations";
import EquipmentCard from "@/components/equipment/EquipmentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Equipment, EquipmentCategory, RentalRequest, SortOption } from "@/lib/mockData";
import { categoryLabels, sortOptions } from "@/lib/constants";
import { useFavoritesStore } from "@/lib/favoritesStore";
import { subscribeFirebaseEquipment } from "@/lib/firebase/equipment";
import { subscribeFirebaseRentals } from "@/lib/firebase/rentals";
import { Search, SlidersHorizontal, X, Heart, Grid3X3, LayoutList, Package } from "lucide-react";
import { addDays } from "date-fns";

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

const parseLatLngFromMapUrl = (value?: string): { lat: number; lng: number } | null => {
  if (!value) return null;

  const decoded = decodeURIComponent(value);
  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = decoded.match(pattern);
    if (!match) continue;
    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }

  return null;
};

const BrowseEquipment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("most_rented");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [allRentals, setAllRentals] = useState<RentalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "active" | "error">("idle");

  const { favorites } = useFavoritesStore();
  const categories = Object.keys(categoryLabels) as EquipmentCategory[];

  useEffect(() => {
    const unsubscribe = subscribeFirebaseEquipment(
      (firebaseEquipment) => {
        setAllEquipment(firebaseEquipment);
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to load Firebase equipment:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeFirebaseRentals(
      (rentals) => setAllRentals(rentals),
      (error) => console.error("Failed to load rentals for availability:", error)
    );

    return () => unsubscribe();
  }, []);

  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus("active");
        setSortBy("closest");
      },
      () => {
        setLocationStatus("error");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const nextAvailableByEquipment = useMemo(() => {
    const now = new Date();
    const equipmentById = new Map(allEquipment.map((equipment) => [equipment.id, equipment]));
    const byEquipment = new Map<string, Date>();

    allRentals.forEach((rental) => {
      if (rental.status !== "approved" && rental.status !== "active") return;
      const equipmentId = rental.equipment.id;
      if (!equipmentId) return;
      if (rental.startDate > now || rental.endDate < now) return;

      const equipment = equipmentById.get(equipmentId);
      const bufferDays = equipment?.availability.bufferDays ?? 0;
      const freeDate = addDays(rental.endDate, bufferDays);
      const current = byEquipment.get(equipmentId);

      if (!current || freeDate > current) {
        byEquipment.set(equipmentId, freeDate);
      }
    });

    return byEquipment;
  }, [allEquipment, allRentals]);

  const liveDistanceByEquipment = useMemo(() => {
    const byEquipment = new Map<string, number>();
    if (!userCoords) return byEquipment;

    allEquipment.forEach((equipment) => {
      const coords = parseLatLngFromMapUrl(equipment.locationMapUrl);
      if (!coords) return;
      byEquipment.set(
        equipment.id,
        distanceInMiles(userCoords.lat, userCoords.lng, coords.lat, coords.lng),
      );
    });

    return byEquipment;
  }, [allEquipment, userCoords]);

  const filteredAndSortedEquipment = useMemo(() => {
    const result = allEquipment.filter((equipment) => {
      const matchesSearch =
        equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        equipment.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || equipment.category === selectedCategory;
      const matchesPrice =
        equipment.pricePerDay >= priceRange[0] &&
        equipment.pricePerDay <= priceRange[1];
      const matchesFavorites = !showFavoritesOnly || favorites.includes(equipment.id);
      return matchesSearch && matchesCategory && matchesPrice && matchesFavorites;
    });

    switch (sortBy) {
      case "most_rented":
        result.sort((a, b) => b.totalRentals - a.totalRentals);
        break;
      case "highest_rated":
        result.sort((a, b) => {
          const ratingA = a.reviews.length > 0 ? a.reviews.reduce((acc, r) => acc + r.rating, 0) / a.reviews.length : 0;
          const ratingB = b.reviews.length > 0 ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length : 0;
          return ratingB - ratingA;
        });
        break;
      case "closest":
        result.sort((a, b) => {
          const distanceA = liveDistanceByEquipment.get(a.id) ?? a.owner.distance ?? 999;
          const distanceB = liveDistanceByEquipment.get(b.id) ?? b.owner.distance ?? 999;
          return distanceA - distanceB;
        });
        break;
      case "price_low":
        result.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "price_high":
        result.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
    }

    return result;
  }, [allEquipment, searchQuery, selectedCategory, priceRange, sortBy, showFavoritesOnly, favorites, liveDistanceByEquipment]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 1500]);
    setShowFavoritesOnly(false);
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== "all" || priceRange[0] > 0 || priceRange[1] < 1500 || showFavoritesOnly;

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIllustrations variant="marketplace" />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative z-10">
        <PageHeader
          title="Browse Equipment"
          description="Find specialized equipment from verified businesses near you"
          actions={
            <Button asChild variant="outline">
              <Link to="/dashboard/add-equipment">Add Equipment</Link>
            </Button>
          }
          className="mb-10"
        />

        {/* Search, Sort, and Filters */}
        <div className="mb-10 space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Select */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[260px] lg:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {categoryLabels[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Select */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-[220px] lg:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Toggle */}
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 w-full lg:w-auto"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="info" className="ml-1">
                  Active
                </Badge>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="space-y-6 rounded-lg border border-border bg-card p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-semibold text-foreground">Filters</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-1 h-3 w-3" />
                    Clear All
                  </Button>
                )}
              </div>
              
              {/* Price Range */}
                <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Price Range</h4>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={1500}
                  step={25}
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>NPR {priceRange[0]}/day</span>
                  <span>NPR {priceRange[1]}/day</span>
                </div>
              </div>

              {/* Favorites Toggle */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Saved Only</h4>
                  <p className="text-xs text-muted-foreground">Show only your saved equipment</p>
                </div>
                <Button
                  variant={showFavoritesOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className="gap-2"
                >
                  <Heart className={showFavoritesOnly ? "h-4 w-4 fill-current" : "h-4 w-4"} />
                  {favorites.length} Saved
                </Button>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Live Location</h4>
                  <p className="text-xs text-muted-foreground">
                    Use GPS to improve closest sorting for listings with map coordinates.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseLiveLocation}
                  disabled={locationStatus === "loading"}
                >
                  {locationStatus === "loading" ? "Locating..." : "Use Live Location"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {isLoading ? (
            <Skeleton className="h-4 w-40" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {filteredAndSortedEquipment.length} of {allEquipment.length} listings
            </p>
          )}
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

        {/* Equipment Grid/List */}
        {isLoading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                : "flex flex-col gap-6"
            }
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="rounded-xl border border-border bg-card p-4 space-y-4">
                <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedEquipment.length > 0 ? (
          <div className={viewMode === "grid" 
            ? "grid gap-8 sm:grid-cols-2 lg:grid-cols-3" 
            : "flex flex-col gap-6"
          }>
            {filteredAndSortedEquipment.map((equipment, index) => (
              <div
                key={equipment.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <EquipmentCard
                  equipment={equipment}
                  nextAvailableAt={nextAvailableByEquipment.get(equipment.id)}
                  distanceMiles={liveDistanceByEquipment.get(equipment.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No equipment found"
            description={
              showFavoritesOnly
                ? "You haven't saved any equipment yet. Click the heart icon to save listings."
                : "Try adjusting your filters or search query"
            }
            action={
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            }
            className="py-16 rounded-lg border border-border bg-card"
          />
        )}
      </main>
    </div>
  );
};

export default BrowseEquipment;
