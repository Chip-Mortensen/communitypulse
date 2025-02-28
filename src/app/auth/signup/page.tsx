'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import AuthForm from '@/components/AuthForm';

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // Sign up the user with Supabase Auth
      // The database trigger will automatically create a profile entry
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
          data: {
            full_name: `${data.firstName} ${data.lastName}`,
            display_name: data.displayName,
            avatar_url: null // Include this to match the trigger's expected fields
          },
        },
      });

      if (authError) {
        throw authError;
      }

      // No need to manually create a profile entry
      // The database trigger 'handle_new_user()' will automatically create it
      // based on the metadata we provided above

      setVerificationSent(true);
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
        <p className="mb-4">
          We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
        <p className="text-sm text-gray-500">
          If you don't see the email, check your spam folder or{' '}
          <button 
            className="text-blue-600 hover:text-blue-800 underline"
            onClick={() => router.push('/auth/login')}
          >
            try signing in
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-center text-2xl font-bold">Create an Account</h1>
      <AuthForm 
        type="signup"
        onSubmit={handleSignup}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
} 