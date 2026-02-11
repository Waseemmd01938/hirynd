import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RecruiterLogin = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center py-20">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 card-elevated">
          <h1 className="mb-2 text-2xl font-bold text-card-foreground">Recruiter Login</h1>
          <p className="mb-6 text-sm text-muted-foreground">Access the recruiter dashboard</p>
          <form className="space-y-4">
            <div><Label>Email</Label><Input type="email" placeholder="recruiter@hyrind.com" required /></div>
            <div><Label>Password</Label><Input type="password" placeholder="••••••••" required /></div>
            <Button variant="hero" className="w-full">Sign In</Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RecruiterLogin;
