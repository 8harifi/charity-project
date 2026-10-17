import { useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash === "#join-network" || location.hash === "#patient-guide"
      ? "patient-actions"
      : location.hash.slice(1);
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(timer);
  }, [location.hash]);

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
