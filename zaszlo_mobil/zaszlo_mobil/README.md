# Zaszlo Mobil

Expo mobilalkalmazas, amely a kesz webes feluletet jeleniti meg WebView-ban.
Igy a webes funkciok (bejelentkezes, regisztracio, kosar, fizetes, profil, admin) mobilrol is ugyanugy mukodnek.

## Elokeszites

1. Telepitsd a fuggosegeket:

```bash
npm install
```

2. Hozz letre egy `.env` fajlt a projekt gyokerben:

```bash
EXPO_PUBLIC_WEBAPP_URL=http://**A GÉP LAN IP-CíME**:5173
```

## Szerverek inditasa

1. Backend:

```bash
cd ../zaszlo_backend
npm start
```

2. Frontend (mobilrol is elerheto hoston):

```bash
cd ../zaszlo_frontend_veet
npm run dev -- --host 0.0.0.0 --port 5173
```

## Mobil app inditasa

```bash
cd ../zaszlo_mobil/zaszlo_mobil
npx expo start --tunnel
```

Expo Go-ban ezutan scanneld a QR kodot.

## Hibakereses

- `React Native WebView does not support this platform.`
  Ez akkor jon elo, ha weben futtatod az Expo appot (`w`). A mobil appot Expo Go-ban hasznald.
- Expo Go: `Something went wrong`
  Frissitsd az Expo Go appot, majd inditsd ujra `npx expo start --tunnel` modban.
- Betoltesi hiba vagy ures oldal
  Ellenorizd, hogy az `EXPO_PUBLIC_WEBAPP_URL` cimen a webapp tenyleg elerheto a telefonrol.

## Gyors emlekezteto

- Minden funkciohoz egyszerre kell futnia a backendnek ES a frontendnek.
