export interface User {
  id: string;
  username: string;
  password: string; // في التطبيق الحقيقي، يجب تخزين كلمات المرور بشكل مشفر
  rank: string;     // الرتبة العسكرية
  department: string; // القسم
  role: string;     // دور المستخدم (مثل: admin, user, developer, commander)
}

// بيانات المستخدمين للاختبار
export const users: User[] = [
  {
    id: '1',
    username: 'admin',
    password: '0147852',
    rank: 'جندي 1',
    department: 'مطور',
    role: 'developer'
  },
  {
    id: '2',
    username: 'mohamed',
    password: 'password456',
    rank: 'نقيب',
    department: 'الإدارة',
    role: 'admin'
  },
  {
    id: '3',
    username: 'ali',
    password: 'password789',
    rank: 'رائد',
    department: 'التدريب',
    role: 'user'
  },
  {
    id: '4',
    username: 'omar',
    password: 'password101',
    rank: 'عقيد',
    department: 'الأمن',
    role: 'user'
  },
  {
    id: '5',
    username: 'khaled',
    password: 'password202',
    rank: 'عميد',
    department: 'القيادة',
    role: 'commander'
  }
];

// دالة للتحقق من صحة بيانات تسجيل الدخول
export function authenticateUser(username: string, password: string): User | null {
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
}

// دالة للحصول على مستخدم بواسطة المعرف
export function getUserById(id: string): User | null {
  const user = users.find(u => u.id === id);
  return user || null;
}

// دالة للحصول على جميع المستخدمين
export function getAllUsers(): User[] {
  return users;
}

// دالة للحصول على المستخدمين حسب القسم
export function getUsersByDepartment(department: string): User[] {
  return users.filter(u => u.department === department);
}

// دالة للحصول على المستخدمين حسب الرتبة
export function getUsersByRank(rank: string): User[] {
  return users.filter(u => u.rank === rank);
}