"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  rank: string;
  department: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('فشل في تحليل بيانات المستخدم:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  return (
    <div className="bg-blue-700 text-white shadow-2xl">
      {/* Top bar with logo and user info */}
      <div className="bg-yellow-500 text-white py-1">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="text-md font-bold">
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            {user ? (
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className="text-xl font-bold">مرحباً، {user.username} ({user.rank})</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 mx-1 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main navbar with logo and title */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-20 w-20 relative">
              <Image
                src="/logo.jpg"
                alt="شعار قوات الأمن"
                fill
                className="object-contain"
              />
            </div>
            <div className="mr-4">
              <h1 className="text-2xl font-bold text-white">نظام إدارة شؤون المجندين</h1>
              <p className="text-sm text-gray-300">وزارة الداخلية - قوات الأمن</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            {user && (
              <div className="text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
                <div className="text-sm font-medium">القسم: {user.department}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}