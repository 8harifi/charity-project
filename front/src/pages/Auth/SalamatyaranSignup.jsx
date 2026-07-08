import React, {useState, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import RenderDropdown from "./components/DropDown";
import {saveStep, loadStep} from "./utils/signupStorage";
import {lookupApi} from "../../API/lookupApi";
import {useLookupOptions, findLookupOption, useMultipleLookups} from "../../hooks/useLookupOptions";
import { validateHealthAssistantStep1 } from "./utils/signupValidation";
import RequiredLabel from "../../components/RequiredLabel";
import { useEnterSubmit } from "../../hooks/useEnterSubmit";
import SignupStepProgress from "./components/SignupStepProgress";

const HA_SIGNUP_STEPS = ["نوع همکاری", "اطلاعات و مدارک", "رمز عبور"];

const SalamtyaranSignup = () => {
  const [profileType, setProfileType] = useState("individual");
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [nationalCode, setNationalCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [organizationType, setOrganizationType] = useState(null);
  const [orgName, setOrgName] = useState("");
  const [directorFirstName, setDirectorFirstName] = useState("")
  const [directorLastName, setDirectorLastName] = useState("")
  const [directorPhoneNumber, setDirectorPhoneNumber] = useState("")
  const [directorLandlineNumber, setDirectorLandlineNumber] = useState("")

  const {genders, specialities, loading: lookupsLoading} = useMultipleLookups({
    genders: lookupApi.genders,
    specialities: lookupApi.specialties,
  });

  const {options: orgTypes, loading: orgTypesLoading} =
    useLookupOptions(lookupApi.organizationTypes);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("signupRole", "salamtyaran");
    const saved = loadStep("salamtyaran", 1);
    if (!saved) return;
    setProfileType(
      saved.profile_type ||
      (saved.referrerType === "legal" ? "organization" : "individual")
    );
    setFirstName(saved.first_name || "");
    setLastName(saved.last_name || "");
    setNationalCode(saved.national_code || saved.nationalCode || "");
    setPhoneNumber(saved.phone_number || saved.phoneNumber || "");
    setOrgName(saved.org_name || saved.legalName || "");
    setDirectorFirstName(saved.director_first_name || "");
    setDirectorLastName(saved.director_last_name || "");
    setDirectorPhoneNumber(saved.director_phone_number || "");
    setDirectorLandlineNumber(saved.director_landline_number || "");
  }, []);

  useEffect(() => {
    if (orgTypesLoading || lookupsLoading) return;
    const saved = loadStep("salamtyaran", 1);
    if (!saved) return;
    setOrganizationType(
      findLookupOption(orgTypes, saved.organization_type ?? saved.legalType)
    );
    setGender(findLookupOption(genders, saved.gender));
  }, [orgTypes, orgTypesLoading, lookupsLoading, genders]);

  const validateForm = () => {
    return validateHealthAssistantStep1(
      {
        organization_type: organizationType,
        org_name: orgName,
        director_first_name: directorFirstName,
        director_last_name: directorLastName,
        director_phone_number: directorPhoneNumber,
        first_name: firstName,
        last_name: lastName,
        gender,
        national_code: nationalCode,
        phone_number: phoneNumber,
      },
      profileType
    );
  };

  const handleSignup = () => {
    const err = validateForm();
    if (err) return setError(err);

    saveStep("salamtyaran", 1, {
      profile_type: profileType,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      gender: gender?.value ?? gender,
      national_code: nationalCode,
      phone_number: phoneNumber,

      organization_type: organizationType?.value ?? organizationType,
      org_name: orgName.trim(),
      organization_name: orgName.trim(),
      director_first_name: directorFirstName.trim(),
      director_last_name: directorLastName.trim(),
      director_phone_number: directorPhoneNumber,
      director_landline_number: directorLandlineNumber
    });

    if (profileType === "individual") {
      navigate("/SalamtyaranSignupIndividual");
    } else if (profileType === "organization") {
      navigate("/SalamtyaranSignupOrganization");
    }
  };


  const onEnterSubmit = useEnterSubmit(handleSignup);

  return (
    <div
      className="font-kook min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-10 border border-blue-100" onKeyDown={onEnterSubmit}>
        <h1 className="text-3xl font-bold text-right text-blue-900 mb-2">
          عضویت سلامتیار / مددکار
        </h1>
        <p className="text-blue-600 text-right mb-6">نوع ثبت‌نام را انتخاب کنید</p>

        <SignupStepProgress steps={HA_SIGNUP_STEPS} currentStep={1} />

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={profileType === "individual"}
              onChange={() => setProfileType("individual")}
              className="accent-blue-600"
            />
            <span>شخص حقیقی</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={profileType === "organization"}
              onChange={() => setProfileType("organization")}
              className="accent-blue-600"
            />
            <span>شخص حقوقی (مجموعه)</span>
          </label>
        </div>

        {profileType === "organization" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <RenderDropdown
              value={organizationType}
              setValue={setOrganizationType}
              options={orgTypes}
              name="organization_type"
              placeholder="نوع مجموعه"
              label="نوع مجموعه"
              loading={orgTypesLoading}
            />
            <div>
              <RequiredLabel className="block mb-2 text-blue-700">نام مجموعه</RequiredLabel>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-right text-blue-950"
                placeholder="نام مجموعه"
              />
            </div>
            <div>
              <RequiredLabel required={false} className="block mb-2 text-blue-700">نام رئیس مجموعه</RequiredLabel>
              <input
                type="text"
                value={directorFirstName}
                onChange={(e) => setDirectorFirstName(e.target.value)}
                className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-right text-blue-950"
                placeholder="نام رئیس مجموعه"
              />
            </div>
            <div>
              <RequiredLabel required={false} className="block mb-2 text-blue-700">نام خانوادگی رئیس مجموعه</RequiredLabel>
              <input
                type="text"
                value={directorLastName}
                onChange={(e) => setDirectorLastName(e.target.value)}
                className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-right text-blue-950"
                placeholder="نام خانوادگی رئیس مجموعه"
              />
            </div>
            <div>
              <RequiredLabel className="block mb-2 text-blue-700">شماره تلفن همراه رئیس مجموعه</RequiredLabel>
              <input
                type="text"
                value={directorPhoneNumber}
                onChange={(e) => setDirectorPhoneNumber(e.target.value)}
                className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-right text-blue-950"
                placeholder="شماره تلفن همراه رئیس مجموعه"
              />
            </div>
            <div>
              <label className="block mb-2 text-blue-700">شماره تلفن ثابت رئیس مجموعه</label>
              <input
                type="text"
                value={directorLandlineNumber}
                onChange={(e) => setDirectorLandlineNumber(e.target.value)}
                className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-right text-blue-950"
                placeholder="شماره تلفن ثابت رئیس مجموعه"
              />
            </div>
          </div>
        )}

        {profileType === "individual" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* نام */}
            <div className="relative">
              <RequiredLabel className="text-blue-700 mb-2 text-sm sm:text-base" htmlFor="first_name">نام</RequiredLabel>
              <input
                id="first_name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="نام خود را وارد کنید"
                className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-sm sm:text-base text-blue-950 transition-all"
              />
            </div>

            {/* نام خانوادگی */}
            <div className="relative">
              <RequiredLabel required={false} className="text-blue-700 mb-2 text-sm sm:text-base" htmlFor="last_name">نام خانوادگی</RequiredLabel>
              <input
                id="last_name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="نام خانوادگی خود را وارد کنید"
                className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-sm sm:text-base text-blue-950 transition-all"
              />
            </div>

            {/* جنسیت */}
            <div className="relative">
              <RenderDropdown
                value={gender}
                setValue={setGender}
                options={genders}
                name="gender"
                placeholder="انتخاب جنسیت"
                label="جنسیت"
                loading={lookupsLoading}
                required
              />
            </div>

            {/* کد ملی */}
            <div className="relative">
              <RequiredLabel className="text-blue-700 mb-2 text-sm sm:text-base" htmlFor="code">کد ملی</RequiredLabel>
              <input
                id="code"
                type="text"
                value={nationalCode}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d{0,10}$/.test(v)) setNationalCode(v);
                }}
                maxLength={10}
                inputMode="numeric"
                pattern="\d*"
                placeholder="کد ملی خود را وارد کنید"
                className="w-full p-3 sm:p-4 text-blue-950 bg-blue-50/50 rounded-xl sm:rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-sm sm:text-base transition-all"
              />
            </div>

            <div className="relative">
              <RequiredLabel className="text-blue-700 mb-2 text-sm sm:text-base" htmlFor="phone">تلفن همراه</RequiredLabel>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d{0,11}$/.test(v)) setPhoneNumber(v);
                }}
                maxLength={11}
                inputMode="numeric"
                pattern="\d*"
                placeholder="شماره تلفن همراه پزشک یا منشی"
                className="w-full p-3 sm:p-4 bg-blue-50/50 text-blue-950 rounded-xl sm:rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-sm sm:text-base transition-all"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm text-right mb-4">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSignup}
          className="w-full py-4 bg-gradient-to-l from-blue-500 to-emerald-600 text-white rounded-2xl font-bold"
        >
          مرحله بعد
        </button>

        <div className="text-center mt-4">
          <Link to="/loginpage" className="text-blue-600 font-bold">
            قبلا ثبت‌نام کرده‌اید؟ وارد شوید
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SalamtyaranSignup;
