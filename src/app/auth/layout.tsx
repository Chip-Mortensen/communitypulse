import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - CommunityPulse',
  description: 'Sign in or sign up to CommunityPulse to report and track community issues.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex justify-center">
            <h2 className="text-3xl font-extrabold text-blue-600">CommunityPulse</h2>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Welcome to CommunityPulse
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Map-based platform for citizens to post, upvote, and collaborate on local community issues
          </p>
        </div>
        {children}
      </div>
    </div>
  );
} 