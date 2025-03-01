'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import IssueForm from '@/components/IssueForm';
import GoogleMapsScript from '@/components/GoogleMapsScript';
import { useIssueStore } from '@/store/issueStore';
import { Database } from '@/types/supabase';

// Define the Issue type from Supabase
type Issue = Database['public']['Tables']['issues']['Row'];

export default function NewIssuePage() {
  const router = useRouter();
  const { error } = useIssueStore();

  // Replace with your actual Google Maps API key
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const handleSuccess = (issue: Issue) => {
    router.push(`/issues/${issue.id}`);
  };

  return (
    <PageContainer>
      {/* Load Google Maps API with Places library */}
      <GoogleMapsScript apiKey={googleMapsApiKey} />
      
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600 !mb-0 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Report a New Issue
          </h1>
          <Link
            href="/issues"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Issues
          </Link>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 flex items-start">
            <svg className="w-5 h-5 mr-2 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Issue Details</h2>
            <p className="text-gray-600">Please provide detailed information about the community issue you'd like to report.</p>
          </div>
          
          <IssueForm 
            onSuccess={handleSuccess}
            isMapMode={false}
          />
        </div>
      </div>
    </PageContainer>
  );
} 