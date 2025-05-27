"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import type { Recruit, Leave } from '@/types/recruit';
import { getRecruitById } from '@/database/recruits';

export default function RecruitPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [recruit, setRecruit] = useState<Recruit | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecruit() {
      try {
        setLoading(true);
        console.log("Fetching recruit with ID:", params.id); // Debug log
        const recruitData = await getRecruitById(params.id);
        
        if (!recruitData) {
          setError(`لم يتم العثور على المجند بالمعرف ${params.id}`);
          setRecruit(null);
        } else {
          setRecruit(recruitData);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching recruit:", err);
        setError('حدث خطأ أثناء استرجاع بيانات المجند');
        setRecruit(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRecruit();
  }, [params.id]);

  // تنسيق التاريخ للعرض
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
  };

  // حساب المدة المتبقية للخدمة
  const calculateRemainingService = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'انتهت الخدمة';
    
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    
    return `${months} شهر و ${days} يوم`;
  };

  // Add error and loading states to your UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600">{error}</h2>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          العودة
        </button>
      </div>
    );
  }

  if (!recruit) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600">لم يتم العثور على المجند</h2>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          العودة
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black border-r-4 border-yellow-500 pr-3">بيانات المجند</h1>
        <button 
                        onClick={() => router.push(`/dashboard/recruits/edit/${recruit!.id}`)}
                        className="px-4 py-2 bg-yellow-400 text-gray-700 rounded-md hover:bg-yellow-200">
                        تعديل
                      </button>
        <button 
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          العودة
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="md:flex">
          {/* صورة المجند */}
          <div className="md:w-1/3 p-6 flex flex-col justify-center items-center bg-gray-50">
            {recruit.imagePath ? (
              <div className="relative h-64 w-64 rounded-full overflow-hidden border-4 border-blue-500 mb-4">
                <Image 
                  src={recruit.imagePath.startsWith('/') ? recruit.imagePath : ``} 
                  alt={recruit.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback to default image if the image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/default-profile.png';
                  }}
                />
              </div>
            ) : (
              <div className="relative h-64 w-64 rounded-full overflow-hidden border-4 border-blue-500 mb-4">
                <Image
                  src={`/recruits/${recruit.id}.jpg`}
                  alt={recruit.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // في حالة عدم وجود صورة، استخدم صورة افتراضية
                    (e.target as HTMLImageElement).src = '/recruits/default.jpg';
                  }}
                />
              </div>
            )}
            
            {/* QR Code */}
            <div className="mt-4 p-2 bg-white rounded-lg shadow-md">
              <div className="text-center mb-2">
                <p className="text-sm font-medium text-gray-700">رمز QR للمجند</p>
              </div>
              <QRCodeSVG 
                value={recruit.id} 
                size={150} 
                bgColor={"#ffffff"} 
                fgColor={"#000000"} 
                level={"L"} 
                includeMargin={true}
              />
            </div>
          </div>

          {/* بيانات المجند */}
          <div className="md:w-2/3 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold text-blue-800 mb-4">البيانات الشخصية</h2>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">الاسم</p>
                  <p className="text-lg text-black font-medium">{recruit.name}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">الرقم التعريفي</p>
                  <p className="text-lg text-black font-medium">{recruit.id}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">الرقم القومي</p>
                  <p className="text-lg text-black font-medium">{recruit.nationalId}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">المستوى التعليمي</p>
                  <p className="text-lg text-black font-medium">{recruit.educationLevel || "غير محدد"}</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-blue-800 mb-4">بيانات الخدمة</h2>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">السرية</p>
                  <p className="text-lg text-black font-medium">{recruit.company || "غير محدد"}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">تاريخ بداية الخدمة</p>
                  <p className="text-lg text-black font-medium">{formatDate(recruit.startDate)}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">تاريخ نهاية الخدمة</p>
                  <p className="text-lg text-black font-medium">{formatDate(recruit.endDate)}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">المدة المتبقية</p>
                  <p className="text-lg text-black font-medium">{calculateRemainingService(recruit.endDate)}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-bold text-blue-800 mb-4">ملاحظات</h2>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-black">{recruit.notes || "لا توجد ملاحظات"}</p>
              </div>
              <button 
                onClick={() => setShowNotesModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                إضافة ملاحظة
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* قسم السجل والإجازات */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">سجل الإجازات</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    من
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إلى
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recruit.leaves && recruit.leaves.length > 0 ? (
                  recruit.leaves.map((leave: Leave, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(leave.startDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(leave.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leave.type}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      لا توجد إجازات مسجلة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">معلومات إضافية</h2>
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-gray-500">الرقم العسكري</p>
              <p className="text-lg text-black font-medium">{recruit.militaryNumber || "غير محدد"}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">المحافظة</p>
              <p className="text-lg text-black font-medium">{recruit.governorate || "غير محدد"}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">الحالة الاجتماعية</p>
              <p className="text-lg text-black font-medium">{recruit.maritalStatus || "غير محدد"}</p>
              {(recruit.maritalStatus === 'متزوج' || recruit.maritalStatus === 'مطلق') && recruit.childrenCount !== undefined && (
                <p className="text-sm text-gray-500 mt-1">عدد الأبناء: {recruit.childrenCount}</p>
              )}
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">رقم الموبايل</p>
              <p className="text-lg text-black font-medium">{recruit.mobileNumber || "غير محدد"}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">رقم أقرب الأقارب</p>
              <p className="text-lg text-black font-medium">{recruit.relativeNumber || "غير محدد"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* قسم السجل الخاص بالتصاريح والجزاءات والمنح */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">سجل الجزاءات</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التفاصيل
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recruit.records && recruit.records.filter(record => record.type === 'جزاء').length > 0 ? (
                  recruit.records.filter(record => record.type === 'جزاء').map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.details}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      لا توجد جزاءات مسجلة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">سجل المنح</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التفاصيل
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recruit.records && recruit.records.filter(record => record.type === 'منحة').length > 0 ? (
                  recruit.records.filter(record => record.type === 'منحة').map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.details}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      لا توجد منح مسجلة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* نافذة إضافة ملاحظة */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">إضافة ملاحظة</h3>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-black focus:border-blue-500 mb-4"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أدخل الملاحظة هنا..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ml-2"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  // هنا يمكن إضافة كود لحفظ الملاحظة
                  console.log('حفظ الملاحظة:', notes);
                  setShowNotesModal(false);
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
