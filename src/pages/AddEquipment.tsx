import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import BackgroundIllustrations from "@/components/layout/BackgroundIllustrations";
import AddEquipmentDialog, { AddEquipmentFormData } from "@/components/dashboard/AddEquipmentDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addFirebaseEquipment } from "@/lib/firebase/equipment";
import { uploadMultipleFiles } from "@/lib/firebase/storage";
import {
  getBusinessProfileFromFirebase,
  isBusinessKycComplete,
} from "@/lib/firebase/businessProfile";
import { ArrowLeft } from "lucide-react";

const AddEquipment = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  const handleAddEquipment = async (data: AddEquipmentFormData) => {
    if (!user) {
      throw new Error("Please sign in to list equipment.");
    }

    try {
      const savedBusinessProfile = await getBusinessProfileFromFirebase(user.id);

      if (!savedBusinessProfile || !isBusinessKycComplete(savedBusinessProfile)) {
        navigate("/dashboard");
        throw new Error(
          "Please complete and save Citizenship, NID, and document images in Firebase from Dashboard > Business Info before listing equipment."
        );
      }

      const ownerDisplayName =
        savedBusinessProfile?.businessName || user.businessName || user.name;
      const ownerLocation =
        savedBusinessProfile.city?.trim() ||
        savedBusinessProfile.businessAddress?.trim() ||
        data.locationName;

      // Upload photos to Firebase Storage if they are base64 data URLs
      let photoUrls: string[] = [];
      try {
        if (data.photos && data.photos.length > 0) {
          // convert base64 data URLs to File objects
          const files: File[] = data.photos.map((dataUrl, idx) => {
            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], `photo_${Date.now()}_${idx}.jpg`, { type: mime });
          });

          photoUrls = await uploadMultipleFiles(`equipment/${user.id}`, files);
        }
      } catch (error) {
        console.error('Failed to upload photos:', error);
        throw new Error('Failed to upload photos. Please try again.');
      }

      const created = await addFirebaseEquipment({
        ...data,
        photos: photoUrls.length > 0 ? photoUrls : data.photos,
        ownerId: user.id,
        ownerName: ownerDisplayName,
        ownerEmail: user.email,
        ownerLocation,
        ownerVerified: savedBusinessProfile.isProfileComplete,
      });

      // Optimistic: store the newly created equipment locally so the dashboard can pick it up immediately
      try {
        localStorage.setItem('gearshift_recently_added_equipment', JSON.stringify(created));
      } catch (e) {
        console.warn('Failed to write optimistic equipment to localStorage', e);
      }

      toast({
        title: "Equipment listed",
        description: "Your equipment is now saved in Firebase and visible in your dashboard.",
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
