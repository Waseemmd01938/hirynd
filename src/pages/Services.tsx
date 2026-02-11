import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Megaphone, Mic, BookOpen, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Megaphone,
    title: "Profile Marketing",
    link: "/services/profile-marketing",
    features: [
      "Dedicated recruiter assigned to manage your profile full-time",
      "Resume optimized and tailored for every job posting",
      "Role-based submissions to targeted employers and hiring managers",
      "Monthly marketing strategy with daily application cadence",
      "CRM-based tracking with full transparency into every submission",
      "Recruiter outreach to hiring managers on your behalf",
      "LinkedIn profile optimization",
      "Progress reports and weekly check-ins",
    ],
  },
  {
    icon: Mic,
    title: "Interview & Screening Call Practice",
    link: "/services/interview-training",
    features: [
      "Realistic one-on-one mock interview sessions",
      "Behavioral and technical interview preparation",
      "STAR method coaching for structured answers",
      "Voice, communication, and confidence improvement",
      "Screening call scripts and coaching",
      "Industry-specific question banks and guidance",
      "Real-time feedback and improvement plans",
      "Ongoing support until you're fully client-ready",
    ],
  },
  {
    icon: BookOpen,
    title: "Skills Training",
    link: "/services/skills-training",
    features: [
      "Role-specific skills roadmaps aligned with market demand",
      "Curated, recruiter-approved learning resources",
      "Weekly tasks, milestones, and progress tracking",
      "Centralized learning access through your portal",
      "Trainer guidance and mentorship",
      "Real-world project exposure and practice assignments",
      "Measurable progress tracking with milestone reviews",
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
                Comprehensive career support designed to help candidates secure full-time opportunities through expert profile marketing, interview preparation, and skill development.
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
                <div className="mt-6">
                  <Link
                    to={service.link}
                    className="inline-flex items-center gap-1 text-sm font-medium text-secondary transition-colors hover:text-secondary/80"
                  >
                    Learn More <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-muted/50 py-16">
          <div className="container text-center">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Ready to Get Started?</h2>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="hero" size="lg" className="gap-2" asChild>
                <a href="/contact">Get Started Today <ArrowRight className="h-4 w-4" /></a>
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
