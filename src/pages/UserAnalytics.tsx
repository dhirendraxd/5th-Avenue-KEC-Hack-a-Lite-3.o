import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import BackgroundIllustrations from "@/components/layout/BackgroundIllustrations";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeFirebaseEquipment } from "@/lib/firebase/equipment";
import { subscribeFirebaseRentals } from "@/lib/firebase/rentals";
import { subscribeFirebaseMaterials } from "@/lib/firebase/materials";
import { subscribeFirebaseMaterialRequests } from "@/lib/firebase/materialRequests";
import { subscribeBusinessProfile } from "@/lib/firebase/businessProfile";
import { Equipment, RentalRequest } from "@/lib/mockData";
import { MaterialListing } from "@/lib/materialsMock";
import { MaterialRequest } from "@/lib/firebase/materialRequests";
import {
  BarChart3,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  UserRound,
  Hammer,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const UserAnalytics = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [rentals, setRentals] = useState<RentalRequest[]>([]);
  const [materials, setMaterials] = useState<MaterialListing[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [businessProfile, setBusinessProfile] = useState<{ isProfileComplete?: boolean; businessName?: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (!user) return;

    const unsubscribeEquipment = subscribeFirebaseEquipment(
      (items) => {
        setEquipment(items.filter((item) => item.owner.id === user.id || item.owner.name === user.name));
      },
      () => undefined,
    );

    const unsubscribeRentals = subscribeFirebaseRentals(
      (items) => {
        setRentals(
          items.filter(
            (item) => item.equipment.owner.id === user.id || item.equipment.owner.name === user.name,
          ),
        );
      },
      () => undefined,
    );

    const unsubscribeMaterials = subscribeFirebaseMaterials(
      (items) => {
        setMaterials(items.filter((item) => item.sellerId === user.id || item.contactName === user.name));
      },
      () => undefined,
    );

    const unsubscribeMaterialRequests = subscribeFirebaseMaterialRequests(
      (items) => {
        setMaterialRequests(items.filter((item) => item.sellerId === user.id || item.sellerName === user.name));
      },
      () => undefined,
    );

    const unsubscribeProfile = subscribeBusinessProfile(
      user.id,
      (profile) => {
        setBusinessProfile(profile ? { isProfileComplete: profile.isProfileComplete, businessName: profile.businessName } : null);
      },
      () => undefined,
    );

    return () => {
      unsubscribeEquipment();
      unsubscribeRentals();
      unsubscribeMaterials();
      unsubscribeMaterialRequests();
      unsubscribeProfile();
    };
  }, [isAuthenticated, navigate, user]);

  const analytics = useMemo(() => {
    const realizedRentals = rentals.filter(
      (item) => item.status === "approved" || item.status === "active" || item.status === "completed",
    );

    const pendingRentals = rentals.filter((item) => item.status === "requested" || item.status === "extension_requested");

    const rentalRevenue = realizedRentals.reduce(
      (sum, item) => sum + (item.rentalFee ?? item.totalPrice ?? 0),
      0,
    );

    const soldMaterialRequests = materialRequests.filter(
      (item) => item.status === "approved" || item.status === "completed",
    );

    const materialPriceById = new Map(materials.map((material) => [material.id, material.price]));

    const materialSalesValue = soldMaterialRequests.reduce(
      (sum, item) => sum + (materialPriceById.get(item.materialId) ?? 0),
      0,
    );

    const pendingMaterialRequests = materialRequests.filter((item) => item.status === "requested");

    return {
      totalRevenue: rentalRevenue + materialSalesValue,
      rentalRevenue,
      materialSalesValue,
      equipmentCount: equipment.length,
      materialsCount: materials.length,
      materialOutCount: soldMaterialRequests.length,
      pendingRequests: pendingRentals.length + pendingMaterialRequests.length,
      completedTransactions: realizedRentals.length + soldMaterialRequests.length,
      profileComplete: !!businessProfile?.isProfileComplete,
      rentalRequestBreakdown: {
        requested: rentals.filter((item) => item.status === "requested").length,
        approvedOrActive: rentals.filter((item) => item.status === "approved" || item.status === "active").length,
        completed: rentals.filter((item) => item.status === "completed").length,
        declined: rentals.filter((item) => item.status === "declined").length,
      },
      materialRequestBreakdown: {
        requested: materialRequests.filter((item) => item.status === "requested").length,
        approved: materialRequests.filter((item) => item.status === "approved").length,
        completed: materialRequests.filter((item) => item.status === "completed").length,
        declined: materialRequests.filter((item) => item.status === "declined").length,
      },
    };
  }, [businessProfile?.isProfileComplete, equipment.length, materialRequests, materials, rentals]);

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIllustrations variant="dashboard" />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative z-10">
        <PageHeader
          title="User Analytics"
          description="Track profile health, listing performance, and request outcomes in one place."
          badge={
            <Badge variant={analytics.profileComplete ? "success" : "warning"}>
              {analytics.profileComplete ? "Profile Complete" : "Profile Incomplete"}
            </Badge>
          }
          actions={
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          }
          className="mb-8"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">NPR {analytics.totalRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="text-2xl font-bold text-foreground">{analytics.pendingRequests}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Completed Transactions</p>
              <p className="text-2xl font-bold text-foreground">{analytics.completedTransactions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active Listings</p>
              <p className="text-2xl font-bold text-foreground">{analytics.equipmentCount + analytics.materialsCount}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserRound className="h-5 w-5 text-primary" />
                Profile Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/50 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Business Name</p>
                <p className="text-base font-medium text-foreground">{businessProfile?.businessName || user?.businessName || user?.name || "Unknown"}</p>
              </div>
              <div className="rounded-lg border border-border/50 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Profile Status</p>
                <p className="text-base font-medium text-foreground">{analytics.profileComplete ? "Complete" : "Needs details"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Listing Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-xs text-muted-foreground">Equipment</p>
                  <p className="text-xl font-semibold text-foreground">{analytics.equipmentCount}</p>
                </div>
                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-xs text-muted-foreground">Materials</p>
                  <p className="text-xl font-semibold text-foreground">{analytics.materialsCount}</p>
                </div>
                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-xs text-muted-foreground">Material In</p>
                  <p className="text-xl font-semibold text-foreground">{analytics.materialsCount}</p>
                </div>
                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-xs text-muted-foreground">Material Out</p>
                  <p className="text-xl font-semibold text-foreground">{analytics.materialOutCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-accent" />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Rental Revenue</span>
                </div>
                <span className="font-semibold text-foreground">NPR {analytics.rentalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div className="flex items-center gap-2">
                  <Hammer className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Material Sales</span>
                </div>
                <span className="font-semibold text-foreground">NPR {analytics.materialSalesValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3 bg-muted/40">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-success" />
                  <span className="text-sm text-muted-foreground">Total In</span>
                </div>
                <span className="font-semibold text-foreground">NPR {analytics.totalRevenue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Request Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Equipment Requests</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded border border-border/50 p-2">Requested: {analytics.rentalRequestBreakdown.requested}</div>
                  <div className="rounded border border-border/50 p-2">Approved/Active: {analytics.rentalRequestBreakdown.approvedOrActive}</div>
                  <div className="rounded border border-border/50 p-2">Completed: {analytics.rentalRequestBreakdown.completed}</div>
                  <div className="rounded border border-border/50 p-2">Declined: {analytics.rentalRequestBreakdown.declined}</div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Material Requests</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded border border-border/50 p-2">Requested: {analytics.materialRequestBreakdown.requested}</div>
                  <div className="rounded border border-border/50 p-2">Approved: {analytics.materialRequestBreakdown.approved}</div>
                  <div className="rounded border border-border/50 p-2">Completed: {analytics.materialRequestBreakdown.completed}</div>
                  <div className="rounded border border-border/50 p-2">Declined: {analytics.materialRequestBreakdown.declined}</div>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 p-3 bg-muted/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-warning" />
                  <span className="text-sm text-muted-foreground">Current Pending</span>
                </div>
                <span className="font-semibold text-foreground">{analytics.pendingRequests}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserAnalytics;
