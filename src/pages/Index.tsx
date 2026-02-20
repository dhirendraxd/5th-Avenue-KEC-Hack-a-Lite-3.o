import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Map, Brain, Wallet, Gamepad2, Shield, Users, ArrowRight, Star, TrendingUp, Mountain } from "lucide-react";
import heroImg from "@/assets/hero-nepal.jpg";
import templeImg from "@/assets/temple-nepal.jpg";
import pokharaImg from "@/assets/pokhara-nepal.jpg";
import trekkingImg from "@/assets/trekking-nepal.jpg";
import { badges } from "@/data/mockData";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const features = [
  { icon: Brain, title: "AI Flow Prediction", desc: "30-day tourist arrival forecasts with crowd density heatmaps.", link: "/admin", color: "bg-primary/10 text-primary" },
  { icon: Map, title: "Interactive Map", desc: "Explore mountains, temples, treks, homestays with real-time filters.", link: "/map", color: "bg-accent/10 text-accent" },
  { icon: Wallet, title: "Budget Planner", desc: "Smart itineraries tailored to your budget with local booking.", link: "/budget", color: "bg-emerald/10 text-emerald" },
  { icon: Gamepad2, title: "Cultural Gamification", desc: "Earn badges, unlock stories, and explore Nepal's heritage.", link: "/", color: "bg-gold/10 text-gold" },
  { icon: Shield, title: "Safety & SOS", desc: "Emergency alerts, guide contacts, and real-time safety info.", link: "/safety", color: "bg-destructive/10 text-destructive" },
  { icon: Users, title: "Local Guides", desc: "Verified guides, porters, and homestay hosts at your fingertips.", link: "/map", color: "bg-primary/10 text-primary" },
];

const destinations = [
  { img: templeImg, name: "Kathmandu Valley", tag: "Cultural Heritage", rating: 4.8 },
  { img: pokharaImg, name: "Pokhara", tag: "Lakes & Mountains", rating: 4.9 },
  { img: trekkingImg, name: "Annapurna Region", tag: "Trekking", rating: 4.9 },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="min-h-screen flex items-center bg-background pt-16 overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-primary font-semibold text-sm tracking-widest uppercase mb-6 flex items-center gap-2"
              >
                <Star className="w-4 h-4" /> best experience
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-[4.2rem] font-display font-bold text-foreground leading-[1.1] mb-6"
              >
                Your best trip{" "}
                <br className="hidden md:block" />
                with{" "}
                <span className="relative inline-block text-primary">
                  amazing
                  <svg className="absolute -inset-x-3 -inset-y-2 w-[calc(100%+24px)] h-[calc(100%+16px)]" viewBox="0 0 220 80" fill="none">
                    <ellipse cx="110" cy="40" rx="105" ry="36" stroke="hsl(168,76%,32%)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 6" />
                  </svg>
                </span>
                <br />
                travel agency
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base text-muted-foreground mb-8 max-w-md leading-relaxed"
              >
                Explore and book in an awesome place find, explore and book the best trip find, explore more.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4 mb-10"
              >
                <Button variant="hero" size="lg" asChild>
                  <Link to="/map">Explore Map <ArrowRight className="w-5 h-5" /></Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/budget">Plan Trip <ArrowRight className="w-5 h-5" /></Link>
                </Button>
              </motion.div>

              {/* Destination pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4 mb-6"
              >
                {[
                  { flag: "🇳🇵", name: "Nepal" },
                  { flag: "🏔️", name: "Everest" },
                  { flag: "🛕", name: "Temples" },
                  { flag: "🌊", name: "Pokhara" },
                ].map((d) => (
                  <div key={d.name} className="flex flex-col items-center gap-1.5">
                    <div className="w-14 h-14 rounded-xl border border-border bg-card flex items-center justify-center text-2xl hover:shadow-card-hover transition-shadow cursor-pointer">
                      {d.flag}
                    </div>
                    <span className="text-xs text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-primary font-medium flex items-center gap-1.5 cursor-pointer hover:underline"
              >
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                Have any question?
              </motion.p>
            </div>

            {/* Right image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <img
                  src={heroImg}
                  alt="Nepal Himalayas"
                  className="w-full h-[520px] object-cover rounded-[2rem] shadow-2xl"
                />
                {/* Decorative paper plane */}
                <div className="absolute -left-10 top-1/2 -translate-y-1/2">
                  <svg width="60" height="40" viewBox="0 0 60 40" fill="none" className="text-muted-foreground/40">
                    <path d="M5 35 C15 25 25 15 35 20 C45 25 50 15 55 5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />
                    <polygon points="55,5 50,12 58,10" fill="currentColor" />
                  </svg>
                </div>
                {/* Circular badge */}
                <div className="absolute -bottom-6 -right-4 w-24 h-24 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold text-center leading-tight rotate-[-15deg] shadow-lg">
                  Learn more<br />about<br />Nepal ✦
                </div>
              </div>
              {/* Stats row */}
              <div className="flex gap-6 mt-10 justify-center">
                {[
                  { label: "Destinations", value: "150+" },
                  { label: "Active Guides", value: "500+" },
                  { label: "Happy Travelers", value: "25K+" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-xl font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground">
            ↓
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              Everything You Need to{" "}
              <span className="text-primary">Explore Nepal</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Link
                  to={f.link}
                  className="block p-6 rounded-2xl bg-card border border-border hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                  <span className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-24 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Destinations</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold">Top Places to Visit</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {destinations.map((d, i) => (
              <motion.div
                key={d.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
              >
                <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium backdrop-blur-sm mb-2">{d.tag}</span>
                  <h3 className="font-display text-2xl font-bold text-background">{d.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    <span className="text-sm text-background/80">{d.rating}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3 flex items-center justify-center gap-2">
              <Gamepad2 className="w-4 h-4" /> Gamification
            </p>
            <h2 className="text-4xl font-display font-bold">Earn Badges & Unlock Rewards</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Explore Nepal and collect cultural badges. Complete challenges to unlock local music, stories, and mini-quizzes.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`flex flex-col items-center p-5 rounded-2xl border transition-all ${
                  b.unlocked
                    ? "bg-primary/5 border-primary/20 shadow-teal"
                    : "bg-muted/50 border-border opacity-60"
                }`}
              >
                <span className="text-3xl mb-2">{b.icon}</span>
                <span className="font-semibold text-sm text-center text-foreground">{b.name}</span>
                <span className="text-xs text-muted-foreground text-center mt-1">{b.description}</span>
                {b.unlocked && <span className="text-xs text-primary font-semibold mt-2">✓ Unlocked</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-teal text-primary-foreground">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Mountain className="w-12 h-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Ready to Explore Nepal?</h2>
            <p className="text-lg opacity-80 max-w-lg mx-auto mb-8">
              Start planning your perfect trip with AI-powered insights and personalized recommendations.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="accent" size="xl" asChild>
                <Link to="/budget">Start Planning <ArrowRight className="w-5 h-5" /></Link>
              </Button>
              <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link to="/admin">View Dashboard</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
