//console.log('service worker inside sw.js');

const cacheName = "app-shell-rsrs-v4";
const dynamicCacheName = "dynamic-cache-v4";

const assets = [
    '/',
    'index.php',
    'js/app.js',
    'js/bootstrap.bundle.min.js',
    'js/tiny-slider.js',
    'js/custom.js',
    'css/style.css',
    'css/tiny-slider.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2',
    'default.php'

];

// cache size limit function
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > size){
                cache.delete(keys[0]).then(limitCacheSize(name, size))
            }
        })
    })
}


//install service worker
self.addEventListener('install', evt =>{
    console.log('service worker has been installed.');
    evt.waitUntil(
         caches.open(cacheName).then(cache =>{
             cache.addAll(assets);
         })
    );
   
 });

 // Activate service worker
self.addEventListener('activate', evt => {
    evt.waitUntil(
        // Open the cache storage and get all cache keys
        caches.keys().then(keys => {
            // Iterate through each key
            return Promise.all(keys.map(key => {
                // If the key is not the current cacheName, delete it
                if (key !== cacheName) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

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
 
 // Update service worker on reload
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
