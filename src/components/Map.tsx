'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Map, { Marker, Popup, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Database } from '@/types/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// Define types directly from the Supabase generated types
type Issue = Database['public']['Tables']['issues']['Row'];
type Location = {
  lat: number;
  lng: number;
};

type MapComponentProps = {
  issues?: Issue[];
  isLoading?: boolean;
  error?: string | null;
};

// Helper function to safely get location from issue
function getLocation(issue: Issue): Location {
  if (!issue.location) {
    return { lat: 0, lng: 0 };
  }
  
  const location = issue.location as unknown as Location;
  return {
    lat: location.lat || 0,
    lng: location.lng || 0
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

export default function MapComponent({ issues = [], isLoading = false, error = null }: MapComponentProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    latitude: 30.2672, // Austin, TX coordinates
    longitude: -97.7431,
    zoom: 12
  });
  
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          
          // Center map on user's location if we don't have any issues
          if (issues.length === 0) {
            setViewState(prev => ({
              ...prev,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }));
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [issues.length]);

  // Center map on issues if available
  useEffect(() => {
    if (issues.length > 0 && !selectedIssue) {
      // Calculate the center of all issues
      const sumLat = issues.reduce((sum, issue) => sum + getLocation(issue).lat, 0);
      const sumLng = issues.reduce((sum, issue) => sum + getLocation(issue).lng, 0);
      
      setViewState(prev => ({
        ...prev,
        latitude: sumLat / issues.length,
        longitude: sumLng / issues.length,
      }));
    }
  }, [issues, selectedIssue]);

  // Close popup when clicking on the map
  const handleMapClick = useCallback(() => {
    setSelectedIssue(null);
  }, []);

  // Handle marker click
  const handleMarkerClick = useCallback((e: React.MouseEvent, issue: Issue) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent the click from propagating to the map
    
    // Set the selected issue
    setSelectedIssue(issue);
    
    // Fly to the issue location with animation
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [getLocation(issue).lng, getLocation(issue).lat],
        zoom: 15,
        duration: 1000, // Animation duration in milliseconds
        essential: true // This animation is considered essential for the user experience
      });
    }
  }, [selectedIssue]);

  // Render markers for each issue
  const markers = useMemo(() => {
    return issues.map(issue => (
      <Marker 
        key={issue.id}
        longitude={getLocation(issue).lng}
        latitude={getLocation(issue).lat}
        anchor="bottom"
        onClick={(e) => {
          // This prevents the map's onClick from firing
          e.originalEvent.stopPropagation();
        }}
      >
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transform transition-transform hover:scale-110"
          style={{ 
            backgroundColor: categoryColors[issue.category] || categoryColors.Other,
            // Highlight the selected marker
            boxShadow: selectedIssue?.id === issue.id ? '0 0 0 3px white, 0 0 0 5px #3B82F6' : 'none',
            zIndex: selectedIssue?.id === issue.id ? 10 : 1
          }}
          onClick={(e) => handleMarkerClick(e, issue)}
        >
          <span className="text-white text-xs font-bold">{issue.upvotes}</span>
        </div>
      </Marker>
    ));
  }, [issues, handleMarkerClick, selectedIssue]);

  // Replace popup with sidebar - Alternative Design
  const issueSidebar = useMemo(() => {
    return (
      <AnimatePresence mode="wait">
        {selectedIssue && (
          <>
            {/* Semi-transparent overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black z-10"
              onClick={() => setSelectedIssue(null)}
            />
            
            {/* Sidebar - Alternative Design */}
            <motion.div 
              key="sidebar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-0 right-0 h-full w-80 md:w-96 bg-gradient-to-b from-white to-[#f9f9f9] shadow-lg z-20 flex flex-col"
            >
              {/* Header with category color accent */}
              <div 
                className="relative pt-12 px-6 pb-6"
                style={{ 
                  borderTop: `4px solid ${categoryColors[selectedIssue.category] || categoryColors.Other}` 
                }}
              >
                <button 
                  onClick={() => setSelectedIssue(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full transition-colors shadow-sm"
                  aria-label="Close sidebar"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <span 
                  className="inline-block text-xs font-medium tracking-wide uppercase mb-2 px-3 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `${categoryColors[selectedIssue.category]}15`, 
                    color: categoryColors[selectedIssue.category] 
                  }}
                >
                  {selectedIssue.category}
                </span>
                
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedIssue.title}</h2>
                
                <div className="flex items-center mt-4 text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{selectedIssue.address}</span>
                </div>
              </div>
              
              {/* Content area */}
              <div className="flex-1 overflow-y-auto px-6">
                {/* Status and upvotes card */}
                <div className="flex items-stretch mb-6 rounded-lg overflow-hidden shadow-sm">
                  <div 
                    className={`w-1/2 p-4 flex flex-col items-center justify-center ${
                      selectedIssue.status === 'open'
                        ? 'bg-red-50'
                        : selectedIssue.status === 'in_progress'
                        ? 'bg-yellow-50'
                        : 'bg-green-50'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-wide font-medium mb-1 text-gray-500">Status</span>
                    <span
                      className={`font-medium ${
                        selectedIssue.status === 'open'
                          ? 'text-red-700'
                          : selectedIssue.status === 'in_progress'
                          ? 'text-yellow-700'
                          : 'text-green-700'
                      }`}
                    >
                      {selectedIssue.status === 'open'
                        ? 'Open'
                        : selectedIssue.status === 'in_progress'
                        ? 'In Progress'
                        : 'Resolved'}
                    </span>
                  </div>
                  
                  <div className="w-1/2 p-4 bg-blue-50 flex flex-col items-center justify-center">
                    <span className="text-xs uppercase tracking-wide font-medium mb-1 text-gray-500">Upvotes</span>
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 text-blue-600 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                      </svg>
                      <span className="font-medium text-blue-700">{selectedIssue.upvotes || 0}</span>
                    </div>
                  </div>
                </div>
                
                {/* Image if available */}
                {selectedIssue.image_url && (
                  <div className="mb-6 rounded-lg overflow-hidden shadow-sm">
                    <img
                      src={selectedIssue.image_url}
                      alt={selectedIssue.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                
                {/* Description section */}
                <div className="mb-6">
                  <h3 className="text-sm uppercase tracking-wide font-medium text-gray-500 mb-3">Description</h3>
                  <p className="text-gray-800 leading-relaxed">{selectedIssue.description}</p>
                </div>
                
                {/* Date information */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <span className="block text-xs text-gray-500">Reported on</span>
                      <span className="block font-medium text-gray-800">
                        {new Date(selectedIssue.created_at || '').toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer with action button */}
              <div className="p-6 border-t border-gray-200">
                <Link
                  href={`/issues/${selectedIssue.id}`}
                  className="w-full block text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors shadow-sm font-medium"
                >
                  View Full Details
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }, [selectedIssue]);

  return (
    <div className="w-full h-full relative">
      <style jsx global>{`
        .custom-popup .mapboxgl-popup-close-button {
          display: none;
        }
      `}</style>
      
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="ml-3 text-gray-700">Loading map...</p>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center">
          <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        initialViewState={viewState}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {/* Issue Markers */}
        {markers}
      </Map>
      
      {/* Issue Sidebar */}
      {issueSidebar}
      
      {/* Report Issue Button */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <Link
          href="/new-issue"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-lg flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Report an Issue
        </Link>
      </div>
      
      {/* Issues Count */}
      <div className="absolute top-4 left-4 bg-white p-2 rounded-md shadow-md z-10">
        <p className="text-sm font-medium">
          {issues.length} {issues.length === 1 ? 'issue' : 'issues'} reported
        </p>
      </div>
      
      {/* Reset View Button - Only show when an issue is selected */}
      {selectedIssue && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => {
              setSelectedIssue(null);
              if (mapRef.current) {
                mapRef.current.flyTo({
                  center: [viewState.longitude, viewState.latitude],
                  zoom: 12,
                  duration: 1000
                });
              }
            }}
            className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Reset view"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
} 