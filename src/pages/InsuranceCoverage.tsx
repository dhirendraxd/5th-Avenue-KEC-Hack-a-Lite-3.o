import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const InsuranceCoverage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">Insurance Coverage</h1>
        <p className="mt-4 max-w-3xl text-sm text-muted-foreground">Optional insurance protects renters and owners. Coverage details vary by listing — check each listing for specifics.</p>
      </main>
      <Footer />
    </div>
  );
};

export default InsuranceCoverage;
