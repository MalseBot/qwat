"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getRecruitById, updateRecruit } from '@/database/recruits';

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

export default function EditRecruitPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // تعريف نوع البيانات الأولي للنموذج
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    company: 'س1',
    startDate: '',
    endDate: '',
    serviceDuration: '1',
    additionalDays: false,
    nationalId: '',
    militaryNumber: '',
    governorate: '',
    maritalStatus: 'أعزب',
    childrenCount: 0, // إضافة حقل عدد الأبناء
    educationLevel: '',
    notes: '',
    imagePath: '',
    mobileNumber: '',
    relativeNumber: ''
  });

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

  const maritalStatuses = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];
  const educationLevels = ['أمي', 'ابتدائي', 'إعدادي', 'ثانوي', 'دبلوم', 'جامعي', 'دراسات عليا'];
  const companies = ['س1', 'س2', 'س3', 'س4', 'س5', 'س6', 'س7', 'خوارج'];
  const serviceDurations = [
    { value: '1', label: 'سنة' },
    { value: '1.5', label: 'سنة ونصف' },
    { value: '2', label: 'سنتين' },
    { value: '3', label: 'ثلاة سنوات' }
  ];

  // جلب بيانات المجند عند تحميل الصفحة
  useEffect(() => {
    async function fetchRecruit() {
      try {
        const recruit = await getRecruitById(params.id);
        if (recruit) {
          setFormData({
            ...recruit,
            serviceDuration: (recruit).serviceDuration || '1',
            additionalDays: (recruit).additionalDays || false,
            mobileNumber: (recruit).mobileNumber || '',
            relativeNumber: (recruit).relativeNumber || '',
            imagePath: recruit.imagePath || '',
            childrenCount: (recruit).childrenCount || 0 // Ensure childrenCount is always a number
          });
          if (recruit.imagePath) {
            setImagePreview(recruit.imagePath);
          }
        } else {
          router.push('/dashboard/recruits');
        }
      } catch (error) {
        console.error('Error fetching recruit:', error);
        router.push('/dashboard/recruits');
      }
    }
    fetchRecruit();
  }, [params.id, router]);

  // حساب تاريخ نهاية الخدمة تلقائيًا
  useEffect(() => {
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const durationInYears = parseFloat(formData.serviceDuration);
      
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + Math.floor(durationInYears));
      
      const monthsToAdd = Math.round((durationInYears % 1) * 12);
      endDate.setMonth(endDate.getMonth() + monthsToAdd);
      
      if (formData.additionalDays) {
        endDate.setDate(endDate.getDate() + 45);
      }
      
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.startDate, formData.serviceDuration, formData.additionalDays]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      if (errors.profileImage) {
        setErrors(prev => ({ ...prev, profileImage: '' }));
      }
    }
  };

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
      
      if (!file.type.match('image.*')) {
        setErrors(prev => ({ ...prev, profileImage: 'يرجى رفع صورة فقط' }));
        return;
      }
      
      setProfileImage(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
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

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.mobileNumber) newErrors.mobileNumber = 'رقم الموبايل مطلوب';
    if (!formData.relativeNumber) newErrors.relativeNumber = 'رقم أقرب الأقارب مطلوب';
    
    if (formData.mobileNumber && !/^01[0125][0-9]{8}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'رقم الموبايل غير صحيح';
    }
    
    if (formData.relativeNumber && !/^01[0125][0-9]{8}$/.test(formData.relativeNumber)) {
      newErrors.relativeNumber = 'رقم الموبايل غير صحيح';
    }

    if (!formData.name) newErrors.name = 'الاسم مطلوب';
    if (!formData.nationalId) newErrors.nationalId = 'الرقم القومي مطلوب';
    if (!formData.militaryNumber) newErrors.militaryNumber = 'الرقم العسكري مطلوب';
    if (!formData.governorate) newErrors.governorate = 'المحافظة مطلوبة';
    if (!formData.startDate) newErrors.startDate = 'تاريخ بداية الخدمة مطلوب';
    if (!formData.educationLevel) newErrors.educationLevel = 'المستوى التعليمي مطلوب';

    if (formData.nationalId && formData.nationalId.length !== 14) {
      newErrors.nationalId = 'الرقم القومي يجب أن يتكون من 14 رقم';
    } else if (formData.nationalId && !/^\d+$/.test(formData.nationalId)) {
      newErrors.nationalId = 'الرقم القومي يجب أن يحتوي على أرقام فقط';
    }

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
      const recruitData = { ...formData };
      
      if (profileImage) {
        const safeFileName = formData.name.replace(/\s+/g, '_');
        const uniqueFileName = `${safeFileName}_${formData.militaryNumber}`;
        
        try {
          const imagePath = await saveRecruitImage(profileImage, uniqueFileName);
          recruitData.imagePath = imagePath;
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
      
      const success = await updateRecruit(params.id, recruitData);
      
      if (success) {
        router.push('/dashboard/recruits');
      } else {
        throw new Error('فشل في تحديث بيانات المجند');
      }
      
    } catch (error) {
      console.error('حدث خطأ أثناء تحديث بيانات المجند:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'حدث خطأ أثناء تحديث بيانات المجند. يرجى المحاولة مرة أخرى.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold border-r-4 border-yellow-500 text-black pr-3">تعديل بيانات المجند</h1>
        <button 
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          العودة
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-black focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ نهاية الخدمة</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      disabled
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-black"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </div>
          </div>
      </form>
      </div>
    </div>
  );
}