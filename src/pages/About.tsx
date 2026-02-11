import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, Target, Shield, Award, ArrowRight, CheckCircle } from "lucide-react";

const values = [
  { icon: Users, title: "People First", description: "Every candidate is assigned a real recruiter — not an algorithm. We build genuine relationships and personalized strategies." },
  { icon: Target, title: "Goal-Oriented", description: "We align every resume, application, and interview prep session with your specific career objectives and target roles." },
  { icon: Shield, title: "Transparency & Trust", description: "Real-time visibility into your applications, interview logs, and recruiter activity through your personal candidate portal." },
  { icon: Award, title: "Results-Driven", description: "Our success is measured by your placements. We're only satisfied when you land the right role with the right employer." },
];

const whoWeServe = [
  "International students (F-1 / OPT / STEM OPT)",
  "Recent graduates and early-career professionals",
  "Career switchers entering new industries",
  "Any candidate in the U.S. seeking full-time roles",
];

const whyChoose = [
  "Expert profile validation and career assessment",
  "Customized resumes tailored for every application",
  "Monthly profile marketing campaigns with daily submissions",
  "Dedicated recruiter support throughout your journey",
  "Industry connections and a proven track record of placements",
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="hero-gradient py-20 lg:py-28">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold text-primary-foreground sm:text-5xl">About HYRIND</h1>
              <p className="mt-6 text-lg text-primary-foreground/70">
                HYRIND is a talent marketing and job support platform that bridges the gap between education, skills, and employment. We are not a traditional staffing agency — we actively market candidate profiles on their behalf through dedicated recruiters.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Who We Serve */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 text-center text-3xl font-bold text-foreground">Who We Serve</h2>
              <p className="mb-8 text-center text-muted-foreground">
                While international students are a large segment of our candidates, HYRIND supports anyone seeking full-time opportunities in the U.S.
              </p>
              <ul className="mx-auto max-w-lg space-y-3">
                {whoWeServe.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-muted/50 py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                To empower job seekers with the tools, support, and representation needed to secure interviews and full-time opportunities — while they focus on building skills and growing professionally. We believe every job seeker deserves dedicated support, not just a job board.
              </p>
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-8 text-3xl font-bold text-foreground">Our Approach</h2>
              <div className="grid gap-6 text-left sm:grid-cols-2">
                {[
                  { title: "Recruiter-Driven Marketing", desc: "Your profile is actively marketed by a dedicated recruiter who submits applications daily on your behalf." },
                  { title: "Personalized Roadmaps", desc: "Every candidate receives a customized skills and career roadmap aligned with their target roles." },
                  { title: "Hands-On Training", desc: "Interview prep, screening call coaching, and skills training tailored to your industry and experience level." },
                  { title: "Continuous Promotion", desc: "We don't stop at one submission. Your profile is promoted continuously until you land the right opportunity." },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-border bg-card p-6 card-elevated">
                    <h3 className="mb-2 font-semibold text-card-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted/50 py-20">
          <div className="container">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground">What We Stand For</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border bg-card p-6 text-center card-elevated"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                    <v.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-card-foreground">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose HYRIND */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 text-center text-3xl font-bold text-foreground">Why Choose HYRIND</h2>
              <ul className="space-y-3">
                {whyChoose.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="hero-gradient py-16">
          <div className="container text-center">
            <h2 className="mb-4 text-2xl font-bold text-primary-foreground">Take the First Step</h2>
            <p className="mb-8 text-primary-foreground/70">Take the first step toward your next opportunity with HYRIND.</p>
            <Button variant="hero" size="lg" className="gap-2" asChild>
              <a href="/contact">Get Started <ArrowRight className="h-4 w-4" /></a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
