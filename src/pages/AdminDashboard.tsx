import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { touristFlowData, pois } from "@/data/mockData";
import { TrendingUp, Users, MapPin, AlertTriangle, DollarSign, BarChart3, Globe } from "lucide-react";

const regions = ["kathmandu", "pokhara", "everest", "chitwan"] as const;
const regionColors: Record<string, string> = {
  kathmandu: "#0D9488",
  pokhara: "#D97706",
  everest: "#0EA5E9",
  chitwan: "#16A34A",
};

const crowdDistribution = [
  { name: "Low", value: 4, color: "#16A34A" },
  { name: "Medium", value: 4, color: "#D97706" },
  { name: "High", value: 2, color: "#EF4444" },
];

const revenueData = [
  { month: "Jan", revenue: 120 },
  { month: "Feb", revenue: 150 },
  { month: "Mar", revenue: 220 },
  { month: "Apr", revenue: 280 },
  { month: "May", revenue: 200 },
  { month: "Jun", revenue: 90 },
  { month: "Jul", revenue: 70 },
  { month: "Aug", revenue: 80 },
  { month: "Sep", revenue: 180 },
  { month: "Oct", revenue: 350 },
  { month: "Nov", revenue: 300 },
  { month: "Dec", revenue: 160 },
];

const AdminDashboard = () => {
  const [activeRegions, setActiveRegions] = useState<Set<string>>(new Set(regions));

  const toggleRegion = (r: string) => {
    setActiveRegions((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
  };

  const stats = [
    { label: "Total Visitors (Oct)", value: "210K", icon: Users, change: "+12%", color: "text-primary" },
    { label: "Active POIs", value: pois.length.toString(), icon: MapPin, change: "+3", color: "text-accent" },
    { label: "Revenue (Oct)", value: "$3.5M", icon: DollarSign, change: "+18%", color: "text-emerald" },
    { label: "Over-Tourism Alerts", value: "3", icon: AlertTriangle, change: "-2", color: "text-destructive" },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 bg-muted/30">
      <div className="container">
        <div className="mb-8">
          <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Admin Dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Tourism Analytics</h1>
          <p className="text-muted-foreground mt-1">Real-time insights for tourism management across Nepal.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="p-5 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <span className={`text-xs font-semibold ${s.change.startsWith("+") ? "text-emerald" : "text-destructive"}`}>
                  {s.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Tourist Flow Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Tourist Flow Forecast</h2>
                <p className="text-xs text-muted-foreground">30-day predictions by region</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {regions.map((r) => (
                  <button
                    key={r}
                    onClick={() => toggleRegion(r)}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                      activeRegions.has(r) ? "text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                    style={activeRegions.has(r) ? { backgroundColor: regionColors[r] } : {}}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={touristFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,20%,90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215,16%,47%)" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(215,16%,47%)" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid hsl(210,20%,90%)", fontSize: 12 }}
                />
                {regions.map((r) =>
                  activeRegions.has(r) ? (
                    <Area
                      key={r}
                      type="monotone"
                      dataKey={r}
                      stroke={regionColors[r]}
                      fill={regionColors[r]}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  ) : null
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Crowd Distribution */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-display text-lg font-bold text-foreground mb-2">Crowd Density</h2>
            <p className="text-xs text-muted-foreground mb-4">Current POI distribution</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={crowdDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {crowdDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {crowdDistribution.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-xs text-muted-foreground">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald" /> Revenue Insights
              </h2>
              <p className="text-xs text-muted-foreground">Monthly tourism revenue (in thousands USD)</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,20%,90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215,16%,47%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215,16%,47%)" }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(210,20%,90%)", fontSize: 12 }} />
              <Bar dataKey="revenue" fill="hsl(168,76%,32%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Over-tourism alerts */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" /> Over-Tourism Alerts
          </h2>
          <div className="space-y-3">
            {[
              { region: "Pokhara Lakeside", level: "High", visitors: "62K", capacity: "45K" },
              { region: "Thamel, Kathmandu", level: "High", visitors: "88K", capacity: "70K" },
              { region: "Chitwan Safari Zone", level: "Medium", visitors: "24K", capacity: "20K" },
            ].map((a) => (
              <div key={a.region} className={`flex items-center gap-4 p-4 rounded-xl ${
                a.level === "High" ? "bg-destructive/5 border border-destructive/20" : "bg-accent/5 border border-accent/20"
              }`}>
                <Globe className={`w-5 h-5 ${a.level === "High" ? "text-destructive" : "text-accent"}`} />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-foreground">{a.region}</h4>
                  <p className="text-xs text-muted-foreground">{a.visitors} visitors / {a.capacity} capacity</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  a.level === "High" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
                }`}>
                  {a.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
