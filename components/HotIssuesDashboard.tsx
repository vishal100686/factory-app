
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Submission, SubmissionStatus } from '../types';
import IssueCard from './IssueCard'; 

const HotIssuesDashboard: React.FC = () => {
  const { submissions, currentUser } = useAppContext();

  const hotIssues = submissions.filter(sub => sub.status === SubmissionStatus.RED_HOT)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (hotIssues.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-brand-dark mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-brand-danger" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 102 0V5zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          🔥 Red Hot Issues
        </h3>
        <p className="text-sky-700">No "Red Hot" issues at the moment. Great job, team!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-red-500">
      <h3 className="text-xl font-semibold text-brand-dark mb-6 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-brand-danger animate-ping" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 102 0V5zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        🔥 Red Hot Issues ({hotIssues.length})
      </h3>
      <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
        {hotIssues.map(submission => (
          <IssueCard key={submission.id} submission={submission} isAdminView={currentUser?.isAdmin} />
        ))}
      </div>
    </div>
  );
};

export default HotIssuesDashboard;