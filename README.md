# 🐙 Kraken.io

Een Snake.io-achtige arena-game met **bots**, **power-ups**, **shop** en **lokale opslag** – plus een **online PvP**-modus via WebSockets.

## ✨ Features
- Tentakel-groei door orbs te verzamelen
- Power-ups: Inktwolk (invis/schild), Turbo, Magneet, Schild, Grab
- Bots met simpele AI (offline en online aanwezig)
- Obstakels in de arena
- Shop met tentakelkleuren & hoeden (coins via spelen)
- Highscores & voortgang lokaal opgeslagen
- **Online PvP**: andere spelers verschijnen live in je arena en server beslist bij head-vs-segment botsing wie sterft

## 🏃‍♂️ Snel starten (lokaal of Replit)
```bash
npm install
npm start
```
Open vervolgens: http://localhost:${PORT:-3000}

De client laadt vanaf dezelfde host. In het **menu** kun je de optie **Online** aanvinken. Als de WebSocket beschikbaar is (Replit of lokaal met `npm start`), wordt de online modus geactiveerd.

## 🌐 GitHub Pages
GitHub Pages is **static hosting**. Je kunt `public/` uploaden naar Pages (alleen **offline/bots** werken). Voor de online modus heb je de Node-server nodig – host deze elders (bijv. Replit of een eigen VPS) en open de game vanaf die host.

## 📁 Projectstructuur
```
kraken-io/
├─ public/
│  ├─ index.html
│  ├─ style.css
│  ├─ script.js
│  └─ assets/logo.svg
├─ server.js          # Express + ws server (WebSocket pad: /ws)
├─ package.json
└─ README.md
```

## 🔒 Juridisch
- Dit project is *geïnspireerd* door Snake.io maar is **eigen IP** met unieke mechanieken (tentakel-grab, ink invisibility, cosmetics, etc.).
- Licentie: MIT (vrij te gebruiken/aanpassen met behoud van copyright notice).

Veel plezier! 😄


## 🧰 Troubleshooting

- **Geen beeld / alleen zwart:** open `http://localhost:3000` (niet `file://`). De server moet draaien.
- **Online werkt niet op GitHub Pages:** Pages is statisch. Start de Node server ergens (Replit / VPS) en open de game daar. Of voeg `?ws=wss://jouw-host/ws` toe aan de URL.
- **Online lokaal geeft fout:** check console (F12). Zie je `WS close`? Controleer poort forwarding / firewall. Health check: `GET /health` → `{ ok: true }`.
- **Replit:** laat de tab open staan. Zorg dat de "Webview" URL begint met `https://` en geen 404 geeft. Online aan → zou moeten verbinden.
