"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface Operation {
  id: string;
  name: string;
  requiredSoldiers: number;
  departureTime: string;
  location: string;
  description: string;
  status: string;
  assignedSoldiers: string[];
}

interface Recruit {
  id: string;
  name: string;
  rank: string;
  unit: string;
  serviceTime: string;
  armamentType?: string;
  operationName?: string;
  operationStatus?: string;
}

interface RecruitData {
  id: string;
  name: string;
  rank: string;
  unit: string;
}

export default function SecurityServicesPage() {
  const router = useRouter();
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const response = await fetch('/data/operations.json');
        const data: Operation[] = await response.json();

        const tableData = data.flatMap((operation: Operation) => {
          return operation.assignedSoldiers.map((soldierId: string) => ({
            id: soldierId,
            name: 'يتم التحميل...',
            rank: 'يتم التحميل...',
            unit: 'يتم التحميل...',
            serviceTime: new Date(operation.departureTime).toLocaleTimeString('ar-SA'),
            armamentType: 'بندقية آلية',
            operationName: operation.name,
            operationStatus: operation.status
          }));
        });

        setRecruits(tableData);
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
      }
    };

    fetchOperations();
  }, []);

  const handleScan = () => {
    setScanning(true);
    
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10,
          qrbox: 250,
          rememberLastUsedCamera: true,
          aspectRatio: 1,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        },
        false
      );
    }

    scannerRef.current.render(
      async (decodedText: string) => {
        try {
          // إيقاف المسح بعد العثور على QR Code
          if (scannerRef.current) {
            scannerRef.current.clear();
          }

          const response = await fetch('/data/recruits.json');
          const recruitsData: RecruitData[] = await response.json();
          const recruit = recruitsData.find((r) => r.id === decodedText);
          
          if (recruit) {
            setRecruits(prev => [...prev, {
              id: recruit.id,
              name: recruit.name,
              rank: recruit.rank,
              unit: recruit.unit,
              serviceTime: new Date().toLocaleTimeString('ar-SA'),
              armamentType: 'بندقية آلية',
              operationName: 'حراسة جديدة',
              operationStatus: 'قادمة'
            }]);
          }
        } catch (error) {
          console.error('خطأ في تحميل بيانات المجند:', error);
        } finally {
          setScanning(false);
        }
      },
      (error) => {
        console.error('خطأ في مسح QR Code:', error);
      }
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6 border-r-4 border-yellow-500 pr-3 text-blue-700">
          الخدمات
        </h1>
        <div className="flex gap-4">
          <button
            onClick={handleScan}
            disabled={scanning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 mb-6 flex items-center gap-2"
          >
            {scanning ? 'إغلاق الماسح' : 'إضافة مجند'}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v2h-2V4H6v2H4V4zm2 6a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8zm2 0v8h8v-8H8z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 mb-6"
          >
            رجوع
          </button>
        </div>
      </div>

      {scanning && (
        <div className="mb-6">
          <div id="qr-reader" className="w-full max-w-lg mx-auto"></div>
        </div>
      )}

      <div className="bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">
          جدول الخدمات
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="py-2 px-4 border-b text-right">الاسم</th>
                <th className="py-2 px-4 border-b text-right">الرتبة</th>
                <th className="py-2 px-4 border-b text-right">الوحدة</th>
                <th className="py-2 px-4 border-b text-right">وقت الخدمة</th>
                <th className="py-2 px-4 border-b text-right">التسليح</th>
                <th className="py-2 px-4 border-b text-right">اسم العملية</th>
                <th className="py-2 px-4 border-b text-right">حالة العملية</th>
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {recruits.map((recruit) => (
                <tr key={recruit.id} className="hover:bg-gray-600">
                  <td className="py-2 px-4 border-b text-white">{recruit.name}</td>
                  <td className="py-2 px-4 border-b text-white">{recruit.rank}</td>
                  <td className="py-2 px-4 border-b text-white">{recruit.unit}</td>
                  <td className="py-2 px-4 border-b text-white">{recruit.serviceTime}</td>
                  <td className="py-2 px-4 border-b text-white">{recruit.armamentType || 'بدون تسليح'}</td>
                  <td className="py-2 px-4 border-b text-white">{recruit.operationName}</td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${recruit.operationStatus === 'قادمة' ? 'bg-yellow-100 text-yellow-800' : 
                        recruit.operationStatus === 'جارية' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {recruit.operationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}