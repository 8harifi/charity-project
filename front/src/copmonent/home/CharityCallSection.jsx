import React, { useEffect, useRef } from "react";
import CharityCard from "./CharityCard";
import image1 from "../../images/Price/1.png";
import image2 from "../../images/Price/2.png";
import image3 from "../../images/Price/3.png";
import { useAnimation, useInView, motion } from "framer-motion";

const CharityCallSection = () => {
  const { innerWidth: width } = window;
  const ref = useRef();
  const isInView = useInView(ref);
  const mainControls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView]);

  return (
    <div className="font-kook max-w-screen overflow-x-hidden font-poppins">
      <div className="w-full py-[6rem] px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="flex justify-center">
          <motion.h2 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-center sm:text-5xl mt-[4%] text-blue-900"
          >
            فراخوان مشارکت در امور خیریه
          </motion.h2>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex text-xl justify-center sm:mb-20 mb-12 text-center mt-6 text-gray-700"
        >
          همراه ما باشید تا با هم در بهبود کیفیت زندگی بیماران نیازمند سهیم شویم
        </motion.p>
        
        {/* بخش انتشار فراخوان */}
        <div className="mb-16">
          <motion.h3 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-2xl font-bold text-center mb-8 text-blue-800"
          >
            انتشار فراخوان اعضای شبکه برای نیازمندی‌ها
          </motion.h3>
          
          <div className="max-w-[1240px] mx-auto grid md:grid-cols-3 gap-8">
            {width < 631 ? (
              <>
                <CharityCard
                  image={image1}
                  title={"کمک به درمان کودکان سرطانی"}
                  description={"کمک به تامین دارو و درمان کودکان مبتلا به سرطان در مناطق محروم"}
                  targetAmount={"50,000,000"}
                  raisedAmount={"35,000,000"}
                  progress={70}
                  urgency={"فوری"}
                  category={"درمانی"}
                  buttonText={"مشارکت در این فراخوان"}
                  buttonColor={"bg-red-500 hover:bg-red-600"}
                />
                <CharityCard
                  image={image2}
                  title={"تجهیز مرکز دیالیز"}
                  description={"تامین دستگاه‌های دیالیز برای مرکز درمانی در منطقه محروم"}
                  targetAmount={"80,000,000"}
                  raisedAmount={"45,000,000"}
                  progress={56}
                  urgency={"متوسط"}
                  category={"تجهیزات پزشکی"}
                  buttonText={"حمایت مالی"}
                  buttonColor={"bg-blue-500 hover:bg-blue-600"}
                  featured={true}
                />
                <CharityCard
                  image={image3}
                  title={"کمک هزینه عمل قلب"}
                  description={"کمک به تامین هزینه عمل قلب برای ۱۰ بیمار نیازمند"}
                  targetAmount={"30,000,000"}
                  raisedAmount={"18,000,000"}
                  progress={60}
                  urgency={"فوری"}
                  category={"جراحی"}
                  buttonText={"کمک به درمان"}
                  buttonColor={"bg-green-500 hover:bg-green-600"}
                />
              </>
            ) : (
              <>
                <motion.div
                  ref={ref}
                  variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  initial="hidden"
                  animate={mainControls}
                  transition={{ duration: 0.5, delay: 0.25 }}
                >
                  <CharityCard
                    image={image1}
                    title={"کمک به درمان کودکان سرطانی"}
                    description={"کمک به تامین دارو و درمان کودکان مبتلا به سرطان در مناطق محروم"}
                    targetAmount={"50,000,000"}
                    raisedAmount={"35,000,000"}
                    progress={70}
                    urgency={"فوری"}
                    category={"درمانی"}
                    buttonText={"مشارکت در این فراخوان"}
                    buttonColor={"bg-red-500 hover:bg-red-600"}
                  />
                </motion.div>
                
                <motion.div
                  ref={ref}
                  variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  initial="hidden"
                  animate={mainControls}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <CharityCard
                    image={image2}
                    title={"تجهیز مرکز دیالیز"}
                    description={"تامین دستگاه‌های دیالیز برای مرکز درمانی در منطقه محروم"}
                    targetAmount={"80,000,000"}
                    raisedAmount={"45,000,000"}
                    progress={56}
                    urgency={"متوسط"}
                    category={"تجهیزات پزشکی"}
                    buttonText={"حمایت مالی"}
                    buttonColor={"bg-blue-500 hover:bg-blue-600"}
                    featured={true}
                  />
                </motion.div>
                
                <motion.div
                  ref={ref}
                  variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  initial="hidden"
                  animate={mainControls}
                  transition={{ duration: 0.5, delay: 0.75 }}
                >
                  <CharityCard
                    image={image3}
                    title={"کمک هزینه عمل قلب"}
                    description={"کمک به تامین هزینه عمل قلب برای ۱۰ بیمار نیازمند"}
                    targetAmount={"30,000,000"}
                    raisedAmount={"18,000,000"}
                    progress={60}
                    urgency={"فوری"}
                    category={"جراحی"}
                    buttonText={"کمک به درمان"}
                    buttonColor={"bg-green-500 hover:bg-green-600"}
                  />
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* بخش دریافت نوبت مشاوره */}
  
      </div>
    </div>
  );
};

export default CharityCallSection;