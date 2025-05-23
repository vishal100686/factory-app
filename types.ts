export interface User {
  id: string;
  name: string;
  points: number;
  isAdmin?: boolean;
}

export enum SubmissionStatus {
  OPEN = "Open",
  RED_HOT = "Red Hot",
  CLOSED = "Closed",
  SUGGESTION = "Suggestion"
}

export interface Comment {
  id: string;
  userId: string;
  userName: string; // denormalized for easy display
  text: string;
  timestamp: Date;
}

export interface MonthlyTheme {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO Date string
  endDate: string;   // ISO Date string
  bonusMultiplier: number; // e.g., 2 for double points
  isActive: boolean;
  applicableCategories?: string[]; // Optional: Link theme to specific main categories
}

export interface Submission {
  id: string;
  employeeId: string;
  employeeName: string; // denormalized
  category: string;
  subCategory: string;
  divisionName?: string; 
  description: string;
  imageUrl?: string;
  timestamp: Date;
  status: SubmissionStatus;
  comments: Comment[];
  rewardPoints: number;
  isThemeRelated?: boolean; // True if submission aligns with an active theme
  themeId?: string; // ID of the MonthlyTheme it's related to
}

export interface CategoryDetail {
  name: string;
  subcategories: string[];
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// For Gemini categorization response
export interface CategorizationResult {
  category: string;
  subcategory: string;
}