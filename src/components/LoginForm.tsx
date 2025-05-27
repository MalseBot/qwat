"use client";
import { useState } from 'react';
import { authenticateUser } from '@/database/users';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // التحقق من صحة بيانات تسجيل الدخول
    const user = authenticateUser(username, password);
    
    if (user) {
      // في حالة نجاح تسجيل الدخول
      console.log('تم تسجيل الدخول بنجاح:', user);
      // يمكن تخزين بيانات المستخدم في localStorage أو استخدام مكتبة إدارة الحالة
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // توجيه المستخدم إلى الصفحة الخاصة بقسمه
      const departmentPath = getDepartmentPath(user.department);
      router.push(departmentPath === 'القيادة' ? '/dashboard' : departmentPath);
    } else {
      // في حالة فشل تسجيل الدخول
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  // دالة لتحديد مسار الصفحة بناءً على قسم المستخدم
  const getDepartmentPath = (department: string): string => {
    switch (department) {
      case 'شؤون المجندين':
        return '/dashboard/recruits';
      case 'الإدارة':
        return '/dashboard/administration';
      case 'التدريب':
        return '/dashboard/training';
      case 'الأمن':
        return '/dashboard/security';
      case 'القيادة':
        return '/dashboard/command';
      default:
        return '/dashboard'; // صفحة افتراضية في حالة عدم وجود قسم محدد
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-24 w-24 relative">
              <Image
                src="/logo.jpg"
                alt="شعار قوات الأمن"
                fill
                className="object-contain "
              />
            </div>
          </div>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">تسجيل الدخول</h2>
          <p className="mt-2 text-sm text-gray-600">نظام إدارة شؤون المجندين - وزارة الداخلية</p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                اسم المستخدم
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              تسجيل الدخول
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}