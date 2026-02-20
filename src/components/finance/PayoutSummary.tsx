import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  CreditCard,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Building2,
} from "lucide-react";

interface PayoutSummaryProps {
  totalEarnings: number;
  thisMonthEarnings: number;
  pendingPayouts: number;
  averageRentalValue: number;
}

const PayoutSummary = ({
  totalEarnings,
  thisMonthEarnings,
  pendingPayouts,
  averageRentalValue,
}: PayoutSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Payout Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main balance */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Available Balance</span>
            <Badge variant="outline" className="bg-success/10 text-success">
              Ready
            </Badge>
          </div>
          <p className="text-3xl font-bold text-foreground">NPR {pendingPayouts.toLocaleString()}</p>
          <Button className="w-full mt-3 gap-2" size="sm">
            <ArrowUpRight className="h-4 w-4" />
            Request Payout
          </Button>
        </div>

        <Separator />

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Total Earnings</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              NPR {totalEarnings.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">This Month</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              NPR {thisMonthEarnings.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Avg. Rental Value</span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            NPR {averageRentalValue.toLocaleString()}
          </p>
        </div>

        <Separator />

        {/* Payout method */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Bank Account</p>
              <p className="text-xs text-muted-foreground">****4521 • Chase</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            Change
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayoutSummary;
