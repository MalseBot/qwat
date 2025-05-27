'use server';

import { promises as fs } from 'node:fs';
import path from 'node:path';

// تعريف نوع البيانات للعمليات
export interface Operation {
  id: string;
  name: string;
  requiredSoldiers: number;
  departureTime: string;
  location: string;
  description?: string;
  status: 'قادمة' | 'جارية' | 'منتهية';
  assignedSoldiers?: string[]; // معرفات المجندين المعينين للعملية
  soldierArmaments?: { [soldierId: string]: string }; // تسليح العساكر (معرف العسكري: نوع التسليح)
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'operations.json');

async function ensureDirectoryExists() {
  const dir = path.dirname(DB_FILE_PATH);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// دالة للحصول على جميع العمليات
export async function getAllOperations(): Promise<Operation[]> {
  try {
    await ensureDirectoryExists();
    
    try {
      const data = await fs.readFile(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data) as Operation[];
    } catch {
      // إرجاع مصفوفة فارغة إذا لم تكن هناك بيانات
      return [];
    }
  } catch (error) {
    console.error('خطأ في قراءة بيانات العمليات:', error);
    return [];
  }
}

// دالة للحصول على عملية بواسطة المعرف
export async function getOperationById(id: string): Promise<Operation | undefined> {
  try {
    const operations = await getAllOperations();
    return operations.find(operation => operation.id === id);
  } catch (error) {
    console.error('خطأ في البحث عن العملية:', error);
    return undefined;
  }
}

// دالة للحصول على العمليات حسب الحالة
export async function getOperationsByStatus(status: string): Promise<Operation[]> {
  const operations = await getAllOperations();
  return operations.filter(operation => operation.status === status);
}

// دالة لإضافة عملية جديدة
export async function addOperation(operation: Operation): Promise<boolean> {
  try {
    await ensureDirectoryExists();
    const operations = await getAllOperations();
    
    // التحقق من عدم وجود عملية بنفس المعرف
    const isDuplicate = operations.some(op => op.id === operation.id);
    
    if (isDuplicate) {
      console.error('يوجد عملية بنفس المعرف');
      return false;
    }
    
    operations.push(operation);
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(operations, null, 2));
    return true;
  } catch (error) {
    console.error('خطأ في إضافة العملية:', error);
    return false;
  }
}

// دالة لتحديث بيانات عملية
export async function updateOperation(id: string, updatedData: Partial<Operation>): Promise<boolean> {
  try {
    const operations = await getAllOperations();
    const index = operations.findIndex(operation => operation.id === id);
    
    if (index !== -1) {
      operations[index] = { ...operations[index], ...updatedData };
      await fs.writeFile(DB_FILE_PATH, JSON.stringify(operations, null, 2));
      return true;
    }
    return false;
  } catch (error) {
    console.error('خطأ في تحديث بيانات العملية:', error);
    return false;
  }
}

// دالة لتعيين مجندين للعملية
export async function assignSoldiersToOperation(id: string, soldierIds: string[]): Promise<boolean> {
  try {
    const operations = await getAllOperations();
    const operation = operations.find(op => op.id === id);
    
    if (operation) {
      if (!operation.assignedSoldiers) {
        operation.assignedSoldiers = [];
      }
      
      // إضافة المجندين الجدد (مع تجنب التكرار)
      soldierIds.forEach(soldierId => {
        if (!operation.assignedSoldiers?.includes(soldierId)) {
          operation.assignedSoldiers?.push(soldierId);
        }
      });
      
      await fs.writeFile(DB_FILE_PATH, JSON.stringify(operations, null, 2));
      return true;
    }
    return false;
  } catch (error) {
    console.error('خطأ في تعيين المجندين للعملية:', error);
    return false;
  }
}

// دالة لإزالة مجندين من العملية
export async function removeSoldiersFromOperation(id: string, soldierIds: string[]): Promise<boolean> {
  try {
    const operations = await getAllOperations();
    const operation = operations.find(op => op.id === id);
    
    if (operation && operation.assignedSoldiers) {
      operation.assignedSoldiers = operation.assignedSoldiers.filter(
        soldierId => !soldierIds.includes(soldierId)
      );
      
      await fs.writeFile(DB_FILE_PATH, JSON.stringify(operations, null, 2));
      return true;
    }
    return false;
  } catch (error) {
    console.error('خطأ في إزالة المجندين من العملية:', error);
    return false;
  }
}

// دالة لتغيير حالة العملية
export async function changeOperationStatus(id: string, newStatus: 'قادمة' | 'جارية' | 'منتهية'): Promise<boolean> {
  try {
    const operations = await getAllOperations();
    const operation = operations.find(op => op.id === id);
    
    if (operation) {
      operation.status = newStatus;
      await fs.writeFile(DB_FILE_PATH, JSON.stringify(operations, null, 2));
      return true;
    }
    return false;
  } catch (error) {
    console.error('خطأ في تغيير حالة العملية:', error);
    return false;
  }
}

// دالة لتحديث تسليح العسكري في العملية
export async function updateSoldierArmament(operationId: string, soldierId: string, armamentType: string): Promise<boolean> {
  try {
    const operations = await getAllOperations();
    const operation = operations.find(op => op.id === operationId);
    
    if (operation) {
      // إنشاء أو تحديث كائن تسليح الجنود إذا لم يكن موجودًا
      if (!operation.soldierArmaments) {
        operation.soldierArmaments = {};
      }
      
      // تحديث نوع التسليح للعسكري
      operation.soldierArmaments[soldierId] = armamentType;
      
      await fs.writeFile(DB_FILE_PATH, JSON.stringify(operations, null, 2));
      return true;
    }
    return false;
  } catch (error) {
    console.error('خطأ في تحديث تسليح العسكري:', error);
    return false;
  }
}