# OSG API Keep-Alive (WP-067) — gegen Render Free Sleep (~15 Min Idle)

**Ziel:** Node-API `omnisolutionsglobal-web` / `api.omnisolutionsglobal.com` bleibt wach — Speak, Affiliate, Ops, Hintergrundjobs ohne Cold-Start-Minuten.

**Ping-URL (leicht, ohne TTS):** `GET /health/ping`  
**Targets:**
- https://api.omnisolutionsglobal.com/health/ping  
- https://omnisolutionsglobal-web.onrender.com/health/ping  

> Free UptimeRobot / GitHub Actions: **alle 5 Minuten**. Das reicht, weil Render erst nach **~15 Minuten** Idle schläft. Echter Minutentakt: Cloudflare Worker Cron (unten) oder UptimeRobot Pro.

## Was im Repo aktiv ist

| Schicht | Intervall | Status |
|--------|-----------|--------|
| GitHub Action `.github/workflows/osg-api-keepalive.yml` | 5 Min | nach Push auf `main` |
| `scripts/osg-keepalive-ping.mjs` | manuell / lokal `--loop` | immer |
| `scripts/setup-uptimerobot-keepalive.js` | 5 Min (UptimeRobot Free) | wenn API-Key gesetzt |
| `workers/osg-api-keepalive` | 1 Min | wenn CF-Token **Workers Edit** hat |

## Sofort lokal testen

```bash
node scripts/osg-keepalive-ping.mjs
# Dauerbetrieb (1 Min):
node scripts/osg-keepalive-ping.mjs --loop --interval-ms=60000
```

## UptimeRobot (kostenlos, empfohlen als zweite Schicht)

1. Account: https://uptimerobot.com  
2. My Settings → API Settings → Main API Key  
3. `cp scripts/uptimerobot.local.env.example scripts/uptimerobot.local.env` → Key eintragen  
4. `node scripts/setup-uptimerobot-keepalive.js`

## Cloudflare Worker (echter Minutentakt)

Aktuelles DNS-Token hat **keine** Workers-Rechte. Token um **Account → Workers Scripts: Edit** erweitern, dann:

```bash
cd workers/osg-api-keepalive
npx wrangler deploy
```

## Hinweis Free-Stunden

Dauerhaftes Wachhalten verbraucht die monatlichen Free-Stunden der Render-Node-Instanz (~750 h). Static Site bleibt ohnehin always-on und braucht keinen Ping.
