"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { addRecruit } from '@/database/recruits'; // استيراد وظيفة إضافة مجند

// Helper function to save recruit image
const saveRecruitImage = async (file: File, fileName: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    return data.imagePath;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export default function AddRecruitPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // في useState formData
  const [formData, setFormData] = useState({
    id: Math.floor(Math.random() * 10000).toString(), // الرقم التعريفي تلقائي
    name: '',
    company: 'س1', // تغيير القسم إلى سرية
    startDate: '',
    endDate: '',
    serviceDuration: '1', // مدة الخدمة
    additionalDays: false, // إضافة 45 يوم
    nationalId: '',
    militaryNumber: '',
    governorate: '',
    maritalStatus: 'أعزب',
    childrenCount: '',
    educationLevel: '', // إضافة المستوى التعليمي
    notes: '', // إضافة ملاحظات
    imagePath: '', // إضافة مسار الصورة
    mobileNumber: '', // Add mobile number field
    relativeNumber: '', // Add relative's number field
  });

  // إضافة حالة للصورة
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // قائمة المحافظات في مصر
  const governorates = [
    'القاهرة', 'الإسكندرية', 'الجيزة', 'القليوبية', 'الشرقية', 'الدقهلية',
    'البحيرة', 'المنوفية', 'الغربية', 'كفر الشيخ', 'الفيوم', 'بني سويف',
    'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'بورسعيد',
    'السويس', 'الإسماعيلية', 'دمياط', 'مطروح', 'شمال سيناء', 'جنوب سيناء',
    'البحر الأحمر', 'الوادي الجديد'
  ];

  // قائمة الحالات الاجتماعية
  const maritalStatuses = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];

  // قائمة المستويات التعليمية
  const educationLevels = ['أمي', 'ابتدائي', 'إعدادي', 'ثانوي', 'دبلوم', 'جامعي', 'دراسات عليا'];

  // قائمة السرايا
  const companies = ['س1', 'س2', 'س3', 'س4', 'س5', 'س6', 'س7', 'خوارج'];

  // قائمة مدد الخدمة
  const serviceDurations = [
    { value: '1', label: 'سنة' },
    { value: '1.5', label: 'سنة ونصف' },
    { value: '2', label: 'سنتين' },
    { value: '3', label: 'ثلاث سنوات' }
  ];

  // حساب تاريخ نهاية الخدمة تلقائيًا
  useEffect(() => {
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const durationInYears = parseFloat(formData.serviceDuration);
      
      // حساب تاريخ نهاية الخدمة
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + Math.floor(durationInYears));
      
      // إضافة الأشهر إذا كانت هناك كسور في السنوات
      const monthsToAdd = Math.round((durationInYears % 1) * 12);
      endDate.setMonth(endDate.getMonth() + monthsToAdd);
      
      // إضافة 45 يوم إذا تم اختيار ذلك
      if (formData.additionalDays) {
        endDate.setDate(endDate.getDate() + 45);
      }
      
      // تحديث تاريخ نهاية الخدمة في النموذج
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.startDate, formData.serviceDuration, formData.additionalDays]);

  // إضافة وظائف معالجة الصورة
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // مسح أي خطأ متعلق بالصورة
      if (errors.profileImage) {
        setErrors(prev => ({ ...prev, profileImage: '' }));
      }
    }
  };

  // معالجة سحب وإفلات الصورة
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // التحقق من نوع الملف
      if (!file.type.match('image.*')) {
        setErrors(prev => ({ ...prev, profileImage: 'يرجى رفع صورة فقط' }));
        return;
      }
      
      setProfileImage(file);
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // مسح أي خطأ متعلق بالصورة
      if (errors.profileImage) {
        setErrors(prev => ({ ...prev, profileImage: '' }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // مسح رسالة الخطأ عند تغيير القيمة
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Add validation for new fields
    if (!formData.mobileNumber) newErrors.mobileNumber = 'رقم الموبايل مطلوب';
    if (!formData.relativeNumber) newErrors.relativeNumber = 'رقم أقرب الأقارب مطلوب';
    
    // Validate mobile number format
    if (formData.mobileNumber && !/^01[0125][0-9]{8}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'رقم الموبايل غير صحيح';
    }
    
    // Validate relative's number format
    if (formData.relativeNumber && !/^01[0125][0-9]{8}$/.test(formData.relativeNumber)) {
      newErrors.relativeNumber = 'رقم الموبايل غير صحيح';
    }

    // التحقق من الحقول المطلوبة
    if (!formData.name) newErrors.name = 'الاسم مطلوب';
    if (!formData.nationalId) newErrors.nationalId = 'الرقم القومي مطلوب';
    if (!formData.militaryNumber) newErrors.militaryNumber = 'الرقم العسكري مطلوب';
    if (!formData.governorate) newErrors.governorate = 'المحافظة مطلوبة';
    if (!formData.startDate) newErrors.startDate = 'تاريخ بداية الخدمة مطلوب';
    if (!formData.educationLevel) newErrors.educationLevel = 'المستوى التعليمي مطلوب';

    // التحقق من صحة الرقم القومي
    if (formData.nationalId && formData.nationalId.length !== 14) {
      newErrors.nationalId = 'الرقم القومي يجب أن يتكون من 14 رقم';
    } else if (formData.nationalId && !/^\d+$/.test(formData.nationalId)) {
      newErrors.nationalId = 'الرقم القومي يجب أن يحتوي على أرقام فقط';
    }

    // التحقق من صحة الرقم العسكري
    if (formData.militaryNumber && formData.militaryNumber.length !== 10) {
      newErrors.militaryNumber = 'الرقم العسكري يجب أن يتكون من 10 أرقام';
    } else if (formData.militaryNumber && !/^\d+$/.test(formData.militaryNumber)) {
      newErrors.militaryNumber = 'الرقم العسكري يجب أن يحتوي على أرقام فقط';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // إنشاء كائن المجند للإضافة
      const recruitData = { ...formData };
      
      // حفظ الصورة إذا كانت موجودة
      let imagePath = null;
      if (profileImage) {
        // استخدام اسم المجند كجزء من اسم الملف مع إزالة المسافات واستبدالها بشرطات سفلية
        const safeFileName = formData.name.replace(/\s+/g, '_');
        // إضافة الرقم العسكري لضمان فريدية اسم الملف
        const uniqueFileName = `${safeFileName}_${formData.militaryNumber}`;
        
        try {
          // حفظ الصورة واسترجاع المسار
          imagePath = await saveRecruitImage(profileImage, uniqueFileName);
          recruitData.imagePath = imagePath; // إضافة مسار الصورة إلى بيانات المجند
        } catch (imageError) {
          console.error('فشل في حفظ الصورة:', imageError);
          setErrors(prev => ({
            ...prev,
            profileImage: 'حدث خطأ أثناء حفظ الصورة. يرجى المحاولة مرة أخرى.'
          }));
          setIsSubmitting(false);
          return;
        }
      }
      
      // إضافة المجند إلى قاعدة البيانات
      const success = await addRecruit(recruitData);
      
      if (success) {
        // إعادة التوجيه إلى صفحة المجندين بعد الإضافة بنجاح
        router.push('/dashboard/recruits');
      } else {
        throw new Error('فشل في إضافة المجند');
      }
      
    } catch (error) {
      console.error('حدث خطأ أثناء إضافة المجند:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'حدث خطأ أثناء إضافة المجند. يرجى المحاولة مرة أخرى.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold border-r-4 border-yellow-500 text-black pr-3">إضافة مجند جديد</h1>
        <button 
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          العودة
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* تقسيم النموذج إلى أقسام واضحة */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* القسم الأول: الصورة والبيانات الأساسية */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-bold text-blue-800 mb-4 border-b pb-2">الصورة الشخصية</h2>
                
                <div 
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="relative h-48 w-48 mx-auto">
                      <Image 
                        src={imagePreview} 
                        alt="معاينة الصورة" 
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">اضغط لاختيار صورة أو اسحب وأفلت الصورة هنا</p>
                      <p className="mt-1 text-xs text-gray-500">PNG, JPG, JPEG حتى 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                {errors.profileImage && <p className="mt-1 text-sm text-red-600">{errors.profileImage}</p>}
              </div>
              
              {/* إخفاء الرقم التعريفي */}
              <input type="hidden" name="id" value={formData.id} />
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-bold text-blue-800 mb-4 border-b pb-2">بيانات الخدمة</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">السرية</label>
                    <select
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-black focus:border-blue-500"
                    >
                      {companies.map(company => (
                        <option key={company} value={company}>{company}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">مدة الخدمة</label>
                    <select
                      name="serviceDuration"
                      value={formData.serviceDuration}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-black focus:border-blue-500"
                    >
                      {serviceDurations.map(duration => (
                        <option key={duration.value} value={duration.value}>{duration.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="additionalDays"
                        checked={formData.additionalDays}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          additionalDays: e.target.checked
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="mr-2 text-sm text-gray-700">إضافة 45 يوم</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* القسم الثاني: البيانات الشخصية */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-bold text-blue-800 mb-4 border-b pb-2">البيانات الشخصية</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-black focus:border-blue-500"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الرقم القومي</label>
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-black focus:border-blue-500"
                      maxLength={14}
                      placeholder="14 رقم"
                    />
                    {errors.nationalId && <p className="mt-1 text-sm text-red-600">{errors.nationalId}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الموبايل</label>
                    <input
                      type="text"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-black focus:border-blue-500"
                      placeholder="01xxxxxxxxx"
                      maxLength={11}
                    />
                    {errors.mobileNumber && <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم أقرب الأقارب</label>
                    <input
                      type="text"
                      name="relativeNumber"
                      value={formData.relativeNumber}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-black focus:border-blue-500"
                      placeholder="01xxxxxxxxx"
                      maxLength={11}
                    />
                    {errors.relativeNumber && <p className="mt-1 text-sm text-red-600">{errors.relativeNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الرقم العسكري</label>
                    <input
                      type="text"
                      name="militaryNumber"
                      value={formData.militaryNumber}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-black focus:border-blue-500"
                      maxLength={10}
                      placeholder="10 أرقام"
                    />
                    {errors.militaryNumber && <p className="mt-1 text-sm text-red-600">{errors.militaryNumber}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المحافظة</label>
                    <select
                      name="governorate"
                      value={formData.governorate}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-black focus:border-blue-500"
                    >
                      <option value="">اختر المحافظة</option>
                      {governorates.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                    {errors.governorate && <p className="mt-1 text-sm text-red-600">{errors.governorate}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحالة الاجتماعية</label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-black focus:border-blue-500"
                    >
                      {maritalStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  {(formData.maritalStatus === 'متزوج' || formData.maritalStatus === 'مطلق') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">عدد الأبناء</label>
                      <input
                        type="number"
                        name="childrenCount"
                        value={formData.childrenCount}
                        onChange={handleChange}
                        min="0"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-black focus:border-blue-500"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المستوى التعليمي</label>
                    <select
                      name="educationLevel"
                      value={formData.educationLevel}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-black focus:border-blue-500"
                    >
                      <option value="">اختر المستوى التعليمي</option>
                      {educationLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    {errors.educationLevel && <p className="mt-1 text-sm text-red-600">{errors.educationLevel}</p>}
                  </div>
                </div>
              </div>
              
              {/* القسم الثالث: تواريخ الخدمة والملاحظات */}
              <div className="bg-gray-50 p-4 rounded-lg mt-6">
                <h2 className="text-lg font-bold text-blue-800 mb-4 border-b pb-2">تواريخ الخدمة</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ بداية الخدمة</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-black focus:border-blue-500"
                    />
                    {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ نهاية الخدمة (تلقائي)</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      readOnly
                      className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md text-black"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-black focus:border-blue-500"
                    placeholder="أدخل أي ملاحظات إضافية هنا..."
                  />
                </div>
              </div>
            </div>
          </div>
          
          {errors.submit && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {errors.submit}
            </div>
          )}
          
          <div className="flex justify-end pt-4 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="mr-4 px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )};