'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import PageContainer from '@/components/PageContainer';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';

// Use types directly from the generated Supabase types
type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Define a location type for better type safety
type LocationCoords = {
  lat: number;
  lng: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileUpdate>({});

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile');
        setLoading(false);
        return;
      }
      
      setProfile(data);
      setFormData({
        full_name: data.full_name,
        display_name: data.display_name,
        bio: data.bio,
        city: data.city,
        location: data.location,
        avatar_url: data.avatar_url,
      });
      setLoading(false);
    }
    
    loadProfile();
  }, [router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    const updateData: ProfileUpdate = {
      full_name: formData.full_name,
      display_name: formData.display_name,
      bio: formData.bio,
      city: formData.city,
      location: formData.location,
      avatar_url: formData.avatar_url,
      updated_at: new Date().toISOString(),
    };
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);
    
    if (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
      setSaving(false);
      return;
    }
    
    // Refresh profile data
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setProfile(data);
    setSaving(false);
  };
  
  const updateLocationAndCity = async (position: GeolocationPosition) => {
    const locationData: LocationCoords = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    
    try {
      // Call our geocoding API to get the city
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to geocode location');
      }
      
      const geocodeData = await response.json();
      
      // Update form data with location and verified city
      setFormData(prev => ({ 
        ...prev, 
        location: locationData,
        city: geocodeData.city || prev.city
      }));
      
    } catch (error) {
      console.error('Error verifying location:', error);
      setError('Failed to verify your location. Your coordinates were saved, but city verification failed.');
      
      // Still update the location even if city verification fails
      setFormData(prev => ({ 
        ...prev, 
        location: locationData 
      }));
    }
  };
  
  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto py-8 px-6">
        <h1 className="text-2xl font-bold mb-8">Your Profile</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Top Section: Profile Picture and Bio */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              {/* Profile Picture Column - Flush Left */}
              <div className="md:w-auto flex-shrink-0">
                <div className="w-40 h-40">
                  <ProfilePictureUpload
                    userId={profile?.id || ''}
                    currentAvatarUrl={profile?.avatar_url || null}
                    onUploadComplete={(url) => {
                      // Update the avatar URL in the form data
                      setFormData(prev => ({ ...prev, avatar_url: url }));
                    }}
                  />
                </div>
              </div>
              
              {/* Bio Column */}
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md max-h-32 overflow-y-auto"
                  placeholder="Tell us a bit about yourself..."
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">Share your interests and background with the community</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mt-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Details</h3>
              
              {/* Middle Section: Email, Full Name, Display Name */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-sm text-gray-500">This is how your name will appear to others</p>
                </div>
              </div>
              
              {/* Bottom Section: City and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      placeholder="Update your location to verify city"
                    />
                    {formData.city && (
                      <span className="absolute right-3 top-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Automatically verified based on your location
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            updateLocationAndCity,
                            (error) => {
                              console.error('Error getting location:', error);
                              setError('Failed to get your location. Please try again.');
                            }
                          );
                        } else {
                          setError('Geolocation is not supported by your browser.');
                        }
                      }}
                      className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200 flex items-center"
                    >
                      <svg 
                        className="w-5 h-5 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                        />
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                        />
                      </svg>
                      Update My Location
                    </button>
                    {formData.location && (
                      <span className="ml-3 text-sm text-gray-600">
                        Location updated
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">This is used to verify your city and is not shared publicly</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {profile && (
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Account Statistics</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-sm text-gray-500 mb-3">Reputation</p>
                <p className="text-3xl font-bold">{profile.reputation_score}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-sm text-gray-500 mb-3">Issues Reported</p>
                <p className="text-3xl font-bold">{profile.issues_reported}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-sm text-gray-500 mb-3">Issues Resolved</p>
                <p className="text-3xl font-bold">{profile.issues_resolved}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-sm text-gray-500 mb-3">Member Since</p>
                <p className="text-3xl font-bold">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
} 