
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { User } from '../types';

const Leaderboard: React.FC = () => {
  const { users } = useAppContext();

  const topContributors = [...users] // Create a copy before sorting
    .filter(user => user.points > 0) // Filter out users with 0 points
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  if (topContributors.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-brand-dark mb-4">🏆 Top Contributors</h3>
        <p className="text-sky-700">No contributors with points yet. Be the first to earn rewards!</p>
      </div>
    );
  }
  
  const TrophyIcon = ({ rank }: { rank: number }) => {
    let color = "text-sky-400"; // Default to light blue
    if (rank === 0) color = "text-yellow-400"; // Gold
    if (rank === 1) color = "text-sky-400"; // Silver as light blue
    if (rank === 2) color = "text-yellow-600"; // Bronze (using a darker yellow)

    return (
       <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${color}`} viewBox="0 0 20 20" fill="currentColor">
         <path d="M10 17a1 1 0 01-1-1V7.236a4.987 4.987 0 01-2.058-1.337L5.65 7.177A.5.5 0 015 6.763V5a1 1 0 011.482-.876l2.058 1.03A5.014 5.014 0 0110 5c.348 0 .688.035 1.02.101L13.4 4.125A1 1 0 0115 5v1.763a.5.5 0 01-.65.414l-1.292-1.278A4.987 4.987 0 0111 7.236V16a1 1 0 01-1 1zM6 4a1 1 0 00-1 1v1.236l.942.943.058.057L8 8.314V5a3 3 0 00-2-2.828V4zm8 0v.172a3.001 3.001 0 00-2 2.828v3.314l2.058-2.058.058-.057.942-.943V5a1 1 0 00-1-1z" />
       </svg>
    );
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-yellow-400">
      <h3 className="text-xl font-semibold text-brand-dark mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.293 2.293a1 1 0 011.414 0l2 2a1 1 0 01-1.414 1.414L12 4.414V7a1 1 0 11-2 0V4.414L8.707 5.707a1 1 0 01-1.414-1.414l2-2a1 1 0 010-1.414zM4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM2 15a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
        Top Contributors
      </h3>
      <ul className="space-y-3">
        {topContributors.map((user, index) => (
          <li key={user.id} className="flex items-center justify-between p-3 bg-sky-50 rounded-md hover:bg-sky-100 transition-colors">
            <div className="flex items-center">
              <span className="text-lg font-semibold text-sky-800 w-8">{index + 1}.</span>
              <TrophyIcon rank={index} />
              <span className="ml-2 text-brand-dark font-medium">{user.name}</span>
            </div>
            <span className="font-bold text-brand-accent">{user.points} Points</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;