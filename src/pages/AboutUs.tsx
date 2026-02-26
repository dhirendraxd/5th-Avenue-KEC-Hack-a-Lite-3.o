import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">About Upyog</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Professional equipment sharing that helps businesses operate smarter, safer, and more sustainably.</p>

        <section className="mt-8 space-y-6">
          <p className="text-sm text-muted-foreground">Founded to simplify access to heavy equipment, Upyog enables verified owners to list machines and businesses to rent with confidence. Our platform focuses on transparency, reliability, and efficient logistics.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
