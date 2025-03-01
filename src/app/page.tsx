'use client';

import { useEffect, useState } from 'react';
import MapComponent from '@/components/Map';
import GoogleMapsScript from '@/components/GoogleMapsScript';
import { useIssueStore } from '@/store/issueStore';
import { createClient } from '@/lib/supabase';
import PageContainer from '@/components/PageContainer';

export default function Home() {
  const { issues, isLoading, error, fetchIssues } = useIssueStore();
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const supabase = createClient();
  
  // Replace with your actual Google Maps API key
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        setUser(session?.user || null);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setAuthChecked(true);
      }
    };

    getUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (user) {
      fetchIssues();
    }
  }, [fetchIssues, user]);

  if (!authChecked) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <PageContainer scrollable={false}>
      {/* Load Google Maps API with Places library */}
      <GoogleMapsScript apiKey={googleMapsApiKey} />
      <MapComponent issues={issues} isLoading={isLoading} error={error} />
    </PageContainer>
  );
}
