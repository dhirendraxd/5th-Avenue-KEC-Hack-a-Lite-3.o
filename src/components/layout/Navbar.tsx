import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { roleLabels } from "@/lib/mockData";
import { Package, Home, LayoutDashboard, Search, Menu, X, User, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

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

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY <= 8) {
        setIsVisible(true);
      } else if (currentY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 border-b border-transparent bg-transparent shadow-none transition-transform duration-300 ${
          isVisible || mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">5th Avenue</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative text-sm after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-primary after:transition-all ${
                  isActive(link.href)
                    ? "text-success font-medium after:w-full"
                    : "text-muted-foreground hover:text-foreground after:w-0 hover:after:w-full"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA / User Menu */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated && user ? (
              <>
                <button
                  aria-label="Go to dashboard"
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="relative text-sm font-medium text-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                >
                  List Equipment
                </Link>
                <Link
                  to="/auth"
                  className="relative text-sm text-muted-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-foreground hover:after:w-full"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
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
                  className={`flex items-center gap-2 px-4 py-2 text-sm ${
                    isActive(link.href)
                      ? "font-medium text-success"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  <span
                    className={`relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-primary after:transition-all ${
                      isActive(link.href)
                        ? "after:w-full"
                        : "after:w-0 hover:after:w-full"
                    }`}
                  >
                    {link.label}
                  </span>
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
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-foreground"
                    >
                      <span className="relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">
                        List Equipment
                      </span>
                    </Link>
                    <Link
                      to="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <span className="relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">
                        Sign In
                      </span>
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
