import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Careers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">Careers</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Join Upyog — we're building the future of equipment sharing.</p>

        <section className="mt-8 space-y-6">
          <div className="rounded-lg border border-border/60 p-6">
            <h3 className="font-semibold text-foreground">Open Positions</h3>
            <p className="mt-2 text-sm text-muted-foreground">Currently hiring for product, engineering, and operations. Send your CV to careers@upyog.example.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
