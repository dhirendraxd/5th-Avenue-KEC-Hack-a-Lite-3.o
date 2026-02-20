import { Search, Calendar, CheckCircle, Handshake } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover Equipment",
    description: "Browse verified equipment by category, availability, and price.",
  },
  {
    icon: Calendar,
    title: "Select Dates",
    description: "Choose your rental window and confirm clear pricing.",
  },
  {
    icon: Handshake,
    title: "Request & Confirm",
    description: "Submit your request and receive owner approval.",
  },
  {
    icon: CheckCircle,
    title: "Pickup & Use",
    description: "Complete pickup, operate safely, and return on schedule.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 lg:py-28 bg-background border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 lg:mb-20 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            How It Works
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Simple, transparent rental process from search to return.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector Line - only on large screens */}
              {index < steps.length - 1 && (
                <div className="absolute left-[calc(50%+3rem)] top-12 hidden h-px w-[calc(100%+2rem)] bg-gradient-to-r from-border/60 to-border/20 lg:block" />
              )}
              
              <div className="relative flex flex-col items-center text-center">
                {/* Step Number */}
                <div className="mb-4 text-sm font-semibold text-muted-foreground/60">
                  STEP {index + 1}
                </div>
                
                {/* Icon Circle */}
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 border border-primary/10 transition-all duration-300 group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:scale-105">
                  <step.icon className="h-9 w-9 text-primary" strokeWidth={1.5} />
                </div>
                
                {/* Title */}
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
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
