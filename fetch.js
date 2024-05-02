//Fetch event
self.addEventListener('fetch', evt =>{
    // console.log(evt);
     evt.respondWith(
         caches.match(evt.request).then(cacheRes => {
             return cacheRes || fetch(evt.request).then(fetchRes =>{
                 return caches.open(dynamicCacheName).then(cache =>{
                     cache.put(evt.request.url, fetchRes.clone())
                     limitCacheSize(dynamicCacheName, 75);
                     return fetchRes;
                 })
             });
         }).catch(() => {
             if(evt.request.url.indexOf('.php') > -1) {
                 return caches.match('default.php')
             }
         })
     );
 });


//Fetch event
self.addEventListener('fetch', evt => {
    // console.log(evt);
   // check if request is made by chrome extensions or web page
   // if request is made for web page url must contains http.
   if (!(evt.request.url.startsWith('http'))) return; // Skip requests not made with http protocol

    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || evt.request;
        }).catch(() => {
            if (evt.request.url.indexOf('.php') > -1) {
                return caches.match('default.php'); // Fallback to default.php if not found in cache
            }
        })
    );
  
});


// Fetch event
self.addEventListener('fetch', evt => {
    // Check if the request is made by an iframe
    if (evt.request.mode === 'navigate' && evt.request.destination === 'document') {
        // Get the origin of the iframe src
        const iframeOrigin = new URL(evt.request.referrer).origin;

        // Iterate through all service workers
        evt.waitUntil(
            caches.keys().then(async keys => {
                for (const key of keys) {
                    const cache = await caches.open(key);
                    const cacheKeys = await cache.keys();
                    for (const cacheKey of cacheKeys) {
                        // Check if the service worker origin matches the iframe origin
                        if (cacheKey.url.startsWith(iframeOrigin)) {
                            // Respond with the cached resource
                            evt.respondWith(
                                caches.match(evt.request).then(cacheRes => {
                                    return cacheRes;
                                }).catch(() => {
                                    if (evt.request.url.indexOf('.php') > -1) {
                                        return caches.match('default.php'); // Fallback to default.php if not found in cache
                                    }
                                })
                            );
                        }
                    }
                }
            })
        );
    }
});

