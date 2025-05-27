"use client";
import { getAllOperations, Operation } from '@/database/operations';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// دالة وهمية لجلب بيانات العمليات (يجب استبدالها بدالة حقيقية لاحقاً)


export default function OperationsPage() {
  const router = useRouter();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');

  // تعديل استيراد البيانات في بداية الملف
  // وتعديل دالة fetchOperations لتستخدم الدالة الحقيقية
  useEffect(() => {
    async function fetchOperations() {
      const allOperations = await getAllOperations();
      setOperations(allOperations);
      setFilteredOperations(allOperations);
    }
    fetchOperations();
  }, []);

  // تطبيق الفلاتر على البيانات
  useEffect(() => {
    let result = operations;

    // تطبيق فلتر البحث
    if (searchTerm) {
      result = result.filter(operation => 
        operation.name.includes(searchTerm) || 
        operation.id.includes(searchTerm) ||
        operation.location.includes(searchTerm)
      );
    }

    // تطبيق فلتر الحالة
    if (statusFilter !== 'الكل') {
      result = result.filter(operation => operation.status === statusFilter);
    }

    setFilteredOperations(result);
  }, [searchTerm, statusFilter, operations]);

  // تنسيق التاريخ والوقت للعرض
  const formatDateTime = (dateTimeString: string) => {
    const dateTime = new Date(dateTimeString);
    return dateTime.toLocaleString('ar-EG');
  };

  // الحصول على قائمة الحالات الفريدة
  const statuses = ['الكل', 'قادمة', 'جارية', 'منتهية'];

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6 border-r-4 border-yellow-500 text-blue-700 pr-3">العمليات</h1>
        <button
          onClick={() => router.push('/dashboard/operations/add')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-6"
        >
          إضافة عملية جديدة
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
              placeholder="بحث باسم الخدمة أو الموقع"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-1">الحالة</label>
            <select
              className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 bg-gray-700 text-white focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* جدول العمليات */}
      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  الرقم التعريفي
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  اسم الخدمة
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  عدد العساكر المطلوب
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  وقت خروج الخدمة
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  الحالة
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {filteredOperations.length > 0 ? (
                filteredOperations.map((operation) => (
                  <tr key={operation.id} className="hover:bg-gray-600">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {operation.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {operation.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {operation.requiredSoldiers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatDateTime(operation.departureTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${operation.status === 'قادمة' ? 'bg-yellow-100 text-yellow-800' : 
                          operation.status === 'جارية' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {operation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button 
                        onClick={() => router.push(`/dashboard/operations/${operation.id}`)}
                        className="text-blue-400 hover:text-blue-300 ml-2">
                        عرض التفاصيل
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-300">
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