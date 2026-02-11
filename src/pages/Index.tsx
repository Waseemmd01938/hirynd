import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import WhyTrustSection from "@/components/home/WhyTrustSection";
import ServicesOverview from "@/components/home/ServicesOverview";
import WorkflowSection from "@/components/home/WorkflowSection";
import ClosingCTA from "@/components/home/ClosingCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
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
