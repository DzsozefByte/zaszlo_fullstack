Postman collection

Importáld a zaszlo_backend.postman_collection.json fájlt Postmanbe, és a collection elejéről futtasd végig.

Mire figyelj:

A baseUrl alapból http://localhost:8080, mert a backend a bin/www alapján ezen a porton fut.
Az adminEmail és adminPassword változókat töltsd ki egy valódi admin felhasználó adataival.
Az uploadFilePath alapból a postman/test-upload.txt fájlra mutat, így az upload végpont helyben rögtön kipróbálható.
A 07 Optional Dangerous Méret és Anyag Admin mappa csak akkor fusson, ha az allowDangerousAdminChanges változót true értékre állítod.

Miért külön veszélyes ez a mappa:

A POST/PUT/DELETE /zaszlok/admin/sizes* és POST/PUT/DELETE /zaszlok/admin/materials* végpontok a modellek alapján globális variációkat generálnak és törölnek.
Ezért ezeket csak teszt adatbázison érdemes futtatni.