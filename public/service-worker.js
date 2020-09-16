'use strict';

const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  "index.html",
  "./styles.css",
  "index.js",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
  "db.js"
];

self.addEventListener('install', function(evt) {
  // Perform install steps
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(keylist => {
      return Promise.all(
        keylist.map(key => {
          if (key !== CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
    self.clients.claim();
});

// self.addEventListener("fetch", function(event) {
//   if(event.request.url.includes("/api/")) {
//   event.respondWith(
//     caches.open(CACHE_NAME).then(cache => {
//       return fetch(event.request).then(response => {
//         if (response.status === 200) {
//           cache.put(event.request.url, response.clone());
//         }
//         return response;
//       })
//       .catch(err => {
//         return cache.match(event.request);
//       });
//     }).catch(err => console.log(err))
//   );

//   return;
//   }

//   event.respondWith(
//     fetch(event.target).catch(function() {
//       return caches.match(event.request).then(function(response) {
//         if (response) return response;
//         else if (event.request.headers.get('accept').includes('text/html')) {
//           return caches.match('/');
//         }
//       })
//     })
//   );
// });



self.addEventListener('fetch', function(event) {

if (event.request.url.includes("/api/")) {
    event.respondWith(
        caches.match(event.request)
          .then(function(response) {
            // Cache hit - return response
            if (response) {
              return response;
            }
    
            return fetch(event.request).then(
              function(response) {
                // Check if we received a valid response
                if(!response || response.status !== 200 || response.type !== 'basic') {
                  return response;
                }
    
                // IMPORTANT: Clone the response. A response is a stream
                // and because we want the browser to consume the response
                // as well as the cache consuming the response, we need
                // to clone it so we have two streams.
                var responseToCache = response.clone();
    
                caches.open(CACHE_NAME)
                  .then(function(cache) {
                    cache.put(event.request, responseToCache);
                  });
    
                return response;
              }
            );
          })
        );
    }
});