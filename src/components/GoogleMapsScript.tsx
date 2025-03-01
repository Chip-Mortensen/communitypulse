'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface GoogleMapsScriptProps {
  apiKey: string;
}

// Add a type for the window with googleMapsLoaded property
declare global {
  interface Window {
    googleMapsLoaded?: boolean;
  }
}

export default function GoogleMapsScript({ apiKey }: GoogleMapsScriptProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check if API key is valid
    if (!apiKey || apiKey === '') {
      console.error('Google Maps API key is missing or empty');
      setHasError(true);
    }
    
    // Add a global error handler for Google Maps
    // @ts-ignore - Google Maps specific global callback
    window.gm_authFailure = () => {
      console.error('Google Maps authentication error - API key may be invalid or restricted');
      setHasError(true);
    };
    
    return () => {
      // Clean up
      // @ts-ignore - Google Maps specific global callback
      delete window.gm_authFailure;
    };
  }, [apiKey]);

  const handleScriptLoad = () => {
    setIsLoaded(true);
    console.log('Google Maps API script loaded successfully');
    
    // Log API key length for debugging (don't log the actual key for security)
    console.log(`API key provided (length: ${apiKey.length})`);
    
    // Check if the Google Maps object is available
    // @ts-ignore - Google object is added by the script
    if (window.google && window.google.maps) {
      console.log('Google Maps object is available');
      
      // Dispatch a custom event to notify other components that Google Maps is ready
      const googleMapsReadyEvent = new CustomEvent('google-maps-ready', {
        detail: { isReady: true }
      });
      window.dispatchEvent(googleMapsReadyEvent);
      
      // Also set a global flag that can be checked
      window.googleMapsLoaded = true;
    } else {
      console.error('Google Maps object is not available after script load');
      setHasError(true);
    }
  };
  
  const handleScriptError = () => {
    console.error('Failed to load Google Maps API script');
    setHasError(true);
    
    // Dispatch an error event
    const googleMapsErrorEvent = new CustomEvent('google-maps-error', {
      detail: { error: 'Failed to load Google Maps API script' }
    });
    window.dispatchEvent(googleMapsErrorEvent);
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="afterInteractive"
      />
      {hasError && (
        <div className="hidden">
          {/* This div is hidden but will be logged in React DevTools */}
          Google Maps API Error - Check console for details
        </div>
      )}
    </>
  );
} 