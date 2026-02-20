import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Phone, AlertTriangle, MapPin, HeartPulse, Siren, Bell, CheckCircle, Users } from "lucide-react";
import { guides } from "@/data/mockData";

const emergencyContacts = [
  { name: "Nepal Police", number: "100", icon: Siren, color: "text-destructive" },
  { name: "Tourist Police", number: "1144", icon: Shield, color: "text-primary" },
  { name: "Ambulance", number: "102", icon: HeartPulse, color: "text-accent" },
  { name: "Mountain Rescue", number: "+977-1-4261928", icon: MapPin, color: "text-emerald" },
];

const alerts = [
  { id: 1, type: "weather", title: "Heavy Rain Warning – Annapurna Region", time: "2 hours ago", severity: "high" },
  { id: 2, type: "crowd", title: "Over-tourism Alert – Pokhara Lakeside", time: "5 hours ago", severity: "medium" },
  { id: 3, type: "safety", title: "Trail Closed – Langtang Valley Section B", time: "1 day ago", severity: "high" },
];

const Safety = () => {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [notifications, setNotifications] = useState(alerts);

  const handleSOS = () => {
    setSosTriggered(true);
    setTimeout(() => setSosTriggered(false), 5000);
  };

  const dismissNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <p className="text-destructive font-semibold text-sm tracking-widest uppercase mb-3 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" /> Safety Center
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Stay <span className="text-primary">Safe</span> in Nepal
          </h1>
          <p className="text-muted-foreground mt-3">Emergency contacts, SOS alerts, and real-time safety notifications.</p>
        </div>

        {/* SOS Button */}
        <div className="flex justify-center mb-12">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button variant="sos" size="xl" className="w-48 h-48 rounded-full text-2xl flex-col gap-2" onClick={handleSOS}>
              <Siren className="w-10 h-10" />
              SOS
            </Button>
          </motion.div>
        </div>

        <AnimatePresence>
          {sosTriggered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8 p-6 rounded-2xl bg-destructive/10 border-2 border-destructive/30 text-center"
            >
              <CheckCircle className="w-12 h-12 text-destructive mx-auto mb-3 animate-pulse" />
              <h3 className="font-display text-xl font-bold text-foreground">SOS Alert Sent!</h3>
              <p className="text-sm text-muted-foreground mt-2">Nearest guide, medical team, and police have been notified. Your GPS location has been shared.</p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">📍 Location shared</span>
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">🚑 ETA: 12 min</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emergency Contacts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {emergencyContacts.map((c) => (
            <div key={c.name} className="p-4 rounded-2xl bg-card border border-border text-center hover:shadow-card-hover transition-shadow">
              <c.icon className={`w-8 h-8 mx-auto mb-2 ${c.color}`} />
              <h3 className="font-semibold text-sm text-foreground">{c.name}</h3>
              <a href={`tel:${c.number}`} className="text-primary text-sm font-bold mt-1 block">{c.number}</a>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent" /> Active Alerts
        </h2>
        <div className="space-y-3 mb-12">
          {notifications.map((a) => (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-start gap-4 p-4 rounded-xl border ${
                a.severity === "high" ? "bg-destructive/5 border-destructive/20" : "bg-accent/5 border-accent/20"
              }`}
            >
              <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${a.severity === "high" ? "text-destructive" : "text-accent"}`} />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-foreground">{a.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
              </div>
              <button onClick={() => dismissNotification(a.id)} className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
            </motion.div>
          ))}
          {notifications.length === 0 && (
            <div className="p-8 text-center text-muted-foreground bg-muted/50 rounded-xl">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
              No active alerts. All clear!
            </div>
          )}
        </div>

        {/* Nearby Guides */}
        <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Nearby Guides
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {guides.map((g) => (
            <div key={g.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                {g.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground text-sm">{g.name}</h4>
                <p className="text-xs text-muted-foreground">{g.speciality}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Phone className="w-3.5 h-3.5" /></Button>
                <Button variant="default" size="sm">Chat</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Safety;
