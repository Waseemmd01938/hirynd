import { Link } from "react-router-dom";
import { Instagram, Linkedin, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="mb-4 text-lg font-bold">HYRIND</h3>
            <p className="text-sm text-primary-foreground/70">
              Recruiter-led career support. We market your profile so you can focus on your growth.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-primary-foreground/10 p-2 transition-colors hover:bg-primary-foreground/20">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-primary-foreground/10 p-2 transition-colors hover:bg-primary-foreground/20">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-primary-foreground/10 p-2 transition-colors hover:bg-primary-foreground/20">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Home", path: "/" },
                { label: "About Us", path: "/about" },
                { label: "Services", path: "/services/profile-marketing" },
                { label: "How It Works", path: "/how-it-works" },
                { label: "Reviews", path: "/reviews" },
                { label: "Contact Us", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">Solutions</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>End-to-End Job Search Support</li>
              <li>Resume Optimization for Every Submission</li>
              <li>Recruiter-Led Profile Marketing</li>
              <li>Interview & Screening Preparation</li>
              <li>Secure Candidate Data Handling</li>
            </ul>
          </div>

          {/* Scan & Connect */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">Scan & Connect</h4>
            <p className="mb-3 text-sm text-primary-foreground/70">
              Connect with us on social media for updates and tips.
            </p>
            <Link to="/scan-connect" className="text-sm font-medium text-secondary underline-offset-4 hover:underline">
              Visit our social hub →
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-6 md:flex-row">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} HYRIND. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-primary-foreground/50">
            <Link to="/privacy-policy" className="hover:text-primary-foreground/70">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary-foreground/70">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
