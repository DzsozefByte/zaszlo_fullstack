# Zaszlo Backend

Ez a repository a zaszlo webshop/backend Express alapu API-ja. A rendszer MySQL adatbazissal dolgozik, JWT access tokent hasznal, refresh tokent cookie-ban tarol, es kulon publikus, user es admin vegpontokat ad a zaszlok, felhasznalok, szamlak es fizetesi modok kezelesere.

## Fo funkciok

- felhasznalo regisztracio, login, profil lekeres es profil frissites
- access token + refresh token alapu hitelesites
- publikus zaszlo listazas, keres es nepszeru zaszlok lekerdezese
- admin zaszlo, orszag, meret, anyag es tomeges variacio kezeles
- szamla letrehozas user oldalon
- admin oldali szamla es fizetesi mod kezeles
- orszagkep feltoltes multerrel
- teljes Postman collection integracios tesztekhez

## Technologia

| Terulet | Hasznalt megoldas |
| --- | --- |
| Runtime | Node.js |
| Szerver | Express |
| Adatbazis | MySQL `mysql2` klienssel |
| Auth | `jsonwebtoken`, Bearer access token, HTTP-only refresh token cookie |
| Jelszo | `bcrypt` |
| File upload | `multer` |
| Logging | `morgan` |
| Konfiguracio | `.env` + `dotenv` |

## Projekt szerkezet

| Utvonal | Szerepe |
| --- | --- |
| `app.js` | Express middlewares, CORS, route mountolas |
| `bin/www` | HTTP server inditas, port kezeles |
| `routes/` | Vegpontok definicioja |
| `controllers/` | Request-validalas es valaszok |
| `models/` | Adatbazis muveletek |
| `middleware/auth.js` | Bearer token ellenorzes es admin jogosultsag vizsgalat |
| `postman/` | Postman collection, generator, upload tesztfajl |

## Inditas

1. Telepitsd a fuggosegeket:

```bash
npm install
```

2. Allitsd be a `.env` fajlt.

3. Inditsd a szervert:

```bash
npm start
```

4. Alapertelmezetten a backend a `http://localhost:8080` cimen indul.

Megjegyzes: a `start` script jelenleg `nodemon ./bin/www`, tehat fejlesztoi modban ujraindul fajlvaltozasokra.

## Kornyezeti valtozok

| Valtozo | Kotelezo | Alap / pelda | Leiras |
| --- | --- | --- | --- |
| `PORT` | nem | `8080` | A szerver portja. Ha nincs megadva, a `bin/www` 8080-at hasznal. |
| `DB_HOST` | igen | `localhost` | MySQL host. |
| `DB_USER` | igen | `root` | MySQL felhasznalo. |
| `DB_PASSWORD` | igen | `root` | MySQL jelszo. |
| `DB_NAME` | igen | `zaszlo` | Hasznalt adatbazis neve. |
| `JWT_SECRET` | igen | - | Access token alairasi kulcs. |
| `REFRESH_JWT_SECRET` | igen | - | Refresh token alairasi kulcs. |
| `JWT_EXPIRES_IN` | nem | `1h` | Access token lejarat. |
| `REFRESH_EXPIRES_IN` | nem | `7d` fallback, a helyi `.env` most `3d` | Refresh token lejarat. |
| `CORS_ORIGINS` | nem | ures | Vesszovel elvalasztott extra engedelyezett origin lista. |
| `FLAG_IMAGE_UPLOAD_PATH` | nem | fallback utvonal | Orszagkepek celmappaja. Ha nincs megadva, fallback utvonalra ment a backend. |
| `NODE_ENV` | nem | `development` | `production` eseten a refresh cookie `secure: true`. |

## Auth es session kezeles

- A `POST /auth/login` valaszban erkezik egy `accessToken`, es a szerver beallit egy `refreshToken` HTTP-only cookie-t.
- A vedett vegpontokhoz `Authorization: Bearer <accessToken>` fejléc kell.
- A `POST /auth/refresh-token` a cookie-bol olvas, es uj access tokent ad vissza.
- A `POST /auth/logout` torli a refresh tokent.
- Az admin vegpontoknal a Bearer tokenben levo `szerep` mezot a `middleware/auth.js` ellenorzi.

## API vegpontok

### Root es auth

| Method | Path | Auth | Input | Leiras |
| --- | --- | --- | --- | --- |
| `GET` | `/` | publikus | - | A `public/index.html` statikus kezdooldalt adja vissza. |
| `POST` | `/auth/register` | publikus | `nev`, `email`, `jelszo` kotelezo; kontakt es cim mezok opcionalsak | Uj user regisztracio. |
| `POST` | `/auth/login` | publikus | `email`, `jelszo` | Login, access token + refresh cookie. |
| `POST` | `/auth/refresh-token` | cookie | refresh cookie | Uj access token letrehozas. |
| `GET` | `/auth/profil` | user | Bearer token | A bejelentkezett user adatai. |
| `PUT` | `/auth/profil/update` | user | `nev` kotelezo, tobbi profil mezo opcionalsan kuldheto | Profil modositas. |
| `GET` | `/auth/admin/users` | admin | query: `page`, `limit` | Lapozott user lista adminnak. |
| `PUT` | `/auth/admin/users/:id/role` | admin | body: `jogosultsag` = `user` vagy `admin` | User szerepkor modositas. |
| `DELETE` | `/auth/admin/users/:id` | admin | `:id` | User torlese, vedelmekkel az utolso admin es a sajat fiok ellen. |
| `POST` | `/auth/logout` | publikus / cookie | - | Refresh token torlese. |

### Zaszlo vegpontok

| Method | Path | Auth | Input | Leiras |
| --- | --- | --- | --- | --- |
| `GET` | `/zaszlok` | publikus | - | Teljes publikus zaszlo lista. |
| `GET` | `/zaszlok/popular` | publikus | query: `limit` | Legnepszerubb zaszlok. |
| `GET` | `/zaszlok/search` | publikus | query: `meret`, `anyag`, `kontinens`, `orszag` | Szurt zaszlo kereses. |
| `GET` | `/zaszlok/:id` | publikus | `:id` | Egy zaszlo variacio reszletei. |
| `GET` | `/zaszlok/admin-list` | admin | - | Admin lista orszag, meret es anyag adatokkal. |
| `GET` | `/zaszlok/admin/meta` | admin | - | Meret, anyag es kontinens torzsadatok. |
| `POST` | `/zaszlok` | admin | `orszag`, `meretId`, `anyagId`, `kontinensId` vagy `kontinens` | Egy uj zaszlo variacio letrehozasa. |
| `DELETE` | `/zaszlok/:id` | admin | `:id` | Egy zaszlo variacio torlese. |
| `POST` | `/zaszlok/upload/:orszagId` | admin | `multipart/form-data`, fajlmezo: `image` | Orszagkep feltoltese. |
| `PUT` | `/zaszlok/admin/countries/:id` | admin | `orszag`, `kontinensId` | Orszag nev es kontinens modositas. |
| `DELETE` | `/zaszlok/admin/countries/:id` | admin | `:id` | Orszag es osszes variaciojanak torlese, a kepfajl torlesevel egyutt. |
| `POST` | `/zaszlok/admin/sizes` | admin | `meret`, `szorzo` | Uj meret letrehozasa. Globalis variaciokat generalhat. |
| `PUT` | `/zaszlok/admin/sizes/:id` | admin | `meret`, `szorzo` | Meret modositas. |
| `DELETE` | `/zaszlok/admin/sizes/:id` | admin | `:id` | Meret torlese. Kapcsolodo variaciokat is erinthet. |
| `POST` | `/zaszlok/admin/materials` | admin | `anyag`, `szorzo` | Uj anyag letrehozasa. Globalis variaciokat generalhat. |
| `PUT` | `/zaszlok/admin/materials/:id` | admin | `anyag`, `szorzo` | Anyag modositas. |
| `DELETE` | `/zaszlok/admin/materials/:id` | admin | `:id` | Anyag torlese. Kapcsolodo variaciokat is erinthet. |
| `POST` | `/zaszlok/admin/bulk-create` | admin | `orszag`, `meretIds[]`, `anyagIds[]`, opcionalsan `kontinensId` vagy `kontinens` | Egy orszaghoz tobb meret/anyag kombinacio tomeges letrehozasa. |

### Szamla es fizetesi mod vegpontok

| Method | Path | Auth | Input | Leiras |
| --- | --- | --- | --- | --- |
| `GET` | `/szamlak/payment-methods` | publikus | - | Elerheto fizetesi modok listaja. |
| `POST` | `/szamlak` | user | body: `fizetesiModId` vagy `fizetesiMod`, es `kosar[]` | Uj szamla letrehozasa a bejelentkezett usernek. |
| `GET` | `/szamlak` | user | - | A sajat szamlak listaja tetelekkel egyutt. |
| `GET` | `/szamlak/admin` | admin | - | Osszes szamla admin nezetben. |
| `POST` | `/szamlak/admin/payment-methods` | admin | body: `nev` | Uj fizetesi mod letrehozasa. |
| `DELETE` | `/szamlak/admin/payment-methods/:id` | admin | `:id` | Fizetesi mod torlese. Hasznalatban levo mod nem torolheto. |
| `DELETE` | `/szamlak/admin/:id` | admin | `:id` | Szamla es teteleinek torlese. |

### Szamla letrehozasnal ajanlott request body

A backend a `fizetesiModId` kulcsot preferalja, es a kosar teteleknel a `variantId` a legstabilabb megoldas.

```json
{
  "fizetesiModId": 1,
  "kosar": [
    {
      "variantId": 15,
      "orszagId": 7,
      "meret": "40x60",
      "anyag": "pamut",
      "db": 2,
      "ar": 1234
    }
  ]
}
```

## Kepfeltoltes

A kepfeltoltes dokumentacioja frissitve lett a jelenlegi kodhoz igazodva.

- A vegpont: `POST /zaszlok/upload/:orszagId`
- Auth: admin Bearer token
- Request tipus: `multipart/form-data`
- Fajlmezo neve: `image`
- A szerveroldali celmappa **nem csak egy fixen hardcode-olt utvonal**. A backend jelenleg igy dont:

1. Ha van `FLAG_IMAGE_UPLOAD_PATH`, akkor `path.resolve(process.env.FLAG_IMAGE_UPLOAD_PATH)` lesz a cel.
2. Ha nincs, fallbackkent a `../zaszlo_frontend_veet/public/images` mappaba ment.

Tovabbi fontos reszletek:

- A feltoltott fajl neve mindig `<orszagId>.png`.
- Ha a celmappa nem letezik, a backend letrehozza.
- A `DELETE /zaszlok/admin/countries/:id` torleskor megprobalja a megfelelo kepfajlt is letorolni.
- A Postman collectionben szereplo `uploadFilePath` **nem a szerveroldali mappa**, hanem a Postman kliens altal feltoltendo helyi fajl utvonala.

Ha a frontend/public kepmappa mashol van, erosen ajanlott a `FLAG_IMAGE_UPLOAD_PATH` hasznalata, hogy a backend ne a fallback relativ utvonalra tamaszkodjon.

## Postman teszteles

A repository tartalmaz egy importalhato Postman collectiont:

- `postman/zaszlo_backend.postman_collection.json`
- `postman/generate_collection.js`
- `postman/test-upload.txt`

A collection 35 egyedi vegpontot fed le 37 requesttel. Azert tobb a request, mint az egyedi vegpont, mert kulon user es admin login folyamat, valamint ket tesztfelhasznalo regisztracio is van.

### Elokeszites

1. Inditsd el a backend szervert.
2. Importald a `postman/zaszlo_backend.postman_collection.json` fajlt Postmanbe.
3. A collection valtozoknal allitsd be az `adminEmail` es `adminPassword` erteket egy valodi admin fiokra.
4. Ellenorizd a `baseUrl` valtozot. Alapbol `http://localhost:8080`.
5. Ha kell, modositsd az `uploadFilePath` erteket egy helyi fajlra. Alapbol a repo `postman/test-upload.txt` fajljara mutat.
6. A teljes futast mindig a collection elejerol inditsd.
7. A `07 Optional Dangerous Size And Material Admin` mappat csak teszt adatbazison futtasd, es csak akkor, ha `allowDangerousAdminChanges=true`.

### 00 Public

| Request | Mit ellenoriz | Mentett valtozok |
| --- | --- | --- |
| `GET /` | A szerver elerheto, a root endpoint HTML-t ad vissza. | - |
| `GET /zaszlok` | A publikus zaszlo lista endpoint JSON tombot ad vissza. | - |
| `GET /zaszlok/popular?limit=5` | A nepszeru zaszlok endpoint elerheto. | - |
| `GET /szamlak/payment-methods` | Van legalabb egy fizetesi mod, es a lista endpoint mukodik. | `paymentMethodId` |

### 01 User Auth And Profile

| Request | Mit ellenoriz | Mentett valtozok |
| --- | --- | --- |
| `POST /auth/register (main user)` | Letrehoz egy egyedi teszt usert `runId` alapjan. | - |
| `POST /auth/register (delete candidate)` | Letrehoz egy kulon usert, amit a cleanup vegul torol. | - |
| `POST /auth/login (main user)` | User login mukodik, access token visszajon. | `userToken` |
| `POST /auth/refresh-token` | A refresh cookie tenyleg hasznalhato uj access tokenre. | `userToken` frissul |
| `GET /auth/profil` | Bearer auth mellett visszajon a bejelentkezett user profilja. | `userId` |
| `PUT /auth/profil/update` | A profil modositas vegpont a frissitett adatokat adja vissza. | - |

### 02 Admin Auth And Users

| Request | Mit ellenoriz | Mentett valtozok |
| --- | --- | --- |
| `POST /auth/login (admin)` | Admin login mukodik. | `adminToken` |
| `GET /auth/admin/users?limit=100&page=1` | Az admin user lista lapozasa mukodik, es a frissen letrehozott teszt userek latszanak. | `userId`, `deleteUserId` |
| `PUT /auth/admin/users/:id/role` | A szerepkor modositas vegpont helyes valasszal ter vissza. | - |

### 03 Admin Flags Setup

| Request | Mit ellenoriz | Mentett valtozok |
| --- | --- | --- |
| `GET /zaszlok/admin/meta` | Megjonnek a torzsadatok meret, anyag es kontinens szerint. | `targetContinentId`, `targetSizeId`, `targetSizeName`, `targetMaterialId`, `targetMaterialName` |
| `GET /zaszlok/admin-list` | Az admin zaszlo lista endpoint elerheto. | - |
| `POST /zaszlok` | Letrehoz egy dedikalt teszt orszagot es egy teszt zaszlo variaciot. | `createdFlagId`, `createdCountryId` |
| `POST /zaszlok/upload/:orszagId` | Kepfeltoltes admin auth mellett mukodik. | - |
| `GET /zaszlok/:id` | A letrehozott zaszlo reszletei visszaolvashatok. | `targetSizeName`, `targetMaterialName` frissulhet |
| `PUT /zaszlok/admin/countries/:id` | A letrehozott teszt orszag atnevezese mukodik. | - |
| `GET /zaszlok/search?orszag={{updatedCountryName}}` | A publikus keresesi endpoint a frissitett orszagnevvel is mukodik. | - |
| `POST /zaszlok/admin/bulk-create` | Tomeges variacio letrehozas mukodik egy kulon teszt orszaggal. | `createdBulkCountryId` |

### 04 User Invoices

| Request | Mit ellenoriz | Mentett valtozok |
| --- | --- | --- |
| `POST /szamlak` | A bejelentkezett user tud szamlat letrehozni a teszt zaszloval. | `createdInvoiceId` |
| `GET /szamlak` | A user sajat szamla listajaban latszik az uj rekord. | - |

### 05 Admin Invoices And Payment Methods

| Request | Mit ellenoriz | Mentett valtozok |
| --- | --- | --- |
| `POST /szamlak/admin/payment-methods` | Admin tud uj, ideiglenes fizetesi modot letrehozni. | `createdPaymentMethodId` |
| `DELETE /szamlak/admin/payment-methods/:id` | A nem hasznalt, ideiglenes fizetesi mod torolheto. | a valtozo torlodik |
| `GET /szamlak/admin` | Az admin latja a user altal letrehozott szamlat. | - |
| `DELETE /szamlak/admin/:id` | Az admin torolni tudja a collection altal letrehozott szamlat. | `createdInvoiceId` torlodik |

### 06 Cleanup

| Request | Mit ellenoriz | Mentett valtozok |
| --- | --- | --- |
| `DELETE /zaszlok/:id` | A teszt zaszlo variacio torolheto. | `createdFlagId`, `createdCountryId` torlodik |
| `DELETE /zaszlok/admin/countries/:id` | A bulk create-tal letrehozott teszt orszag torolheto. | `createdBulkCountryId` torlodik |
| `DELETE /auth/admin/users/:id` | A csak teszteleshez letrehozott user takarithato. | `deleteUserId` torlodik |
| `POST /auth/logout` | A refresh cookie torlese mukodik. | `userToken`, `adminToken` torlodik |

### 07 Optional Dangerous Size And Material Admin

Ez a mappa direkt kulon lett valasztva, mert ezek a requestek a modellek miatt globalis adatokat is erinthetnek.

| Request | Mit ellenoriz | Mentett valtozok |
| --- | --- | --- |
| `POST /zaszlok/admin/sizes` | Uj meret letrehozas. | `createdSizeId` |
| `PUT /zaszlok/admin/sizes/:id` | A letrehozott meret modosithato. | - |
| `DELETE /zaszlok/admin/sizes/:id` | A letrehozott meret torolheto. | `createdSizeId` torlodik |
| `POST /zaszlok/admin/materials` | Uj anyag letrehozas. | `createdMaterialId` |
| `PUT /zaszlok/admin/materials/:id` | A letrehozott anyag modosithato. | - |
| `DELETE /zaszlok/admin/materials/:id` | A letrehozott anyag torolheto. | `createdMaterialId` torlodik |

Miert veszelyes:

- uj meret hozzaadasa globalisan uj variaciokat generalhat a meglevo orszagokhoz
- uj anyag hozzaadasa ugyanigy globalis variaciokat generalhat
- torleskor nem csak a torzsadat, hanem kapcsolodo zaszlo variaciok is torlodhetnek

## Postman collection ujrageneralasa

Ha a vegpontok vagy a tesztek valtoznak, a collection ujrageneralhato:

```bash
node postman/generate_collection.js
```

Ez felulirja a `postman/zaszlo_backend.postman_collection.json` fajlt az aktualis generator script alapjan.
