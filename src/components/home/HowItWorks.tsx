import { Search, Calendar, CheckCircle, Handshake } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover Equipment",
    description: "Browse available equipment from verified businesses in your area. Filter by category, price, and availability.",
  },
  {
    icon: Calendar,
    title: "Select Dates",
    description: "Choose your rental period using our availability calendar. See transparent pricing with no hidden fees.",
  },
  {
    icon: Handshake,
    title: "Request & Confirm",
    description: "Submit your rental request. Equipment owners review and approve within 24 hours.",
  },
  {
    icon: CheckCircle,
    title: "Pickup & Use",
    description: "Coordinate pickup, use the equipment for your project, and return it when complete.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 lg:mb-24 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            How It Works
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Renting equipment from local businesses is simple, secure, and sustainable.
          </p>
        </div>

        <div className="grid gap-10 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-border lg:block" />
              )}
              
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute right-1/3 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground lg:right-auto lg:left-1/2 lg:-translate-x-1/2">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
