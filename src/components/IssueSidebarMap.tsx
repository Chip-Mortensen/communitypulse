'use client';

import { Database } from '@/types/supabase';

// Define types directly from the Supabase generated types
type Issue = Database['public']['Tables']['issues']['Row'];
type Location = {
  lat: number;
  lng: number;
};

type IssueSidebarMapProps = {
  issue: Issue;
};

// Helper function to safely get location from issue
function getLocation(issue: Issue): Location {
  if (!issue.location) {
    // Default to Austin, TX if no location is provided
    return { lat: 30.2672, lng: -97.7431 };
  }
  
  const location = issue.location as unknown as Location;
  return {
    lat: location.lat || 30.2672,
    lng: location.lng || -97.7431
  };
}

// Category colors for markers
const categoryColors: Record<string, string> = {
  'Infrastructure': '#3B82F6', // blue
  'Safety': '#EF4444', // red
  'Environment': '#10B981', // green
  'Public Services': '#F59E0B', // amber
  'Other': '#6B7280', // gray
};

export default function IssueSidebarMap({ issue }: IssueSidebarMapProps) {
  const location = getLocation(issue);
  
  // Create a Google Maps embed URL with the issue location
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${location.lat},${location.lng}&zoom=16`;
  
  // If we don't have an API key, we can use a simpler URL that doesn't require an API key
  // This will show the location but without a marker
  const fallbackUrl = `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=16&output=embed`;
  
  // Temporarily use fallback URL until Maps Embed API is enabled
  // const mapUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? googleMapsUrl : fallbackUrl;
  const mapUrl = fallbackUrl;
  
  return (
    <div className="w-full h-full">
      <iframe
        title={`Map for ${issue.title}`}
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
} 