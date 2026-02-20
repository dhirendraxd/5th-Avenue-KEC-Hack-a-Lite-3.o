import { Shield, Star, Users, Leaf } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "850+",
    label: "Verified Businesses",
    description: "Trusted partners across industries",
  },
  {
    icon: Star,
    value: "4.8",
    label: "Average Rating",
    description: "Based on 3,000+ reviews",
  },
  {
    icon: Shield,
    value: "NPR 5M+",
    label: "Insurance Coverage",
    description: "Comprehensive protection on all rentals",
  },
  {
    icon: Leaf,
    value: "12,000",
    label: "Tons CO₂ Saved",
    description: "Through shared equipment usage",
  },
];

const TrustSection = () => {
  return (
    <section className="py-28 lg:py-36 bg-background border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 lg:mb-20 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Trusted by Business Operators
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Verified users, protected rentals, and proven platform reliability.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group flex flex-col items-center p-8 text-center rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-sm hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 border border-primary/10 transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
                <stat.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="font-medium text-foreground text-sm mb-2">{stat.label}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
