import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  BusinessProfileInput,
  getBusinessProfile,
  getCompletedFieldsCount,
  getDefaultBusinessProfileInput,
  getRequiredFieldsCount,
  isBusinessProfileReadyForVerification,
  saveBusinessProfile,
} from "@/lib/firebase/businessProfile";
import { ImagePlus, ShieldCheck, Trash2 } from "lucide-react";

interface BusinessProfileSectionProps {
  userId: string;
  businessNameFallback?: string;
}

const buildBitmojiOption = (emoji: string, bg: string, hair: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 128"><rect width="96" height="128" rx="18" fill="${bg}"/><ellipse cx="48" cy="36" rx="18" ry="16" fill="#f6c9a5"/><path d="M30 36c0-12 8-20 18-20s18 8 18 20v6H30z" fill="${hair}"/><rect x="33" y="54" width="30" height="42" rx="10" fill="#ffffff"/><rect x="39" y="96" width="8" height="16" rx="3" fill="#f6c9a5"/><rect x="49" y="96" width="8" height="16" rx="3" fill="#f6c9a5"/><text x="48" y="86" text-anchor="middle" font-size="20">${emoji}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const DEFAULT_BITMOJI_OPTIONS = [
  buildBitmojiOption("👋", "#f8f4ff", "#2f1b12"),
  buildBitmojiOption("✨", "#eef8ff", "#4a2c1d"),
  buildBitmojiOption("😎", "#fff3e8", "#1f1f1f"),
  buildBitmojiOption("🎉", "#f0fff5", "#3a2a20"),
  buildBitmojiOption("✅", "#f5f7ff", "#31201a"),
  buildBitmojiOption("🚀", "#fff7fb", "#2a1d17"),
];

const BusinessProfileSection = ({ userId, businessNameFallback = "" }: BusinessProfileSectionProps) => {
  const { toast } = useToast();
  const citizenshipImageInputRef = useRef<HTMLInputElement>(null);
  const nidImageInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [bitmojiSaveState, setBitmojiSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [formData, setFormData] = useState<BusinessProfileInput>(
    getDefaultBusinessProfileInput(businessNameFallback),
  );

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      const profile = await getBusinessProfile(userId);

      if (!isMounted) return;

      if (profile) {
        const {
          businessName,
          legalBusinessName,
          bitmojiUrl,
          citizenshipNumber,
          citizenshipDocumentImage,
          nidNumber,
          nidDocumentImage,
          registrationNumber,
          panNumber,
          contactPhone,
          businessAddress,
          city,
          website,
          verificationDocumentUrl,
          aboutBusiness,
        } = profile;

        setFormData({
          businessName,
          legalBusinessName,
          bitmojiUrl: bitmojiUrl ?? "",
          citizenshipNumber,
          citizenshipDocumentImage,
          nidNumber,
          nidDocumentImage,
          registrationNumber,
          panNumber,
          contactPhone,
          businessAddress,
          city,
          website,
          verificationDocumentUrl,
          aboutBusiness,
        });
      } else {
        setFormData(getDefaultBusinessProfileInput(businessNameFallback));
      }

      setIsLoading(false);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [businessNameFallback, userId]);

  const completedFields = useMemo(() => getCompletedFieldsCount(formData), [formData]);
  const requiredFields = getRequiredFieldsCount();
  const isReady = isBusinessProfileReadyForVerification(formData);

  const handleChange = (key: keyof BusinessProfileInput, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDocumentUpload = (
    key: "citizenshipDocumentImage" | "nidDocumentImage",
    file: File,
  ) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;
      setFormData((prev) => ({ ...prev, [key]: result }));
    };
    reader.readAsDataURL(file);
  };

  const onDocumentInputChange = (
    key: "citizenshipDocumentImage" | "nidDocumentImage",
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleDocumentUpload(key, file);
    event.target.value = "";
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const profile = await saveBusinessProfile(userId, formData);

      toast({
        title: "Business profile saved",
        description: profile.isProfileComplete
          ? "Your profile is complete and saved in Firebase for verification review."
          : "Profile saved in Firebase. Complete all required fields so other users can verify your business.",
      });
    } catch (error) {
      console.error("Failed to save business profile in Firebase:", error);
      toast({
        title: "Save failed",
        description: "Could not store KYC data in Firebase. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBitmojiSelect = async (bitmojiUrl: string) => {
    const nextFormData = { ...formData, bitmojiUrl };
    setFormData(nextFormData);
    setBitmojiSaveState("saving");

    try {
      await saveBusinessProfile(userId, nextFormData);
      setBitmojiSaveState("saved");
      toast({
        title: "Done",
        description: "Bitmoji selection saved.",
      });
    } catch (error) {
      console.error("Failed to auto-save Bitmoji selection:", error);
      setBitmojiSaveState("error");
      toast({
        title: "Bitmoji save failed",
        description: "Could not save selected Bitmoji. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 text-sm text-muted-foreground">Loading business profile...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Business Information
            </CardTitle>
            <CardDescription>
              Complete KYC details (National ID) to become a trusted user and allow listing/renting.
            </CardDescription>
          </div>
          <Badge variant={isReady ? "success" : "warning"}>
            {isReady ? "Ready for verification" : `${completedFields}/${requiredFields} required fields`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Name *</label>
            <Input
              value={formData.businessName}
              onChange={(e) => handleChange("businessName", e.target.value)}
              placeholder="e.g. Himalayan Heavy Rentals"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Legal Business Name *</label>
            <Input
              value={formData.legalBusinessName}
              onChange={(e) => handleChange("legalBusinessName", e.target.value)}
              placeholder="Registered legal entity name"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Profile Bitmoji (optional)</label>
            <div className="overflow-hidden rounded-lg border border-border bg-muted/40 p-3">
              <div className="flex flex-col gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
                  {formData.bitmojiUrl ? (
                    <img
                      src={formData.bitmojiUrl}
                      alt="Selected bitmoji"
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {DEFAULT_BITMOJI_OPTIONS.map((optionUrl) => {
                    const isSelected = formData.bitmojiUrl === optionUrl;
                    return (
                      <button
                        key={optionUrl}
                        type="button"
                        onClick={() => handleBitmojiSelect(optionUrl)}
                        disabled={bitmojiSaveState === "saving"}
                        className={`flex h-14 w-12 items-center justify-center overflow-hidden rounded-lg border bg-background transition-all ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                        aria-label="Select Bitmoji"
                      >
                        <img
                          src={optionUrl}
                          alt="Bitmoji option"
                          className="h-full w-full object-contain"
                          loading="eager"
                          decoding="async"
                        />
                      </button>
                    );
                  })}
                </div>
                {formData.bitmojiUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-fit"
                    onClick={() => handleBitmojiSelect("")}
                    disabled={bitmojiSaveState === "saving"}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear selection
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  {bitmojiSaveState === "saving"
                    ? "Saving Bitmoji..."
                    : bitmojiSaveState === "saved"
                      ? "Done"
                      : bitmojiSaveState === "error"
                        ? "Save failed"
                        : "Selecting a Bitmoji auto-saves instantly."}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Citizenship Number (Optional)</label>
            <Input
              value={formData.citizenshipNumber}
              onChange={(e) => handleChange("citizenshipNumber", e.target.value)}
              placeholder="Citizen certificate number"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">National ID (NID) Number *</label>
            <Input
              value={formData.nidNumber}
              onChange={(e) => handleChange("nidNumber", e.target.value)}
              placeholder="National ID number"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Citizenship Image (Optional)</label>
            <input
              ref={citizenshipImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => onDocumentInputChange("citizenshipDocumentImage", event)}
            />
            <div className="overflow-hidden rounded-lg border border-border bg-muted/40">
              <button
                type="button"
                onClick={() => citizenshipImageInputRef.current?.click()}
                className="flex h-36 w-full items-center justify-center bg-background text-sm text-muted-foreground transition-colors hover:bg-muted/50"
              >
                {formData.citizenshipDocumentImage ? (
                  <img
                      src={formData.citizenshipDocumentImage}
                      alt="Citizenship document"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                ) : (
                  <span className="flex items-center gap-2">
                    <ImagePlus className="h-4 w-4" />
                    Upload citizenship image
                  </span>
                )}
              </button>
            </div>
            {formData.citizenshipDocumentImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1"
                onClick={() => handleChange("citizenshipDocumentImage", "")}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove image
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">NID Image *</label>
            <input
              ref={nidImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => onDocumentInputChange("nidDocumentImage", event)}
            />
            <div className="overflow-hidden rounded-lg border border-border bg-muted/40">
              <button
                type="button"
                onClick={() => nidImageInputRef.current?.click()}
                className="flex h-36 w-full items-center justify-center bg-background text-sm text-muted-foreground transition-colors hover:bg-muted/50"
              >
                {formData.nidDocumentImage ? (
                  <img
                    src={formData.nidDocumentImage}
                    alt="NID document"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex items-center gap-2">
                    <ImagePlus className="h-4 w-4" />
                    Upload NID image
                  </span>
                )}
              </button>
            </div>
            {formData.nidDocumentImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1"
                onClick={() => handleChange("nidDocumentImage", "")}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove image
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Registration Number *</label>
            <Input
              value={formData.registrationNumber}
              onChange={(e) => handleChange("registrationNumber", e.target.value)}
              placeholder="Company registration number"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">PAN/VAT Number *</label>
            <Input
              value={formData.panNumber}
              onChange={(e) => handleChange("panNumber", e.target.value)}
              placeholder="PAN or VAT identifier"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contact Phone *</label>
            <Input
              value={formData.contactPhone}
              onChange={(e) => handleChange("contactPhone", e.target.value)}
              placeholder="+977..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">City *</label>
            <Input
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Kathmandu"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Business Address *</label>
            <Input
              value={formData.businessAddress}
              onChange={(e) => handleChange("businessAddress", e.target.value)}
              placeholder="Street, area, city"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Website (optional)</label>
            <Input
              value={formData.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Verification Document URL (optional)</label>
            <Input
              value={formData.verificationDocumentUrl}
              onChange={(e) => handleChange("verificationDocumentUrl", e.target.value)}
              placeholder="Link to registration proof"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">About Your Business (optional)</label>
            <Textarea
              value={formData.aboutBusiness}
              onChange={(e) => handleChange("aboutBusiness", e.target.value)}
              placeholder="Short description of your business and service quality practices"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Business Info"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessProfileSection;
