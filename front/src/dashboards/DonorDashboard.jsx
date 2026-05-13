import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  User,
  Heart,
  FileText,
  Receipt,
  Star,
  Calendar,
  Download,
  Eye,
  Loader
} from 'lucide-react';
import { donorDashboardService as donorAPI } from '../Services/donorDashboardService';


const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State برای داده‌ها
  const [donorProfile, setDonorProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [reports, setReports] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [favoriteCampaigns, setFavoriteCampaigns] = useState([]);
  
  // فیلترها
  const [donationFilter, setDonationFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // دریافت داده‌های اولیه
  useEffect(() => {
    fetchInitialData();
  }, []);

  // دریافت داده‌ها بر اساس تب فعال
  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const profileResponse = await donorAPI.getProfile();
      setDonorProfile(profileResponse.data);
      setError(null);
    } catch (err) {
      setError('خطا در دریافت اطلاعات. لطفا دوباره تلاش کنید.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'donations':
          const donationsResponse = await donorAPI.getDonations({
            status: donationFilter !== 'all' ? donationFilter : undefined,
            search: searchTerm || undefined
          });
          setDonations(donationsResponse.data);
          break;
          
        case 'reports':
          const reportsResponse = await donorAPI.getReports();
          setReports(reportsResponse.data);
          break;
          
        case 'receipts':
          const receiptsResponse = await donorAPI.getReceipts();
          setReceipts(receiptsResponse.data);
          break;
          
        case 'campaigns':
          const campaignsResponse = await donorAPI.getFavoriteCampaigns();
          setFavoriteCampaigns(campaignsResponse.data);
          break;
          
        default:
          break;
      }
      
      setError(null);
    } catch (err) {
      setError('خطا در دریافت اطلاعات. لطفا دوباره تلاش کنید.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // دانلود فایل
  const handleDownload = async (type, id, filename) => {
    try {
      let response;
      
      if (type === 'report') {
        response = await donorAPI.downloadReport(id);
      } else if (type === 'receipt') {
        response = await donorAPI.downloadReceipt(id);
      }
      
      // ایجاد لینک دانلود
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || `${type}-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('خطا در دانلود فایل');
      console.error(err);
    }
  };

  // ویرایش پروفایل
  const handleUpdateProfile = async (updatedData) => {
    try {
      const response = await donorAPI.updateProfile(updatedData);
      setDonorProfile(response.data);
      alert('پروفایل با موفقیت به‌روزرسانی شد');
    } catch (err) {
      alert('خطا در به‌روزرسانی پروفایل');
      console.error(err);
    }
  };

  // تغییر وضعیت علاقه‌مندی کمپین
  const handleToggleFavorite = async (campaignId) => {
    try {
      await donorAPI.toggleFavorite(campaignId);
      fetchTabData();
    } catch (err) {
      alert('خطا در تغییر وضعیت علاقه‌مندی');
      console.error(err);
    }
  };

  const tabs = [
    { id: 'profile', label: 'پروفایل خیر', icon: User },
    { id: 'donations', label: 'کمک‌های انجام شده', icon: Heart },
    { id: 'reports', label: 'گزارش مصرف', icon: FileText },
    { id: 'receipts', label: 'فاکتورها', icon: Receipt },
    { id: 'campaigns', label: 'کمپین‌های مورد علاقه', icon: Star }
  ];

  if (loading && !donorProfile) {
    return (
      <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error && !donorProfile) {
    return (
      <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error}</p>
          <button
            onClick={fetchInitialData}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e0e0e0] font-kook pt-[70px] pb-[50px]">
      <div className="container mx-auto px-4 lg:px-10">
        
        {/* هدر داشبورد */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-900 to-emerald-700 rounded-2xl p-8 mb-8 text-white"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex items-center gap-6 mb-6 lg:mb-0">
              <img
                src={donorProfile?.avatar || '/api/placeholder/120/120'}
                alt="profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <div className="text-right">
                <h1 className="text-3xl font-bold mb-2">سلام، {donorProfile?.name}</h1>
                <p className="text-blue-100">عضو از تاریخ: {donorProfile?.memberSince}</p>
                <span className="inline-block bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold mt-2">
                  {donorProfile?.badge || 'خیر طلایی'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-4xl font-bold">{donorProfile?.helpedPatients || 0}</p>
                <p className="text-blue-100 text-sm">بیمار حمایت شده</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{donorProfile?.activeCampaigns || 0}</p>
                <p className="text-blue-100 text-sm">کمپین فعال</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{donorProfile?.totalDonations?.toLocaleString('fa-IR') || '0'}</p>
                <p className="text-blue-100 text-sm">تومان کمک</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* تب‌ها */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden"
        >
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-900 to-emerald-700 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* محتوای تب‌ها */}
          <div className="p-8">
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader className="animate-spin text-blue-600" size={36} />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchTabData}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                >
                  تلاش مجدد
                </button>
              </div>
            ) : (
              <>
                {/* پروفایل خیر */}
                {activeTab === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-right"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">اطلاعات پروفایل</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <label className="text-gray-600 text-sm mb-2 block">نام و نام خانوادگی</label>
                        <p className="text-lg font-semibold text-gray-800">{donorProfile?.name}</p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <label className="text-gray-600 text-sm mb-2 block">تاریخ عضویت</label>
                        <p className="text-lg font-semibold text-gray-800">{donorProfile?.memberSince}</p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <label className="text-gray-600 text-sm mb-2 block">شماره تماس</label>
                        <p className="text-lg font-semibold text-gray-800">{donorProfile?.phone}</p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <label className="text-gray-600 text-sm mb-2 block">ایمیل</label>
                        <p className="text-lg font-semibold text-gray-800">{donorProfile?.email}</p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <label className="text-gray-600 text-sm mb-2 block">کد ملی</label>
                        <p className="text-lg font-semibold text-gray-800">{donorProfile?.nationalId}</p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <label className="text-gray-600 text-sm mb-2 block">آدرس</label>
                        <p className="text-lg font-semibold text-gray-800">{donorProfile?.address}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        console.log('Edit profile');
                      }}
                      className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-all"
                    >
                      ویرایش پروفایل
                    </button>
                  </motion.div>
                )}

                {/* کمک‌های انجام شده */}
                {activeTab === 'donations' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-right"
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">کمک‌های انجام شده</h2>
                      
                      <div className="flex gap-3 w-full lg:w-auto">
                        <input
                          type="text"
                          placeholder="جستجو..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && fetchTabData()}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={donationFilter}
                          onChange={(e) => {
                            setDonationFilter(e.target.value);
                            fetchTabData();
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">همه</option>
                          <option value="completed">تکمیل شده</option>
                          <option value="ongoing">در حال انجام</option>
                        </select>
                      </div>
                    </div>

                    {donations.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        هیچ کمکی یافت نشد
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {donations.map((donation) => (
                          <div
                            key={donation.id}
                            className="bg-gradient-to-l from-blue-50 to-emerald-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all"
                          >
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                {donation.patientImage && (
                                  <img
                                    src={donation.patientImage}
                                    alt={donation.patientName}
                                    className="w-16 h-16 rounded-full object-cover"
                                  />
                                )}
                                <div>
                                  <h3 className="text-lg font-bold text-gray-800 mb-2">{donation.patientName}</h3>
                                  <div className="flex gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Calendar size={16} />
                                      {donation.date}
                                    </span>
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                      {donation.category}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-left">
                                <p className="text-2xl font-bold text-emerald-600 mb-1">
                                  {donation.amount?.toLocaleString('fa-IR')} تومان
                                </p>
                                <span
                                  className={`text-sm px-3 py-1 rounded-full ${
                                    donation.status === 'completed'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-orange-100 text-orange-700'
                                  }`}
                                >
                                  {donation.status === 'completed' ? 'تکمیل شده' : 'در حال انجام'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* گزارش مصرف */}
                {activeTab === 'reports' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-right"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">گزارش مصرف کمک‌ها</h2>
                    
                    {reports.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        هیچ گزارشی یافت نشد
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {reports.map((report) => (
                          <div
                            key={report.id}
                            className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:border-emerald-500 transition-all"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-gray-800">{report.patientName}</h3>
                                <p className="text-gray-600 text-sm">{report.category}</p>
                              </div>
                              <span className="text-emerald-600 font-bold text-xl">
                                {report.amount?.toLocaleString('fa-IR')} تومان
                              </span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                              <p className="text-gray-700 leading-relaxed">
                                {report.description}
                              </p>
                            </div>
                            <div className="flex gap-3">
                              <Link
                                to={`/reports/${report.id}`}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-all"
                              >
                                <Eye size={16} />
                                مشاهده جزئیات
                              </Link>
                              <button
                                onClick={() => handleDownload('report', report.id, `report-${report.id}.pdf`)}
                                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm transition-all"
                              >
                                <Download size={16} />
                                دانلود گزارش
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* فاکتورها */}
                {activeTab === 'receipts' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-right"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">فاکتورها و رسیدهای مالی</h2>
                    
                    {receipts.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        هیچ فاکتوری یافت نشد
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gradient-to-r from-blue-900 to-emerald-700 text-white">
                              <th className="px-6 py-4 text-right rounded-tr-xl">شماره فاکتور</th>
                              <th className="px-6 py-4 text-right">نوع کمک</th>
                              <th className="px-6 py-4 text-right">مبلغ</th>
                              <th className="px-6 py-4 text-right">تاریخ</th>
                              <th className="px-6 py-4 text-right rounded-tl-xl">عملیات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {receipts.map((receipt, index) => (
                              <tr
                                key={receipt.id}
                                className={`border-b border-gray-200 hover:bg-gray-50 transition-all ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }`}
                              >
                                <td className="px-6 py-4 font-semibold text-gray-800">{receipt.invoiceNo}</td>
                                <td className="px-6 py-4 text-gray-600">{receipt.type}</td>
                                <td className="px-6 py-4 font-bold text-emerald-600">
                                  {receipt.amount?.toLocaleString('fa-IR')} تومان
                                </td>
                                <td className="px-6 py-4 text-gray-600">{receipt.date}</td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => handleDownload('receipt', receipt.id, `receipt-${receipt.invoiceNo}.pdf`)}
                                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-all"
                                  >
                                    <Download size={16} />
                                    دانلود
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* کمپین‌های مورد علاقه */}
                {activeTab === 'campaigns' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-right"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">کمپین‌های مورد علاقه</h2>
                    
                    {favoriteCampaigns.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        هیچ کمپینی در لیست علاقه‌مندی‌ها نیست
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {favoriteCampaigns.map((campaign) => (
                          <div
                            key={campaign.id}
                            className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-emerald-500 hover:shadow-xl transition-all"
                          >
                            <img
                              src={campaign.image || '/api/placeholder/400/200'}
                              alt={campaign.title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                              <h3 className="text-xl font-bold text-gray-800 mb-2">{campaign.title}</h3>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>
                              
                              <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                  <span>جمع‌آوری شده</span>
                                  <span>{campaign.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div                                     style={{ width: `${campaign.progress}%` }}
                                    className="h-2 rounded-full bg-emerald-500"
                                  ></div>
                                </div>
                              </div>

                              <div className="flex justify-between items-center">
                                <Link
                                  to={`/campaigns/${campaign.id}`}
                                  className="text-blue-600 hover:underline font-semibold"
                                >
                                  مشاهده کمپین
                                </Link>
                                <button
                                  onClick={() => handleToggleFavorite(campaign.id)}
                                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-all"
                                >
                                  <Star className="fill-current text-white" size={16} />
                                  حذف از علاقه‌مندی‌ها
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DonorDashboard;

