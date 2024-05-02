//check if service worker is supported
if('serviceWorker' in navigator){
    
    navigator.serviceWorker.register('swfurni.js')
    .then((reg) => console.log('service worker registeredfurni', reg))
    .catch((reg) => console.log('service worker not registered', err))
}