import { motion } from "framer-motion";
import { UserCheck, FileText, Headphones } from "lucide-react";

const cards = [
  {
    icon: UserCheck,
    title: "Dedicated Recruiter Assigned to You",
    description:
      "Get a personal recruiter who understands your goals, markets your profile to targeted employers, and keeps you informed every step of the way.",
  },
  {
    icon: FileText,
    title: "Role-Based Resume & Skills Roadmap",
    description:
      "Your resume is optimized for every application. We tailor it to each role, ensuring you stand out to hiring managers and ATS systems.",
  },
  {
    icon: Headphones,
    title: "Interview & Screening Call Support",
    description:
      "Practice mock interviews, receive feedback, and get coached on screening calls so you're fully prepared when opportunity knocks.",
  },
];

const WhyTrustSection = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Candidates Trust HYRIND
          </h2>
          <p className="mt-4 text-muted-foreground">
            We go beyond job boards. Our recruiter-led approach gives you a real team invested in your success.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="card-elevated rounded-xl border border-border bg-card p-8"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <card.icon className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">{card.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyTrustSection;
