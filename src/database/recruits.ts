'use server';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Recruit, Leave } from '@/types/recruit';

// Remove the import for defaultRecruits
// import { defaultRecruits } from '../data/defaultRecruits';

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'recruits.json');

async function ensureDirectoryExists() {
  const dir = path.dirname(DB_FILE_PATH);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function getAllRecruits(): Promise<Recruit[]> {
  try {
    await ensureDirectoryExists();
    
    try {
      const data = await fs.readFile(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data) as Recruit[];
    } catch {
      // Return an empty array if no data exists
      return [];
    }
  } catch (error) {
    console.error('Error reading recruits data:', error);
    return [];
  }
}

export async function getRecruitById(id: string): Promise<Recruit | undefined> {
  try {
    const recruits = await getAllRecruits();
    return recruits.find(recruit => recruit.id === id);
  } catch (error) {
    console.error('خطأ في البحث عن المجند:', error);
    return undefined;
  }
}

export async function getRecruitsByCompany(company: string): Promise<Recruit[]> {
  const recruits = await getAllRecruits();
  return recruits.filter(recruit => recruit.company === company);
}

export async function addRecruit(recruit: Recruit): Promise<boolean> {
  try {
    await ensureDirectoryExists();
    const recruits = await getAllRecruits();
    
    const isDuplicate = recruits.some(
      r => r.militaryNumber === recruit.militaryNumber || r.nationalId === recruit.nationalId
    );
    
    if (isDuplicate) {
      console.error('يوجد مجند بنفس الرقم العسكري أو الرقم القومي');
      return false;
    }
    
    recruits.push(recruit);
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(recruits, null, 2));
    return true;
  } catch (error) {
    console.error('خطأ في إضافة المجند:', error);
    return false;
  }
}

export async function updateRecruit(id: string, updatedData: Partial<Recruit>): Promise<boolean> {
  try {
    const recruits = await getAllRecruits();
    const index = recruits.findIndex(recruit => recruit.id === id);
    
    if (index !== -1) {
      recruits[index] = { ...recruits[index], ...updatedData };
      await fs.writeFile(DB_FILE_PATH, JSON.stringify(recruits, null, 2));
      return true;
    }
    return false;
  } catch (error) {
    console.error('خطأ في تحديث بيانات المجند:', error);
    return false;
  }
}

export async function addNoteToRecruit(id: string, note: string): Promise<boolean> {
  try {
    const recruits = await getAllRecruits();
    const recruit = recruits.find(r => r.id === id);
    
    if (recruit) {
      recruit.notes = recruit.notes ? `${recruit.notes}\n${note}` : note;
      await fs.writeFile(DB_FILE_PATH, JSON.stringify(recruits, null, 2));
      return true;
    }
    return false;
  } catch (error) {
    console.error('خطأ في إضافة ملاحظة للمجند:', error);
    return false;
  }
}

export async function addLeaveToRecruit(id: string, leave: Leave): Promise<boolean> {
  try {
    const recruits = await getAllRecruits();
    const recruit = recruits.find(r => r.id === id);
    
    if (recruit) {
      if (!recruit.leaves) {
        recruit.leaves = [];
      }
      recruit.leaves.push(leave);
      await fs.writeFile(DB_FILE_PATH, JSON.stringify(recruits, null, 2));
      return true;
    }
    return false;
  } catch (error) {
    console.error('خطأ في إضافة إجازة للمجند:', error);
    return false;
  }
}

// دالة للبحث عن المجندين بالاسم
export async function getRecruitsByName(name: string): Promise<Recruit[]> {
  try {
    const recruits = await getAllRecruits();
    // البحث عن المجندين الذين يحتوي اسمهم على النص المدخل
    return recruits.filter(recruit => 
      recruit.name.toLowerCase().includes(name.toLowerCase())
    );
  } catch (error) {
    console.error('خطأ في البحث عن المجندين بالاسم:', error);
    return [];
  }
}