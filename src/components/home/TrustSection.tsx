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
    value: "$5M+",
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
    <section className="py-24 lg:py-32 bg-card border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 lg:mb-20 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Trusted by Growing Businesses
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Join a community of forward-thinking companies reducing costs and environmental impact.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-xl bg-background p-8 text-center card-shadow animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="mt-1 font-medium text-foreground">{stat.label}</div>
              <div className="mt-2 text-sm text-muted-foreground">
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
