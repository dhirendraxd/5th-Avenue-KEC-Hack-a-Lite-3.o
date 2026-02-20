import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 lg:py-32 bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/10">
            <Package className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="mb-5 text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
            Start Listing on 5th Avenue
          </h2>
          <p className="mb-10 text-lg text-primary-foreground/80 leading-relaxed max-w-2xl mx-auto">
            Publish professional listings, manage requests, and monetize idle assets with confidence.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="w-full gap-2 px-8 sm:w-auto">
                Start Listing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/browse">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full border-primary-foreground/20 bg-transparent px-8 text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
              >
                Browse Equipment
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
