import { useEffect, useRef, useState } from "react";
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import {
  categoryLabels,
  EquipmentCategory,
  EquipmentCondition,
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
  locationMapUrl?: string;
  condition: EquipmentCondition;
  features: string[];
  usageNotes: string;
  minRentalDays: number;
  bufferDays: number;
  insuranceProtected: boolean;
  cancellationPolicy: '24hours' | '48hours' | '72hours' | '1week' | 'strict';
  photos: string[];
  operatorAvailable?: boolean;
  operatorIncluded?: boolean;
  operatorPricePerDay?: number;
  operatorQualifications?: string;
}

interface AddEquipmentDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: AddEquipmentFormData) => Promise<void>;
  standalone?: boolean;
  onCancel?: () => void;
}

type ViewSlot = "front" | "left" | "right";

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

const kathmanduLocations = [
  'Baneshwor, Kathmandu',
  'Thamel, Kathmandu',
  'Koteshwor, Kathmandu',
  'Balaju, Kathmandu',
  'Kalanki, Kathmandu',
  'New Baneshwor, Kathmandu',
  'Tripureshwor, Kathmandu',
  'Putalisadak, Kathmandu',
  'Maharajgunj, Kathmandu',
  'Dillibazar, Kathmandu',
  'Battisputali, Kathmandu',
  'Chabahil, Kathmandu',
  'Gaushala, Kathmandu',
  'Bouddha, Kathmandu',
  'Jorpati, Kathmandu',
  'Sinamangal, Kathmandu',
  'Satdobato, Lalitpur',
  'Jawalakhel, Lalitpur',
  'Pulchowk, Lalitpur',
  'Kupondole, Lalitpur',
  'Patan Dhoka, Lalitpur',
  'Sanepa, Lalitpur',
  'Ekantakuna, Lalitpur',
  'Gwarko, Lalitpur',
  'Imadol, Lalitpur',
  'Balkumari, Lalitpur',
  'Tinkune, Kathmandu',
  'Maitidevi, Kathmandu',
  'Naxal, Kathmandu',
  'Lainchaur, Kathmandu',
  'Lazimpat, Kathmandu',
  'Kamalpokhari, Kathmandu',
  'Bhaktapur Durbar Square, Bhaktapur',
  'Suryabinayak, Bhaktapur',
  'Thimi, Bhaktapur',
  'Madhyapur, Bhaktapur',
  'Katunje, Bhaktapur',
  'Koteshwor Industrial Area, Kathmandu',
  'Kalimati, Kathmandu',
  'Soalteemode, Kathmandu',
  'Baluwatar, Kathmandu',
  'Bhatbhateni, Kathmandu',
  'Chabahil Industrial Area, Kathmandu',
];

const ADD_EQUIPMENT_DRAFT_KEY = "gearshift_add_equipment_draft";
const MAX_PHOTO_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_PHOTO_DIMENSION = 1600;
const TARGET_DATA_URL_BYTES = 170 * 1024;

const AddEquipmentDialog = ({
  open,
  onOpenChange,
  onSubmit,
  standalone = false,
  onCancel,
}: AddEquipmentDialogProps) => {
  const { toast } = useToast();
  const cloudinaryReady = isCloudinaryConfigured();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewFileInputRef = useRef<HTMLInputElement>(null);
  const [currentTab, setCurrentTab] = useState("basic");
  const [activeViewUpload, setActiveViewUpload] = useState<ViewSlot | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<EquipmentCategory | "">("");
  const [description, setDescription] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [customLocationName, setCustomLocationName] = useState("");
  const [locationMapUrl, setLocationMapUrl] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [condition, setCondition] = useState<EquipmentCondition>("good");
  const [features, setFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState("");
  const [usageNotes, setUsageNotes] = useState("");
  const [minRentalDays, setMinRentalDays] = useState("1");
  const [bufferDays, setBufferDays] = useState("0");
  const [insuranceProtected, setInsuranceProtected] = useState(true);
  const [cancellationPolicy, setCancellationPolicy] = useState("48hours");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [frontViewPhotoIndex, setFrontViewPhotoIndex] = useState<number | null>(null);
  const [leftViewPhotoIndex, setLeftViewPhotoIndex] = useState<number | null>(null);
  const [rightViewPhotoIndex, setRightViewPhotoIndex] = useState<number | null>(null);
  
  // Operator/Driver state
  const [operatorAvailable, setOperatorAvailable] = useState(false);
  const [operatorIncluded, setOperatorIncluded] = useState(false);
  const [operatorPricePerDay, setOperatorPricePerDay] = useState("");
  const [operatorQualifications, setOperatorQualifications] = useState("");

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(ADD_EQUIPMENT_DRAFT_KEY);
      if (!savedDraft) return;

      const draft = JSON.parse(savedDraft) as Partial<AddEquipmentFormData> & {
        customFeature?: string;
        photos?: string[];
        currentTab?: string;
        frontViewPhotoIndex?: number | null;
        leftViewPhotoIndex?: number | null;
        rightViewPhotoIndex?: number | null;
      };

      setName(draft.name ?? "");
      setCategory((draft.category as EquipmentCategory) ?? "");
      setDescription(draft.description ?? "");
      setPricePerDay(draft.pricePerDay ? String(draft.pricePerDay) : "");
      setSecurityDeposit(draft.securityDeposit ? String(draft.securityDeposit) : "");
      setCustomLocationName(draft.locationName ?? "");
      setLocationMapUrl(draft.locationMapUrl ?? "");
      setCondition((draft.condition as EquipmentCondition) ?? "good");
      setFeatures(Array.isArray(draft.features) ? draft.features : []);
      setCustomFeature(draft.customFeature ?? "");
      setUsageNotes(draft.usageNotes ?? "");
      setMinRentalDays(draft.minRentalDays ? String(draft.minRentalDays) : "1");
      setBufferDays(draft.bufferDays ? String(draft.bufferDays) : "0");
      setInsuranceProtected(draft.insuranceProtected ?? true);
      setCancellationPolicy(draft.cancellationPolicy ?? "48hours");
      setPhotos(Array.isArray(draft.photos) ? draft.photos : []);
      setFrontViewPhotoIndex(draft.frontViewPhotoIndex ?? null);
      setLeftViewPhotoIndex(draft.leftViewPhotoIndex ?? null);
      setRightViewPhotoIndex(draft.rightViewPhotoIndex ?? null);
      setCurrentTab(draft.currentTab ?? "basic");
      setOperatorAvailable(draft.operatorAvailable ?? false);
      setOperatorIncluded(draft.operatorIncluded ?? false);
      setOperatorPricePerDay(draft.operatorPricePerDay ? String(draft.operatorPricePerDay) : "");
      setOperatorQualifications(draft.operatorQualifications ?? "");
    } catch (error) {
      console.warn("Failed to load add-equipment draft", error);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const draft = {
          name,
          category,
          description,
          pricePerDay: pricePerDay ? Number(pricePerDay) : undefined,
          securityDeposit: securityDeposit ? Number(securityDeposit) : undefined,
          locationName: customLocationName,
          locationMapUrl,
          condition,
          features,
          customFeature,
          usageNotes,
          minRentalDays: minRentalDays ? Number(minRentalDays) : undefined,
          bufferDays: bufferDays ? Number(bufferDays) : undefined,
          insuranceProtected,
          cancellationPolicy,
          photos,
          frontViewPhotoIndex,
          leftViewPhotoIndex,
          rightViewPhotoIndex,
          currentTab,
          operatorAvailable,
          operatorIncluded,
          operatorPricePerDay: operatorPricePerDay ? Number(operatorPricePerDay) : undefined,
          operatorQualifications,
        };
        localStorage.setItem(ADD_EQUIPMENT_DRAFT_KEY, JSON.stringify(draft));
      } catch (error) {
        console.warn("Failed to save add-equipment draft", error);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [
    name,
    category,
    description,
    pricePerDay,
    securityDeposit,
    customLocationName,
    locationMapUrl,
    condition,
    features,
    customFeature,
    usageNotes,
    minRentalDays,
    bufferDays,
    insuranceProtected,
    cancellationPolicy,
    photos,
    frontViewPhotoIndex,
    leftViewPhotoIndex,
    rightViewPhotoIndex,
    currentTab,
    operatorAvailable,
    operatorIncluded,
    operatorPricePerDay,
    operatorQualifications,
  ]);

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

  // Filter locations based on user input
  const filteredLocations = customLocationName.trim()
    ? kathmanduLocations.filter(location =>
        location.toLowerCase().includes(customLocationName.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleLocationSelect = (location: string) => {
    setCustomLocationName(location);
    setShowLocationSuggestions(false);
  };

  const handleLocationChange = (value: string) => {
    setCustomLocationName(value);
    setShowLocationSuggestions(value.trim().length > 0);
  };

  const isValidPhotoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: `"${file.name}" is not an image file.`,
        variant: "destructive",
      });
      return false;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      toast({
        title: "Image too large",
        description: `"${file.name}" exceeds 8MB. Please upload a smaller image.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const estimateDataUrlBytes = (dataUrl: string) => {
    const base64 = dataUrl.split(",")[1] ?? "";
    return Math.ceil((base64.length * 3) / 4);
  };

  const compressImageFile = async (file: File): Promise<string> => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const imageElement = new Image();
      const objectUrl = URL.createObjectURL(file);

      imageElement.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(imageElement);
      };

      imageElement.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to read image file."));
      };

      imageElement.src = objectUrl;
    });

    const maxSourceDimension = Math.max(image.width, image.height);
    const scale = maxSourceDimension > MAX_PHOTO_DIMENSION
      ? MAX_PHOTO_DIMENSION / maxSourceDimension
      : 1;

    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to process image.");
    }

    context.drawImage(image, 0, 0, width, height);

    let quality = 0.82;
    let result = canvas.toDataURL("image/jpeg", quality);
    while (estimateDataUrlBytes(result) > TARGET_DATA_URL_BYTES && quality > 0.45) {
      quality -= 0.1;
      result = canvas.toDataURL("image/jpeg", quality);
    }

    return result;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 6 - photos.length;
    const filesToProcess = Array.from(files)
      .slice(0, remainingSlots)
      .filter(isValidPhotoFile);

    const processFiles = async () => {
      const converted: string[] = [];
      for (const file of filesToProcess) {
        try {
          converted.push(await compressImageFile(file));
        } catch (error) {
            toast({
              title: "Failed to process image",
              description: error instanceof Error ? error.message : `Could not process "${file.name}".`,
              variant: "destructive",
            });
        }
      }

      if (converted.length > 0) {
        setPhotos((prev) => [...prev, ...converted]);
      }
    };

    void processFiles();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const setViewIndex = (view: ViewSlot, index: number | null) => {
    if (view === "front") {
      setFrontViewPhotoIndex(index);
      return;
    }

    if (view === "left") {
      setLeftViewPhotoIndex(index);
      return;
    }

    setRightViewPhotoIndex(index);
  };

  const getViewIndex = (view: ViewSlot): number | null => {
    if (view === "front") return frontViewPhotoIndex;
    if (view === "left") return leftViewPhotoIndex;
    return rightViewPhotoIndex;
  };

  const triggerViewUpload = (view: ViewSlot) => {
    setActiveViewUpload(view);
    viewFileInputRef.current?.click();
  };

  const handleViewPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetView = activeViewUpload;
    if (!file || !targetView) {
      return;
    }

    if (!isValidPhotoFile(file)) {
      if (viewFileInputRef.current) {
        viewFileInputRef.current.value = "";
      }
      setActiveViewUpload(null);
      return;
    }

    const existingViewIndex = getViewIndex(targetView);
    if (existingViewIndex === null && photos.length >= 6) {
      toast({
        title: "Photo limit reached",
        description: "Remove one photo first, then upload a new image for this view.",
        variant: "destructive",
      });
      if (viewFileInputRef.current) {
        viewFileInputRef.current.value = "";
      }
      setActiveViewUpload(null);
      return;
    }

    const processViewPhoto = async () => {
      try {
        const result = await compressImageFile(file);

        if (existingViewIndex !== null) {
          setPhotos((previousPhotos) => {
            const updatedPhotos = [...previousPhotos];
            updatedPhotos[existingViewIndex] = result;
            return updatedPhotos;
          });
        } else {
          const newIndex = photos.length;
          setPhotos((previousPhotos) => [...previousPhotos, result]);
          setViewIndex(targetView, newIndex);
        }
      } catch (error) {
        toast({
          title: "Failed to process image",
          description: error instanceof Error ? error.message : "Please try another image.",
          variant: "destructive",
        });
      }
    };

    void processViewPhoto();

    if (viewFileInputRef.current) {
      viewFileInputRef.current.value = "";
    }
    setActiveViewUpload(null);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));

    setFrontViewPhotoIndex((previous) => {
      if (previous === null) return null;
      if (previous === index) return null;
      return previous > index ? previous - 1 : previous;
    });

    setLeftViewPhotoIndex((previous) => {
      if (previous === null) return null;
      if (previous === index) return null;
      return previous > index ? previous - 1 : previous;
    });

    setRightViewPhotoIndex((previous) => {
      if (previous === null) return null;
      if (previous === index) return null;
      return previous > index ? previous - 1 : previous;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const missing: string[] = [];

    if (!name?.trim()) missing.push('Equipment Name');
    if (!category) missing.push('Category');
    if (!customLocationName?.trim()) missing.push('Location');
    if (!description?.trim()) missing.push('Description');
    if (!pricePerDay?.trim()) missing.push('Daily Rental Rate');
    if (features.length === 0) missing.push('Features');
    if (!usageNotes?.trim()) missing.push('Usage Notes');
    if (photos.length === 0) missing.push('Photos');
    if (operatorAvailable && !operatorIncluded && !operatorPricePerDay?.trim()) {
      missing.push('Operator Daily Rate');
    }

    if (missing.length > 0) {
      // Choose a tab to focus based on the first missing field
      const first = missing[0];
      if (['Equipment Name', 'Category', 'Location', 'Description'].includes(first)) {
        setCurrentTab('basic');
      } else if (['Features', 'Usage Notes'].includes(first)) {
        setCurrentTab('details');
      } else if (['Daily Rental Rate'].includes(first)) {
        setCurrentTab('pricing');
      } else if (['Photos'].includes(first)) {
        setCurrentTab('photos');
      }

      toast({
        title: 'Missing Required Fields',
        description: `Please provide: ${missing.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    const finalLocationId = `loc-${Date.now()}`;
    const finalLocationName = customLocationName.trim();

    try {
      setIsSubmitting(true);
      await onSubmit({
        name,
        category,
        description,
        pricePerDay: Number(pricePerDay),
        securityDeposit: Number(securityDeposit || 0),
        locationId: finalLocationId,
        locationName: finalLocationName || "Custom Location",
        locationMapUrl: locationMapUrl.trim(),
        condition,
        features,
        usageNotes,
        minRentalDays: Number(minRentalDays || 1),
        bufferDays: Number(bufferDays || 0),
        insuranceProtected,
        cancellationPolicy: cancellationPolicy as AddEquipmentFormData['cancellationPolicy'],
        photos,
        operatorAvailable,
        operatorIncluded,
        operatorPricePerDay: operatorPricePerDay ? Number(operatorPricePerDay) : undefined,
        operatorQualifications: operatorQualifications.trim() || undefined,
      });
      resetForm();
    } catch (error) {
      toast({
        title: "Failed to list equipment",
        description:
          error instanceof Error && error.message
            ? error.message
            : "Please try again. If the issue persists, check Firebase setup.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(ADD_EQUIPMENT_DRAFT_KEY);
    } catch (error) {
      console.warn("Failed to clear add-equipment draft", error);
    }
  };

  const resetForm = () => {
    clearDraft();
    setName("");
    setCategory("");
    setDescription("");
    setPricePerDay("");
    setSecurityDeposit("");
    setCustomLocationName("");
    setLocationMapUrl("");
    setCondition("good");
    setFeatures([]);
    setCustomFeature("");
    setUsageNotes("");
    setMinRentalDays("1");
    setBufferDays("0");
    setInsuranceProtected(true);
    setCancellationPolicy("48hours");
    setPhotos([]);
    setFrontViewPhotoIndex(null);
    setLeftViewPhotoIndex(null);
    setRightViewPhotoIndex(null);
    setCurrentTab("basic");
    setActiveViewUpload(null);
    setOperatorAvailable(false);
    setOperatorIncluded(false);
    setOperatorPricePerDay("");
    setOperatorQualifications("");
  };

  const suggestedFeatures = category ? featureSuggestions[category] : [];
  const standaloneSteps = ["basic", "details", "pricing", "photos"] as const;
  const standaloneStepIndex = standaloneSteps.indexOf(
    currentTab as (typeof standaloneSteps)[number]
  );
  const isStandaloneLastStep = currentTab === "photos";

  const getStepMissing = (step: (typeof standaloneSteps)[number]) => {
    const missing: string[] = [];
    if (step === "basic") {
      if (!name?.trim()) missing.push("Equipment Name");
      if (!category) missing.push("Category");
      if (!customLocationName?.trim()) missing.push("Location");
      if (!description?.trim()) missing.push("Description");
    }
    if (step === "details") {
      if (features.length === 0) missing.push("Features");
      if (!usageNotes?.trim()) missing.push("Usage Notes");
    }
    if (step === "pricing") {
      if (!pricePerDay?.trim()) missing.push("Daily Rental Rate");
    }
    if (step === "photos") {
      if (photos.length === 0) missing.push("Photos");
    }
    return missing;
  };

  const canProceedFromStep = (step: (typeof standaloneSteps)[number]) => {
    const missing = getStepMissing(step);
    if (missing.length === 0) return true;

    toast({
      title: "Complete this section",
      description: `Please provide: ${missing.join(", ")}`,
      variant: "destructive",
    });
    return false;
  };

  const handleNextStep = () => {
    const step = currentTab as (typeof standaloneSteps)[number];
    if (!canProceedFromStep(step)) return;
    setCurrentTab(standaloneSteps[standaloneStepIndex + 1]);
  };

  const handleTabChange = (nextTab: string) => {
    const currentIndex = standaloneSteps.indexOf(
      currentTab as (typeof standaloneSteps)[number]
    );
    const nextIndex = standaloneSteps.indexOf(
      nextTab as (typeof standaloneSteps)[number]
    );

    if (nextIndex <= currentIndex) {
      setCurrentTab(nextTab);
      return;
    }

    if (canProceedFromStep(currentTab as (typeof standaloneSteps)[number])) {
      setCurrentTab(nextTab);
    }
  };

  const handleCancel = () => {
    if (standalone) {
      onCancel?.();
      return;
    }
    onOpenChange?.(false);
  };

  const formContent = (
    <>
      <div className="p-6 pb-0">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Plus className="h-5 w-5 text-primary" />
          List New Equipment
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Provide detailed information to help renters find and understand your equipment
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Tabs value={currentTab} onValueChange={handleTabChange} className="px-6">
          <TabsList className={`grid w-full grid-cols-2 sm:grid-cols-4`}>
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

          <ScrollArea className={standalone ? "mt-4" : "h-[400px] mt-4"}>
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 pr-4">
              <div className="space-y-2">
                <Label htmlFor="name">Equipment Name <span className="text-destructive ml-1">*</span></Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., CAT 320 Excavator"
                  required
                  aria-required="true"
                />
                <p className="text-xs text-muted-foreground">
                  Use a clear, descriptive name including brand and model
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-destructive ml-1">*</span></Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as EquipmentCategory)} aria-required="true">
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
                  <Label htmlFor="location">Location <span className="text-destructive ml-1">*</span></Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                      <Input
                        value={customLocationName}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        onFocus={() => customLocationName.trim() && setShowLocationSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                        placeholder="Enter place name (e.g. Baneshwor, Kathmandu)"
                        className="pl-9"
                        aria-required="true"
                      />
                      {showLocationSuggestions && filteredLocations.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredLocations.map((location, index) => (
                            <div
                              key={index}
                              onClick={() => handleLocationSelect(location)}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors flex items-center gap-2"
                            >
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{location}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Input
                      value={locationMapUrl}
                      onChange={(e) => setLocationMapUrl(e.target.value)}
                      placeholder="Paste Google Maps location link (optional)"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-destructive ml-1">*</span></Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your equipment in detail: specifications, capabilities, ideal use cases..."
                  className="h-28"
                  required
                  aria-required="true"
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
                <Label>Features & Capabilities <span className="text-destructive ml-1">*</span></Label>
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
                    aria-required={features.length === 0}
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
                <Label htmlFor="usageNotes">Usage Notes & Requirements <span className="text-destructive ml-1">*</span></Label>
                <Textarea
                  id="usageNotes"
                  value={usageNotes}
                  onChange={(e) => setUsageNotes(e.target.value)}
                  placeholder="e.g., Operator certification required, fuel not included, training available..."
                  className="h-24"
                  aria-required="true"
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
                  <Label htmlFor="price">Daily Rental Rate <span className="text-destructive ml-1">*</span></Label>
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
                      aria-required="true"
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

              <Separator />

              {/* Operator/Driver Options */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Operator/Driver Availability</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Offer an experienced operator with this equipment
                  </p>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
                  <Checkbox
                    id="operatorAvailable"
                    checked={operatorAvailable}
                    onCheckedChange={(checked) => {
                      setOperatorAvailable(checked as boolean);
                      if (!checked) {
                        setOperatorIncluded(false);
                        setOperatorPricePerDay("");
                        setOperatorQualifications("");
                      }
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor="operatorAvailable" className="font-medium text-foreground cursor-pointer">
                      Operator/Driver Available
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      I can provide a trained operator with this equipment
                    </p>
                  </div>
                </div>

                {operatorAvailable && (
                  <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-border">
                      <Checkbox
                        id="operatorIncluded"
                        checked={operatorIncluded}
                        onCheckedChange={(checked) => {
                          setOperatorIncluded(checked as boolean);
                          if (checked) {
                            setOperatorPricePerDay("");
                          }
                        }}
                      />
                      <div className="flex-1">
                        <Label htmlFor="operatorIncluded" className="font-medium text-foreground cursor-pointer">
                          Operator Included in Base Price
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Operator cost is already included in the daily rental rate
                        </p>
                      </div>
                    </div>

                    {!operatorIncluded && (
                      <div className="space-y-2">
                        <Label htmlFor="operatorPrice">Operator Daily Rate <span className="text-destructive ml-1">*</span></Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="operatorPrice"
                            type="number"
                            min="1"
                            value={operatorPricePerDay}
                            onChange={(e) => setOperatorPricePerDay(e.target.value)}
                            placeholder="150"
                            className="pl-9"
                            required={operatorAvailable && !operatorIncluded}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Additional cost per day for operator service
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="operatorQualifications">Operator Qualifications (Optional)</Label>
                      <Textarea
                        id="operatorQualifications"
                        value={operatorQualifications}
                        onChange={(e) => setOperatorQualifications(e.target.value)}
                        placeholder="e.g., 10+ years experience, Heavy Equipment License, Safety certified..."
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        Operator's certifications, experience, and qualifications
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos" className="space-y-4 pr-4">
              <div className="space-y-2">
                <Label>Equipment Photos <span className="text-destructive ml-1">*</span></Label>
                <div className="flex items-center gap-2">
                  <Badge variant={cloudinaryReady ? "default" : "outline"}>
                    {cloudinaryReady ? "Cloudinary upload enabled" : "Cloudinary not configured"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add up to 6 high-quality photos showing different angles and condition
                </p>
                <p className="text-xs text-muted-foreground">
                  Images are automatically compressed for compatibility.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Front View", index: frontViewPhotoIndex, key: "front" as ViewSlot },
                    { label: "Left View", index: leftViewPhotoIndex, key: "left" as ViewSlot },
                    { label: "Right View", index: rightViewPhotoIndex, key: "right" as ViewSlot },
                  ].map((slot) => (
                    <button
                      key={slot.label}
                      type="button"
                      onClick={() => triggerViewUpload(slot.key)}
                      className="w-full rounded-lg border border-border bg-muted/40 p-2 text-left transition-colors hover:bg-muted/60"
                    >
                      <p className="mb-2 text-xs font-medium text-foreground">{slot.label}</p>
                      <div className="aspect-[4/3] overflow-hidden rounded-md border border-border bg-background">
                        {slot.index !== null && photos[slot.index] ? (
                          <img
                            src={photos[slot.index]}
                            alt={slot.label}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">
                            Click to upload
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
                aria-required={photos.length === 0}
              />

              <input
                ref={viewFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleViewPhotoUpload}
              />

              {photos.length === 0 ? (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium text-foreground">Click to upload photos</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PNG, JPG up to 8MB each • Max 6 photos
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
                          <div className="absolute left-2 top-2 flex gap-1">
                            <Button
                              type="button"
                              variant={frontViewPhotoIndex === index ? "default" : "secondary"}
                              className="h-6 px-2 text-[10px]"
                              onClick={() => setFrontViewPhotoIndex(index)}
                            >
                              Front
                            </Button>
                            <Button
                              type="button"
                              variant={leftViewPhotoIndex === index ? "default" : "secondary"}
                              className="h-6 px-2 text-[10px]"
                              onClick={() => setLeftViewPhotoIndex(index)}
                            >
                              Left
                            </Button>
                            <Button
                              type="button"
                              variant={rightViewPhotoIndex === index ? "default" : "secondary"}
                              className="h-6 px-2 text-[10px]"
                              onClick={() => setRightViewPhotoIndex(index)}
                            >
                              Right
                            </Button>
                          </div>
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
                          {frontViewPhotoIndex === index && (
                            <Badge variant="secondary" className="absolute bottom-2 right-2">Front View</Badge>
                          )}
                          {leftViewPhotoIndex === index && (
                            <Badge variant="secondary" className="absolute bottom-9 right-2">Left View</Badge>
                          )}
                          {rightViewPhotoIndex === index && (
                            <Badge variant="secondary" className="absolute bottom-[4rem] right-2">Right View</Badge>
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
          {standalone ? (
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              {standaloneStepIndex > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentTab(standaloneSteps[standaloneStepIndex - 1])}
                >
                  Back
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}

              {!isStandaloneLastStep ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" className="gap-2" disabled={isSubmitting}>
                  <Plus className="h-4 w-4" />
                  {isSubmitting ? "Listing..." : "List Equipment"}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2" disabled={isSubmitting}>
                <Plus className="h-4 w-4" />
                {isSubmitting ? "Listing..." : "List Equipment"}
              </Button>
            </div>
          )}
        </div>
      </form>
    </>
  );

  return (
    standalone ? (
      <>{formContent}</>
    ) : (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl p-0">
          {formContent}
        </DialogContent>
      </Dialog>
    )
  );
};

export default AddEquipmentDialog;
