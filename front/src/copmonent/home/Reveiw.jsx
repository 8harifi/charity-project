import React, { useEffect, useRef } from "react";
import { MdVerified } from "react-icons/md";
import { useAnimation, useInView, motion } from "framer-motion";

const Review = () => {
  const { innerWidth: Width } = window;
  const ref = useRef();
  const isInView = useInView(ref);
  const mainControls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView]);
  
  return (
    <div className=" font-kook overflow-x-hidden max-w-screen font-poppins">
      <section className="bg-gradient-to-b from-blue-50 to-white">
        {Width < 631 ? (
          // نسخه موبایل
          <>
            <div className="container px-6 py-12 mx-auto">
              <div className="grid items-center gap-4 xl:grid-cols-5">
                <div className="max-w-2xl mx-auto rounded-xl shadow-lg bg-gradient-to-r from-blue-100 to-blue-200 p-6 my-8 space-y-4 text-center xl:col-span-2 xl:text-left border-r-4 border-blue-600">
                  <h2 className="text-3xl font-bold text-gray-800">
                    نظرات اعضای شبکه سلامت
                  </h2>
                  <p className="text-gray-700">
                    تجربیات واقعی پزشکان، خیرین، مددکاران و اعضای شبکه از خدمات سامانه جامع مشارکت‌های سلامت
                  </p>
                </div>
                <div className="p-6 xl:col-span-3">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid content-center gap-4">
                      {/* نظر پزشک */}
                      <div className="p-6 rounded-xl shadow-md bg-white border-r-4 border-blue-500">
                        <div className="flex items-center mb-4">
                          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            پزشک داوطلب
                          </div>
                        </div>
                        <p className="text-gray-700 text-justify leading-relaxed">
                          به عنوان پزشکی که سال‌ها در مناطق محروم خدمت کرده‌ام، این سامانه واقعاً تحول‌آفرین بوده. توانستم از طریق مشاوره آنلاین به بیماران مناطق دورافتاده کمک کنم. سیستم ارجاع بیماران بسیار دقیق و سازمان‌یافته است.
                        </p>
                        <div className="flex items-center mt-6 space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            ر.ا
                          </div>
                          <div>
                            <p className="text-md font-semibold text-gray-800">دکتر رضا احمدی</p>
                            <p className="text-sm text-gray-500">متخصص داخلی - ۵ سال عضویت</p>
                          </div>
                          <div className="flex">
                            <MdVerified
                              size={Width < 631 ? 30 : 35}
                              className="text-blue-500 ml-2"
                            />
                          </div>
                        </div>
                      </div>

                      {/* نظر خیر */}
                      <div className="p-6 rounded-xl shadow-md bg-gradient-to-r from-blue-50 to-white border-r-4 border-blue-400">
                        <div className="flex items-center mb-4">
                          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            خیر سلامت
                          </div>
                        </div>
                        <p className="text-gray-700 text-justify leading-relaxed">
                          شفافیت مالی این سامانه اعتماد من را جلب کرد. می‌توانم دقیقاً ببینم کمک‌هایم چگونه و برای چه کسی هزینه شده. سیستم پرداخت مستمری بسیار کاربردی است و امکان کمک هدفمند به بیماران خاص را فراهم کرده.
                        </p>
                        <div className="flex items-center mt-6 space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            م.ک
                          </div>
                          <div>
                            <p className="text-md font-semibold text-gray-800">محمد کریمی</p>
                            <p className="text-sm text-gray-500">خیر سلامت - ۳ سال مشارکت</p>
                          </div>
                          <div className="flex">
                            <MdVerified
                              size={Width < 631 ? 30 : 35}
                              className="text-blue-500 ml-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid content-center gap-4">
                      {/* نظر مددکار */}
                      <div className="p-6 rounded-xl shadow-md bg-gradient-to-r from-blue-50 to-white border-r-4 border-blue-400">
                        <div className="flex items-center mb-4">
                          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            مددکار بیمارستان
                          </div>
                        </div>
                        <p className="text-gray-700 text-justify leading-relaxed">
                          سیستم ارجاع بیماران نیازمند بین مراکز نیکوکاری و بیمارستان‌ها واقعاً کار ما را آسان کرده. دیگر نیازی به تماس‌های متعدد نیست. همه اطلاعات بیمار به صورت یکپارچه در دسترس است و پیگیری موارد بسیار ساده شده.
                        </p>
                        <div className="flex items-center mt-6 space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            ف.م
                          </div>
                          <div>
                            <p className="text-md font-semibold text-gray-800">فاطمه محمدی</p>
                            <p className="text-sm text-gray-500">مددکار بیمارستان امام - ۴ سال عضویت</p>
                          </div>
                          <div className="flex">
                            <MdVerified
                              size={Width < 631 ? 30 : 35}
                              className="text-blue-500 ml-2"
                            />
                          </div>
                        </div>
                      </div>

                      {/* نظر نماینده خیریه */}
                      <div className="p-6 rounded-xl shadow-md bg-white border-r-4 border-blue-500">
                        <div className="flex items-center mb-4">
                          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            نماینده خیریه
                          </div>
                        </div>
                        <p className="text-gray-700 text-justify leading-relaxed">
                          انتشار فراخوان‌های نیازمندی در این سامانه کمک بزرگی به ما کرده. توانسته‌ایم برای بیماران اورژانسی سریع‌تر کمک جمع‌آوری کنیم. ارتباط با پزشکان داوطلب و سایر خیریه‌ها نیز بسیار مؤثر بوده است.
                        </p>
                        <div className="flex items-center mt-6 space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            ز.ر
                          </div>
                          <div>
                            <p className="text-md font-semibold text-gray-800">زهرا رضایی</p>
                            <p className="text-sm text-gray-500">خیریه مهرورزان سلامت - ۲ سال عضویت</p>
                          </div>
                          <div className="flex">
                            <MdVerified
                              size={Width < 631 ? 30 : 35}
                              className="text-blue-500 ml-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // نسخه دسکتاپ
          <>
            <div className="container px-6 py-12 mx-auto">
              <div className="grid items-center gap-4 xl:grid-cols-5">
                <motion.div
                  ref={ref}
                  variants={{
                    hidden: { opacity: 0, y: -50 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  initial="hidden"
                  animate={mainControls}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="max-w-2xl mx-auto rounded-xl shadow-lg bg-gradient-to-r from-blue-100 to-blue-200 p-6 my-8 space-y-4 text-center xl:col-span-2 xl:text-left border-r-4 border-blue-600"
                >
                  <h2 className="text-4xl font-bold text-gray-800">
                    نظرات اعضای شبکه سلامت
                  </h2>
                  <p className="text-gray-700 text-lg">
                    تجربیات واقعی پزشکان، خیرین، مددکاران و اعضای شبکه از خدمات سامانه جامع مشارکت‌های سلامت
                  </p>
                  <div className="pt-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">پزشکان</span>
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">خیرین</span>
                      <span className="px-3 py-1 bg-blue-700 text-white rounded-full text-sm">مددکاران</span>
                      <span className="px-3 py-1 bg-blue-800 text-white rounded-full text-sm">نمایندگان</span>
                    </div>
                  </div>
                </motion.div>
                
                <div className="p-6 xl:col-span-3">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid content-center gap-4">
                      {/* نظر پزشک */}
                      <motion.div
                        ref={ref}
                        variants={{
                          hidden: { opacity: 0, x: -75 },
                          visible: { opacity: 1, x: 0 },
                        }}
                        initial="hidden"
                        animate={mainControls}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="p-6 rounded-xl shadow-md bg-white border-r-4 border-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="flex items-center mb-4">
                          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            پزشک داوطلب
                          </div>
                          <span className="mr-2 text-xs text-gray-500">⭐ ۴.۹</span>
                        </div>
                        <p className="text-gray-700 text-justify leading-relaxed">
                          به عنوان پزشکی که سال‌ها در مناطق محروم خدمت کرده‌ام، این سامانه واقعاً تحول‌آفرین بوده. توانستم از طریق مشاوره آنلاین به بیماران مناطق دورافتاده کمک کنم. سیستم ارجاع بیماران بسیار دقیق و سازمان‌یافته است.
                        </p>
                        <div className="flex justify-between items-center mt-6 space-x-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              ر.ا
                            </div>
                            <div className="flex-col mr-4">
                              <p className="text-lg font-semibold text-gray-800 block">دکتر رضا احمدی</p>
                              <p className="text-sm text-gray-500 block">متخصص داخلی - ۵ سال عضویت</p>
                            </div>
                          </div>
                          <div className="flex">
                            <MdVerified
                              size={40}
                              className="text-blue-500 ml-2"
                            />
                          </div>
                        </div>
                      </motion.div>

                      {/* نظر خیر */}
                      <motion.div
                        ref={ref}
                        variants={{
                          hidden: { opacity: 0, x: -75 },
                          visible: { opacity: 1, x: 0 },
                        }}
                        initial="hidden"
                        animate={mainControls}
                        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                        className="p-6 rounded-xl shadow-md bg-gradient-to-r from-blue-50 to-white border-r-4 border-blue-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="flex items-center mb-4">
                          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            خیر سلامت
                          </div>
                          <span className="mr-2 text-xs text-gray-500">⭐ ۵.۰</span>
                        </div>
                        <p className="text-gray-700 text-justify leading-relaxed">
                          شفافیت مالی این سامانه اعتماد من را جلب کرد. می‌توانم دقیقاً ببینم کمک‌هایم چگونه و برای چه کسی هزینه شده. سیستم پرداخت مستمری بسیار کاربردی است و امکان کمک هدفمند به بیماران خاص را فراهم کرده.
                        </p>
                        <div className="flex items-center justify-between mt-6 space-x-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              م.ک
                            </div>
                            <div className="flex-col mr-2">
                              <p className="text-lg font-semibold text-gray-800 block">محمد کریمی</p>
                              <p className="text-sm text-gray-500 block">خیر سلامت - ۳ سال مشارکت</p>
                            </div>
                          </div>
                          <div className="flex">
                            <MdVerified
                              size={40}
                              className="text-blue-500 ml-2"
                            />
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    
                    <div className="grid content-center gap-4">
                      {/* نظر مددکار */}
                      <motion.div
                        ref={ref}
                        variants={{
                          hidden: { opacity: 0, x: 75 },
                          visible: { opacity: 1, x: 0 },
                        }}
                        initial="hidden"
                        animate={mainControls}
                        transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                        className="p-6 rounded-xl shadow-md bg-gradient-to-r from-blue-50 to-white border-r-4 border-blue-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="flex items-center mb-4">
                          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            مددکار بیمارستان
                          </div>
                          <span className="mr-2 text-xs text-gray-500">⭐ ۴.۸</span>
                        </div>
                        <p className="text-gray-700 text-justify leading-relaxed">
                          سیستم ارجاع بیماران نیازمند بین مراکز نیکوکاری و بیمارستان‌ها واقعاً کار ما را آسان کرده. دیگر نیازی به تماس‌های متعدد نیست. همه اطلاعات بیمار به صورت یکپارچه در دسترس است و پیگیری موارد بسیار ساده شده.
                        </p>
                        <div className="flex justify-between items-center mt-6 space-x-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              ف.م
                            </div>
                            <div className="flex-col mr-4">
                              <p className="text-lg font-semibold text-gray-800 block">فاطمه محمدی</p>
                              <p className="text-sm text-gray-500 block">مددکار بیمارستان امام - ۴ سال عضویت</p>
                            </div>
                          </div>
                          <div className="flex">
                            <MdVerified
                              size={40}
                              className="text-blue-500 ml-2"
                            />
                          </div>
                        </div>
                      </motion.div>

                      {/* نظر نماینده خیریه */}
                      <motion.div
                        ref={ref}
                        variants={{
                          hidden: { opacity: 0, x: 75 },
                          visible: { opacity: 1, x: 0 },
                        }}
                        initial="hidden"
                        animate={mainControls}
                        transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
                        className="p-6 rounded-xl shadow-md bg-white border-r-4 border-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="flex items-center mb-4">
                          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            نماینده خیریه
                          </div>
                          <span className="mr-2 text-xs text-gray-500">⭐ ۴.۷</span>
                        </div>
                        <p className="text-gray-700 text-justify leading-relaxed">
                          انتشار فراخوان‌های نیازمندی در این سامانه کمک بزرگی به ما کرده. توانسته‌ایم برای بیماران اورژانسی سریع‌تر کمک جمع‌آوری کنیم. ارتباط با پزشکان داوطلب و سایر خیریه‌ها نیز بسیار مؤثر بوده است.
                        </p>
                        <div className="flex justify-between items-center mt-6 space-x-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              ز.ر
                            </div>
                            <div className="flex-col mr-4">
                              <p className="text-lg font-semibold text-gray-800 block">زهرا رضایی</p>
                              <p className="text-sm text-gray-500 block">خیریه مهرورزان سلامت - ۲ سال عضویت</p>
                            </div>
                          </div>
                          <div className="flex">
                            <MdVerified
                              size={40}
                              className="text-blue-500 ml-2"
                            />
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
      <div className="w-[70%] mx-auto h-[2px] bg-gradient-to-r from-blue-400 to-blue-600"></div>
    </div>
  );
};

export default Review;
