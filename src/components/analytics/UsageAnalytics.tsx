import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { EquipmentAnalytics, LocationAnalytics } from "@/lib/financeData";
import { mockLocations } from "@/lib/mockData";
import { useState } from "react";
import {
  Activity,
  Clock,
  TrendingUp,
  Package,
  MapPin,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

interface UsageAnalyticsProps {
  equipmentAnalytics: EquipmentAnalytics[];
  locationAnalytics: LocationAnalytics[];
}

const chartConfig = {
  utilization: {
    label: "Utilization Rate",
    color: "hsl(var(--primary))",
  },
};

const UsageAnalytics = ({
  equipmentAnalytics,
  locationAnalytics,
}: UsageAnalyticsProps) => {
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const filteredEquipment =
    selectedLocation === "all"
      ? equipmentAnalytics
      : equipmentAnalytics.filter((e) => e.locationId === selectedLocation);

  const utilizationData = filteredEquipment.map((e) => ({
    name: e.equipmentName.length > 15 
      ? e.equipmentName.substring(0, 15) + "..." 
      : e.equipmentName,
    fullName: e.equipmentName,
    utilization: e.utilizationRate,
    idle: 100 - e.utilizationRate,
  }));

  const averageUtilization =
    filteredEquipment.reduce((sum, e) => sum + e.utilizationRate, 0) /
    filteredEquipment.length;

  const totalIdleDays = filteredEquipment.reduce((sum, e) => sum + e.daysIdle, 0);
  const totalRentals = filteredEquipment.reduce((sum, e) => sum + e.totalRentals, 0);

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return "text-success";
    if (rate >= 50) return "text-warning";
    return "text-destructive";
  };

  const getUtilizationBadge = (rate: number) => {
    if (rate >= 80) return { label: "High", variant: "default" as const, className: "bg-success/10 text-success" };
    if (rate >= 50) return { label: "Medium", variant: "outline" as const, className: "bg-warning/10 text-warning" };
    return { label: "Low", variant: "outline" as const, className: "bg-destructive/10 text-destructive" };
  };

  return (
    <div className="space-y-6">
      {/* Location Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Usage Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Track rental frequency, idle time, and utilization rates
          </p>
        </div>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-[200px]">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {mockLocations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {averageUtilization.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Utilization</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalIdleDays}</p>
                <p className="text-sm text-muted-foreground">Total Idle Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalRentals}</p>
                <p className="text-sm text-muted-foreground">Total Rentals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Equipment Utilization Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart
              data={utilizationData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={120}
                className="text-xs"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) =>
                      `${item.payload.fullName}: ${value}%`
                    }
                  />
                }
              />
              <Bar dataKey="utilization" radius={[0, 4, 4, 0]}>
                {utilizationData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.utilization >= 80
                        ? "hsl(var(--success))"
                        : entry.utilization >= 50
                        ? "hsl(var(--warning))"
                        : "hsl(var(--destructive))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Equipment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Equipment Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEquipment.map((equipment) => {
              const badge = getUtilizationBadge(equipment.utilizationRate);
              return (
                <div
                  key={equipment.equipmentId}
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">
                        {equipment.equipmentName}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {equipment.locationName}
                      </p>
                    </div>
                    <Badge variant={badge.variant} className={badge.className}>
                      {badge.label}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">
                        Utilization Rate
                      </span>
                      <span
                        className={`text-sm font-semibold ${getUtilizationColor(
                          equipment.utilizationRate
                        )}`}
                      >
                        {equipment.utilizationRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={equipment.utilizationRate}
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Rentals</p>
                      <p className="font-semibold text-foreground">
                        {equipment.totalRentals}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Days Rented</p>
                      <p className="font-semibold text-foreground">
                        {equipment.daysRented}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Days Idle</p>
                      <p className="font-semibold text-foreground">
                        {equipment.daysIdle}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Rented</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {equipment.lastRented
                          ? format(equipment.lastRented, "MMM d")
                          : "Never"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Location Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            Location Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {locationAnalytics.map((location) => {
              const badge = getUtilizationBadge(location.averageUtilization);
              return (
                <div
                  key={location.locationId}
                  className="p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{location.locationName}</h4>
                    <Badge variant={badge.variant} className={badge.className}>
                      {location.averageUtilization.toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Equipment</span>
                      <span className="text-foreground">{location.equipmentCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Rentals</span>
                      <span className="text-foreground">{location.totalRentals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="text-foreground">${location.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Top Asset</span>
                      <span className="text-foreground text-xs truncate max-w-[120px]">
                        {location.topEquipment}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageAnalytics;
