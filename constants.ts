
import { CategoryDetail } from './types';

export const CATEGORIES_DATA: CategoryDetail[] = [
  {
    name: "Safety (Machine Shop)",
    subcategories: [
      "PPE Compliance", "Machine Guarding", "Emergency Exits",
      "Hazard Reporting", "Ergonomics", "Fire Safety",
    ],
  },
  {
    name: "Quality (Machining Shop)",
    subcategories: [
      "Tool Life Improvement", "Rework Reduction", "Process Standardization",
      "Dimensional Accuracy", "Cutting Parameter Optimization",
      "Defect Elimination", "Visual Inspection Improvements",
    ],
  },
  {
    name: "Environment",
    subcategories: [
      "Oil leakage management", "Coolant mist control", "Noise reduction",
      "Air quality improvement", "Waste disposal", "Lighting and ventilation",
    ],
  },
  {
    name: "Cost Optimization",
    subcategories: [
      "Scrap Reduction", "Energy Saving", "Cycle Time Improvement", "Material Wastage",
    ],
  },
  {
    name: "Morale (Positive & Negative)",
    subcategories: [
      "Good Practice (Teamwork, Initiative)", "Bad Practice (Absenteeism, Indiscipline)",
    ],
  },
  {
    name: "General Suggestion",
    subcategories: ["Process Improvement", "Welfare", "Other"],
  },
  {
    name: "Uncategorized",
    subcategories: ["Uncategorized"],
  }
];

export const GEMINI_MODEL_TEXT = "gemini-2.5-flash-preview-04-17";

export const DEFAULT_USER_ID = "user123"; // Mock current user
export const ADMIN_USER_ID = "admin001"; // Mock admin user
