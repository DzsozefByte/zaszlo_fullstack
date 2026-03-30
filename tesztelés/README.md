# Postman collection

Importald a `zaszlo_backend.postman_collection.json` fajlt Postmanbe, es a collection elejerol futtasd vegig.

Mire figyelj:

- A `baseUrl` alapbol `http://localhost:8080`, mert a backend a `bin/www` alapjan ezen a porton indul.
- Az `adminEmail` es `adminPassword` valtozokat toltsd ki egy valodi admin felhasznalo adataival.
- Az `uploadFilePath` alapbol a `postman/test-upload.txt` fajlra mutat, igy az upload vegpont helyben rogton kiprobalhato.
- A 07 Optional Dangerous Méret és Anyag Admin` mappa csak akkor fusson, ha az `allowDangerousAdminChanges` valtozot `true` ertekre allitod.

Miert kulon veszelyes ez a mappa:

- A `POST/PUT/DELETE /zaszlok/admin/sizes*` es `POST/PUT/DELETE /zaszlok/admin/materials*` vegpontok a modellek alapjan globalis variaciokat generalnak es torolnek.
- Ezert ezeket csak teszt adatbazison erdemes futtatni.
