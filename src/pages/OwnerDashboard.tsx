import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import BackgroundIllustrations from "@/components/layout/BackgroundIllustrations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusIndicator } from "@/components/ui/status-indicator";
import RentalTimeline from "@/components/dashboard/RentalTimeline";
import RenterProfileCard from "@/components/dashboard/RenterProfileCard";
import AvailabilityControls from "@/components/dashboard/AvailabilityControls";
import ApproveWithConditionsDialog from "@/components/dashboard/ApproveWithConditionsDialog";
import BusinessProfileSection from "@/components/dashboard/BusinessProfileSection";
import TermsAgreementDialog from "@/components/dashboard/TermsAgreementDialog";
import EarningsChart from "@/components/finance/EarningsChart";
import TransactionHistory from "@/components/finance/TransactionHistory";
import PayoutSummary from "@/components/finance/PayoutSummary";
import UsageAnalytics from "@/components/analytics/UsageAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeFirebaseEquipment } from "@/lib/firebase/equipment";
import {
  completeFirebaseRentalPayment,
  subscribeFirebaseRentals,
  updateFirebaseRentalStatus,
} from "@/lib/firebase/rentals";
import { subscribeDocuments, updateDocument } from "@/lib/firebase/firestore";
import { where, orderBy } from "firebase/firestore";
import { subscribeBusinessProfile } from "@/lib/firebase/businessProfile";
import {
  subscribeFirebaseMaterials,
  updateFirebaseMaterial,
} from "@/lib/firebase/materials";
import {
  completeFirebaseMaterialRequestPayment,
  MaterialRequest,
  subscribeFirebaseMaterialRequests,
  updateFirebaseMaterialRequestStatus,
} from "@/lib/firebase/materialRequests";
import { RentalRequest, Equipment } from "@/lib/mockData";
import {
  MaterialListing,
  materialCategoryLabels,
  materialConditionLabels,
} from "@/lib/materialsMock";
import { categoryLabels, statusColors } from "@/lib/constants";
import {
  Plus,
  Package,
  Clock,
  CheckCircle,
  Calendar,
  DollarSign,
  CalendarRange,
  Settings2,
  Eye,
  CalendarPlus,
  AlertTriangle,
  Inbox,
  LogOut,
  ListChecks,
  ClipboardCheck,
  TrendingUp,
  Building2,
  Hammer,
  MapPin,
  Pencil,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
} from "lucide-react";
import { format, isToday, isTomorrow, differenceInDays, startOfMonth, subMonths } from "date-fns";

interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  read?: boolean;
  createdAt: string;
}

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, hasAcceptedTerms, acceptTerms } = useAuth();
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [myRentalRequests, setMyRentalRequests] = useState<RentalRequest[]>([]);
  const [activeTab, setActiveTab] = useState("timeline");
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    request: RentalRequest | null;
  }>({ open: false, request: null });
  const [businessProfile, setBusinessProfile] = useState<{ isProfileComplete: boolean } | null>(null);

  const [myEquipment, setMyEquipment] = useState<Equipment[]>([]);
  const [myMaterials, setMyMaterials] = useState<MaterialListing[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [myMaterialRequests, setMyMaterialRequests] = useState<MaterialRequest[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [materialEditor, setMaterialEditor] = useState<{
    open: boolean;
    material: MaterialListing | null;
  }>({ open: false, material: null });
  const [materialDraft, setMaterialDraft] = useState({
    name: "",
    price: "",
    isFree: false,
    locationName: "",
    contactPhone: "",
    notes: "",
  });
  const [isSavingMaterial, setIsSavingMaterial] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    type: "equipment" | "material";
    rental?: RentalRequest;
    materialRequest?: MaterialRequest;
  }>({ open: false, type: "equipment" });
  const [paymentId, setPaymentId] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribeEquipment = subscribeFirebaseEquipment(
      (firebaseEquipment) => {
        const userOwnedFromFirebase = firebaseEquipment.filter(
          (equipment) =>
            equipment.owner.id === user.id ||
            equipment.owner.name === user.name ||
            equipment.owner.location === user.businessName
        );
        setMyEquipment(userOwnedFromFirebase);
      },
      (error) => {
        console.error("Failed to load equipment from Firebase:", error);
      }
    );

    const unsubscribeRentals = subscribeFirebaseRentals(
      (firebaseRentals) => {
        const ownerRentals = firebaseRentals.filter(
          (rental) =>
            rental.equipment.owner.id === user.id ||
            rental.equipment.owner.name === user.name
        );
        const requesterRentals = firebaseRentals.filter(
          (rental) =>
            rental.renter.id === user.id ||
            rental.renter.name === user.name,
        );
        setRequests(ownerRentals);
        setMyRentalRequests(requesterRentals);
      },
      (error) => {
        console.error("Failed to load rentals from Firebase:", error);
      }
    );

    const unsubscribeBusinessProfile = subscribeBusinessProfile(
      user.id,
      (profile) => {
        setBusinessProfile(profile ? { isProfileComplete: profile.isProfileComplete } : null);
      },
      (error) => {
        console.error("Failed to load business profile from Firebase:", error);
      }
    );

    const unsubscribeMaterials = subscribeFirebaseMaterials(
      (materials) => {
        const owned = materials.filter(
          (material) =>
            material.sellerId === user.id || material.contactName === user.name,
        );
        setMyMaterials(owned);
      },
      (error) => {
        console.error("Failed to load builder bazaar listings:", error);
      },
    );

    const unsubscribeMaterialRequests = subscribeFirebaseMaterialRequests(
      (allRequests) => {
        const sellerRequests = allRequests.filter(
          (request) =>
            request.sellerId === user.id || request.sellerName === user.name,
        );
        const requesterRequests = allRequests.filter(
          (request) =>
            request.requesterId === user.id || request.requesterName === user.name,
        );
        setMaterialRequests(sellerRequests);
        setMyMaterialRequests(requesterRequests);
      },
      (error) => {
        console.error("Failed to load builder bazaar requests:", error);
      },
    );

    // Subscribe to owner notifications (latest first)
    const unsubscribeNotifications = subscribeDocuments(
      "notifications",
      (docs) => {
        setNotifications(docs as DashboardNotification[]);
      },
      [where("recipientId", "==", user.id), orderBy("createdAt", "desc")],
      (error) => {
        console.error("Failed to load notifications:", error);
      }
    );

    return () => {
      unsubscribeEquipment();
      unsubscribeRentals();
      unsubscribeBusinessProfile();
      unsubscribeNotifications();
      unsubscribeMaterials();
      unsubscribeMaterialRequests();
    };
  }, [user]);

  const pendingRequests = requests.filter((r) => r.status === "requested");
  const approvedMyRequests = myRentalRequests.filter(
    (request) => request.status === "approved" && request.paymentStatus !== "paid",
  );
  const pendingMyRequests = myRentalRequests.filter(
    (request) => request.status === "requested" || request.status === "extension_requested",
  );
  const approvedMyMaterialRequests = myMaterialRequests.filter(
    (request) => request.status === "approved" && request.paymentStatus !== "paid",
  );
  const pendingMyMaterialRequests = myMaterialRequests.filter(
    (request) => request.status === "requested",
  );
  const activeRentals = requests.filter(
    (r) => r.status === "approved" || r.status === "active"
  );
  const extensionRequests = requests.filter(
    (r) => r.extensionRequest?.status === "pending"
  );
  const pendingMaterialRequests = materialRequests.filter(
    (request) => request.status === "requested",
  );
  const completedMaterialRequests = materialRequests.filter(
    (request) => request.status === "approved" || request.status === "completed",
  );

  const rentalEarnings = requests
    .filter(
      (request) =>
        request.status === "approved" ||
        request.status === "active" ||
        request.status === "completed",
    )
    .reduce((sum, request) => sum + (request.rentalFee ?? request.totalPrice ?? 0), 0);

  const materialPriceById = new Map(myMaterials.map((material) => [material.id, material.price]));

  const materialSalesValue = completedMaterialRequests.reduce(
    (sum, request) => sum + (materialPriceById.get(request.materialId) ?? 0),
    0,
  );

  const totalEarnings = rentalEarnings + materialSalesValue;
  const materialInCount = myMaterials.length;
  const materialOutCount = completedMaterialRequests.length;

  const getRentalRevenue = (rental: RentalRequest) => {
    if (typeof rental.rentalFee === "number") return rental.rentalFee;
    if (typeof rental.totalPrice === "number" && typeof rental.serviceFee === "number") {
      return Math.max(0, rental.totalPrice - rental.serviceFee);
    }
    return typeof rental.totalPrice === "number" ? rental.totalPrice : 0;
  };

  const getRentalServiceFee = (rental: RentalRequest) =>
    typeof rental.serviceFee === "number" ? rental.serviceFee : 0;

  const realizedRentals = useMemo(
    () => requests.filter((r) => r.status === "approved" || r.status === "active" || r.status === "completed"),
    [requests],
  );

  const pendingFinanceRentals = useMemo(
    () => requests.filter((r) => r.status === "requested" || r.status === "extension_requested"),
    [requests],
  );

  const financeSummary = useMemo(() => {
    const totalEarningsValue = realizedRentals.reduce((sum, rental) => sum + getRentalRevenue(rental), 0);
    const thisMonthEarnings = realizedRentals
      .filter((rental) => rental.startDate >= startOfMonth(new Date()))
      .reduce((sum, rental) => sum + getRentalRevenue(rental), 0);
    const pendingPayouts = pendingFinanceRentals.reduce((sum, rental) => sum + getRentalRevenue(rental), 0);
    const averageRentalValue = realizedRentals.length
      ? realizedRentals.reduce((sum, rental) => sum + (rental.totalPrice ?? getRentalRevenue(rental)), 0) /
        realizedRentals.length
      : 0;

    return {
      totalEarnings: totalEarningsValue,
      thisMonthEarnings,
      pendingPayouts,
      averageRentalValue,
    };
  }, [realizedRentals, pendingFinanceRentals]);

  const monthlyEarnings = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => startOfMonth(subMonths(new Date(), 5 - index)));
    return months.map((monthStart) => {
      const monthRentals = realizedRentals.filter(
        (rental) => format(rental.startDate, "yyyy-MM") === format(monthStart, "yyyy-MM"),
      );
      const revenue = monthRentals.reduce((sum, rental) => sum + (rental.totalPrice ?? getRentalRevenue(rental)), 0);
      const fees = monthRentals.reduce((sum, rental) => sum + getRentalServiceFee(rental), 0);
      const net = monthRentals.reduce((sum, rental) => sum + getRentalRevenue(rental), 0);

      return { month: format(monthStart, "MMM"), revenue, payouts: net, fees, net };
    });
  }, [realizedRentals]);

  const transactions = useMemo(() => {
    const items: Array<{
      id: string;
      type: "rental_income" | "service_fee";
      amount: number;
      description: string;
      date: Date;
      status: "completed" | "processing" | "pending";
      rentalId: string;
      equipmentName?: string;
    }> = [];

    requests
      .filter((rental) => rental.status !== "declined")
      .forEach((rental) => {
        const revenue = getRentalRevenue(rental);
        const fees = getRentalServiceFee(rental);
        const transactionStatus =
          rental.status === "completed"
            ? "completed"
            : rental.status === "approved" || rental.status === "active"
              ? "processing"
              : "pending";

        if (revenue > 0) {
          items.push({
            id: `${rental.id}-income`,
            type: "rental_income",
            amount: revenue,
            description: `${rental.equipment.name} - ${rental.totalDays} day rental`,
            date: rental.startDate,
            status: transactionStatus,
            rentalId: rental.id,
            equipmentName: rental.equipment.name,
          });
        }

        if (fees > 0) {
          items.push({
            id: `${rental.id}-fee`,
            type: "service_fee",
            amount: fees,
            description: "Platform service fee",
            date: rental.startDate,
            status: transactionStatus,
            rentalId: rental.id,
          });
        }
      });

    return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 30);
  }, [requests]);

  const equipmentAnalytics = useMemo(() => {
    const rentalsByEquipment = requests.reduce((map, rental) => {
      const key = rental.equipment.id;
      const current = map.get(key) ?? [];
      current.push(rental);
      map.set(key, current);
      return map;
    }, new Map<string, RentalRequest[]>());

    return myEquipment.map((item) => {
      const itemRentals = rentalsByEquipment.get(item.id) ?? [];
      const totalRentalsCount = itemRentals.length;
      const totalRevenue = itemRentals.reduce((sum, rental) => sum + getRentalRevenue(rental), 0);
      const daysRented = itemRentals.reduce((sum, rental) => sum + rental.totalDays, 0);
      const daysIdle = Math.max(0, 30 - daysRented);
      const utilizationRate = daysRented + daysIdle > 0 ? (daysRented / (daysRented + daysIdle)) * 100 : 0;
      const averageRentalDuration = totalRentalsCount > 0 ? daysRented / totalRentalsCount : 0;
      const lastRented = itemRentals.length
        ? itemRentals.reduce(
            (latest, rental) => (rental.endDate > latest ? rental.endDate : latest),
            itemRentals[0].endDate,
          )
        : null;

      return {
        equipmentId: item.id,
        equipmentName: item.name,
        locationId: item.locationId || item.owner.id,
        locationName: item.locationName || item.owner.location,
        totalRentals: totalRentalsCount,
        totalRevenue,
        daysRented,
        daysIdle,
        utilizationRate,
        averageRentalDuration,
        lastRented,
      };
    });
  }, [myEquipment, requests]);

  const locationAnalytics = useMemo(() => {
    const equipmentByLocation = myEquipment.reduce((map, item) => {
      const key = item.locationId || item.owner.id;
      const current = map.get(key) ?? [];
      current.push(item);
      map.set(key, current);
      return map;
    }, new Map<string, Equipment[]>());

    return Array.from(equipmentByLocation.entries()).map(([locationId, items]) => {
      const analyticsAtLocation = equipmentAnalytics.filter((entry) => entry.locationId === locationId);
      const totalRentalsCount = analyticsAtLocation.reduce((sum, entry) => sum + entry.totalRentals, 0);
      const totalRevenue = analyticsAtLocation.reduce((sum, entry) => sum + entry.totalRevenue, 0);
      const averageUtilization =
        items.length > 0
          ? analyticsAtLocation.reduce((sum, entry) => sum + entry.utilizationRate, 0) / items.length
          : 0;
      const topEquipment =
        analyticsAtLocation.sort((a, b) => b.totalRentals - a.totalRentals)[0]?.equipmentName || "N/A";

      return {
        locationId,
        locationName: items[0]?.locationName || items[0]?.owner.location || "Location",
        equipmentCount: items.length,
        totalRentals: totalRentalsCount,
        totalRevenue,
        averageUtilization,
        topEquipment,
      };
    });
  }, [myEquipment, equipmentAnalytics]);

  // Categorize by urgency
  const urgentRequests = pendingRequests.filter((r) => {
    const daysUntil = differenceInDays(r.startDate, new Date());
    return daysUntil <= 2;
  });

  const handleApprove = async (requestId: string, notes?: string) => {
    try {
      await updateFirebaseRentalStatus(requestId, "approved", notes);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: "approved", ownerNotes: notes } : r
        )
      );
      toast({
        title: "Request approved",
        description: "The renter has been notified. Pickup details will be shared.",
      });
    } catch (error) {
      console.error("Failed to approve rental request:", error);
      toast({
        title: "Approval failed",
        description:
          error instanceof Error && error.message
            ? error.message
            : "Could not approve this request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await updateFirebaseRentalStatus(requestId, "declined");
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "declined" } : r))
      );
      toast({
        title: "Request declined",
        description: "The renter has been notified.",
      });
    } catch (error) {
      console.error("Failed to decline rental request:", error);
      toast({
        title: "Decline failed",
        description:
          error instanceof Error && error.message
            ? error.message
            : "Could not decline this request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApproveExtension = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              extensionRequest: r.extensionRequest
                ? { ...r.extensionRequest, status: "approved", paymentStatus: "pending" }
                : undefined,
            }
          : r
      )
    );
    toast({
      title: "Extension approved",
      description: "The renter will be prompted to pay for the extension.",
    });
  };

  const handleDeclineExtension = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              extensionRequest: r.extensionRequest
                ? { ...r.extensionRequest, status: "declined" }
                : undefined,
            }
          : r
      )
    );
    toast({
      title: "Extension declined",
      description: "The renter has been notified.",
    });
  };

  const handleRentalClick = (rental: RentalRequest) => {
    navigate(`/rental/${rental.id}`);
  };

  const handlePayForApprovedRequest = async (rentalId: string, paymentReference: string) => {
    try {
      await completeFirebaseRentalPayment(rentalId, paymentReference);
      setMyRentalRequests((prev) =>
        prev.map((request) =>
          request.id === rentalId
            ? {
                ...request,
                status: "active",
                paymentStatus: "paid",
                paymentReference,
                paymentPaidAt: new Date(),
              }
            : request,
        ),
      );
      toast({
        title: "Payment successful",
        description: "Redirecting to rental operations to complete pickup checklist...",
      });
    } catch (error) {
      console.error("Failed to complete payment:", error);
      toast({
        title: "Payment failed",
        description:
          error instanceof Error && error.message
            ? error.message
            : "Could not process payment right now.",
        variant: "destructive",
      });
    }
  };

  const handlePayForApprovedMaterialRequest = async (
    materialRequestId: string,
    paymentReference: string,
  ) => {
    try {
      await completeFirebaseMaterialRequestPayment(materialRequestId, paymentReference);
      setMyMaterialRequests((prev) =>
        prev.map((request) =>
          request.id === materialRequestId
            ? {
                ...request,
                status: "completed",
                paymentStatus: "paid",
                paymentReference,
                paymentPaidAt: new Date(),
              }
            : request,
        ),
      );
      toast({
        title: "Payment successful",
        description: "Redirecting to material verification page...",
      });
    } catch (error) {
      console.error("Failed to complete material payment:", error);
      toast({
        title: "Payment failed",
        description:
          error instanceof Error && error.message
            ? error.message
            : "Could not process material payment right now.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmPayment = async () => {
    if (isProcessingPayment) return;

    if (!paymentId.trim()) {
      toast({
        title: "Payment ID required",
        description: "Please enter your eSewa payment ID as proof of payment.",
        variant: "destructive",
      });
      return;
    }

    const paymentReference = `ESEWA-${paymentId.trim()}`;
    setIsProcessingPayment(true);
    
    let rentalId: string | null = null;
    let materialRequestId: string | null = null;
    
    try {
      if (paymentDialog.type === "equipment" && paymentDialog.rental) {
        rentalId = paymentDialog.rental.id;
        await handlePayForApprovedRequest(rentalId, paymentReference);
      }
      if (paymentDialog.type === "material" && paymentDialog.materialRequest) {
        materialRequestId = paymentDialog.materialRequest.id;
        await handlePayForApprovedMaterialRequest(
          materialRequestId,
          paymentReference,
        );
      }
      setPaymentDialog({ open: false, type: "equipment" });
      setPaymentId("");
      
      // Navigate to rental operations page to view pickup/return checklists
      if (rentalId) {
        navigate(`/rental/${rentalId}`);
      } else if (materialRequestId) {
        navigate(`/materials/verify`);
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const openMaterialEditor = (material: MaterialListing) => {
    setMaterialEditor({ open: true, material });
    setMaterialDraft({
      name: material.name,
      price: material.price.toString(),
      isFree: material.isFree,
      locationName: material.locationName,
      contactPhone: material.contactPhone,
      notes: material.notes || "",
    });
  };

  const handleSaveMaterial = async () => {
    const material = materialEditor.material;
    if (!material) return;

    if (!materialDraft.name.trim() || !materialDraft.locationName.trim()) {
      toast({
        title: "Missing fields",
        description: "Name and location are required.",
        variant: "destructive",
      });
      return;
    }

    if (!materialDraft.isFree && Number(materialDraft.price) <= 0) {
      toast({
        title: "Invalid price",
        description: "Set a valid price or mark this listing as free.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingMaterial(true);
    try {
      await updateFirebaseMaterial(material.id, {
        name: materialDraft.name.trim(),
        isFree: materialDraft.isFree,
        price: materialDraft.isFree ? 0 : Number(materialDraft.price),
        locationName: materialDraft.locationName.trim(),
        contactPhone: materialDraft.contactPhone.trim(),
        notes: materialDraft.notes.trim(),
      });

      toast({
        title: "Builder's Bazaar updated",
        description: "Your material listing details were saved.",
      });
      setMaterialEditor({ open: false, material: null });
    } catch (error) {
      console.error("Failed to update material listing:", error);
      toast({
        title: "Update failed",
        description: "Could not update this listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingMaterial(false);
    }
  };

  const handleApproveMaterialRequest = async (requestId: string) => {
    try {
      await updateFirebaseMaterialRequestStatus(requestId, "approved");
      setMaterialRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? { ...request, status: "approved" }
            : request,
        ),
      );
      toast({
        title: "Bazaar request approved",
        description: "Buyer can proceed with pickup and payment.",
      });
    } catch (error) {
      console.error("Failed to approve bazaar request:", error);
      toast({
        title: "Approval failed",
        description: "Could not update this request.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineMaterialRequest = async (requestId: string) => {
    try {
      await updateFirebaseMaterialRequestStatus(requestId, "declined");
      setMaterialRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? { ...request, status: "declined" }
            : request,
        ),
      );
      toast({
        title: "Bazaar request declined",
        description: "The buyer has been notified.",
      });
    } catch (error) {
      console.error("Failed to decline bazaar request:", error);
      toast({
        title: "Decline failed",
        description: "Could not update this request.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIllustrations variant="dashboard" />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative z-10">
        {/* Hero Header */}
        <PageHeader
          className="mb-10"
          title="Dashboard"
          description={`Welcome, ${user?.name || "User"}. Monitor equipment, manage requests, and track performance`}
          badge={
            businessProfile ? (
              <Badge variant={businessProfile.isProfileComplete ? "success" : "warning"}>
                {businessProfile.isProfileComplete ? "Verified" : "Unverified"}
              </Badge>
            ) : null
          }
          actions={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button onClick={() => navigate("/dashboard/add-equipment")} size="default" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You are about to sign out of your account. This helps prevent accidental logouts.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>Sign Out</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          }
        />

        {/* Stats Grid - Modern cards with better visual weight */}
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          <StatCard
            label="Active Listings"
            value={myEquipment.length + myMaterials.length}
            icon={Package}
            iconColor="text-primary"
            subtitle="Equipment + Bazaar"
          />
          <StatCard
            label="Pending Requests"
            value={pendingRequests.length + pendingMaterialRequests.length}
            icon={Clock}
            iconColor="text-warning"
            variant={pendingRequests.length + pendingMaterialRequests.length > 0 ? "highlight" : "default"}
            subtitle={pendingRequests.length + pendingMaterialRequests.length > 0 ? "Needs review" : "All caught up"}
          />
          <StatCard
            label="Active Rentals"
            value={activeRentals.length}
            icon={CheckCircle}
            iconColor="text-success"
            subtitle="Currently rented"
          />
          <StatCard
            label="Total Earnings"
            value={`NPR ${totalEarnings.toLocaleString()}`}
            icon={DollarSign}
            iconColor="text-accent"
            subtitle="Rental + material sales"
          />
          <StatCard
            label="Material Sales"
            value={`NPR ${materialSalesValue.toLocaleString()}`}
            icon={Hammer}
            iconColor="text-primary"
            subtitle={`In ${materialInCount} • Out ${materialOutCount}`}
          />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Material In</p>
                <p className="text-2xl font-bold text-foreground">{materialInCount}</p>
                <p className="text-xs text-muted-foreground">Total listed materials</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-success" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Material Out</p>
                <p className="text-2xl font-bold text-foreground">{materialOutCount}</p>
                <p className="text-xs text-muted-foreground">Approved/completed sales</p>
              </div>
              <ArrowDownRight className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Material Sales Value</p>
              <p className="text-2xl font-bold text-foreground">NPR {materialSalesValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">From sold material requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Priority Alerts - Cleaner design with better grouping */}
        {(urgentRequests.length > 0 || extensionRequests.length > 0) && (
          <div className="mb-10 space-y-4">
            {urgentRequests.length > 0 && (
              <div className="flex flex-col gap-4 rounded-xl border border-warning/30 bg-warning/5 p-4 sm:flex-row sm:items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/15">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">
                    {urgentRequests.length} request{urgentRequests.length > 1 ? "s" : ""} need{urgentRequests.length === 1 ? "s" : ""} attention
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rentals starting within 48 hours
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full shrink-0 border-warning/30 hover:bg-warning/10 sm:w-auto"
                  onClick={() => setActiveTab("requests")}
                >
                  Review Now
                </Button>
              </div>
            )}

            {extensionRequests.length > 0 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                    <CalendarPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">
                      {extensionRequests.length} extension request{extensionRequests.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Renters want to extend their rental periods
                    </p>
                  </div>
                </div>
                <div className="border-t border-primary/10 divide-y divide-primary/10">
                  {extensionRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-col gap-3 bg-card/50 p-4 transition-colors hover:bg-card sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">
                          {request.equipment.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.renter.name} · Until{" "}
                          {format(request.extensionRequest!.newEndDate, "MMM d")} 
                          <span className="text-primary font-medium ml-1">
                            (+{request.extensionRequest!.additionalDays}d, NPR {request.extensionRequest!.additionalCost})
                          </span>
                        </p>
                      </div>
                      <div className="ml-0 flex w-full gap-2 sm:ml-4 sm:w-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeclineExtension(request.id)}
                        >
                          Decline
                        </Button>
                        <Button size="sm" onClick={() => handleApproveExtension(request.id)}>
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content Tabs - Improved visual hierarchy */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="h-11 w-full justify-start overflow-x-auto bg-muted/50 p-1">
            <TabsTrigger value="timeline" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <CalendarRange className="h-4 w-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Requests</span>
              {pendingRequests.length > 0 && (
                <Badge variant="warning" className="ml-1 h-5 min-w-5 px-1.5">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Listings</span>
            </TabsTrigger>
            <TabsTrigger value="my-requests" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">My Requests</span>
              {approvedMyRequests.length > 0 && (
                <Badge variant="warning" className="ml-1 h-5 min-w-5 px-1.5">
                  {approvedMyRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="business" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Business Info</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Finance</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <p className="text-sm text-muted-foreground">
            {activeTab === "timeline" && "See upcoming and active rentals in chronological order."}
            {activeTab === "requests" && "Review incoming equipment rental and material purchase requests. Approve or decline to keep transactions moving."}
            {activeTab === "listings" && "Manage your equipment catalog, pricing, and availability settings."}
            {activeTab === "my-requests" && "Track your equipment rental and material purchase requests. Pay approved ones and monitor request status."}
            {activeTab === "business" && "Add your business details so other users can verify your listing profile."}
            {activeTab === "finance" && "Review earnings, payouts, and transaction history without leaving dashboard."}
            {activeTab === "analytics" && "Track usage and utilization insights across your equipment portfolio."}
          </p>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <CalendarRange className="h-5 w-5 text-primary" />
                  Rental Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {activeRentals.length === 0 && pendingRequests.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="No upcoming rentals"
                    description="When you approve rental requests, they'll appear on your schedule here."
                  />
                ) : (
                  <RentalTimeline
                    rentals={[...activeRentals, ...pendingRequests].sort(
                      (a, b) => a.startDate.getTime() - b.startDate.getTime()
                    )}
                    onRentalClick={handleRentalClick}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            {requests.length === 0 && materialRequests.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-8">
                  <EmptyState
                    icon={Inbox}
                    title="No requests yet"
                    description="When businesses request your equipment or materials, they'll appear here for your review."
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                {materialRequests.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Hammer className="h-5 w-5 text-primary" />
                        Material Purchase Requests
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {materialRequests.map((request) => (
                        <div key={request.id} className="rounded-lg border border-border/60 p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex gap-3 min-w-0">
                              <div className="h-14 w-14 overflow-hidden rounded-lg bg-muted shrink-0">
                                <img
                                  src={request.materialImageUrl}
                                  alt={request.materialName}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate">{request.materialName}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  Buyer: {request.requesterName} • Pickup: {request.pickupLocation}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(request.createdAt, "MMM d, p")} • {request.paymentMethod.toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusIndicator
                                status={
                                  request.status === "requested"
                                    ? "pending"
                                    : request.status === "approved"
                                      ? "success"
                                      : request.status === "completed"
                                        ? "info"
                                        : "error"
                                }
                                pulse={request.status === "requested"}
                              >
                                {request.status}
                              </StatusIndicator>
                              {request.status === "requested" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeclineMaterialRequest(request.id)}
                                  >
                                    Decline
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveMaterialRequest(request.id)}
                                  >
                                    Approve
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {requests.map((request) => (
                  <Card 
                    key={request.id} 
                    className="overflow-hidden border-border/50 hover:border-border transition-colors"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-4">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                            <img
                              src={request.equipment.images[0]}
                              alt={request.equipment.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="space-y-2 min-w-0">
                            <div>
                              <h3 className="font-semibold text-foreground truncate">
                                {request.equipment.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                <span>
                                  {getDateLabel(request.startDate)} – {getDateLabel(request.endDate)}
                                </span>
                                <span className="text-muted-foreground/40">·</span>
                                <span>{request.totalDays} days</span>
                              </div>
                            </div>
                            <StatusIndicator
                              status={
                                request.status === "requested"
                                  ? "pending"
                                  : request.status === "approved" || request.status === "active"
                                  ? "success"
                                  : request.status === "completed"
                                  ? "info"
                                  : "error"
                              }
                              pulse={request.status === "requested"}
                            >
                              {statusColors[request.status].label}
                            </StatusIndicator>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 lg:items-end">
                          <p className="text-xl font-bold text-foreground tabular-nums">
                            NPR {request.totalPrice}
                          </p>
                          <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRentalClick(request)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {request.status === "requested" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDecline(request.id)}
                                >
                                  Decline
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    setApproveDialog({ open: true, request })
                                  }
                                >
                                  Approve
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {request.status === "requested" && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                            About the renter
                          </p>
                          <RenterProfileCard renter={request.renter} />
                        </div>
                      )}

                      {request.ownerNotes && request.status !== "requested" && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            Your notes
                          </p>
                          <p className="text-sm text-foreground">
                            {request.ownerNotes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-8">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Hammer className="h-5 w-5 text-primary" />
                  Builder's Bazaar Listings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border/50 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Sales Value</p>
                    <p className="text-lg font-semibold text-foreground">NPR {materialSalesValue.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">In</p>
                    <p className="text-lg font-semibold text-foreground">{materialInCount}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Out</p>
                    <p className="text-lg font-semibold text-foreground">{materialOutCount}</p>
                  </div>
                </div>

                {myMaterials.length === 0 ? (
                  <EmptyState
                    icon={Hammer}
                    title="No materials listed"
                    description="Create material listings in Builder's Bazaar and manage details from this dashboard."
                    action={
                      <Button onClick={() => navigate("/materials/list")}>Go to Materials Listing</Button>
                    }
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {myMaterials.map((material) => (
                      <Card key={material.id} className="overflow-hidden border-border/50">
                        <div className="aspect-[16/10] overflow-hidden bg-muted">
                          <img
                            src={material.imageUrl}
                            alt={material.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <h3 className="font-semibold text-foreground line-clamp-1">{material.name}</h3>
                            <div className="mt-1 flex flex-wrap gap-2">
                              <Badge variant="secondary">{materialCategoryLabels[material.category]}</Badge>
                              <Badge variant="outline">{materialConditionLabels[material.condition]}</Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {material.locationName}
                          </div>
                          <div className="flex items-center justify-between border-t border-border/50 pt-2">
                            <p className="font-semibold text-foreground">
                              {material.isFree ? "Free" : `NPR ${material.price}`}
                            </p>
                            <Button size="sm" variant="outline" onClick={() => openMaterialEditor(material)}>
                              <Pencil className="mr-1 h-3.5 w-3.5" />
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {myEquipment.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-8">
                  <EmptyState
                    icon={Package}
                    title="No equipment listed"
                    description="Add your first equipment to start earning from idle assets."
                    action={
                      <Button onClick={() => navigate("/dashboard/add-equipment")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Equipment
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myEquipment.map((equipment) => (
                  <Card 
                    key={equipment.id} 
                    className="overflow-hidden border-border/50 hover:border-border hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                      <img
                        src={equipment.images[0]}
                        alt={equipment.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge 
                        variant="secondary" 
                        className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm"
                      >
                        {categoryLabels[equipment.category]}
                      </Badge>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-1">{equipment.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {equipment.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div>
                          <span className="text-lg font-bold text-foreground tabular-nums">
                            NPR {equipment.pricePerDay}
                          </span>
                          <span className="text-sm text-muted-foreground">/day</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-1.5 items-center">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 sm:w-auto sm:h-auto w-full sm:w-auto"
                              >
                                <Settings2 className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>Availability Settings</SheetTitle>
                                <SheetDescription>
                                  Configure rental constraints for {equipment.name}
                                </SheetDescription>
                              </SheetHeader>
                              <div className="mt-6">
                                <AvailabilityControls
                                  equipmentId={equipment.id}
                                  equipmentName={equipment.name}
                                  initialBlockedDates={equipment.availability.blockedDates}
                                  initialMinDays={equipment.availability.minRentalDays}
                                  initialBufferDays={equipment.availability.bufferDays}
                                />
                              </div>
                            </SheetContent>
                          </Sheet>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-requests" className="space-y-4">
            {myRentalRequests.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-8">
                  <EmptyState
                    icon={ClipboardCheck}
                    title="No rental requests yet"
                    description="Your sent requests will appear here once you request equipment."
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                {approvedMyRequests.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">Approved Requests - Payment Pending</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {approvedMyRequests.map((request) => (
                        <div key={request.id} className="rounded-lg border border-border/60 p-4">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2 min-w-0">
                              <p className="font-semibold text-foreground truncate">{request.equipment.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Owner: {request.equipment.owner.name} • {format(request.startDate, "MMM d")} - {format(request.endDate, "MMM d")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Total to pay: <span className="font-semibold text-foreground">NPR {request.totalPrice.toLocaleString()}</span>
                              </p>
                              {request.ownerNotes && (
                                <p className="text-sm text-muted-foreground">Owner note: {request.ownerNotes}</p>
                              )}
                              {(request.purpose || request.destination || request.notes) && (
                                <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground space-y-1">
                                  {request.purpose && <p>Purpose: {request.purpose}</p>}
                                  {request.destination && <p>Destination: {request.destination}</p>}
                                  {request.notes && <p>Your notes: {request.notes}</p>}
                                </div>
                              )}
                            </div>
                            <div className="flex w-full gap-2 lg:w-auto">
                              <Button
                                className="w-full lg:w-auto"
                                onClick={() =>
                                  setPaymentDialog({
                                    open: true,
                                    type: "equipment",
                                    rental: request,
                                  })
                                }
                              >
                                Pay Now
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full lg:w-auto"
                                onClick={() => handleRentalClick(request)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {pendingMyRequests.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">Pending Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {pendingMyRequests.map((request) => (
                        <div key={request.id} className="rounded-lg border border-border/60 p-4 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{request.equipment.name}</p>
                            <p className="text-sm text-muted-foreground">Waiting for owner approval</p>
                          </div>
                          <StatusIndicator status="pending">Pending</StatusIndicator>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {approvedMyMaterialRequests.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">Approved Material Purchase Requests - Payment Pending</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {approvedMyMaterialRequests.map((request) => (
                        <div key={request.id} className="rounded-lg border border-border/60 p-4">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2 min-w-0">
                              <p className="font-semibold text-foreground truncate">{request.materialName}</p>
                              <p className="text-sm text-muted-foreground">
                                Seller: {request.sellerName} • Pickup: {request.pickupLocation}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Payment mode: <span className="font-semibold text-foreground uppercase">{request.paymentMethod}</span>
                              </p>
                            </div>
                            <Button
                              className="w-full lg:w-auto"
                              onClick={() =>
                                setPaymentDialog({
                                  open: true,
                                  type: "material",
                                  materialRequest: request,
                                })
                              }
                            >
                              Pay Now
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {pendingMyMaterialRequests.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">Pending Material Purchase Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {pendingMyMaterialRequests.map((request) => (
                        <div key={request.id} className="rounded-lg border border-border/60 p-4 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{request.materialName}</p>
                            <p className="text-sm text-muted-foreground">Waiting for seller approval</p>
                          </div>
                          <StatusIndicator status="pending">Pending</StatusIndicator>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="business">
            {user ? (
              <BusinessProfileSection
                userId={user.id}
                businessNameFallback={user.businessName || user.name}
              />
            ) : (
              <Card className="border-border/50">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Please sign in to manage business verification details.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="finance" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <EarningsChart data={monthlyEarnings} chartType="bar" />
              </div>
              <div>
                <PayoutSummary
                  totalEarnings={financeSummary.totalEarnings}
                  thisMonthEarnings={financeSummary.thisMonthEarnings}
                  pendingPayouts={financeSummary.pendingPayouts}
                  averageRentalValue={financeSummary.averageRentalValue}
                />
              </div>
            </div>

            <TransactionHistory transactions={transactions} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <UsageAnalytics equipmentAnalytics={equipmentAnalytics} locationAnalytics={locationAnalytics} />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog
        open={materialEditor.open}
        onOpenChange={(open) =>
          setMaterialEditor({ open, material: open ? materialEditor.material : null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Builder's Bazaar Listing</DialogTitle>
            <DialogDescription>
              Update your material details directly from dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Material Name</label>
              <Input
                value={materialDraft.name}
                onChange={(e) =>
                  setMaterialDraft((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (NPR)</label>
                <Input
                  type="number"
                  min="0"
                  value={materialDraft.isFree ? "0" : materialDraft.price}
                  onChange={(e) =>
                    setMaterialDraft((prev) => ({ ...prev, price: e.target.value }))
                  }
                  disabled={materialDraft.isFree}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Phone</label>
                <Input
                  value={materialDraft.contactPhone}
                  onChange={(e) =>
                    setMaterialDraft((prev) => ({ ...prev, contactPhone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={materialDraft.locationName}
                onChange={(e) =>
                  setMaterialDraft((prev) => ({ ...prev, locationName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={materialDraft.notes}
                onChange={(e) =>
                  setMaterialDraft((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Optional details"
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={materialDraft.isFree}
                onChange={(e) =>
                  setMaterialDraft((prev) => ({ ...prev, isFree: e.target.checked }))
                }
              />
              Mark as free
            </label>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMaterialEditor({ open: false, material: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveMaterial} disabled={isSavingMaterial}>
              {isSavingMaterial ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={paymentDialog.open}
        onOpenChange={(open) => {
          if (!isProcessingPayment) {
            setPaymentDialog((prev) => ({ ...prev, open }));
            if (!open) {
              setPaymentId("");
            }
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Payment Gateway</DialogTitle>
            <DialogDescription className="text-base">
              Complete your payment to continue with {paymentDialog.type === "equipment" ? "equipment rental" : "material purchase"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Cost Breakdown */}
            {paymentDialog.type === "equipment" && paymentDialog.rental && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border/60 bg-muted/50 p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                      <p className="text-lg font-semibold text-foreground">{paymentDialog.rental.equipment.name}</p>
                    </div>
                    
                    {/* Rental Duration */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rental Period</span>
                      <span className="font-medium">{paymentDialog.rental.totalDays} {paymentDialog.rental.totalDays === 1 ? 'day' : 'days'}</span>
                    </div>
                    
                    {/* Base Rental Cost */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Equipment Rate ({paymentDialog.rental.totalDays} × NPR {paymentDialog.rental.equipment.pricePerDay.toLocaleString()})
                      </span>
                      <span className="font-medium">NPR {paymentDialog.rental.rentalFee.toLocaleString()}</span>
                    </div>
                    
                    {/* Operator Fee (if applicable) */}
                    {paymentDialog.rental.operatorRequested && paymentDialog.rental.operatorFee && paymentDialog.rental.operatorFee > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Operator Service ({paymentDialog.rental.totalDays} × NPR {paymentDialog.rental.equipment.operatorPricePerDay?.toLocaleString() || 0})
                        </span>
                        <span className="font-medium">NPR {paymentDialog.rental.operatorFee.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {/* Service Fee */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Platform Service Fee ({paymentDialog.rental.equipment.serviceFeePercent}%)
                      </span>
                      <span className="font-medium">NPR {paymentDialog.rental.serviceFee.toLocaleString()}</span>
                    </div>
                    
                    {/* Security Deposit */}
                    {paymentDialog.rental.equipment.securityDeposit > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Security Deposit <span className="text-xs">(refundable)</span>
                        </span>
                        <span className="font-medium">NPR {paymentDialog.rental.equipment.securityDeposit.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {/* Total */}
                    <div className="flex items-center justify-between pt-3 border-t-2 border-primary/30">
                      <span className="text-base font-semibold text-foreground">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">NPR {paymentDialog.rental.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {paymentDialog.type === "material" && paymentDialog.materialRequest && (
              <div className="rounded-lg border border-border/60 bg-muted/50 p-4">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">{paymentDialog.materialRequest.materialName}</p>
                  <p className="text-sm text-muted-foreground">Seller: {paymentDialog.materialRequest.sellerName}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-base font-semibold text-foreground">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">NPR {paymentDialog.materialRequest.totalPrice?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">Payment Method</label>
                <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white p-2 shadow-sm">
                      <img 
                        src="/esewa-seeklogo.png" 
                        alt="eSewa" 
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-foreground">eSewa</p>
                      <p className="text-sm text-muted-foreground">Digital wallet payment</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="payment-id" className="text-sm font-semibold text-foreground">eSewa Payment ID</label>
                <Input
                  id="payment-id"
                  placeholder="Enter your eSewa payment/transaction ID"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  disabled={isProcessingPayment}
                  className="font-mono text-base h-11"
                />
                <p className="text-sm text-muted-foreground">
                  Complete payment via eSewa and enter the transaction ID as proof.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPaymentDialog({ open: false, type: "equipment" });
                setPaymentId("");
              }}
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmPayment} disabled={isProcessingPayment || !paymentId.trim()}>
              {isProcessingPayment ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      {approveDialog.request && (
        <ApproveWithConditionsDialog
          open={approveDialog.open}
          onOpenChange={(open) => setApproveDialog({ open, request: open ? approveDialog.request : null })}
          equipmentName={approveDialog.request.equipment.name}
          renterName={approveDialog.request.renter.name}
          onApprove={(notes) => handleApprove(approveDialog.request!.id, notes)}
        />
      )}

      {/* Terms Agreement Dialog */}
      <TermsAgreementDialog
        open={!hasAcceptedTerms}
        onAccept={async (signature: string) => {
          await acceptTerms(signature);
          toast({
            title: "Welcome to Upyog!",
            description: "You can now list equipment and rent from other users.",
          });
        }}
      />
    </div>
  );
};

export default OwnerDashboard;
