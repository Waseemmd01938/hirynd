import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

const CandidateLogin = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center py-20">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 card-elevated">
          <h1 className="mb-2 text-2xl font-bold text-card-foreground">Candidate Login</h1>
          <p className="mb-6 text-sm text-muted-foreground">Access your candidate portal</p>
          <form className="space-y-4">
            <div><Label>Email</Label><Input type="email" placeholder="you@email.com" required /></div>
            <div><Label>Password</Label><Input type="password" placeholder="••••••••" required /></div>
            <Button variant="hero" className="w-full">Sign In</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/contact" className="font-medium text-secondary hover:underline">Submit Interest</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CandidateLogin;
