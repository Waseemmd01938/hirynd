import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Megaphone, Mic, BookOpen, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Megaphone,
    title: "Profile Marketing",
    description:
      "Resume optimization for every application. Role-based submissions with CRM tracking and full transparency into your job search progress.",
    link: "/services/profile-marketing",
  },
  {
    icon: Mic,
    title: "Interview & Screening Call Practice",
    description:
      "Mock interviews, screening call coaching, and real-time feedback to help you make a confident impression with every employer.",
    link: "/services/interview-training",
  },
  {
    icon: BookOpen,
    title: "Skills Training",
    description:
      "Role-specific training plans, progress tracking, and guided learning paths to bridge skill gaps and align with market demand.",
    link: "/services/skills-training",
  },
];

const ServicesOverview = () => {
  return (
    <section className="bg-muted/50 py-20 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Career Services
          </h2>
          <p className="mt-4 text-muted-foreground">
            Comprehensive, recruiter-led solutions designed to accelerate your career journey.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="card-elevated group rounded-xl border border-border bg-card p-8"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                <service.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">{service.title}</h3>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
              <Link
                to={service.link}
                className="inline-flex items-center gap-1 text-sm font-medium text-secondary transition-colors hover:text-secondary/80"
              >
                Learn More <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
