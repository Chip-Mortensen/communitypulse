'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function VerifyPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          // User is already signed in and verified
          setVerificationStatus('success');
          return;
        }

        // Get the code and type from the URL
        const code = searchParams.get('code');
        const type = searchParams.get('type');

        if (code && type === 'signup') {
          // Exchange the code for a session
          const { error } = await supabase.auth.verifyOtp({
            token_hash: code,
            type: 'signup',
          });

          if (error) {
            throw error;
          }

          setVerificationStatus('success');
        } else {
          setVerificationStatus('error');
          setErrorMessage('Invalid verification link. Please try signing up again.');
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setErrorMessage(error.message || 'Failed to verify email. Please try again.');
      }
    };

    handleEmailVerification();
  }, [searchParams, supabase.auth, router]);

  if (verificationStatus === 'loading') {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Verifying Your Email</h1>
        <p>Please wait while we verify your email address...</p>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Verification Failed</h1>
        <p className="mb-4 text-red-600">{errorMessage || 'An error occurred during verification.'}</p>
        <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 underline">
          Try signing up again
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Email Verified!</h1>
      <p className="mb-4">Your email has been successfully verified.</p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go to Home Page
        </Link>
      </div>
    </div>
  );
} 