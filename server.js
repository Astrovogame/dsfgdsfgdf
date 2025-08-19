// server.js — Express static server + WebSocket PvP for Kraken.io
// MIT License
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.static('public'));

app.get('/health', (req,res)=>res.json({ok:true}));
const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: '/ws' });

// Simple in-memory state
const players = new Map(); // id -> { ws, last, snapshot }

function uid(){
  return Math.random().toString(36).slice(2,10);
}

// Collision helper
function dist2(a,b,c,d){ const dx=c-a, dy=d-b; return dx*dx+dy*dy; }

wss.on('connection', (ws) => {
  const id = uid();
  players.set(id, { ws, last: Date.now(), snapshot: null });

  // hello
  ws.send(JSON.stringify({ t:'hello', id }));

  ws.on('message', (data) => {
    let msg;
    try{ msg = JSON.parse(data.toString()); }catch{ return; }
    if (msg.t === 'join'){
      const p = players.get(id); if (!p) return;
      p.snapshot = { id, x:0, y:0, angle:0, segments:[], radius:10, colorId: msg.colorId||'aqua', hat: msg.hat||'none', name: msg.name||'Kraken' };
      p.last = Date.now();
    }
    else if (msg.t === 'state'){
      const p = players.get(id); if (!p) return;
      // update snapshot
      p.snapshot = { id, x: msg.x, y: msg.y, angle: msg.angle, segments: msg.segments||[], radius: msg.radius||10, colorId: msg.colorId||'aqua', hat: msg.hat||'none', name: msg.name||'Kraken' };
      p.last = Date.now();
    }
  });

  ws.on('close', () => {
    players.delete(id);
  });
});

// Broadcast loop & PvP collision
setInterval(() => {
  // remove stale
  const now = Date.now();
  for (const [id,p] of players){
    if (now - p.last > 10000){ try{ p.ws.close(); }catch{} players.delete(id); }
  }

  // Collision check: head vs others segments
  const arr = Array.from(players.values()).map(p => p.snapshot).filter(Boolean);
  for (const me of arr){
    for (const other of arr){
      if (!me || !other || me.id===other.id) continue;
      const rHead = me.radius || 10;
      const r = 8, r2 = (r + rHead)*(r + rHead);
      for (let i=5;i<other.segments.length;i+=2){
        const s = other.segments[i];
        if (!s) continue;
        if (dist2(me.x, me.y, s.x, s.y) < r2){
          // me died
          const pl = players.get(me.id);
          if (pl && pl.ws && pl.ws.readyState===1){
            pl.ws.send(JSON.stringify({ t:'die', id: me.id }));
          }
          break;
        }
      }
    }
  }

  // broadcast snapshots
  const payload = JSON.stringify({ t:'players', list: arr });
  for (const [id,p] of players){
    try{
      if (p.ws && p.ws.readyState===1) p.ws.send(payload);
    }catch{}
  }

}, 50);

server.listen(PORT, () => {
  console.log('Kraken.io server on http://localhost:'+PORT);
});
