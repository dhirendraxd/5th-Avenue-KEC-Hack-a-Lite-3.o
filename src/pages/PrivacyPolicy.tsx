import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">Privacy Policy</h1>
        <p className="mt-4 max-w-3xl text-sm text-muted-foreground">We respect your privacy. This page summarizes how Upyog collects and uses data. For full details, contact privacy@upyog.example.</p>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
