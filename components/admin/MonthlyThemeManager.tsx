import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { MonthlyTheme, CategoryDetail } from '../../types';
import Button from '../ui/Button';
import { CATEGORIES_DATA } from '../../constants';

const MonthlyThemeManager: React.FC = () => {
  const { monthlyThemes, addMonthlyTheme, updateMonthlyTheme, setActiveTheme, isLoading, addToast } = useAppContext();
  
  const initialThemeState: Omit<MonthlyTheme, 'id' | 'isActive'> = {
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 30 days from now
    bonusMultiplier: 1.5,
    applicableCategories: [],
  };

  const [editingTheme, setEditingTheme] = useState<MonthlyTheme | null>(null);
  const [formData, setFormData] = useState<Omit<MonthlyTheme, 'id' | 'isActive'>>(initialThemeState);

  useEffect(() => {
    if (editingTheme) {
      setFormData({
        title: editingTheme.title,
        description: editingTheme.description,
        startDate: editingTheme.startDate,
        endDate: editingTheme.endDate,
        bonusMultiplier: editingTheme.bonusMultiplier,
        applicableCategories: editingTheme.applicableCategories || [],
      });
    } else {
      setFormData(initialThemeState);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTheme]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'bonusMultiplier' ? parseFloat(value) : value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, applicableCategories: selectedOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.endDate) {
        addToast("Title, Start Date, and End Date are required.", "error");
        return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        addToast("Start Date must be before End Date.", "error");
        return;
    }

    if (editingTheme) {
      await updateMonthlyTheme(editingTheme.id, formData);
      addToast("Theme updated successfully!", "success");
    } else {
      await addMonthlyTheme(formData);
    }
    setEditingTheme(null);
    setFormData(initialThemeState);
  };

  const handleSetEditing = (theme: MonthlyTheme) => {
    setEditingTheme(theme);
  };

  const handleCancelEdit = () => {
    setEditingTheme(null);
    setFormData(initialThemeState);
  };

  const handleToggleActive = async (theme: MonthlyTheme) => {
    if (theme.isActive) {
      await setActiveTheme(null); // Deactivate this theme (and all others)
    } else {
      await setActiveTheme(theme.id); // Activate this theme
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="p-6 bg-sky-50 rounded-lg shadow-md border border-sky-200 space-y-4">
        <h3 className="text-xl font-semibold text-brand-dark">{editingTheme ? 'Edit Theme' : 'Create New Theme'}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-sky-800">Title</label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full p-2 border border-sky-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" />
          </div>
          <div>
            <label htmlFor="bonusMultiplier" className="block text-sm font-medium text-sky-800">Bonus Multiplier (e.g., 1.5, 2)</label>
            <input type="number" name="bonusMultiplier" id="bonusMultiplier" value={formData.bonusMultiplier} onChange={handleChange} step="0.1" min="1" required className="mt-1 block w-full p-2 border border-sky-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-sky-800">Description</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border border-sky-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"></textarea>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-sky-800">Start Date</label>
            <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full p-2 border border-sky-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-sky-800">End Date</label>
            <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full p-2 border border-sky-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" />
          </div>
        </div>

        <div>
            <label htmlFor="applicableCategories" className="block text-sm font-medium text-sky-800">Applicable Categories (Optional, Ctrl/Cmd + Click for multiple)</label>
            <select 
                name="applicableCategories" 
                id="applicableCategories" 
                multiple 
                value={formData.applicableCategories} 
                onChange={handleCategoryChange}
                className="mt-1 block w-full h-32 p-2 border border-sky-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
            >
                {CATEGORIES_DATA.filter(cat => cat.name !== "Uncategorized").map((cat: CategoryDetail) => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
            </select>
            <p className="text-xs text-sky-600 mt-1">If no categories are selected, the theme bonus will apply to all submissions during the active period.</p>
        </div>

        <div className="flex items-center space-x-3">
          <Button type="submit" variant="primary" isLoading={isLoading}>{editingTheme ? 'Update Theme' : 'Add Theme'}</Button>
          {editingTheme && <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancel Edit</Button>}
        </div>
      </form>

      <div>
        <h3 className="text-xl font-semibold text-brand-dark mb-4">Existing Themes</h3>
        {monthlyThemes.length === 0 ? (
          <p className="text-sky-600">No themes created yet.</p>
        ) : (
          <div className="space-y-4">
            {monthlyThemes.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(theme => (
              <div key={theme.id} className={`p-4 rounded-lg shadow ${theme.isActive ? 'bg-green-100 border-green-500 border-2' : 'bg-white border border-sky-200'}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-lg font-semibold text-brand-primary">{theme.title} {theme.isActive && <span className="text-xs text-green-700 font-bold">(ACTIVE)</span>}</h4>
                        <p className="text-sm text-sky-700">{theme.description}</p>
                        <p className="text-xs text-sky-600">
                        Dates: {new Date(theme.startDate).toLocaleDateString()} - {new Date(theme.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-sky-600">Bonus: {theme.bonusMultiplier}x</p>
                        {theme.applicableCategories && theme.applicableCategories.length > 0 && (
                            <p className="text-xs text-sky-600">Categories: {theme.applicableCategories.join(', ')}</p>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 mt-2 sm:mt-0 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleSetEditing(theme)}>Edit</Button>
                        <Button 
                            variant={theme.isActive ? "danger" : "secondary"} 
                            size="sm" 
                            onClick={() => handleToggleActive(theme)}
                            isLoading={isLoading}
                        >
                            {theme.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyThemeManager;