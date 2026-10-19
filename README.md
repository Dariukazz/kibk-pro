# kibk.pro — žvejybos prognozės

Fishing forecast web app (Lithuanian): bite score, forecast with solunar periods, map of lakes and rivers, KIBK AI assistant, tournaments and a catch diary.

- Weather: [Open-Meteo](https://open-meteo.com/) (live, no API key)
- Map: Leaflet + OpenStreetMap
- All user data (accounts, catches, tournaments) is stored locally in the browser

## Run

Any static file server works, for example:

```bash
py -m http.server 5173
```

Then open http://localhost:5173.
