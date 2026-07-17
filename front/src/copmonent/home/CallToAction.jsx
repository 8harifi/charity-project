import React, { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

const CallToAction = () => {
  const ref = useRef();
  const isInView = useInView(ref);
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView]);

  return (
    <div className="font-kook">
      <div className="w-[70%] font-kook h-[2px] bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      <section className="py-20 lg:py-[120px] bg-gray-100/50">
        <div className="container mx-auto">
          <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 relative z-10 sm:-mt-10 sm:-mb-10 overflow-x-hidden rounded-3xl py-12 px-8 md:p-[70px] shadow-2xl">
            <div className="-mx-4 flex flex-wrap items-center">
              <motion.div
                ref={ref}
                variants={{
                  visible: { opacity: 1, x: 0 },
                  hidden: { opacity: 0, x: -75 },
                }}
                initial="hidden"
                animate={mainControls}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="w-full px-4 lg:w-1/2"
              >
                <span className="mb-2 text-base font-semibold text-blue-200 flex items-center gap-2">
                  با هر قدم، زندگی‌ها را تغییر دهیم
                </span>
                <h2 className="mb-6 text-3xl font-bold leading-tight text-white sm:mb-8 sm:text-[38px] lg:mb-0">
                  دست‌های مهربان شما
                  <br className="xs:block hidden" />
                  <span className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                    لبخند
                  </span>
                  {" "}می‌آورد
                </h2>
              </motion.div>
              <div className="w-full px-4 lg:w-1/2">
                <div className="flex sm:flex-wrap gap-2 sm:justify-end">
                  <motion.div
                    ref={ref}
                    variants={{
                      visible: { opacity: 1, x: 0 },
                      hidden: { opacity: 0, x: 75 },
                    }}
                    initial="hidden"
                    animate={mainControls}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <button className="hover:bg-white/20 my-1 mr-4 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm py-4 px-6 text-base font-medium text-white transition hover:bg-opacity-100 md:px-9 lg:px-8 xl:px-9 border border-white/20">
                    
                      مشارکت در خیریه
                    </button>
                  </motion.div>
                  <motion.div
                    ref={ref}
                    variants={{
                      visible: { opacity: 1, x: 0 },
                      hidden: { opacity: 0, x: 75 },
                    }}
                    initial="hidden"
                    animate={mainControls}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <button className="my-1 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 py-4 px-6 text-base font-medium text-white transition hover:from-cyan-500 hover:to-blue-600 md:px-9 lg:px-6 xl:px-9 shadow-lg shadow-blue-500/30">
                    
                      اخبار
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
            <div>
              <span className="absolute top-0 left-0 z-[-1]">
                <svg
                  width="189"
                  height="162"
                  viewBox="0 0 189 162"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <ellipse
                    cx="16"
                    cy="-16.5"
                    rx="173"
                    ry="178.5"
                    transform="rotate(180 16 -16.5)"
                    fill="url(#paint0_linear)"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear"
                      x1="-157"
                      y1="-107.754"
                      x2="98.5011"
                      y2="-106.425"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="white" stopOpacity="0.07" />
                      <stop offset="1" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <span className="absolute bottom-0 right-0 z-[-1]">
                <svg
                  width="191"
                  height="208"
                  viewBox="0 0 191 208"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <ellipse
                    cx="173"
                    cy="178.5"
                    rx="173"
                    ry="178.5"
                    fill="url(#paint0_linear)"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear"
                      x1="-3.27832e-05"
                      y1="87.2457"
                      x2="255.501"
                      y2="88.5747"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="white" stopOpacity="0.07" />
                      <stop offset="1" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>
      <div className="flex justify-end ml-[30%] w-[70%] h-[2px] bg-gradient-to-r from-blue-600 to-indigo-600"></div>
    </div>
  );
};

export default CallToAction;