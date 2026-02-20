import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import RoleSwitcher from "@/components/dashboard/RoleSwitcher";
import EarningsChart from "@/components/finance/EarningsChart";
import TransactionHistory from "@/components/finance/TransactionHistory";
import PayoutSummary from "@/components/finance/PayoutSummary";
import UsageAnalytics from "@/components/analytics/UsageAnalytics";
import {
  EquipmentAnalytics,
  LocationAnalytics,
  MonthlyEarnings,
  Transaction,
} from "@/lib/financeData";
import { subscribeFirebaseEquipment } from "@/lib/firebase/equipment";
import { subscribeFirebaseRentals } from "@/lib/firebase/rentals";
import { Equipment, RentalRequest } from "@/lib/mockData";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  FileText,
  CreditCard,
  Activity,
} from "lucide-react";
import { format, startOfMonth, subMonths } from "date-fns";

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, hasPermission } = useAuth();
  const [rentals, setRentals] = useState<RentalRequest[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  const canViewFinance = hasPermission("view_finance");
  const canViewOperations = hasPermission("view_operations");

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const unsubscribeRentals = subscribeFirebaseRentals(
      (data) => {
        setRentals(data);
      },
      () => undefined
    );

    const unsubscribeEquipment = subscribeFirebaseEquipment(
      (data) => {
        setEquipment(data);
      },
      () => undefined
    );

    return () => {
      unsubscribeRentals();
      unsubscribeEquipment();
    };
  }, [isAuthenticated, user]);

  const ownerRentals = useMemo(() => {
    if (!user) return [];
    return rentals.filter(
      (rental) =>
        rental.equipment.owner.id === user.id ||
        rental.equipment.owner.name === user.name
    );
  }, [rentals, user]);

  const ownerEquipment = useMemo(() => {
    if (!user) return [];
    return equipment.filter(
      (item) => item.owner.id === user.id || item.owner.name === user.name
    );
  }, [equipment, user]);

  const getRentalRevenue = (rental: RentalRequest) => {
    if (typeof rental.rentalFee === "number") return rental.rentalFee;
    if (typeof rental.totalPrice === "number" && typeof rental.serviceFee === "number") {
      return Math.max(0, rental.totalPrice - rental.serviceFee);
    }
    return typeof rental.totalPrice === "number" ? rental.totalPrice : 0;
  };

  const getRentalServiceFee = (rental: RentalRequest) =>
    typeof rental.serviceFee === "number" ? rental.serviceFee : 0;

  const isRealizedRental = (rental: RentalRequest) =>
    rental.status === "approved" ||
    rental.status === "active" ||
    rental.status === "completed";

  const isPendingRental = (rental: RentalRequest) =>
    rental.status === "requested" || rental.status === "extension_requested";

  const financeSummary = useMemo(() => {
    const realizedRentals = ownerRentals.filter(isRealizedRental);
    const pendingRentals = ownerRentals.filter(isPendingRental);

    const totalEarnings = realizedRentals.reduce(
      (sum, rental) => sum + getRentalRevenue(rental),
      0
    );
    const thisMonthEarnings = realizedRentals
      .filter((rental) => {
        const monthStart = startOfMonth(new Date());
        return rental.startDate >= monthStart;
      })
      .reduce((sum, rental) => sum + getRentalRevenue(rental), 0);

    const pendingPayouts = pendingRentals.reduce(
      (sum, rental) => sum + getRentalRevenue(rental),
      0
    );

    const totalFeesPaid = realizedRentals.reduce(
      (sum, rental) => sum + getRentalServiceFee(rental),
      0
    );

    const totalGrossRevenue = realizedRentals.reduce(
      (sum, rental) => sum + (rental.totalPrice ?? getRentalRevenue(rental)),
      0
    );

    const platformFeeRate =
      totalGrossRevenue > 0 ? totalFeesPaid / totalGrossRevenue : 0;

    const averageRentalValue = realizedRentals.length
      ? realizedRentals.reduce(
          (sum, rental) => sum + (rental.totalPrice ?? getRentalRevenue(rental)),
          0
        ) / realizedRentals.length
      : 0;

    return {
      totalEarnings,
      thisMonthEarnings,
      pendingPayouts,
      averageRentalValue,
      totalFeesPaid,
      platformFeeRate,
      totalRentals: ownerRentals.length,
    };
  }, [ownerRentals]);

  const monthlyEarnings: MonthlyEarnings[] = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) =>
      startOfMonth(subMonths(new Date(), 5 - index))
    );

    return months.map((monthStart) => {
      const monthRentals = ownerRentals
        .filter(isRealizedRental)
        .filter((rental) =>
          format(rental.startDate, "yyyy-MM") === format(monthStart, "yyyy-MM")
        );
      const revenue = monthRentals.reduce(
        (sum, rental) => sum + (rental.totalPrice ?? getRentalRevenue(rental)),
        0
      );
      const fees = monthRentals.reduce(
        (sum, rental) => sum + getRentalServiceFee(rental),
        0
      );
      const net = monthRentals.reduce(
        (sum, rental) => sum + getRentalRevenue(rental),
        0
      );

      return {
        month: format(monthStart, "MMM"),
        revenue,
        payouts: net,
        fees,
        net,
      };
    });
  }, [ownerRentals]);

  const revenueGrowth = useMemo(() => {
    if (monthlyEarnings.length < 2) return null;
    const last = monthlyEarnings[monthlyEarnings.length - 1];
    const prev = monthlyEarnings[monthlyEarnings.length - 2];
    if (prev.revenue === 0) return null;
    return ((last.revenue - prev.revenue) / prev.revenue) * 100;
  }, [monthlyEarnings]);

  const transactions: Transaction[] = useMemo(() => {
    const items: Transaction[] = [];
    ownerRentals
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

    return items
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 30);
  }, [ownerRentals]);

  const equipmentAnalytics: EquipmentAnalytics[] = useMemo(() => {
    const rentalsByEquipment = ownerRentals.reduce(
      (map, rental) => {
        const key = rental.equipment.id;
        const current = map.get(key) ?? [];
        current.push(rental);
        map.set(key, current);
        return map;
      },
      new Map<string, RentalRequest[]>()
    );

    return ownerEquipment.map((item) => {
      const itemRentals = rentalsByEquipment.get(item.id) ?? [];
      const totalRentals = itemRentals.length;
      const totalRevenue = itemRentals.reduce(
        (sum, rental) => sum + getRentalRevenue(rental),
        0
      );
      const daysRented = itemRentals.reduce(
        (sum, rental) => sum + rental.totalDays,
        0
      );
      const daysIdle = Math.max(0, 30 - daysRented);
      const utilizationRate = daysRented + daysIdle > 0
        ? (daysRented / (daysRented + daysIdle)) * 100
        : 0;
      const averageRentalDuration = totalRentals > 0
        ? daysRented / totalRentals
        : 0;
      const lastRented = itemRentals.length
        ? itemRentals.reduce(
            (latest, rental) =>
              rental.endDate > latest ? rental.endDate : latest,
            itemRentals[0].endDate
          )
        : null;

      return {
        equipmentId: item.id,
        equipmentName: item.name,
        locationId: item.locationId || item.owner.id,
        locationName: item.locationName || item.owner.location,
        totalRentals,
        totalRevenue,
        daysRented,
        daysIdle,
        utilizationRate,
        averageRentalDuration,
        lastRented,
      };
    });
  }, [ownerEquipment, ownerRentals]);

  const locationAnalytics: LocationAnalytics[] = useMemo(() => {
    const equipmentByLocation = ownerEquipment.reduce(
      (map, item) => {
        const key = item.locationId || item.owner.id;
        const current = map.get(key) ?? [];
        current.push(item);
        map.set(key, current);
        return map;
      },
      new Map<string, Equipment[]>()
    );

    return Array.from(equipmentByLocation.entries()).map(([locationId, items]) => {
      const totalRentals = equipmentAnalytics
        .filter((e) => e.locationId === locationId)
        .reduce((sum, e) => sum + e.totalRentals, 0);
      const totalRevenue = equipmentAnalytics
        .filter((e) => e.locationId === locationId)
        .reduce((sum, e) => sum + e.totalRevenue, 0);
      const averageUtilization = items.length
        ? equipmentAnalytics
            .filter((e) => e.locationId === locationId)
            .reduce((sum, e) => sum + e.utilizationRate, 0) / items.length
        : 0;
      const topEquipment = equipmentAnalytics
        .filter((e) => e.locationId === locationId)
        .sort((a, b) => b.totalRentals - a.totalRentals)[0]?.equipmentName ||
        "N/A";

      return {
        locationId,
        locationName: items[0]?.locationName || items[0]?.owner.location || "Location",
        equipmentCount: items.length,
        totalRentals,
        totalRevenue,
        averageUtilization,
        topEquipment,
      };
    });
  }, [ownerEquipment, equipmentAnalytics]);

  const stats = [
    {
      label: "Total Earnings",
      value: `NPR ${financeSummary.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: "text-success",
      change:
        revenueGrowth !== null
          ? `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`
          : undefined,
    },
    {
      label: "This Month",
      value: `NPR ${financeSummary.thisMonthEarnings.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-primary",
      change:
        revenueGrowth !== null
          ? `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`
          : undefined,
    },
    {
      label: "Pending Payouts",
      value: `NPR ${financeSummary.pendingPayouts.toLocaleString()}`,
      icon: CreditCard,
      color: "text-accent",
    },
    {
      label: "Total Rentals",
      value: financeSummary.totalRentals.toString(),
      icon: BarChart3,
      color: "text-foreground",
    },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-foreground">Finance Dashboard</h1>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {user?.role === "finance" ? "Finance Admin" : user?.role === "owner" ? "Owner" : "Operations"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Track earnings, payouts, and equipment performance analytics
            </p>
          </div>
          <div className="w-full md:w-auto">
            <RoleSwitcher />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-10 grid gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    {stat.change && (
                      <span className="text-xs text-success font-medium">{stat.change}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="earnings" className="space-y-8">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="earnings" className="gap-2" disabled={!canViewFinance}>
              <DollarSign className="h-4 w-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2" disabled={!canViewFinance}>
              <FileText className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2" disabled={!canViewOperations && !canViewFinance}>
              <Activity className="h-4 w-4" />
              Usage Analytics
            </TabsTrigger>
          </TabsList>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <div className="grid gap-8 lg:grid-cols-3">
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
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TransactionHistory transactions={transactions} />
              </div>
              <div className="space-y-6">
                <PayoutSummary
                  totalEarnings={financeSummary.totalEarnings}
                  thisMonthEarnings={financeSummary.thisMonthEarnings}
                  pendingPayouts={financeSummary.pendingPayouts}
                  averageRentalValue={financeSummary.averageRentalValue}
                />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Platform Fees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service Fee Rate</span>
                        <span className="font-semibold text-foreground">
                          {(financeSummary.platformFeeRate * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Fees Paid</span>
                        <span className="font-semibold text-foreground">
                          NPR {financeSummary.totalFeesPaid.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                        Platform fees cover insurance protection, payment processing, and support services.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <UsageAnalytics
              equipmentAnalytics={equipmentAnalytics}
              locationAnalytics={locationAnalytics}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FinanceDashboard;
