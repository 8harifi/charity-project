import React, {useState} from "react";
import Icon from "../images/level.png";
import {Link} from "react-router-dom";
import {GiHamburgerMenu} from "react-icons/gi";
import profileImage from "../images/profile.png";
import {useAuth} from "../context/AuthContext";


const Header = () => {
  const [open, setOpen] = useState(false);

  const {isLogin, user, logout} = useAuth();


  return (
    <div className="max-w-screen overflow-x-hidden font-kook" dir="rtl">
      <nav
        className="bg-gray-900 fixed px-2 sm:h-auto sm:w-full w-screen z-20 left-0 right-0 top-0 border-b border-gray-400">
        {/* desktop nav */}
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto sm:p-4 pb-2">
          {/* لوگو و نام سامانه */}
          <Link to="/" className="flex items-center">
            <img
              src={Icon}
              alt="لوگو"
              className="hidden sm:block sm:w-[35px] sm:h-[35px]"
            />
            <span className="mr-2 mt-2 sm:mt-0 text-white  text-base sm:text-lg">
              خیرین
            </span>
          </Link>

          {/* منوی اصلی دسکتاپ */}
          <div className="flex">
            <ul className="sm:flex justify-center hidden">
              <li className="p-2 ml-4 text-white hover:text-blue-400 cursor-pointer">
                <Link to="/">خانه</Link>
              </li>

              <li className="p-2 ml-4 text-white hover:text-blue-400 cursor-pointer">
                <Link to="/campaigns">فراخوان‌ها و نیازمندی‌ها</Link>
              </li>
              <li className="p-2 ml-4 text-white hover:text-blue-400 cursor-pointer">
                <Link to="/education">آموزش</Link>
              </li>
              <li className="p-2 ml-4 text-white hover:text-blue-400 cursor-pointer">
                <Link to="/members">آشنایی با ما</Link>
              </li>
              <li className="p-2 ml-4 text-white hover:text-blue-400 cursor-pointer">
                <Link to="/news">اخبار</Link>
              </li>
              <li className="p-2 text-white hover:text-blue-400 cursor-pointer">
                <Link to="/contact">تماس با ما</Link>
              </li>
            </ul>
          </div>

          {/* دکمه‌ها (دسکتاپ) + منوی موبایل */}
          <div className="flex items-center">
            {/* دکمه کمک به بیماران */}
            <button
              type="button"
              className="bg-green-600 px-4 py-2 text-white hidden sm:block rounded-xl ml-2 hover:bg-green-500 text-sm"
            >
              <Link to="/donate">کمک به بیماران</Link>
            </button>

            {/* دکمه ورود / عضویت */}
            {!isLogin && (
              <>
                <div className="relative hidden sm:block group">
                  <button
                    className="flex items-center gap-1 text-white border border-blue-400 font-medium rounded-lg ml-2 text-sm px-4 py-2 hover:bg-blue-300/10">
                    عضویت
                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  <div
                    className="
      absolute left-0 mt-2 w-40 bg-gray-900 border border-blue-400 rounded-lg py-2
      opacity-0 scale-95 invisible
      group-hover:opacity-100 group-hover:scale-100 group-hover:visible
      transition-all duration-300 origin-top
    "
                  >
                    <Link
                      to="/authpatient"
                      className="block px-4 py-2 text-white hover:bg-blue-300/10"
                    >
                      بیماران
                    </Link>

                    <Link
                      to="/doctor"
                      className="block px-4 py-2 text-white hover:bg-blue-300/10"
                    >
                      پزشکان
                    </Link>

                    <Link
                      to="/authCharitable"
                      className="block px-4 py-2 text-white hover:bg-blue-300/10"
                    >
                      خیرین
                    </Link>

                    <Link
                      to="/SalamtyaranSignup"
                      className="block px-4 py-2 text-white hover:bg-blue-300/10"
                    >
                      سلامتیاران و مددکاران
                    </Link>
                    {/*<Link*/}
                    {/*  to="/healthservicecenter"*/}
                    {/*  className="block px-4 py-2 text-white hover:bg-blue-300/10"*/}
                    {/*>*/}
                    {/*  مراکز خدمات سلامت*/}
                    {/*</Link>*/}
                    {/*<Link*/}
                    {/*  to="/charitycenter"*/}
                    {/*  className="block px-4 py-2 text-white hover:bg-blue-300/10"*/}
                    {/*>*/}
                    {/*  مراکز نیکوکاری*/}
                    {/*</Link>*/}
                    {/*<Link*/}
                    {/*  to="/socialworkunit"*/}
                    {/*  className="block px-4 py-2 text-white hover:bg-blue-300/10"*/}
                    {/*>*/}
                    {/*  واحد مددکاری سازمان‌ها*/}
                    {/*</Link>*/}
                  </div>
                </div>

                <div className="relative hidden sm:block group">
                  <Link to="loginpage"
                        className="flex items-center gap-1 text-white border border-blue-400 font-medium rounded-lg ml-2 text-sm px-4 py-2 hover:bg-blue-300/10">
                    ورود

                  </Link>
                </div>
              </>
            )}

            {/* بخش پروفایل (وقتی کاربر وارد شده) – می‌تونی شرطی‌اش کنی */}
            {isLogin && (
              <>
                {/* پروفایل */}
                <div className=" w-[85%] mt-2">
                  <div className="flex cursor-pointer mt-3">
                    <img
                      src={profileImage}
                      className="w-14 mr-8 mt-1 rounded-full"
                    />
                    <div className="my-auto mr-4">
                      <p className="text-white font-semibold">
                        {user?.name || "کاربر"}
                      </p>
                      <p className="text-xs text-gray-200/70">
                        {user?.nationalCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* دکمه خروج */}
                <div className="flex justify-start">
                  <div className="mt-4 mr-8 ">
                    <button
                      onClick={logout}
                      className="text-white font-semibold border rounded-xl py-2 px-4 hover:bg-gray-100/20 "
                    >
                      خروج
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* آیکون منوی موبایل */}
            <button onClick={() => setOpen(!open)} className="sm:hidden block">
              <GiHamburgerMenu size={28} className="mt-2 ml-2 text-white/80"/>
            </button>
          </div>
        </div>
        {/* desktop nav end */}

        {/* منوی موبایل */}
        <div className={`${open ? "block" : "hidden"} h-auto pb-4`}>
          <ul className="pt-4">
            <li className="text-white hover:text-blue-400 font-semibold pr-8 cursor-pointer pb-3">
              <Link to="/" onClick={() => setOpen(false)}>
                خانه
              </Link>
            </li>

            <li className="text-white hover:text-blue-400 font-semibold pr-8 cursor-pointer pb-3">
              <Link to="/campaigns" onClick={() => setOpen(false)}>
                فراخوان‌ها و نیازمندی‌ها
              </Link>
            </li>
            <li className="text-white hover:text-blue-400 font-semibold pr-8 cursor-pointer pb-3">
              <Link to="/education" onClick={() => setOpen(false)}>
                آموزش
              </Link>
            </li>
            <li className="text-white hover:text-blue-400 font-semibold pr-8 cursor-pointer pb-3">
              <Link to="/members" onClick={() => setOpen(false)}>
                {" "}
                معرفی سامانه{" "}
              </Link>
            </li>
            <li className="text-white hover:text-blue-400 font-semibold pr-8 cursor-pointer pb-3">
              <Link to="/news" onClick={() => setOpen(false)}>
                اخبار
              </Link>
            </li>
            <li className="text-white hover:text-blue-400 font-semibold pr-8 cursor-pointer pb-4">
              <Link to="/contact" onClick={() => setOpen(false)}>
                تماس با ما
              </Link>
            </li>
          </ul>

          {/* دکمه‌های موبایل */}
          <div className="flex flex-col px-8 gap-3 mt-2">
            {/* کمک به بیماران */}
            <button className="bg-green-600 text-white font-semibold rounded-xl py-2 hover:bg-green-500">
              <Link to="/donate" onClick={() => setOpen(false)}>
                کمک به بیماران
              </Link>
            </button>
            {!isLogin && (
              <>
                {/* ورود / عضویت Dropdown موبایل */}
                <div className="w-full">
                  <details className="group border border-gray-400/70 rounded-xl">
                    <summary
                      className="flex justify-between items-center cursor-pointer text-white font-semibold py-2 px-3">
                      عضویت
                      <svg
                        className="w-4 h-4 transition-transform duration-300 group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>

                    <div className="bg-gray-900 border-t border-gray-600 rounded-b-xl">
                      <Link
                        to="/authpatient"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-white hover:bg-blue-300/10"
                      >
                        بیماران
                      </Link>

                      <Link
                        to="/doctor"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-white hover:bg-blue-300/10"
                      >
                        پزشکان
                      </Link>

                      <Link
                        to="/authCharitable"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-white hover:bg-blue-300/10"
                      >
                        خیرین
                      </Link>

                      <Link
                        to="/SalamtyaranSignup"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-white hover:bg-blue-300/10"
                      >
                        سلامتیاران و مددکاران
                      </Link>

                      {/*<Link*/}
                      {/*  to="/healthservicecenter"*/}
                      {/*  onClick={() => setOpen(false)}*/}
                      {/*  className="block px-4 py-2 text-white hover:bg-blue-300/10"*/}
                      {/*>*/}
                      {/*  مراکز خدمات سلامت*/}
                      {/*</Link>*/}

                      {/*<Link*/}
                      {/*  to="/charitycenter"*/}
                      {/*  onClick={() => setOpen(false)}*/}
                      {/*  className="block px-4 py-2 text-white hover:bg-blue-300/10"*/}
                      {/*>*/}
                      {/*  مراکز نیکوکاری*/}
                      {/*</Link>*/}

                      {/*<Link*/}
                      {/*  to="/socialworkunit"*/}
                      {/*  onClick={() => setOpen(false)}*/}
                      {/*  className="block px-4 py-2 text-white hover:bg-blue-300/10"*/}
                      {/*>*/}
                      {/*  واحد مددکاری سازمان‌ها*/}
                      {/*</Link>*/}
                    </div>
                  </details>
                </div>

                <div className="w-full">
                  <details className="group border border-gray-400/70 rounded-xl">
                    <summary
                      className="flex justify-between items-center cursor-pointer text-white font-semibold py-2 px-3">
                      ورود
                      <svg
                        className="w-4 h-4 transition-transform duration-300 group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>

                    <div className="bg-gray-900 border-t border-gray-600 rounded-b-xl">
                      <Link
                        to="/loginpage"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-white hover:bg-blue-300/10"
                      >
                        خیرین
                      </Link>

                      <Link
                        to="/"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-white hover:bg-blue-300/10"
                      >
                        بیماران
                      </Link>

                      <Link
                        to="/"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-white hover:bg-blue-300/10"
                      >
                        سلامتیاران و مددکاران
                      </Link>

                      <Link
                        to="/"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-white hover:bg-blue-300/10"
                      >
                        پزشکان
                      </Link>

                      <Link
                        to="/"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-white hover:bg-blue-300/10"
                      >
                        مراکز خدمات سلامت
                      </Link>

                      <Link
                        to="/"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-white hover:bg-blue-300/10"
                      >
                        مراکز نیکوکاری
                      </Link>

                      <Link
                        to="/"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-white hover:bg-blue-300/10"
                      >
                        واحد مددکاری سازمان‌ها
                      </Link>
                    </div>
                  </details>
                </div>
              </>
            )}
          </div>

          {/* بخش پروفایل (وقتی کاربر وارد شده) – می‌تونی شرطی‌اش کنی */}
          {isLogin && (
            <>
              {/* پروفایل */}
              <div className="bg-gray-200/30 h-[1px] w-[85%] mr-[-10px] mt-4">
                <div className="flex cursor-pointer mt-3">
                  <img
                    src={profileImage}
                    className="w-14 mr-8 mt-1 rounded-full"
                  />
                  <div className="my-auto mr-4">
                    <p className="text-white font-semibold">
                      {user?.name || "کاربر"}
                    </p>
                    <p className="text-xs text-gray-200/70">
                      {user?.nationalCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* دکمه خروج */}
              <div className="flex justify-start">
                <div className="mt-4 mr-8">
                  <button
                    onClick={logout}
                    className="text-white font-semibold border rounded-xl py-2 px-4 hover:bg-gray-100/20"
                  >
                    خروج از حساب
                  </button>
                </div>
              </div>
            </>
          )}
          <div className="flex justify-center">
            <p className="mt-4 text-gray-100/40 text-xs text-center">
              کلیه حقوق این سامانه متعلق به شبکه خیرین حوزه سلامت است.
            </p>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
