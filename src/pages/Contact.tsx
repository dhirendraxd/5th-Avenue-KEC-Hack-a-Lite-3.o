import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">Contact</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Questions or partnership inquiries? Reach out and we'll respond within one business day.</p>

        <form className="mt-8 max-w-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Name</label>
            <input className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Email</label>
            <input className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Message</label>
            <textarea className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm" rows={5} />
          </div>
          <button type="button" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Send</button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
