/**
 * Geocoding service for converting between coordinates and addresses
 * Uses Google's Geocoding API
 */

/**
 * Convert coordinates to an address
 * @param lat Latitude
 * @param lng Longitude
 * @returns Formatted address string
 */
export async function getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
  console.log('Getting address for coordinates:', lat, lng);
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    console.log('Geocoding API URL (without key):', url.split('&key=')[0]);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Geocoding API response status:', data.status);
    
    if (data.status === 'OK' && data.results.length > 0) {
      const address = data.results[0].formatted_address;
      console.log('Found address:', address);
      return address;
    }
    
    console.warn('No address found or API error:', data.status, data.error_message || '');
    return '';
  } catch (error) {
    console.error('Error geocoding coordinates:', error);
    return '';
  }
}

/**
 * Convert an address to coordinates
 * @param address Address string
 * @returns Object with lat and lng properties, or null if geocoding failed
 */
export async function getCoordinatesFromAddress(address: string): Promise<{lat: number, lng: number} | null> {
  console.log('Getting coordinates for address:', address);
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    console.log('Geocoding API URL (without key):', url.split('&key=')[0]);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Geocoding API response status:', data.status);
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log('Found coordinates:', location);
      return { lat: location.lat, lng: location.lng };
    }
    
    console.warn('No coordinates found or API error:', data.status, data.error_message || '');
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
} 