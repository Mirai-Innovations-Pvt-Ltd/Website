import Hero from "@/components/Hero";
import ProductBand from "@/components/ProductBand";
import RetailerBenefits from "@/components/RetailerBenefits";
import BehindTheBuild from "@/components/BehindTheBuild";
import TeamSection from "@/components/TeamSection";
import ContactSection from "@/components/ContactSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductBand />
      <RetailerBenefits />
      <BehindTheBuild />
      <TeamSection />
      <ContactSection />
    </>
  );
}
