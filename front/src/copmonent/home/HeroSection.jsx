import React from "react";
import { Link } from "react-router-dom";
import heroImage from "../../images/heroImage.jpg";
import Stars from "../../images/stars.png";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <div className=" bg-[#e0e0e0] font-kook overflow-x-hidden">
      <div className="relative pt-[70px] pb-[110px] lg:pt-[150px] ">
        <div className="container mx-auto px-10">
          <div className="flex flex-wrap items-center">
            
            {/* متن سمت راست */}
            <div className="w-full lg:w-6/12 px-4  text-right">
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
                  <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-emerald-700 mb-5 font-bold leading-snug text-3xl sm:text-5xl ">
                    
        
                  <span className=" sm:text-8xl  -mt-18 text-8xl" > سامانه جامع جلب مشارکت‌های خیرخواهانه حوزه سلامت</span>  
                  </h1>

                 
                  <p className="text-gray-700 text-base mb-10 max-w-[520px] ml-auto">
                    بستری برای ایجاد شبکه‌ای گسترده از خیرین، پزشکان،
                    مراکز درمانی و مراکز نیکوکاری با هدف حمایت از بیماران
                    نیازمند، توسعه خدمات سلامت و تقویت مسئولیت اجتماعی.
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
                        to="/needs"
                        className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition"
                      >
                        مشاهده نیازمندی‌ها
                      </Link>
                    </li>

                    <li>
                      <Link
                        to="/signuprole"
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
                      >
                        ثبت‌نام در شبکه
                      </Link>
                    </li>

                    <li>
                      <Link
                        to="/donate"
                        className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
                      >
                        کمک مالی
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
                        1200+
                      </h3>
                      <p className="text-gray-600 text-sm">
                        بیمار حمایت شده
                      </p>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-blue-600">
                        450+
                      </h3>
                      <p className="text-gray-600 text-sm">
                        خیر عضو شبکه
                      </p>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-purple-600">
                        80+
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
                  alt="hero"
                  className="max-w-full rounded-l-[20%] rounded-br-[6%]"
                />

                <img
                  src={Stars}
                  alt="stars"
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
