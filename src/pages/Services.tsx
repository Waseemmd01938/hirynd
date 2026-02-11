import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Megaphone, Mic, BookOpen, CheckCircle } from "lucide-react";

const services = [
  {
    icon: Megaphone,
    title: "Profile Marketing",
    features: [
      "Resume optimization for every application",
      "Role-based submissions to targeted employers",
      "CRM tracking with full transparency into every submission",
      "Dedicated recruiter managing your profile daily",
      "Progress reports and application status visibility",
    ],
  },
  {
    icon: Mic,
    title: "Interview & Screening Call Practice",
    features: [
      "One-on-one mock interview sessions",
      "Screening call coaching and scripts",
      "Behavioral & technical interview prep",
      "Real-time feedback and improvement plans",
      "Confidence-building through repeated practice",
    ],
  },
  {
    icon: BookOpen,
    title: "Skills Training",
    features: [
      "Role-specific skills roadmaps",
      "Guided learning paths aligned with market demand",
      "Progress tracking and milestone reviews",
      "Tool & technology training relevant to target roles",
      "Ongoing support until placement",
    ],
  },
];

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="hero-gradient py-20 lg:py-28">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold text-primary-foreground sm:text-5xl">Our Career Services</h1>
              <p className="mt-6 text-lg text-primary-foreground/70">
                Comprehensive, recruiter-led solutions designed to accelerate your career journey.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="container space-y-16">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 card-elevated lg:p-10"
              >
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                    <service.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-bold text-card-foreground">{service.title}</h2>
                </div>
                <ul className="space-y-3">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-muted/50 py-16">
          <div className="container text-center">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Ready to Get Started?</h2>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="hero" size="lg" className="gap-2" asChild>
                <a href="#interest-form">Get Started Today <ArrowRight className="h-4 w-4" /></a>
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

export default Services;
