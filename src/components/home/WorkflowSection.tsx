import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, ClipboardList, Phone, CheckCircle, FileText, Rocket } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    number: "01",
    title: "Submit Interest Form",
    description: "Tell us about your background, goals, and what kind of roles you're targeting.",
  },
  {
    icon: Phone,
    number: "02",
    title: "Call with HYRIND Team",
    description: "We schedule a discovery call to understand your needs and assess the best approach.",
  },
  {
    icon: CheckCircle,
    number: "03",
    title: "Approval & Portal Access",
    description: "Once approved, you get access to your personal candidate portal with full visibility.",
  },
  {
    icon: FileText,
    number: "04",
    title: "Intake Sheets & Role Selection",
    description: "Complete your intake forms, review suggested roles, and confirm your preferences.",
  },
  {
    icon: Rocket,
    number: "05",
    title: "Pay Initial Fee & Marketing Begins",
    description: "Your dedicated recruiter starts marketing your profile to targeted employers.",
  },
];

const WorkflowSection = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-muted-foreground">
            From your first inquiry to active job marketing — here's your journey with HYRIND.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mx-auto max-w-5xl">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border lg:block" />

          <div className="grid gap-6 lg:gap-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex items-center gap-6 lg:gap-0 ${
                  i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "lg:pr-16 lg:text-right" : "lg:pl-16"}`}>
                  <div className="card-elevated rounded-xl border border-border bg-card p-6">
                    <div className="mb-2 flex items-center gap-3 lg:justify-start">
                      <span className="text-xs font-bold text-secondary">{step.number}</span>
                      <h3 className="font-semibold text-card-foreground">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                {/* Center dot */}
                <div className="relative z-10 hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-secondary bg-card lg:flex">
                  <step.icon className="h-4 w-4 text-secondary" />
                </div>

                <div className="hidden flex-1 lg:block" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button variant="hero" size="lg" className="gap-2" asChild>
            <a href="#interest-form">
              Submit Interest <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" size="lg" className="gap-2" asChild>
            <a href="https://cal.com" target="_blank" rel="noopener noreferrer">
              <Calendar className="h-4 w-4" /> Book a Call
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
