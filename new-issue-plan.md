Based on my analysis of the codebase, here's a comprehensive plan to implement the drag-and-drop issue reporting feature using the sidebar:

# Implementation Plan: Drag-and-Drop Issue Reporting with Sidebar

## Overview

We'll create a true drag-and-drop interface on the map page that allows users to drag the "Report an Issue" button directly onto the map to place a marker and report an issue. This will reuse the existing issue form but adapt it to work in a sidebar with location data from the map.

## Required Google APIs

1. **Geocoding API** (already enabled) - For converting coordinates to addresses ✅
2. **Places API** - For address autocomplete and place details (future enhancement)

Note: We don't need Google Maps JavaScript API since we're using Mapbox for our map implementation. We'll leverage Mapbox's built-in functionality for map interactions.

## Implementation Steps

### Phase 1: Create Geocoding Service ✅

1. **Create a geocoding service utility** ✅
   - Created a new file `src/services/geocoding.ts` to handle:
     - Forward geocoding (address to coordinates)
     - Reverse geocoding (coordinates to address)
   - This uses the Google Geocoding API

```typescript
// src/services/geocoding.ts
export async function getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return '';
  } catch (error) {
    console.error('Error geocoding coordinates:', error);
    return '';
  }
}

export async function getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}
```

### Phase 2: Modify the Issue Form Component ✅

2. **Create a reusable issue form component** ✅

   - Extracted the form from `new-issue/page.tsx` into a reusable component `src/components/IssueForm.tsx`
   - Made it work with both manual address input and map-based location selection
   - Added props for initial location, address, success callback, cancel callback, and map mode

3. **Update the form to handle both address input and map coordinates** ✅
   - Modified the form to accept location data in different ways:
     - From user's current location (existing functionality)
     - From map marker placement (new functionality)
     - From manual address input with geocoding
   - Added debounced geocoding for address input when not in map mode

### Phase 3: Implement True Drag-and-Drop on Map ✅

4. **Create a draggable "Report an Issue" button** ✅

   - Implemented a custom draggable button that users can drag onto the map
   - Used HTML5 Drag and Drop API for cross-browser compatibility
   - Added visual feedback during dragging (shadow, opacity changes)
   - Added fallback click functionality for mobile devices

5. **Handle drop events on the map** ✅
   - Captured the drop coordinates when the button is released over the map
   - Converted screen coordinates to map coordinates
   - Created a marker at the drop location
   - Got the address using the geocoding service
   - Opened the issue creation sidebar with the location data

### Phase 4: Create Issue Creation Sidebar ✅

6. **Implement the issue creation sidebar** ✅
   - Created a new component `IssueCreationSidebar.tsx` to handle issue creation
   - Integrated with the issue form component
   - Added animations for a smooth user experience
   - Handled form submission and closing the sidebar

### Phase 5: Update the New Issue Page ✅

7. **Update the standalone new issue page** ✅
   - Modified to use the reusable form component
   - Simplified the page by removing duplicate code
   - Maintained the same functionality with the reusable component

### Phase 6: Enable Google APIs and Update Environment ✅

8. **Enable additional Google APIs** ✅

   - Enabled Geocoding API
   - No need for Places API at this stage (can be added later for address autocomplete)

9. **Update environment variables** ✅
   - Ensured `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set correctly
   - Used the `NEXT_PUBLIC_` prefix to make the API key available to client-side code

### Phase 7: Testing and Refinement ✅

10. **Test the implementation** ✅

    - Tested on different devices and screen sizes
    - Ensured the form works correctly in both contexts
    - Verified geocoding works in both directions
    - Added debugging logs to help identify issues
    - Added fallback click functionality for mobile devices

11. **Refine the user experience** ✅
    - Added loading states during geocoding
    - Improved error handling
    - Added animations for smooth transitions
    - Added visual indicators when dragging (dashed border, instructions)
    - Improved accessibility with titles and clear instructions

## Implementation Details

### Drag and Drop Implementation

We implemented a true drag-and-drop experience using the HTML5 Drag and Drop API:

1. **Draggable Button**:

   - Created a button with the `draggable="true"` attribute
   - Added event handlers for `onDragStart` and `onDragEnd`
   - Used a canvas to create a custom drag image
   - Added a fallback div-based drag image for browsers that don't support canvas
   - Added visual feedback during dragging (opacity change, scale reduction)

2. **Drop Target**:

   - Made the map container a drop target with `onDragOver` and `onDrop` handlers
   - Added a visual indicator when dragging over the map (dashed border animation)
   - Added instructions that appear when dragging

3. **Coordinate Conversion**:

   - Converted screen coordinates to map coordinates using Mapbox's `unproject` method
   - Used the geocoding service to get the address for the dropped location

4. **Fallback for Mobile**:
   - Added a click handler to the button for mobile devices
   - Used the user's current location or map center when clicked

### Visual Enhancements

1. **Drag Indicator**:

   - Added a dashed border around the map when dragging
   - Used CSS animations to make the border pulse
   - Added a bounce animation to the instructions

2. **Feedback Messages**:

   - Added loading state when getting the address
   - Added clear instructions for each step of the process

3. **Accessibility**:
   - Added title attributes to explain the functionality
   - Made the button text clearer ("Drag or Click to Report")

## Future Enhancements

1. **Add address autocomplete** - Integrate Google Places API for better address input
2. **Improve mobile experience** - Further optimize the touch experience
3. **Add image upload** - Allow users to upload images of the issue
4. **Add validation for coordinates** - Ensure the coordinates are within a valid range
5. **Add user feedback** - Show success messages and improve error handling
6. **Add analytics** - Track how users are creating issues (drag-and-drop vs. click vs. standalone form)
