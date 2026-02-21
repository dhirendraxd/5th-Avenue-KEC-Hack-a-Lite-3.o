import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import BackgroundIllustrations from "@/components/layout/BackgroundIllustrations";
import AddEquipmentDialog, { AddEquipmentFormData } from "@/components/dashboard/AddEquipmentDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addFirebaseEquipment } from "@/lib/firebase/equipment";
import { isCloudinaryConfigured, uploadImagesToCloudinary } from "@/lib/cloudinary";
import {
  getBusinessProfileFromFirebase,
} from "@/lib/firebase/businessProfile";
import { ArrowLeft } from "lucide-react";

const FIRESTORE_INLINE_PHOTO_MAX_BYTES = 700_000;

const AddEquipment = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, hasAcceptedTerms } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    } else if (!hasAcceptedTerms) {
      toast({
        title: "Terms Acceptance Required",
        description: "Please accept the platform terms from the dashboard before listing equipment.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [isAuthenticated, hasAcceptedTerms, navigate, toast]);

  const withTimeout = async <T,>(promise: Promise<T>, ms: number, message: string): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), ms);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  const estimateDataUrlBytes = (dataUrl: string) => {
    const base64 = dataUrl.split(",")[1] ?? "";
    return Math.ceil((base64.length * 3) / 4);
  };

  const handleAddEquipment = async (data: AddEquipmentFormData) => {
    if (!user) {
      throw new Error("Please sign in to list equipment.");
    }

    try {
      const savedBusinessProfile = await withTimeout(
        getBusinessProfileFromFirebase(user.id),
        12000,
        "Timed out while loading business profile. Please try again."
      );

      const ownerDisplayName =
        savedBusinessProfile?.businessName || user.businessName || user.name;
      const ownerLocation =
        savedBusinessProfile.city?.trim() ||
        savedBusinessProfile.businessAddress?.trim() ||
        data.locationName;

      // Cloudinary-first photo strategy with Firestore-inline fallback
      let photoUrls: string[] = [];
      let uploadedToCloudinary = false;
      if (data.photos && data.photos.length > 0) {
        const existingRemoteUrls = data.photos.filter((photo) => /^https?:\/\//.test(photo));
        const dataUrls = data.photos.filter((photo) => photo.startsWith("data:"));

        if (dataUrls.length > 0 && isCloudinaryConfigured()) {
          try {
            const cloudinaryUrls = await withTimeout(
              uploadImagesToCloudinary(dataUrls),
              45000,
              "Timed out while uploading photos to Cloudinary. Please try again."
            );
            photoUrls = [...existingRemoteUrls, ...cloudinaryUrls];
            uploadedToCloudinary = cloudinaryUrls.length > 0;
          } catch (error) {
            console.error("Cloudinary upload failed, using Firestore fallback:", error);
            const totalInlineBytes = dataUrls.reduce((sum, photo) => sum + estimateDataUrlBytes(photo), 0);
            if (totalInlineBytes > FIRESTORE_INLINE_PHOTO_MAX_BYTES) {
              throw new Error(
                "Cloudinary upload failed and photos are too large for fallback save. Please upload fewer/smaller images."
              );
            }

            photoUrls = [...existingRemoteUrls, ...dataUrls];
            toast({
              title: "Using fallback photo storage",
              description: "Cloudinary upload failed, so photos were saved directly in Firestore.",
            });
          }
        } else {
          const totalInlineBytes = dataUrls.reduce((sum, photo) => sum + estimateDataUrlBytes(photo), 0);

          if (totalInlineBytes > FIRESTORE_INLINE_PHOTO_MAX_BYTES) {
            throw new Error(
              "Photos are too large to save without cloud image hosting. Please upload fewer/smaller images."
            );
          }

          photoUrls = [...existingRemoteUrls, ...dataUrls];

          if (dataUrls.length > 0) {
            toast({
              title: "Photos saved without cloud hosting",
              description: "Set Cloudinary env vars for public image URLs visible to all users.",
            });
          }
        }
      }

      const created = await withTimeout(
        addFirebaseEquipment({
        ...data,
        photos: photoUrls.length > 0 ? photoUrls : data.photos,
        ownerId: user.id,
        ownerName: ownerDisplayName,
        ownerEmail: user.email,
        ownerLocation,
        ownerVerified: Boolean(savedBusinessProfile?.isProfileComplete),
      }),
        15000,
        "Timed out while saving equipment. Please try again."
      );

      // Optimistic: store the newly created equipment locally so the dashboard can pick it up immediately
      try {
        localStorage.setItem('gearshift_recently_added_equipment', JSON.stringify(created));
      } catch (e) {
        console.warn('Failed to write optimistic equipment to localStorage', e);
      }

      toast({
        title: "Equipment listed",
        description: uploadedToCloudinary
          ? "Photos uploaded to Cloudinary and equipment is now visible in your dashboard."
          : "Your equipment is now saved in Firebase and visible in your dashboard.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error('Failed to list equipment:', error);
      // Clean up optimistic storage if any
      try { localStorage.removeItem('gearshift_recently_added_equipment'); } catch {}
      throw error instanceof Error
        ? error
        : new Error('Please try again. If the issue persists, check Firebase setup.');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIllustrations variant="dashboard" />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative z-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Add New Equipment</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Create a listing with details, pricing, and photos.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <AddEquipmentDialog
          standalone
          onSubmit={handleAddEquipment}
          onCancel={() => navigate("/dashboard")}
        />
      </main>
    </div>
  );
};

export default AddEquipment;
