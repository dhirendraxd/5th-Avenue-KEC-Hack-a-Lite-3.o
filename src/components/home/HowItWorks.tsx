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
    <section className="py-28 lg:py-36 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20 lg:mb-28 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            How It Works
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            A clear workflow built for professional rental operations.
          </p>
        </div>

        <div className="grid gap-12 md:gap-10 md:grid-cols-2 lg:grid-cols-4">
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
