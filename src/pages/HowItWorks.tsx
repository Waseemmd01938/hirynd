import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Search, Phone, ShieldCheck, ClipboardList, Rocket } from "lucide-react";

const steps = [
  { icon: Search, title: "Explore & Submit Interest", description: "Browse our services, understand how HYRIND works, and submit your interest form so we can learn about your goals and background." },
  { icon: Phone, title: "Intro Call", description: "We schedule a discovery call to dive deeper into your career goals, assess your current profile, and discuss the best path forward." },
  { icon: ShieldCheck, title: "Approval & Role Alignment", description: "After review, you're approved for the program. We suggest roles based on your skills, experience, and career aspirations." },
  { icon: ClipboardList, title: "Profile Setup & Preparation", description: "Complete your intake forms, finalize your resume, set up credentials, and get your profile ready for active marketing." },
  { icon: Rocket, title: "Marketing + Training + Interview Support", description: "Your recruiter begins submitting your profile daily. You receive interview coaching, skills training, and full visibility into your progress." },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="hero-gradient py-20 lg:py-28">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold text-primary-foreground sm:text-5xl">How It Works</h1>
              <p className="mt-6 text-lg text-primary-foreground/70">
                Your journey with HYRIND is simple, transparent, and designed around your success. Here's what to expect.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl space-y-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6"
                >
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-secondary bg-secondary/10">
                      <step.icon className="h-5 w-5 text-secondary" />
                    </div>
                    {i < steps.length - 1 && <div className="mt-2 h-full w-px bg-border" />}
                  </div>
                  <div className="pb-8">
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      <span className="mr-2 text-secondary">Step {i + 1}.</span>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="hero" size="lg" className="gap-2" asChild>
                <a href="#interest-form">Get Started Now <ArrowRight className="h-4 w-4" /></a>
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
