import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, XCircle } from "lucide-react";

const RecruiterLogin = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkApproval = async (userId: string): Promise<string> => {
    const { data } = await supabase
      .from("profiles")
      .select("approval_status")
      .eq("user_id", userId)
      .single();
    return data?.approval_status || "pending_approval";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setApprovalStatus(null);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) {
      setSubmitting(false);
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const status = await checkApproval(user.id);
      if (status === "approved") {
        setSubmitting(false);
        navigate("/recruiter-dashboard");
      } else if (status === "rejected") {
        setSubmitting(false);
        setApprovalStatus("rejected");
        await supabase.auth.signOut();
      } else {
        setSubmitting(false);
        setApprovalStatus("pending_approval");
        await supabase.auth.signOut();
      }
    } else {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signUp(regEmail, regPassword, regName);
    setSubmitting(false);
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      supabase.functions.invoke("send-transactional-email", {
        body: { type: "registration_received", payload: { name: regName, email: regEmail } },
      }).catch(() => {});
      supabase.functions.invoke("send-transactional-email", {
        body: { type: "new_registration_request", payload: { name: regName, email: regEmail, role: "recruiter", created_at: new Date().toISOString() } },
      }).catch(() => {});
      await supabase.auth.signOut();
      setRegistrationComplete(true);
    }
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center py-20">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 card-elevated text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 text-secondary" />
            <h1 className="mb-2 text-2xl font-bold text-card-foreground">Registration Received!</h1>
            <p className="text-muted-foreground">
              Thank you for registering with HYRIND. Your account is under review. We'll get back to you within <strong>24–48 hours</strong>.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => { setRegistrationComplete(false); setApprovalStatus(null); }}>
              Back to Login
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (approvalStatus === "pending_approval") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center py-20">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 card-elevated text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 text-secondary" />
            <h1 className="mb-2 text-2xl font-bold text-card-foreground">Account Under Review</h1>
            <p className="text-muted-foreground">
              Your HYRIND account is still pending admin approval. We'll notify you via email once approved.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => setApprovalStatus(null)}>Back to Login</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (approvalStatus === "rejected") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center py-20">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 card-elevated text-center">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h1 className="mb-2 text-2xl font-bold text-card-foreground">Account Not Approved</h1>
            <p className="text-muted-foreground">Your application was not approved at this time.</p>
            <Button variant="outline" className="mt-6" onClick={() => setApprovalStatus(null)}>Back to Login</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center py-20">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 card-elevated">
          <h1 className="mb-2 text-2xl font-bold text-card-foreground">Recruiter Portal</h1>
          <p className="mb-6 text-sm text-muted-foreground">Access the recruiter dashboard</p>
          <Tabs defaultValue="login">
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div><Label>Email</Label><Input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required /></div>
                <div><Label>Password</Label><Input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required /></div>
                <Button variant="hero" className="w-full" disabled={submitting}>{submitting ? "Signing in..." : "Sign In"}</Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 pt-4">
                <div><Label>Full Name</Label><Input value={regName} onChange={e => setRegName(e.target.value)} required /></div>
                <div><Label>Email</Label><Input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required /></div>
                <div><Label>Password</Label><Input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required minLength={6} /></div>
                <Button variant="hero" className="w-full" disabled={submitting}>{submitting ? "Registering..." : "Create Account"}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RecruiterLogin;
