import { Link } from "react-router-dom";
import { Package } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">5th Avenue</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Professional equipment sharing for businesses that value efficiency, reliability, and sustainable growth.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/browse" className="hover:text-foreground">Browse Equipment</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground">List Equipment</Link></li>
              <li><Link to="/" className="hover:text-foreground">How It Works</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground">About Us</Link></li>
              <li><Link to="/" className="hover:text-foreground">Contact</Link></li>
              <li><Link to="/" className="hover:text-foreground">Careers</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-foreground">Insurance Coverage</Link></li>
            </ul>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
