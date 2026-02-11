import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya M.",
    role: "Software Engineer",
    text: "HYRIND completely changed my job search experience. My recruiter optimized my resume for every application and I had full visibility into where my profile was being submitted. I landed a role within 6 weeks.",
  },
  {
    name: "Ahmed R.",
    role: "Data Analyst",
    text: "The screening call practice was a game-changer. I used to freeze during recruiter calls, but after multiple practice sessions with my HYRIND team, I felt confident and prepared for every conversation.",
  },
  {
    name: "Jessica L.",
    role: "Business Analyst",
    text: "What I appreciated most was the transparency. I could see daily how many applications were submitted, which companies, and the status of each. No other service gave me that level of visibility.",
  },
  {
    name: "Ravi K.",
    role: "Full Stack Developer",
    text: "As an international student, I was overwhelmed by the US job market. HYRIND's team guided me through everything — resume format, interview prep, and role-specific training. Highly recommend.",
  },
  {
    name: "Sarah T.",
    role: "Product Manager",
    text: "The dedicated recruiter model is what sets HYRIND apart. My recruiter knew my goals, my strengths, and marketed me accordingly. It felt like having a career partner, not just a service.",
  },
  {
    name: "Michael C.",
    role: "QA Engineer",
    text: "I was skeptical at first, but the results spoke for themselves. Within the first month, I had multiple screening calls and two interviews lined up. The daily submission logs kept me informed at every step.",
  },
];

const Reviews = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="hero-gradient py-20 lg:py-28">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold text-primary-foreground sm:text-5xl">What Our Candidates Say</h1>
              <p className="mt-6 text-lg text-primary-foreground/70">
                Real feedback from job seekers who trusted HYRIND with their career journey.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="card-elevated rounded-xl border border-border bg-card p-6"
                >
                  <Quote className="mb-4 h-6 w-6 text-secondary/40" />
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-card-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
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

export default Reviews;
