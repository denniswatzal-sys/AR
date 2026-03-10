# 🎯 Dart AR Trainer

Augmented Reality Trainings-App für Steel-Dart.  
Erkennt deine Dartscheibe als AR-Marker und blendet Zielfelder direkt auf der Scheibe ein.

**[→ Live Demo öffnen](https://DEIN-USERNAME.github.io/dart-ar-trainer/)**

---

## ✨ Features

- **Marker-basiertes AR** – Dartscheibe wird automatisch erkannt
- **4 Trainingsmodi** – Zufällig, Triple, Doppel, Cricket
- **Echtzeit-Overlay** – animierte Ringe und Zielfeld-Anzeige direkt auf der Scheibe
- **Treffer-Tracking** – Treffer, Streak und Gesamt-Würfe
- **PWA** – installierbar auf dem Handy-Homescreen
- **HTTPS-ready** – läuft direkt über GitHub Pages

---

## 🚀 Setup

### 1. Marker erstellen

1. Mach ein Foto deiner Dartscheibe (gute Beleuchtung, frontal)
2. Gehe zu [MindAR Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile)
3. Lade das Foto hoch → `targets.mind` herunterladen
4. Datei in diesen Ordner legen

### 2. Icons erstellen (optional)

Erstelle `icon-192.png` und `icon-512.png` für den PWA-Homescreen.  
Beispiel-Tool: [realfavicongenerator.net](https://realfavicongenerator.net)

### 3. Auf GitHub Pages deployen

```bash
# Repository erstellen
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/DEIN-USERNAME/dart-ar-trainer.git
git push -u origin main
```

Dann in GitHub → Settings → Pages → Source: `main` branch

### 4. Lokal testen

```bash
npx serve .
```

Dann `http://localhost:3000` im Browser öffnen.  
⚠️ WebAR benötigt HTTPS oder localhost (kein http://192.168.x.x).

---

## 📁 Dateistruktur

```
dart-ar-trainer/
├── index.html          ← Struktur & A-Frame AR-Szene
├── app.js              ← Spiellogik, Modi, AR-Updates
├── style.css           ← Design & Animationen
├── manifest.json       ← PWA-Konfiguration
├── service-worker.js   ← Offline-Cache
├── targets.mind        ← Dein Dartscheiben-Marker (selbst erstellen!)
├── icon-192.png        ← PWA Icon (selbst erstellen)
├── icon-512.png        ← PWA Icon groß (selbst erstellen)
└── README.md
```

---

## 🗺️ Roadmap

- [x] Phase 1: Grundgerüst & AR-Marker
- [ ] Phase 2: autodarts.io WebSocket API (automatische Treffererkennung)
- [ ] Phase 3: Erweiterte Animationen & Spielmodi
- [ ] Phase 4: XREAL Air 2 AR-Brille

---

## 🛠️ Technologien

- [MindAR.js](https://hiukim.github.io/mind-ar-js-doc/) – Marker-Tracking
- [A-Frame](https://aframe.io/) – 3D/AR im Browser
- Vanilla JavaScript, HTML5, CSS3
- GitHub Pages + PWA

---

*Erstellt mit ❤️ und Claude*
