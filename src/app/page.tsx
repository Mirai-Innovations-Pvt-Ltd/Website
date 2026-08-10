import Hero from "@/components/Hero";
import RecognitionStrip from "@/components/RecognitionStrip";
import ProductBand from "@/components/ProductBand";
import RetailerBenefits from "@/components/RetailerBenefits";
import BehindTheBuild from "@/components/BehindTheBuild";
import TeamSection from "@/components/TeamSection";
import ContactSection from "@/components/ContactSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <RecognitionStrip />
      <ProductBand />
      <RetailerBenefits />
      <BehindTheBuild />
      <TeamSection />
      <ContactSection />
    </>
  );
}
