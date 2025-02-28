'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useIssueStore } from '@/store/issueStore';
import { Issue } from '@/types/database.types';

export default function IssuesPage() {
  const { issues, isLoading, error, fetchIssues } = useIssueStore();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('upvotes');

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    return issue.status === filter;
  });

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'upvotes') {
      return b.upvotes - a.upvotes;
    } else if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Community Issues</h1>
        <Link
          href="/new-issue"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Report New Issue
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 w-full">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'open'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'in_progress'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'resolved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Resolved
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
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
                  <li key={issue.id} className="p-4 hover:bg-gray-50 w-full">
                    <Link href={`/issues/${issue.id}`} className="block w-full">
                      <div className="flex justify-between w-full">
                        <h2 className="text-lg font-medium text-gray-900">{issue.title}</h2>
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
                      <p className="mt-1 text-sm text-gray-700">{issue.address}</p>
                      <p className="mt-2 text-sm text-gray-700 line-clamp-2">{issue.description}</p>
                      <div className="mt-3 flex justify-between items-center w-full">
                        <span className="inline-flex items-center text-sm">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {issue.category}
                          </span>
                        </span>
                        <div className="flex space-x-4 text-sm text-gray-700">
                          <span className="flex items-center">
                            <svg
                              className="h-4 w-4 mr-1 text-gray-700"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {new Date(issue.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <svg
                              className="h-4 w-4 mr-1 text-gray-700"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            {issue.upvotes}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="p-4 text-center text-gray-700 h-[300px] flex items-center justify-center w-full">
                  <div>No issues found matching your filters.</div>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 