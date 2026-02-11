import Header from "@/components/layout/Header";
import SEO from "@/components/SEO";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

const phases = [
  {
    phase: "Discovery & Intake",
    steps: [
      { title: "Submit Interest Form", description: "Share your background, career goals, target roles, and visa status through our online form. This helps us understand what you're looking for." },
      { title: "Discovery Call", description: "A HYRIND team member schedules a call to discuss your goals, assess your current profile, and explain our process in detail." },
      { title: "Admin Review & Approval", description: "Our team reviews your profile and determines the best path forward. Once approved, you'll receive portal access." },
    ],
  },
  {
    phase: "Approval & Role Targeting",
    steps: [
      { title: "Portal Access & Onboarding", description: "Log in to your personal candidate portal where you'll track applications, interviews, and all recruiter activity." },
      { title: "Complete Intake Sheets", description: "Fill out detailed intake forms covering your experience, skills, and preferences so your recruiter can build a targeted strategy." },
      { title: "Role Suggestions & Confirmation", description: "Your recruiter suggests roles based on your profile. Review them, provide feedback, and confirm the roles you want to target." },
    ],
  },
  {
    phase: "Payment & Activation",
    steps: [
      { title: "Payment Processing", description: "Complete the initial service fee to activate your marketing campaign. Payment details and receipts are available in your portal." },
      { title: "Credential Submission", description: "Submit any required credentials, certifications, or documents that strengthen your applications." },
    ],
  },
  {
    phase: "Recruiter Assignment & Marketing",
    steps: [
      { title: "Recruiter Assignment", description: "A dedicated recruiter is assigned to your profile. They manage daily applications, resume optimization, and employer outreach." },
      { title: "Active Profile Marketing", description: "Your recruiter begins daily submissions to targeted employers, optimizing your resume for each role and tracking every application in the CRM." },
    ],
  },
  {
    phase: "Training, Interviews & Ongoing Support",
    steps: [
      { title: "Skills Training & Upskilling", description: "Access your personalized skills roadmap, curated resources, and training sessions to bridge any gaps in your profile." },
      { title: "Interview & Screening Prep", description: "Receive mock interviews, screening call coaching, and actionable feedback to prepare for every opportunity." },
      { title: "Placement & Case Closure", description: "Once you secure an offer, your recruiter assists with the transition. Your case is formally closed with full documentation." },
    ],
  },
];

let stepCounter = 0;

const HowItWorks = () => {
  stepCounter = 0;
  return (
    <div className="min-h-screen bg-background">
      <SEO title="How It Works" description="From interest form to placement — learn the 13-step HYRIND journey across discovery, intake, payment, marketing, and ongoing support." path="/how-it-works" />
      <Header />
      <main>
        <section className="hero-gradient py-20 lg:py-28">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold text-primary-foreground sm:text-5xl">How It Works</h1>
              <p className="mt-6 text-lg text-primary-foreground/70">
                Your journey with HYRIND is simple, transparent, and designed around your success. Here's the full 13-step process from first inquiry to placement.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl space-y-16">
              {phases.map((phase, pi) => (
                <div key={phase.phase}>
                  <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mb-8 text-xl font-bold text-secondary"
                  >
                    Phase {pi + 1}: {phase.phase}
                  </motion.h2>
                  <div className="space-y-6">
                    {phase.steps.map((step, si) => {
                      stepCounter++;
                      const num = stepCounter;
                      return (
                        <motion.div
                          key={step.title}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: si * 0.08 }}
                          className="flex gap-5"
                        >
                          <div className="flex flex-col items-center">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-secondary bg-secondary/10 text-sm font-bold text-secondary">
                              {num}
                            </div>
                            <div className="mt-2 h-full w-px bg-border" />
                          </div>
                          <div className="pb-4">
                            <h3 className="mb-1 font-semibold text-foreground">{step.title}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="hero" size="lg" className="gap-2" asChild>
                <a href="/contact">Get Started Now <ArrowRight className="h-4 w-4" /></a>
              </Button>
              <Button variant="outline" size="lg" className="gap-2" asChild>
                <a href="https://cal.com" target="_blank" rel="noopener noreferrer">
                  <Calendar className="h-4 w-4" /> Book a Free Consultation
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
