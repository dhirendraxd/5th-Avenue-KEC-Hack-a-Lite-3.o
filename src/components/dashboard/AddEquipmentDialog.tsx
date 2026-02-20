import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  categoryLabels,
  EquipmentCategory,
  EquipmentCondition,
  mockLocations,
} from "@/lib/mockData";
import {
  Plus,
  X,
  Camera,
  Info,
  MapPin,
  DollarSign,
  Shield,
  Settings,
  FileText,
  ImagePlus,
} from "lucide-react";

export interface AddEquipmentFormData {
  name: string;
  category: EquipmentCategory;
  description: string;
  pricePerDay: number;
  securityDeposit: number;
  locationId: string;
  locationName: string;
  condition: EquipmentCondition;
  features: string[];
  usageNotes: string;
  minRentalDays: number;
  bufferDays: number;
  insuranceProtected: boolean;
  cancellationPolicy: '24hours' | '48hours' | '72hours' | '1week' | 'strict';
  photos: string[];
}

interface AddEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AddEquipmentFormData) => Promise<void>;
}

const conditionOptions: { value: EquipmentCondition; label: string; description: string }[] = [
  { value: 'excellent', label: 'Excellent', description: 'Like new condition, minimal to no wear' },
  { value: 'good', label: 'Good', description: 'Normal wear, fully functional' },
  { value: 'fair', label: 'Fair', description: 'Visible wear, but works properly' },
];

const featureSuggestions: Record<EquipmentCategory, string[]> = {
  construction: ['GPS Tracking', 'Climate Control Cab', 'Quick Coupler', 'LED Work Lights', 'Backup Camera'],
  events: ['Wireless Control', 'LED Display', 'Sound System', 'Portable', 'Weather Resistant'],
  manufacturing: ['Digital Controls', 'Auto Calibration', 'Safety Guards', 'Tool Library', 'Remote Monitoring'],
  cleaning: ['Hot Water', 'High Pressure', 'Long Hose', 'Chemical Injection', 'Quiet Operation'],
  logistics: ['Side Shift', 'Fork Positioning', 'Pneumatic Tires', 'Height Indicator', 'Load Sensor'],
};

const AddEquipmentDialog = ({ open, onOpenChange, onSubmit }: AddEquipmentDialogProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentTab, setCurrentTab] = useState("basic");
  
  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<EquipmentCategory | "">("");
  const [description, setDescription] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [locationId, setLocationId] = useState("");
  const [condition, setCondition] = useState<EquipmentCondition>("good");
  const [features, setFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState("");
  const [usageNotes, setUsageNotes] = useState("");
  const [minRentalDays, setMinRentalDays] = useState("1");
  const [bufferDays, setBufferDays] = useState("0");
  const [insuranceProtected, setInsuranceProtected] = useState(true);
  const [cancellationPolicy, setCancellationPolicy] = useState("48hours");
  const [photos, setPhotos] = useState<string[]>([]);

  const handleAddFeature = (feature: string) => {
    if (!features.includes(feature)) {
      setFeatures([...features, feature]);
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFeatures(features.filter((f) => f !== feature));
  };

  const handleAddCustomFeature = () => {
    if (customFeature.trim() && !features.includes(customFeature.trim())) {
      setFeatures([...features, customFeature.trim()]);
      setCustomFeature("");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 6 - photos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos((prev) => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category || !description || !pricePerDay || !locationId) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (photos.length === 0) {
      toast({
        title: "Photos Required",
        description: "Please add at least one photo of your equipment.",
        variant: "destructive",
      });
      return;
    }

    const selectedLocation = mockLocations.find((location) => location.id === locationId);

    try {
      await onSubmit({
        name,
        category,
        description,
        pricePerDay: Number(pricePerDay),
        securityDeposit: Number(securityDeposit || 0),
        locationId,
        locationName: selectedLocation?.name || "Default Location",
        condition,
        features,
        usageNotes,
        minRentalDays: Number(minRentalDays || 1),
        bufferDays: Number(bufferDays || 0),
        insuranceProtected,
        cancellationPolicy: cancellationPolicy as AddEquipmentFormData['cancellationPolicy'],
        photos,
      });
      resetForm();
    } catch {
      toast({
        title: "Failed to list equipment",
        description: "Please try again. If the issue persists, check Firebase setup.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setDescription("");
    setPricePerDay("");
    setSecurityDeposit("");
    setLocationId("");
    setCondition("good");
    setFeatures([]);
    setUsageNotes("");
    setMinRentalDays("1");
    setBufferDays("0");
    setInsuranceProtected(true);
    setCancellationPolicy("48hours");
    setPhotos([]);
    setCurrentTab("basic");
  };

  const suggestedFeatures = category ? featureSuggestions[category] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            List New Equipment
          </DialogTitle>
          <DialogDescription>
            Provide detailed information to help renters find and understand your equipment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="px-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="basic" className="gap-1">
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">Basic</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="gap-1">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Details</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Pricing</span>
              </TabsTrigger>
              <TabsTrigger value="photos" className="gap-1">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Photos</span>
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] mt-4">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 pr-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Equipment Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., CAT 320 Excavator"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use a clear, descriptive name including brand and model
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as EquipmentCategory)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(categoryLabels) as EquipmentCategory[]).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {categoryLabels[cat]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select value={locationId} onValueChange={setLocationId}>
                      <SelectTrigger>
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockLocations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your equipment in detail: specifications, capabilities, ideal use cases..."
                    className="h-28"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Include specifications, year, hours/mileage if applicable
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Equipment Condition *</Label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {conditionOptions.map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => setCondition(opt.value)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center
                          ${condition === opt.value 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:bg-muted/50'}`}
                      >
                        <p className="font-medium text-foreground">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 pr-4">
                <div className="space-y-2">
                  <Label>Features & Capabilities</Label>
                  {suggestedFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {suggestedFeatures.map((feature) => (
                        <Badge
                          key={feature}
                          variant={features.includes(feature) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => 
                            features.includes(feature) 
                              ? handleRemoveFeature(feature) 
                              : handleAddFeature(feature)
                          }
                        >
                          {features.includes(feature) ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom feature..."
                      value={customFeature}
                      onChange={(e) => setCustomFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomFeature())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddCustomFeature}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 p-3 bg-muted/50 rounded-lg">
                      {features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="gap-1">
                          {feature}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => handleRemoveFeature(feature)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="usageNotes">Usage Notes & Requirements</Label>
                  <Textarea
                    id="usageNotes"
                    value={usageNotes}
                    onChange={(e) => setUsageNotes(e.target.value)}
                    placeholder="e.g., Operator certification required, fuel not included, training available..."
                    className="h-24"
                  />
                  <p className="text-xs text-muted-foreground">
                    Include any certifications, training, or special requirements
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minRental">Minimum Rental Days</Label>
                    <Input
                      id="minRental"
                      type="number"
                      min="1"
                      value={minRentalDays}
                      onChange={(e) => setMinRentalDays(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buffer">Buffer Days Between Rentals</Label>
                    <Input
                      id="buffer"
                      type="number"
                      min="0"
                      value={bufferDays}
                      onChange={(e) => setBufferDays(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Days needed for maintenance between rentals
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-4 pr-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Daily Rental Rate *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        min="1"
                        value={pricePerDay}
                        onChange={(e) => setPricePerDay(e.target.value)}
                        placeholder="250"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deposit">Security Deposit</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="deposit"
                        type="number"
                        min="0"
                        value={securityDeposit}
                        onChange={(e) => setSecurityDeposit(e.target.value)}
                        placeholder="1000"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Platform Fee:</strong> 10% service fee will be deducted from each rental
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Cancellation Policy</Label>
                  <Select value={cancellationPolicy} onValueChange={setCancellationPolicy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24hours">Free cancellation up to 24 hours</SelectItem>
                      <SelectItem value="48hours">Free cancellation up to 48 hours</SelectItem>
                      <SelectItem value="72hours">Free cancellation up to 72 hours</SelectItem>
                      <SelectItem value="1week">Free cancellation up to 1 week</SelectItem>
                      <SelectItem value="strict">No refunds (strict policy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <Checkbox
                    id="insurance"
                    checked={insuranceProtected}
                    onCheckedChange={(checked) => setInsuranceProtected(checked as boolean)}
                  />
                  <div>
                    <Label htmlFor="insurance" className="font-medium text-foreground cursor-pointer flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Platform Insurance Protection
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Coverage up to NPR 50,000 for equipment damage during rentals
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Photos Tab */}
              <TabsContent value="photos" className="space-y-4 pr-4">
                <div className="space-y-2">
                  <Label>Equipment Photos *</Label>
                  <p className="text-sm text-muted-foreground">
                    Add up to 6 high-quality photos showing different angles and condition
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />

                {photos.length === 0 ? (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium text-foreground">Click to upload photos</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PNG, JPG up to 10MB each • Max 6 photos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={photo}
                            alt={`Equipment photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border border-border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemovePhoto(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {index === 0 && (
                            <Badge className="absolute bottom-2 left-2">Cover</Badge>
                          )}
                        </div>
                      ))}
                      {photos.length < 6 && (
                        <div
                          className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Add more</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      First photo will be used as the cover image. Drag to reorder.
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    Photo Tips
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Include front, side, and detail shots</li>
                    <li>• Show any existing wear or damage</li>
                    <li>• Photograph accessories and attachments</li>
                    <li>• Use good lighting and clean backgrounds</li>
                  </ul>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex flex-col gap-3 border-t border-border p-6 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {photos.length === 0 && <span className="text-warning">Add at least 1 photo</span>}
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <Plus className="h-4 w-4" />
                List Equipment
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEquipmentDialog;
