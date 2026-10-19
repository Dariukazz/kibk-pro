(function () {
  const { SPECIES, SPOTS, TYPE_LABEL, BAIT_MACHINES, ACHIEVEMENTS, TIPS } = window.KIBK_DATA;
  const K = window.KIBK;
  const { store } = K;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const view = $('#view');

  // ---------- Ikonos ----------
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    forecast: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    ai: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    fish: '<path d="M6.5 12c3-5 9-6 13.5 0-4.5 6-10.5 5-13.5 0z"/><path d="M6.5 12 2 8v8z"/><circle cx="16" cy="11" r=".8" fill="currentColor"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    send: '<path d="M4 12 20 4l-6 16-3-7z"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M22 20a7 7 0 0 0-4-6.3"/>',
    store: '<path d="M4 9h16l-1-5H5zM5 9v11h14V9"/><path d="M10 20v-5h4v5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7"/>',
    logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5M4 4h16"/>',
    crown: '<path d="M3 7l4 4 5-6 5 6 4-4-2 12H5z"/>',
  };
  const ic = (n, extra = '') => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' + extra + '>' + P[n] + '</svg>';

  const NAV = [
    ['dashboard', 'Pradžia', 'home'], ['forecast', 'Prognozė', 'forecast'], ['ai-assistant', 'KIBK AI', 'ai'],
    ['map', 'Žemėlapis', 'map'], ['turnyrai', 'Turnyrai', 'trophy'], ['profile', 'Profilis', 'user'],
  ];

  // ---------- Būsena ----------
  const state = {
    get spotId() { return store.get('spot', 'galve'); },
    set spotId(v) { store.set('spot', v); },
    get spot() { return K.spotById(this.spotId) || SPOTS[0]; },
  };

  // ---------- Paskyros ----------
  const auth = {
    users() { return store.get('users', {}); },
    current() { const e = store.get('session', null); return e ? this.users()[e] || null : null; },
    key() { const u = this.current(); return u ? u.email : 'guest'; },
    save(u) { const all = this.users(); all[u.email] = u; store.set('users', all); },
    async hash(pw) {
      try {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('kibk:' + pw));
        return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) { let h = 0; for (const c of 'kibk:' + pw) h = (h * 31 + c.charCodeAt(0)) | 0; return 'x' + h; }
    },
  };
  const userData = {
    get(k, def) { return store.get(k + '_' + auth.key(), def); },
    set(k, v) { return store.set(k + '_' + auth.key(), v); },
  };
  const catches = () => userData.get('catches', []);
  const displayName = () => (auth.current() || {}).name || 'Žvejys';

  // ---------- UI pagalbinės ----------
  function toast(msg, type = 'ok') {
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = (type === 'ok' ? '✅' : type === 'err' ? '⚠️' : 'ℹ️') + ' <span>' + msg + '</span>';
    $('#toasts').appendChild(el);
    setTimeout(() => { el.style.transition = '.3s'; el.style.opacity = 0; setTimeout(() => el.remove(), 300); }, 3200);
  }
  function modal(title, body, onMount) {
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = '<div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>' + title + '</h2><button class="x" data-close aria-label="Uždaryti">' + ic('x') + '</button></div><div class="modal-body">' + body + '</div></div>';
    document.body.appendChild(bg);
    const close = () => { bg.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    bg.addEventListener('mousedown', e => { if (e.target === bg) close(); });
    $$('[data-close]', bg).forEach(b => b.addEventListener('click', close));
    if (onMount) onMount(bg, close);
    const f = $('input,select,textarea', bg); if (f && f.type !== 'file') setTimeout(() => f.focus(), 50);
    return close;
  }
  function ring(score, size = '', label = 'kibimas') {
    const r = 70, c = 2 * Math.PI * r, col = K.scoreColor(score);
    return '<div class="ring ' + size + '"><svg viewBox="0 0 160 160"><defs><linearGradient id="rg' + score + '" x1="0" x2="1"><stop offset="0" stop-color="' + col + '"/><stop offset="1" stop-color="#2ee6ff"/></linearGradient></defs>' +
      '<circle class="track" cx="80" cy="80" r="' + r + '" fill="none" stroke-width="12"/>' +
      '<circle class="val" cx="80" cy="80" r="' + r + '" fill="none" stroke="url(#rg' + score + ')" stroke-width="12" stroke-dasharray="' + c + '" stroke-dashoffset="' + c + '" data-off="' + (c * (1 - score / 100)) + '"/></svg>' +
      '<div class="center"><div><div class="big">' + score + '<span style="font-size:.45em">%</span></div>' + (size ? '' : '<div class="lbl">' + label + '</div>') + '</div></div></div>';
  }
  function animateRings(root = view) {
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.ring .val', root).forEach(c => { c.style.strokeDashoffset = c.dataset.off; })));
  }
  function spotOptions(sel) {
    const groups = {};
    SPOTS.forEach(s => { (groups[s.type] = groups[s.type] || []).push(s); });
    return Object.keys(groups).map(t => '<optgroup label="' + TYPE_LABEL[t] + '">' + groups[t].map(s => '<option value="' + s.id + '"' + (s.id === sel ? ' selected' : '') + '>' + s.name + '</option>').join('') + '</optgroup>').join('');
  }
  function speciesOptions(sel, any) {
    return (any ? '<option value="">Visos rūšys</option>' : '') + Object.entries(SPECIES).map(([id, s]) => '<option value="' + id + '"' + (id === sel ? ' selected' : '') + '>' + s.name + '</option>').join('');
  }
  const fmtDate = d => new Date(d).toLocaleDateString('lt-LT', { month: 'short', day: 'numeric' });
  const fmtDT = d => new Date(d).toLocaleString('lt-LT', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const loading = () => '<div class="page"><div class="skeleton" style="height:40px;width:260px;margin-bottom:24px"></div><div class="grid g3"><div class="skeleton" style="height:240px"></div><div class="skeleton" style="height:240px"></div><div class="skeleton" style="height:240px"></div></div></div>';
  const offlineBanner = w => w.live ? (w.stale ? '<div class="banner">📴 Rodomi paskutiniai išsaugoti orai — nepavyko atnaujinti.</div>' : '') : '<div class="banner">📴 Nėra ryšio su orų tarnyba — rodomi apytiksliai duomenys.</div>';

  function compressImage(file, max = 900, q = 0.72) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onerror = rej;
      fr.onload = () => {
        const img = new Image();
        img.onerror = () => rej(new Error('Nepavyko nuskaityti nuotraukos (HEIC gali būti nepalaikomas naršyklės).'));
        img.onload = () => {
          const s = Math.min(1, max / Math.max(img.width, img.height));
          const cv = document.createElement('canvas');
          cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          res({ url: cv.toDataURL('image/jpeg', q), canvas: cv });
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  // ---------- Pasiekimai ----------
  function streaks(list) {
    const days = [...new Set(list.map(c => new Date(c.date).toDateString()))].map(d => new Date(d).getTime()).sort((a, b) => a - b);
    let best = 0, run = 0, prev = null;
    days.forEach(d => { run = prev && Math.round((d - prev) / 86400000) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = d; });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const last = days[days.length - 1];
    const current = last != null && (today - last) / 86400000 <= 1 ? run : 0;
    return { best, current };
  }
  function achievements() {
    const c = catches();
    const st = streaks(c);
    const stats = userData.get('stats', {});
    const has = {
      first_catch: c.length >= 1,
      big_catch: c.some(x => x.weight >= 5),
      predator_hunter: c.filter(x => SPECIES[x.species] && SPECIES[x.species].predator).length >= 10,
      carp_master: c.filter(x => x.species === 'karpis').length >= 5,
      collector: new Set(c.map(x => x.species)).size >= 5,
      explorer: new Set(c.map(x => x.spot)).size >= 3,
      early_bird: c.some(x => new Date(x.date).getHours() < 7),
      streak_7: st.best >= 7,
      marathon: c.length >= 50,
      photo_reporter: c.filter(x => x.photo).length >= 5,
      first_scan: !!stats.scans,
      ai_expert: (stats.ai || 0) >= 20,
      chat_master: (stats.chat || 0) >= 10,
      accurate: c.filter(x => x.bite >= 70).length >= 5,
      conservationist: c.filter(x => x.released).length >= 5,
      premium: !!userData.get('premium', false),
    };
    return ACHIEVEMENTS.map(a => Object.assign({}, a, { got: !!has[a.id] }));
  }
  function bump(stat) {
    const before = new Set(achievements().filter(a => a.got).map(a => a.id));
    const s = userData.get('stats', {}); s[stat] = (s[stat] || 0) + 1; userData.set('stats', s);
    announce(before);
  }
  function announce(before) {
    achievements().filter(a => a.got && !before.has(a.id)).forEach(a => toast('🏅 Naujas pasiekimas: <b>' + a.name + '</b>'));
  }
  const gotSet = () => new Set(achievements().filter(a => a.got).map(a => a.id));

  // ---------- Karkasas ----------
  function shell() {
    const links = NAV.map(([r, t, i]) => '<a href="#/' + r + '" class="nav-link" data-r="' + r + '">' + ic(i) + '<span>' + t + '</span>' + (r === 'ai-assistant' ? '<span class="pill">AI</span>' : '') + '</a>').join('');
    $('#sidebar').innerHTML = '<a href="#/dashboard" class="brand"><div class="brand-logo">' + ic('fish') + '</div><div><div class="brand-name">kibk<span>.pro</span></div><div class="brand-sub">Žvejybos gidas</div></div></a>' + links +
      '<div class="sidebar-foot"><b>🎣 Kibimo prognozė realiu laiku</b>Orai, slėgis, mėnulis ir paros metas — viename bale.</div>';
    $('#bottomNav').innerHTML = NAV.map(([r, t, i]) => '<a href="#/' + r + '" data-r="' + r + '">' + ic(i) + '<span>' + t + '</span></a>').join('');
  }
  function setActive(r) {
    $$('[data-r]').forEach(a => a.classList.toggle('active', a.dataset.r === r));
  }

  let cleanup = null;
  async function route() {
    if (cleanup) { cleanup(); cleanup = null; }
    const hash = location.hash.replace(/^#\/?/, '') || 'dashboard';
    const [path, qs] = hash.split('?');
    const parts = path.split('/');
    const params = new URLSearchParams(qs || '');
    const r = parts[0];
    setActive(r);
    window.scrollTo(0, 0);
    const pages = { dashboard: Dashboard, forecast: Forecast, 'ai-assistant': AI, map: MapPage, turnyrai: Tournaments, profile: Profile };
    const fn = pages[r] || Dashboard;
    try { await fn(parts.slice(1), params); }
    catch (e) { console.error(e); view.innerHTML = '<div class="page"><div class="card empty"><div class="big-ico">🛶</div><h2>Įvyko klaida</h2><p class="muted">' + esc(e.message) + '</p><button class="btn primary" onclick="location.reload()">Perkrauti</button></div></div>'; }
  }

  // =========================================================
  // PRADŽIA
  // =========================================================
  async function Dashboard() {
    view.innerHTML = loading();
    const spot = state.spot;
    const w = await K.weather(spot);
    const idx = K.nowIndex(w);
    const b = K.biteAt(w, idx);
    const L = K.level(b.score);
    const ds = K.dayScores(w);
    const today = ds.find(d => d.day.date.toDateString() === new Date().toDateString()) || ds[0];
    const wins = K.bestWindows(today.hours, w);
    const c = w.current, wi = K.wx(c.code, c.day), m = K.moon(new Date());
    const hr = new Date().getHours();
    const greet = hr < 11 ? 'Labas rytas' : hr < 18 ? 'Laba diena' : 'Labas vakaras';
    const spScores = spot.species.map(id => ({ id, s: K.biteAt(w, idx, id).score })).sort((a, b) => b.s - a.s);
    const my = catches();
    const tip = TIPS[new Date().getDate() % TIPS.length];
    const np = nextPeriod(w);

    view.innerHTML = '<div class="page">' + offlineBanner(w) +
      '<div class="page-head"><div><div class="eyebrow">' + new Date().toLocaleDateString('lt-LT', { weekday: 'long', month: 'long', day: 'numeric' }) + '</div><h1 class="title">' + greet + ', <span class="grad-text">' + esc(displayName()) + '</span> 👋</h1></div>' +
      '<div class="row-gap"><select class="input" id="spotSel" style="width:240px">' + spotOptions(spot.id) + '</select><button class="btn icon" id="nearBtn" title="Artimiausias telkinys">' + ic('locate') + '</button></div></div>' +

      '<div class="grid g3">' +
        '<div class="card hi span2"><div class="hero">' + ring(b.score) +
          '<div style="flex:1;min-width:0"><span class="tag ' + L.cls + '">● ' + L.t + '</span>' +
          '<h2 style="font-size:26px;margin:12px 0 6px">' + spot.name + '</h2><div class="muted">' + TYPE_LABEL[spot.type] + ' · ' + spot.region + ' · gylis iki ' + spot.depth + ' m</div>' +
          '<div class="row-gap mt">' + (wins.length ? wins.map(x => '<span class="chip on">⏱ ' + K.hhmm(x.from) + '–' + K.hhmm(x.to) + ' · ' + x.score + '%</span>').join('') : '') + (np ? '<span class="chip" style="border-color:rgba(255,214,102,.45);color:#ffd666;background:rgba(255,214,102,.08)">🌙 ' + (np.from <= Date.now() ? 'Dabar ' : '') + (np.type === 'major' ? 'didysis' : 'mažasis') + ' ' + K.hhmm(np.from) + '–' + K.hhmm(np.to) + '</span>' : '') + '</div>' +
          '<div class="row-gap mt"><a class="btn primary" href="#/forecast">Visa prognozė</a><a class="btn" href="#/ai-assistant">' + ic('ai') + 'Klausti AI</a></div></div></div></div>' +

        '<div class="card"><div class="card-head"><h2>Orai dabar</h2><span style="font-size:30px">' + wi.i + '</span></div>' +
          '<div class="num" style="font-size:44px;font-weight:700">' + Math.round(c.temp) + '°</div><div class="muted">' + wi.t + ' · drėgmė ' + Math.round(c.hum || 0) + '%</div>' +
          '<div class="grid g2 mt"><div class="stat-tile"><div class="ico">💨</div><div class="stat"><span class="v">' + c.wind.toFixed(1) + '</span><span class="k">m/s ' + K.windDir(c.wdir) + '</span></div></div>' +
          '<div class="stat-tile"><div class="ico">🧭</div><div class="stat"><span class="v">' + Math.round(c.p) + '</span><span class="k">hPa</span></div></div></div></div>' +
      '</div>' +

      '<div class="grid g4 mt">' +
        tile('🌅', K.hhmm(today.day.sunrise), 'Saulėtekis') + tile('🌇', K.hhmm(today.day.sunset), 'Saulėlydis') +
        tile(m.icon, m.illum + '%', m.name) + tile('🎣', my.length, 'Mano laimikiai') +
      '</div>' +

      '<div class="grid g3 mt">' +
        '<div class="card"><div class="card-head"><h2>Kas kimba čia</h2></div><div class="list">' +
          spScores.map(x => '<div><div class="row-gap" style="justify-content:space-between;margin-bottom:6px"><span>' + SPECIES[x.id].emoji + ' ' + SPECIES[x.id].name + '</span><b class="num" style="color:' + K.scoreColor(x.s) + '">' + x.s + '%</b></div><div class="bar"><i style="width:' + x.s + '%"></i></div></div>').join('') +
        '</div></div>' +
        '<div class="card"><div class="card-head"><h2>🏆 Top vietos dabar</h2><a class="btn sm" href="#/map">Žemėlapis</a></div><div class="list" id="topList">' +
          [1, 2, 3, 4, 5].map(() => '<div class="skeleton" style="height:54px"></div>').join('') + '</div></div>' +
        '<div class="card"><div class="card-head"><h2>Savaitė</h2></div><div class="list">' +
          ds.slice(0, 7).map(d => { const x = K.wx(d.day.code); return '<a class="row" href="#/forecast?day=' + d.day.date.toISOString().slice(0, 10) + '"><span style="font-size:22px">' + x.i + '</span><div class="grow"><div class="t" style="text-transform:capitalize">' + d.day.date.toLocaleDateString('lt-LT', { weekday: 'long' }) + '</div><div class="s">' + Math.round(d.day.tmin) + '° / ' + Math.round(d.day.tmax) + '°</div></div><b class="num" style="color:' + K.scoreColor(d.score) + '">' + d.score + '%</b></a>'; }).join('') +
        '</div></div>' +
      '</div>' +

      '<div class="grid g2 mt">' +
        '<div class="card"><div class="card-head"><h2>💡 Dienos patarimas</h2></div><p style="margin:0;line-height:1.6">' + tip + '</p></div>' +
        '<div class="card"><div class="card-head"><h2>Greiti veiksmai</h2></div><div class="grid g2">' +
          '<button class="action-tile" id="qCatch"><div class="ai">' + ic('pen') + '</div><div><b>Įrašyti laimikį</b><div class="muted" style="font-size:13px">Orai išsaugomi automatiškai</div></div></button>' +
          '<a class="action-tile" href="#/turnyrai"><div class="ai">' + ic('trophy') + '</div><div><b>Turnyrai</b><div class="muted" style="font-size:13px">Varžykis su draugais</div></div></a>' +
        '</div></div>' +
      '</div></div>';

    animateRings();
    $('#spotSel').onchange = e => { state.spotId = e.target.value; route(); };
    $('#nearBtn').onclick = locateNearest;
    $('#qCatch').onclick = () => catchForm();
    K.topSpots(null, 5).then(top => {
      const el = $('#topList'); if (!el) return;
      el.innerHTML = top.map((t, i) => '<button class="row" data-spot="' + t.spot.id + '"><span class="rank r' + (i + 1) + '">' + (i + 1) + '</span><div class="grow"><div class="t">' + t.spot.name + '</div><div class="s">' + t.spot.region + '</div></div><b class="num" style="color:' + K.scoreColor(t.score) + '">' + t.score + '%</b></button>').join('');
      $$('[data-spot]', el).forEach(b => b.onclick = () => { state.spotId = b.dataset.spot; location.hash = '#/forecast'; });
    });
  }
  const tile = (i, v, k) => '<div class="card" style="padding:18px"><div class="stat"><span style="font-size:22px">' + i + '</span><span class="v">' + v + '</span><span class="k">' + k + '</span></div></div>';

  function locateNearest() {
    if (!navigator.geolocation) return toast('Naršyklė nepalaiko vietos nustatymo', 'err');
    toast('Nustatoma vieta…', 'info');
    navigator.geolocation.getCurrentPosition(p => {
      const { latitude: a, longitude: b } = p.coords;
      const s = SPOTS.slice().sort((x, y) => K.distKm(a, b, x.lat, x.lng) - K.distKm(a, b, y.lat, y.lng))[0];
      state.spotId = s.id; toast('Artimiausias: ' + s.name + ' (' + Math.round(K.distKm(a, b, s.lat, s.lng)) + ' km)'); route();
    }, () => toast('Nepavyko nustatyti vietos', 'err'), { timeout: 10000 });
  }

  // =========================================================
  // PROGNOZĖ
  // =========================================================
  async function Forecast(_, params) {
    view.innerHTML = loading();
    const spot = state.spot;
    const w = await K.weather(spot);
    let species = params.get('sp') || store.get('fcSpecies', '');
    if (species && !SPECIES[species]) species = '';
    const ds = K.dayScores(w, species || null);
    const todayStr = new Date().toDateString();
    let dayIdx = Math.max(0, ds.findIndex(d => d.day.date.toISOString().slice(0, 10) === params.get('day')));
    if (!params.get('day')) dayIdx = Math.max(0, ds.findIndex(d => d.day.date.toDateString() === todayStr));
    let hourSel = null;
    const fav = new Set(store.get('favs', []));

    view.innerHTML = '<div class="page">' + offlineBanner(w) +
      '<div class="page-head"><div><div class="eyebrow">Kibimo prognozė</div><h1 class="title">' + spot.name + ' <button class="btn icon sm" id="favBtn" title="Mėgstamas" style="vertical-align:middle;color:' + (fav.has(spot.id) ? '#ffc24b' : 'inherit') + '">' + ic('star', fav.has(spot.id) ? 'fill="currentColor"' : '') + '</button></h1>' +
      '<div class="muted mt-s">' + TYPE_LABEL[spot.type] + ' · ' + spot.region + ' · gylis iki ' + spot.depth + ' m' + (spot.area ? ' · ' + spot.area + ' ha' : '') + '</div></div>' +
      '<select class="input" id="spotSel" style="width:260px">' + spotOptions(spot.id) + '</select></div>' +
      '<div class="chips" id="spChips"><button class="chip' + (!species ? ' on' : '') + '" data-sp="">🎣 Bendras</button>' +
        Object.entries(SPECIES).map(([id, s]) => '<button class="chip' + (species === id ? ' on' : '') + '" data-sp="' + id + '">' + s.emoji + ' ' + s.name + (spot.species.includes(id) ? '' : ' <span class="dim">·</span>') + '</button>').join('') + '</div>' +
      '<div class="days mt" id="days"></div>' +
      '<div class="grid g3 mt"><div class="card span2"><div class="card-head"><h2 id="chartTitle">Kibimas per parą</h2><div class="row-gap" style="font-size:12px"><span class="row-gap"><i class="dot" style="background:#00ffbf;width:10px;height:10px"></i>Kibimas</span><span class="row-gap"><i class="dot" style="background:#a675ff;width:10px;height:10px"></i>Slėgis</span><span class="row-gap"><i class="dot" style="background:rgba(255,214,102,.55);width:10px;height:10px;border-radius:3px"></i>Solunaras</span></div></div><div id="chart"></div><div class="hours mt" id="hours"></div></div>' +
      '<div class="card" id="factors"></div></div>' +
      '<div class="grid g2 mt"><div class="card" id="windows"></div><div class="card" id="tips"></div></div><div class="card mt" id="solunar"></div></div>';

    const render = () => {
      const d = ds[dayIdx];
      $('#days').innerHTML = ds.map((x, i) => { const wi = K.wx(x.day.code); return '<button class="day' + (i === dayIdx ? ' on' : '') + '" data-i="' + i + '"><span class="d">' + (x.day.date.toDateString() === todayStr ? 'Šiandien' : x.day.date.toLocaleDateString('lt-LT', { weekday: 'short', day: 'numeric' })) + '</span><span class="w">' + wi.i + '</span><span class="sc" style="color:' + K.scoreColor(x.score) + '">' + x.score + '%</span><span class="tt">' + Math.round(x.day.tmin) + '° / ' + Math.round(x.day.tmax) + '°</span></button>'; }).join('');
      $$('#days .day').forEach(b => b.onclick = () => { dayIdx = +b.dataset.i; hourSel = null; render(); });

      const hrs = d.hours;
      const now = K.nowIndex(w);
      if (hourSel == null) hourSel = hrs.some(h => h.i === now) ? now : (d.best ? d.best.i : hrs[0].i);
      $('#chart').innerHTML = chart(hrs, w, hourSel);
      $$('#chart [data-h]').forEach(r => r.onclick = () => { hourSel = +r.dataset.h; render(); });
      $('#hours').innerHTML = hrs.map(h => { const x = w.hours[h.i]; const wi = K.wx(x.code, x.day); return '<button class="hour' + (h.i === hourSel ? ' now' : '') + '" data-h="' + h.i + '" style="' + (h.i === hourSel ? 'background:rgba(0,255,191,.1)' : '') + '"><span class="dim">' + K.hhmm(x.t) + '</span><span style="font-size:18px">' + wi.i + '</span><b style="color:' + K.scoreColor(h.s) + '">' + h.s + '%</b><span class="dim">' + Math.round(x.temp) + '°</span></button>'; }).join('');
      $$('#hours .hour').forEach(b => b.onclick = () => { hourSel = +b.dataset.h; render(); });
      const sel = $('#hours .now'); if (sel) sel.scrollIntoView({ block: 'nearest', inline: 'center' });

      const bt = K.biteAt(w, hourSel, species || null);
      $('#factors').innerHTML = '<div class="card-head"><h2>' + K.hhmm(w.hours[hourSel].t) + ' veiksniai</h2>' + ring(bt.score, 'sm') + '</div>' +
        bt.factors.map(f => '<div class="factor"><span style="font-size:18px">' + f.i + '</span><div><div style="font-weight:600">' + f.k + '</div><div class="muted" style="font-size:12px">' + f.txt + '</div><div class="bar" style="margin-top:6px;height:5px"><i style="width:' + Math.round(f.v * 100) + '%;background:' + K.scoreColor(f.v * 100) + '"></i></div></div><b class="num" style="color:' + K.scoreColor(f.v * 100) + '">' + Math.round(f.v * 100) + '</b></div>').join('');

      const wins = K.bestWindows(hrs, w);
      const m = K.moon(d.day.date);
      $('#windows').innerHTML = '<div class="card-head"><h2>⏱ Geriausi langai</h2><span class="tag ' + K.level(d.score).cls + '">' + K.level(d.score).t + '</span></div><div class="list">' +
        wins.map((x, i) => '<div class="row"><span class="rank r' + (i + 1) + '">' + (i + 1) + '</span><div class="grow"><div class="t num">' + K.hhmm(x.from) + ' – ' + K.hhmm(x.to) + '</div></div><b class="num" style="color:' + K.scoreColor(x.score) + '">' + x.score + '%</b></div>').join('') + '</div>' +
        '<div class="grid g3 mt"><div class="stat-tile"><div class="stat"><span>🌅</span><span class="v" style="font-size:18px">' + K.hhmm(d.day.sunrise) + '</span><span class="k">Saulėtekis</span></div></div><div class="stat-tile"><div class="stat"><span>🌇</span><span class="v" style="font-size:18px">' + K.hhmm(d.day.sunset) + '</span><span class="k">Saulėlydis</span></div></div><div class="stat-tile"><div class="stat"><span>' + m.icon + '</span><span class="v" style="font-size:18px">' + m.illum + '%</span><span class="k">' + m.name + '</span></div></div></div>';

      $('#solunar').innerHTML = solunarCard(K.solunar(d.day.date, w.lat, w.lng, d.day));
      const S = species ? SPECIES[species] : null;
      $('#tips').innerHTML = S
        ? '<div class="card-head"><h2>' + S.emoji + ' ' + S.name + ' — taktika</h2>' + (spot.species.includes(species) ? '<span class="tag good">Gyvena čia</span>' : '<span class="tag bad">Retai čia</span>') + '</div>' +
          '<div class="list"><div class="row"><span>📍</span><div class="grow"><div class="s">Kur ieškoti</div><div>' + S.depth + '</div></div></div><div class="row"><span>⏰</span><div class="grow"><div class="s">Geriausia</div><div>' + S.best + '</div></div></div><div class="row"><span>🌡️</span><div class="grow"><div class="s">Optimali vandens t°</div><div>' + S.temp[0] + '–' + S.temp[1] + ' °C</div></div></div></div>' +
          '<div class="chips mt">' + S.baits.map(x => '<span class="chip">' + x + '</span>').join('') + '</div>'
        : '<div class="card-head"><h2>🐟 Žuvys šiame telkinyje</h2></div><div class="list">' + spot.species.map(id => { const s = K.biteAt(w, hourSel, id).score; return '<button class="row" data-sp="' + id + '"><span style="font-size:20px">' + SPECIES[id].emoji + '</span><div class="grow"><div class="t">' + SPECIES[id].name + '</div><div class="s">' + SPECIES[id].baits.slice(0, 2).join(', ') + '</div></div><b class="num" style="color:' + K.scoreColor(s) + '">' + s + '%</b></button>'; }).join('') + '</div>';
      $$('#tips [data-sp]').forEach(b => b.onclick = () => { store.set('fcSpecies', b.dataset.sp); location.hash = '#/forecast?sp=' + b.dataset.sp + '&day=' + ds[dayIdx].day.date.toISOString().slice(0, 10); });
      animateRings($('#factors'));
    };
    render();

    $('#spotSel').onchange = e => { state.spotId = e.target.value; route(); };
    $$('#spChips [data-sp]').forEach(b => b.onclick = () => { store.set('fcSpecies', b.dataset.sp); location.hash = '#/forecast?sp=' + b.dataset.sp + '&day=' + ds[dayIdx].day.date.toISOString().slice(0, 10) + '&t=' + Date.now(); });
    $('#favBtn').onclick = () => { toggleFav(spot.id); route(); };
  }
  function toggleFav(id) {
    const f = new Set(store.get('favs', []));
    if (f.has(id)) { f.delete(id); toast('Pašalinta iš mėgstamų', 'info'); } else { f.add(id); toast('Pridėta prie mėgstamų ⭐'); }
    store.set('favs', [...f]);
  }

  function solunarCard(so) {
    const stars = '★'.repeat(so.rating.n) + '<span class="dim">' + '★'.repeat(4 - so.rating.n) + '</span>';
    const now = Date.now();
    const row = p => {
      const on = now >= p.from && now <= p.to;
      return '<div class="row" style="' + (on ? 'border-color:rgba(255,214,102,.5);background:rgba(255,214,102,.06)' : '') + '"><span class="tag" style="background:rgba(255,214,102,' + (p.type === 'major' ? '.18' : '.08') + ');color:#ffd666">' + (p.type === 'major' ? 'Didysis' : 'Mažasis') + '</span><div class="grow"><div class="t num">' + K.hhmm(p.from) + ' – ' + K.hhmm(p.to) + '</div><div class="s">' + p.lbl + '</div></div>' + (on ? '<span class="tag good">Dabar</span>' : '') + '</div>';
    };
    const st = (i, v, k) => '<div class="stat-tile"><div class="stat"><span>' + i + '</span><span class="v" style="font-size:18px">' + v + '</span><span class="k">' + k + '</span></div></div>';
    return '<div class="card-head"><h2>🌙 Solunariniai periodai</h2><div style="color:#ffd666;font-size:18px;letter-spacing:2px" title="Dienos įvertinimas">' + stars + '</div></div>' +
      '<p class="muted" style="margin:-4px 0 14px;font-size:13px;line-height:1.55">Pagal solunaro teoriją (ją naudoja ir Garmin „Hunt &amp; Fish“): žuvys aktyvesnės, kai mėnulis yra virš galvos ar po kojomis (<b style="color:#ffd666">didieji</b> periodai, ~2 val.) ir kai jis teka ar leidžiasi (<b style="color:#ffd666">mažieji</b>, ~1 val.). Solunaras sudaro 14 % kibimo balo.</p>' +
      '<div class="grid g2"><div class="list">' + (so.periods.length ? so.periods.map(row).join('') : '<p class="muted">Šią dieną periodų nėra.</p>') + '</div>' +
      '<div class="grid" style="align-content:start;grid-template-columns:repeat(2,minmax(0,1fr))">' +
        st('🌕↑', so.rise ? K.hhmm(so.rise) : '—', 'Mėnulio patekėjimas') +
        st('🌕↓', so.set ? K.hhmm(so.set) : '—', 'Mėnulio nusileidimas') +
        st(so.moon.icon, so.moon.illum + '%', so.moon.name) +
        st('⭐', so.rating.t, 'Solunaro diena') +
      '</div></div>';
  }

  // Artimiausias (arba šiuo metu vykstantis) solunarinis periodas.
  function nextPeriod(w) {
    const now = Date.now();
    return [0, 1].flatMap(o => K.solunar(new Date(now + o * 86400000), w.lat, w.lng).periods).filter(p => p.to > now).sort((a, b) => a.from - b.from)[0];
  }

  function chart(hrs, w, sel) {
    const W = 720, H = 220, pl = 34, pr = 34, pt = 14, pb = 26;
    const n = hrs.length, x = i => pl + i * (W - pl - pr) / Math.max(1, n - 1);
    const y = s => pt + (1 - s / 100) * (H - pt - pb);
    const ps = hrs.map(h => w.hours[h.i].p), pmin = Math.min(...ps) - 1, pmax = Math.max(...ps) + 1;
    const yp = p => pt + (1 - (p - pmin) / (pmax - pmin)) * (H - pt - pb);
    const pts = hrs.map((h, i) => [x(i), y(h.s)]);
    const smooth = pts.map((p, i) => { if (!i) return 'M' + p[0] + ',' + p[1]; const q = pts[i - 1], cx = (q[0] + p[0]) / 2; return 'C' + cx + ',' + q[1] + ' ' + cx + ',' + p[1] + ' ' + p[0] + ',' + p[1]; }).join('');
    const area = smooth + 'L' + x(n - 1) + ',' + (H - pb) + 'L' + x(0) + ',' + (H - pb) + 'Z';
    const pline = hrs.map((h, i) => (i ? 'L' : 'M') + x(i) + ',' + yp(w.hours[h.i].p)).join('');
    const si = hrs.findIndex(h => h.i === sel);
    let g = '';
    const t0 = w.hours[hrs[0].i].t.getTime(), tN = w.hours[hrs[n - 1].i].t.getTime();
    const xt = t => x(0) + (t - t0) / (tN - t0) * (x(n - 1) - x(0));
    if (w.lat != null) {
      const so = K.solunar(new Date(t0 + 12 * 3600000), w.lat, w.lng);
      so.periods.forEach(p => {
        const a = Math.max(t0, p.from.getTime()), b = Math.min(tN, p.to.getTime());
        if (b <= a) return;
        const maj = p.type === 'major';
        g += '<rect x="' + xt(a) + '" y="' + pt + '" width="' + (xt(b) - xt(a)) + '" height="' + (H - pt - pb) + '" fill="' + (maj ? 'rgba(255,214,102,.13)' : 'rgba(255,214,102,.06)') + '"/>' +
          '<text x="' + ((xt(a) + xt(b)) / 2) + '" y="' + (pt + 10) + '" text-anchor="middle" style="fill:#ffd666;font-size:10px">' + (maj ? 'didysis' : 'mažasis') + '</text>';
      });
    }
    [25, 50, 75].forEach(v => { g += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="rgba(255,255,255,.06)" stroke-dasharray="3 5"/><text x="4" y="' + (y(v) + 4) + '">' + v + '%</text>'; });
    hrs.forEach((h, i) => { if (i % 3 === 0) g += '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="middle">' + K.hhmm(w.hours[h.i].t).slice(0, 2) + '</text>'; });
    g += '<text x="' + (W - 2) + '" y="' + (yp(pmax - 1) + 4) + '" text-anchor="end" style="fill:#a675ff">' + Math.round(pmax - 1) + '</text><text x="' + (W - 2) + '" y="' + (yp(pmin + 1) + 4) + '" text-anchor="end" style="fill:#a675ff">' + Math.round(pmin + 1) + '</text>';
    const hit = hrs.map((h, i) => '<rect data-h="' + h.i + '" x="' + (x(i) - (W - pl - pr) / n / 2) + '" y="0" width="' + ((W - pl - pr) / n) + '" height="' + H + '" fill="transparent" style="cursor:pointer"/>').join('');
    const marker = si >= 0 ? '<line x1="' + x(si) + '" x2="' + x(si) + '" y1="' + pt + '" y2="' + (H - pb) + '" stroke="rgba(0,255,191,.5)" stroke-dasharray="4 4"/><circle cx="' + x(si) + '" cy="' + y(hrs[si].s) + '" r="6" fill="#00ffbf" stroke="#070c17" stroke-width="3"/>' : '';
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none"><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00ffbf" stop-opacity=".35"/><stop offset="1" stop-color="#00ffbf" stop-opacity="0"/></linearGradient></defs>' + g +
      '<path d="' + area + '" fill="url(#ag)"/><path d="' + pline + '" fill="none" stroke="#a675ff" stroke-width="1.6" stroke-dasharray="5 4" opacity=".8"/><path d="' + smooth + '" fill="none" stroke="#00ffbf" stroke-width="3"/>' + marker + hit + '</svg>';
  }

  // =========================================================
  // KIBK AI
  // =========================================================
  async function AI() {
    const spot = state.spot;
    const hist = userData.get('aiChat', []);
    const sugg = ['Kada šiandien kibs geriausiai?', 'Kuo gaudyti lydeką?', 'Kur dabar kimba starkis?', 'Koks oras ir slėgis?', 'Kuo gaudyti karšį naktį?', 'Kokį mazgą rišti?'];
    view.innerHTML = '<div class="page" style="padding-bottom:16px"><div class="chat-wrap">' +
      '<div class="page-head" style="margin-bottom:14px"><div><div class="eyebrow">Asmeninis žvejybos asistentas</div><h1 class="title">KIBK <span class="grad-text">AI</span></h1></div>' +
      '<div class="row-gap"><select class="input" id="spotSel" style="width:220px" title="Telkinys pagal nutylėjimą">' + spotOptions(spot.id) + '</select><button class="btn" id="clearChat">' + ic('trash') + 'Išvalyti</button></div></div>' +
      '<div class="chat" id="chat"></div>' +
      '<div><div class="chips" id="sugg" style="margin-bottom:10px">' + sugg.map(s => '<button class="chip">' + s + '</button>').join('') + '</div>' +
      '<form class="composer" id="composer"><input class="input" id="q" placeholder="Klausk apie kibimą, masalus, vietas…" autocomplete="off" maxlength="400"><button class="btn primary icon" aria-label="Siųsti">' + ic('send') + '</button></form></div>' +
      '</div></div>';
    const chat = $('#chat');
    const bubble = (role, html) => {
      const d = document.createElement('div');
      d.className = 'msg ' + role;
      d.innerHTML = role === 'bot' ? '<div class="bot-head"><span class="bot-ava">' + ic('ai') + '</span>KIBK AI</div>' + html : esc(html);
      chat.appendChild(d); chat.scrollTop = chat.scrollHeight; return d;
    };
    if (!hist.length) bubble('bot', 'Labas! 🎣 Esu <b>KIBK AI</b>. Analizuoju orus, slėgį, mėnulį ir paros metą realiu laiku. Dabar žiūriu į <b>' + spot.name + '</b> — paklausk, kada ir kuo kibs!');
    hist.forEach(m => bubble(m.r, m.t));
    let busy = false;
    const send = async text => {
      text = text.trim(); if (!text || busy) return;
      busy = true; $('#q').value = '';
      bubble('me', text);
      const t = bubble('bot', '<div class="typing"><span></span><span></span><span></span></div>');
      const [ans] = await Promise.all([K.ask(text, { spot: state.spot }), new Promise(r => setTimeout(r, 650))]);
      t.innerHTML = '<div class="bot-head"><span class="bot-ava">' + ic('ai') + '</span>KIBK AI</div>' + ans;
      chat.scrollTop = chat.scrollHeight;
      const h = userData.get('aiChat', []); h.push({ r: 'me', t: text }, { r: 'bot', t: ans }); userData.set('aiChat', h.slice(-60));
      bump('ai');
      busy = false;
    };
    $('#composer').onsubmit = e => { e.preventDefault(); send($('#q').value); };
    $$('#sugg .chip').forEach(b => b.onclick = () => send(b.textContent));
    $('#clearChat').onclick = () => { userData.set('aiChat', []); route(); };
    $('#spotSel').onchange = e => { state.spotId = e.target.value; toast('Telkinys: ' + state.spot.name, 'info'); };
    $('#q').focus();
  }

  // =========================================================
  // ŽEMĖLAPIS
  // =========================================================
  async function MapPage() {
    view.innerHTML = '<div class="page full"><div class="map-page"><div id="map"></div>' +
      '<div class="map-top"><div class="search map-search glass" style="border-radius:14px">' + ic('search') + '<input class="input" id="mSearch" placeholder="Ieškoti telkinio..." style="border:0;background:transparent" autocomplete="off"></div>' +
      '<button class="btn glass" id="fishBtn">' + ic('fish') + '<span id="fishLbl">Žuvis</span></button><button class="btn glass" id="filtBtn">' + ic('filter') + 'Filtrai<span class="tag good num" id="filtCount" style="padding:1px 7px">0</span></button>' +
      '<button class="btn glass" id="addBtn">' + ic('plus') + 'Pridėti vietą</button></div>' +
      '<div class="map-tools glass"><button data-t="legend" title="Žemėlapio legenda">ℹ️</button><button data-t="depth" title="Rodyti ežerų gylius" class="num" style="font-size:13px;font-weight:800">m↓</button><button data-t="community" title="Bendruomenės vietos">' + ic('users') + '</button><button data-t="bait" title="Masalų automatai">' + ic('store') + '</button><button data-t="top" title="Top vietos">🏆</button><button data-t="me" title="Mano vieta">' + ic('locate') + '</button></div>' +
      '<div class="map-panel glass hide" id="mPanel"></div><div class="map-status glass" id="mStatus">Kraunami telkiniai...</div></div></div>';

    const prefs = Object.assign({ depth: false, community: true, bait: false, species: '', types: ['ezeras', 'upe', 'tvenkinys', 'marios'], minDepth: 0, favOnly: false }, store.get('mapPrefs', {}));
    const savePrefs = () => store.set('mapPrefs', prefs);
    const map = L.map('map', { zoomControl: false, attributionControl: true }).setView([55.2, 23.9], 7);
    if (innerWidth > 900) L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(map);
    cleanup = () => map.remove();

    const POP = { autoPanPaddingTopLeft: [20, 150], autoPanPaddingBottomRight: [80, 110], maxWidth: 300 };
    const spotLayer = L.layerGroup().addTo(map), comLayer = L.layerGroup().addTo(map), baitLayer = L.layerGroup().addTo(map);
    let scores = {}, adding = false, panel = null;

    const all = await K.weatherAll();
    if (!document.body.contains(map.getContainer())) return;
    SPOTS.forEach(s => { const w = all[s.id]; scores[s.id] = K.biteAt(w, K.nowIndex(w), prefs.species || null).score; });
    const live = Object.values(all).some(w => w.live);

    const visible = () => {
      const q = ($('#mSearch').value || '').toLowerCase();
      const favs = new Set(store.get('favs', []));
      return SPOTS.filter(s => prefs.types.includes(s.type) && s.depth >= prefs.minDepth && (!prefs.species || s.species.includes(prefs.species)) && (!prefs.favOnly || favs.has(s.id)) && (!q || (s.name + ' ' + s.region).toLowerCase().includes(q)));
    };
    const filtCount = () => (prefs.types.length < 4 ? 1 : 0) + (prefs.minDepth > 0 ? 1 : 0) + (prefs.favOnly ? 1 : 0);

    function popupHtml(s) {
      const sc = scores[s.id], fav = new Set(store.get('favs', [])).has(s.id);
      return '<div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">' + ring(sc, 'sm') + '<div><div style="font-weight:800;font-size:16px">' + s.name + '</div><div class="muted" style="font-size:12px">' + TYPE_LABEL[s.type] + ' · ' + s.region + '</div></div></div>' +
        '<div class="muted" style="font-size:13px;margin-bottom:8px">Gylis iki <b style="color:#eef4ff">' + s.depth + ' m</b>' + (s.area ? ' · ' + s.area + ' ha' : '') + '</div>' +
        '<div class="chips" style="gap:5px;margin-bottom:12px">' + s.species.map(id => '<span class="tag">' + SPECIES[id].emoji + ' ' + SPECIES[id].name + '</span>').join('') + '</div>' +
        '<div style="display:flex;gap:8px"><button class="btn primary sm" data-go="' + s.id + '" style="flex:1">Prognozė</button><button class="btn sm" data-fav="' + s.id + '" style="color:' + (fav ? '#ffc24b' : 'inherit') + '">' + (fav ? '★' : '☆') + '</button><a class="btn sm" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=' + s.lat + ',' + s.lng + '" title="Maršrutas">🧭</a></div>';
    }
    function drawSpots() {
      spotLayer.clearLayers();
      const vis = visible();
      vis.forEach(s => {
        const sc = scores[s.id];
        const icon = L.divIcon({ className: '', iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -36],
          html: '<div class="pin" style="background:' + K.scoreColor(sc) + '"><span>' + sc + '</span></div>' + (prefs.depth ? '<div class="pin-depth">' + s.depth + ' m</div>' : '') });
        L.marker([s.lat, s.lng], { icon, title: s.name }).bindPopup(() => popupHtml(s), POP).addTo(spotLayer);
      });
      $('#mStatus').innerHTML = '🎣 ' + vis.length + ' telkiniai' + (prefs.species ? ' · ' + SPECIES[prefs.species].name : '') + (live ? '' : ' · <span style="color:#ffc24b">apytiksliai orai</span>');
      $('#filtCount').textContent = filtCount();
      $('#fishLbl').textContent = prefs.species ? SPECIES[prefs.species].name : 'Žuvis';
      $('#fishBtn').classList.toggle('on', !!prefs.species);
    }
    function drawCommunity() {
      comLayer.clearLayers();
      if (!prefs.community) return;
      const me = auth.key();
      store.get('community', []).forEach(c => {
        const icon = L.divIcon({ className: '', iconSize: [30, 30], iconAnchor: [15, 15], html: '<div class="pin-c">📍</div>' });
        const votes = c.votes || [];
        L.marker([c.lat, c.lng], { icon }).bindPopup(() =>
          '<div style="font-weight:800;font-size:15px;margin-bottom:4px">' + esc(c.name) + '</div><div class="muted" style="font-size:12px;margin-bottom:8px">Bendruomenės vieta · ' + esc(c.author) + ' · ' + fmtDate(c.at) + '</div>' +
          (c.species ? '<span class="tag">' + SPECIES[c.species].emoji + ' ' + SPECIES[c.species].name + '</span> ' : '') + (c.note ? '<p style="font-size:13px;margin:8px 0">' + esc(c.note) + '</p>' : '') +
          '<div style="display:flex;gap:8px;margin-top:10px"><button class="btn sm" data-vote="' + c.id + '">👍 ' + votes.length + '</button>' + (c.owner === me ? '<button class="btn sm danger" data-delc="' + c.id + '">Ištrinti</button>' : '') + '</div>', POP).addTo(comLayer);
      });
    }
    function drawBait() {
      baitLayer.clearLayers();
      if (!prefs.bait) return;
      BAIT_MACHINES.forEach(b => {
        L.marker([b.lat, b.lng], { icon: L.divIcon({ className: '', iconSize: [30, 30], iconAnchor: [15, 15], html: '<div class="pin-b">🪱</div>' }) })
          .bindPopup('<div style="font-weight:800">' + b.name + '</div><div class="muted" style="font-size:12px;margin-top:4px">Sliekai, musės lervos, jaukai — 24/7</div><a class="btn sm mt-s" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=' + b.lat + ',' + b.lng + '">🧭 Maršrutas</a>', POP).addTo(baitLayer);
      });
    }
    const syncTools = () => $$('.map-tools [data-t]').forEach(b => b.classList.toggle('on', (b.dataset.t in prefs && prefs[b.dataset.t] === true) || b.dataset.t === panel));
    const redraw = () => { drawSpots(); drawCommunity(); drawBait(); syncTools(); };
    redraw();

    // Popup mygtukai
    map.on('popupopen', e => {
      const el = e.popup.getElement();
      animateRings(el);
      $$('[data-go]', el).forEach(b => b.onclick = () => { state.spotId = b.dataset.go; location.hash = '#/forecast'; });
      $$('[data-fav]', el).forEach(b => b.onclick = () => { toggleFav(b.dataset.fav); e.popup.setContent(popupHtml(K.spotById(b.dataset.fav))); map.fire('popupopen', { popup: e.popup }); });
      $$('[data-vote]', el).forEach(b => b.onclick = () => {
        const list = store.get('community', []); const c = list.find(x => x.id === b.dataset.vote); c.votes = c.votes || [];
        const me = auth.key(); const i = c.votes.indexOf(me); if (i >= 0) c.votes.splice(i, 1); else c.votes.push(me);
        store.set('community', list); b.textContent = '👍 ' + c.votes.length;
      });
      $$('[data-delc]', el).forEach(b => b.onclick = () => { store.set('community', store.get('community', []).filter(x => x.id !== b.dataset.delc)); map.closePopup(); drawCommunity(); toast('Vieta ištrinta', 'info'); });
    });

    // Paieška
    $('#mSearch').oninput = () => {
      drawSpots();
      const v = visible();
      if ($('#mSearch').value && v.length) map.flyToBounds(L.latLngBounds(v.map(s => [s.lat, s.lng])).pad(0.3), { maxZoom: 11, duration: 0.6 });
    };
    $('#mSearch').onkeydown = e => { if (e.key === 'Enter') { const v = visible()[0]; if (v) { map.flyTo([v.lat, v.lng], 11); setTimeout(() => spotLayer.eachLayer(m => { if (m.options.title === v.name) m.openPopup(); }), 700); } } };

    // Paneliai
    const openPanel = (name, html, bind) => {
      if (panel === name) { panel = null; $('#mPanel').classList.add('hide'); syncTools(); return; }
      panel = name; $('#mPanel').innerHTML = html; $('#mPanel').classList.remove('hide'); syncTools(); if (bind) bind($('#mPanel'));
    };
    const closePanel = () => { panel = null; $('#mPanel').classList.add('hide'); syncTools(); };
    const head = t => '<div class="card-head"><h2>' + t + '</h2><button class="x" data-cp>' + ic('x') + '</button></div>';
    const bindClose = el => $$('[data-cp]', el).forEach(b => b.onclick = closePanel);

    $('#fishBtn').onclick = () => openPanel('fish', head('🐟 Žuvies rūšis') + '<p class="muted" style="margin-top:0;font-size:13px">Žymeklių balas perskaičiuojamas pasirinktai rūšiai.</p><div class="chips"><button class="chip' + (!prefs.species ? ' on' : '') + '" data-s="">Visos</button>' +
      Object.entries(SPECIES).map(([id, s]) => '<button class="chip' + (prefs.species === id ? ' on' : '') + '" data-s="' + id + '">' + s.emoji + ' ' + s.name + '</button>').join('') + '</div>', el => {
      bindClose(el);
      $$('[data-s]', el).forEach(b => b.onclick = () => {
        prefs.species = b.dataset.s; savePrefs();
        SPOTS.forEach(s => { const w = all[s.id]; scores[s.id] = K.biteAt(w, K.nowIndex(w), prefs.species || null).score; });
        $$('[data-s]', el).forEach(x => x.classList.toggle('on', x === b)); drawSpots();
      });
    });
    $('#filtBtn').onclick = () => openPanel('filt', head('Filtrai') +
      '<h3>Telkinio tipas</h3><div class="chips">' + Object.entries(TYPE_LABEL).map(([k, v]) => '<button class="chip' + (prefs.types.includes(k) ? ' on' : '') + '" data-ty="' + k + '">' + v + '</button>').join('') + '</div>' +
      '<h3 class="mt">Minimalus gylis: <span class="num" id="mdv">' + prefs.minDepth + '</span> m</h3><input type="range" min="0" max="50" step="1" value="' + prefs.minDepth + '" id="md" style="width:100%;accent-color:#00ffbf">' +
      '<label class="check mt"><input type="checkbox" id="favOnly"' + (prefs.favOnly ? ' checked' : '') + '>Tik mėgstami ⭐</label>' +
      '<button class="btn block mt" id="resetF">Atstatyti</button>', el => {
      bindClose(el);
      $$('[data-ty]', el).forEach(b => b.onclick = () => { const t = b.dataset.ty; prefs.types = prefs.types.includes(t) ? prefs.types.filter(x => x !== t) : prefs.types.concat(t); b.classList.toggle('on'); savePrefs(); drawSpots(); });
      $('#md', el).oninput = e => { prefs.minDepth = +e.target.value; $('#mdv', el).textContent = prefs.minDepth; savePrefs(); drawSpots(); };
      $('#favOnly', el).onchange = e => { prefs.favOnly = e.target.checked; savePrefs(); drawSpots(); };
      $('#resetF', el).onclick = () => { prefs.types = Object.keys(TYPE_LABEL); prefs.minDepth = 0; prefs.favOnly = false; savePrefs(); drawSpots(); panel = null; $('#filtBtn').click(); };
    });

    $$('.map-tools [data-t]').forEach(b => b.onclick = async () => {
      const t = b.dataset.t;
      if (t === 'depth' || t === 'community' || t === 'bait') {
        prefs[t] = !prefs[t]; savePrefs(); redraw();
        toast({ depth: prefs.depth ? 'Rodomi gyliai' : 'Gyliai paslėpti', community: prefs.community ? 'Rodomos bendruomenės vietos' : 'Bendruomenės vietos paslėptos', bait: prefs.bait ? 'Rodomi masalų automatai' : 'Masalų automatai paslėpti' }[t], 'info');
      } else if (t === 'legend') {
        openPanel('legend', head('ℹ️ Legenda') +
          '<div class="legend-item"><i class="dot" style="background:#00ffbf"></i>Kibimas ≥ 70 % — puikus</div><div class="legend-item"><i class="dot" style="background:#ffc24b"></i>50–69 % — vidutinis</div><div class="legend-item"><i class="dot" style="background:#ff5d73"></i>&lt; 50 % — silpnas</div>' +
          '<div class="legend-item"><div class="pin-c" style="width:22px;height:22px;font-size:11px">📍</div>Bendruomenės vieta</div><div class="legend-item"><div class="pin-b" style="width:22px;height:22px;font-size:11px">🪱</div>Masalų automatas</div>' +
          '<p class="muted" style="font-size:12px">Skaičius žymeklyje — dabartinis kibimo balas. Spustelėk žemėlapį režimu „Pridėti vietą“, kad pasidalintum savo vieta.</p>', bindClose);
      } else if (t === 'top') {
        const top = Object.entries(scores).filter(([id]) => visible().some(s => s.id === id)).sort((a, b) => b[1] - a[1]).slice(0, 8);
        openPanel('top', head('🏆 Top vietos' + (prefs.species ? ' · ' + SPECIES[prefs.species].name : '')) + '<div class="list">' +
          top.map(([id, sc], i) => { const s = K.spotById(id); return '<button class="row" data-fly="' + id + '"><span class="rank r' + (i + 1) + '">' + (i + 1) + '</span><div class="grow"><div class="t">' + s.name + '</div><div class="s">' + s.region + '</div></div><b class="num" style="color:' + K.scoreColor(sc) + '">' + sc + '%</b></button>'; }).join('') + '</div>', el => {
          bindClose(el);
          $$('[data-fly]', el).forEach(b => b.onclick = () => { const s = K.spotById(b.dataset.fly); map.flyTo([s.lat, s.lng], 11); setTimeout(() => spotLayer.eachLayer(m => { if (m.options.title === s.name) m.openPopup(); }), 800); });
        });
      } else if (t === 'me') {
        if (!navigator.geolocation) return toast('Vietos nustatymas nepalaikomas', 'err');
        navigator.geolocation.getCurrentPosition(p => {
          map.flyTo([p.coords.latitude, p.coords.longitude], 10);
          L.circleMarker([p.coords.latitude, p.coords.longitude], { radius: 9, color: '#fff', weight: 3, fillColor: '#2ee6ff', fillOpacity: 1 }).addTo(map).bindPopup('Tu esi čia');
        }, () => toast('Nepavyko nustatyti vietos', 'err'));
      }
    });

    // Bendruomenės vietos pridėjimas
    $('#addBtn').onclick = () => {
      adding = !adding;
      $('#addBtn').classList.toggle('primary', adding);
      $('#map').style.cursor = adding ? 'crosshair' : '';
      if (adding) toast('Spustelėk žemėlapyje, kur nori pažymėti vietą', 'info');
    };
    map.on('click', e => {
      if (!adding) return;
      adding = false; $('#addBtn').classList.remove('primary'); $('#map').style.cursor = '';
      modal('📍 Nauja bendruomenės vieta', '<form id="cf" class="form-grid"><label class="field full">Pavadinimas<input class="input" name="name" required maxlength="60" placeholder="pvz. Akmenuota sekluma"></label>' +
        '<label class="field full">Žuvis<select class="input" name="species">' + speciesOptions('', true) + '</select></label>' +
        '<label class="field full">Pastaba<textarea class="input" name="note" maxlength="300" placeholder="Gylis, masalas, privažiavimas…"></textarea></label>' +
        '<div class="full muted" style="font-size:12px">Koordinatės: ' + e.latlng.lat.toFixed(4) + ', ' + e.latlng.lng.toFixed(4) + '</div>' +
        '<button class="btn primary block full">Išsaugoti</button></form>', (bg, close) => {
        $('#cf', bg).onsubmit = ev => {
          ev.preventDefault();
          const f = new FormData(ev.target);
          const list = store.get('community', []);
          list.push({ id: 'c' + Date.now(), name: f.get('name').trim(), species: f.get('species'), note: f.get('note').trim(), lat: e.latlng.lat, lng: e.latlng.lng, author: displayName(), owner: auth.key(), at: Date.now(), votes: [] });
          store.set('community', list); prefs.community = true; savePrefs(); drawCommunity(); syncTools(); close(); toast('Vieta pridėta! Ačiū 🎣');
        };
      });
    });
  }

  // =========================================================
  // TURNYRAI
  // =========================================================
  const BOT_NAMES = ['Tomas Ž.', 'Ieva K.', 'Mindaugas', 'Rūta P.', 'Darius L.', 'Lukas B.', 'Agnė', 'Vytautas S.'];
  const SCORING = { heaviest: 'Sunkiausia žuvis', total: 'Bendras svoris', count: 'Daugiausiai žuvų' };
  const tours = () => store.get('tours', null) || seedTours();
  const saveTours = t => store.set('tours', t);
  function seedTours() {
    const now = Date.now(), d = 86400000;
    const t = [
      { code: 'LYDEKA', name: 'Rudens lydekų taurė', species: 'lydeka', scoring: 'heaviest', start: now - 2 * d, end: now + 5 * d, spot: 'plateliai', public: true, owner: 'system', members: [], entries: [], chat: [] },
      { code: 'ESERYS', name: 'Ešerių savaitgalis', species: 'eserys', scoring: 'count', start: now - d, end: now + 2 * d, spot: 'galve', public: true, owner: 'system', members: [], entries: [], chat: [] },
      { code: 'KAUNAS', name: 'Kauno marių iššūkis', species: '', scoring: 'total', start: now + 3 * d, end: now + 10 * d, spot: 'kaunomarios', public: true, owner: 'system', members: [], entries: [], chat: [] },
    ];
    t.forEach(seedBots); saveTours(t); return t;
  }
  function seedBots(t) {
    let seed = [...t.code].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 100000;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const n = 3 + Math.floor(rnd() * 4);
    const names = BOT_NAMES.slice().sort(() => rnd() - 0.5).slice(0, n);
    names.forEach(nm => t.members.push({ id: 'bot:' + nm, name: nm }));
    if (t.start < Date.now()) {
      names.forEach(nm => {
        const k = 1 + Math.floor(rnd() * 4);
        for (let i = 0; i < k; i++) {
          const sp = t.species || Object.keys(SPECIES)[Math.floor(rnd() * 8)];
          t.entries.push({ id: 'e' + Math.floor(rnd() * 1e9), member: 'bot:' + nm, name: nm, species: sp, weight: +(0.2 + rnd() * (sp === 'lydeka' ? 6 : sp === 'eserys' ? 0.9 : 3)).toFixed(2), at: t.start + rnd() * (Date.now() - t.start) });
        }
      });
      t.chat.push({ who: names[0], me: false, t: 'Sėkmės visiems! 🎣', at: t.start + 3600000 });
    }
  }
  function standings(t) {
    const by = {};
    t.members.forEach(m => { by[m.id] = { id: m.id, name: m.name, n: 0, total: 0, max: 0 }; });
    t.entries.forEach(e => { const r = by[e.member] || (by[e.member] = { id: e.member, name: e.name, n: 0, total: 0, max: 0 }); r.n++; r.total += e.weight; r.max = Math.max(r.max, e.weight); });
    const key = { heaviest: 'max', total: 'total', count: 'n' }[t.scoring];
    return Object.values(by).sort((a, b) => b[key] - a[key] || b.total - a.total).map(r => Object.assign(r, { val: t.scoring === 'count' ? r.n + ' vnt.' : r[key].toFixed(2) + ' kg' }));
  }
  const tStatus = t => Date.now() < t.start ? { t: 'Prasidės ' + fmtDate(t.start), c: 'mid' } : Date.now() > t.end ? { t: 'Baigėsi', c: 'bad' } : { t: 'Vyksta', c: 'good' };
  const genCode = () => { const a = 'ABCDEFGHJKLMNPRSTUVZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };

  function Tournaments(parts) {
    if (parts[0]) return TournamentRoom(parts[0].toUpperCase());
    const me = auth.key();
    const list = tours();
    const mine = list.filter(t => t.members.some(m => m.id === me));
    const pub = list.filter(t => t.public && !t.members.some(m => m.id === me));
    const card = t => { const s = tStatus(t); const st = standings(t); return '<a class="card" href="#/turnyrai/' + t.code + '" style="display:block;transition:.2s" onmouseover="this.style.borderColor=\'rgba(0,255,191,.4)\'" onmouseout="this.style.borderColor=\'\'">' +
      '<div class="card-head"><span class="tag ' + s.c + '">● ' + s.t + '</span><span class="code" style="font-size:12px;padding:3px 8px">' + t.code + '</span></div>' +
      '<h2 style="margin-bottom:6px">' + esc(t.name) + '</h2><div class="muted" style="font-size:13px">' + (t.species ? SPECIES[t.species].emoji + ' ' + SPECIES[t.species].name : '🎣 Visos rūšys') + ' · ' + SCORING[t.scoring] + '</div>' +
      '<div class="row-gap mt" style="justify-content:space-between"><span class="muted" style="font-size:13px">' + ic('users', 'style="width:15px;vertical-align:-3px"') + ' ' + t.members.length + ' dalyviai</span>' + (st[0] && st[0].n ? '<span style="font-size:13px">🥇 ' + esc(st[0].name) + ' · <b class="num">' + st[0].val + '</b></span>' : '') + '</div></a>'; };

    view.innerHTML = '<div class="page"><div class="card hi" style="padding:32px;overflow:hidden"><div style="position:absolute;right:-20px;top:-30px;font-size:180px;opacity:.08;transform:rotate(-12deg)">🏆</div>' +
      '<div class="eyebrow">Turnyrai</div><h1 class="title">Mini-varžybos su <span class="grad-text">draugais</span></h1><p class="muted" style="max-width:560px;line-height:1.6">Sukurk turnyrą, pasidalink kodu ir varžykitės, kas pagaus sunkiausią žuvį, daugiausiai ar didžiausią bendrą svorį.</p>' +
      '<div class="row-gap mt"><button class="btn primary" id="newT">' + ic('plus') + 'Sukurti turnyrą</button><form id="joinF" class="row-gap"><input class="input num" id="joinCode" placeholder="KODAS" maxlength="6" style="width:140px;text-transform:uppercase;letter-spacing:.2em"><button class="btn">Prisijungti</button></form></div></div>' +
      '<h2 class="mt" style="margin-top:30px">Mano turnyrai</h2>' + (mine.length ? '<div class="grid g3">' + mine.map(card).join('') + '</div>' : '<div class="card empty" style="padding:30px"><div class="big-ico">🎣</div><p class="muted">Dar nedalyvauji jokiame turnyre. Sukurk savo arba prisijunk prie viešo!</p></div>') +
      '<h2 style="margin-top:30px">Vieši turnyrai</h2>' + (pub.length ? '<div class="grid g3">' + pub.map(card).join('') + '</div>' : '<p class="muted">Visuose viešuose turnyruose jau dalyvauji 💪</p>') + '</div>';

    $('#newT').onclick = createTour;
    $('#joinF').onsubmit = e => {
      e.preventDefault();
      const code = $('#joinCode').value.trim().toUpperCase();
      const t = tours().find(x => x.code === code);
      if (!t) return toast('Turnyras su kodu „' + esc(code) + '“ nerastas', 'err');
      joinTour(code); location.hash = '#/turnyrai/' + code;
    };
  }
  function joinTour(code) {
    const list = tours(); const t = list.find(x => x.code === code); const me = auth.key();
    if (!t.members.some(m => m.id === me)) { t.members.push({ id: me, name: displayName() }); saveTours(list); toast('Prisijungei prie „' + esc(t.name) + '“'); }
  }
  function createTour() {
    const today = new Date().toISOString().slice(0, 10), wk = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    modal('🏆 Naujas turnyras', '<form id="tf" class="form-grid"><label class="field full">Pavadinimas<input class="input" name="name" required maxlength="50" placeholder="pvz. Draugų lydekų taurė"></label>' +
      '<label class="field">Žuvis<select class="input" name="species">' + speciesOptions('', true) + '</select></label>' +
      '<label class="field">Vertinimas<select class="input" name="scoring">' + Object.entries(SCORING).map(([k, v]) => '<option value="' + k + '">' + v + '</option>').join('') + '</select></label>' +
      '<label class="field">Pradžia<input class="input" type="date" name="start" value="' + today + '" required></label><label class="field">Pabaiga<input class="input" type="date" name="end" value="' + wk + '" required></label>' +
      '<label class="field full">Telkinys<select class="input" name="spot"><option value="">Bet kur</option>' + spotOptions('') + '</select></label>' +
      '<label class="check full"><input type="checkbox" name="public">Viešas turnyras (matomas visiems)</label>' +
      '<button class="btn primary block full">Sukurti</button></form>', (bg, close) => {
      $('#tf', bg).onsubmit = e => {
        e.preventDefault();
        const f = new FormData(e.target);
        const start = new Date(f.get('start') + 'T00:00').getTime(), end = new Date(f.get('end') + 'T23:59').getTime();
        if (end <= start) return toast('Pabaiga turi būti po pradžios', 'err');
        const list = tours(); let code; do { code = genCode(); } while (list.some(t => t.code === code));
        list.push({ code, name: f.get('name').trim(), species: f.get('species'), scoring: f.get('scoring'), start, end, spot: f.get('spot'), public: !!f.get('public'), owner: auth.key(),
          members: [{ id: auth.key(), name: displayName() }], entries: [], chat: [] });
        saveTours(list); close(); toast('Turnyras sukurtas! Kodas: ' + code); location.hash = '#/turnyrai/' + code;
      };
    });
  }

  function TournamentRoom(code) {
    const t = tours().find(x => x.code === code);
    if (!t) { view.innerHTML = '<div class="page"><div class="card empty"><div class="big-ico">🤷</div><h2>Turnyras nerastas</h2><a class="btn primary" href="#/turnyrai">Atgal</a></div></div>'; return; }
    const me = auth.key();
    const joined = t.members.some(m => m.id === me);
    const s = tStatus(t), st = standings(t);
    const running = s.c === 'good';
    const left = t.end - Date.now();
    const leftTxt = Date.now() < t.start ? 'Iki pradžios: ' + Math.ceil((t.start - Date.now()) / 86400000) + ' d.' : left > 0 ? 'Liko: ' + Math.floor(left / 86400000) + ' d. ' + Math.floor(left % 86400000 / 3600000) + ' val.' : 'Turnyras baigtas';

    view.innerHTML = '<div class="page"><a href="#/turnyrai" class="btn sm" style="margin-bottom:16px">' + ic('back') + 'Turnyrai</a>' +
      '<div class="card hi"><div class="room-head"><div style="font-size:46px">🏆</div><div style="flex:1;min-width:200px"><div class="row-gap"><span class="tag ' + s.c + '">● ' + s.t + '</span><span class="muted" style="font-size:13px">' + leftTxt + '</span></div>' +
      '<h1 class="title" style="font-size:30px;margin-top:8px">' + esc(t.name) + '</h1><div class="muted mt-s">' + (t.species ? SPECIES[t.species].emoji + ' ' + SPECIES[t.species].name : '🎣 Visos rūšys') + ' · ' + SCORING[t.scoring] + (t.spot ? ' · 📍 ' + K.spotById(t.spot).name : '') + ' · ' + fmtDate(t.start) + ' – ' + fmtDate(t.end) + '</div></div>' +
      '<div class="row-gap"><span class="code">' + t.code + '</span><button class="btn icon" id="copyC" title="Kopijuoti nuorodą">' + ic('copy') + '</button>' +
      (joined ? (running ? '<button class="btn primary" id="addE">' + ic('plus') + 'Pateikti laimikį</button>' : '') + (t.owner === me ? '<button class="btn danger icon" id="delT" title="Ištrinti turnyrą">' + ic('trash') + '</button>' : '<button class="btn" id="leaveT">Palikti</button>') : '<button class="btn primary" id="joinT">Prisijungti</button>') + '</div></div></div>' +

      '<div class="grid g3 mt"><div class="card span2"><div class="card-head"><h2>📊 Rezultatai</h2><span class="muted" style="font-size:13px">' + st.length + ' dalyviai</span></div><div class="list">' +
        (st.length ? st.map((r, i) => '<div class="row" style="' + (r.id === me ? 'border-color:rgba(0,255,191,.45);background:rgba(0,255,191,.06)' : '') + '"><span class="rank' + (r.n && i < 3 ? ' r' + (i + 1) : '') + '">' + (i + 1) + '</span><div class="grow"><div class="t">' + esc(r.name) + (r.id === me ? ' <span class="tag good">Tu</span>' : '') + '</div><div class="s">' + r.n + ' žuvys · viso ' + r.total.toFixed(2) + ' kg</div></div><b class="num" style="font-size:17px">' + r.val + '</b></div>').join('') : '<p class="muted">Dar nėra dalyvių</p>') +
      '</div><h2 class="mt" style="margin-top:26px">🐟 Paskutiniai laimikiai</h2><div class="list">' +
        (t.entries.length ? t.entries.slice().sort((a, b) => b.at - a.at).slice(0, 10).map(e => '<div class="row">' + (e.photo ? '<img src="' + e.photo + '" style="width:44px;height:44px;border-radius:10px;object-fit:cover">' : '<span style="font-size:24px">' + SPECIES[e.species].emoji + '</span>') + '<div class="grow"><div class="t">' + esc(e.name) + ' · ' + SPECIES[e.species].name + '</div><div class="s">' + fmtDT(e.at) + '</div></div><b class="num">' + e.weight.toFixed(2) + ' kg</b>' + (e.member === me && running ? '<button class="btn sm icon" data-dele="' + e.id + '" title="Pašalinti">' + ic('trash') + '</button>' : '') + '</div>').join('') : '<p class="muted">Dar niekas nepateikė laimikio.</p>') +
      '</div></div>' +
      '<div class="card"><div class="card-head"><h2>💬 Pokalbis</h2></div><div class="room-chat" id="rChat"></div>' +
        (joined ? '<form class="composer mt-s" id="rForm" style="padding:6px"><input class="input" id="rMsg" placeholder="Rašyk žinutę…" maxlength="300" autocomplete="off"><button class="btn primary icon sm" style="height:40px;width:40px">' + ic('send') + '</button></form>' : '<p class="muted" style="font-size:13px">Prisijunk, kad galėtum rašyti.</p>') +
      '</div></div></div>';

    const drawChat = () => {
      const tt = tours().find(x => x.code === code); const el = $('#rChat');
      el.innerHTML = tt.chat.length ? tt.chat.map(m => '<div class="msg ' + (m.me && m.owner === me ? 'me' : 'bot') + '"><div class="who">' + esc(m.who) + ' · ' + K.hhmm(new Date(m.at)) + '</div>' + esc(m.t) + '</div>').join('') : '<p class="muted" style="font-size:13px">Pradėk pokalbį! 👋</p>';
      el.scrollTop = el.scrollHeight;
    };
    drawChat();
    const mutate = fn => { const list = tours(); const tt = list.find(x => x.code === code); fn(tt); saveTours(list); };

    $('#copyC').onclick = () => {
      const txt = 'Prisijunk prie turnyro „' + t.name + '“ — kodas ' + t.code;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Nukopijuota!'), () => toast('Kodas: ' + t.code, 'info'));
    };
    if ($('#joinT')) $('#joinT').onclick = () => { joinTour(code); route(); };
    if ($('#leaveT')) $('#leaveT').onclick = () => { if (!confirm('Palikti turnyrą? Tavo laimikiai bus pašalinti.')) return; mutate(tt => { tt.members = tt.members.filter(m => m.id !== me); tt.entries = tt.entries.filter(e => e.member !== me); }); location.hash = '#/turnyrai'; };
    if ($('#delT')) $('#delT').onclick = () => { if (!confirm('Ištrinti turnyrą visiems?')) return; saveTours(tours().filter(x => x.code !== code)); toast('Turnyras ištrintas', 'info'); location.hash = '#/turnyrai'; };
    $$('[data-dele]').forEach(b => b.onclick = () => { mutate(tt => { tt.entries = tt.entries.filter(e => e.id !== b.dataset.dele); }); route(); });
    if ($('#addE')) $('#addE').onclick = () => catchForm({ tournament: t });
    if ($('#rForm')) $('#rForm').onsubmit = e => {
      e.preventDefault(); const v = $('#rMsg').value.trim(); if (!v) return;
      mutate(tt => tt.chat.push({ who: displayName(), me: true, owner: me, t: v, at: Date.now() }));
      $('#rMsg').value = ''; drawChat(); bump('chat');
      const bots = t.members.filter(m => m.id.startsWith('bot:'));
      if (bots.length && Math.random() < 0.7) {
        const replies = ['Gražu! 💪', 'Pas mus kol kas tylu…', 'Kas kimba? Aš ant voblerio bandau', 'Šiandien slėgis krenta — turėtų kibti!', 'Ačiū, sėkmės ir tau 🎣', 'Kur stovit? Mes prie nendrių', 'Rytoj važiuoju anksti ryte'];
        setTimeout(() => { mutate(tt => tt.chat.push({ who: bots[Math.floor(Math.random() * bots.length)].name, me: false, t: replies[Math.floor(Math.random() * replies.length)], at: Date.now() })); if ($('#rChat')) drawChat(); }, 1500 + Math.random() * 2500);
      }
    };
  }

  // =========================================================
  // LAIMIKIO FORMA ir ATPAŽINIMAS
  // =========================================================
  function catchForm(opts = {}) {
    const edit = opts.edit;
    const c = edit || {};
    const t = opts.tournament;
    const local = d => { const x = new Date(d - new Date().getTimezoneOffset() * 60000); return x.toISOString().slice(0, 16); };
    let photo = c.photo || opts.photo || null;
    modal(edit ? '✏️ Redaguoti laimikį' : t ? '🏆 Pateikti laimikį' : '🐟 Naujas laimikis',
      '<form id="ccf" class="form-grid">' +
      '<label class="field full" style="cursor:pointer"><div id="phPrev" style="height:150px;border-radius:14px;border:1px dashed var(--line-hi);display:grid;place-items:center;overflow:hidden;background:rgba(5,10,20,.5)">' + (photo ? '<img src="' + photo + '" style="width:100%;height:100%;object-fit:cover">' : '<span class="muted">📷 Pridėti nuotrauką</span>') + '</div><input type="file" accept="image/*" id="phIn" class="hide"></label>' +
      '<label class="field">Rūšis<select class="input" name="species" required>' + (t && t.species ? '<option value="' + t.species + '">' + SPECIES[t.species].name + '</option>' : speciesOptions(c.species || opts.species || 'lydeka')) + '</select></label>' +
      '<label class="field">Svoris, kg<input class="input num" type="number" name="weight" step="0.01" min="0.01" max="150" required value="' + (c.weight || '') + '"></label>' +
      '<label class="field">Ilgis, cm<input class="input num" type="number" name="length" step="1" min="1" max="300" value="' + (c.length || '') + '"></label>' +
      '<label class="field">Data ir laikas<input class="input" type="datetime-local" name="date" required value="' + local(c.date || Date.now()) + '"' + (t ? ' readonly' : '') + '></label>' +
      '<label class="field full">Telkinys<select class="input" name="spot">' + spotOptions(c.spot || (t && t.spot) || state.spotId) + '</select></label>' +
      '<label class="field full">Masalas<input class="input" name="bait" maxlength="60" placeholder="pvz. Vobleris 10 cm" value="' + esc(c.bait || '') + '"></label>' +
      '<label class="check full"><input type="checkbox" name="released"' + (c.released ? ' checked' : '') + '>Paleista atgal 🌿</label>' +
      '<label class="field full">Pastabos<textarea class="input" name="note" maxlength="300">' + esc(c.note || '') + '</textarea></label>' +
      '<button class="btn primary block full">' + (edit ? 'Išsaugoti' : 'Įrašyti laimikį') + '</button></form>', (bg, close) => {
      $('#phIn', bg).onchange = async e => {
        const f = e.target.files[0]; if (!f) return;
        try { photo = (await compressImage(f)).url; $('#phPrev', bg).innerHTML = '<img src="' + photo + '" style="width:100%;height:100%;object-fit:cover">'; }
        catch (err) { toast(err.message, 'err'); }
      };
      $('#ccf', bg).onsubmit = async e => {
        e.preventDefault();
        const f = new FormData(e.target);
        const date = new Date(f.get('date')).getTime();
        const spot = f.get('spot');
        let bite = c.bite;
        try {
          const w = await K.weather(K.spotById(spot));
          const i = w.hours.findIndex(h => Math.abs(h.t - date) < 1800001);
          if (i >= 0) { bite = K.biteAt(w, i, f.get('species')).score; }
        } catch (err) {}
        const entry = { id: c.id || 'k' + Date.now(), species: f.get('species'), weight: +f.get('weight'), length: +f.get('length') || null, date, spot, bait: f.get('bait').trim(), released: !!f.get('released'), note: f.get('note').trim(), photo, bite: bite == null ? null : bite };
        const before = gotSet();
        const list = catches();
        const i = list.findIndex(x => x.id === entry.id);
        if (i >= 0) list[i] = entry; else list.push(entry);
        if (!userData.set('catches', list)) {
          entry.photo = null; if (i >= 0) list[i] = entry; else list[list.length - 1] = entry;
          userData.set('catches', list); toast('Atmintis pilna — laimikis išsaugotas be nuotraukos', 'err');
        }
        if (t) {
          const tl = tours(); const tt = tl.find(x => x.code === t.code);
          tt.entries.push({ id: 'e' + Date.now(), member: auth.key(), name: displayName(), species: entry.species, weight: entry.weight, at: Date.now(), photo: entry.photo });
          if (!saveTours(tl)) { tt.entries[tt.entries.length - 1].photo = null; saveTours(tl); }
        }
        close();
        toast(edit ? 'Laimikis atnaujintas' : '🎉 Laimikis įrašytas!' + (bite != null ? ' Kibimas tuo metu: ' + bite + '%' : ''));
        announce(before);
        route();
      };
    });
  }

  // Paprastas „atpažinimas“ pagal nuotraukos spalvas — pasiūlo 3 rūšis, vartotojas patvirtina.
  async function recognize(file) {
    let img;
    try { img = await compressImage(file); } catch (e) { return toast(e.message, 'err'); }
    const close = modal('📸 Atpažįstama…', '<div style="position:relative;border-radius:16px;overflow:hidden"><img src="' + img.url + '" style="width:100%;max-height:300px;object-fit:cover"><div id="scanBar" style="position:absolute;left:0;right:0;height:3px;background:#00ffbf;box-shadow:0 0 20px #00ffbf;top:0;transition:top 1.4s linear"></div></div><div id="scanOut" class="mt"><div class="skeleton" style="height:120px"></div></div>');
    requestAnimationFrame(() => { const b = $('#scanBar'); if (b) b.style.top = 'calc(100% - 3px)'; });
    const cv = img.canvas, ctx = cv.getContext('2d');
    const cx = cv.width * 0.2, cy = cv.height * 0.2, d = ctx.getImageData(cx, cy, cv.width * 0.6, cv.height * 0.6).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 16) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
    r /= n; g /= n; b /= n;
    const sat = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
    const prof = { lydeka: [95, 110, 70], eserys: [130, 135, 80], karpis: [150, 120, 60], lynas: [110, 115, 55], karsis: [150, 145, 135], starkis: [140, 140, 125], kuoja: [165, 160, 150], upetakis: [140, 120, 100] };
    const dist = Object.entries(prof).map(([id, p]) => [id, Math.hypot(r - p[0], g - p[1], b - p[2]) + (sat < 0.12 && ['karsis', 'kuoja', 'starkis'].includes(id) ? -20 : 0)]).sort((a, b) => a[1] - b[1]).slice(0, 3);
    const tot = dist.reduce((a, x) => a + 1 / (x[1] + 10), 0);
    const res = dist.map(([id, v]) => ({ id, p: Math.round((1 / (v + 10)) / tot * 100) }));
    await new Promise(r2 => setTimeout(r2, 1500));
    const out = $('#scanOut'); if (!out) return;
    const ttl = out.closest('.modal').querySelector('.modal-head h2'); if (ttl) ttl.textContent = '📸 Rezultatas';
    out.innerHTML = '<p class="muted" style="margin-top:0;font-size:13px">Pasirink teisingą rūšį (atpažinimas beta — spėjimas pagal spalvas):</p><div class="list">' +
      res.map((x, i) => '<button class="row" data-pick="' + x.id + '"><span style="font-size:24px">' + SPECIES[x.id].emoji + '</span><div class="grow"><div class="t">' + SPECIES[x.id].name + '</div><div class="bar" style="margin-top:6px;height:5px"><i style="width:' + x.p + '%"></i></div></div><b class="num">' + x.p + '%</b>' + (i === 0 ? '<span class="tag good">Labiausiai tikėtina</span>' : '') + '</button>').join('') +
      '</div><button class="btn block mt-s" data-pick="">Kita rūšis…</button>';
    bump('scans');
    $$('[data-pick]', out).forEach(bt => bt.onclick = () => { close(); catchForm({ photo: img.url, species: bt.dataset.pick || undefined }); });
  }

  // =========================================================
  // PROFILIS
  // =========================================================
  function Profile(parts, params) {
    const u = auth.current();
    const tab = params.get('tab') || 'profile';
    const list = catches().slice().sort((a, b) => b.date - a.date);
    const st = streaks(list);
    const heaviest = list.reduce((m, c) => Math.max(m, c.weight || 0), 0);
    const ach = achievements();
    const premium = userData.get('premium', false);
    const ava = u && u.avatar ? '<img src="' + u.avatar + '" alt="">' : esc(displayName()[0].toUpperCase());

    view.innerHTML = '<div class="page">' +
      '<div class="card hi"><div class="room-head"><label class="avatar" title="' + (u ? 'Keisti nuotrauką' : '') + '" style="cursor:' + (u ? 'pointer' : 'default') + '">' + ava + (u ? '<input type="file" accept="image/*,.heic,.heif" id="avaIn" class="hide">' : '') + '</label>' +
      '<div style="flex:1;min-width:200px"><h1 class="title">' + esc(displayName()) + (premium ? ' <span class="tag good" style="vertical-align:middle">' + ic('crown', 'style="width:14px"') + ' Premium</span>' : '') + '</h1><p class="muted" style="margin:6px 0 0">📍 ' + esc((u && u.location) || 'Lietuva') + (u ? ' · ' + esc(u.email) : '') + '</p></div>' +
      '<div class="row-gap">' + (u ? '<button class="btn" id="editP">' + ic('pen') + 'Redaguoti</button><button class="btn" id="logout">' + ic('logout') + 'Atsijungti</button>' : '<button class="btn primary" id="login">Prisijungti / Registruotis</button>') + '</div></div></div>' +

      '<div class="tabs mt"><button class="' + (tab === 'profile' ? 'on' : '') + '" data-tab="profile">📊 Profilis</button><button class="' + (tab === 'catches' ? 'on' : '') + '" data-tab="catches">🐟 Laimikiai</button></div>' +

      '<input type="file" accept="image/*,.heic,.heif" id="scanIn" class="hide"><input type="file" accept="image/*,.heic,.heif" capture="environment" id="scanCam" class="hide">' +
      '<div class="grid g2 mt"><button class="action-tile" id="scanBtn"><div class="ai">' + ic('camera') + '</div><div><b>📸 Atpažinti laimikį</b><div class="muted" style="font-size:13px">Įkelk nuotrauką — pasiūlysime rūšį</div></div></button>' +
      '<button class="action-tile" id="manualBtn"><div class="ai">' + ic('pen') + '</div><div><b>✏️ Įrašyti rankiniu būdu</b><div class="muted" style="font-size:13px">Orai ir kibimo balas išsaugomi automatiškai</div></div></button></div>' +

      '<div class="grid g4 mt">' + tile('🎣', list.length, 'Laimikių') + tile('⚖️', heaviest ? heaviest.toFixed(2) : '–', 'Sunkiausias kg') + tile('🐟', new Set(list.map(c => c.species)).size, 'Rūšys') + tile('🔥', st.current, 'Serija (d.)') + '</div>' +
      '<div id="tabBody" class="mt"></div></div>';

    const body = $('#tabBody');
    if (tab === 'profile') {
      const got = ach.filter(a => a.got).length;
      body.innerHTML = (list.length ? '' : '<div class="card empty" style="margin-bottom:18px"><div class="big-ico">🐟</div><h2>🎣 Pradėk savo žvejybos dienoraštį!</h2><p class="muted" style="max-width:460px;margin:0 auto">Kiekvienas laimikis automatiškai saugo orus, vietą ir masalą – taip sužinosi, kas veikia geriausiai!</p></div>') +
        '<div class="card"><div class="card-head"><h2>🏅 Pasiekimai</h2><span class="muted num">' + got + ' / ' + ach.length + '</span></div><div class="bar" style="margin-bottom:18px"><i style="width:' + (got / ach.length * 100) + '%"></i></div><div class="badges">' +
        ach.map(a => '<div class="badge ' + (a.got ? 'got' : 'locked') + '" title="' + a.desc + '"><img src="img/badges/' + a.id + '.png" alt="' + a.name + '" loading="lazy"><div class="n">' + a.name + '</div><div class="ds">' + (a.got ? '✓ Gauta' : a.desc) + '</div></div>').join('') + '</div></div>' +
        (list.length ? insights(list) : '') +
        '<div class="card mt"><div class="card-head"><h2>⚙️ Nustatymai</h2></div><div class="list">' +
          '<div class="row"><span style="font-size:20px">👑</span><div class="grow"><div class="t">Kibk Premium</div><div class="s">' + (premium ? 'Aktyvus — ačiū, kad palaikai!' : 'Išplėstinės prognozės ir daugiau') + '</div></div><button class="btn sm ' + (premium ? '' : 'primary') + '" id="premBtn">' + (premium ? 'Valdyti' : 'Gauti') + '</button></div>' +
          '<div class="row"><span style="font-size:20px">💾</span><div class="grow"><div class="t">Duomenų atsarginė kopija</div><div class="s">Eksportuok arba įkelk savo laimikius (JSON)</div></div><button class="btn sm" id="expBtn">' + ic('download') + 'Eksportuoti</button><label class="btn sm">' + ic('upload') + 'Importuoti<input type="file" accept="application/json,.json" id="impIn" class="hide"></label></div>' +
          '<div class="row"><span style="font-size:20px">🗑️</span><div class="grow"><div class="t">Ištrinti mano laimikius</div><div class="s">Veiksmo atšaukti nebus galima</div></div><button class="btn sm danger" id="wipeBtn">Ištrinti</button></div>' +
        '</div></div>';
    } else {
      const f = params.get('sp') || '';
      const shown = f ? list.filter(c => c.species === f) : list;
      const used = [...new Set(list.map(c => c.species))];
      body.innerHTML = (list.length ? '<div class="chips" style="margin-bottom:16px"><button class="chip' + (!f ? ' on' : '') + '" data-f="">Visi (' + list.length + ')</button>' + used.map(id => '<button class="chip' + (f === id ? ' on' : '') + '" data-f="' + id + '">' + SPECIES[id].emoji + ' ' + SPECIES[id].name + ' (' + list.filter(c => c.species === id).length + ')</button>').join('') + '</div>' : '') +
        (shown.length ? '<div class="grid g3">' + shown.map(c => { const s = K.spotById(c.spot); return '<div class="card catch-card"><div class="ph">' + (c.photo ? '<img src="' + c.photo + '" alt="">' : SPECIES[c.species].emoji) + '</div><div class="bd">' +
          '<div class="row-gap" style="justify-content:space-between"><h2 style="margin:0">' + SPECIES[c.species].name + '</h2><b class="num grad-text" style="font-size:20px">' + c.weight.toFixed(2) + ' kg</b></div>' +
          '<div class="muted" style="font-size:13px">📍 ' + (s ? s.name : '—') + ' · ' + fmtDT(c.date) + '</div>' +
          '<div class="chips" style="gap:5px">' + (c.length ? '<span class="tag">📏 ' + c.length + ' cm</span>' : '') + (c.bait ? '<span class="tag">🪝 ' + esc(c.bait) + '</span>' : '') + (c.bite != null ? '<span class="tag ' + K.level(c.bite).cls + '">Kibimas ' + c.bite + '%</span>' : '') + (c.released ? '<span class="tag good">🌿 Paleista</span>' : '') + '</div>' +
          (c.note ? '<p style="margin:4px 0 0;font-size:13px" class="muted">' + esc(c.note) + '</p>' : '') +
          '<div class="row-gap mt-s"><button class="btn sm" data-ed="' + c.id + '">' + ic('pen') + 'Redaguoti</button><button class="btn sm danger icon" data-del="' + c.id + '" title="Ištrinti">' + ic('trash') + '</button></div></div></div>'; }).join('') + '</div>'
        : '<div class="card empty"><div class="big-ico">🐟</div><h2>Laimikių dar nėra</h2><p class="muted">Pirmas laimikis atrakins pasiekimą „Pirmas laimikis“ 🏅</p></div>');
      $$('[data-f]').forEach(b => b.onclick = () => { location.hash = '#/profile?tab=catches' + (b.dataset.f ? '&sp=' + b.dataset.f : ''); });
      $$('[data-ed]').forEach(b => b.onclick = () => catchForm({ edit: catches().find(c => c.id === b.dataset.ed) }));
      $$('[data-del]').forEach(b => b.onclick = () => { if (!confirm('Ištrinti šį laimikį?')) return; userData.set('catches', catches().filter(c => c.id !== b.dataset.del)); toast('Laimikis ištrintas', 'info'); route(); });
    }

    $$('[data-tab]').forEach(b => b.onclick = () => { location.hash = '#/profile?tab=' + b.dataset.tab; });
    $('#scanBtn').onclick = () => {
      const close = modal('📸 Atpažinti laimikį', '<div class="grid g2"><button class="action-tile" id="pCam"><div class="ai">' + ic('camera') + '</div><b>Fotografuoti</b></button><button class="action-tile" id="pGal"><div class="ai">' + ic('upload') + '</div><b>Iš galerijos</b></button></div>', (bg, cl) => {
        $('#pCam', bg).onclick = () => { cl(); $('#scanCam').click(); };
        $('#pGal', bg).onclick = () => { cl(); $('#scanIn').click(); };
      });
    };
    ['#scanIn', '#scanCam'].forEach(s => $(s).onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) recognize(f); });
    $('#manualBtn').onclick = () => catchForm();
    if ($('#login')) $('#login').onclick = () => authModal();
    if ($('#logout')) $('#logout').onclick = () => { store.del('session'); toast('Atsijungta', 'info'); shell(); route(); };
    if ($('#editP')) $('#editP').onclick = editProfile;
    if ($('#avaIn')) $('#avaIn').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { const im = await compressImage(f, 300, 0.8); const uu = auth.current(); uu.avatar = im.url; auth.save(uu); toast('Nuotrauka atnaujinta'); route(); } catch (err) { toast(err.message, 'err'); }
    };
    if ($('#premBtn')) $('#premBtn').onclick = pricing;
    if ($('#expBtn')) $('#expBtn').onclick = () => {
      const blob = new Blob([JSON.stringify({ app: 'kibk', version: 1, exported: new Date().toISOString(), catches: catches() }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'kibk-laimikiai-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    if ($('#impIn')) $('#impIn').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const fr = new FileReader(); fr.onload = () => {
        try {
          const j = JSON.parse(fr.result); const arr = Array.isArray(j) ? j : j.catches;
          if (!Array.isArray(arr)) throw new Error();
          const valid = arr.filter(c => c && SPECIES[c.species] && +c.weight > 0 && c.date);
          const cur = catches(); const ids = new Set(cur.map(c => c.id));
          const before = gotSet();
          valid.forEach(c => { if (!ids.has(c.id)) cur.push(Object.assign({ id: 'k' + Math.random().toString(36).slice(2) }, c, { weight: +c.weight })); });
          userData.set('catches', cur); toast('Importuota: ' + valid.length + ' laimikiai'); announce(before); route();
        } catch (err) { toast('Netinkamas failas', 'err'); }
      }; fr.readAsText(f);
    };
    if ($('#wipeBtn')) $('#wipeBtn').onclick = () => { if (!confirm('Tikrai ištrinti visus laimikius?')) return; userData.set('catches', []); toast('Laimikiai ištrinti', 'info'); route(); };
    animateRings();
  }

  function insights(list) {
    const by = {}; list.forEach(c => { by[c.species] = (by[c.species] || 0) + 1; });
    const max = Math.max(...Object.values(by));
    const baits = {}; list.forEach(c => { if (c.bait) baits[c.bait] = (baits[c.bait] || 0) + 1; });
    const topBait = Object.entries(baits).sort((a, b) => b[1] - a[1])[0];
    const hours = list.map(c => new Date(c.date).getHours());
    const bucket = [0, 0, 0, 0]; hours.forEach(h => bucket[h < 6 ? 0 : h < 12 ? 1 : h < 18 ? 2 : 3]++);
    const bn = ['Naktis', 'Rytas', 'Diena', 'Vakaras'][bucket.indexOf(Math.max(...bucket))];
    const withBite = list.filter(c => c.bite != null);
    const avgBite = withBite.length ? Math.round(withBite.reduce((a, c) => a + c.bite, 0) / withBite.length) : null;
    return '<div class="grid g2 mt"><div class="card"><div class="card-head"><h2>📈 Laimikiai pagal rūšį</h2></div><div class="list">' +
      Object.entries(by).sort((a, b) => b[1] - a[1]).map(([id, n]) => '<div><div class="row-gap" style="justify-content:space-between;margin-bottom:6px"><span>' + SPECIES[id].emoji + ' ' + SPECIES[id].name + '</span><b class="num">' + n + '</b></div><div class="bar"><i style="width:' + (n / max * 100) + '%"></i></div></div>').join('') + '</div></div>' +
      '<div class="card"><div class="card-head"><h2>🧠 Kas tau veikia</h2></div><div class="list">' +
      '<div class="row"><span>⏰</span><div class="grow"><div class="s">Sėkmingiausias paros metas</div><div class="t">' + bn + '</div></div></div>' +
      '<div class="row"><span>🪝</span><div class="grow"><div class="s">Dažniausias masalas</div><div class="t">' + (topBait ? esc(topBait[0]) : '—') + '</div></div></div>' +
      '<div class="row"><span>📊</span><div class="grow"><div class="s">Vid. kibimo balas, kai pagavai</div><div class="t">' + (avgBite != null ? avgBite + '%' : '—') + '</div></div></div>' +
      '<div class="row"><span>🔥</span><div class="grow"><div class="s">Ilgiausia serija</div><div class="t">' + streaks(list).best + ' d.</div></div></div></div></div></div>';
  }

  function authModal(mode = 'login') {
    const reg = mode === 'register';
    modal(reg ? 'Registracija' : 'Prisijungimas',
      '<div class="tabs" style="width:100%;margin-bottom:18px"><button style="flex:1" class="' + (!reg ? 'on' : '') + '" data-m="login">Prisijungti</button><button style="flex:1" class="' + (reg ? 'on' : '') + '" data-m="register">Registruotis</button></div>' +
      '<form id="af" class="form-grid">' + (reg ? '<label class="field full">Vardas<input class="input" name="name" required maxlength="30" autocomplete="name"></label><label class="field full">Miestas<input class="input" name="location" maxlength="40" placeholder="Lietuva"></label>' : '') +
      '<label class="field full">El. paštas<input class="input" type="email" name="email" required autocomplete="email"></label>' +
      '<label class="field full">Slaptažodis<input class="input" type="password" name="password" required minlength="6" autocomplete="' + (reg ? 'new-password' : 'current-password') + '"></label>' +
      '<div class="full" id="aErr" style="color:var(--bad);font-size:13px"></div>' +
      '<button class="btn primary block full">' + (reg ? 'Sukurti paskyrą' : 'Prisijungti') + '</button>' +
      '<p class="full muted" style="font-size:12px;margin:0;text-align:center">Paskyra saugoma tik šiame įrenginyje.' + (reg ? ' Svečio laimikiai bus perkelti į naują paskyrą.' : '') + '</p></form>', (bg, close) => {
      $$('[data-m]', bg).forEach(b => b.onclick = () => { close(); authModal(b.dataset.m); });
      $('#af', bg).onsubmit = async e => {
        e.preventDefault();
        const f = new FormData(e.target);
        const email = f.get('email').trim().toLowerCase();
        const pw = await auth.hash(f.get('password'));
        const users = auth.users();
        const err = m => { $('#aErr', bg).textContent = m; };
        if (reg) {
          if (users[email]) return err('Šis el. paštas jau užregistruotas. Bandykite prisijungti.');
          if (f.get('password').length < 6) return err('Slaptažodis per trumpas. Turi būti bent 6 simboliai.');
          const guest = store.get('catches_guest', []);
          auth.save({ email, name: f.get('name').trim(), location: f.get('location').trim() || 'Lietuva', pw, created: Date.now() });
          store.set('session', email);
          if (guest.length) { store.set('catches_' + email, guest); store.del('catches_guest'); }
          ['stats', 'aiChat'].forEach(k => { const g = store.get(k + '_guest'); if (g) { store.set(k + '_' + email, g); store.del(k + '_guest'); } });
          // perkelti svečio narystes turnyruose
          const tl = tours(); tl.forEach(t => { t.members.forEach(m => { if (m.id === 'guest') { m.id = email; m.name = f.get('name').trim(); } }); t.entries.forEach(x => { if (x.member === 'guest') { x.member = email; x.name = f.get('name').trim(); } }); t.chat.forEach(x => { if (x.owner === 'guest') { x.owner = email; x.who = f.get('name').trim(); } }); if (t.owner === 'guest') t.owner = email; }); saveTours(tl);
          close(); toast('Sveiki prisijungę, ' + esc(f.get('name').trim()) + '! 🎣');
        } else {
          const u = users[email];
          if (!u || u.pw !== pw) return err('Neteisingas el. paštas arba slaptažodis.');
          store.set('session', email); close(); toast('Sveiki sugrįžę, ' + esc(u.name) + '!');
        }
        route();
      };
    });
  }
  function editProfile() {
    const u = auth.current();
    modal('Redaguoti profilį', '<form id="ef" class="form-grid"><label class="field full">Vardas<input class="input" name="name" required maxlength="30" value="' + esc(u.name) + '"></label><label class="field full">Miestas<input class="input" name="location" maxlength="40" value="' + esc(u.location || '') + '"></label>' +
      (u.avatar ? '<label class="check full"><input type="checkbox" name="rmAva">Pašalinti profilio nuotrauką</label>' : '') + '<button class="btn primary block full">Išsaugoti</button></form>', (bg, close) => {
      $('#ef', bg).onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); u.name = f.get('name').trim(); u.location = f.get('location').trim(); if (f.get('rmAva')) delete u.avatar; auth.save(u); close(); toast('Profilis atnaujintas'); route(); };
    });
  }
  function pricing() {
    const premium = userData.get('premium', false);
    modal('👑 Kibk Premium', '<div class="grid g2">' +
      '<div class="card" style="padding:18px"><h3>Mėnesinis</h3><div class="num" style="font-size:30px;font-weight:700">2,99 €<span class="muted" style="font-size:14px">/mėn.</span></div></div>' +
      '<div class="card hi" style="padding:18px"><span class="tag good" style="position:absolute;top:-10px;right:12px">−45%</span><h3>Metinis</h3><div class="num" style="font-size:30px;font-weight:700">19,99 €<span class="muted" style="font-size:14px">/m.</span></div></div></div>' +
      '<div class="list mt">' + ['Kibimo prognozė kiekvienai rūšiai', 'Neribotas KIBK AI', 'Privatūs turnyrai be ribų', 'Premium ženkliukas 👑'].map(x => '<div class="row-gap">✅ ' + x + '</div>').join('') + '</div>' +
      '<p class="muted" style="font-size:12px">Demonstracinė versija — mokėjimai neapdorojami.</p>' +
      '<button class="btn ' + (premium ? 'danger' : 'primary') + ' block mt" id="pAct">' + (premium ? 'Išjungti Premium' : 'Aktyvuoti Premium (demo)') + '</button>', (bg, close) => {
      $('#pAct', bg).onclick = () => { const before = gotSet(); userData.set('premium', !premium); close(); toast(premium ? 'Premium išjungtas' : '👑 Premium aktyvuotas!', premium ? 'info' : 'ok'); announce(before); route(); };
    });
  }

  // ---------- Paleidimas ----------
  shell();
  window.addEventListener('hashchange', route);
  route();
  // Fone parsiunčiam visų telkinių orus, kad žemėlapis ir „Top“ atsidarytų akimirksniu.
  setTimeout(() => K.weatherAll(), 800);
})();
