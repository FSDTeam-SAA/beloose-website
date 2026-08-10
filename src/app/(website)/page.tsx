import Hero from "./_components/hero";
import ForRetailers from "./_components/for-retailers";
import TrustedBy from "./_components/trusted-by";
import ThePlatform from "./_components/the-platform";
import HowItWorks from "./_components/how-it-works";
import BusinessBenefits from "./_components/business-benefits";

const WebsiteHomePage = () => {
  return (
    <main className="min-h-screen bg-[#120805]">
      <Hero />
      <TrustedBy />
      <ForRetailers />
      <ThePlatform />
      <HowItWorks />
      <BusinessBenefits />
    </main>
  );
};

export default WebsiteHomePage;
