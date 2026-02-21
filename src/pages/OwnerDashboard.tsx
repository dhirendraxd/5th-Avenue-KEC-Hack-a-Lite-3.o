import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import BackgroundIllustrations from "@/components/layout/BackgroundIllustrations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useAuth } from "@/contexts/AuthContext";
import { subscribeFirebaseEquipment } from "@/lib/firebase/equipment";
import { subscribeFirebaseRentals, updateFirebaseRentalStatus } from "@/lib/firebase/rentals";
import { subscribeDocuments, updateDocument } from "@/lib/firebase/firestore";
import { where, orderBy } from "firebase/firestore";
import { subscribeBusinessProfile } from "@/lib/firebase/businessProfile";
import { RentalRequest, Equipment } from "@/lib/mockData";
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
} from "lucide-react";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [activeTab, setActiveTab] = useState("timeline");
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    request: RentalRequest | null;
  }>({ open: false, request: null });
  const [businessProfile, setBusinessProfile] = useState<{ isProfileComplete: boolean } | null>(null);

  const [myEquipment, setMyEquipment] = useState<Equipment[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

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
        setRequests(ownerRentals);
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

    // Subscribe to owner notifications (latest first)
    const unsubscribeNotifications = subscribeDocuments(
      "notifications",
      (docs) => {
        // docs are already objects with id and fields
        setNotifications(docs as any[]);
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
    };
  }, [user]);

  const pendingRequests = requests.filter((r) => r.status === "requested");
  const activeRentals = requests.filter(
    (r) => r.status === "approved" || r.status === "active"
  );
  const extensionRequests = requests.filter(
    (r) => r.extensionRequest?.status === "pending"
  );

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
                ? { ...r.extensionRequest, status: "approved" }
                : undefined,
              endDate: r.extensionRequest?.newEndDate || r.endDate,
              totalDays: r.totalDays + (r.extensionRequest?.additionalDays || 0),
            }
          : r
      )
    );
    toast({
      title: "Extension approved",
      description: "The rental has been extended and the renter notified.",
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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
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
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <StatCard
            label="Active Listings"
            value={myEquipment.length}
            icon={Package}
            iconColor="text-primary"
            subtitle="Equipment available"
          />
          <StatCard
            label="Pending Requests"
            value={pendingRequests.length}
            icon={Clock}
            iconColor="text-warning"
            variant={pendingRequests.length > 0 ? "highlight" : "default"}
            subtitle={pendingRequests.length > 0 ? "Needs review" : "All caught up"}
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
            value="NPR 12,450"
            icon={DollarSign}
            iconColor="text-accent"
            trend={{ value: 12, isPositive: true }}
            subtitle="This month"
          />
        </div>

        {/* Notifications - small list for owner */}
        <div className="mb-8">
            <Card>
              <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Inbox className="h-4 w-4 text-primary" />
                  Notifications
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      const unread = notifications.filter((n) => !n.read);
                      if (unread.length === 0) {
                        toast({ title: "No unread notifications", description: "You're all caught up." });
                        return;
                      }

                      // Optimistic update
                      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

                      try {
                        await Promise.all(
                          unread.map((n) => updateDocument("notifications", n.id, { read: true }))
                        );
                        toast({ title: "Marked read", description: `Marked ${unread.length} notifications as read.` });
                      } catch (err) {
                        console.error("Failed to mark notifications read:", err);
                        toast({ title: "Action failed", description: "Could not mark all notifications as read.", variant: "destructive" });
                        // Revert optimistic update on failure: refetching will arrive via subscription; as fallback, mark unread back
                        setNotifications((prev) => prev.map((n) => ({ ...n, read: n.read || false })));
                      }
                    }}
                  >
                    Mark all read
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No notifications</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.slice(0, 6).map((n: any) => (
                      <div key={n.id} className={`flex items-start justify-between gap-3 p-3 rounded-lg ${n.read ? 'bg-card/50' : 'bg-primary/5'}`}>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                        {!n.read && <Badge variant="secondary">New</Badge>}
                      </div>
                    ))}
                  </div>
                )}
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
            <TabsTrigger value="business" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Business Info</span>
            </TabsTrigger>
          </TabsList>

          <p className="text-sm text-muted-foreground">
            {activeTab === "timeline" && "See upcoming and active rentals in chronological order."}
            {activeTab === "requests" && "Review incoming requests, approve quickly, and keep bookings moving."}
            {activeTab === "listings" && "Manage your equipment catalog, pricing, and availability settings."}
            {activeTab === "business" && "Add your business details so other users can verify your listing profile."}
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
            {requests.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-8">
                  <EmptyState
                    icon={Inbox}
                    title="No rental requests yet"
                    description="When businesses request your equipment, they'll appear here for your review."
                  />
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => (
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

                    {/* Renter Profile - Collapsible feel */}
                    {request.status === "requested" && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                          About the renter
                        </p>
                        <RenterProfileCard renter={request.renter} />
                      </div>
                    )}

                    {/* Owner notes */}
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
              ))
            )}
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings">
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
        </Tabs>
      </main>

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
    </div>
  );
};

export default OwnerDashboard;
