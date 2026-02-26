import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Platform = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">Platform</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Upyog connects businesses with professional equipment owners to save time, reduce costs, and support sustainable operations.</p>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-border/60 p-6">
            <h3 className="font-semibold text-foreground">Verified Listings</h3>
            <p className="mt-2 text-sm text-muted-foreground">All equipment and owners are verified to ensure reliability and trust.</p>
          </div>
          <div className="rounded-lg border border-border/60 p-6">
            <h3 className="font-semibold text-foreground">Clear Pricing</h3>
            <p className="mt-2 text-sm text-muted-foreground">Transparent daily rates, fees, and insurance options for every listing.</p>
          </div>
          <div className="rounded-lg border border-border/60 p-6">
            <h3 className="font-semibold text-foreground">Seamless Operations</h3>
            <p className="mt-2 text-sm text-muted-foreground">Booking, pickup, and returns handled through an intuitive workflow.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Platform;
