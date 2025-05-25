import React, { useState } from 'react';
import { InitialItineraryFormData, Budget, TravelType } from '../types';
import { DEFAULT_START_CITY, DEFAULT_DESTINATION, DEFAULT_INTERESTS } from '../constants';
import { CalendarDaysIcon, MapPinIcon, UserGroupIcon, CurrencyDollarIcon, SparklesIcon } from './icons/FormIcons';


interface ItineraryFormProps {
  onSubmit: (data: InitialItineraryFormData) => void;
  isLoading: boolean;
}

const ItineraryForm: React.FC<ItineraryFormProps> = ({ onSubmit, isLoading }) => {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState<InitialItineraryFormData>({
    startCity: DEFAULT_START_CITY,
    destination: DEFAULT_DESTINATION,
    travelStartDate: today,
    travelEndDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], // Default to 5 days from today
    budget: Budget.MEDIUM,
    travelType: TravelType.FAMILY,
    interests: DEFAULT_INTERESTS,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(formData.travelEndDate) < new Date(formData.travelStartDate)) {
        alert("End date cannot be before start date.");
        return;
    }
    onSubmit(formData);
  };

  const inputGroupClass = "mb-6";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";
  const inputClass = "mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out";
  const iconClass = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400";


  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h2 className="text-3xl font-semibold text-center text-indigo-700 mb-8">Plan Your Dream Trip</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={inputGroupClass}>
          <label htmlFor="startCity" className={labelClass}>Starting City</label>
          <div className="relative rounded-md shadow-sm">
            <div className={iconClass}><MapPinIcon className="h-5 w-5" /></div>
            <input type="text" name="startCity" id="startCity" value={formData.startCity} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="e.g., Jamshedpur" required />
          </div>
        </div>
        <div className={inputGroupClass}>
          <label htmlFor="destination" className={labelClass}>Destination</label>
           <div className="relative rounded-md shadow-sm">
            <div className={iconClass}><MapPinIcon className="h-5 w-5" /></div>
            <input type="text" name="destination" id="destination" value={formData.destination} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="e.g., Manali" required />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={inputGroupClass}>
          <label htmlFor="travelStartDate" className={labelClass}>Travel Start Date</label>
          <div className="relative rounded-md shadow-sm">
            <div className={iconClass}><CalendarDaysIcon className="h-5 w-5" /></div>
            <input type="date" name="travelStartDate" id="travelStartDate" value={formData.travelStartDate} onChange={handleChange} className={`${inputClass} pl-10`} min={today} required />
          </div>
        </div>
        <div className={inputGroupClass}>
          <label htmlFor="travelEndDate" className={labelClass}>Travel End Date</label>
          <div className="relative rounded-md shadow-sm">
            <div className={iconClass}><CalendarDaysIcon className="h-5 w-5" /></div>
            <input type="date" name="travelEndDate" id="travelEndDate" value={formData.travelEndDate} onChange={handleChange} className={`${inputClass} pl-10`} min={formData.travelStartDate || today} required />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={inputGroupClass}>
          <label htmlFor="budget" className={labelClass}>Budget</label>
           <div className="relative rounded-md shadow-sm">
            <div className={iconClass}><CurrencyDollarIcon className="h-5 w-5" /></div>
            <select name="budget" id="budget" value={formData.budget} onChange={handleChange} className={`${inputClass} pl-10 appearance-none`} required>
              {Object.values(Budget).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div className={inputGroupClass}>
          <label htmlFor="travelType" className={labelClass}>Travel Type</label>
          <div className="relative rounded-md shadow-sm">
            <div className={iconClass}><UserGroupIcon className="h-5 w-5" /></div>
            <select name="travelType" id="travelType" value={formData.travelType} onChange={handleChange} className={`${inputClass} pl-10 appearance-none`} required>
              {Object.values(TravelType).map(tt => <option key={tt} value={tt}>{tt}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className={inputGroupClass}>
        <label htmlFor="interests" className={labelClass}>Interests</label>
        <div className="relative rounded-md shadow-sm">
            <div className={iconClass}><SparklesIcon className="h-5 w-5" /></div>
        <input type="text" name="interests" id="interests" value={formData.interests} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="e.g., Nature, Sightseeing, Adventure Sports" required />
        <p className="mt-1 text-xs text-slate-500">Comma-separated list of interests.</p>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </>
        ) : (
          'Proceed to Select Travel Mode'
        )}
      </button>
    </form>
  );
};

export default ItineraryForm;