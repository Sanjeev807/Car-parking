# Smart Parking Frontend (Integration-Ready)

## File Structure

- src/App.js: Main app orchestrator (booking -> dashboard flow)
- src/components/BookingForm.js: Booking UI and user input handling
- src/components/SmartParkingDashboard.js: Base map + dynamic slot overlays
- src/data/parkingGridData.json: Backend-compatible grid payload schema
- src/assets/image_12.png: Base map reference image

## Integration Notes

1. Replace mocked parking data import in SmartParkingDashboard with:
   - fetch('/api/parking-grid') for REST
   - or Socket.io subscription for live updates

2. Keep JSON shape compatible with parkingGridData.json:
   - slotId
   - position
   - status
   - carModel (for occupied)
   - availabilityCount (for free)

3. Replace base image with actual 3D scene when ready:
   - Swap <img> with React Three Fiber <Canvas>
   - Reuse the overlay data mapping logic from SmartParkingDashboard

4. Booking API integration:
   - In App.js handleBookingSubmit, call backend booking endpoint before switching view.

5. Styling:
   - BookingForm.css and SmartParkingDashboard.css contain glassmorphism layout and overlay positioning.
