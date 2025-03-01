import { NextRequest, NextResponse } from 'next/server';

// Define the response type for the Google Maps Geocoding API
interface GeocodingResult {
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
  types: string[];
}

interface GeocodingResponse {
  results: GeocodingResult[];
  status: string;
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Get Google Maps API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log(`Geocoding coordinates: ${lat}, ${lng}`);
    
    // Call Google Maps Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );

    if (!response.ok) {
      console.error(`Geocoding API HTTP error: ${response.status} ${response.statusText}`);
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }

    const data: GeocodingResponse = await response.json();
    console.log(`Geocoding API response status: ${data.status}`);

    if (data.status !== 'OK') {
      console.error(`Geocoding API returned non-OK status: ${data.status}`, data.results);
      throw new Error(`Geocoding failed with status: ${data.status}`);
    }

    // Extract city information
    let city = null;
    let state = null;
    let country = null;

    if (data.results && data.results.length > 0) {
      // Look through address components to find the city (locality)
      for (const component of data.results[0].address_components) {
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (component.types.includes('country')) {
          country = component.long_name;
        }
      }
    }

    return NextResponse.json({
      city,
      state,
      country,
      formatted_address: data.results[0]?.formatted_address
    });
  } catch (error) {
    console.error('Error in geocoding API:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred during geocoding';
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 