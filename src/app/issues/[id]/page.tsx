'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useIssueStore } from '@/store/issueStore';
import { Database } from '@/types/supabase';
import PageContainer from '@/components/PageContainer';
import IssueSidebarMap from '@/components/IssueSidebarMap';

// Define types directly from the Supabase generated types
type Issue = Database['public']['Tables']['issues']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];

// Helper functions to safely handle nullable fields
const getUpvotes = (data: { upvotes: number | null }): number => data.upvotes ?? 0;
const getCreatedAt = (data: { created_at: string | null }): Date => 
  data.created_at ? new Date(data.created_at) : new Date();

export default function IssueDetailPage() {
  const params = useParams();
  const issueId = params.id as string;
  
  const { 
    currentIssue, 
    comments, 
    isLoading, 
    error, 
    fetchIssueById, 
    fetchCommentsByIssueId,
    createComment,
    updateIssueUpvotes
  } = useIssueStore();

  const [newComment, setNewComment] = useState('');
  const [upvoted, setUpvoted] = useState(false);

  useEffect(() => {
    fetchIssueById(issueId);
    fetchCommentsByIssueId(issueId);
  }, [issueId, fetchIssueById, fetchCommentsByIssueId]);

  const handleUpvote = () => {
    if (!currentIssue) return;
    
    const newUpvotes = upvoted 
      ? getUpvotes(currentIssue) - 1 
      : getUpvotes(currentIssue) + 1;
    
    updateIssueUpvotes(issueId, newUpvotes);
    setUpvoted(!upvoted);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentIssue) return;

    const commentData: Database['public']['Tables']['comments']['Insert'] = {
      issue_id: issueId,
      user_id: 'current-user', // In a real app, this would be the current user's ID
      content: newComment,
    };

    await createComment(commentData);
    setNewComment('');
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

  if (isLoading) {
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

  if (error || !currentIssue) {
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
                    onClick={handleUpvote}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
                      upvoted
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
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
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Post Comment
                    </button>
                  </div>
                </form>
                
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                                {comment.user_id.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">User {comment.user_id}</p>
                              <p className="text-sm text-gray-700">
                                {getCreatedAt(comment).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-700">
                            <svg
                              className="h-4 w-4 mr-1 text-gray-700"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            {getUpvotes(comment)}
                          </div>
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