import { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import BackgroundIllustrations from "@/components/layout/BackgroundIllustrations";
import EquipmentCard from "@/components/equipment/EquipmentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockEquipment, categoryLabels, sortOptions, EquipmentCategory, SortOption } from "@/lib/mockData";
import { useFavoritesStore } from "@/lib/favoritesStore";
import { Search, SlidersHorizontal, X, Heart, Grid3X3, LayoutList, Package } from "lucide-react";

const BrowseEquipment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("most_rented");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { favorites } = useFavoritesStore();
  const categories = Object.keys(categoryLabels) as EquipmentCategory[];

  const filteredAndSortedEquipment = useMemo(() => {
    let result = mockEquipment.filter((equipment) => {
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
        result.sort((a, b) => (a.owner.distance || 999) - (b.owner.distance || 999));
        break;
      case "price_low":
        result.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "price_high":
        result.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, priceRange, sortBy, showFavoritesOnly, favorites]);

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
              <SelectTrigger className="w-full lg:w-[200px]">
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
              <SelectTrigger className="w-full lg:w-[180px]">
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
              className="gap-2"
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
            <div className="rounded-lg border border-border bg-card p-6 space-y-6">
              <div className="flex items-center justify-between">
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
                  <span>${priceRange[0]}/day</span>
                  <span>${priceRange[1]}/day</span>
                </div>
              </div>

              {/* Favorites Toggle */}
              <div className="flex items-center justify-between">
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
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredAndSortedEquipment.length} of {mockEquipment.length} listings
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

        {/* Equipment Grid/List */}
        {filteredAndSortedEquipment.length > 0 ? (
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
                <EquipmentCard equipment={equipment} />
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
