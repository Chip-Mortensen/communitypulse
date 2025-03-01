'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase';
import AuthForm from '@/components/AuthForm';

function LoginPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log("[LoginPage] Checking authentication status");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("[LoginPage] Error checking session:", error);
        return;
      }
      
      console.log("[LoginPage] Session check result:", !!session, session?.user?.email);
      
      // Don't redirect here yet, just log the information
    };
    
    checkAuth();
  }, [supabase.auth]);

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      console.log("[LoginPage] Login attempt with:", data.email);
      setIsLoading(true);
      setError(null);

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error("[LoginPage] Login error:", error);
        throw error;
      }
      
      console.log("[LoginPage] Login successful:", authData.session?.user?.email);
      console.log("[LoginPage] About to redirect to home page");
      
      // Force a full page reload to the home page
      // This bypasses any client-side routing issues
      window.location.href = '/';
      
    } catch (error: unknown) {
      console.error('[LoginPage] Login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-center text-2xl font-bold">Sign In</h1>
      <AuthForm 
        type="login"
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

// Loading fallback for Suspense
function LoginPageLoading() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Loading Login Page</h1>
      <div className="mt-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageLoading />}>
      <LoginPageContent />
    </Suspense>
  );
} 