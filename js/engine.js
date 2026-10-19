// Variklis: saugykla, orai, kibimo balas, mėnulis, AI atsakymai.
window.KIBK = (function () {
  const { SPECIES, SPOTS, TIPS } = window.KIBK_DATA;

  // ---------- Saugykla ----------
  const store = {
    get(key, def) {
      try { const v = localStorage.getItem('kibk_' + key); return v == null ? def : JSON.parse(v); } catch (e) { return def; }
    },
    set(key, val) {
      try { localStorage.setItem('kibk_' + key, JSON.stringify(val)); return true; } catch (e) { return false; }
    },
    del(key) { try { localStorage.removeItem('kibk_' + key); } catch (e) {} },
  };
  // Orų podėlis — sessionStorage, kad nuotraukoms liktų localStorage vietos.
  const sess = {
    get(key) { try { const v = sessionStorage.getItem('kibk_' + key); return v == null ? null : JSON.parse(v); } catch (e) { return null; } },
    set(key, val) { try { sessionStorage.setItem('kibk_' + key, JSON.stringify(val)); } catch (e) {} },
  };

  // ---------- Pagalbinės ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const spotById = id => SPOTS.find(s => s.id === id);
  function distKm(a, b, c, d) {
    const R = 6371, r = Math.PI / 180;
    const x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  // ---------- Mėnulis ----------
  function moon(date) {
    const syn = 29.530588853;
    const ref = Date.UTC(2000, 0, 6, 18, 14);
    const age = (((date.getTime() - ref) / 86400000) % syn + syn) % syn;
    const p = age / syn;
    const names = ['Jaunatis', 'Jaunas mėnulis', 'Priešpilnis', 'Priešpilnis', 'Pilnatis', 'Delčia', 'Delčia', 'Senas mėnulis'];
    const icons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
    const i = Math.round(p * 8) % 8;
    const illum = Math.round((1 - Math.cos(2 * Math.PI * p)) / 2 * 100);
    return { phase: p, name: names[i], icon: icons[i], illum };
  }

  // ---------- Solunaras (J. A. Knight teorija, kaip Garmin „Hunt & Fish“) ----------
  // Mėnulio padėtis — supaprastintos formulės (tikslumas ~ kelios minutės, žvejybai pakanka).
  const RAD = Math.PI / 180, E = RAD * 23.4397;
  function moonAlt(date, lat, lng) {
    const d = date.getTime() / 86400000 - 0.5 + 2440588 - 2451545;
    const L = RAD * (218.316 + 13.176396 * d), M = RAD * (134.963 + 13.064993 * d), F = RAD * (93.272 + 13.229350 * d);
    const l = L + RAD * 6.289 * Math.sin(M), b = RAD * 5.128 * Math.sin(F);
    const ra = Math.atan2(Math.sin(l) * Math.cos(E) - Math.tan(b) * Math.sin(E), Math.cos(l));
    const dec = Math.asin(Math.sin(b) * Math.cos(E) + Math.cos(b) * Math.sin(E) * Math.sin(l));
    const H = RAD * (280.16 + 360.9856235 * d) + RAD * lng - ra;
    const phi = RAD * lat;
    return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
  }
  const solCache = {};
  // Grąžina dienos solunarinius periodus: didieji (mėnulis virš galvos / po kojomis, ±1 val.)
  // ir mažieji (mėnulio patekėjimas / nusileidimas, ±30 min.), bei dienos įvertinimą.
  function solunar(date, lat, lng, sun) {
    const day = new Date(date); day.setHours(0, 0, 0, 0);
    const key = lat.toFixed(2) + ',' + lng.toFixed(2) + ',' + day.toDateString();
    const base = solCache[key] || (solCache[key] = solunarEvents(day, lat, lng));
    const { major, minor } = base;
    const H = 3600000;
    // Dienos įvertinimas: arti jaunaties/pilnaties + periodai, sutampantys su saulėtekiu/saulėlydžiu.
    let pts = base.phaseStrength * 3;
    if (sun) {
      const near = p => [sun.sunrise, sun.sunset].some(x => x && Math.abs(p.center - x) < 1.5 * H);
      if (major.some(near)) pts += 1;
      if (minor.some(near)) pts += 0.5;
    }
    const rating = pts >= 3.2 ? { n: 4, t: 'Puiki' } : pts >= 2.2 ? { n: 3, t: 'Gera' } : pts >= 1.2 ? { n: 2, t: 'Vidutinė' } : { n: 1, t: 'Silpna' };
    return { ...base, rating };
  }
  function solunarEvents(day, lat, lng) {
    const step = 5 * 60000, h0 = 0.133 * RAD;
    const ev = { rise: null, set: null, over: null, under: null };
    let prev = moonAlt(new Date(day.getTime() - step), lat, lng), cur = moonAlt(day, lat, lng);
    for (let t = day.getTime(); t < day.getTime() + 86400000; t += step) {
      const next = moonAlt(new Date(t + step), lat, lng);
      if (prev < h0 && cur >= h0 && !ev.rise) ev.rise = new Date(t);
      if (prev >= h0 && cur < h0 && !ev.set) ev.set = new Date(t);
      if (cur > prev && cur >= next && !ev.over) ev.over = new Date(t);
      if (cur < prev && cur <= next && !ev.under) ev.under = new Date(t);
      prev = cur; cur = next;
    }
    const H = 3600000;
    const per = (c, half, type, lbl) => c && { type, lbl, center: c, from: new Date(c.getTime() - half), to: new Date(c.getTime() + half) };
    const major = [per(ev.over, H, 'major', 'Mėnulis virš galvos'), per(ev.under, H, 'major', 'Mėnulis po kojomis')].filter(Boolean);
    const minor = [per(ev.rise, H / 2, 'minor', 'Mėnulio patekėjimas'), per(ev.set, H / 2, 'minor', 'Mėnulio nusileidimas')].filter(Boolean);
    const periods = major.concat(minor).sort((a, b) => a.from - b.from);
    const m = moon(new Date(day.getTime() + 12 * H));
    return { ...ev, major, minor, periods, phaseStrength: Math.abs(Math.cos(2 * Math.PI * m.phase)), moon: m };
  }
  // Solunaro veiksnys konkrečiam laikui: 1 — didžiajame periode, 0.8 — mažajame, mažiau — toliau nuo jų.
  function solunarAt(t, lat, lng, sun) {
    // periodai gali persilieti per vidurnaktį, todėl tikrinam ir gretimas dienas
    const all = [-1, 0, 1].flatMap(o => solunar(new Date(t.getTime() + o * 86400000), lat, lng, o === 0 ? sun : null).periods);
    let base = 0.35, inside = null;
    all.forEach(p => {
      const mid = t.getTime() + 1800000; // valandos vidurys
      if (mid >= p.from && mid <= p.to) { const v = p.type === 'major' ? 1 : 0.8; if (v > base) { base = v; inside = p; } }
      else {
        const gap = Math.min(Math.abs(mid - p.from), Math.abs(mid - p.to)) / 3600000;
        if (gap < 1.5) base = Math.max(base, (p.type === 'major' ? 0.65 : 0.55) - gap * 0.15);
      }
    });
    const ph = solunar(t, lat, lng, sun).phaseStrength;
    return { v: clamp(base * (0.75 + 0.25 * ph), 0, 1), inside };
  }

  // ---------- Oro kodai ----------
  function wx(code, isDay = true) {
    if (code === 0) return { i: isDay ? '☀️' : '🌙', t: 'Giedra' };
    if (code <= 2) return { i: isDay ? '🌤️' : '☁️', t: 'Mažai debesuota' };
    if (code === 3) return { i: '☁️', t: 'Debesuota' };
    if (code <= 48) return { i: '🌫️', t: 'Rūkas' };
    if (code <= 57) return { i: '🌦️', t: 'Dulksna' };
    if (code <= 67) return { i: '🌧️', t: 'Lietus' };
    if (code <= 77) return { i: '🌨️', t: 'Sniegas' };
    if (code <= 82) return { i: '🌧️', t: 'Liūtis' };
    if (code <= 86) return { i: '🌨️', t: 'Snygis' };
    return { i: '⛈️', t: 'Perkūnija' };
  }
  const windDir = deg => ['Š', 'ŠR', 'R', 'PR', 'P', 'PV', 'V', 'ŠV'][Math.round(deg / 45) % 8];

  // ---------- Orai ----------
  const CACHE_MIN = 30;
  const mem = {};
  function revive(d) {
    d.hours.forEach(h => { h.t = new Date(h.t); });
    d.days.forEach(x => { x.date = new Date(x.date); x.sunrise = new Date(x.sunrise); x.sunset = new Date(x.sunset); });
    return d;
  }
  async function weather(spot) {
    const d = await weatherRaw(spot);
    d.lat = spot.lat; d.lng = spot.lng;
    return d;
  }
  async function weatherRaw(spot) {
    const key = 'wx_' + spot.id;
    if (mem[key] && Date.now() - mem[key].at < CACHE_MIN * 60000) return mem[key].data;
    let cached = sess.get(key);
    if (cached) { cached.data = revive(cached.data); mem[key] = cached; }
    if (cached && Date.now() - cached.at < CACHE_MIN * 60000) return cached.data;
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + spot.lat + '&longitude=' + spot.lng +
      '&hourly=temperature_2m,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation,precipitation_probability,weather_code,is_day' +
      '&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max' +
      '&current=temperature_2m,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover,weather_code,relative_humidity_2m,precipitation,is_day' +
      '&timezone=Europe%2FVilnius&forecast_days=7&past_days=1&wind_speed_unit=ms';
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 9000);
      const r = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = normalize(await r.json());
      sess.set(key, { at: Date.now(), data });
      mem[key] = { at: Date.now(), data };
      return data;
    } catch (e) {
      if (cached) return Object.assign({}, cached.data, { stale: true });
      return synthetic(spot);
    }
  }

  // Vienu užklausimu parsiunčia orus visiems telkiniams, kurių nėra podėlyje.
  let allPromise = null;
  function weatherAll() {
    if (allPromise) return allPromise;
    allPromise = (async () => {
      const need = SPOTS.filter(s => { const c = sess.get('wx_' + s.id); return !c || Date.now() - c.at > CACHE_MIN * 60000; });
      if (need.length) {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + need.map(s => s.lat).join(',') + '&longitude=' + need.map(s => s.lng).join(',') +
          '&hourly=temperature_2m,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation,precipitation_probability,weather_code,is_day' +
          '&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max' +
          '&current=temperature_2m,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover,weather_code,relative_humidity_2m,precipitation,is_day' +
          '&timezone=Europe%2FVilnius&forecast_days=7&past_days=1&wind_speed_unit=ms';
        try {
          const r = await fetch(url);
          if (!r.ok) throw new Error('HTTP ' + r.status);
          let j = await r.json();
          if (!Array.isArray(j)) j = [j];
          j.forEach((x, i) => {
            const data = normalize(x);
            sess.set('wx_' + need[i].id, { at: Date.now(), data });
            mem['wx_' + need[i].id] = { at: Date.now(), data };
          });
        } catch (e) { /* kiekvienas telkinys vėliau gaus atsarginius duomenis */ }
      }
      const out = {};
      await Promise.all(SPOTS.map(async s => { out[s.id] = await weather(s); }));
      allPromise = null;
      return out;
    })();
    return allPromise;
  }

  function normalize(j) {
    const h = j.hourly;
    const hours = h.time.map((t, i) => ({
      t: new Date(t), temp: h.temperature_2m[i], p: h.surface_pressure[i], wind: h.wind_speed_10m[i], wdir: h.wind_direction_10m[i],
      cloud: h.cloud_cover[i], rain: h.precipitation[i], rainP: h.precipitation_probability[i], code: h.weather_code[i], day: !!h.is_day[i],
    }));
    const d = j.daily;
    const days = d.time.map((t, i) => ({
      date: new Date(t + 'T12:00'), sunrise: new Date(d.sunrise[i]), sunset: new Date(d.sunset[i]),
      tmax: d.temperature_2m_max[i], tmin: d.temperature_2m_min[i], code: d.weather_code[i], rain: d.precipitation_sum[i], wind: d.wind_speed_10m_max[i],
    }));
    const c = j.current;
    const current = { temp: c.temperature_2m, p: c.surface_pressure, wind: c.wind_speed_10m, wdir: c.wind_direction_10m, cloud: c.cloud_cover,
      code: c.weather_code, hum: c.relative_humidity_2m, rain: c.precipitation, day: !!c.is_day };
    return { hours, days, current, live: true };
  }

  // Atsarginiai duomenys be interneto — deterministiški pagal telkinį ir dieną.
  function synthetic(spot) {
    let seed = [...spot.id].reduce((a, c) => a + c.charCodeAt(0), 0) + Math.floor(Date.now() / 86400000);
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - 1);
    const month = start.getMonth();
    const base = [-3, -2, 2, 8, 14, 17, 19, 18, 13, 8, 3, -1][month];
    const hours = []; let p = 1012 + rnd() * 10;
    for (let i = 0; i < 24 * 8; i++) {
      const t = new Date(start.getTime() + i * 3600000);
      const hr = t.getHours();
      p += (rnd() - 0.5) * 1.2;
      const temp = base + 5 * Math.sin((hr - 9) / 24 * 2 * Math.PI) + (rnd() - .5) * 2;
      const cloud = clamp(50 + (rnd() - .5) * 90, 0, 100);
      const rain = cloud > 80 && rnd() > .6 ? +(rnd() * 1.5).toFixed(1) : 0;
      hours.push({ t, temp, p, wind: 1 + rnd() * 6, wdir: rnd() * 360, cloud, rain, rainP: rain ? 70 : 10, code: rain ? 61 : cloud > 70 ? 3 : cloud > 30 ? 2 : 0, day: hr >= 7 && hr < 19 });
    }
    const days = [];
    for (let d = 0; d < 8; d++) {
      const hs = hours.slice(d * 24, d * 24 + 24);
      const date = new Date(start.getTime() + d * 86400000 + 12 * 3600000);
      const sr = new Date(date); sr.setHours(6, 30, 0, 0); const ss = new Date(date); ss.setHours(19, 0, 0, 0);
      days.push({ date, sunrise: sr, sunset: ss, tmax: Math.max(...hs.map(h => h.temp)), tmin: Math.min(...hs.map(h => h.temp)), code: hs[13].code, rain: hs.reduce((a, h) => a + h.rain, 0), wind: Math.max(...hs.map(h => h.wind)) });
    }
    const now = hours.find(h => h.t.getHours() === new Date().getHours() && h.t.getDate() === new Date().getDate()) || hours[30];
    return { hours, days: days.slice(1), current: { ...now, hum: 75 }, live: false };
  }

  // ---------- Kibimo balas ----------
  // Grąžina { score, factors[] } valandai idx, pasirinktai rūšiai (arba bendrai).
  function biteAt(wxd, idx, speciesId) {
    const hs = wxd.hours;
    const h = hs[idx]; if (!h) return { score: 0, factors: [] };
    const sp = speciesId ? SPECIES[speciesId] : null;
    const prev = hs[Math.max(0, idx - 3)];
    const trend = h.p - prev.p; // hPa per 3 val.
    const factors = [];

    // Slėgis
    let fP = 1 - Math.min(1, Math.abs(h.p - 1013) / 25);
    if (trend < -0.4 && trend > -2.5) fP += sp && sp.pressureFall ? 0.35 : sp ? 0.05 : 0.2;
    else if (trend <= -2.5 || trend >= 2.5) fP -= 0.35;
    else if (Math.abs(trend) <= 0.4) fP += sp && !sp.pressureFall ? 0.25 : 0.1;
    fP = clamp(fP, 0, 1);
    factors.push({ k: 'Slėgis', i: '🧭', v: fP, txt: Math.round(h.p) + ' hPa ' + (trend < -0.4 ? '↘ krenta' : trend > 0.4 ? '↗ kyla' : '→ stabilus') });

    // Vėjas
    const wOpt = sp ? 1 + sp.wind * 5 : 3.5;
    const fW = clamp(1 - Math.abs(h.wind - wOpt) / 7, 0, 1) * (h.wind > 10 ? 0.4 : 1);
    factors.push({ k: 'Vėjas', i: '💨', v: fW, txt: h.wind.toFixed(1) + ' m/s ' + windDir(h.wdir) });

    // Temperatūra (vandens apytikslė — 48 val. vidurkis)
    const lo = Math.max(0, idx - 48);
    const water = hs.slice(lo, idx + 1).reduce((a, x) => a + x.temp, 0) / (idx - lo + 1);
    const [tmin, tmax] = sp ? sp.temp : [8, 22];
    const fT = water < tmin ? clamp(1 - (tmin - water) / 10, 0, 1) : water > tmax ? clamp(1 - (water - tmax) / 8, 0, 1) : 1;
    factors.push({ k: 'Vandens t° (apyt.)', i: '🌡️', v: fT, txt: Math.max(0.5, water).toFixed(1) + ' °C' });

    // Debesuotumas
    const fC = clamp(1 - Math.abs(h.cloud - 60) / 80, 0.2, 1);
    factors.push({ k: 'Debesys', i: '☁️', v: fC, txt: Math.round(h.cloud) + ' %' });

    // Paros metas
    const day = wxd.days.find(d => d.date.toDateString() === h.t.toDateString());
    let fD = 0.45;
    if (day) {
      const mins = x => Math.abs(h.t - x) / 60000;
      const near = Math.min(mins(day.sunrise), mins(day.sunset));
      if (near < 90) fD = 1; else if (near < 180) fD = 0.75;
      if (!h.day) fD = sp && sp.night ? Math.max(fD, 0.85) : Math.min(fD, 0.35);
    }
    factors.push({ k: 'Paros metas', i: h.day ? '🌅' : '🌙', v: fD, txt: !h.day ? 'Naktis' : fD >= 1 ? 'Rytmetis / vakaras' : fD >= 0.75 ? 'Arti prieblandos' : 'Diena' });

    // Krituliai
    const fR = h.rain === 0 ? 0.7 : h.rain < 1 ? 1 : h.rain < 3 ? 0.55 : 0.2;
    factors.push({ k: 'Krituliai', i: '🌧️', v: fR, txt: h.rain ? h.rain.toFixed(1) + ' mm' : 'nėra' });

    // Solunaras: mėnulio padėtis (didieji / mažieji periodai) ir fazė
    const m = moon(h.t);
    let fS = 0.6 + 0.4 * Math.abs(Math.cos(2 * Math.PI * m.phase)), sTxt = m.name;
    if (wxd.lat != null) {
      const so = solunarAt(h.t, wxd.lat, wxd.lng, day);
      fS = so.v;
      sTxt = so.inside ? (so.inside.type === 'major' ? 'Didysis periodas' : 'Mažasis periodas') + ' · ' + m.name.toLowerCase() : 'Už periodų · ' + m.name.toLowerCase();
    }
    factors.push({ k: 'Solunaras', i: m.icon, v: fS, txt: sTxt });

    const w = { Slėgis: 0.22, Vėjas: 0.12, 'Vandens t° (apyt.)': 0.18, Debesys: 0.08, 'Paros metas': 0.18, Krituliai: 0.08, Solunaras: 0.14 };
    let s = factors.reduce((a, f) => a + f.v * w[f.k], 0);
    const score = clamp(Math.round(Math.pow(s, 1.7) * 104), 3, 99);
    return { score, factors, hour: h };
  }

  function nowIndex(wxd) {
    const now = Date.now();
    let best = 0, bd = Infinity;
    wxd.hours.forEach((h, i) => { const d = Math.abs(h.t - now); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function dayScores(wxd, speciesId) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return wxd.days.filter(d => d.date >= today).map(d => {
      const idxs = wxd.hours.map((h, i) => h.t.toDateString() === d.date.toDateString() ? i : -1).filter(i => i >= 0);
      const scores = idxs.map(i => ({ i, s: biteAt(wxd, i, speciesId).score }));
      const top = scores.slice().sort((a, b) => b.s - a.s);
      const avg = top.slice(0, 6).reduce((a, x) => a + x.s, 0) / Math.max(1, Math.min(6, top.length));
      return { day: d, score: Math.round(avg), hours: scores, best: top[0] };
    });
  }
  function bestWindows(scores, wxd) {
    // ištisinės valandų atkarpos, kur balas ≥ 85 % dienos maksimumo
    const max = Math.max(...scores.map(s => s.s));
    const win = []; let cur = null;
    scores.forEach(s => {
      if (s.s >= max * 0.88) { if (!cur) cur = { from: s.i, to: s.i, max: s.s }; else { cur.to = s.i; cur.max = Math.max(cur.max, s.s); } }
      else if (cur) { win.push(cur); cur = null; }
    });
    if (cur) win.push(cur);
    return win.sort((a, b) => b.max - a.max).slice(0, 3).map(w => ({ from: wxd.hours[w.from].t, to: new Date(wxd.hours[w.to].t.getTime() + 3600000), score: w.max }));
  }
  const level = s => s >= 70 ? { cls: 'good', t: 'Puikus kibimas', c: '#00ffbf' } : s >= 50 ? { cls: 'mid', t: 'Vidutinis kibimas', c: '#ffc24b' } : { cls: 'bad', t: 'Silpnas kibimas', c: '#ff5d73' };
  const scoreColor = s => s >= 70 ? '#00ffbf' : s >= 50 ? '#ffc24b' : '#ff5d73';
  const hhmm = d => d.toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' });

  // ---------- KIBK AI ----------
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const SPECIES_KEYS = Object.keys(SPECIES).map(id => ({ id, keys: [norm(SPECIES[id].name).slice(0, 5)] }));
  SPECIES_KEYS.find(x => x.id === 'eserys').keys.push('eser');
  SPECIES_KEYS.find(x => x.id === 'karsis').keys.push('karš', 'kars');
  SPECIES_KEYS.find(x => x.id === 'samas').keys.push('sam');
  SPECIES_KEYS.find(x => x.id === 'starkis').keys.push('stark', 'sterk');
  SPECIES_KEYS.find(x => x.id === 'vegele').keys.push('veg');

  async function ask(text, ctx) {
    const q = norm(text);
    const sp = SPECIES_KEYS.find(x => x.keys.some(k => q.includes(norm(k))));
    const spot = SPOTS.find(s => q.includes(norm(s.name).split(/[ (.]/)[0].slice(0, 5)));
    const target = spot || ctx.spot;
    const wxd = await weather(target);
    const idx = nowIndex(wxd);
    const b = biteAt(wxd, idx, sp && sp.id);
    const ds = dayScores(wxd, sp && sp.id);
    const L = level(b.score);
    const S = sp ? SPECIES[sp.id] : null;
    const has = (...w) => w.some(x => q.includes(x));
    const out = [];

    if (has('labas', 'sveik', 'laba diena', 'hello', 'hi ')  && q.length < 25) {
      return 'Labas! 🎣 Aš — <b>KIBK AI</b>. Galiu pasakyti, <b>kada</b> ir <b>kur</b> kibs, <b>kokį masalą</b> rinktis ir kaip žvejoti konkrečią žuvį. Paklausk, pvz.: „Kuo gaudyti lydeką Platelių ežere?“';
    }
    if (has('aciu', 'dekui')) return 'Visada prašom! Tegul kimba 🐟 Jei ką — klausk.';

    if (has('taisykl', 'draudim', 'leidim', 'mega', 'dydis')) {
      return 'Žvejybos mėgėjų taisyklės nustato <b>draudimo laikotarpius</b>, <b>minimalius dydžius</b> ir <b>paros limitus</b>. Jos keičiasi, todėl prieš žvejybą visada pasitikrink galiojančią redakciją aplinkos ministerijos tinklalapyje ir įsigyk mėgėjo žvejo bilietą (galima per programėlę „Žvejo bilietas“). Saugomose teritorijose gali galioti papildomi apribojimai.';
    }
    if (has('mazg', 'surist')) {
      return 'Patikimiausi mazgai:<ul><li><b>Palomaras</b> — kabliukams ir segtukams, ypač pintam valui.</li><li><b>Pagerintas klinčas</b> — monofilamentui.</li><li><b>FG mazgas</b> — pinto valo ir fluorokarbono pavadėliui sujungti.</li></ul>Prieš priveržiant — sudrėkink valą, kad neįkaistų.';
    }

    const where = '<b>' + target.name + '</b>';
    if (has('kada', 'kelint', 'laik', 'valand', 'siandien', 'rytoj', 'prognoz', 'kibs', 'kimba', 'kibimas')) {
      const tomorrow = has('rytoj');
      const d = tomorrow ? ds[1] : ds.find(x => x.day.date.toDateString() === new Date().toDateString()) || ds[0];
      const wins = bestWindows(d.hours, wxd);
      out.push((tomorrow ? 'Rytoj' : 'Šiandien') + ' telkinyje ' + where + ' kibimo balas — <b>' + d.score + '%</b>' + (S ? ' · ' + S.emoji + ' ' + S.name : '') + '.');
      if (wins.length) out.push('Geriausi langai:<ul>' + wins.map(w => '<li>' + hhmm(w.from) + '–' + hhmm(w.to) + ' — iki <b>' + w.score + '%</b></li>').join('') + '</ul>');
      const so = solunar(d.day.date, target.lat, target.lng, d.day);
      if (so.major.length && !has('menul', 'solunar', 'period', 'garmin')) out.push('🌙 Solunaro didieji periodai: ' + so.major.slice().sort((a, b) => a.from - b.from).map(p => '<b>' + hhmm(p.from) + '–' + hhmm(p.to) + '</b>').join(', ') + (so.minor.length ? '; mažieji: ' + so.minor.map(p => hhmm(p.from) + '–' + hhmm(p.to)).join(', ') : '') + '. Solunaro diena — ' + so.rating.t.toLowerCase() + '.');
      const best = ds.slice().sort((a, b) => b.score - a.score)[0];
      out.push('Savaitėje stipriausia diena — <b>' + best.day.date.toLocaleDateString('lt-LT', { weekday: 'long' }) + '</b> (' + best.score + '%).');
    }
    if (S && has('kuo', 'masal', 'gaud', 'kaip', 'jauk', 'ant ko')) {
      out.push(S.emoji + ' <b>' + S.name + '</b>: geriausi masalai —<ul>' + S.baits.map(x => '<li>' + x + '</li>').join('') + '</ul>Ieškok: ' + S.depth + '. Geriausia: ' + S.best + '.');
    } else if (has('masal', 'kuo gaud', 'ant ko', 'jauk')) {
      const h = b.hour;
      const pred = h.cloud > 60 || h.wind > 3;
      out.push('Dabar telkinyje ' + where + ' ' + (pred ? 'debesuota/vėjuota — tinka <b>ryškesni, triukšmingesni masalai</b>: sukrės, vobleriai su barškučiais.' : 'ramu ir šviesu — rinkis <b>natūralių spalvų, mažesnius</b> masalus ir plonesnį valą.'));
      out.push('Šiame telkinyje dažniausios: ' + target.species.map(id => SPECIES[id].name.toLowerCase()).join(', ') + '. Paklausk apie konkrečią rūšį — duosiu tikslius masalus.');
    }
    if (has('gyl', 'kur ', 'kur?', 'vieta', 'kur gaud', 'kur zvej', 'telkin', 'ezer')) {
      if (S) {
        const scored = await topSpots(sp.id, 3);
        out.push('Kur ieškoti ' + S.name.toLowerCase() + 's: <b>' + S.depth + '</b>.');
        out.push('Šiuo metu ' + S.name.toLowerCase() + 'i palankiausi telkiniai:<ul>' + scored.map(x => '<li>' + x.spot.name + ' — <b>' + x.score + '%</b></li>').join('') + '</ul>');
      } else {
        out.push(where + ': maks. gylis <b>' + target.depth + ' m</b>' + (target.area ? ', plotas ' + target.area + ' ha' : '') + '. Plėšrūnų ieškok ties gylio perėjimais, taikiųjų žuvų — prie augmenijos ribos ir duobėse.');
      }
    }
    if (has('menul', 'solunar', 'period', 'garmin')) {
      const today = wxd.days.find(x => x.date.toDateString() === new Date().toDateString()) || wxd.days[0];
      const so = solunar(new Date(), target.lat, target.lng, today);
      out.push(so.moon.icon + ' Šiandien telkinyje ' + where + ': ' + so.moon.name.toLowerCase() + ' (' + so.moon.illum + '%), solunaro diena — <b>' + so.rating.t.toLowerCase() + '</b>.' +
        '<ul>' + so.periods.map(p => '<li>' + (p.type === 'major' ? '<b>Didysis</b>' : 'Mažasis') + ' ' + hhmm(p.from) + '–' + hhmm(p.to) + ' <span class="dim">(' + p.lbl.toLowerCase() + ')</span></li>').join('') + '</ul>' +
        'Didieji periodai — kai mėnulis virš galvos ar po kojomis, mažieji — kai jis teka ar leidžiasi. Jie sudaro 14 % kibimo balo.');
    }
    if (has('oras', 'orai', 'vej', 'slegis', 'temperat', 'lietus')) {
      const c = wxd.current; const w = wx(c.code, c.day);
      out.push('Dabar telkinyje ' + where + ': ' + w.i + ' ' + w.t.toLowerCase() + ', <b>' + Math.round(c.temp) + '°C</b>, vėjas ' + c.wind.toFixed(1) + ' m/s ' + windDir(c.wdir) + ', slėgis ' + Math.round(c.p) + ' hPa.');
    }
    if (!out.length && S) {
      out.push(S.emoji + ' <b>' + S.name + '</b> dabar telkinyje ' + where + ' — <b>' + b.score + '%</b> (' + L.t.toLowerCase() + ').');
      out.push('Masalai: ' + S.baits.join(', ') + '. Ieškok: ' + S.depth + '. Geriausia: ' + S.best + '.');
    }
    if (!out.length) {
      const top = b.factors.slice().sort((a, b) => b.v - a.v);
      out.push('Dabar telkinyje ' + where + ' bendras kibimo balas — <b>' + b.score + '%</b> (' + L.t.toLowerCase() + ').');
      out.push('Labiausiai padeda: ' + top.slice(0, 2).map(f => f.k.toLowerCase() + ' (' + f.txt + ')').join(', ') + '. Labiausiai trukdo: ' + top[top.length - 1].k.toLowerCase() + ' (' + top[top.length - 1].txt + ').');
      out.push('💡 ' + TIPS[Math.floor(Math.random() * TIPS.length)]);
    }
    if (!wxd.live) out.push('<span class="dim">(Be ryšio — naudojami apytiksliai orai.)</span>');
    return out.join('<br><br>');
  }

  async function topSpots(speciesId, n, list = SPOTS) {
    const all = await weatherAll();
    const cand = list.filter(s => !speciesId || s.species.includes(speciesId));
    const res = cand.map(s => { const w = all[s.id]; return { spot: s, score: biteAt(w, nowIndex(w), speciesId).score }; });
    return res.sort((a, b) => b.score - a.score).slice(0, n);
  }

  return { store, weather, weatherAll, solunar, biteAt, nowIndex, dayScores, bestWindows, level, scoreColor, moon, wx, windDir, ask, topSpots, spotById, distKm, hhmm, clamp };
})();
