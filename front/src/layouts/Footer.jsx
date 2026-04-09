function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 font-kook">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">

        <div>
          <h3 className="text-white text-lg mb-3">شبکه همیاران سلامت</h3>
          <p className="text-sm">
            بستری برای مشارکت خیرین و متخصصان حوزه سلامت در حمایت از بیماران نیازمند.
          </p>
        </div>

        <div>
          <h4 className="text-white mb-3">دسترسی سریع</h4>
          <ul className="space-y-2 text-sm">
            <li>خانه</li>
            <li>کمپین‌ها</li>
            <li>اعضای شبکه</li>
            <li>اخبار</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white mb-3">ارتباط با ما</h4>
          <p className="text-sm">info@example.com</p>
          <p className="text-sm">021-000000</p>
        </div>

      </div>

      <div className="text-center text-sm border-t border-gray-800 py-4">
        © تمامی حقوق محفوظ است
      </div>
    </footer>
  );
}

export default Footer;
