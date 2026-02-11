import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import WhyTrustSection from "@/components/home/WhyTrustSection";
import ServicesOverview from "@/components/home/ServicesOverview";
import WorkflowSection from "@/components/home/WorkflowSection";
import ClosingCTA from "@/components/home/ClosingCTA";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="HYRIND — Focus on Skills. Let Us Handle the Rest." description="Recruiter-led profile marketing, resume optimization, daily job submissions, and interview preparation for job seekers in the U.S." path="/" />
      <main>
        <HeroSection />
        <WhyTrustSection />
        <ServicesOverview />
        <WorkflowSection />
        <ClosingCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
