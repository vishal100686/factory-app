
import React from 'react';
import SubmissionForm from '../components/SubmissionForm';
import HotIssuesDashboard from '../components/HotIssuesDashboard';
import Leaderboard from '../components/Leaderboard';
import { useAppContext } from '../contexts/AppContext';
import IssueCard from '../components/IssueCard'; // Added back
import { Submission, SubmissionStatus } from '../types'; // Added back

const RecentSubmissions: React.FC = () => {
  const { submissions, currentUser } = useAppContext(); // currentUser might be used later for more nuanced isAdminView

  const recentSubmissions = submissions
    .filter(sub => sub.status !== SubmissionStatus.RED_HOT) // Exclude Red Hot as they have a dedicated section
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5); // Show latest 5

  if (recentSubmissions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
        <h3 className="text-xl font-semibold text-brand-dark mb-4">📄 Recent Activity & Suggestions</h3>
        <p className="text-sky-700">No recent activity or general suggestions to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
      <h3 className="text-xl font-semibold text-brand-dark mb-6">📄 Recent Activity & Suggestions</h3>
      <div className="space-y-6">
        {recentSubmissions.map(submission => (
          <IssueCard 
            key={submission.id} 
            submission={submission} 
            isAdminView={false} // Keep this false for general home page view
          />
        ))}
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const { isLoading, error, currentUser } = useAppContext();

  if (isLoading && !currentUser) { // Show loading only if initial data (incl. user) isn't ready
    return <div className="flex justify-center items-center h-64"><p className="text-xl text-brand-primary">Loading FactoryPulse...</p></div>;
  }

  if (error) {
    return <div className="text-center p-8 bg-red-100 text-red-700 rounded-md shadow">{error}</div>;
  }
  
  if (!currentUser) {
     return <div className="text-center p-8 bg-yellow-100 text-yellow-700 rounded-md shadow">Please select a user from the dropdown in the navbar to continue.</div>;
  }


  return (
    <div className="space-y-8">
      <SubmissionForm />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <HotIssuesDashboard />
        </div>
        <div>
          <Leaderboard />
        </div>
      </div>
      <RecentSubmissions /> {/* Added back */}
    </div>
  );
};

export default HomePage;