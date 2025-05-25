
import React from 'react';
import { ExclamationTriangleIcon } from './icons/DisplayIcons';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="my-6 p-4 bg-red-50 border border-red-300 rounded-lg shadow-md text-red-700 flex items-start space-x-3">
      <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
      <div>
        <h4 className="font-semibold">Oops! Something went wrong.</h4>
        <p className="text-sm">{message}</p>
        <p className="text-xs mt-1">If the problem persists, please check your API key or try again later.</p>
      </div>
    </div>
  );
};

export default ErrorDisplay;
