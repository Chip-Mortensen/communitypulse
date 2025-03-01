'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import IssueForm from './IssueForm';
import { Database } from '@/types/supabase';

type Issue = Database['public']['Tables']['issues']['Row'];

type IssueCreationSidebarProps = {
  location: { lat: number; lng: number } | null;
  address: string;
  onClose: () => void;
  isAddressLoading?: boolean;
};

export default function IssueCreationSidebar({
  location,
  address,
  onClose,
  isAddressLoading = false,
}: IssueCreationSidebarProps) {
  const router = useRouter();
  
  console.log('IssueCreationSidebar received address:', address);

  const handleSuccess = (issue: Issue) => {
    // Redirect to the issue detail page
    router.push(`/issues/${issue.id}`);
  };

  return (
    <>
      {/* Semi-transparent overlay */}
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black z-10"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <motion.div 
        key="sidebar"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute top-0 right-0 h-full w-80 md:w-96 bg-white shadow-xl z-20 flex flex-col"
        style={{ boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.1)' }}
      >
        {/* Header with accent color */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 pt-8 px-6 pb-6 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center mb-2">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold leading-tight">Report an Issue</h2>
          </div>
          <p className="text-sm text-blue-100">
            Fill out the form below to report a community issue
          </p>
        </div>
        
        {/* Location indicator */}
        {location && (
          <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-blue-800 truncate">
              {isAddressLoading ? 'Getting location address...' : address || 'Selected location'}
            </p>
          </div>
        )}
        
        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <IssueForm
            initialLocation={location}
            initialAddress={address}
            onSuccess={handleSuccess}
            onCancel={onClose}
            isMapMode={true}
            isAddressLoading={isAddressLoading}
          />
        </div>
      </motion.div>
    </>
  );
} 