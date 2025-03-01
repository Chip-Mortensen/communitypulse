'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIssueStore } from '@/store/issueStore';
import { Database } from '@/types/supabase';
import { getAddressFromCoordinates, getCoordinatesFromAddress } from '@/services/geocoding';
import { useAuth } from '@/hooks/useAuth';

// Define types directly from the Supabase generated types
type Issue = Database['public']['Tables']['issues']['Row'];
type IssueInsert = Database['public']['Tables']['issues']['Insert'];

const issueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  address: z.string().min(5, 'Address is required'),
  category: z.string().min(1, 'Please select a category'),
});

type IssueFormData = z.infer<typeof issueSchema>;

export type IssueFormProps = {
  initialLocation?: { lat: number; lng: number } | null;
  initialAddress?: string;
  onSuccess?: (issue: Issue) => void;
  onCancel?: () => void;
  isMapMode?: boolean;
  isAddressLoading?: boolean;
};

// Add type declaration for Google Maps
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: {
              types?: string[];
              fields?: string[];
            }
          ) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => {
              formatted_address?: string;
              geometry?: {
                location: {
                  lat: () => number;
                  lng: () => number;
                };
              };
            };
          };
        };
      };
    };
  }
}

export default function IssueForm({
  initialLocation = null,
  initialAddress = '',
  onSuccess,
  onCancel,
  isMapMode = false,
  isAddressLoading = false,
}: IssueFormProps) {
  const { createIssue, isLoading, error } = useIssueStore();
  const { userId, isAuthenticated } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(initialLocation);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      address: initialAddress,
    },
  });

  const watchedAddress = watch('address');

  // Set initial address if provided
  useEffect(() => {
    if (initialAddress) {
      console.log('Setting initial address:', initialAddress);
      setValue('address', initialAddress);
    }
  }, [initialAddress, setValue]);

  // Update address when it changes (important for when geocoding completes)
  useEffect(() => {
    if (initialAddress && initialAddress !== watchedAddress) {
      console.log('Updating address from prop:', initialAddress);
      setValue('address', initialAddress);
    }
  }, [initialAddress, setValue, watchedAddress]);

  // Get user's location if in standalone mode and no initial location is provided
  useEffect(() => {
    if (!isMapMode && !location && !initialLocation && navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLocation);
          
          // Get address from coordinates
          getAddressFromCoordinates(newLocation.lat, newLocation.lng)
            .then(address => {
              if (address) {
                setValue('address', address);
              }
            })
            .finally(() => {
              setIsGettingLocation(false);
            });
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
        }
      );
    }
  }, [isMapMode, location, initialLocation, setValue]);

  // Update coordinates when address changes (if not in map mode)
  useEffect(() => {
    if (!isMapMode && watchedAddress && watchedAddress.length > 5) {
      const timer = setTimeout(() => {
        getCoordinatesFromAddress(watchedAddress)
          .then(coords => {
            if (coords) {
              setLocation(coords);
            }
          });
      }, 1000); // Debounce for 1 second
      
      return () => clearTimeout(timer);
    }
  }, [watchedAddress, isMapMode]);

  // Listen for Google Maps ready event
  useEffect(() => {
    if (!isMapMode) {
      console.log('Setting up Google Maps ready event listener');
      
      const handleGoogleMapsReady = () => {
        console.log('Received google-maps-ready event');
        if (autocompleteInputRef.current) {
          console.log('Initializing autocomplete after receiving ready event');
          try {
            // Use type assertion to avoid TypeScript errors
            // @ts-ignore - Google Maps API types
            const autocomplete = new window.google.maps.places.Autocomplete(autocompleteInputRef.current, {
              types: ['address'],
              fields: ['formatted_address', 'geometry']
            });
            
            console.log('Autocomplete initialized successfully via event');
            
            autocomplete.addListener('place_changed', () => {
              console.log('Place changed event triggered');
              const place = autocomplete.getPlace();
              
              if (place.geometry && place.geometry.location) {
                const newLocation = {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                };
                
                setLocation(newLocation);
                
                if (place.formatted_address) {
                  setValue('address', place.formatted_address);
                }
              }
            });
            
            // Prevent form submission on enter key in the autocomplete field
            autocompleteInputRef.current.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            });
          } catch (error) {
            console.error('Error initializing Google Places Autocomplete via event:', error);
          }
        }
      };
      
      // Check if Google Maps is already loaded (might have loaded before this component mounted)
      // @ts-ignore - Google Maps global variables
      if (window.googleMapsLoaded && window.google && window.google.maps && window.google.maps.places) {
        console.log('Google Maps already loaded, initializing immediately');
        handleGoogleMapsReady();
      } else {
        // Otherwise listen for the event
        window.addEventListener('google-maps-ready', handleGoogleMapsReady);
      }
      
      return () => {
        window.removeEventListener('google-maps-ready', handleGoogleMapsReady);
      };
    }
  }, [isMapMode, setValue, autocompleteInputRef.current]);

  const onSubmit = async (data: IssueFormData) => {
    // Generate a random UUID for the user_id if not authenticated
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    if (!location) {
      // If no location but we have an address, try to get coordinates one more time
      if (data.address && data.address.length > 5) {
        try {
          const coords = await getCoordinatesFromAddress(data.address);
          if (coords) {
            setLocation(coords);
            
            // Continue with form submission using the newly obtained coordinates
            const issueData: IssueInsert = {
              ...data,
              location: coords,
              status: 'open',
              user_id: userId || generateUUID(),
              image_url: null,
            };
            
            const newIssue = await createIssue(issueData);
            
            if (newIssue && onSuccess) {
              onSuccess(newIssue);
            }
            return;
          }
        } catch (error) {
          console.error('Error getting coordinates from address:', error);
          alert('Could not determine location from address. Please try a different address or allow location access.');
          return;
        }
      }
      
      alert('Location is required. Please allow location access or enter a valid address.');
      return;
    }

    const issueData: IssueInsert = {
      ...data,
      location: location,
      status: 'open',
      user_id: userId || generateUUID(), // Use the authenticated user's ID if available, otherwise generate a UUID
      image_url: null,
    };

    const newIssue = await createIssue(issueData);
    
    if (newIssue && onSuccess) {
      // Call onSuccess immediately without delay
      onSuccess(newIssue);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
          <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Issue Title
        </label>
        <input
          id="title"
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="E.g., Pothole on Main Street"
          {...register('title')}
        />
        {errors.title && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.title.message}
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
          <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="Describe the issue in detail..."
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.description.message}
          </p>
        )}
      </div>
      
      {!isMapMode && (
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location Address
          </label>
          <div className="relative">
            <input
              id="address"
              type="text"
              className={`w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                isAddressLoading ? 'bg-gray-50' : ''
              }`}
              placeholder={isAddressLoading ? 'Getting address...' : 'Enter the address or location description'}
              {...register('address', {
                setValueAs: (value) => value,
                onChange: (e) => {
                  // This is needed to ensure the value is updated in react-hook-form
                  return e.target.value;
                }
              })}
              disabled={isAddressLoading} // Only disable when loading address
              ref={(e) => {
                // This handles both react-hook-form's ref and our autocomplete ref
                register('address').ref(e);
                autocompleteInputRef.current = e;
              }}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {isAddressLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
              </div>
            )}
          </div>
          {errors.address && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.address.message}
            </p>
          )}
          {!errors.address && (
            <p className="mt-1.5 text-xs text-gray-500 flex items-center">
              <svg className="w-3.5 h-3.5 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start typing to see address suggestions
            </p>
          )}
        </div>
      )}
      
      {/* Hidden input for map mode to store the address value */}
      {isMapMode && (
        <input type="hidden" {...register('address')} />
      )}
      
      {!isMapMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Location
          </label>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
            {isGettingLocation ? (
              <div className="flex items-center text-blue-800">
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
                <p className="text-sm">Getting your location...</p>
              </div>
            ) : location ? (
              <div className="flex items-start text-blue-800">
                <svg className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-sm">
                  <p>Location coordinates: <span className="font-medium">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span></p>
                  <p className="text-xs text-blue-600 mt-1">Coordinates are automatically updated when you select an address</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-yellow-800">
                <svg className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm">
                  No location detected. Please enter an address or allow location access.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
          <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Category
        </label>
        <div className="relative">
          <select
            id="category"
            className="w-full appearance-none pl-9 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            {...register('category')}
          >
            <option value="">Select a category</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Safety">Safety</option>
            <option value="Environment">Environment</option>
            <option value="Public Services">Public Services</option>
            <option value="Other">Other</option>
          </select>
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.category && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.category.message}
          </p>
        )}
      </div>
      
      <div className="flex space-x-4 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 flex justify-center items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        )}
        
        <button
          type="submit"
          disabled={isLoading || (!location && (!watchedAddress || watchedAddress.length < 5))}
          className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 flex justify-center items-center ${
            (isLoading || (!location && (!watchedAddress || watchedAddress.length < 5))) ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
              Submitting...
            </span>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Submit Issue
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 flex items-start">
          <svg className="w-5 h-5 mr-2 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </form>
  );
} 