
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Comment as CommentType, User } from '../types';
import Button from './ui/Button';

interface CommentSectionProps {
  submissionId: string;
  comments: CommentType[];
}

const CommentItem: React.FC<{ comment: CommentType; currentUser: User | null }> = ({ comment, currentUser }) => {
  return (
    <div className={`p-3 rounded-lg mb-3 ${comment.userId === currentUser?.id ? 'bg-blue-100 ml-auto' : 'bg-sky-200 mr-auto'} max-w-[85%]`}>
      <div className="flex items-center justify-between mb-1">
        <p className="font-semibold text-sm text-brand-primary">{comment.userName}</p>
        <p className="text-xs text-sky-600">{new Date(comment.timestamp).toLocaleString()}</p>
      </div>
      <p className="text-slate-700 text-sm whitespace-pre-wrap">{comment.text}</p>
    </div>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({ submissionId, comments }) => {
  const { addCommentToSubmission, currentUser, isLoading } = useAppContext();
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    await addCommentToSubmission(submissionId, newComment);
    setNewComment('');
  };

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-brand-dark mb-3">Discussion Thread ({comments.length})</h4>
      <div className="space-y-3 max-h-60 overflow-y-auto bg-sky-50 p-3 rounded-md mb-4">
        {comments.length > 0 ? (
          comments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(comment => (
            <CommentItem key={comment.id} comment={comment} currentUser={currentUser} />
          ))
        ) : (
          <p className="text-sky-600 text-sm">No comments yet. Be the first to discuss!</p>
        )}
      </div>
      {currentUser && (
        <form onSubmit={handleSubmitComment} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add your suggestion or comment..."
            rows={2}
            className="w-full p-2 border border-sky-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" variant="secondary" size="md" isLoading={isLoading} className="w-full sm:w-auto">
            Add Comment
          </Button>
        </form>
      )}
    </div>
  );
};

export default CommentSection;