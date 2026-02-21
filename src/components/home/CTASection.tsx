import { Link } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-28 lg:py-36 bg-background border-t border-border/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-10 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-pulse-gentle">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-5 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl animate-fade-in">
            Start Listing on Upayog
          </h2>
          <p className="mb-12 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto animate-fade-in [animation-delay:100ms]">
            Publish professional listings, manage requests, and monetize idle assets with confidence.
          </p>
          <div className="flex flex-col justify-center gap-8 sm:flex-row animate-fade-in [animation-delay:200ms]">
            <Link
              to="/dashboard"
              className="group relative inline-flex items-center justify-center gap-2 text-base font-medium text-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-primary hover:after:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:text-lg"
            >
              Start Listing
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/browse"
              className="relative text-base text-muted-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-foreground hover:after:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:text-lg"
            >
              Browse Equipment
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
