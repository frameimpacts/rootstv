'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/components/SessionProvider';
import Image from 'next/image';

export default function CommentsManagement() {
  const { session } = useSession();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    commentId: null,
    isReply: false
  });

  useEffect(() => {
    if (session?.token) {
      fetchComments();
    }
  }, [session]);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/admin/comments', {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
    } catch (error) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;

    try {
      const response = await fetch(`/api/admin/comments/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({ comment: replyText })
      });

      if (!response.ok) throw new Error('Failed to post reply');
      
      const data = await response.json();
      
      // Update the comments state with the new reply
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), data.reply]
          };
        }
        return comment;
      }));
      
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to post reply:', error);
      alert('Failed to post reply. Please try again.');
    }
  };

  const handleDeleteClick = (commentId, isReply = false) => {
    setDeleteConfirm({
      isOpen: true,
      commentId,
      isReply
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/admin/comments/${deleteConfirm.commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.token}` }
      });

      if (!response.ok) throw new Error('Failed to delete comment');
      
      await fetchComments();
      setDeleteConfirm({ isOpen: false, commentId: null, isReply: false });
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-medium text-gray-900">Comments Management</h1>
      
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 relative rounded overflow-hidden">
                  <Image
                    src={comment.content_thumbnail || '/placeholder.jpg'}
                    alt={comment.content_title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{comment.content_title}</p>
                  <p className="text-xs text-gray-500">
                    by {comment.name} • {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteClick(comment.id)}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{comment.comment}</p>
            
            {replyingTo === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                  rows="2"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReply(comment.id)}
                    className="text-xs bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                  >
                    Post Reply
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Reply
              </button>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="text-sm">
                    <div className="flex justify-between">
                      <p className="text-xs text-gray-500">
                        {reply.name} • {new Date(reply.created_at).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleDeleteClick(reply.id, true)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-gray-600 mt-1">{reply.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {deleteConfirm.isReply 
                ? "Are you sure you want to delete this reply?"
                : "Are you sure you want to delete this comment? All replies will also be deleted."}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, commentId: null, isReply: false })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 