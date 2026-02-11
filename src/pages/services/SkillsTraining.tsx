import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, CheckCircle } from "lucide-react";

const SkillsTraining = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="hero-gradient py-20 lg:py-28">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold text-primary-foreground sm:text-5xl">Skills Training</h1>
              <p className="mt-6 text-lg text-primary-foreground/70">
                Bridge skill gaps with role-specific training plans aligned to market demand.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 text-2xl font-bold text-foreground">What's Included</h2>
              <ul className="space-y-4">
                {[
                  "Role-specific skills roadmaps",
                  "Guided learning paths aligned with market demand",
                  "Progress tracking and milestone reviews",
                  "Tool and technology training for target roles",
                  "Hands-on projects and practice assignments",
                  "Ongoing support until placement",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                <Button variant="hero" size="lg" className="gap-2" asChild>
                  <a href="#interest-form">Get Started <ArrowRight className="h-4 w-4" /></a>
                </Button>
                <Button variant="outline" size="lg" className="gap-2" asChild>
                  <a href="https://cal.com" target="_blank" rel="noopener noreferrer">
                    <Calendar className="h-4 w-4" /> Book a Consultation
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SkillsTraining;
