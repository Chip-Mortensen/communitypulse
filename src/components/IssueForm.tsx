'use client';

import { useState, useEffect } from 'react';
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

  const onSubmit = async (data: IssueFormData) => {
    if (!location) {
      alert('Location is required. Please allow location access or enter a valid address.');
      return;
    }

    // Generate a random UUID for the user_id if not authenticated
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const issueData: IssueInsert = {
      ...data,
      location: location,
      status: 'open',
      user_id: userId || generateUUID(), // Use the authenticated user's ID if available, otherwise generate a UUID
      image_url: null,
    };

    const newIssue = await createIssue(issueData);
    
    if (newIssue && onSuccess) {
      onSuccess(newIssue);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
          Issue Title
        </label>
        <input
          id="title"
          type="text"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
          Location Address
        </label>
        <div className="relative">
          <input
            id="address"
            type="text"
            className={`w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              isAddressLoading ? 'bg-gray-50' : ''
            }`}
            placeholder={isAddressLoading ? 'Getting address...' : 'Enter the address or location description'}
            {...register('address')}
            disabled={isMapMode || isAddressLoading} // Disable manual address input in map mode or when loading
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
      </div>
      
      {!isMapMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Location
          </label>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
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
                <p className="text-sm">
                  Location coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
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
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
          Category
        </label>
        <div className="relative">
          <select
            id="category"
            className="w-full appearance-none pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
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
      
      <div className="flex space-x-4 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
        )}
        
        <button
          type="submit"
          disabled={isLoading || (!isMapMode && !location)}
          className={`w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
            (isLoading || (!isMapMode && !location)) ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
              Submitting...
            </span>
          ) : (
            'Submit Issue'
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