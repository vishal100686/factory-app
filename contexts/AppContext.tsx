import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Submission, User, Comment, SubmissionStatus, ToastMessage, MonthlyTheme } from '../types';
import { 
  getInitialSubmissions, 
  getInitialUsers, 
  getInitialMonthlyThemes,
  saveSubmissions, 
  saveUsers,
  saveMonthlyThemes
} from '../services/dataService';
import { DEFAULT_USER_ID, ADMIN_USER_ID } from '../constants';

interface AppContextType {
  submissions: Submission[];
  users: User[];
  currentUser: User | null;
  monthlyThemes: MonthlyTheme[];
  activeTheme: MonthlyTheme | null;
  isLoading: boolean;
  error: string | null;
  toasts: ToastMessage[];
  addSubmission: (submission: Omit<Submission, 'id' | 'timestamp' | 'comments' | 'rewardPoints' | 'status' | 'employeeName' | 'isThemeRelated' | 'themeId'>) => Promise<void>;
  updateSubmissionStatus: (submissionId: string, status: SubmissionStatus, points?: number) => Promise<void>;
  addCommentToSubmission: (submissionId: string, commentText: string) => Promise<void>;
  setCurrentUser: (userId: string) => void;
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  assignRewardPoints: (submissionId: string, points: number) => Promise<void>;
  addMonthlyTheme: (themeData: Omit<MonthlyTheme, 'id' | 'isActive'>) => Promise<void>;
  updateMonthlyTheme: (themeId: string, updates: Partial<MonthlyTheme>) => Promise<void>;
  setActiveTheme: (themeId: string | null) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [monthlyThemes, setMonthlyThemes] = useState<MonthlyTheme[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const activeTheme = React.useMemo(() => monthlyThemes.find(theme => theme.isActive) || null, [monthlyThemes]);

  useEffect(() => {
    try {
      const initialSubmissions = getInitialSubmissions();
      const initialUsers = getInitialUsers();
      const initialThemes = getInitialMonthlyThemes();

      setSubmissions(initialSubmissions);
      setUsers(initialUsers);
      setMonthlyThemes(initialThemes);
      
      const defaultUser = initialUsers.find(u => u.id === DEFAULT_USER_ID) || initialUsers[0];
      if(defaultUser) setCurrentUserState(defaultUser);

    } catch (e) {
      setError("Failed to load initial data.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if(!isLoading) { 
        saveSubmissions(submissions);
    }
  }, [submissions, isLoading]);

  useEffect(() => {
    if(!isLoading) {
        saveUsers(users);
    }
  }, [users, isLoading]);

  useEffect(() => {
    if(!isLoading) {
        saveMonthlyThemes(monthlyThemes);
    }
  }, [monthlyThemes, isLoading]);


  const addToast = (message: string, type: ToastMessage['type']) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000); 
  };

  const removeToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  const setCurrentUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUserState(user);
      addToast(`Switched to user: ${user.name}`, 'info');
    } else {
      addToast(`User with ID ${userId} not found.`, 'error');
    }
  };

  const addSubmission = useCallback(async (submissionData: Omit<Submission, 'id' | 'timestamp' | 'comments' | 'rewardPoints' | 'status' | 'employeeName' | 'isThemeRelated' | 'themeId'>) => {
    if (!currentUser) {
      setError("No current user selected.");
      addToast("Error: No current user selected.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const newSubmission: Submission = {
        ...submissionData,
        id: `sub_${new Date().getTime()}_${Math.random().toString(16).slice(2)}`,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        timestamp: new Date(),
        comments: [],
        rewardPoints: 0,
        status: SubmissionStatus.OPEN,
        isThemeRelated: false, // Default, can be updated based on active theme
        themeId: undefined,
      };

      // Basic theme relation check (can be expanded)
      if (activeTheme) {
        const submissionDate = new Date(newSubmission.timestamp);
        const themeStartDate = new Date(activeTheme.startDate);
        const themeEndDate = new Date(activeTheme.endDate);
        if (submissionDate >= themeStartDate && submissionDate <= themeEndDate) {
          if (!activeTheme.applicableCategories || activeTheme.applicableCategories.length === 0 || activeTheme.applicableCategories.includes(newSubmission.category)) {
            newSubmission.isThemeRelated = true;
            newSubmission.themeId = activeTheme.id;
          }
        }
      }

      setSubmissions(prev => [newSubmission, ...prev]);
      addToast("Submission added successfully!" + (newSubmission.isThemeRelated ? " (Theme related!)" : ""), "success");
    } catch (e) {
      setError("Failed to add submission.");
      addToast("Failed to add submission.", "error");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, addToast, activeTheme]);

  const updateSubmissionStatus = useCallback(async (submissionId: string, status: SubmissionStatus, pointsAwardedParam?: number) => {
    setIsLoading(true);
    try {
      let pointsAwarded = pointsAwardedParam || 0;
      
      setSubmissions(prev =>
        prev.map(sub => {
          if (sub.id === submissionId) {
            let currentPointsAwarded = pointsAwarded;
            // Apply theme bonus if applicable
            if (sub.isThemeRelated && sub.themeId && activeTheme && activeTheme.id === sub.themeId && currentPointsAwarded > 0) {
                const themeBonus = currentPointsAwarded * (activeTheme.bonusMultiplier - 1);
                 if (themeBonus > 0) {
                    currentPointsAwarded += themeBonus;
                    addToast(`Applied ${activeTheme.bonusMultiplier}x theme bonus (+${themeBonus} points)!`, 'info');
                 }
            }

            const updatedSubmission = { ...sub, status };
            if (currentPointsAwarded !== 0 && status !== SubmissionStatus.OPEN) { 
              updatedSubmission.rewardPoints = (updatedSubmission.rewardPoints || 0) + currentPointsAwarded;
              setUsers(prevUsers => prevUsers.map(u => 
                u.id === updatedSubmission.employeeId 
                ? { ...u, points: (u.points || 0) + currentPointsAwarded } 
                : u
              ));
            }
            return updatedSubmission;
          }
          return sub;
        })
      );
      addToast(`Submission ${submissionId} status updated to ${status}.`, "success");
       if (pointsAwarded > 0) addToast(`${pointsAwardedParam} base points awarded for submission ${submissionId}.`, "success"); // Report base points
    } catch (e) {
      setError("Failed to update submission status.");
      addToast("Failed to update submission status.", "error");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [addToast, activeTheme]);
  
  const assignRewardPoints = useCallback(async (submissionId: string, points: number) => {
    setIsLoading(true);
    try {
      let employeeToUpdateId = '';
      let finalPointsToAward = points;

      setSubmissions(prevSubmissions =>
        prevSubmissions.map(sub => {
          if (sub.id === submissionId) {
            employeeToUpdateId = sub.employeeId;
            // Apply theme bonus
            if (sub.isThemeRelated && sub.themeId && activeTheme && activeTheme.id === sub.themeId && points > 0) {
              const themeBonus = points * (activeTheme.bonusMultiplier - 1);
              if (themeBonus > 0) {
                finalPointsToAward += themeBonus;
                addToast(`Applied ${activeTheme.bonusMultiplier}x theme bonus (+${themeBonus} points)!`, 'info');
              }
            }
            return { ...sub, rewardPoints: (sub.rewardPoints || 0) + finalPointsToAward };
          }
          return sub;
        })
      );

      if (employeeToUpdateId) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === employeeToUpdateId
              ? { ...user, points: (user.points || 0) + finalPointsToAward }
              : user
          )
        );
      }
      addToast(`${points} base points (Total: ${finalPointsToAward} after bonus) assigned to submission ${submissionId}.`, 'success');
    } catch (e) {
      setError("Failed to assign reward points.");
      addToast("Failed to assign reward points.", 'error');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [addToast, activeTheme]);


  const addCommentToSubmission = useCallback(async (submissionId: string, commentText: string) => {
    if (!currentUser) {
      setError("No current user to add comment.");
      addToast("Error: No current user. Cannot add comment.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const newComment: Comment = {
        id: `cmt_${new Date().getTime()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        text: commentText,
        timestamp: new Date(),
      };
      setSubmissions(prev =>
        prev.map(sub =>
          sub.id === submissionId ? { ...sub, comments: [...sub.comments, newComment] } : sub
        )
      );
      addToast("Comment added successfully!", "success");
    } catch (e) {
      setError("Failed to add comment.");
      addToast("Failed to add comment.", "error");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, addToast]);

  const addMonthlyTheme = useCallback(async (themeData: Omit<MonthlyTheme, 'id' | 'isActive'>) => {
    setIsLoading(true);
    try {
      const newTheme: MonthlyTheme = {
        ...themeData,
        id: `theme_${new Date().getTime()}_${Math.random().toString(16).slice(2)}`,
        isActive: false, // New themes are inactive by default
      };
      setMonthlyThemes(prev => [...prev, newTheme]);
      addToast(`Theme "${newTheme.title}" added successfully!`, "success");
    } catch (e) {
      setError("Failed to add monthly theme.");
      addToast("Failed to add monthly theme.", "error");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const updateMonthlyTheme = useCallback(async (themeId: string, updates: Partial<MonthlyTheme>) => {
    setIsLoading(true);
    try {
      setMonthlyThemes(prev =>
        prev.map(theme =>
          theme.id === themeId ? { ...theme, ...updates } : theme
        )
      );
      addToast(`Theme updated successfully!`, "success");
    } catch (e) {
      setError("Failed to update monthly theme.");
      addToast("Failed to update monthly theme.", "error");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const setActiveTheme = useCallback(async (themeId: string | null) => {
    setIsLoading(true);
    try {
      setMonthlyThemes(prev =>
        prev.map(theme => ({
          ...theme,
          isActive: theme.id === themeId,
        }))
      );
      if (themeId) {
        const theme = monthlyThemes.find(t => t.id === themeId);
        addToast(`Theme "${theme?.title}" is now active.`, "success");
      } else {
        addToast(`All themes deactivated.`, "info");
      }
    } catch (e) {
      setError("Failed to set active theme.");
      addToast("Failed to set active theme.", "error");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [addToast, monthlyThemes]);


  return (
    <AppContext.Provider value={{ 
      submissions, users, currentUser, monthlyThemes, activeTheme, isLoading, error, toasts, 
      addSubmission, updateSubmissionStatus, addCommentToSubmission, setCurrentUser, 
      addToast, removeToast, assignRewardPoints,
      addMonthlyTheme, updateMonthlyTheme, setActiveTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};