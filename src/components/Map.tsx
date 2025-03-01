'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Map, { Marker, Popup, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Database } from '@/types/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { getAddressFromCoordinates } from '@/services/geocoding';
import IssueCreationSidebar from './IssueCreationSidebar';

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
  
  // State for issue creation
  const [creationMode, setCreationMode] = useState(false);
  const [draftLocation, setDraftLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [draftAddress, setDraftAddress] = useState('');
  const [isGettingAddress, setIsGettingAddress] = useState(false);
  
  // State for drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [isHoveringReportButton, setIsHoveringReportButton] = useState(false);

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

  // Handle map click
  const handleMapClick = useCallback((e: any) => {
    // In view mode, close the selected issue
    setSelectedIssue(null);
  }, []);

  // Handle marker click
  const handleMarkerClick = useCallback((e: React.MouseEvent, issue: Issue) => {
    if (creationMode) return; // Ignore marker clicks in creation mode
    
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
  }, [creationMode]);

  // Handle creation cancel
  const handleCreationCancel = useCallback(() => {
    setCreationMode(false);
    setDraftLocation(null);
    setDraftAddress('');
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent) => {
    console.log('Drag started');
    setIsDragging(true);
    
    // Set data transfer properties
    e.dataTransfer.setData('text/plain', 'new-issue');
    e.dataTransfer.effectAllowed = 'move'; // Use 'move' instead of 'copy' to avoid the green plus icon
    
    // Create a transparent drag image
    const dragImage = new Image();
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    
    // Ensure the image is loaded before using it
    if (!dragImage.complete) {
      // If not loaded, create a fallback div
      const div = document.createElement('div');
      div.style.visibility = 'hidden';
      div.style.position = 'absolute';
      div.style.top = '-1000px';
      div.style.width = '1px';
      div.style.height = '1px';
      document.body.appendChild(div);
      
      e.dataTransfer.setDragImage(div, 0, 0);
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(div);
      }, 0);
    } else {
      e.dataTransfer.setDragImage(dragImage, 0, 0);
    }
    
    // Force a repaint to ensure the animation starts immediately
    requestAnimationFrame(() => {
      const tooltip = document.querySelector('.instruction-tooltip') as HTMLElement;
      if (tooltip) {
        tooltip.classList.remove('tooltip-bounce');
        void tooltip.offsetWidth; // Trigger reflow
        tooltip.classList.add('tooltip-bounce');
      }
    });
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    console.log('Drag ended');
    setIsDragging(false);
    setDragPosition(null);
    
    // Remove the valid drop target class
    const mapContainer = mapRef.current?.getContainer();
    if (mapContainer) {
      mapContainer.classList.remove('valid-drop-target');
    }
  }, []);

  const handleMapDragOver = useCallback((e: React.DragEvent) => {
    // This is crucial - must prevent default to allow drop
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move'; // Use 'move' instead of 'copy' to avoid the green plus icon
    
    // Add a class to the map container to show it's a valid drop target
    const mapContainer = mapRef.current?.getContainer();
    if (mapContainer) {
      mapContainer.classList.add('valid-drop-target');
    }
    
    // Update drag position for the target indicator
    const rect = mapContainer?.getBoundingClientRect();
    if (rect) {
      setDragPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, []);

  const handleMapDrop = useCallback((e: React.DragEvent) => {
    console.log('Drop event triggered', e);
    e.preventDefault();
    e.stopPropagation();
    
    // Get drop coordinates relative to the map container
    const mapContainer = mapRef.current?.getContainer();
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }
    
    const rect = mapContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    console.log('Drop coordinates:', { x, y, clientX: e.clientX, clientY: e.clientY, rect });
    
    // Convert screen coordinates to map coordinates
    const point = mapRef.current?.unproject([x, y]);
    if (!point) {
      console.error('Could not unproject point');
      return;
    }
    
    console.log('Map coordinates:', point);
    
    // Set the draft location
    const newLocation = { lat: point.lat, lng: point.lng };
    setDraftLocation(newLocation);
    
    // Show loading indicator
    setIsGettingAddress(true);
    
    // Show the sidebar immediately with loading state
    setCreationMode(true);
    
    // Center map on the drop location
    mapRef.current?.flyTo({
      center: [newLocation.lng, newLocation.lat],
      zoom: 15,
      duration: 1000
    });
    
    // Get address from coordinates
    getAddressFromCoordinates(newLocation.lat, newLocation.lng)
      .then(address => {
        console.log('Got address:', address);
        // Set the address
        setDraftAddress(address);
        setIsGettingAddress(false);
      })
      .catch(err => {
        console.error('Error getting address:', err);
        // Even if we fail to get the address, still allow creation
        setDraftAddress('');
        setIsGettingAddress(false);
      });
  }, []);

  // Handle click on the "Report an Issue" button (fallback for mobile or if drag doesn't work)
  const handleReportButtonClick = useCallback(() => {
    console.log('Report button clicked');
    
    // If we have user location, use it as the initial location
    if (userLocation) {
      setDraftLocation(userLocation);
      
      // Show loading indicator
      setIsGettingAddress(true);
      
      // Show the sidebar immediately with loading state
      setCreationMode(true);
      
      // Center map on the user's location
      mapRef.current?.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        duration: 1000
      });
      
      // Get address from coordinates
      getAddressFromCoordinates(userLocation.lat, userLocation.lng)
        .then(address => {
          console.log('Got address:', address);
          // Set the address
          setDraftAddress(address);
          setIsGettingAddress(false);
        })
        .catch(err => {
          console.error('Error getting address:', err);
          // Even if we fail to get the address, still allow creation
          setDraftAddress('');
          setIsGettingAddress(false);
        });
    } else {
      // If we don't have user location, use the center of the map
      const center = mapRef.current?.getCenter();
      if (center) {
        const newLocation = { lat: center.lat, lng: center.lng };
        setDraftLocation(newLocation);
        
        // Show loading indicator
        setIsGettingAddress(true);
        
        // Show the sidebar immediately with loading state
        setCreationMode(true);
        
        // Get address from coordinates
        getAddressFromCoordinates(newLocation.lat, newLocation.lng)
          .then(address => {
            console.log('Got address:', address);
            // Set the address
            setDraftAddress(address);
            setIsGettingAddress(false);
          })
          .catch(err => {
            console.error('Error getting address:', err);
            // Even if we fail to get the address, still allow creation
            setDraftAddress('');
            setIsGettingAddress(false);
          });
      }
    }
  }, [userLocation]);

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

  // Render draft marker for issue creation
  const draftMarker = useMemo(() => {
    if (!creationMode || !draftLocation) return null;
    
    return (
      <Marker 
        longitude={draftLocation.lng}
        latitude={draftLocation.lat}
        anchor="bottom"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center transform transition-transform hover:scale-110 shadow-lg border-2 border-white">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      </Marker>
    );
  }, [creationMode, draftLocation]);

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
        
        /* Hide default drag ghost image */
        [draggable="true"] {
          -webkit-user-drag: element;
        }
        
        /* This helps with the drag image appearance */
        .no-drag-image {
          user-select: none;
        }
        
        /* Firefox specific - hide drag image */
        @-moz-document url-prefix() {
          [draggable="true"] {
            position: relative;
          }
        }
        
        /* Safari specific */
        @media not all and (min-resolution:.001dpcm) { 
          @supports (-webkit-appearance:none) {
            [draggable="true"] {
              -webkit-user-drag: none;
            }
          }
        }
        
        /* Add a visual indicator when dragging over the map */
        .map-drag-active {
          cursor: crosshair !important;
        }
        
        .map-drag-active::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 3px dashed #2563EB;
          pointer-events: none;
          z-index: 10;
          animation: pulse 1.5s infinite;
        }
        
        /* Valid drop target indicator */
        .valid-drop-target::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 4px dashed #10B981;
          background-color: rgba(16, 185, 129, 0.05);
          pointer-events: none;
          z-index: 10;
          animation: pulse-border 1s infinite;
        }
        
        /* Custom cursor during dragging */
        .valid-drop-target {
          cursor: none !important; /* Hide the default cursor */
        }
        
        /* Target indicator */
        .target-indicator {
          pointer-events: none;
          z-index: 20;
        }
        
        .target-indicator::before,
        .target-indicator::after {
          content: '';
          position: absolute;
          background-color: #10B981;
        }
        
        .target-indicator::before {
          width: 2px;
          height: 30px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        
        .target-indicator::after {
          width: 30px;
          height: 2px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        
        .target-indicator-circle {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #10B981;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          animation: pulse-scale 1.5s infinite;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
        }
        
        /* Add a dot at the center of the target indicator */
        .target-indicator-circle::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          background-color: #10B981;
          border-radius: 50%;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        
        @keyframes pulse-scale {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.7; }
          50% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.7; }
        }
        
        @keyframes pulse-border {
          0% { border-color: rgba(16, 185, 129, 0.7); }
          50% { border-color: rgba(16, 185, 129, 1); }
          100% { border-color: rgba(16, 185, 129, 0.7); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.7; }
          100% { opacity: 0.3; }
        }
        
        /* Pulsing animation for the button */
        .pulse-animation {
          position: relative;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
        }
        
        .pulse-animation::before,
        .pulse-animation::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        
        .pulse-animation::before {
          box-shadow: 0 0 0 rgba(59, 130, 246, 0.7);
          animation-delay: 0.5s;
        }
        
        .pulse-animation::after {
          box-shadow: 0 0 0 rgba(59, 130, 246, 0.7);
        }
        
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        
        /* Fade in animation for the instruction tooltip */
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        
        .instruction-tooltip {
          animation: fadeIn 0.3s ease-out forwards;
          left: 50% !important;
          transform: translateX(-50%);
          width: max-content;
        }
        
        /* Custom bounce animation for the tooltip */
        @keyframes tooltip-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(10px); }
        }
        
        .tooltip-bounce {
          animation: tooltip-bounce 1s ease-in-out infinite;
        }
      `}</style>
      
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center">
          <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-3"></div>
            <p className="text-sm font-medium text-gray-700">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Address loading indicator */}
      {isGettingAddress && (
        <div className="absolute inset-0 bg-black bg-opacity-30 z-30 flex items-center justify-center">
          <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex items-center">
            <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-3"></div>
            <p className="text-sm font-medium text-gray-700">Getting address...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 max-w-md">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Map</h2>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-md hover:from-blue-700 hover:to-blue-600 transition-colors shadow-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      {/* Map container with drag and drop handlers */}
      <div 
        className={`w-full h-full ${isDragging ? 'map-drag-active' : ''}`}
        onDragOver={handleMapDragOver}
        onDrop={handleMapDrop}
      >
        <Map
          ref={mapRef}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          initialViewState={viewState}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          onClick={handleMapClick}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
          cursor={isDragging ? 'crosshair' : 'grab'}
        >
          {/* Issue Markers */}
          {markers}
          
          {/* Draft Marker for Issue Creation */}
          {draftMarker}
          
          {/* Target indicator that follows the cursor when dragging */}
          {isDragging && dragPosition && (
            <div 
              className="target-indicator absolute pointer-events-none"
              style={{ 
                left: `${dragPosition.x}px`, 
                top: `${dragPosition.y}px`,
                width: '40px',
                height: '40px',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="target-indicator-circle"></div>
            </div>
          )}
        </Map>
      </div>
      
      {/* Issue Sidebar */}
      {issueSidebar}
      
      {/* Issue Creation Sidebar */}
      <AnimatePresence>
        {creationMode && draftLocation && (
          <IssueCreationSidebar
            location={draftLocation}
            address={draftAddress}
            onClose={handleCreationCancel}
            isAddressLoading={isGettingAddress}
          />
        )}
      </AnimatePresence>
      
      {/* Draggable Report Issue Button */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <button
          draggable="true"
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onClick={handleReportButtonClick}
          onMouseEnter={() => setIsHoveringReportButton(true)}
          onMouseLeave={() => setIsHoveringReportButton(false)}
          className={`w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center justify-center cursor-move shadow-lg transition-all hover:from-blue-700 hover:to-blue-600 hover:shadow-xl hover:-translate-y-0.5 no-drag-image ${
            isDragging ? 'opacity-50 scale-95' : 'scale-100 pulse-animation'
          }`}
          title="Drag this button to the location on the map where you want to report an issue, or click to use your current location"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="sr-only">Report an Issue</span>
        </button>
      </div>
      
      {/* Issues Count */}
      <div className="absolute top-4 left-4 bg-white px-4 py-2.5 rounded-lg shadow-sm z-10 border border-gray-100 flex items-center">
        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
        <p className="text-sm font-medium text-gray-700">
          {issues.length} {issues.length === 1 ? 'issue' : 'issues'} reported
        </p>
      </div>
      
      {/* Creation Mode Instructions */}
      {creationMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2.5 rounded-lg shadow-sm z-10 text-center border border-gray-100 flex items-center">
          {isGettingAddress ? (
            <>
              <div className="w-3 h-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-2"></div>
              <p className="text-sm font-medium text-gray-700">Getting address...</p>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm font-medium text-gray-700">Fill out the form to report this issue</p>
            </>
          )}
        </div>
      )}
      
      {/* Drag Instructions - Show on hover and when dragging */}
      {(isHoveringReportButton || isDragging) && (
        <div className={`absolute top-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2.5 rounded-lg shadow-md z-20 text-center instruction-tooltip ${isDragging ? 'tooltip-bounce' : ''}`}>
          <p className="text-sm font-medium flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isDragging ? 'Drop at the exact location you want to report' : 'Drag to the location you want to report'}
          </p>
        </div>
      )}
      
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
            className="bg-white px-3 py-2.5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors border border-gray-100 flex items-center"
            aria-label="Reset view"
          >
            <svg className="w-4 h-4 text-blue-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Reset view</span>
          </button>
        </div>
      )}
    </div>
  );
} 