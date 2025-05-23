import { Submission, User, SubmissionStatus, Comment, MonthlyTheme } from '../types';
import { DEFAULT_USER_ID, ADMIN_USER_ID } from '../constants';

const SUBMISSIONS_KEY = 'factoryPulseSubmissions';
const USERS_KEY = 'factoryPulseUsers';
const MONTHLY_THEMES_KEY = 'factoryPulseMonthlyThemes';

const initialUsers: User[] = [
  { id: DEFAULT_USER_ID, name: "Alex Chen (Operator)", points: 150, isAdmin: false },
  { id: "user456", name: "Priya Sharma (Technician)", points: 220, isAdmin: false },
  { id: ADMIN_USER_ID, name: "Admin Supervisor", points: 0, isAdmin: true },
  { id: "user789", name: "Ben Carter (Engineer)", points: 80, isAdmin: false },
  { id: "user101", name: "Maria Garcia (QA)", points: 300, isAdmin: false },
];

const initialSubmissionsData: Submission[] = [
  {
    id: "sub1",
    employeeId: DEFAULT_USER_ID,
    employeeName: "Alex Chen (Operator)",
    category: "Safety (Machine Shop)",
    subCategory: "Machine Guarding",
    divisionName: "CNC Milling Section",
    description: "The guard on CNC machine #3 is loose and rattles during operation. Needs immediate attention.",
    imageUrl: "https://picsum.photos/seed/machine3/400/300",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 
    status: SubmissionStatus.RED_HOT,
    comments: [
      { id: "cmt1", userId: ADMIN_USER_ID, userName: "Admin Supervisor", text: "Maintenance team notified. Will check by EOD.", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
    ],
    rewardPoints: 20,
    isThemeRelated: false,
  },
  {
    id: "sub2",
    employeeId: "user456",
    employeeName: "Priya Sharma (Technician)",
    category: "Quality (Machining Shop)",
    subCategory: "Tool Life Improvement",
    description: "Suggesting a new type of coolant for the milling machines. It might extend tool life by 15-20%. Attached datasheet.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 
    status: SubmissionStatus.OPEN,
    comments: [],
    rewardPoints: 0,
    isThemeRelated: false,
  },
  {
    id: "sub3",
    employeeId: "user101",
    employeeName: "Maria Garcia (QA)",
    category: "Environment",
    subCategory: "Oil leakage management",
    description: "Observed a minor oil leak near the hydraulic press. It's creating a slip hazard.",
    imageUrl: "https://picsum.photos/seed/oilleak/400/300",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 
    status: SubmissionStatus.OPEN,
    comments: [],
    rewardPoints: 0,
    isThemeRelated: false,
  },
    {
    id: "sub4",
    employeeId: ADMIN_USER_ID, 
    employeeName: "Admin Supervisor",
    category: "Morale (Positive & Negative)",
    subCategory: "Good Practice (Teamwork, Initiative)",
    divisionName: "Assembly Line B",
    description: "Team B showed excellent teamwork in resolving the production line blockage yesterday. Their quick action prevented major delays.",
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), 
    status: SubmissionStatus.SUGGESTION, 
    comments: [],
    rewardPoints: 50, 
    isThemeRelated: false,
  },
];

const initialMonthlyThemesData: MonthlyTheme[] = [
  {
    id: "theme_safety_april_2024",
    title: "April Safety Focus",
    description: "Submit your best ideas for improving shop floor safety. Double points for implemented safety suggestions!",
    startDate: "2024-04-01",
    endDate: "2024-04-30",
    bonusMultiplier: 2,
    isActive: false,
    applicableCategories: ["Safety (Machine Shop)"]
  },
  {
    id: "theme_cost_may_2024",
    title: "May Cost Reduction Challenge",
    description: "Help us find ways to reduce scrap and optimize material usage. Bonus points for impactful cost-saving ideas.",
    startDate: "2024-05-01",
    endDate: "2024-05-31",
    bonusMultiplier: 1.5,
    isActive: true, // Example of an active theme
    applicableCategories: ["Cost Optimization", "Quality (Machining Shop)"]
  }
];


export const getInitialUsers = (): User[] => {
  const storedUsers = localStorage.getItem(USERS_KEY);
  if (storedUsers) {
    try {
      return JSON.parse(storedUsers).map((u:User) => ({...u, points: u.points || 0}));
    } catch (e) {
      console.error("Failed to parse users from localStorage", e);
      return initialUsers.map(u => ({...u, points: u.points || 0}));
    }
  }
  return initialUsers.map(u => ({...u, points: u.points || 0}));
};

export const getInitialSubmissions = (): Submission[] => {
  const storedSubmissions = localStorage.getItem(SUBMISSIONS_KEY);
  if (storedSubmissions) {
    try {
      return JSON.parse(storedSubmissions).map((s: Submission) => ({
        ...s,
        timestamp: new Date(s.timestamp),
        comments: s.comments.map((c: Comment) => ({ ...c, timestamp: new Date(c.timestamp) })),
        rewardPoints: s.rewardPoints || 0,
        divisionName: s.divisionName || undefined,
        isThemeRelated: s.isThemeRelated || false,
        themeId: s.themeId || undefined,
      }));
    } catch (e) {
      console.error("Failed to parse submissions from localStorage", e);
       return initialSubmissionsData.map(s => ({
        ...s,
        timestamp: new Date(s.timestamp),
        comments: s.comments.map(c => ({ ...c, timestamp: new Date(c.timestamp) })),
        rewardPoints: s.rewardPoints || 0,
        divisionName: s.divisionName || undefined,
        isThemeRelated: s.isThemeRelated || false,
        themeId: s.themeId || undefined,
      }));
    }
  }
   return initialSubmissionsData.map(s => ({
        ...s,
        timestamp: new Date(s.timestamp),
        comments: s.comments.map(c => ({ ...c, timestamp: new Date(c.timestamp) })),
        rewardPoints: s.rewardPoints || 0,
        divisionName: s.divisionName || undefined,
        isThemeRelated: s.isThemeRelated || false,
        themeId: s.themeId || undefined,
      }));
};

export const getInitialMonthlyThemes = (): MonthlyTheme[] => {
  const storedThemes = localStorage.getItem(MONTHLY_THEMES_KEY);
  if (storedThemes) {
    try {
      return JSON.parse(storedThemes);
    } catch (e) {
      console.error("Failed to parse monthly themes from localStorage", e);
      return initialMonthlyThemesData;
    }
  }
  return initialMonthlyThemesData;
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const saveSubmissions = (submissions: Submission[]): void => {
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
};

export const saveMonthlyThemes = (themes: MonthlyTheme[]): void => {
  localStorage.setItem(MONTHLY_THEMES_KEY, JSON.stringify(themes));
};