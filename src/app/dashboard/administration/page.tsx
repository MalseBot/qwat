export default function AdministrationPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-blue-700">الإدارة</h1>
      <div className="bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">إدارة الشؤون الإدارية</h2>
        <p className="mb-4 text-gray-300">هذه الصفحة مخصصة للشؤون الإدارية والتنظيمية.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
            <h3 className="font-medium text-lg mb-2 text-yellow-400">الهيكل التنظيمي</h3>
            <p className="text-gray-300">عرض وإدارة الهيكل التنظيمي</p>
            <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              عرض التفاصيل
            </button>
          </div>
          
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
            <h3 className="font-medium text-lg mb-2 text-yellow-400">الموارد البشرية</h3>
            <p className="text-gray-300">إدارة شؤون الموظفين والضباط</p>
            <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              عرض التفاصيل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}