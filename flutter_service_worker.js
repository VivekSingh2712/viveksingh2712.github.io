'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "07e1bbe4263e3086d7c3845fb7436720",
"index.html": "f1fe6b7dbe43963f1b60dda4ee84b9ea",
"/": "f1fe6b7dbe43963f1b60dda4ee84b9ea",
"main.dart.js": "e092c883faef0feca625a43fc701ea8f",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "aad4ef2372eca49e4024f6be062769c9",
"assets/AssetManifest.json": "8cf63f0e526ba08c1b7afdb4e960c9ac",
"assets/NOTICES": "4588d417ad8643ae1ea7e2092e033ed1",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/assets/images/other/download_icon.png": "dc954f59adf3ff725d039bf089b80cc8",
"assets/assets/images/other/verticle_line.png": "91357a407c191797d307d1e3bfe44854",
"assets/assets/images/other/dash_line.png": "eb8545c9a8f7c91871421b6fa1f60405",
"assets/assets/images/other/arrow_up.png": "e9c13bb9495996dd2fb27cc7a353cae1",
"assets/assets/images/other/search.png": "ec3aa73df03ecdcec05e494bf45cb032",
"assets/assets/images/other/avatar.png": "0bc852eafe09f0c6a9ac4101c4c05ee2",
"assets/assets/images/other/logo.png": "6af4c7c94cf9b0cd8dc783382981245c",
"assets/assets/images/other/bell_icon.png": "23720b47177bc2fba15e66c05f52aa98",
"assets/assets/images/other/arrow_dropdown.png": "65a4f644c4a5c03bcd2557b6255000f1",
"assets/assets/images/other/arrow_down.png": "ab1c629411c0dd76b7049b895f5f275c",
"assets/assets/images/menu/collapsible_condition.png": "97aa2270b2f0afca999ab3eba7a2c45d",
"assets/assets/images/menu/collapsible_icon.png": "d20480d78020aa8f0c800a1dfeea613b",
"assets/assets/images/menu/collapsible_programs.png": "c127bf68ae7c11bd09e6ce21b86383f9",
"assets/assets/images/menu/collapsible_scenario.png": "93de73c36e79c8713a2782ff0cd40dc9",
"assets/assets/images/menu/collapsible_forms.png": "d4d02644011b66b17742a9ee8ba73bd3",
"assets/assets/images/menu/collapsible_underwriting.png": "9898eaee7261df94d4dcdd3491c1f6bb",
"assets/assets/images/menu/collapsible_loan_file_modules.png": "c98df459915ea9a77f77cde5352d6340",
"assets/assets/images/menu/collapsible_dashboard.png": "fad482a740f827acc41a0080e32cc66e",
"assets/assets/images/menu/collapsible_application.png": "2bc9d75e11ab5bcbc0296d3827a8b2ca",
"assets/assets/images/menu/collapsible_pipeline.png": "d0cbd11618dd5bf232b2e6f7957aa510",
"assets/assets/images/menu/collapsible_application_forms.png": "73bc880014dc9046a9f963cd9c659681",
"assets/assets/images/menu/collapsible_client.png": "f4ba2b571a3eab889b5094b40759f7dc",
"assets/assets/images/menu/collapsible_team_setup.png": "442a1631b0c66897a910936b8212a9d8"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
