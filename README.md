# Magyar Vonatkövető - Train Tracking System

Egy modern, valós idejű vonatkövető webalkalmazás React frontend és Python Flask backend technológiákkal.

## Funkcionalitás

### ✨ Főbb Jellemzők

- **🚂 Valós idejű vonatkövetés**: Vonatok aktuális pozíciójának és állapotának megjelenítése
- **🗺️ Interaktív térkép**: Leaflet alapú térkép a vonatok pozíciójával
- **🔍 Fejlett keresés**: Vonatok keresése szám, állomás vagy útvonal alapján
- **📊 Irányítópult**: Rendszer áttekintés és statisztikák
- **📱 Reszponzív design**: Mobil és desktop eszközökön optimalizált
- **⚡ Valós idejű frissítések**: Automatikus adatfrissítés

### 🎯 Funkciók részletesen

1. **Irányítópult**
   - Rendszer állapot áttekintése
   - Vonatok száma és állapota
   - Gyors hivatkozások

2. **Vonatlista**
   - Összes vonat megjelenítése
   - Szűrési lehetőségek (állomás, típus, állapot)
   - Részletes vonatinformációk

3. **Vonat részletek**
   - Teljes útvonal megjelenítése
   - Valós idejű pozíció
   - Késési információk
   - Menetrend adatok

4. **Keresés**
   - Szöveges keresés vonatok között
   - Keresés vonatszám, állomás vagy útvonal alapján
   - Intelligens találat kijelzés

5. **Térkép nézet**
   - Interaktív térkép Magyarország területével
   - Vonatok pozíciója markerekkel
   - Kattintható információs buborékok
   - Valós idejű pozíció frissítés

## Technológiai Stack

### Backend (Python Flask)
- **Flask**: Web framework
- **Flask-CORS**: Cross-origin resource sharing
- **JSON API**: RESTful API endpoints
- **Valós idejű szimuláció**: Mock adatok késés és pozíció szimulációval

### Frontend (React)
- **React 18**: Modern React hooks és komponensek
- **React Router**: Kliens oldali routing
- **Axios**: HTTP kliens API kommunikációhoz
- **Leaflet & React-Leaflet**: Interaktív térképek
- **Lucide React**: Modern ikonok
- **CSS3**: Egyedi styling gradientekkel és animációkkal

## Telepítés és Futtatás

### Előfeltételek
- **Python 3.8+**
- **Node.js 16+**
- **npm vagy yarn**

### Backend beállítása

1. **Függőségek telepítése:**
```bash
pip install -r requirements.txt
```

2. **Flask alkalmazás indítása:**
```bash
cd backend
python app.py
```

A backend a `http://localhost:5000` címen indul el.

### Frontend beállítása

1. **Függőségek telepítése:**
```bash
cd frontend
npm install
```

2. **React alkalmazás indítása:**
```bash
npm start
```

A frontend a `http://localhost:3000` címen indul el.

### Gyors indítás (fejlesztői mód)

**Backend terminál:**
```bash
cd backend && python app.py
```

**Frontend terminál (új ablakban):**
```bash
cd frontend && npm start
```

## API Dokumentáció

### Endpoints

#### Vonatok
- `GET /api/trains` - Összes vonat lekérése (szűrőkkel)
- `GET /api/trains/{id}` - Specifikus vonat részletei
- `GET /api/trains/{id}/position` - Vonat valós idejű pozíciója

#### Állomások
- `GET /api/stations` - Összes állomás listája

#### Keresés
- `GET /api/search?q={query}` - Vonatok keresése

#### Rendszer
- `GET /api/status` - Rendszer állapot és statisztikák

### API Válasz Formátum

```json
{
  "success": true,
  "trains": [...],
  "count": 3
}
```

## Alkalmazás Struktúra

```
train-tracker/
├── backend/
│   ├── app.py              # Flask alkalmazás
│   └── requirements.txt    # Python függőségek
├── frontend/
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── src/
│   │   ├── components/     # React komponensek
│   │   │   ├── Dashboard.js
│   │   │   ├── TrainList.js
│   │   │   ├── TrainDetails.js
│   │   │   ├── SearchPage.js
│   │   │   └── TrainMap.js
│   │   ├── services/       # API szolgáltatások
│   │   │   └── api.js
│   │   ├── App.js          # Fő alkalmazás komponens
│   │   ├── index.js        # React belépési pont
│   │   └── index.css       # Globális stílusok
│   └── package.json        # NPM függőségek
└── README.md
```

## Komponensek Leírása

### Backend Komponensek

- **Flask App**: API endpoints és mock adatok kezelése
- **CORS Support**: Frontend-backend kommunikáció engedélyezése
- **Mock Data**: Valósághű vonateadatok szimulációja
- **Real-time Simulation**: Pozíció és késés szimuláció

### Frontend Komponensek

- **App.js**: Fő alkalmazás és routing
- **Dashboard**: Áttekintő nézet és statisztikák
- **TrainList**: Vonatok listázása és szűrése
- **TrainDetails**: Részletes vonat információk
- **SearchPage**: Keresési funkciók
- **TrainMap**: Interaktív térkép nézet
- **ApiService**: Központi API kommunikáció

## Design Rendszer

### Színpaletta
- **Elsődleges**: #667eea (kék gradiens)
- **Másodlagos**: #764ba2 (lila gradiens)
- **Siker**: #10b981 (zöld)
- **Hiba/Késés**: #ef4444 (piros)
- **Szürke skála**: #666, #333, rgba alapok

### UI Jellemzők
- **Glassmorphism**: Üveghatású kártyák
- **Gradiens háttér**: Modern színátmenet
- **Animációk**: Hover effektek és transitiók
- **Reszponzív**: Mobile-first megközelítés
- **Akadálymentesség**: Jó kontraszt és olvashatóság

## Fejlesztési Lehetőségek

### Jövőbeli funkciók
- **Valós API integráció**: MÁV API vagy más vasúti szolgáltatók
- **Autentikáció**: Felhasználói fiókok és személyre szabás
- **Push értesítések**: Késési és állapot változás értesítések
- **Offline támogatás**: Service Worker és caching
- **Több nyelv**: Nemzetköziesítés (i18n)
- **Dark mode**: Sötét téma választási lehetőség

### Technikai fejlesztések
- **Database**: SQLite/PostgreSQL adatbázis
- **WebSocket**: Valós idejű kommunikáció
- **Tests**: Unit és integrációs tesztek
- **Docker**: Konténerizáció
- **CI/CD**: Automatikus telepítés

## Licenc

Ez a projekt oktatási célra készült. A valós használathoz vonatkozó engedélyek és API kulcsok beszerzése szükséges.

## Közreműködés

A projekt továbbfejlesztése üdvözölve van. Kérjük, nyissanak issue-t vagy pull request-et a GitHub repositoryban.

## Támogatás

Ha problémába ütköznek, kérjük, nyissanak egy issue-t a GitHub repositoryban részletes leírással.

---

**Made with ❤️ for Hungarian Railway Enthusiasts**
