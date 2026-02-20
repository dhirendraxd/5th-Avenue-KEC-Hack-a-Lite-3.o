import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { roleLabels } from "@/lib/mockData";
import { Package, Home, LayoutDashboard, Search, Menu, X, User, DollarSign } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publicNavLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/browse", label: "Browse Equipment", icon: Search },
  ];

  const privateNavLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/finance", label: "Finance", icon: DollarSign },
  ];

  const navLinks = isAuthenticated
    ? [...publicNavLinks, ...privateNavLinks]
    : publicNavLinks;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">GearShift</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Button
                  variant={isActive(link.href) ? "secondary" : "ghost"}
                  className="gap-2"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Desktop CTA / User Menu */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated && user ? (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Go to dashboard"
                  onClick={() => navigate("/dashboard")}
                >
                  <User className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/dashboard">
                  <Button variant="outline">List Your Equipment</Button>
                </Link>
                <Link to="/auth">
                  <Button>Sign In</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(link.href) ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{roleLabels[user.role].label}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        List Your Equipment
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Sign In</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </nav>
      <div className="h-16" aria-hidden="true" />
    </>
  );
};

export default Navbar;
