import { useEffect } from "react";
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
  mockTransactions,
  mockMonthlyEarnings,
  mockEquipmentAnalytics,
  mockLocationAnalytics,
  financeSummary,
} from "@/lib/financeData";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  FileText,
  CreditCard,
  Activity,
} from "lucide-react";

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, hasPermission } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  const canViewFinance = hasPermission("view_finance");
  const canViewOperations = hasPermission("view_operations");

  const stats = [
    {
      label: "Total Earnings",
      value: `NPR ${financeSummary.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: "text-success",
      change: "+12.5%",
    },
    {
      label: "This Month",
      value: `NPR ${financeSummary.thisMonthEarnings.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-primary",
      change: "+8.2%",
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
                <EarningsChart data={mockMonthlyEarnings} chartType="bar" />
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
                <TransactionHistory transactions={mockTransactions} />
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
                          NPR {(financeSummary.totalEarnings * financeSummary.platformFeeRate).toLocaleString()}
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
              equipmentAnalytics={mockEquipmentAnalytics}
              locationAnalytics={mockLocationAnalytics}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FinanceDashboard;
