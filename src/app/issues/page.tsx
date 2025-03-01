'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useIssueStore } from '@/store/issueStore';
import { Database } from '@/types/supabase';
import PageContainer from '@/components/PageContainer';
import { createClient } from '@/lib/supabase';

// Define types directly from the Supabase generated types
type Issue = Database['public']['Tables']['issues']['Row'];

// Helper functions to safely handle nullable fields
const getUpvotes = (issue: Issue): number => issue.upvotes ?? 0;
const getCreatedAt = (issue: Issue): Date => 
  issue.created_at ? new Date(issue.created_at) : new Date();

export default function IssuesPage() {
  const { issues, isLoading, error, fetchIssues } = useIssueStore();
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('upvotes');

  useEffect(() => {
    fetchIssues();

    // Set up real-time subscription for issues
    const supabase = createClient();
    const subscription = supabase
      .channel('issues-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            // Get the updated issue
            const updatedIssue = payload.new as Issue;
            
            // Update the issue in the state
            useIssueStore.setState(state => ({
              ...state,
              issues: state.issues.map(issue => {
                if (issue.id === updatedIssue.id) {
                  return updatedIssue;
                }
                return issue;
              })
            }));
          } else if (payload.eventType === 'INSERT') {
            // Fetch all issues to ensure proper sorting
            fetchIssues();
          } else if (payload.eventType === 'DELETE' && payload.old) {
            // Remove the deleted issue from the state
            useIssueStore.setState(state => ({
              ...state,
              issues: state.issues.filter(issue => issue.id !== payload.old.id)
            }));
          }
        }
      )
      .subscribe();
    
    return () => {
      // Clean up subscription
      supabase.removeChannel(subscription);
    };
  }, [fetchIssues]);

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    return issue.status === filter;
  });

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'upvotes') {
      return getUpvotes(b) - getUpvotes(a);
    } else if (sortBy === 'recent') {
      return getCreatedAt(b).getTime() - getCreatedAt(a).getTime();
    }
    return 0;
  });

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600 !mb-0 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Community Issues
          </h1>
          <Link
            href="/new-issue"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Report New Issue
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6 w-full border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="p-5 border-b border-gray-200 bg-gradient-to-b from-white to-gray-50 flex flex-wrap gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                All
              </button>
              <button
                onClick={() => setFilter('open')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                  filter === 'open'
                    ? 'bg-red-100 text-red-800 ring-1 ring-red-300'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Open
              </button>
              <button
                onClick={() => setFilter('in_progress')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                  filter === 'in_progress'
                    ? 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                In Progress
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                  filter === 'resolved'
                    ? 'bg-green-100 text-green-800 ring-1 ring-green-300'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Resolved
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              >
                <option value="upvotes">Most Upvoted</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>

          <div className="min-h-[400px] w-full">
            {isLoading ? (
              <div className="p-8 text-center w-full">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2 text-gray-700">Loading issues...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-600 w-full">
                <p>Error loading issues. Please try again later.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 w-full">
                {sortedIssues.length > 0 ? (
                  sortedIssues.map((issue) => (
                    <li key={issue.id} className="hover:bg-gray-50 w-full transition-colors duration-150">
                      <Link href={`/issues/${issue.id}`} className="block w-full p-5">
                        <div className="flex justify-between w-full">
                          <h2 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">{issue.title}</h2>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              issue.status === 'open'
                                ? 'bg-red-100 text-red-800'
                                : issue.status === 'in_progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {issue.status === 'open'
                              ? 'Open'
                              : issue.status === 'in_progress'
                              ? 'In Progress'
                              : 'Resolved'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-700 flex items-center">
                          <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {issue.address}
                        </p>
                        <p className="mt-2 text-sm text-gray-700 line-clamp-2">{issue.description}</p>
                        <div className="mt-3 flex justify-between items-center w-full">
                          <span className="inline-flex items-center text-sm">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-md font-medium">
                              {issue.category}
                            </span>
                          </span>
                          <div className="flex space-x-4 text-sm text-gray-700">
                            <span className="flex items-center">
                              <svg
                                className="h-4 w-4 mr-1.5 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {getCreatedAt(issue).toLocaleDateString()}
                            </span>
                            <span className="flex items-center text-gray-700">
                              <svg
                                className="h-4 w-4 mr-1.5 text-blue-500"
                                fill={getUpvotes(issue) > 0 ? "currentColor" : "none"}
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
                              <span className="font-medium">{getUpvotes(issue)}</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="p-8 text-center text-gray-700 h-[300px] flex items-center justify-center w-full">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>No issues found matching your filters.</div>
                      <button 
                        onClick={() => setFilter('all')} 
                        className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Clear filters
                      </button>
                    </div>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 