import HeroSection from "../copmonent/home/HeroSection";
import DoctorScheduleSection from "../copmonent/home/DoctorScheduleSection";
import HomePatientActions from "../copmonent/home/HomePatientActions";
import SupportingOrgSearch from "../copmonent/home/SupportingOrgSearch";
import FeatureSection from "../copmonent/home/FeatureSection";
import HealthAssistantMapSection from "../copmonent/home/HealthAssistantMapSection";
import CallToAction from "../copmonent/home/CallToAction";
import CharityCallSection from "../copmonent/home/CharityCallSection";
import Review from "../copmonent/home/Reveiw";

function Home() {
  return (
    <>
      <HeroSection />
      <DoctorScheduleSection />
      <HomePatientActions />
      <SupportingOrgSearch />
      <FeatureSection />
      <HealthAssistantMapSection />
      <CallToAction />
      <CharityCallSection />
      <Review />
    </>
  );
}

export default Home;
