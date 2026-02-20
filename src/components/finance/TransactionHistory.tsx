import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Transaction } from "@/lib/financeData";
import { format } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Loader2,
  Shield,
  ShieldCheck,
} from "lucide-react";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const transactionIcons = {
  rental_income: ArrowDownLeft,
  payout: ArrowUpRight,
  service_fee: ArrowUpRight,
  deposit_hold: Shield,
  deposit_release: ShieldCheck,
};

const transactionColors = {
  rental_income: "text-success",
  payout: "text-primary",
  service_fee: "text-muted-foreground",
  deposit_hold: "text-warning",
  deposit_release: "text-success",
};

const statusIcons = {
  completed: CheckCircle,
  pending: Clock,
  processing: Loader2,
};

const statusColors = {
  completed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  processing: "bg-primary/10 text-primary",
};

const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const Icon = transactionIcons[transaction.type];
              const StatusIcon = statusIcons[transaction.status];
              const isPositive = transaction.amount > 0 && transaction.type !== 'service_fee';

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-muted ${transactionColors[transaction.type]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(transaction.date, "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-semibold ${isPositive ? 'text-success' : 'text-foreground'}`}>
                        {isPositive ? '+' : ''}{transaction.type === 'service_fee' ? '-' : ''}NPR {Math.abs(transaction.amount).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-xs ${statusColors[transaction.status]}`}>
                      <StatusIcon className={`h-3 w-3 mr-1 ${transaction.status === 'processing' ? 'animate-spin' : ''}`} />
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
