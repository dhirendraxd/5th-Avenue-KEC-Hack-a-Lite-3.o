import { Mountain } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-foreground text-background py-16">
    <div className="container">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-bold mb-4">
            <Mountain className="w-6 h-6 text-primary" />
            SmartYatra Nepal
          </div>
          <p className="text-sm opacity-70">AI-powered tourism intelligence for smarter, safer travel across Nepal.</p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3 opacity-80">Explore</h4>
          <div className="flex flex-col gap-2 text-sm opacity-60">
            <Link to="/map" className="hover:opacity-100 transition-opacity">Interactive Map</Link>
            <Link to="/budget" className="hover:opacity-100 transition-opacity">Budget Planner</Link>
            <Link to="/safety" className="hover:opacity-100 transition-opacity">Safety & SOS</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3 opacity-80">Resources</h4>
          <div className="flex flex-col gap-2 text-sm opacity-60">
            <span>Local Guides</span>
            <span>Cultural Heritage</span>
            <span>Trekking Routes</span>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3 opacity-80">Contact</h4>
          <div className="flex flex-col gap-2 text-sm opacity-60">
            <span>info@smartyatra.np</span>
            <span>+977 1 234 5678</span>
            <span>Kathmandu, Nepal</span>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-background/10 text-center text-xs opacity-50">
        © 2026 SmartYatra Nepal. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
