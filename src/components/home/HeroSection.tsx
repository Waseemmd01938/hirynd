import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden hero-gradient py-24 lg:py-32">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-0 hero-gradient opacity-80" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-bold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl"
          >
            Focus on Skills
            <br />
            <span className="text-gradient">Let Us Handle the Rest</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-4 text-lg font-medium text-primary-foreground/80 sm:text-xl"
          >
            We market your profile. You focus on your career.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mx-auto mt-6 max-w-2xl text-primary-foreground/60"
          >
            <p className="mb-4">
              HYRIND is a recruiter-led profile marketing and job support platform that removes the stress of self-marketing. We manage your entire job search — from resume building and daily job submissions to recruiter connections and screening call preparation.
            </p>
            <p className="mb-4">
              We support international students (F-1 / OPT / STEM OPT), graduates, early-career professionals, and any candidate in the U.S. seeking full-time roles.
            </p>
            <p>
              Our focus: role-based profile marketing, skills training and upskilling, and real interview preparation and evaluation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button variant="hero" size="lg" className="gap-2" asChild>
              <a href="/contact">
                Submit Interest Form <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="hero-outline" size="lg" className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <a href="https://cal.com" target="_blank" rel="noopener noreferrer">
                <Calendar className="h-4 w-4" /> Book a Free Consultation
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
