import React from 'react';
import { PencilSquareIcon, ArrowPathIcon, XCircleIcon } from './icons/DisplayIcons'; // Assuming these icons exist or can be created

interface PostItineraryActionsProps {
  onRefine: () => void;
  onPlanNew: () => void;
  onClose: () => void;
}

const PostItineraryActions: React.FC<PostItineraryActionsProps> = ({ onRefine, onPlanNew, onClose }) => {
  
  const buttonClass = "flex items-center justify-center gap-2 w-full sm:flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out";

  return (
    <div className="mt-8 pt-6 border-t border-slate-300">
      <h3 className="text-xl font-semibold text-center text-indigo-700 mb-4">
        Your trip plan is ready! What would you like to do next?
      </h3>
      <div className="flex flex-col sm:flex-row justify-center items-stretch gap-4">
        <button
          onClick={onRefine}
          className={`${buttonClass} bg-blue-500 hover:bg-blue-600 focus:ring-blue-400`}
          aria-label="Refine this itinerary with preferences"
        >
          <PencilSquareIcon className="h-5 w-5" />
          Refine This Itinerary
        </button>
        <button
          onClick={onPlanNew}
          className={`${buttonClass} bg-green-500 hover:bg-green-600 focus:ring-green-400`}
          aria-label="Plan a new trip"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Plan a New Trip
        </button>
        <button
          onClick={onClose}
          className={`${buttonClass} bg-red-500 hover:bg-red-600 focus:ring-red-400`}
          aria-label="Close current plan"
        >
          <XCircleIcon className="h-5 w-5" />
          Close Current Plan
        </button>
      </div>
    </div>
  );
};

export default PostItineraryActions;