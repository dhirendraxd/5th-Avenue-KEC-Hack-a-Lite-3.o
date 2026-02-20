import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import BackgroundIllustrations from "@/components/layout/BackgroundIllustrations";
import AddEquipmentDialog, { AddEquipmentFormData } from "@/components/dashboard/AddEquipmentDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addFirebaseEquipment } from "@/lib/firebase/equipment";
import { getStoredBusinessProfile } from "@/lib/firebase/businessProfile";
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
      toast({
        title: "Sign in required",
        description: "Please sign in to list equipment.",
        variant: "destructive",
      });
      return;
    }

    const savedBusinessProfile = getStoredBusinessProfile(user.id);
    const ownerDisplayName =
      savedBusinessProfile?.businessName || user.businessName || user.name;

    await addFirebaseEquipment({
      ...data,
      ownerId: user.id,
      ownerName: ownerDisplayName,
      ownerEmail: user.email,
    });

    toast({
      title: "Equipment listed",
      description: "Your equipment is now saved in Firebase and visible in your dashboard.",
    });

    navigate("/dashboard");
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
