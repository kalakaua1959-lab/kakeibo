'use strict';
const PREFIX='kakeibo-shell-';
const CACHE=PREFIX+'20261115-2';
const HOME=new URL('./index.html',self.registration.scope).href;
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll([new Request(HOME,{cache:'reload'})]);
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),base=new URL(self.registration.scope);
 // Only the app shell is cached. Future API responses and other sites pass through.
 if(event.request.method!=='GET'||url.origin!==base.origin||
    ![base.pathname,base.pathname+'index.html'].includes(url.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(event.request);
   if(response.ok&&response.headers.get('content-type')?.includes('text/html')){
    await cache.put(HOME,response.clone());return response;
   }
   return (await cache.match(HOME))||response;
  }catch(error){
   const saved=await cache.match(HOME);if(saved)return saved;throw error;
  }
 })());
});
