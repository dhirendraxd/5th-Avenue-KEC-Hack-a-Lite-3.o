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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

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

    toast({
      title: "Listing saved",
      description: "This is a prototype. Your item is not yet published.",
    });

    setName("");
    setCategory("");
    setCondition(pickRandomCondition());
    setPrice("");
    setIsFree(false);
    setLocation("");
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIllustrations variant="marketplace" />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative z-10">
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
          <CardContent>
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <div className="overflow-hidden rounded-lg border border-border">
                <img
                  src={materialImages.cement}
                  alt="Cement bags"
                  className="h-32 w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="overflow-hidden rounded-lg border border-border">
                <img
                  src={materialImages.rod}
                  alt="TMT steel rods"
                  className="h-32 w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="overflow-hidden rounded-lg border border-border">
                <img
                  src={materialImages.plywood}
                  alt="Plywood sheets"
                  className="h-32 w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="overflow-hidden rounded-lg border border-border">
                <img
                  src={materialImages.redOxide}
                  alt="Red oxide floor coat"
                  className="h-32 w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <form className="grid gap-5" onSubmit={handleSubmit}>
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
                <Button type="submit">Publish listing</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default MaterialsList;
