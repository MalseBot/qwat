"use client";
import Link from 'next/link';

export default function SecurityPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 border-r-4 border-yellow-500 pr-3 text-black">
        قسم الأمن
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/security/services"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center"
        >
          <div className="h-16 w-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 className="font-bold text-gray-800 mb-2">الخدمات الأمنية</h3>
          <p className="text-gray-600 text-sm">
            إدارة وتنظيم الخدمات الأمنية
          </p>
        </Link>

        <Link
          href="/dashboard/security/permits"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center"
        >
          <div className="h-16 w-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="font-bold text-gray-800 mb-2">التصاريح</h3>
          <p className="text-gray-600 text-sm">
            إدارة تصاريح الدخول والخروج
          </p>
        </Link>
      </div>
    </div>
  );
}