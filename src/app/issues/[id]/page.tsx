'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useIssueStore } from '@/store/issueStore';
import { Database } from '@/types/supabase';
import PageContainer from '@/components/PageContainer';
import IssueSidebarMap from '@/components/IssueSidebarMap';
import { createClient } from '@/lib/supabase';

// Add debounce utility
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Define types directly from the Supabase generated types
type Issue = Database['public']['Tables']['issues']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'] & {
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  }
};

// Helper functions to safely handle nullable fields
const getUpvotes = (data: { upvotes: number | null }): number => data.upvotes ?? 0;
const getCreatedAt = (data: { created_at: string | null }): Date => 
  data.created_at ? new Date(data.created_at) : new Date();

export default function IssueDetailPage() {
  const params = useParams();
  const issueId = params.id as string;
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { 
    currentIssue, 
    comments, 
    isLoading, 
    error, 
    fetchIssueById, 
    fetchCommentsByIssueId,
    createComment,
    toggleIssueUpvote,
    checkIssueUpvote,
    toggleCommentUpvote,
    checkCommentUpvote
  } = useIssueStore();

  const [newComment, setNewComment] = useState('');
  const [upvoted, setUpvoted] = useState(false);
  const [upvotedComments, setUpvotedComments] = useState<Record<string, boolean>>({});
  const [isUpvoteLoading, setIsUpvoteLoading] = useState(false);
  const [upvoteLoadingComments, setUpvoteLoadingComments] = useState<Record<string, boolean>>({});
  // Add a ref to track if an upvote operation is in progress
  const isUpvoteOperationInProgress = useRef(false);
  // Add a ref to track which comments are being upvoted
  const commentsBeingUpvoted = useRef<Record<string, boolean>>({});

  // Fetch issue and comments data
  useEffect(() => {
    const fetchData = async () => {
      await fetchIssueById(issueId);
      await fetchCommentsByIssueId(issueId);
      setInitialLoading(false);
    };
    
    fetchData();
  }, [issueId, fetchIssueById, fetchCommentsByIssueId]);
  
  // Get the current user's ID
  useEffect(() => {
    const fetchUserId = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    
    fetchUserId();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentIssue) return; // Don't set up subscriptions until we have the current issue
    
    const supabase = createClient();
    
    // Subscribe to changes on the issue
    const issueSubscription = supabase
      .channel('issue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues',
          filter: `id=eq.${issueId}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            // Get the new data
            const updatedIssue = payload.new as Issue;
            
            // Only preserve the upvote count if an upvote operation is in progress
            if (currentIssue) {
              // If we're in the middle of an upvote operation, don't update the upvote count
              // from the real-time subscription as it might be stale compared to our direct API response
              const mergedIssue = {
                ...updatedIssue,
                // Only preserve the upvote count if we're in the middle of an upvote operation
                upvotes: isUpvoteOperationInProgress.current ? currentIssue.upvotes : updatedIssue.upvotes
              };
              
              // Only update the state if there's an actual change to avoid unnecessary re-renders
              if (JSON.stringify(mergedIssue) !== JSON.stringify(currentIssue)) {
                useIssueStore.setState({ currentIssue: mergedIssue });
              }
            }
          } else {
            // For other event types, fetch the issue again
            fetchIssueById(issueId);
          }
        }
      )
      .subscribe();
    
    // Subscribe to changes on comments for this issue
    const commentsSubscription = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `issue_id=eq.${issueId}`
        },
        async (payload) => {
          if (payload.eventType === 'UPDATE') {
            // Get the updated comment
            const updatedComment = payload.new as Comment;
            
            // Update the comment in the state, preserving the upvote count if needed
            useIssueStore.setState(state => ({
              ...state,
              comments: state.comments.map(comment => {
                if (comment.id === updatedComment.id) {
                  // If we're in the middle of upvoting this comment, don't update the upvote count
                  // from the real-time subscription as it might be stale compared to our direct API response
                  return {
                    ...updatedComment,
                    // Only preserve the upvote count if we're in the middle of upvoting this comment
                    upvotes: commentsBeingUpvoted.current[updatedComment.id] ? comment.upvotes : updatedComment.upvotes,
                    // Preserve profile information
                    profiles: comment.profiles
                  };
                }
                return comment;
              })
            }));
          } else if (payload.eventType === 'INSERT') {
            // Fetch all comments to ensure we have the complete data
            fetchCommentsByIssueId(issueId);
          } else if (payload.eventType === 'DELETE' && payload.old) {
            // Remove the deleted comment from the state
            useIssueStore.setState(state => ({
              ...state,
              comments: state.comments.filter(comment => comment.id !== payload.old.id)
            }));
          }
        }
      )
      .subscribe();
    
    return () => {
      // Clean up subscriptions
      supabase.removeChannel(issueSubscription);
      supabase.removeChannel(commentsSubscription);
    };
  }, [issueId, currentIssue, fetchIssueById, fetchCommentsByIssueId]);

  // Check if the user has upvoted this issue
  useEffect(() => {
    const checkUpvoteStatus = async () => {
      if (userId && issueId) {
        const hasUpvoted = await checkIssueUpvote(issueId, userId);
        setUpvoted(hasUpvoted);
      }
    };
    
    checkUpvoteStatus();
  }, [userId, issueId, checkIssueUpvote]);

  // Check which comments the user has upvoted
  useEffect(() => {
    const checkCommentUpvotes = async () => {
      if (!userId || comments.length === 0) return;
      
      const upvotedMap: Record<string, boolean> = {};
      
      // Process all comment upvote checks in parallel for better performance
      const upvoteChecks = comments.map(async (comment) => {
        const isUpvoted = await checkCommentUpvote(comment.id, userId);
        return { commentId: comment.id, isUpvoted };
      });
      
      const results = await Promise.all(upvoteChecks);
      
      results.forEach(({ commentId, isUpvoted }) => {
        upvotedMap[commentId] = isUpvoted;
      });
      
      setUpvotedComments(upvotedMap);
    };
    
    checkCommentUpvotes();
  }, [userId, comments, checkCommentUpvote]);

  const handleUpvote = async () => {
    if (!currentIssue || !userId || isUpvoteLoading) return;
    
    // Store the current upvote count before the operation
    const previousUpvoteCount = currentIssue.upvotes ?? 0;
    
    setIsUpvoteLoading(true);
    // Set the flag to indicate an upvote operation is in progress
    isUpvoteOperationInProgress.current = true;
    
    try {
      // Use the enhanced toggle function that returns the current upvote count
      const result = await toggleIssueUpvote(issueId, userId);
      
      // Make sure we have a valid response with currentUpvotes
      if (result && typeof result.currentUpvotes === 'number') {
        // Update the UI based on the server response
        setUpvoted(result.isUpvoted);
        
        // If the server returns 0 but the previous count was not 0, use the previous count +/- 1
        // This is a fallback in case the database function returns incorrect data
        let safeUpvoteCount = result.currentUpvotes;
        
        if (result.currentUpvotes === 0 && previousUpvoteCount > 0) {
          // If the user is upvoting, increment the previous count, otherwise decrement it
          safeUpvoteCount = result.isUpvoted 
            ? previousUpvoteCount + 1 
            : Math.max(0, previousUpvoteCount - 1);
        } else {
          // Force the upvote count to be at least 0 (never negative)
          safeUpvoteCount = Math.max(0, result.currentUpvotes);
        }
        
        // Update the current issue with the server-provided upvote count
        if (currentIssue) {
          const updatedIssue = { 
            ...currentIssue, 
            upvotes: safeUpvoteCount 
          };
          
          // Directly update the state to ensure it takes effect immediately
          useIssueStore.setState({ 
            currentIssue: updatedIssue 
          });
        }
      } else {
        console.error("Invalid response from toggleIssueUpvote:", result);
      }
    } catch (error) {
      console.error("Error toggling issue upvote:", error);
    } finally {
      // Keep the isUpvoteOperationInProgress flag true for a bit longer to ensure
      // any real-time updates that come in don't override our upvote count
      setTimeout(() => {
        setIsUpvoteLoading(false);
        
        // Reset the flag after the operation is complete
        setTimeout(() => {
          isUpvoteOperationInProgress.current = false;
        }, 1000); // Increased delay to ensure any real-time updates have been processed
      }, 100);
    }
  };

  // Create a stable reference to the handleUpvote function
  const handleUpvoteRef = useRef(handleUpvote);
  useEffect(() => {
    handleUpvoteRef.current = handleUpvote;
  }, [handleUpvote]);
  
  // Create a debounced version of the upvote handler
  const debouncedHandleUpvoteRef = useRef<(() => void) | undefined>(undefined);
  if (!debouncedHandleUpvoteRef.current) {
    debouncedHandleUpvoteRef.current = debounce(() => {
      handleUpvoteRef.current();
    }, 300);
  }
  
  // Stable click handler that uses the debounced function
  const handleUpvoteClick = useCallback(() => {
    if (debouncedHandleUpvoteRef.current) {
      debouncedHandleUpvoteRef.current();
    }
  }, []);

  const handleCommentUpvote = async (commentId: string) => {
    if (!userId || upvoteLoadingComments[commentId]) return;
    
    // Find the comment in the current state
    const comment = comments.find(comment => comment.id === commentId);
    if (!comment) return;
    
    // Store the current upvote count before the operation
    const previousUpvoteCount = comment.upvotes ?? 0;
    
    // Set loading state for this specific comment
    setUpvoteLoadingComments(prev => ({
      ...prev,
      [commentId]: true
    }));
    
    // Mark this comment as being upvoted
    commentsBeingUpvoted.current = {
      ...commentsBeingUpvoted.current,
      [commentId]: true
    };
    
    try {
      // Use the enhanced toggle function that returns the current upvote count
      const result = await toggleCommentUpvote(commentId, userId);
      
      // Make sure we have a valid response with currentUpvotes
      if (result && typeof result.currentUpvotes === 'number') {
        // Update the UI based on the server response
        setUpvotedComments(prev => ({
          ...prev,
          [commentId]: result.isUpvoted
        }));
        
        // If the server returns 0 but the previous count was not 0, use the previous count +/- 1
        // This is a fallback in case the database function returns incorrect data
        let safeUpvoteCount = result.currentUpvotes;
        
        if (result.currentUpvotes === 0 && previousUpvoteCount > 0) {
          // If the user is upvoting, increment the previous count, otherwise decrement it
          safeUpvoteCount = result.isUpvoted 
            ? previousUpvoteCount + 1 
            : Math.max(0, previousUpvoteCount - 1);
        } else {
          // Force the upvote count to be at least 0 (never negative)
          safeUpvoteCount = Math.max(0, result.currentUpvotes);
        }
        
        // Update the comments array with the server-provided upvote count
        const updatedComments = comments.map(c => 
          c.id === commentId 
            ? { ...c, upvotes: safeUpvoteCount } 
            : c
        );
        
        useIssueStore.setState({ comments: updatedComments });
      } else {
        console.error("Invalid response from toggleCommentUpvote:", result);
      }
    } catch (error) {
      console.error("Error toggling comment upvote:", error);
    } finally {
      setUpvoteLoadingComments(prev => ({
        ...prev,
        [commentId]: false
      }));
      
      // Reset the flag after the operation is complete
      setTimeout(() => {
        commentsBeingUpvoted.current = {
          ...commentsBeingUpvoted.current,
          [commentId]: false
        };
      }, 500); // Add a small delay to ensure any real-time updates have been processed
    }
  };

  // Create a stable reference to the comment upvote handler
  const handleCommentUpvoteRef = useRef(handleCommentUpvote);
  useEffect(() => {
    handleCommentUpvoteRef.current = handleCommentUpvote;
  }, [handleCommentUpvote]);
  
  // Create a map of debounced handlers for each comment
  const debouncedCommentHandlersRef = useRef<Record<string, () => void>>({});
  
  // Get or create a debounced handler for a specific comment
  const getDebouncedCommentHandler = useCallback((commentId: string) => {
    if (!debouncedCommentHandlersRef.current[commentId]) {
      debouncedCommentHandlersRef.current[commentId] = debounce(() => {
        handleCommentUpvoteRef.current(commentId);
      }, 300);
    }
    return debouncedCommentHandlersRef.current[commentId];
  }, []);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentIssue || !userId) return;

    setIsSubmitting(true);
    
    const commentData: Database['public']['Tables']['comments']['Insert'] = {
      issue_id: issueId,
      user_id: userId,
      content: newComment,
    };

    await createComment(commentData);
    setNewComment('');
    setIsSubmitting(false);
  };

  // Mock government contact info based on issue category
  const getGovernmentContact = (category?: string) => {
    switch (category) {
      case 'Infrastructure':
        return {
          name: 'Department of Public Works',
          email: 'publicworks@sf.gov',
          phone: '(415) 555-1234',
          website: 'https://sf.gov/departments/public-works',
        };
      case 'Safety':
        return {
          name: 'Police Department',
          email: 'safety@sf.gov',
          phone: '(415) 555-5678',
          website: 'https://sf.gov/departments/police',
        };
      case 'Environment':
        return {
          name: 'Department of Environment',
          email: 'environment@sf.gov',
          phone: '(415) 555-9012',
          website: 'https://sf.gov/departments/environment',
        };
      default:
        return {
          name: 'City Hall',
          email: 'info@sf.gov',
          phone: '(415) 555-3456',
          website: 'https://sf.gov',
        };
    }
  };

  if (isLoading || initialLoading) {
    return (
      <PageContainer>
        <div className="max-w-6xl mx-auto py-8 px-6 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-700">Loading issue details...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if ((error || !currentIssue) && !initialLoading) {
    return (
      <PageContainer>
        <div className="max-w-6xl mx-auto py-8 px-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-600 !mb-0">Issue Details</h1>
            <Link
              href="/issues"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Back to Issues
            </Link>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center text-red-600 border border-gray-200">
            <p>Error loading issue details. The issue may not exist or has been removed.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Ensure currentIssue is not null before proceeding
  if (!currentIssue) {
    return null;
  }

  const governmentContact = getGovernmentContact(currentIssue.category);

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600 !mb-0">Issue Details</h1>
          <Link
            href="/issues"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back to Issues
          </Link>
        </div>
      
        <div className="flex flex-col md:flex-row">
          {/* Sidebar with Map */}
          <div className="md:w-1/3 pr-0 md:pr-4 mb-6 md:mb-0">
            <div className="sticky">
              <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                <div className="h-64 md:h-80">
                  <IssueSidebarMap issue={currentIssue} />
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-gray-900 mb-2">Location</h2>
                  <p className="text-gray-700 mb-4">{currentIssue.address}</p>
                  
                  <h2 className="font-semibold text-gray-900 mb-2">Government Contact</h2>
                  <div className="text-sm">
                    <p className="font-medium">{governmentContact.name}</p>
                    <p className="mt-1">
                      <a href={`mailto:${governmentContact.email}`} className="text-blue-600 hover:underline">
                        {governmentContact.email}
                      </a>
                    </p>
                    <p className="mt-1">{governmentContact.phone}</p>
                    <p className="mt-1">
                      <a href={governmentContact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:w-2/3">
            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{currentIssue.title}</h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      currentIssue.status === 'open'
                        ? 'bg-red-100 text-red-800'
                        : currentIssue.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {currentIssue.status === 'open'
                      ? 'Open'
                      : currentIssue.status === 'in_progress'
                      ? 'In Progress'
                      : 'Resolved'}
                  </span>
                </div>
                
                {currentIssue.image_url && (
                  <div className="mb-4 mt-4">
                    <img
                      src={currentIssue.image_url}
                      alt={currentIssue.title}
                      className="w-full h-64 object-cover rounded-md"
                    />
                  </div>
                )}
                
                <div className="prose max-w-none my-6">
                  <p>{currentIssue.description}</p>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {currentIssue.category}
                    </span>
                    <span className="text-sm text-gray-700">
                      Reported on {getCreatedAt(currentIssue).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleUpvoteClick}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm cursor-pointer ${
                      upvoted
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                     }`}
                    disabled={isUpvoteLoading}
                  >
                    <svg
                      className="h-4 w-4"
                      fill={upvoted ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                    <span>{getUpvotes(currentIssue)}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Comments ({comments.length})</h2>
                
                {userId ? (
                  <form onSubmit={handleCommentSubmit} className="mb-6">
                    <div className="mb-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Posting...
                          </>
                        ) : (
                          'Post Comment'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md mb-6 text-center">
                    <p className="text-gray-700">Please sign in to post a comment.</p>
                    <Link 
                      href="/auth/signin" 
                      className="inline-block mt-2 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
                
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                                {comment.profiles?.avatar_url ? (
                                  <img 
                                    src={comment.profiles.avatar_url} 
                                    alt={comment.profiles.display_name || 'User'} 
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  (comment.profiles?.display_name?.[0] || comment.user_id.charAt(0)).toUpperCase()
                                )}
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {comment.profiles?.display_name || `User ${comment.user_id.substring(0, 8)}`}
                              </p>
                              <p className="text-sm text-gray-700">
                                {getCreatedAt(comment).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => getDebouncedCommentHandler(comment.id)()}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs cursor-pointer ${
                              upvotedComments[comment.id]
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                             }`}
                            disabled={upvoteLoadingComments[comment.id]}
                          >
                            <svg
                              className="h-3 w-3"
                              fill={upvotedComments[comment.id] ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                              />
                            </svg>
                            <span>{getUpvotes(comment)}</span>
                          </button>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          <p>{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-700 py-4">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 