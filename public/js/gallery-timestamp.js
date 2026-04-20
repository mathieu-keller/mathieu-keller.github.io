/**
 * Convert UTC timestamps to local time in gallery cards
 */
function initializeGalleryTimestamps() {
  const timeElements = document.querySelectorAll('[data-utc-time]');
  
  timeElements.forEach(element => {
    const utcTimeString = element.dataset.utcTime;
    
    try {
      // Parse the UTC time string (format: YYYY-MM-DDTHH:MM:SSZ)
      const utcDate = new Date(utcTimeString);
      
      if (!isNaN(utcDate.getTime())) {
        // Get local time options
        const options = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        };
        
        // Format the time in local timezone
        const localTime = utcDate.toLocaleString(undefined, options);
        element.textContent = localTime;
        element.dateTime = utcDate.toISOString();
      }
    } catch (error) {
      console.error('Error converting UTC time:', utcTimeString, error);
    }
  });
}

// Initialize on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGalleryTimestamps);
} else {
  initializeGalleryTimestamps();
}

