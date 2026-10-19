// Statiniai duomenys: telkiniai, žuvų rūšys, masalų automatai, pasiekimai.
window.KIBK_DATA = (function () {
  const SPECIES = {
    lydeka:   { name: 'Lydeka',   emoji: '🦈', predator: true,  temp: [8, 18],  night: false, pressureFall: true,  wind: 0.6, depth: '1–6 m prie žolių ir nendrių',
                baits: ['Vobleriai 9–12 cm', 'Blizgės (sukrės)', 'Silikonai 10–15 cm', 'Gyva žuvelė'], best: 'ankstyvas rytas ir vakaras, debesuota' },
    eserys:   { name: 'Ešerys',   emoji: '🐠', predator: true,  temp: [12, 22], night: false, pressureFall: false, wind: 0.4, depth: '2–8 m prie kraštų ir kalvelių',
                baits: ['Mikrosilikonai 3–6 cm', 'Sukrės Nr. 1–2', 'Sliekas', 'Bokoplavai'], best: 'dieną, stabilus slėgis' },
    starkis:  { name: 'Starkis',  emoji: '🐟', predator: true,  temp: [10, 20], night: true,  pressureFall: true,  wind: 0.5, depth: '4–12 m kietas dugnas',
                baits: ['Silikonai „twister“ 8–12 cm', 'Vobleriai naktį', 'Gyva žuvelė'], best: 'prieblanda ir naktis' },
    karsis:   { name: 'Karšis',   emoji: '🐡', predator: false, temp: [14, 24], night: true,  pressureFall: false, wind: 0.3, depth: '4–10 m duobės, kanalai',
                baits: ['Musės lervos', 'Kukurūzai', 'Sliekas', 'Jaukas su kanapėmis'], best: 'vakaras ir naktis, šiltas oras' },
    kuoja:    { name: 'Kuoja',    emoji: '🐟', predator: false, temp: [10, 22], night: false, pressureFall: false, wind: 0.3, depth: '1–4 m prie augalijos',
                baits: ['Musės lervos', 'Duona', 'Kruopos', 'Kraujo uodo lerva'], best: 'rytas, saulėta' },
    lynas:    { name: 'Lynas',    emoji: '🐟', predator: false, temp: [17, 26], night: false, pressureFall: false, wind: 0.1, depth: '1–3 m dumblėti užutėkiai',
                baits: ['Sliekas', 'Kukurūzai', 'Musės lervos'], best: 'ankstyvas rytas, ramus oras' },
    karpis:   { name: 'Karpis',   emoji: '🐠', predator: false, temp: [18, 27], night: true,  pressureFall: false, wind: 0.4, depth: '1–5 m šiltos seklumos',
                baits: ['Boiliai', 'Kukurūzai', 'Pelletai', 'Tigro riešutai'], best: 'šiltos naktys, stabilus slėgis' },
    samas:    { name: 'Šamas',    emoji: '🐋', predator: true,  temp: [18, 28], night: true,  pressureFall: true,  wind: 0.2, depth: '6–15 m duobės upėse',
                baits: ['Kvokas + gyva žuvelė', 'Sliekų kekė', 'Dideli vobleriai'], best: 'šiltos naktys prieš audrą' },
    vegele:   { name: 'Vėgėlė',   emoji: '🐍', predator: true,  temp: [0, 10],  night: true,  pressureFall: true,  wind: 0.5, depth: '3–10 m akmenuotas dugnas',
                baits: ['Sliekų kekė', 'Žuvelės gabalas', 'Ešerio galva'], best: 'šaltos naktys, rudenį ir žiemą' },
    upetakis: { name: 'Upėtakis', emoji: '🐟', predator: true,  temp: [6, 16],  night: false, pressureFall: true,  wind: 0.3, depth: 'srovė už akmenų',
                baits: ['Mažos sukrės', 'Musės (musinė)', 'Mikrovobleriai'], best: 'drumstas vanduo po lietaus' },
    kirslys:  { name: 'Kiršlys',  emoji: '🐟', predator: false, temp: [4, 15],  night: false, pressureFall: false, wind: 0.3, depth: 'sraunūs ruožai',
                baits: ['Sausos musės', 'Nimfos', 'Mažos sukrės'], best: 'vėsios rudens dienos' },
    salatis:  { name: 'Salatis',  emoji: '🐟', predator: true,  temp: [12, 22], night: false, pressureFall: false, wind: 0.4, depth: 'paviršius, srovės ribos',
                baits: ['Paviršiniai vobleriai', 'Pilkeriai', 'Sukrės'], best: 'saulėtas rytas, žuvelių būriai' },
  };

  // [id, pavadinimas, tipas, lat, lng, maks. gylis m, plotas ha, regionas, rūšys]
  const RAW = [
    ['plateliai', 'Platelių ež.', 'ezeras', 56.044, 21.857, 46, 1205, 'Plungės r.', ['lydeka','eserys','kuoja','karsis','lynas','starkis']],
    ['tauragnas', 'Tauragno ež.', 'ezeras', 55.447, 25.818, 62.5, 518, 'Utenos r.', ['eserys','lydeka','kuoja','vegele','karsis']],
    ['druksiai', 'Drūkšių ež.', 'ezeras', 55.621, 26.598, 33.3, 4479, 'Zarasų r.', ['starkis','lydeka','karsis','eserys','vegele']],
    ['dysnai', 'Dysnų ež.', 'ezeras', 55.556, 26.432, 6, 2394, 'Ignalinos r.', ['lydeka','karsis','kuoja','lynas','starkis']],
    ['sartai', 'Sartų ež.', 'ezeras', 55.811, 25.833, 22, 1330, 'Rokiškio r.', ['lydeka','eserys','starkis','karsis','kuoja']],
    ['asveja', 'Asvejos ež.', 'ezeras', 55.025, 25.527, 50.2, 1015, 'Švenčionių r.', ['lydeka','eserys','vegele','kuoja']],
    ['galve', 'Galvės ež.', 'ezeras', 54.648, 24.941, 46.7, 361, 'Trakų r.', ['eserys','lydeka','kuoja','karsis','lynas']],
    ['vistytis', 'Vištyčio ež.', 'ezeras', 54.433, 22.731, 54, 1785, 'Vilkaviškio r.', ['lydeka','eserys','vegele','starkis']],
    ['dusia', 'Dusios ež.', 'ezeras', 54.290, 23.718, 32.6, 2334, 'Lazdijų r.', ['starkis','lydeka','eserys','karsis','vegele']],
    ['metelys', 'Metelio ež.', 'ezeras', 54.308, 23.760, 15, 1290, 'Lazdijų r.', ['lydeka','karsis','lynas','kuoja','eserys']],
    ['daugai', 'Daugų ež.', 'ezeras', 54.367, 24.335, 44, 917, 'Alytaus r.', ['eserys','lydeka','kuoja','karsis']],
    ['zarasas', 'Zaraso ež.', 'ezeras', 55.735, 26.255, 37.5, 323, 'Zarasų r.', ['lydeka','eserys','kuoja','vegele']],
    ['rubikiai', 'Rubikių ež.', 'ezeras', 55.522, 25.283, 16, 970, 'Anykščių r.', ['lydeka','eserys','karsis','lynas','kuoja']],
    ['baluosas', 'Baluošo ež.', 'ezeras', 55.395, 26.050, 37.5, 358, 'Ignalinos r.', ['lydeka','eserys','kuoja']],
    ['rekyva', 'Rėkyvos ež.', 'ezeras', 55.860, 23.282, 4, 1179, 'Šiaulių m.', ['lydeka','kuoja','lynas','eserys']],
    ['lukstas', 'Lūksto ež.', 'ezeras', 55.775, 22.370, 7, 1003, 'Telšių r.', ['lydeka','kuoja','eserys','karsis']],
    ['mastis', 'Masčio ež.', 'ezeras', 55.990, 22.250, 8, 270, 'Telšių m.', ['eserys','lydeka','kuoja','lynas']],
    ['avilys', 'Avilio ež.', 'ezeras', 55.695, 26.050, 13.3, 1246, 'Zarasų r.', ['lydeka','karsis','eserys','starkis']],
    ['simnas', 'Simno ež.', 'ezeras', 54.392, 23.645, 4.5, 305, 'Alytaus r.', ['lydeka','lynas','kuoja','eserys']],
    ['zuvintas', 'Žuvinto ež.', 'ezeras', 54.468, 23.620, 2.5, 966, 'Alytaus r.', ['lydeka','lynas','kuoja']],
    ['kaunomarios', 'Kauno marios', 'tvenkinys', 54.865, 24.100, 22, 6350, 'Kauno r.', ['starkis','karsis','lydeka','eserys','samas','kuoja']],
    ['elektrenai', 'Elektrėnų marios', 'tvenkinys', 54.780, 24.665, 30, 1263, 'Elektrėnų sav.', ['karpis','starkis','eserys','lydeka','karsis']],
    ['antaliepte', 'Antalieptės marios', 'tvenkinys', 55.665, 25.850, 30, 1897, 'Zarasų r.', ['lydeka','eserys','starkis','karsis']],
    ['kursiumarios', 'Kuršių marios', 'marios', 55.300, 21.120, 5.8, 41300, 'Neringa', ['starkis','karsis','eserys','lydeka','kuoja']],
    ['nemunas', 'Nemunas (Kaunas)', 'upe', 54.905, 23.880, 8, 0, 'Kaunas', ['samas','starkis','salatis','karsis','eserys']],
    ['nemunasrusne', 'Nemunas (Rusnė)', 'upe', 55.300, 21.370, 6, 0, 'Šilutės r.', ['starkis','karsis','lydeka','samas']],
    ['neris', 'Neris (Vilnius)', 'upe', 54.692, 25.240, 5, 0, 'Vilnius', ['salatis','upetakis','eserys','lydeka','samas']],
    ['sventoji', 'Šventoji (Anykščiai)', 'upe', 55.530, 25.105, 4, 0, 'Anykščių r.', ['upetakis','kirslys','salatis','eserys']],
    ['dubysa', 'Dubysa', 'upe', 55.350, 23.420, 3, 0, 'Raseinių r.', ['upetakis','kirslys','eserys','lydeka']],
    ['minija', 'Minija', 'upe', 55.720, 21.430, 3, 0, 'Klaipėdos r.', ['upetakis','kirslys','salatis','lydeka']],
    ['merkys', 'Merkys', 'upe', 54.170, 24.650, 3, 0, 'Varėnos r.', ['upetakis','kirslys','lydeka','eserys']],
    ['nevezis', 'Nevėžis', 'upe', 55.735, 24.360, 3, 0, 'Panevėžys', ['lydeka','eserys','kuoja','salatis']],
  ];
  const SPOTS = RAW.map(r => ({ id: r[0], name: r[1], type: r[2], lat: r[3], lng: r[4], depth: r[5], area: r[6], region: r[7], species: r[8] }));

  const TYPE_LABEL = { ezeras: 'Ežeras', upe: 'Upė', tvenkinys: 'Tvenkinys', marios: 'Marios' };

  const BAIT_MACHINES = [
    { name: 'Masalų automatas — Vilnius, Žirmūnai', lat: 54.712, lng: 25.300 },
    { name: 'Masalų automatas — Kaunas, Panemunė', lat: 54.880, lng: 23.960 },
    { name: 'Masalų automatas — Trakai', lat: 54.637, lng: 24.934 },
    { name: 'Masalų automatas — Zarasai', lat: 55.731, lng: 26.246 },
    { name: 'Masalų automatas — Klaipėda', lat: 55.703, lng: 21.144 },
    { name: 'Masalų automatas — Ignalina', lat: 55.342, lng: 26.165 },
  ];

  const ACHIEVEMENTS = [
    { id: 'first_catch', name: 'Pirmas laimikis', desc: 'Įrašyk pirmą laimikį' },
    { id: 'big_catch', name: 'Didžioji žuvis', desc: 'Pagauk ≥ 5 kg žuvį' },
    { id: 'predator_hunter', name: 'Plėšrūnų medžiotojas', desc: '10 plėšrių žuvų' },
    { id: 'carp_master', name: 'Karpių meistras', desc: '5 karpiai' },
    { id: 'collector', name: 'Kolekcininkas', desc: '5 skirtingos rūšys' },
    { id: 'explorer', name: 'Tyrinėtojas', desc: 'Žvejok 3 skirtinguose telkiniuose' },
    { id: 'early_bird', name: 'Ankstyvasis paukštis', desc: 'Laimikis iki 7:00' },
    { id: 'streak_7', name: '7 dienų serija', desc: '7 dienos iš eilės su laimikiu' },
    { id: 'marathon', name: 'Maratonas', desc: '50 laimikių' },
    { id: 'photo_reporter', name: 'Fotoreporteris', desc: '5 laimikiai su nuotrauka' },
    { id: 'first_scan', name: 'Pirmas skenavimas', desc: 'Atpažink laimikį iš nuotraukos' },
    { id: 'ai_expert', name: 'AI ekspertas', desc: 'Užduok KIBK AI 20 klausimų' },
    { id: 'chat_master', name: 'Pokalbių meistras', desc: '10 žinučių turnyruose' },
    { id: 'accurate', name: 'Taiklus', desc: '5 laimikiai, kai kibimas ≥ 70 %' },
    { id: 'conservationist', name: 'Gamtosaugininkas', desc: 'Paleisk 5 žuvis atgal' },
    { id: 'premium', name: 'Premium', desc: 'Aktyvuok Premium' },
  ];

  const TIPS = [
    'Krentant slėgiui plėšrūnai dažnai suaktyvėja — tai geras metas lydekai ir starkiui.',
    'Vėjas, pučiantis į krantą, suneša maistą — ten verta ieškoti žuvies.',
    'Saulėtą vidurdienį žuvis traukiasi gilyn — gramzdink masalą giliau.',
    'Po šiltos nakties karšis ir karpis dažnai kimba ryte prie seklumų.',
    'Lengvas lietus sumažina žuvies atsargumą — nepraleisk progos.',
    'Pilnaties naktimis kibimas būna permainingas — bandyk prieblandoje.',
  ];

  return { SPECIES, SPOTS, TYPE_LABEL, BAIT_MACHINES, ACHIEVEMENTS, TIPS };
})();
