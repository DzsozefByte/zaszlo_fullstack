# Postman collection

Ez a mappa a backend integracios tesztjeihez tartozik.

Fajlok:

- `zaszlo_backend.postman_collection.json`: importalhato Postman collection
- `generate_collection.js`: a collection generator scriptje
- `test-upload.txt`: helyi minta fajl az upload requesthez

Gyors inditas:

1. Inditsd el a backendet.
2. Importald a collectiont.
3. Toltsd ki az `adminEmail` es `adminPassword` valtozokat.
4. Ellenorizd a `baseUrl` es `uploadFilePath` valtozokat.
5. A collectiont mindig az elejerol futtasd.

Reszletes leiras:

- a teljes API dokumentacio a gyoker `README.md` fajlban van
- a Postman tesztfolyamatot ugyanott a `Postman teszteles` fejezet irja le
- a kepfeltoltes aktualis mukodeset a `Kepfeltoltes` fejezet dokumentalja

Figyelem:

- a `07 Optional Dangerous Size And Material Admin` mappa csak teszt adatbazison fusson
- ehhez az `allowDangerousAdminChanges` valtozot `true` ertekre kell allitani
