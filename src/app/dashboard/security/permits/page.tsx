"use client";
import { useRouter } from 'next/navigation';

export default function SecurityPermitsPage() {
  const router = useRouter();

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6 border-r-4 border-yellow-500 pr-3 text-black">
          التصاريح
        </h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 mb-6"
        >
          رجوع
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-700">
          إدارة التصاريح
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="font-bold mb-4">تصاريح الدخول</h3>
            {/* هنا يمكن إضافة نموذج إدارة تصاريح الدخول */}
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-bold mb-4">تصاريح الخروج</h3>
            {/* هنا يمكن إضافة نموذج إدارة تصاريح الخروج */}
          </div>
        </div>
      </div>
    </div>
  );
}