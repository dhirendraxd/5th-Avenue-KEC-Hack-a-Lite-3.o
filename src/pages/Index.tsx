import Navbar from "@/components/layout/Navbar";
import BackgroundIllustrations from "@/components/layout/BackgroundIllustrations";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedEquipment from "@/components/home/FeaturedEquipment";
import TrustSection from "@/components/home/TrustSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIllustrations variant="hero" />
      <Navbar />
      <main className="relative z-10 space-y-4 lg:space-y-8">
        <HeroSection />
        <HowItWorks />
        <FeaturedEquipment />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
