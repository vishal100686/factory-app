
import React, { useState, useEffect } from 'react';
import { UserPreferences } from '../types';

interface PreferenceFormProps {
  currentPreferences: UserPreferences;
  onSubmit: (preferences: UserPreferences) => void;
  isLoading: boolean;
}

const PreferenceForm: React.FC<PreferenceFormProps> = ({ currentPreferences, onSubmit, isLoading }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(currentPreferences);

  useEffect(() => {
    setPreferences(currentPreferences);
  }, [currentPreferences]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'radio') {
      setPreferences(prev => ({ ...prev, [name]: value === prev[name as keyof UserPreferences] ? null : value }));
    } else {
       setPreferences(prev => ({ ...prev, [name]: value === "" ? null : value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  const fieldsetBaseClass = "mb-6 p-4 border border-slate-300 rounded-lg";
  const legendBaseClass = "text-lg font-semibold text-indigo-600 px-2";
  const radioLabelClass = "ml-2 text-sm text-slate-700 cursor-pointer";
  const radioInputClass = "form-radio h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer";


  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-sky-50 p-6 rounded-lg shadow">
      <fieldset className={fieldsetBaseClass}>
        <legend className={legendBaseClass}>Hotel Location Preference</legend>
        <div className="mt-2 space-y-2 sm:space-y-0 sm:flex sm:space-x-6">
          {([['bus_stand', 'Near Bus Stand'], ['mall_road', 'Near Mall Road'], ['scenic_view', 'Scenic View']] as const).map(([value, label]) => (
            <label key={value} className="flex items-center">
              <input type="radio" name="hotelLocation" value={value} checked={preferences.hotelLocation === value} onChange={handleChange} className={radioInputClass} />
              <span className={radioLabelClass}>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={fieldsetBaseClass}>
        <legend className={legendBaseClass}>Dietary Preference</legend>
        <div className="mt-2 space-y-2 sm:space-y-0 sm:flex sm:space-x-6">
          {([['any', 'Any Food'], ['vegetarian_only', 'Vegetarian Only']] as const).map(([value, label]) => (
             <label key={value} className="flex items-center">
              <input type="radio" name="foodPreference" value={value} checked={preferences.foodPreference === value} onChange={handleChange} className={radioInputClass} />
              <span className={radioLabelClass}>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={fieldsetBaseClass}>
        <legend className={legendBaseClass}>Budget Flexibility</legend>
        <div className="mt-2 space-y-2 sm:space-y-0 sm:flex sm:space-x-6">
          {([['no', 'Stick to Current Budget'], ['yes', 'Open to Slight Upgrades']] as const).map(([value, label]) => (
            <label key={value} className="flex items-center">
              <input type="radio" name="budgetUpgrade" value={value} checked={preferences.budgetUpgrade === value} onChange={handleChange} className={radioInputClass} />
              <span className={radioLabelClass}>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
      >
        {isLoading ? (
           <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Refining...
          </>
        ) : (
          'Refine Itinerary with Preferences'
        )}
      </button>
    </form>
  );
};

export default PreferenceForm;