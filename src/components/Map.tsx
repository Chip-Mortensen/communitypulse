'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Map, { Marker, Popup, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Issue } from '@/types/database.types';

type MapComponentProps = {
  issues?: Issue[];
  isLoading?: boolean;
  error?: string | null;
};

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
      const sumLat = issues.reduce((sum, issue) => sum + issue.location.lat, 0);
      const sumLng = issues.reduce((sum, issue) => sum + issue.location.lng, 0);
      
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
        center: [issue.location.lng, issue.location.lat],
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
        longitude={issue.location.lng}
        latitude={issue.location.lat}
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

  // Render popup for selected issue
  const popup = useMemo(() => {
    if (!selectedIssue) return null;
    
    return (
      <Popup
        longitude={selectedIssue.location.lng}
        latitude={selectedIssue.location.lat}
        onClose={() => setSelectedIssue(null)}
        closeButton={false}
        closeOnClick={false}
        anchor="bottom"
        offset={[0, -30]} // Offset to position above the marker
        className="custom-popup" // Add custom class for styling
      >
        <div className="p-2 max-w-xs relative">
          <button 
            onClick={() => setSelectedIssue(null)}
            className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
            aria-label="Close popup"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="font-semibold text-sm mb-1 pr-6">{selectedIssue.title}</h3>
          <p className="text-xs text-gray-700 mb-2">{selectedIssue.address}</p>
          <p className="text-xs mb-2 line-clamp-2">{selectedIssue.description}</p>
          <div className="flex justify-between items-center">
            <span 
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ 
                backgroundColor: `${categoryColors[selectedIssue.category]}20`, 
                color: categoryColors[selectedIssue.category] 
              }}
            >
              {selectedIssue.category}
            </span>
            <Link
              href={`/issues/${selectedIssue.id}`}
              className="text-xs text-blue-600 hover:underline"
            >
              View Details
            </Link>
          </div>
        </div>
      </Popup>
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
        
        {/* Selected Issue Popup */}
        {popup}
      </Map>
      
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