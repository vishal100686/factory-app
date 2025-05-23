
import React, { useState } from 'react';
import { Submission, SubmissionStatus, User } from '../types';
import { useAppContext } from '../contexts/AppContext';
import Modal from './ui/Modal';
import CommentSection from './CommentSection';
import Button from './ui/Button';

interface IssueCardProps {
  submission: Submission;
  isAdminView?: boolean;
}

const StatusBadge: React.FC<{ status: SubmissionStatus }> = ({ status }) => {
  let bgColor = 'bg-sky-500'; // Default to a sky blue
  if (status === SubmissionStatus.OPEN) bgColor = 'bg-yellow-500';
  else if (status === SubmissionStatus.RED_HOT) bgColor = 'bg-red-600 animate-pulse';
  else if (status === SubmissionStatus.CLOSED) bgColor = 'bg-green-600';
  else if (status === SubmissionStatus.SUGGESTION) bgColor = 'bg-blue-500';

  return <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${bgColor}`}>{status}</span>;
};

const IssueCard: React.FC<IssueCardProps> = ({ submission, isAdminView = false }) => {
  const { updateSubmissionStatus, currentUser, assignRewardPoints, addToast, activeTheme } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pointsToAward, setPointsToAward] = useState<string>('');

  const handleStatusChange = (newStatus: SubmissionStatus) => {
    // If closing an issue and points haven't been explicitly set for this action,
    // prompt admin or set default points for "Closed" status if desired.
    // For now, points are only handled by the explicit "Award Points" button or via updateSubmissionStatus if passed.
    updateSubmissionStatus(submission.id, newStatus);
  };

  const handleAwardPoints = () => {
    const points = parseInt(pointsToAward, 10);
    if (isNaN(points) || points <= 0) {
      addToast("Please enter a valid positive number for points.", "error");
      return;
    }
    assignRewardPoints(submission.id, points); // AppContext now handles theme bonus calculation
    setPointsToAward('');
    // Toast for base points + bonus is handled in AppContext
  };

  const canManage = currentUser?.isAdmin && isAdminView;

  const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
    </svg>
  );

  const PointsIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
  
  const DivisionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1H5a1 1 0 000 2h4v2H3a1 1 0 000 2h6v2H5a1 1 0 000 2h4v1a1 1 0 102 0v-1h4a1 1 0 100-2h-4v-2h6a1 1 0 100-2h-6V6h4a1 1 0 100-2h-4V3a1 1 0 00-1-1zM5 12h4v-2H5v2zm10 0h-4v-2h4v2z" clipRule="evenodd" />
    </svg>
  );

  const ThemeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1H3a1 1 0 000 2h1v1H3a1 1 0 000 2h1v1H3a1 1 0 000 2h1v1a1 1 0 001 1h12a1 1 0 001-1V3a1 1 0 00-1-1H5zm0 2h10v2H5V4zm0 4h10v2H5V8zm0 4h10v2H5v-2z" clipRule="evenodd" />
    </svg>
  );


  return (
    <>
      <div className={`bg-white shadow-lg rounded-lg overflow-hidden transition-shadow hover:shadow-xl border ${submission.isThemeRelated && submission.themeId === activeTheme?.id ? 'border-purple-500 border-2' : 'border-sky-200'}`}>
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-sky-600">ID: {submission.id.substring(0,10)}...</span>
            <StatusBadge status={submission.status} />
          </div>
          <h3 className="text-lg font-semibold text-brand-primary mb-1">{submission.category}</h3>
          <p className="text-sm text-sky-700 mb-3 font-medium">{submission.subCategory}</p>
          <p className="text-slate-700 text-sm mb-3 h-20 overflow-y-auto custom-scrollbar">{submission.description}</p>
          
          <div className="text-xs text-sky-600 mb-3">
            <p>By: {submission.employeeName}</p>
            {submission.divisionName && <p><DivisionIcon />Division: {submission.divisionName}</p>}
            <p>On: {new Date(submission.timestamp).toLocaleDateString()}</p>
            {submission.imageUrl && <span><ImageIcon />Image Attached </span>}
            {submission.rewardPoints > 0 && <span className="ml-2"><PointsIcon />{submission.rewardPoints} Points</span>}
            {submission.isThemeRelated && submission.themeId === activeTheme?.id && (
                <span className="ml-2"><ThemeIcon />Campaign! ({activeTheme.bonusMultiplier}x)</span>
            )}
             {submission.isThemeRelated && submission.themeId !== activeTheme?.id && (
                <span className="ml-2 text-sky-500"><ThemeIcon />(Past Campaign)</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
              View Details & Comments ({submission.comments.length})
            </Button>
            {canManage && (
              <>
                {submission.status !== SubmissionStatus.RED_HOT && (
                  <Button variant="danger" size="sm" onClick={() => handleStatusChange(SubmissionStatus.RED_HOT)}>Mark Red Hot</Button>
                )}
                {submission.status !== SubmissionStatus.CLOSED && (
                  <Button variant="secondary" size="sm" onClick={() => handleStatusChange(SubmissionStatus.CLOSED)}>Close Issue</Button>
                )}
                 {submission.status !== SubmissionStatus.OPEN && submission.status !== SubmissionStatus.SUGGESTION && (
                  <Button variant="primary" size="sm" onClick={() => handleStatusChange(SubmissionStatus.OPEN)}>Re-Open</Button>
                )}
              </>
            )}
          </div>
          
          {canManage && (
            <div className="mt-4 pt-4 border-t border-sky-200 flex items-center gap-2">
              <input 
                type="number"
                placeholder="Points"
                value={pointsToAward}
                onChange={(e) => setPointsToAward(e.target.value)}
                className="p-2 border border-sky-300 rounded-md shadow-sm w-24 text-sm"
                min="0"
              />
              <Button variant="primary" size="sm" onClick={handleAwardPoints} disabled={!pointsToAward || parseInt(pointsToAward) <=0}>
                Award Points
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${submission.category}: ${submission.subCategory}`} size="xl">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-brand-dark">{submission.description}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-sky-700">
            <p><strong>Submitted by:</strong> {submission.employeeName} ({submission.employeeId})</p>
            {submission.divisionName && <p><strong>Division:</strong> {submission.divisionName}</p>}
            <p><strong>Date:</strong> {new Date(submission.timestamp).toLocaleString()}</p>
            <p><strong>Status:</strong> <StatusBadge status={submission.status} /></p>
            <p><strong>Reward Points:</strong> {submission.rewardPoints}</p>
            {submission.isThemeRelated && activeTheme && submission.themeId === activeTheme.id && (
                <p className="text-purple-600 font-semibold"><strong>Part of Campaign:</strong> {activeTheme.title} ({activeTheme.bonusMultiplier}x Points)</p>
            )}
             {submission.isThemeRelated && (!activeTheme || submission.themeId !== activeTheme.id) && (
                <p className="text-sky-600">Related to a past campaign.</p>
            )}
          </div>
          
          {submission.imageUrl && (
            <div>
              <h4 className="text-md font-semibold text-brand-dark mb-2">Attached Image:</h4>
              <img src={submission.imageUrl} alt="Submission attachment" className="max-w-full md:max-w-md max-h-96 rounded-md shadow-md object-contain"/>
            </div>
          )}
          <CommentSection submissionId={submission.id} comments={submission.comments} />
        </div>
      </Modal>
    </>
  );
};

export default IssueCard;