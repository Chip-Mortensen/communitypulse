'use client';

import { useEffect } from 'react';
import MapComponent from '@/components/Map';
import { useIssueStore } from '@/store/issueStore';

export default function Home() {
  const { issues, isLoading, error, fetchIssues } = useIssueStore();

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return (
    <div className="flex flex-col h-full">
      <MapComponent issues={issues} isLoading={isLoading} error={error} />
    </div>
  );
}
