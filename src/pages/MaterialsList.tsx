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
import { useAuth } from "@/contexts/AuthContext";
import { Camera, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { materialImages, pickRandomCondition } from "@/lib/materialsMock";
import { createFirebaseMaterial } from "@/lib/firebase/materials";
import { isCloudinaryConfigured, uploadImagesToCloudinary } from "@/lib/cloudinary";

const DEFAULT_COORDINATES = {
  latitude: 27.7172,
  longitude: 85.324,
};

const MaterialsList = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [condition, setCondition] = useState<string>(() => pickRandomCondition());
  const [price, setPrice] = useState<string>("");
  const [isFree, setIsFree] = useState(false);
  const [location, setLocation] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setCoordinates({ latitude, longitude });
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

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please upload image files only.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
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

    event.target.value = "";
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to publish material listings.",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim() || !category || !condition || !location.trim()) {
      toast({
        title: "Missing fields",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!isFree && (!price || Number(price) <= 0)) {
      toast({
        title: "Price required",
        description: "Add a valid price or mark the item as free.",
        variant: "destructive",
      });
      return;
    }

    if (uploadedPhotos.length === 0) {
      toast({
        title: "Photo required",
        description: "Please upload at least one image.",
        variant: "destructive",
      });
      return;
    }

    if (!isCloudinaryConfigured()) {
      toast({
        title: "Cloudinary not configured",
        description: "Set Cloudinary env vars to publish material images.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const [primaryImageUrl] = await uploadImagesToCloudinary(uploadedPhotos);

      await createFirebaseMaterial({
        name: name.trim(),
        category: category as "wood" | "metal" | "concrete",
        condition: condition as "sealed" | "new" | "used",
        imageUrl: primaryImageUrl,
        price: isFree ? 0 : Number(price),
        isFree,
        locationName: location.trim(),
        latitude: coordinates?.latitude ?? DEFAULT_COORDINATES.latitude,
        longitude: coordinates?.longitude ?? DEFAULT_COORDINATES.longitude,
        contactName: user.name,
        contactPhone: "+977 9800000000",
        sellerId: user.id,
      });

      toast({
        title: "Listing published",
        description: "Material and image were saved to Firebase + Cloudinary.",
      });

      setName("");
      setCategory("");
      setCondition(pickRandomCondition());
      setPrice("");
      setIsFree(false);
      setLocation("");
      setUploadedPhotos([]);
      setCoordinates(null);
    } catch (error) {
      toast({
        title: "Publish failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not publish this listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIllustrations variant="marketplace" />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative materials-shell">
        <div className="materials-ambient" aria-hidden="true" />
        <div className="relative z-10">
          <PageHeader
            title="List It"
            description="Share unused construction materials with nearby builders."
            actions={
              <Button asChild variant="outline">
                <Link to="/materials/find">Find materials</Link>
              </Button>
            }
          />

          <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Material details</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <form className="order-2 grid gap-5 lg:order-1" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Item Name</label>
                <Input
                  placeholder="Ex: Cement bags, TMT rods"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wood">Wood</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                      <SelectItem value="concrete">Concrete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Condition</label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger>
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

              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder={isFree ? "Free" : "Enter price"}
                    value={isFree ? "" : price}
                    onChange={(event) => setPrice(event.target.value)}
                    disabled={isFree}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={isFree}
                    onCheckedChange={(value) => setIsFree(Boolean(value))}
                  />
                  Free
                </label>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Location</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="Neighborhood or GPS location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseLocation}
                    disabled={isLocating}
                  >
                    {isLocating ? "Locating..." : "Use current location"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Publishing..." : "Publish listing"}
                </Button>
              </div>
              </form>

              <div className="order-1 space-y-3 lg:order-2">
                <div className="rounded-lg border-2 border-dashed border-border bg-muted/20 p-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center gap-2 py-6">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <div className="text-center">
                        <p className="font-medium text-foreground">Add photos</p>
                        <p className="text-xs text-muted-foreground">Click to upload ({uploadedPhotos.length}/4)</p>
                      </div>
                    </div>
                  </label>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-2">
                    {uploadedPhotos.map((photo, idx) => (
                      <div key={idx} className="relative overflow-hidden rounded-lg border border-border bg-muted/40">
                        <img
                          src={photo}
                          alt={`Uploaded photo ${idx + 1}`}
                          className="block max-h-28 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute right-1 top-1 rounded bg-red-500/80 p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadedPhotos.length === 0 && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="overflow-hidden rounded-lg border border-border bg-muted/40 p-2 shadow-sm fade-up">
                      <img
                        src={materialImages.cement}
                        alt="Cement bags"
                        className="block max-h-28 w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg border border-border bg-muted/40 shadow-sm fade-up">
                      <img
                        src={materialImages.rod}
                        alt="TMT steel rods"
                        className="block max-h-28 w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg border border-border bg-muted/40 shadow-sm fade-up">
                      <img
                        src={materialImages.plywood}
                        alt="Plywood sheets"
                        className="block max-h-28 w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg border border-border bg-muted/40 shadow-sm fade-up">
                      <img
                        src={materialImages.redOxide}
                        alt="Red oxide floor coat"
                        className="block max-h-28 w-full object-contain"
                        loading="lazy"
                      />
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
