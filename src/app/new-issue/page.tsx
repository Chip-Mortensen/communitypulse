'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIssueStore } from '@/store/issueStore';
import { Database } from '@/types/supabase';
import PageContainer from '@/components/PageContainer';

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

export default function NewIssuePage() {
  const router = useRouter();
  const { createIssue, isLoading, error } = useIssueStore();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
  });

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const onSubmit = async (data: IssueFormData) => {
    if (!userLocation) {
      alert('Location is required. Please allow location access.');
      return;
    }

    const issueData: IssueInsert = {
      ...data,
      location: userLocation,
      status: 'open',
      user_id: 'current-user', // In a real app, this would be the current user's ID
      image_url: null, // Add the image_url field with null value
    };

    const newIssue = await createIssue(issueData);
    
    if (newIssue) {
      router.push(`/issues/${newIssue.id}`);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Report a New Issue</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Issue Title
            </label>
            <input
              id="title"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="E.g., Pothole on Main Street"
              {...register('title')}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the issue in detail..."
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Location Address
            </label>
            <input
              id="address"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the address or location description"
              {...register('address')}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="bg-gray-100 p-3 rounded-md">
              {userLocation ? (
                <p className="text-sm text-gray-600">
                  Your location: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </p>
              ) : (
                <p className="text-sm text-yellow-600">
                  Waiting for location... Please allow location access when prompted.
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              {...register('category')}
            >
              <option value="">Select a category</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Safety">Safety</option>
              <option value="Environment">Environment</option>
              <option value="Public Services">Public Services</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading || !userLocation}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                (isLoading || !userLocation) ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Submitting...' : 'Submit Issue'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
} 