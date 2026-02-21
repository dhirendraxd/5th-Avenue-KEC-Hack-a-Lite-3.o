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
import { Camera, X, Shield } from "lucide-react";
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
  const [condition, setCondition] = useState<string>("new");
  const [price, setPrice] = useState<string>("");
  const [isFree, setIsFree] = useState(false);
  const [location, setLocation] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        toast({
          title: "Location acquired ✓",
          description: "Your GPS location has been set successfully.",
        });
      },
      () => {
        toast({
          title: "Unable to get location",
          description: "Please allow GPS access or enter a location manually.",
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
      reader.onloadstart = () => {
        setIsUploading(true);
        setUploadProgress(0);
      };
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      };
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Check photo limit before adding
        if (uploadedPhotos.length < 4) {
          setUploadedPhotos([...uploadedPhotos, result]);
          setIsUploading(false);
          setUploadProgress(100);
          toast({
            title: "Photo added ✓",
            description: `${uploadedPhotos.length + 1}/4 photos uploaded.`,
          });
        } else {
          setIsUploading(false);
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
    toast({
      title: "Photo removed",
      description: `${uploadedPhotos.length - 1}/4 photos remaining.`,
    });
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

    // Build error object
    const newErrors: Record<string, string> = {};
    
    // Log current form state
    console.log("Form state on submit:", {
      name: name?.trim(),
      category,
      condition,
      price,
      isFree,
      location: location?.trim(),
      photosCount: uploadedPhotos.length,
    });
    
    // Check all required fields
    if (!name.trim()) {
      newErrors.name = "Item name is required";
    } else if (name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    
    if (!category) {
      newErrors.category = "Please select a category";
    }
    
    if (!condition) {
      newErrors.condition = "Please select a condition";
    }
    
    if (!location.trim()) {
      newErrors.location = "Location is required";
    }

    // Validate price if not free
    if (!isFree) {
      if (!price || price.trim() === "" || isNaN(Number(price)) || Number(price) < 0) {
        newErrors.price = "Please enter a valid price or mark as free";
      }
    }
    
    if (uploadedPhotos.length === 0) {
      newErrors.photos = "At least one photo is required";
    }
    
    // If there are errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      // Log errors for debugging
      console.error("Form validation errors:", newErrors);
      
      toast({
        title: "Validation errors",
        description: "Please fix the errors and try again.",
        variant: "destructive",
      });
      return;
    }

    // Start submission
    setIsSubmitting(true);
    setErrors({});
    
    // Simulate processing time for better UX
    setTimeout(() => {
      // Success confirmation
      toast({
        title: "Listing published! ✓",
        description: "Your material is now available on Builder's Bazaar.",
      });

      // Reset all form fields and photos
      setName("");
      setCategory("");
      setCondition("new");
      setPrice("");
      setIsFree(false);
      setLocation("");
      setUploadedPhotos([]);
      setIsSubmitting(false);
    }, 800);
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
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" size="default">
                  <Link to="/materials/find">🔍 Find Materials</Link>
                </Button>
                <Button asChild variant="outline" size="default" className="border-green-600 text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400">
                  <Link to="/materials/verify">
                    <Shield className="mr-2 h-4 w-4" />
                    Verify Pickup
                  </Link>
                </Button>
              </div>
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
              <div className="grid gap-2.5">
                <label className="text-sm font-semibold">
                  Item Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g., TMT Steel Rods, Cement Bags, Plywood Sheets"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (event.target.value.trim()) {
                      const newErrors = { ...errors };
                      delete newErrors.name;
                      setErrors(newErrors);
                    }
                  }}
                  className={`h-11 ${errors.name ? 'border-destructive' : ''}`}
                />
                {errors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span>⚠️</span> {errors.name}
                  </p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2.5">
                  <label className="text-sm font-semibold">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <Select value={category} onValueChange={(val) => {
                    setCategory(val);
                    if (val) {
                      const newErrors = { ...errors };
                      delete newErrors.category;
                      setErrors(newErrors);
                    }
                  }}>
                    <SelectTrigger className={`h-11 ${errors.category ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wood">🪵 Wood</SelectItem>
                      <SelectItem value="metal">🔩 Metal</SelectItem>
                      <SelectItem value="concrete">🏗️ Concrete</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span>⚠️</span> {errors.category}
                    </p>
                  )}
                </div>

                <div className="grid gap-2.5">
                  <label className="text-sm font-semibold">
                    Condition <span className="text-destructive">*</span>
                  </label>
                  <Select value={condition} onValueChange={(val) => {
                    setCondition(val);
                    if (val) {
                      const newErrors = { ...errors };
                      delete newErrors.condition;
                      setErrors(newErrors);
                    }
                  }}>
                    <SelectTrigger className={`h-11 ${errors.condition ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sealed">✨ Sealed</SelectItem>
                      <SelectItem value="new">👌 New</SelectItem>
                      <SelectItem value="used">✅ Used</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.condition && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span>⚠️</span> {errors.condition}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="grid gap-2.5">
                  <label className="text-sm font-semibold">
                    Price (NPR) {!isFree && <span className="text-destructive">*</span>}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder={isFree ? "Item is marked as free" : "Enter price in NPR"}
                    value={isFree ? "" : price}
                    onChange={(event) => {
                      setPrice(event.target.value);
                      if (event.target.value) {
                        const newErrors = { ...errors };
                        delete newErrors.price;
                        setErrors(newErrors);
                      }
                    }}
                    disabled={isFree}
                    className={`h-11 ${errors.price ? 'border-destructive' : ''}`}
                  />
                  {errors.price && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span>⚠️</span> {errors.price}
                    </p>
                  )}
                </div>
                <label className="flex items-center gap-2.5 text-sm font-medium pb-2.5">
                  <Checkbox
                    checked={isFree}
                    onCheckedChange={(value) => {
                      setIsFree(Boolean(value));
                      if (value) {
                        setPrice("");
                        const newErrors = { ...errors };
                        delete newErrors.price;
                        setErrors(newErrors);
                      }
                    }}
                  />
                  Mark as Free
                </label>
              </div>

              <div className="grid gap-2.5">
                <label className="text-sm font-semibold">
                  Location <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <Input
                    placeholder="Enter neighborhood or use GPS"
                    value={location}
                    onChange={(event) => {
                      setLocation(event.target.value);
                      if (event.target.value.trim()) {
                        const newErrors = { ...errors };
                        delete newErrors.location;
                        setErrors(newErrors);
                      }
                    }}
                    className={`h-11 ${errors.location ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseLocation}
                    disabled={isLocating}
                    className="h-11 flex-shrink-0"
                  >
                    {isLocating ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Getting location...
                      </>
                    ) : (
                      "📍 Use GPS"
                    )}
                  </Button>
                </div>
                {errors.location && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span>⚠️</span> {errors.location}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="px-8 shadow-sm group"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Publishing...
                    </>
                  ) : (
                    <>
                      🚀 Publish Listing
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </>
                  )}
                </Button>
              </div>
              </form>

              <div className="order-1 space-y-4 lg:order-2">
                <div className={`rounded-xl border-2 border-dashed bg-gradient-to-br from-muted/30 to-muted/10 p-5 transition-colors ${
                  errors.photos ? 'border-destructive' : isUploading ? 'border-primary/60' : 'border-border hover:border-primary/40'
                }`}>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={isUploading || uploadedPhotos.length >= 4}
                    />
                    <div className="flex flex-col items-center justify-center gap-3 py-7">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Camera className="h-7 w-7 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground text-base">
                          {isUploading ? "Uploading..." : "Upload Photos"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {uploadedPhotos.length >= 4 ? "Maximum reached" : "Click to add images"} ({uploadedPhotos.length}/4)
                        </p>
                        {uploadedPhotos.length < 4 && <p className="text-xs text-muted-foreground mt-0.5">Max 4 photos</p>}
                      </div>
                      {isUploading && (
                        <div className="w-full max-w-[200px]">
                          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-full transition-all duration-300 ease-out"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground text-center mt-1">
                            {Math.round(uploadProgress)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                {errors.photos && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span>⚠️</span> {errors.photos}
                  </p>
                )}

                {uploadedPhotos.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {uploadedPhotos.map((photo, idx) => (
                      <div key={idx} className="relative overflow-hidden rounded-lg border border-border bg-muted/40 group">
                        <img
                          src={photo}
                          alt={`Uploaded photo ${idx + 1}`}
                          className="block h-32 w-full object-cover"
                          loading="lazy"
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
