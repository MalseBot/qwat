"use client";
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getOperationById, assignSoldiersToOperation, removeSoldiersFromOperation, updateSoldierArmament } from '@/database/operations';
import { getRecruitById, getRecruitsByName } from '@/database/recruits';
import { Recruit } from '@/types/recruit';
import { Operation } from '@/database/operations';
// إضافة استيراد الأيقونات
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
//@ignore


// أنواع التسليح المتاحة
const ARMAMENT_TYPES = [
  'بدون تسليح',
  'مسدس',
  'بندقية آلية',
  'رشاش',
  'قاذف قنابل',
];

type PageProps = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function OperationPage({ params }: PageProps) {
  const router = useRouter();
  const [operation, setOperation] = useState<Operation | null>(null);
  const [assignedRecruits, setAssignedRecruits] = useState<Recruit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soldierNameToAdd, setSoldierNameToAdd] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Recruit[]>([]);
  // Fixed: addingSoldier is now properly used in the UI
  const [addingSoldier, setAddingSoldier] = useState(false);
  const [removingSoldier, setRemovingSoldier] = useState<string | null>(null);
  const [addSoldierError, setAddSoldierError] = useState<string | null>(null);
  // Fixed: Added the missing state setter for isSearching
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function fetchOperation() {
      try {
        setLoading(true);
        console.log("Fetching operation with ID:", params.id);
        const operationData = await getOperationById(params.id);
        
        if (!operationData) {
          setError(`لم يتم العثور على العملية بالمعرف ${params.id}`);
          setOperation(null);
        } else {
          setOperation(operationData);
          
          // جلب بيانات المجندين المعينين للعملية
          if (operationData.assignedSoldiers && operationData.assignedSoldiers.length > 0) {
            const recruitsPromises = operationData.assignedSoldiers.map((id: string) => getRecruitById(id));
            const recruitsData = await Promise.all(recruitsPromises);
            setAssignedRecruits(recruitsData.filter(recruit => recruit !== undefined) as Recruit[]);
          }
          
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching operation:", err);
        setError('حدث خطأ أثناء استرجاع بيانات العملية');
        setOperation(null);
      } finally {
        setLoading(false);
      }
    }

    fetchOperation();
  }, [params.id]);

  // تنسيق التاريخ والوقت للعرض
  const formatDateTime = (dateTimeString: string) => {
    const dateTime = new Date(dateTimeString);
    return dateTime.toLocaleString('ar-EG');
  };

  // دالة للبحث عن المجندين بالاسم - Wrapped in useCallback to prevent recreation on every render
  const searchSoldiersByName = useCallback(async (name: string) => {
    if (name.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await getRecruitsByName(name);
      // استبعاد المجندين المعينين بالفعل للعملية
      const filteredResults = results.filter(recruit => 
        !operation?.assignedSoldiers?.includes(recruit.id)
      );
      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Error searching for soldiers:", err);
    } finally {
      setIsSearching(false);
    }
  }, [operation]);

  // دالة لإضافة عسكري إلى الخدمة
  const handleAddSoldier = async (recruitId: string) => {
    if (!operation) return;

    try {
      setAddingSoldier(true);
      setAddSoldierError(null);
      
      // التحقق من وجود العسكري
      const recruit = await getRecruitById(recruitId);
      if (!recruit) {
        setAddSoldierError('لم يتم العثور على عسكري بهذا الرقم التعريفي');
        return;
      }
      
      // التحقق من أن العسكري غير معين بالفعل للعملية
      if (operation.assignedSoldiers?.includes(recruitId)) {
        setAddSoldierError('هذا العسكري معين بالفعل لهذه العملية');
        return;
      }
      
      // إضافة العسكري إلى العملية
      const success = await assignSoldiersToOperation(operation.id, [recruitId]);
      
      if (success) {
        // تحديث البيانات
        const updatedOperation = await getOperationById(operation.id);
        if (updatedOperation) {
          setOperation(updatedOperation);
          
          // إضافة العسكري الجديد إلى القائمة
          setAssignedRecruits([...assignedRecruits, recruit]);
          
          // إعادة تعيين حقل الإدخال ونتائج البحث
          setSoldierNameToAdd('');
          setSearchResults([]);
        }
      } else {
        setAddSoldierError('حدث خطأ أثناء إضافة العسكري إلى العملية');
      }
    } catch (err) {
      console.error('Error adding soldier:', err);
      setAddSoldierError('حدث خطأ أثناء إضافة العسكري');
    } finally {
      setAddingSoldier(false);
    }
  };

  // Added loading indicator for the search button
  const renderSearchButton = () => {
    if (addingSoldier) {
      return (
        <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
      );
    }
    return "إضافة";
  };

  // دالة لإزالة عسكري من الخدمة
  const handleRemoveSoldier = async (recruitId: string) => {
    if (!operation) return;

    try {
      setRemovingSoldier(recruitId);
      
      // إزالة العسكري من العملية
      const success = await removeSoldiersFromOperation(operation.id, [recruitId]);
      
      if (success) {
        // تحديث البيانات
        const updatedOperation = await getOperationById(operation.id);
        if (updatedOperation) {
          setOperation(updatedOperation);
          
          // إزالة العسكري من القائمة
          setAssignedRecruits(assignedRecruits.filter(recruit => recruit.id !== recruitId));
        }
      } else {
        console.error('فشل في إزالة العسكري من العملية');
      }
    } catch (err) {
      console.error('Error removing soldier:', err);
    } finally {
      setRemovingSoldier(null);
    }
  };

  // دالة لتحديث تسليح العسكري
  const handleUpdateArmament = async (recruitId: string, armamentType: string) => {
    if (!operation) return;
    
    try {
      // تحديث التسليح في العملية
      const success = await updateSoldierArmament(operation.id, recruitId, armamentType);
      
      if (success) {
        // تحديث البيانات
        const updatedOperation = await getOperationById(operation.id);
        if (updatedOperation) {
          setOperation(updatedOperation);
          
          // تحديث قائمة المجندين المعينين
          if (updatedOperation.assignedSoldiers && updatedOperation.assignedSoldiers.length > 0) {
            const recruitsPromises = updatedOperation.assignedSoldiers.map((id: string) => getRecruitById(id));
            const recruitsData = await Promise.all(recruitsPromises);
            setAssignedRecruits(recruitsData.filter(recruit => recruit !== undefined) as Recruit[]);
          }
        }
      } else {
        console.error('فشل في تحديث تسليح العسكري');
      }
    } catch (err) {
      console.error('Error updating soldier armament:', err);
    }
  };

  // تحديث البحث عند تغيير الاسم - Moved useEffect before any conditional returns
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchSoldiersByName(soldierNameToAdd);
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [soldierNameToAdd, searchSoldiersByName]);

  // حالة التحميل
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // حالة الخطأ
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

  // حالة عدم وجود بيانات
  if (!operation) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600">لم يتم العثور على العملية</h2>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          العودة
        </button>
      </div>
    );
  }

  // تحديد لون حالة العملية
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'قادمة':
        return 'bg-yellow-100 text-yellow-800';
      case 'جارية':
        return 'bg-green-100 text-green-800';
      case 'منتهية':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700 border-r-4 border-yellow-500 pr-3">تفاصيل العملية</h1>
        <button 
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
        >
          العودة
        </button>
      </div>

      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {/* بيانات العملية */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold text-yellow-400 mb-4">معلومات العملية</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">اسم الخدمة</p>
                <p className="text-lg text-white font-medium">{operation.name}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">الرقم التعريفي</p>
                <p className="text-lg text-white font-medium">{operation.id}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">الموقع</p>
                <p className="text-lg text-white font-medium">{operation.location}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">الوصف</p>
                <p className="text-lg text-white font-medium">{operation.description || "لا يوجد وصف"}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-yellow-400 mb-4">تفاصيل الخدمة</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">عدد العساكر المطلوب</p>
                <p className="text-lg text-white font-medium">{operation.requiredSoldiers}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">وقت خروج الخدمة</p>
                <p className="text-lg text-white font-medium">{formatDateTime(operation.departureTime)}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">الحالة</p>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(operation.status)}`}>
                  {operation.status}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">عدد المجندين المعينين</p>
                <p className="text-lg text-white font-medium">
                  {operation.assignedSoldiers?.length || 0} / {operation.requiredSoldiers}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* جدول المجندين المعينين للعملية */}
        <div className="mt-6 p-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">المجندين المعينين للعملية</h2>
          <div className="p-6 border-t border-gray-700">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">إضافة عسكري للعملية</h2>
          
          <div className="flex flex-col space-y-4">
            <div className="relative w-64">
              <input
                type="text"
                value={soldierNameToAdd}
                onChange={(e) => setSoldierNameToAdd(e.target.value)}
                placeholder="ابحث بالاسم الثلاثي"
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isSearching && (
                <div className="absolute right-2 top-2">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}
              
              {/* نتائج البحث */}
              {searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map(recruit => (
                    <div 
                      key={recruit.id} 
                      className="px-3 py-2 hover:bg-gray-600 cursor-pointer flex justify-between items-center"
                      onClick={() => handleAddSoldier(recruit.id)}
                    >
                      <div>
                        <div className="text-white">{recruit.name}</div>
                        <div className="text-gray-400 text-sm">السرية: {recruit.company}</div>
                      </div>
                      <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">
                        {addingSoldier ? renderSearchButton() : "إضافة"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {soldierNameToAdd.trim().length >= 3 && searchResults.length === 0 && !isSearching && (
                <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg p-2 text-center text-gray-300">
                  لم يتم العثور على نتائج
                </div>
              )}
            </div>
            
            {addSoldierError && (
              <div className="text-red-500 text-sm">{addSoldierError}</div>
            )}
          </div>
        </div>
          {assignedRecruits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الرقم التعريفي</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الاسم</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">السرية</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">التسليح</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {assignedRecruits.map(recruit => (
                    <tr key={recruit.id} className="hover:bg-gray-600">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{recruit.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{recruit.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{recruit.company}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        <select
                          value={operation?.soldierArmaments?.[recruit.id] || 'بدون تسليح'}
                          onChange={(e) => handleUpdateArmament(recruit.id, e.target.value)}
                          className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {ARMAMENT_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 flex space-x-2">
                        <button
                          onClick={() => router.push(`/dashboard/recruits/${recruit.id}`)}
                          title="عرض الملف الشخصي"
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRemoveSoldier(recruit.id)}
                          title="حذف من الخدمة"
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                          disabled={removingSoldier === recruit.id}
                        >
                          {removingSoldier === recruit.id ? (
                            <div className="animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent"></div>
                          ) : (
                            <TrashIcon className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-700 rounded-lg p-4 text-center text-gray-300">
              لا يوجد مجندين معينين لهذه العملية حتى الآن
            </div>
          )}
        </div>

        {/* نموذج إضافة عسكري */}
        
      </div>
    </div>
  );
}