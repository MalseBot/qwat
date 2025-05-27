"use client";
import { useState, useEffect } from 'react';
import type { Recruit } from '@/types/recruit';
import { getAllRecruits } from '@/database/recruits';
import { useRouter } from 'next/navigation';

export default function RecruitsPage() {
  const router = useRouter();
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [filteredRecruits, setFilteredRecruits] = useState<Recruit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('الكل');

  useEffect(() => {
    // جلب بيانات المجندين عند تحميل الصفحة
    async function fetchRecruits() {
      const allRecruits = await getAllRecruits(); // Await the promise
      setRecruits(allRecruits);
      setFilteredRecruits(allRecruits);
    }
    fetchRecruits();
  }, []);

  // تطبيق الفلاتر على البيانات
  useEffect(() => {
    let result = recruits;

    // تطبيق فلتر البحث
    if (searchTerm) {
      result = result.filter(recruit => 
        recruit.name.includes(searchTerm) || 
        recruit.id.includes(searchTerm) ||
        recruit.nationalId.includes(searchTerm)
      );
    }

    // تطبيق فلتر السرية
    if (companyFilter !== 'الكل') {
      result = result.filter(recruit => recruit.company === companyFilter);
    }

    setFilteredRecruits(result);
  }, [searchTerm, companyFilter, recruits]);

  // تنسيق التاريخ للعرض
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
  };

  // الحصول على قائمة السرايا الفريدة
  const companies = ['الكل', ...new Set(recruits.map(recruit => recruit.company))];

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6 border-r-4 border-yellow-500 text-blue-700 pr-3">شؤون المجندين</h1>
        <button
          onClick={() => router.push('/dashboard/recruits/add')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-6"
        >
          إضافة مجند جديد
        </button>
      </div>
      
      {/* قسم البحث والفلترة */}
      <div className="bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">البحث</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 bg-gray-700 text-white focus:border-blue-500"
              placeholder="بحث بالاسم أو الرقم التعريفي"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-1">السرية</label>
            <select
              className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 bg-gray-700 text-white focus:border-blue-500"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            >
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* جدول المجندين */}
      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  الرقم التعريفي
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  الاسم
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  السرية
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  تاريخ بداية الخدمة
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  تاريخ نهاية الخدمة
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  المستوى التعليمي
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  تفاصيل
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {filteredRecruits.length > 0 ? (
                filteredRecruits.map((recruit) => (
                  <tr key={recruit.id} className="hover:bg-gray-600">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {recruit.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {recruit.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {recruit.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatDate(recruit.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatDate(recruit.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {recruit.educationLevel || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button 
                        onClick={() => router.push(`/dashboard/recruits/${recruit.id}`)}
                        className="text-blue-400 hover:text-blue-300 ml-2">
                        عرض
                      </button>
                      <button 
                        onClick={() => router.push(`/dashboard/recruits/edit/${recruit.id}`)}
                        className="text-yellow-400 hover:text-yellow-300 ml-2">
                        تعديل
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-300">
                    لا توجد بيانات متطابقة مع البحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}