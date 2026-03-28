
import React, { useEffect, useRef } from "react";
import logo1 from "../../../src/images/Features/f1.png";
import logo2 from "../../../src/images/Features/f2.png";
import logo3 from "../../../src/images/Features/f3.png";
import logo4 from "../../../src/images/Features/f4.png";
import logo5 from "../../../src/images/Features/f5.png";
import logo6 from "../../../src/images/Features/f6.png";
import image1 from "../../../src/images/Features/fb11.png";
import image2 from "../../../src/images/Features/fb22.png";
import { useAnimation, useInView, motion } from "framer-motion";

const FeatureSection = () => {
  const { innerWidth: width } = window;
  const ref = useRef(null);
  const isInView = useInView(ref);

  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView]);

  return (
    <>
      <div className=" font-kook w-[70%] h-[2px] bg-gradient-to-r from-blue-400 to-violet-500"></div>
      <div className="max-w-screen font-kook overflow-x-hidden font-poppins">
        {width < 631 ? (
          <section className="text-black">
            <div className="container max-w-xl p-6 py-12 mx-auto space-y-24 lg:px-8 lg:max-w-7xl">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-center sm:text-5xl">
                  سامانه جامع جلب مشارکت‌های خیرخواهانه حوزه سلامت
                </h2>
                <p className="max-w-3xl mx-auto mt-4 text-xl text-center">
                  شبکه‌ای با هدف هم‌افزایی و تعامل در حوزه سلامت.
                </p>
              </div>
              <div className="grid lg:gap-8 lg:grid-cols-2 lg:items-center">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    معرفی سامانه
                  </h3>
                  <p className="mt-3 text-lg">
                    معرفی توانمندی‌ها و توانایی‌های مراکز نیکوکاری و ایجاد زیرساختی موثر برای تعامل بین اعضا.
                  </p>
                  <div className="mt-12 space-y-12">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 rounded-md dark:text-gray-900">
                          <img src={logo1} alt="logo1" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium leading-6">
                          آگاهی از نیازمندی‌های حوزه سلامت
                        </h4>
                        <p className="mt-2">
                          شناسایی نیازمندی‌های بیماران و جمع‌آوری اطلاعات برای توزیع مناسب مشارکت‌ها.
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 rounded-md dark:text-gray-900">
                          <img src={logo2} alt="logo2" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium leading-6">
                          ایجاد مراکز نمایندگی مجازی
                        </h4>
                        <p className="mt-2">
                          ایجاد مراکز نمایندگی مجازی در مناطق محروم برای تسهیل دسترسی به خدمات.
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 rounded-md dark:text-gray-900">
                          <img src={logo3} alt="logo3" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium leading-6">
                          تشکیل کانون خیرین و سلامت‌یاران
                        </h4>
                        <p className="mt-2">
                          جلب مشارکت خیرین و سلامت‌یاران برای موفقیت در اهداف سلامت.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div aria-hidden="true" className="mt-10 lg:mt-0">
                    <img
                      src={image1}
                      alt="image1"
                      className="taos:translate-x-[200px] taos:opacity-0 hover:-translate-y-2 transition ease-in duration-300 hover:drop-shadow-xl mx-auto rounded-lg shadow-lg dark:bg-gray-500"
                    />
                  </div>
                </div>
              </div>
 <div>
                <div className="grid lg:gap-8 lg:grid-cols-2 lg:items-center">
                  <div className="lg:col-start-2">
                    <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      اهداف و برنامه‌های ما
                    </h3>
                    <p className="mt-3 text-lg">
                      ما به دنبال تسهیل و تسریع در درمان بیماران نیازمند و ارتقاء کیفیت خدمات هستیم.
                    </p>
                    <div className="mt-12 space-y-12">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          < div className = "flex items-center justify-center w-12 h-12 rounded-md dark:text-gray-900">
                            <img src={logo4} alt="logo4" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium leading-6">
                            جمع‌آوری نیازمندی‌های مناطق محروم
                          </h4>
                          <p className="mt-2">
                            شناسایی و جمع‌آوری نیازمندی‌های درمانی بیماران ساکن در مناطق محروم.
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-12 h-12 rounded-md dark:text-gray-900">
                            <img src={logo5} alt="logo5" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium leading-6">
                            ترویج مسئولیت اجتماعی
                          </h4>
                          <p className="mt-2">
                            ترویج و تشویق مشارکت سازمان‌ها و شرکت‌ها در حوزه سلامت.
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-sink-0">
                          <div className="flex items-center justify-center w-12 h-12 rounded-md dark:text-gray-900">
                            <img src={logo6} alt="logo6" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium leading-6">
                            آموزش و توانمندسازی
                          </h4>
                          <p className="mt-2">
                            برگزاری دوره‌های آموزشی برای توانمندسازی اعضا و ارائه مشاوره‌های لازم.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 lg:mt-0 lg:col-start-1 lg:row-start-1">
                    <img
                      src={image2}
                      alt="image2"
                      className="taos:translate-x-[200px] taos:opacity-0 hover:-translate-y-2 transition ease-in-out duration-300 hover:drop-shadow-xl mx-auto rounded-lg shadow-lg dark:bg-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="text-black">
            <div className="container max-w-xl p-6 py-12 mx-auto space-y-24 lg:px-8 lg:max-w-7xl">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-center sm:text-5xl">
                  سامانه جامع جلب مشارکت‌های خیرخواهانه حوزه سلامت
                </h2>
                <p className="max-w-3xl mx-auto mt-4 text-xl text-center">
                  شبکه‌ای با هدف هم‌افزایی و تعامل در حوزه سلامت.
                </p>
              </div>
              <div className="grid lg:gap-8 lg:grid-cols-2 lg:items-center">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    معرفی سامانه
                  </h3>
                  <p className="mt-3 text-lg">
                    معرفی توانمندی‌ها و توانایی‌های مراکز نیکوکاری و ایجاد زیرساختی موثر برای تعامل بین اعضا.
                  </p>
                  <div className="mt-12 space-y-12">
                    <motion.div
                      ref={ref}
                      variants={{
                        hidden: { opacity: 0, y: 75 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      initial="hidden"
                      animate={mainControls}
                      transition={{ duration: 0.5, delay: 0.15 }}
                      className="flex"
                    >
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 rounded-md dark:text-gray-900">
                          <img src={logo1} alt="logo1" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium leading-6">
                          آگاهی از نیازمندی‌های حوزه سلامت
                        </h4>
                        <p className="mt-2">
                          شناسایی نیازمندی‌های بیماران و جمع‌آوری اطلاعات برای توزیع مناسب مشارکت‌ها.
                        </p>
                      </div>
                    </motion.div>
                    <motion.div
                      ref={ref}
                      variants={{
                        hidden: { opacity: 0, y: 75 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      initial="hidden"
                      animate={mainControls}
                      transition={{ duration: 0.5, delay: 0.25 }}
                      className="flex"
                    >
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 rounded-md dark:text-gray-900">
                          <img src={logo2} alt="logo2" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium leading-6">
                          ایجاد مراکز نمایندگی مجازی
                        </h4>
                        <p className="mt-2">
                          ایجاد مراکز نمایندگی مجازی در مناطق محروم برای تسهیل دسترسی به خدمات.
                        </p>
                      </div>
                    </motion.div>
                    <motion.div
                      ref={ref}
                      variants={{
                        hidden: { opacity: 0, y: 75 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      initial="hidden"
                      animate={mainControls}
                      transition={{ duration: 0.5, delay: 0.35 }}
                      className="flex"
                    >
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 rounded-md dark:text-gray-900">
                          <img src={logo3} alt="logo3" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium leading-6">
                          تشکیل کانون خیرین و سلامت‌یاران
                        </h4>
                        <p className="mt-2">
                          جلب مشارکت خیرین و سلامت‌یاران برای موفقیت در اهداف سلامت.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
                <div ref={ref}>
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: 75 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    initial="hidden"
                    animate={mainControls}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    aria-hidden="true"
                    className="mt-10 lg:mt-0"
                  >
                    <img
                      src={image1}
                      alt="image1"
                      className="taos:translate-x-[200px] taos:opacity-0 hover:-translate-y-2 transition ease-out duration-300 hover:drop-shadow-xl mx-auto rounded-lg shadow-lg dark:bg-gray-500"
                    />
                  </motion.div>
                </div>
              </div>
              <div>
                <div className="grid lg:gap-8 lg:grid-cols-2 lg:items-center">
                  <div className="lg:col-start-2">
                    <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      اهداف و برنامه‌های ما
                    </h3>
                    <p className="mt-3 text-lg">
                      ما به دنبال تسهیل و تسریع در درمان بیماران نیازمند و ارتقاء کیفیت خدمات هستیم.
                    </p>
                    <div className="mt-12 space-y-12">
                      <motion.div
                        ref={ref}
                        variants={{
                          hidden: { opacity: 0, y: -75 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        initial="hidden"
                        animate={mainControls}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="flex"
                      >
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-12 h-12 rounded-md dark:text-gray-900">
                            <img src={logo4} alt="logo4" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium leading-6">
                            جمع‌آوری نیازمندی‌های مناطق محروم
                          </h4>
                          <p className="mt-2">
                            شناسایی و جمع‌آوری نیازمندی‌های درمانی بیماران ساکن در مناطق محروم.
                          </p>
                        </div>
                      </motion.div>
                      <motion.div
                        ref={ref}
                        variants={{
                          hidden: { opacity: 0, y: -75 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        initial="hidden"
                        animate={mainControls}
                        transition={{ duration: 0.5, delay: 0.35 }}
                        className="flex"
                      >
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-12 h-12 rounded-md dark:text-gray-900">
                            <img src={logo5} alt="logo5" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium leading-6">
                            ترویج مسئولیت اجتماعی
                          </h4>
                          <p className="mt-2">
                            ترویج و تشویق مشارکت سازمان‌ها و شرکت‌ها در حوزه سلامت.
                          </p>
                        </div>
                      </motion.div>
                      <motion.div
                        ref={ref}
                        variants={{
                          hidden: { opacity: 0, y: -75 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        initial="hidden"
                        animate={mainControls}
                        transition={{ duration: 0.5, delay: 0.55 }}
                        className="flex"
                      >
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-12 h-12 rounded-md dark:text-gray-900">
                            <img src={logo6} alt="logo6" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium leading-6">
                            آموزش و توانمندسازی
                          </h4>
                          <p className="mt-2">
                            برگزاری دوره‌های آموزشی برای توانمندسازی اعضا و ارائه مشاوره‌های لازم.
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                  <motion.div
                    ref={ref}
                    variants={{
                      hidden: { opacity: 0, x: -75 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    initial="hidden"
                    animate={mainControls}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="mt-10 lg:mt-0 lg:col-start-1 lg:row-start-1"
                  >
                    <img
                      src={image2}
                      alt="image2"
                      className="taos:translate-x-[200px] taos:opacity-0 hover:-translate-y-2 transition ease-in-out duration-300 hover:drop-shadow-xl mx-auto rounded-lg shadow-lg dark:bg-gray-500"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* پایان */}
      </div>
      <div className="flex justify-end ml-[30%] w-[70%] h-[2px] bg-gradient-to-r from-blue-400 to-violet-500"></div>
    </>
  );
};

export default FeatureSection;

