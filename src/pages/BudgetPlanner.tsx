import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wallet, MapPin, Bed, UtensilsCrossed, Bus, ArrowRight, Check, CreditCard } from "lucide-react";
import { budgetOptions, pois, guides } from "@/data/mockData";

type BudgetTier = "low" | "medium" | "high";

const itineraries: Record<BudgetTier, { day: number; activity: string; cost: number; location: string }[]> = {
  low: [
    { day: 1, activity: "Arrive Kathmandu, explore Thamel", cost: 1500, location: "Kathmandu" },
    { day: 2, activity: "Pashupatinath & Boudhanath Stupa", cost: 800, location: "Kathmandu" },
    { day: 3, activity: "Bus to Pokhara", cost: 1200, location: "Pokhara" },
    { day: 4, activity: "Phewa Lake & World Peace Pagoda", cost: 600, location: "Pokhara" },
    { day: 5, activity: "Sarangkot Sunrise & Return", cost: 900, location: "Pokhara" },
  ],
  medium: [
    { day: 1, activity: "Arrive Kathmandu, city tour with guide", cost: 4500, location: "Kathmandu" },
    { day: 2, activity: "Bhaktapur & Patan Durbar Square", cost: 3500, location: "Kathmandu" },
    { day: 3, activity: "Flight to Pokhara, lakeside hotel", cost: 8000, location: "Pokhara" },
    { day: 4, activity: "Annapurna short trek (Day 1)", cost: 5500, location: "Annapurna" },
    { day: 5, activity: "Trek Day 2 & return to Pokhara", cost: 5500, location: "Annapurna" },
  ],
  high: [
    { day: 1, activity: "Arrive, luxury hotel & spa", cost: 18000, location: "Kathmandu" },
    { day: 2, activity: "Private heritage tour with historian", cost: 12000, location: "Kathmandu" },
    { day: 3, activity: "Helicopter to Everest Base Camp", cost: 45000, location: "Everest" },
    { day: 4, activity: "Private flight to Pokhara, resort", cost: 22000, location: "Pokhara" },
    { day: 5, activity: "Paragliding & fine dining", cost: 15000, location: "Pokhara" },
  ],
};

const BudgetPlanner = () => {
  const [totalBudget, setTotalBudget] = useState(30000);
  const [days, setDays] = useState(5);
  const [selectedTier, setSelectedTier] = useState<BudgetTier | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const dailyBudget = Math.round(totalBudget / days);
  const suggestedTier: BudgetTier = dailyBudget < 3000 ? "low" : dailyBudget < 10000 ? "medium" : "high";
  const activeTier = selectedTier || suggestedTier;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-3 flex items-center justify-center gap-2">
            <Wallet className="w-4 h-4" /> Budget Planner
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Plan Your <span className="text-primary">Perfect Trip</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Enter your budget and we'll suggest the best itinerary, stays, and experiences.</p>
        </div>

        {/* Budget Input */}
        <div className="bg-card rounded-2xl border border-border p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Total Budget (NPR)</label>
              <input
                type="range"
                min={5000}
                max={200000}
                step={1000}
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>₨5,000</span>
                <span className="text-xl font-bold text-foreground">₨{totalBudget.toLocaleString()}</span>
                <span>₨200,000</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Duration (Days)</label>
              <div className="flex gap-2">
                {[3, 5, 7, 10, 14].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      days === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Daily budget: <span className="font-semibold text-foreground">₨{dailyBudget.toLocaleString()}</span> / day
              </p>
            </div>
          </div>
        </div>

        {/* Tier Selection */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {(Object.keys(budgetOptions) as BudgetTier[]).map((tier) => {
            const opt = budgetOptions[tier];
            const isActive = activeTier === tier;
            const isSuggested = suggestedTier === tier;
            return (
              <motion.button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                whileHover={{ scale: 1.02 }}
                className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-teal"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                {isSuggested && (
                  <span className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Recommended
                  </span>
                )}
                <h3 className="font-display text-lg font-bold text-foreground mb-1">{opt.label}</h3>
                <p className="text-sm text-muted-foreground mb-3">~₨{opt.daily.toLocaleString()}/day</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><Bed className="w-3.5 h-3.5 text-primary" />{opt.stays}</div>
                  <div className="flex items-center gap-2"><UtensilsCrossed className="w-3.5 h-3.5 text-accent" />{opt.food}</div>
                  <div className="flex items-center gap-2"><Bus className="w-3.5 h-3.5 text-emerald" />{opt.transport}</div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Itinerary */}
        <div className="bg-card rounded-2xl border border-border p-8 mb-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Your {budgetOptions[activeTier].label} Itinerary</h2>
          <div className="space-y-4">
            {itineraries[activeTier].map((item) => (
              <div key={item.day} className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  D{item.day}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-sm">{item.activity}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{item.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-foreground">₨{item.cost.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <span className="font-display text-lg font-bold text-foreground">Total Estimated Cost</span>
            <span className="text-2xl font-bold text-primary">
              ₨{itineraries[activeTier].reduce((s, i) => s + i.cost, 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Booking */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="hero" size="xl" className="flex-1" onClick={() => setShowPayment(true)}>
            <CreditCard className="w-5 h-5" /> Book via eSewa
          </Button>
          <Button variant="accent" size="xl" className="flex-1" onClick={() => setShowPayment(true)}>
            <CreditCard className="w-5 h-5" /> Book via Khalti
          </Button>
        </div>

        {/* Payment Mock */}
        {showPayment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center"
          >
            <Check className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-foreground">Booking Simulated!</h3>
            <p className="text-sm text-muted-foreground mt-2">This is a prototype. In production, you'd be redirected to eSewa/Khalti payment gateway.</p>
            <Button variant="ghost" className="mt-4" onClick={() => setShowPayment(false)}>Close</Button>
          </motion.div>
        )}

        {/* Recommended Guide */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Recommended Guides</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {guides.slice(0, 2).map((g) => (
              <div key={g.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                  {g.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-sm">{g.name}</h4>
                  <p className="text-xs text-muted-foreground">{g.speciality} • {g.languages.join(", ")}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-gold text-sm font-semibold">★ {g.rating}</div>
                  {g.verified && <span className="text-xs text-primary">✓ Verified</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;
