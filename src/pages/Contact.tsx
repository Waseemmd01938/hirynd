import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [wantsMarketing, setWantsMarketing] = useState<string | null>(null);
  const [referralSource, setReferralSource] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Form Submitted!",
      description: "We'll get back to you within 24–48 hours.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="hero-gradient py-20 lg:py-28">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold text-primary-foreground sm:text-5xl">Contact Us</h1>
              <p className="mt-6 text-lg text-primary-foreground/70">
                Have a question or ready to get started? We're here to help.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 card-elevated lg:p-10"
            >
              {/* Primary question */}
              {wantsMarketing === null && (
                <div className="text-center">
                  <h2 className="mb-6 text-xl font-semibold text-card-foreground">
                    Are you looking to get your profile marketed through HYRIND?
                  </h2>
                  <div className="flex justify-center gap-4">
                    <Button variant="hero" size="lg" onClick={() => setWantsMarketing("yes")}>Yes</Button>
                    <Button variant="outline" size="lg" onClick={() => setWantsMarketing("no")}>No</Button>
                  </div>
                </div>
              )}

              {/* General inquiry form */}
              {wantsMarketing === "no" && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="mb-4 text-xl font-semibold text-card-foreground">General Inquiry</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Name</Label><Input required placeholder="Your name" /></div>
                    <div><Label>Email</Label><Input required type="email" placeholder="you@email.com" /></div>
                  </div>
                  <div><Label>Phone</Label><Input placeholder="+1 (555) 000-0000" /></div>
                  <div><Label>Message</Label><Textarea required placeholder="How can we help?" rows={4} /></div>
                  <div className="flex gap-3">
                    <Button variant="hero" type="submit">Send Message</Button>
                    <Button variant="ghost" type="button" onClick={() => setWantsMarketing(null)}>Back</Button>
                  </div>
                </form>
              )}

              {/* Candidate interest form */}
              {wantsMarketing === "yes" && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="mb-4 text-xl font-semibold text-card-foreground">Candidate Interest Form</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Name *</Label><Input required placeholder="Your full name" /></div>
                    <div><Label>Email *</Label><Input required type="email" placeholder="you@email.com" /></div>
                  </div>
                  <div><Label>Phone *</Label><Input required placeholder="+1 (555) 000-0000" /></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>University</Label><Input placeholder="University name" /></div>
                    <div><Label>Major</Label><Input placeholder="Your major" /></div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Degree</Label><Input placeholder="e.g., Master's, Bachelor's" /></div>
                    <div><Label>Graduation Year</Label><Input placeholder="e.g., 2025" /></div>
                  </div>
                  <div>
                    <Label>Visa Status</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select visa status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us-citizen">US Citizen</SelectItem>
                        <SelectItem value="green-card">Green Card</SelectItem>
                        <SelectItem value="h1b">H-1B</SelectItem>
                        <SelectItem value="opt">OPT</SelectItem>
                        <SelectItem value="cpt">CPT</SelectItem>
                        <SelectItem value="ead">EAD</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>How did you hear about us?</Label>
                    <Select onValueChange={setReferralSource}>
                      <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {referralSource === "friend" && (
                    <div><Label>Friend's Name</Label><Input placeholder="Who referred you?" /></div>
                  )}
                  <div className="flex gap-3">
                    <Button variant="hero" type="submit">Submit Interest</Button>
                    <Button variant="ghost" type="button" onClick={() => setWantsMarketing(null)}>Back</Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
