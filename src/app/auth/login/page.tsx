'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
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
      
    } catch (error: any) {
      console.error('[LoginPage] Login error:', error);
      setError(error.message || 'Failed to sign in. Please try again.');
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