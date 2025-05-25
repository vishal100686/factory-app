import React from 'react';
import { TravelMode } from '../types';
import { TrainIcon, PaperAirplaneIcon, BusIcon } from './icons/DisplayIcons'; // Assuming PaperAirplaneIcon is added

interface TravelModeSelectorProps {
  onSelectMode: (mode: TravelMode) => void;
  isLoading: boolean;
}

const TravelModeSelector: React.FC<TravelModeSelectorProps> = ({ onSelectMode, isLoading }) => {
  const modes: { mode: TravelMode; label: string; icon: JSX.Element }[] = [
    { mode: 'train', label: 'Train', icon: <TrainIcon className="h-8 w-8 mb-2 text-indigo-600" /> },
    { mode: 'flight', label: 'Flight', icon: <PaperAirplaneIcon className="h-8 w-8 mb-2 text-sky-600" /> },
    { mode: 'bus', label: 'Bus', icon: <BusIcon className="h-8 w-8 mb-2 text-emerald-600" /> },
  ];

  const buttonBaseClass = "flex flex-col items-center justify-center w-full sm:w-auto flex-1 p-6 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-lg";

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-center text-indigo-700 mb-6">Choose Your Travel Mode</h2>
      <p className="text-center text-slate-600 mb-8">How would you like to travel to your destination?</p>
      <div className="flex flex-col sm:flex-row justify-center items-stretch gap-4 sm:gap-6">
        {modes.map(({ mode, label, icon }) => (
          <button
            key={mode}
            onClick={() => onSelectMode(mode)}
            disabled={isLoading}
            className={`${buttonBaseClass} 
              ${mode === 'train' ? 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-400' : ''}
              ${mode === 'flight' ? 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-400' : ''}
              ${mode === 'bus' ? 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400' : ''}
            `}
            aria-label={`Select ${label} as travel mode`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
      {isLoading && (
        <div className="text-center mt-4 text-slate-600">
          <p>Loading itinerary options...</p>
        </div>
      )}
    </div>
  );
};

export default TravelModeSelector;