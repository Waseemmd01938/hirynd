import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Users, Target, Shield, Award } from "lucide-react";

const values = [
  { icon: Users, title: "People First", description: "Every candidate is assigned a real recruiter — not an algorithm. We build genuine relationships." },
  { icon: Target, title: "Goal-Oriented", description: "We align every resume, application, and interview prep session with your specific career objectives." },
  { icon: Shield, title: "Transparency & Trust", description: "Real-time visibility into your applications, interview logs, and recruiter activity through your portal." },
  { icon: Award, title: "Results-Driven", description: "Our success is measured by your placements. We're only satisfied when you land the right role." },
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
                HYRIND is a recruiter-led career support platform built to help job seekers across the US — whether you're an international student, a recent graduate, or a career changer. We handle the heavy lifting of job search so you can focus on building skills and growing your career.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                We believe every job seeker deserves dedicated support — not just a job board. HYRIND bridges the gap between talent and opportunity by providing personalized recruiter services, resume optimization, interview coaching, and skills training. Our goal is to make the job search less overwhelming and more effective for everyone.
              </p>
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
      </main>
      <Footer />
    </div>
  );
};

export default About;
