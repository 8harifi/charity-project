import React from "react";
import { Link } from "react-router-dom";
//import heroImage from "../../images/heroImage.jpg";
import heroImage from "../../images/heroone.png";

import Stars from "../../images/stars.png";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <div className="bg-[#e0e0e0] font-kook overflow-x-hidden">
      <div className="relative pt-[30px] pb-[110px] lg:pt-[150px]">
        <div className="container mx-auto px-10">
          <div className="flex flex-wrap items-center">
            
            {/* متن سمت راست */}
            <div className="w-full lg:w-6/12 px-5 pt-10 text-right">
              <div className="hero-content">

                <motion.div
                  variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 75 },
                  }}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.6 }}
                >
                  {/* عنوان اصلی با دو خط */}
                  <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-emerald-700 mb-8 font-bold leading-tight">
                    <span className="text-5xl sm:text-7xl block">
                      همراه سلامت،
                    </span>
                    <span className="text-5xl sm:text-7xl block">
                      همراه امید
                    </span>
                  </h1>

                  {/* زیر عنوان */}
                  <h2 className="text-xl sm:text-2xl text-gray-700 mb-40font-semibold">
                    شبکه‌ای برای ارتباط خیرین، بیماران و مراکز درمانی
                  </h2>

                  <p className="text-gray-600 text-base mb-8 max-w-[520px] ml-auto leading-relaxed">
                    تا کمک‌های شما سریع‌تر، شفاف‌تر و مؤثرتر به دست نیازمندان برسد.
                  </p>
                </motion.div>

                {/* دکمه‌ها */}
                <motion.div
                  variants={{
                    visible: { opacity: 1, x: 0 },
                    hidden: { opacity: 0, x: -75 },
                  }}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <ul className="flex flex-wrap gap-4 justify-start w-full">

                    <li>
                      <Link
                        to="/campaigns"
                        className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition duration-300 shadow-md hover:shadow-lg"
                      >
                        مشاهده نیازمندی‌ها
                      </Link>
                    </li>

                    <li>
                      <Link
                        to="/signuprole"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
                      >
                        ثبت‌نام خیرین
                      </Link>
                    </li>

                  </ul>
                </motion.div>

                {/* آمار سریع */}
                <motion.div
                  variants={{
                    visible: { opacity: 1 },
                    hidden: { opacity: 0 },
                  }}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="pt-16"
                >
                  <div className="flex gap-10 text-right justify-start lg:justify-start flex-wrap">

                    <div>
                      <h3 className="text-2xl font-bold text-emerald-600">
                        ۱۲۰۰+
                      </h3>
                      <p className="text-gray-600 text-sm">
                        بیمار حمایت شده
                      </p>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-blue-600">
                        ۴۵۰+
                      </h3>
                      <p className="text-gray-600 text-sm">
                        خیر عضو شبکه
                      </p>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-purple-600">
                        ۸۰+
                      </h3>
                      <p className="text-gray-600 text-sm">
                        مرکز نیکوکاری
                      </p>
                    </div>

                  </div>
                </motion.div>

              </div>
            </div>

            {/* تصویر */}
            <div className="w-full lg:w-6/12 px-4 mt-10 lg:mt-0">
              <div className="relative z-10 inline-block pt-11 lg:pt-0">

                <motion.img
                  variants={{
                    visible: { opacity: 1, x: 0 },
                    hidden: { opacity: 0, x: 75 },
                  }}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.6 }}
                  src={heroImage}
                  alt="همراه سلامت، همراه امید"
                  className="max-w-full rounded-l-[20%] rounded-br-[6%] shadow-2xl"
                />

                <img
                  src={Stars}
                  alt="ستاره"
                  className="z-20 w-28 absolute top-[-40px] left-[-20px] opacity-70"
                />

                <span className="absolute -right-8 -bottom-8 z-[-1]">
                  <svg
                    width="93"
                    height="93"
                    viewBox="0 0 93 93"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {Array.from({ length: 25 }).map((_, i) => (
                      <circle
                        key={i}
                        cx={(i % 5) * 22 + 2.5}
                        cy={Math.floor(i / 5) * 22 + 2.5}
                        r="2.5"
                        fill="#3B82F6"
                      />
                    ))}
                  </svg>
                </span>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;