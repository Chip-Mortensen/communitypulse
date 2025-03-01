'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import IssueForm from '@/components/IssueForm';
import { useIssueStore } from '@/store/issueStore';
import { Database } from '@/types/supabase';

// Define the Issue type from Supabase
type Issue = Database['public']['Tables']['issues']['Row'];

export default function NewIssuePage() {
  const router = useRouter();
  const { error } = useIssueStore();

  const handleSuccess = (issue: Issue) => {
    router.push(`/issues/${issue.id}`);
  };

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600 !mb-0">Report a New Issue</h1>
          <Link
            href="/issues"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back to Issues
          </Link>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <IssueForm 
            onSuccess={handleSuccess}
            isMapMode={false}
          />
        </div>
      </div>
    </PageContainer>
  );
} 