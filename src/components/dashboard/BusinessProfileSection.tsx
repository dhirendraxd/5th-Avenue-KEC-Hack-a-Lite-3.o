import { useEffect, useMemo, useState } from "react";
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
import { ShieldCheck } from "lucide-react";

interface BusinessProfileSectionProps {
  userId: string;
  businessNameFallback?: string;
}

const BusinessProfileSection = ({ userId, businessNameFallback = "" }: BusinessProfileSectionProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSave = async () => {
    setIsSaving(true);
    const profile = await saveBusinessProfile(userId, formData);
    setIsSaving(false);

    toast({
      title: "Business profile saved",
      description: profile.isProfileComplete
        ? "Your profile is complete and ready for verification review by other users."
        : "Profile saved. Complete all required fields so other users can verify your business.",
    });
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
              Fill these details so renters can verify your business before booking equipment.
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
