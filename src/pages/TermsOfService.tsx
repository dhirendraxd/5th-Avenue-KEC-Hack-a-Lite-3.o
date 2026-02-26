import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">Terms of Service</h1>
        <p className="mt-4 max-w-3xl text-sm text-muted-foreground">These terms govern the use of the Upyog platform. Use of the service indicates agreement with these terms.</p>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
