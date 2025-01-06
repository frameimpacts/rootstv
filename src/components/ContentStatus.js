import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { useSession } from '@/components/SessionProvider';

export default function ContentStatus({ contentId, userId, onStatusUpdate }) {
  const { session } = useSession();
  const [status, setStatus] = useState({
    isRented: false,
    daysLeft: 0,
    progress: 0,
    lastWatched: null,
    rating: 0,
    userRating: 0,
    totalRatings: 0
  });
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [replyComment, setReplyComment] = useState('');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    commentId: null
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    fetchPublicStatus();
    fetchComments();
    
    // Only fetch user-specific data if logged in
    if (session?.token && userId) {
      fetchContentStatus();
    }
  }, [contentId, userId, session]);

  const fetchContentStatus = async () => {
    try {
      const response = await fetch(`/api/content/${contentId}/status?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch content status');
      }
      
      const data = await response.json();
      setStatus(data || {
        isRented: false,
        daysLeft: 0,
        progress: 0,
        lastWatched: null,
        rating: 0,
        userRating: 0,
        totalRatings: 0
      });
      
      onStatusUpdate?.(data);
    } catch (error) {
      console.error('Failed to fetch content status:', error);
      setError(error.message);
    }
  };

  const fetchPublicStatus = async () => {
    try {
      const response = await fetch(`/api/content/${contentId}/public-status`);
      if (!response.ok) throw new Error('Failed to fetch public status');
      const data = await response.json();
      
      // Update only the public data
      setStatus(prev => ({
        ...prev,
        rating: Number(data.rating || 0),
        totalRatings: Number(data.totalRatings || 0)
      }));
      
      // Call the update callback
      onStatusUpdate?.({
        rating: Number(data.rating || 0),
        totalRatings: Number(data.totalRatings || 0)
      });
    } catch (error) {
      console.error('Failed to fetch public status:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/content/${contentId}/comment`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleRating = async (rating) => {
    if (!session?.token) {
      setShowLoginModal(true);
      return;
    }

    try {
      const response = await fetch(`/api/content/${contentId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({ rating })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      await fetchPublicStatus();
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!session?.token || !comment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/content/${contentId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({ comment: comment.trim() })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      setComment('');
      await fetchComments();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatRating = (rating) => {
    const numRating = Number(rating);
    return isNaN(numRating) ? "0.0" : numRating.toFixed(1);
  };

  const handleDeleteComment = async (commentId) => {
    if (!session?.token) return;
    
    try {
      const response = await fetch(`/api/content/${contentId}/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      setDeleteModal({ isOpen: false, commentId: null });
      await fetchComments(); // Refresh comments after deletion
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!session?.token || !replyComment.trim() || !replyTo) return;

    try {
      const response = await fetch(`/api/content/${contentId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({ 
          comment: replyComment.trim(),
          parentCommentId: replyTo 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }

      setReplyComment('');
      setReplyTo(null);
      await fetchComments();
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
  };

  const promptLogin = () => {
    setShowLoginModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Show rental status only for logged-in users */}
      {session && status.isRented && (
        <div className="space-y-2">
          {status.daysLeft > 0 ? (
            <div className="text-white space-y-1">
              <div>
                {Math.floor(status.daysLeft)} days{' '}
                {Math.floor((status.daysLeft % 1) * 24)} hours{' '}
                {Math.floor(((status.daysLeft % 1) * 24 % 1) * 60)} minutes remaining
              </div>
            </div>
          ) : (
            <div className="text-red-500">Expired</div>
          )}
          
          {/* Watch Progress */}
          {status.progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Progress</span>
                <span>{status.progress}%</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full">
                <div 
                  className="h-1 bg-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${status.progress}%` }}
                />
              </div>
              {status.lastWatched && (
                <div className="text-xs text-gray-500">
                  Last watched: {new Date(status.lastWatched).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ratings Section - Always visible */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Rating</h3>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => session ? handleRating(star) : setShowLoginModal(true)}
              className={`text-2xl ${
                star <= status.rating ? 'text-yellow-400' : 'text-gray-400'
              }`}
            >
              <FaStar />
            </button>
          ))}
          <span className="text-sm text-gray-400 ml-2">
            ({status.totalRatings} ratings)
          </span>
        </div>
      </div>

      {/* Show comments to everyone, but only allow interactions for logged-in users */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Comments</h3>
        
        {/* Comment form only for logged-in users */}
        {session && (
          <div className="mt-6">
            <div className="text-sm text-gray-400 mb-2">Add a Comment</div>
            <form onSubmit={handleComment}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                rows="3"
                placeholder="Write your comment here..."
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !comment.trim()}
                className={`mt-2 px-4 py-2 rounded-md text-white ${
                  isSubmittingComment || !comment.trim()
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmittingComment ? 'Submitting...' : 'Submit Comment'}
              </button>
            </form>
          </div>
        )}

        {/* Show comments to everyone */}
        <div className="space-y-4 mt-2">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">{comment.name}</div>
                <div className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-white">{comment.comment}</div>
              
              {/* Comment Actions */}
              <div className="mt-2 flex items-center space-x-4">
                <button
                  onClick={() => session ? setReplyTo(comment.id) : promptLogin()}
                  className="text-sm text-gray-400 hover:text-white transition-colors focus:outline-none"
                >
                  Reply
                </button>
                
                {Number(session?.user?.id) === Number(comment.user_id) && (
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, commentId: comment.id })}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors focus:outline-none"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Reply Form */}
              {replyTo === comment.id && (
                <form onSubmit={handleReply} className="mt-3">
                  <textarea
                    value={replyComment}
                    onChange={(e) => setReplyComment(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-md p-2 text-sm focus:outline-none"
                    placeholder="Write your reply..."
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyComment('');
                      }}
                      className="px-3 py-1 text-sm text-gray-400 hover:text-white focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 focus:outline-none"
                    >
                      Reply
                    </button>
                  </div>
                </form>
              )}

              {/* Display Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 space-y-3 pl-6 border-l-2 border-gray-700">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm text-gray-400">{reply.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(reply.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-white text-sm">{reply.comment}</div>
                      {Number(session?.user?.id) === Number(reply.user_id) && (
                        <div className="mt-2">
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, commentId: reply.id })}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              No comments yet. {session ? 'Be the first to comment!' : 'Login to comment!'}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-300 mb-6">
              Are you sure you want to delete this comment? All replies will also be deleted.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, commentId: null })}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteComment(deleteModal.commentId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">
              Login Required
            </h3>
            <p className="text-sm text-gray-300 mb-6">
              Please login to interact with content. Join our community to rate, comment, and more!
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <a
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 