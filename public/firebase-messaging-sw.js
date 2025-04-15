importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');


// Configuration
const CONFIG = {
  STAGING:{
    apiKey: "AIzaSyB63o4ZyELY5IPMspc7VyoSgFrF6qoS4ng",
    authDomain: "elitefit-app.firebaseapp.com",
    projectId: "elitefit-app",
    storageBucket: "elitefit-app.appspot.com",
    messagingSenderId: "88115633531",
    appId: "1:88115633531:web:ddb803a489c00dd60cf1de",
    measurementId: "G-Y4YY3Z3P70"
  },
  PRODUCTION: {
    apiKey: "AIzaSyCmECPyXl7U9L9AEEbRrZ-mlbAfo3c0IlA",
    authDomain: "elitefit-prod.firebaseapp.com",
    projectId: "elitefit-prod",
    storageBucket: "elitefit-prod.appspot.com",
    messagingSenderId: "471722588862",
    appId: "1:471722588862:web:cb7d250969b1cf32a33cef",
    measurementId: "G-MWXSVB4VRK"
  }
};

// Environment detection
const isProd = self.location.hostname.includes('elitefitforyou.com');
const firebaseConfig = isProd ? CONFIG.PRODUCTION : CONFIG.STAGING;

// Initialize Firebase
let messaging;
try {
  const app = firebase.initializeApp(firebaseConfig);
  messaging = app.messaging();
  console.log('Firebase messaging initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

// Cache version and name
const CACHE_VERSION = 'v1';
const CACHE_NAME = `elitefitforyou-${CACHE_VERSION}`;

// Install event - cache essential resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        // Add other static assets you want to cache
      ]);
    }).then(() => {
      console.log('Service worker installed successfully');
      return self.skipWaiting();
    }).catch(error => {
      console.error('Cache installation failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('elitefitforyou-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service worker activated successfully');
      return self.clients.claim();
    }).catch(error => {
      console.error('Cache activation failed:', error);
    })
  );
});

// Background message handler
if (messaging) {
  messaging.onBackgroundMessage(payload => {
    console.log('Received background message:', payload);
    
    try {
      // Parse message data
      if (!payload?.data?.body) {
        throw new Error('Invalid message payload');
      }
      
      const messageDetails = JSON.parse(payload.data.body);
      
      // Handle notifications
      if (messageDetails?.type === 'push-notification') {
        const notificationTitle = messageDetails.message || 'New Notification';
        const notificationOptions = {
          body: messageDetails.message || '',
          icon: messageDetails.icon || '/icon.png',
          badge: '/badge.png',
          data: {
            url: messageDetails?.url || '/',
            notificationId: messageDetails?.notificationId,
            recipientId: messageDetails?.recipientId,
            timestamp: Date.now()
          },
          actions: [
            {
              action: 'view',
              title: 'View Details'
            }
          ]
        };
        
        // Show the notification
        self.registration.showNotification(notificationTitle, notificationOptions)
          .then(() => {
            // Update notification status to 'delivered'
            if (messageDetails?.notificationId && messageDetails?.recipientId) {
              return updateNotificationStatus(messageDetails, 'delivered');
            }
          })
          .catch(error => {
            console.error('Failed to show notification:', error);
          });
      }
      
      // Forward the message to all clients (visible or hidden)
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
        clients.forEach(client => {
          if (client.visibilityState === 'hidden') {
            client.postMessage(payload);
          }
        });
      });
    } catch (error) {
      console.error('Error processing background message:', error);
    }
  });
}

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  try {
    // Close the notification
    event.notification.close();
    
    // Get the notification data
    const notificationData = event.notification.data;
    
    // Handle the click event based on which action was clicked
    const targetUrl = notificationData?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ 
        type: 'window', 
        includeUncontrolled: true 
      }).then(windowClients => {
        // Try to find an existing window with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          
          // If we find a matching client, focus it and post a message
          if (targetUrl && client.url.includes(targetUrl)) {
            return client.focus().then(focusedClient => {
              focusedClient.postMessage({
                type: 'NOTIFICATION_CLICKED',
                notificationData
              });
              return;
            });
          }
        }
        
        // If no matching client is found, open a new window
        if (windowClients.length > 0) {
          // If we have any client, post a message to the first one
          windowClients[0].postMessage({
            type: 'NOTIFICATION_CLICKED',
            notificationData
          });
        }
        
        // Open a new window with the target URL
        return clients.openWindow(targetUrl);
      })
    );
  } catch (error) {
    console.error('Error handling notification click:', error);
  }
});






