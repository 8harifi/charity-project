import {BrowserRouter, Routes, Route} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Needs from "./pages/Needs";
import EducationCourse from "./pages/EducationCourse";
import Aboutus from "./pages/aboutus/Aboutus";
import News from "./pages/News";
import LoginPage from "./pages/Auth/LoginPage";
import CharitableSignup from "./pages/Auth/CharitableSignup";
import PatientSignup1 from "./pages/Auth/PatientSignup1";
import PatientSignup2 from "./pages/Auth/PatientSignup2";
import PatientSignup3 from "./pages/Auth/PatientSignup3";
import SalamtyaranSignup from "./pages/Auth/SalamatyaranSignup";
import Doctor from "./pages/Auth/doctor";
import HealthServiceCenter from "./pages/Auth/HealthServiceCenter";
import HealthServiceCenter2 from "./pages/Auth/HealthServiceCenter2";
import CharityCenter from "./pages/Auth/CharityCenter";
import CharityCenter2 from "./pages/Auth/CharityCenter2";
import CharityCenter3 from "./pages/Auth/CharityCenter3";
import SocialWorkUnit from "./pages/Auth/SocialWorkUnit";
import SocialWorkUnit2 from "./pages/Auth/SocialWorkUnit2";
import LastSignup from "./pages/Auth/LastSignup";
import SignupRole from "./pages/Auth/SignupRole";
import CharitableDashboard from "./dashboards/CharitableDashboard";
import DoctorDashboard from "./dashboards/DoctorDashboard";
import PatientDashboard from "./dashboards/PatientDashboard"
import CharityCenterDashboard from "./dashboards/CharityCenterDashboard"
import SalamatyarDashboard from "./dashboards/SalamatyarDashboard"
import HealthCenter from "./dashboards/HealthCenter"
import AdminDashboard from "./dashboards/AdminDashboard"
import WalletTopupResult from "./pages/WalletTopupResult";



import SignupSuccess from "./pages/SignupSuccess";
import SalamatyaranSignupIndividual from "./pages/Auth/SalamatyaranSignupIndividual.jsx";
import SalamatyaranSignupOrganization from "./pages/Auth/SalamatyaranSignupOrganization.jsx";
import ContactSection from "./pages/ContactSection.jsx";


function App() {
  return (
    <div
      className="App"
      dir="rtl"
      style={{
        fontFamily: "'Yekan', 'Lotus', 'Vazirmatn', sans-serif, font-iran",
      }}
    >
      <BrowserRouter>
        <Routes>
          {/* Login بدون هدر و فوتر */}
          <Route path="/authCharitable" element={<CharitableSignup/>}/>
          <Route path="/loginpage" element={<LoginPage/>}/>
          <Route path="/lastsignup" element={<LastSignup/>}/>
          <Route path="/authpatient" element={<PatientSignup1/>}/>
          <Route path="/authpatient2" element={<PatientSignup2/>}/>
          <Route path="/authpatient3" element={<PatientSignup3/>}/>
          <Route path="/SalamtyaranSignup" element={<SalamtyaranSignup/>}/>
          <Route path="/SalamtyaranSignupIndividual" element={<SalamatyaranSignupIndividual/>}/>
          <Route path="/SalamtyaranSignupOrganization" element={<SalamatyaranSignupOrganization/>}/>
          <Route path="/doctor" element={<Doctor/>}/>
          <Route path="/healthservicecenter" element={<HealthServiceCenter/>}/>
          <Route path="/healthservicecenter2" element={<HealthServiceCenter2/>}/>
          <Route path="/charitycenter" element={<CharityCenter/>}/>
          <Route path="/charitycenter2" element={<CharityCenter2/>}/>
          <Route path="/charitycenter3" element={<CharityCenter3/>}/>
          <Route path="/socialworkunit" element={<SocialWorkUnit/>}/>
          <Route path="/socialworkunit2" element={<SocialWorkUnit2/>}/>
          <Route path="/signuprole" element={<SignupRole/>}/>


          <Route path="/charitable/dashboard" element={<CharitableDashboard/>}/>
          <Route path="/doctor/dashboard" element={<DoctorDashboard/>}/>
          <Route path="/patient/dashboard" element={<PatientDashboard/>}/>
          <Route path="/charitycenter/dashboard" element={<CharityCenterDashboard/>}/>
          <Route path="/salamatyar/dashboard" element={<SalamatyarDashboard/>}/>
          <Route path="/healthcenter/dashboard" element={<HealthCenter/>}/>
          <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
          <Route path="/wallet/topup/result" element={<WalletTopupResult/>}/>


          <Route path="/authpatientFinal" element={<SignupSuccess/>}/>
          <Route path="/signup-success" element={<SignupSuccess/>}/>


          {/* صفحات دارای Header/Footer */}
          <Route element={<MainLayout/>}>
            <Route path="/" element={<Home/>}/>
            <Route path="/campaigns" element={<Needs/>}/>
            <Route path="/education" element={<EducationCourse/>}/>
            <Route path="/members" element={<Aboutus/>}/>
            <Route path="/news" element={<News/>}/>
            
            <Route path="/contact" element={<ContactSection/>}/>

          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
