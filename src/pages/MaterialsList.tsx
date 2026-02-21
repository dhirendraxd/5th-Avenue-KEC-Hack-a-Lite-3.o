import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackgroundIllustrations from "@/components/layout/BackgroundIllustrations";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Camera, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { materialImages, pickRandomCondition } from "@/lib/materialsMock";

const MaterialsList = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [condition, setCondition] = useState<string>(() => pickRandomCondition());
  const [price, setPrice] = useState<string>("");
  const [isFree, setIsFree] = useState(false);
  const [location, setLocation] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location unavailable",
        description: "Your browser does not support GPS.",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setIsLocating(false);
      },
      () => {
        toast({
          title: "Unable to get location",
          description: "Please allow GPS access or enter a location.",
          variant: "destructive",
        });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  /**
   * Handle photo upload from file input
   * - Validates files are images
   * - Converts to Base64 data URL for preview
   * - Limits to 4 photos max per listing
   * - Shows progress toast notifications
   */
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Validate file type is image
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please upload image files only.",
          variant: "destructive",
        });
        return;
      }

      // Convert file to Base64 for display
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Check photo limit before adding
        if (uploadedPhotos.length < 4) {
          setUploadedPhotos([...uploadedPhotos, result]);
          toast({
            title: "Photo added",
            description: `${uploadedPhotos.length + 1}/4 photos uploaded.`,
          });
        } else {
          toast({
            title: "Photo limit reached",
            description: "Maximum 4 photos allowed.",
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * Remove photo from uploaded list by index
   * Allows user to replace or delete unwanted photos
   */
  const removePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  /**
   * Handle listing submission form
   * - Validates all required fields are filled
   * - Ensures price is provided unless marked as free
   * - Resets form and photos after successful submission
   * - Shows success confirmation toast
   */
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    // Check all required fields
    if (!name.trim() || !category || !condition || !location.trim()) {
      toast({
        title: "Missing fields",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate price if not free
    if (!isFree && (!price || Number(price) <= 0)) {
      toast({
        title: "Price required",
        description: "Add a valid price or mark the item as free.",
        variant: "destructive",
      });
      return;
    }

    // Success confirmation
    toast({
      title: "Listing saved",
      description: "This is a prototype. Your item is not yet published.",
    });

    // Reset all form fields and photos
    setName("");
    setCategory("");
    setCondition(pickRandomCondition());
    setPrice("");
    setIsFree(false);
    setLocation("");
    setUploadedPhotos([]);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIllustrations variant="marketplace" />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative materials-shell">
        <div className="materials-ambient" aria-hidden="true" />
        <div className="relative z-10">
          <PageHeader
            title="Builder's Bazaar - List Materials"
            description="Share surplus construction materials with nearby builders. List for free in minutes."
            actions={
              <Button asChild variant="outline" size="default" size="default">
                <Link to="/materials/find">🔍 Find Materials</Link>
              </Button>
            }
          />

          <Card className="max-w-3xl mx-auto card-shadow border-border/70">
          <CardHeader className="pb-5">
            <CardTitle className="text-xl font-bold">Material Details</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Fill in the information below to list your material</p>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
              <form className="order-2 grid gap-6 lg:order-1" onSubmit={handleSubmit}>
              <div className="grid gap-2.5.5">
                <label className="text-sm font-semibold">Item Name *</label>
                <Input
                  placeholder="e.g., TMT Steel Rods, Cement Bags, Plywood Sheets"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2.5">
                  <label className="text-sm font-semibold">Category *</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wood">Wood</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                      <SelectItem value="concrete">Concrete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2.5">
                  <label className="text-sm font-semibold">Condition *</label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sealed">Sealed</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="grid gap-2.5">
                  <label className="text-sm font-semibold">Price (NPR) *</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder={isFree ? "Item is marked as free" : "Enter price in NPR"}
                    value={isFree ? "" : price}
                    onChange={(event) => setPrice(event.target.value)}
                    disabled={isFree}
                    className="h-11"
                  />
                </div>
                <label className="flex items-center gap-2.5 text-sm font-medium pb-2.5">
                  <Checkbox
                    checked={isFree}
                    onCheckedChange={(value) => setIsFree(Boolean(value))}
                  />
                  Mark as Free
                </label>
              </div>

              <div className="grid gap-2.5">
                <label className="text-sm font-semibold">Location *</label>
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <Input
                    placeholder="Enter neighborhood or use GPS"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="h-11"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseLocation}
                    disabled={isLocating}
                    className="h-11 flex-shrink-0"
                  >
                    {isLocating ? "Getting location..." : "📍 Use GPS"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" className="px-8 shadow-sm">
                  🚀 Publish Listing
                </Button>
              </div>
              </form>

              <div className="order-1 space-y-4 lg:order-2">
                <div className="rounded-xl border-2 border-dashed border-border bg-gradient-to-br from-muted/30 to-muted/10 p-5 hover:border-primary/40 transition-colors">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center gap-3 py-7">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Camera className="h-7 w-7 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground text-base">Upload Photos</p>
                        <p className="text-xs text-muted-foreground mt-1">Click to add images ({uploadedPhotos.length}/4)</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Max 4 photos</p>
                      </div>
                    </div>
                  </label>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {uploadedPhotos.map((photo, idx) => (
                      <div key={idx} className="relative overflow-hidden rounded-lg border border-border bg-muted/40 group">
                        <img
                          src={photo}
                          alt={`Uploaded photo ${idx + 1}`}
                          className="block h-32 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute right-2 top-2 rounded-md bg-destructive/90 p-1.5 hover:bg-destructive transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                          aria-label="Remove photo"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadedPhotos.length === 0 && (
                  <div className="space-y-2.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Example Materials</p>
                    <div className="grid gap-3 grid-cols-2">
                    <div className="overflow-hidden rounded-lg border border-border bg-muted/40 p-2 shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={materialImages.cement}
                        alt="Cement bags"
                        className="block h-24 w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg border border-border bg-muted/40 p-2 shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={materialImages.rod}
                        alt="TMT steel rods"
                        className="block h-24 w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg border border-border bg-muted/40 p-2 shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={materialImages.plywood}
                        alt="Plywood sheets"
                        className="block h-24 w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg border border-border bg-muted/40 p-2 shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={materialImages.redOxide}
                        alt="Red oxide floor coat"
                        className="block h-24 w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MaterialsList;
