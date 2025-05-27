"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

// Define a proper type for the user
interface User {
  id: string;
  username: string;
  rank: string;
  department: string;
  role?: string; // إضافة حقل الدور للمستخدم
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // التحقق مما إذا كان المستخدم مطورًا أو قائدًا
  const isAdminUser = () => {
    if (!user) return false;
    return user.role === 'developer' || user.role === 'commander' || user.rank === 'قائد' || user.rank === 'مطور';
  };

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <div className="flex flex-1 container mx-auto mt-4 px-4">
        <aside className="w-64 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-yellow-500 text-white py-3 px-4 font-bold text-center">
            القائمة الرئيسية
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="block p-2 hover:bg-yellow-50 rounded border-r-4 border-transparent hover:border-yellow-500 text-black font-bold transition-all">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/dashboard/recruits" className="block p-2 hover:bg-yellow-50 rounded border-r-4 border-transparent hover:border-yellow-500 text-black font-bold transition-all">
                  شؤون المجندين
                </Link>
              </li>
              <li>
                <Link href="/dashboard/operations" className="block p-2 hover:bg-yellow-50 rounded border-r-4 border-transparent hover:border-yellow-500 text-black font-bold transition-all">
                  العمليات
                </Link>
              </li>
              {/* عرض زر الإدارة فقط للمستخدمين المطورين والقادة */}
              {isAdminUser() && (
                <li>
                  <Link href="/dashboard/administration" className="block p-2 hover:bg-yellow-50 rounded border-r-4 border-transparent hover:border-yellow-500 text-black font-bold transition-all">
                    الإدارة
                  </Link>
                </li>
              )}
              <li>
                <Link href="/dashboard/security" className="block p-2 hover:bg-yellow-50 rounded border-r-4 border-transparent hover:border-yellow-500 text-black font-bold transition-all">
                  الأمن
                </Link>
              </li>
              <li>
                <Link href="/dashboard/command" className="block p-2 hover:bg-yellow-50 rounded border-r-4 border-transparent hover:border-yellow-500 text-black font-bold transition-all">
                  القيادة
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 bg-white p-6 mr-4 rounded-lg shadow-md">
          {children}
        </main>
      </div>
      
      <footer className="bg-black text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p>جميع الحقوق محفوظة © {new Date().getFullYear()} - نظام إدارة شؤون المجندين</p>
        </div>
      </footer>
    </div>
  );
}