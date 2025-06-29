## LázárExpressz

Ez a projekt egy valós idejű, webalapú térképes alkalmazás, amely a Magyar Államvasutak (MÁV) vonatainak aktuális pozícióját, sebességét és késését jeleníti meg. Az alkalmazás a szükséges adatokat a MÁV GraphQL-alapú API-járól nyeri.

### Főbb funkciók

- Magyarországi MÁV vonatok valós idejű térképes megjelenítése
- Vonatok aktuális helyzete, sebessége, késése, következő megállója
- Részletes menetrendi adatok (tervezett és tényleges érkezési/indulási idők, késés)
- Adatok mentése MySQL adatbázisba

### Technológiák

- **Frontend:** HTML, CSS, JavaScript, [Leaflet.js](https://leafletjs.com/) (térkép)
- **Backend:** PHP (adatbázis-kezelés, proxy)
- **Adatbázis:** MySQL
- **Adatforrás:** MÁV GraphQL API

### Telepítés

1. **Követelmények**
   - PHP (pl. XAMPP)
   - MySQL szerver
   - Internetkapcsolat (MÁV API eléréséhez)

2. **Adatbázis létrehozása**
   - Hozd létre a `lazarexpress` nevű adatbázist.
   - Futtasd az `assets/sql/db.sql` fájlt a szükséges tábla létrehozásához:
     ```sql
     CREATE TABLE trains (
         id INT AUTO_INCREMENT PRIMARY KEY,
         vehicle_id VARCHAR(255),
         train_name VARCHAR(255),
         headsign VARCHAR(255),
         latitude DOUBLE,
         longitude DOUBLE,
         speed INT,
         delay_seconds INT,
         stop_name VARCHAR(255),
         scheduled_time TIME,
         actual_time TIME,
         timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
     );
     ```

3. **Beállítások**
   - Ellenőrizd az adatbázis elérési adatokat az `assets/php/db.php` fájlban:
     ```php
     $conn = new mysqli("localhost", "root", "", "lazarexpress");
     ```
   - Szükség esetén módosítsd a felhasználónevet/jelszót.

4. **Futtatás**
   - Indítsd el a webszervert (pl. XAMPP).
   - Nyisd meg a böngészőben az `index.php`-t.

### Főbb fájlok

- **index.php** – Az alkalmazás belépési pontja, tartalmazza a térképet.
- **assets/js/script.js** – A frontend logika, vonatpozíciók lekérése, térképre rajzolás, popupok, adatok mentése.
- **assets/css/styles.css** – Stílusok a térképhez és popupokhoz.
- **assets/php/proxy.php** – Proxy a MÁV GraphQL API-hoz, opcionális adatmentés.
- **assets/php/save_train_data.php** – Vonatadatok mentése az adatbázisba.
- **assets/php/db.php** – Adatbázis kapcsolat beállítása.
- **assets/sql/db.sql** – Az adatbázis tábla szerkezete.

### Használat

- Töltsd le a projektet GitHub-ról:
  ```bash
  git clone https://github.com/<felhasznalo>/<repo-nev>.git
  ```
  vagy töltsd le ZIP-ben, majd csomagold ki a webszervered megfelelő könyvtárába.
- Rakd bele a htdocs mappába
- Indísd el a XAMPP-t
- Készísd el az adatbázist a weboldalhoz
- A térképen megjelennek a vonatok, színkódolva a késésük szerint.
- Egy vonatra kattintva részletes menetrendi információk jelennek meg.
- Az adatok percenként frissülnek.

### Hibakeresés

- Ellenőrizd, hogy az adatbázis elérhető és a kapcsolati adatok helyesek.
- A PHP hibák a szerver logjában jelennek meg.
- A böngésző konzoljában láthatók a JavaScript hibák.

### Licenc

Ez a projekt saját projektmunkás licensz alatt áll. A forráskód és a dokumentáció kizárólag oktatási célokra használható fel, kereskedelmi felhasználása nem engedélyezett.

A felhasználók vállalják, hogy nem töltenek fel jogvédett tartalmat.
