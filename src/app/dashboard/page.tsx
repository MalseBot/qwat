"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';


interface User {
  id: string;
  username: string;
  rank: string;
  department: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6 border-r-4 border-yellow-500 pr-3 text-black'>
        لوحة التحكم الرئيسية
      </h1>

      {user && (
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4 text-yellow-600'>
            معلومات المستخدم
          </h2>
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-white p-3 rounded shadow-sm'>
              <p className='text-gray-600 text-sm'>اسم المستخدم:</p>
              <p className='font-medium text-black'>{user.username}</p>
            </div>
            <div className='bg-white p-3 rounded shadow-sm'>
              <p className='text-gray-600 text-sm'>الرتبة:</p>
              <p className='font-medium text-black'>{user.rank}</p>
            </div>
            <div className='bg-white p-3 rounded shadow-sm'>
              <p className='text-gray-600 text-sm'>القسم:</p>
              <p className='text-black font-medium'>{user.department}</p>
            </div>
            <div className='bg-white p-3 rounded shadow-sm'>
              <p className='text-gray-600 text-sm'>رقم المستخدم:</p>
              <p className='font-medium text-black'>{user.id}</p>
            </div>
          </div>
        </div>
      )}

      <div className='mb-8'>
        <h2 className='text-xl font-semibold mb-4 text-yellow-600'>
          الخدمات الإلكترونية
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Link
            href='/dashboard/recruits'
            className='bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center'>
            <div className='h-16 w-16 bg-yellow-100 rounded-full mx-auto flex items-center justify-center mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-yellow-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
            </div>
            <h3 className='font-bold text-gray-800 mb-2'>شؤون المجندين</h3>
            <p className='text-gray-600 text-sm'>
              إدارة شؤون المجندين وتتبع حالاتهم
            </p>
          </Link>

          <Link
            href='/dashboard/training'
            className='bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center'>
            <div className='h-16 w-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-blue-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                />
              </svg>
            </div>
            <h3 className='font-bold text-gray-800 mb-2'>التدريب</h3>
            <p className='text-gray-600 text-sm'>
              إدارة برامج التدريب والدورات
            </p>
          </Link>

          <Link
            href='/dashboard/operations'
            className='bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center'>
            <div className='h-16 w-16 bg-orange-100 rounded-full mx-auto flex items-center justify-center mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-orange-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                />
              </svg>
            </div>
            <h3 className='font-bold text-gray-800 mb-2'>العمليات</h3>
            <p className='text-gray-600 text-sm'>
              إدارة العمليات وتعيين المجندين
            </p>
          </Link>

          <Link
            href='/dashboard/security'
            className='bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center'>
            <div className='h-16 w-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-green-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                />
              </svg>
            </div>
            <h3 className='font-bold text-gray-800 mb-2'>الأمن</h3>
            <p className='text-gray-600 text-sm'>
              إدارة الشؤون الأمنية والحماية
            </p>
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <h2 className='text-lg font-semibold mb-4 text-yellow-600'>
            آخر الإشعارات
          </h2>
          <div className='space-y-4'>
            <div className='border-r-4 border-yellow-500 pr-3 py-2'>
              <h3 className='font-medium'>تحديث بيانات المجندين</h3>
              <p className='text-gray-600 text-sm'>
                تم تحديث بيانات المجندين للدفعة الجديدة
              </p>
              <p className='text-gray-400 text-xs mt-1'>منذ 3 ساعات</p>
            </div>
            <div className='border-r-4 border-blue-500 pr-3 py-2'>
              <h3 className='font-medium'>دورة تدريبية جديدة</h3>
              <p className='text-gray-600 text-sm'>
                تم إضافة دورة تدريبية جديدة للضباط
              </p>
              <p className='text-gray-400 text-xs mt-1'>منذ يوم واحد</p>
            </div>
            <div className='border-r-4 border-green-500 pr-3 py-2'>
              <h3 className='font-medium'>تقرير أمني جديد</h3>
              <p className='text-gray-600 text-sm'>تم إضافة تقرير أمني جديد</p>
              <p className='text-gray-400 text-xs mt-1'>منذ 3 أيام</p>
            </div>
          </div>
        </div>

        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <h2 className='text-lg font-semibold mb-4 text-yellow-600'>
            إحصائيات سريعة
          </h2>
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-yellow-50 p-4 rounded-lg'>
              <h3 className='font-medium text-yellow-700'>المجندون</h3>
              <p className='text-3xl font-bold text-yellow-600'>4</p>
              <p className='text-gray-600 text-xs mt-1'>إجمالي عدد المجندين</p>
            </div>
            <div className='bg-green-50 p-4 rounded-lg'>
              <h3 className='font-medium text-green-700'>المجندون المعينون</h3>
              <p className='text-3xl font-bold text-green-600'>3</p>
              <p className='text-gray-600 text-xs mt-1'>معينون في عمليات</p>
            </div>
            <div className='bg-red-50 p-4 rounded-lg'>
              <h3 className='font-medium text-red-700'>المجندون غير المعينين</h3>
              <p className='text-3xl font-bold text-red-600'>1</p>
              <p className='text-gray-600 text-xs mt-1'>لم يتم تعيينهم في عمليات</p>
            </div>
            <div className='bg-orange-50 p-4 rounded-lg'>
              <h3 className='font-medium text-orange-700'>العمليات</h3>
              <p className='text-3xl font-bold text-orange-600'>2</p>
              <p className='text-gray-600 text-xs mt-1'>العمليات قيد التنفيذ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}