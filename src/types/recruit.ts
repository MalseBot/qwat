export interface Leave {
  startDate: string;
  endDate: string;
  type: string;
}

export interface Recruit {
  id: string;
  name: string;
  nationalId: string;
  militaryNumber: string;
  company: string;
  startDate: string;
  endDate: string;
  governorate: string;
  maritalStatus: string;
  educationLevel: string;
  notes: string;
  imagePath?: string;
  leaves?: Leave[];
  records?: Record<string, string>[];
  serviceDuration?: string;
  additionalDays?: boolean;
  mobileNumber?: string;
  relativeNumber?: string;
  childrenCount?: number;
}

export interface Record {
  id: string;
  name: string;
  nationalId: string;
  militaryNumber: string;
  company: string;
  startDate: string;
  endDate: string;
  governorate: string;
  maritalStatus: string;
  childrenCount?: number;
  educationLevel: string;
  notes: string;
  imagePath?: string;
  leaves?: Leave[];
  records?: Record};
