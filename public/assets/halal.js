(function () {
  // Every entry records where its information came from. "checked" is the date WE last read the source.
  // status: "cert" = an official tourism source states local halal certification
  //         "listed" = appears in a third-party halal directory; certification not stated
  //         "pray" = mosque or prayer room
  var CHECKED = "24 Nov 2026";
  var VM = "https://visitmiyagi.com";
  var JT = "https://www.japan.travel/en/my/muslim-guide/travel-ideas/popular-sightseeing-spots-accessible-prayer-rooms-tohoku/";
  var PLACES = [
    { id: "hayase", name: "Hayase (Japanese)", kind: "eat", status: "cert", ll: [38.2589, 140.8811],
      where: "Hotel Metropolitan Sendai, 1-1-1 Chuo, Aoba-ku, Sendai",
      access: "About 1 minute on foot from JR Sendai Station (the hotel connects to the station).",
      says: "Visit Miyagi says all ingredients and seasonings are halal certified (local halal certification), with breakfast, lunch and dinner served. English menus and English-speaking staff. Reservation recommended, and required for halal meals.",
      src: [["Visit Miyagi: Hayase", VM + "/contents/japanese-halal-dining-at-hayase/"]] },
    { id: "serenity", name: "Restaurant & Cafe Serenity (Western)", kind: "eat", status: "cert", ll: [38.2591, 140.8814], // same hotel as Hayase, offset slightly so both pins show

      where: "Hotel Metropolitan Sendai, 2F, 1-1-1 Chuo, Aoba-ku, Sendai",
      access: "About 1 minute on foot from JR Sendai Station.",
      says: "Visit Miyagi describes Muslim-friendly Western-style dishes and halal-certified beef (local halal certification). Open to non-guests. Hours listed by Japan's national tourism organization: 11:30 to 15:00 (last order 14:30) and 17:00 to 21:30 (last order 21:00). Reservation required for halal meals.",
      src: [["Visit Miyagi: Serenity", VM + "/articles/halal-beef-at-restaurant-serenity/"], ["Japan National Tourism Organization", JT]] },
    { id: "iccs", name: "Islamic Cultural Center of Sendai (Sendai Masjid)", kind: "pray", status: "pray", ll: [38.2678, 140.8273],
      where: "7-7-24 Hachiman, Aoba-ku, Sendai",
      access: "17-minute walk from Kuzuoka Station (Senzan Line). About 7 km west of Sendai Station.",
      says: "Described by Visit Miyagi as the oldest mosque in Tohoku, opened 2 November 2007. Daily and Friday prayers, Quran classes, and Ramadan tarawih and iftar. If you contact them in advance, they can arrange someone who speaks your language.",
      src: [["Visit Miyagi: Sendai Masjid", VM + "/feature/sendai-masjid-prayer-rooms-in-sendai/"]] },
    { id: "airport", name: "Sendai Airport prayer room", kind: "pray", status: "pray", ll: [38.1378, 140.9216],
      where: "Sendai International Airport, 2F, Minamihara Shimomasuda, Natori",
      access: "3-minute walk from Sendai Airport Station. About 25 to 35 minutes by train from Sendai Station.",
      says: "Opened March 2018, the first prayer room inside a Tohoku airport. Japan's national tourism organization says it has a wudu facility and holds one person at a time. Sources disagree on hours (06:10 to 22:00 vs 06:30 to 21:00), so check before relying on it. The map pin is the airport, not the exact room.",
      src: [["Visit Miyagi", VM + "/feature/sendai-masjid-prayer-rooms-in-sendai/"], ["Japan National Tourism Organization", JT]] },
    { id: "zaytoon", name: "Zaytoon Sendai (Palestinian / Arab)", kind: "eat", status: "listed", ll: [38.2531, 140.8835],
      where: "3-5-65 Itsutsubashi, Wakabayashi-ku, Sendai (Taishi Mansion 1F), per the directory listing",
      access: "About 10 minutes on foot from Sendai Station (per listing).",
      says: "Listed in the Halal Food in Japan directory as halal Middle Eastern and Arab cuisine. We have not verified certification or what the kitchen uses.",
      src: [["Halal Food in Japan listing", "https://www.halalfoodinjapan.com/en/restaurant/Miyagi/sendaishi/miyaginoku-wakabayashiku/R10958/"]] },
    { id: "kumari", name: "KUMARI Sendai Station Square (Indian / Nepali)", kind: "eat", status: "listed", ll: [38.2654, 140.8856],
      where: "1-1-5 Odawara, Miyagino-ku, Sendai, 1F, per the directory listing",
      access: "About 10 minutes on foot from the east exit of Sendai Station (per listing).",
      says: "Listed in the Halal Food in Japan directory as halal Indian cuisine (halal naan, curry, tandoori, kebab). We have not verified certification.",
      src: [["Halal Food in Japan listing", "https://www.halalfoodinjapan.com/en/restaurant/Miyagi/sendaishi/miyaginoku-wakabayashiku/R10781/"]] },
    { id: "nan", name: "Nan Tandoori Halal Food Restaurant (Indian)", kind: "eat", status: "listed", ll: [38.2793, 140.8494],
      where: "North-west Sendai (Aoba-ku). Street address not confirmed.",
      access: "About 15 minutes on foot from Tohoku Fukushidai Station (JR Senzan Line), per the listing. Not walkable from Sendai Station.",
      says: "Listed in the Halal Food in Japan directory as a halal Indian restaurant. We have not verified certification.",
      src: [["Halal Food in Japan listing", "https://www.halalfoodinjapan.com/en/restaurant/Miyagi/sendaishi/aobakukougai/R10812/"]] }
  ];
  var LEADS = [
    ["Route227's CAFE TOHOKU (Kotodai Park, Sendai)", "Listed on a restaurant site as vegetarian, vegan and halal. Not yet verified by us."],
    ["Yahataya (Ishinomaki)", "Described in a 2017 guide as Tohoku's first halal restaurant, with a prayer room. Address and current status not confirmed."],
    ["Azumaya Honten Wanko Soba (Morioka)", "Named in a 2017 halal guide for Tohoku. Halal status unclear."],
    ["Jupiter, 1F JR Sendai Station", "A grocery that reportedly stocks some halal products. Not confirmed."]
  ];
  var BADGE = { cert: ["Locally certified", "cert"], listed: ["Listed, not verified", "listed"], pray: ["Prayer space", "pray"] };
  var ICON = { cert: "H", listed: "H", pray: "🕌" };
  var filter = "all", map = null, markers = {};
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function shown() { return PLACES.filter(function (p) { return filter === "all" || p.kind === filter; }); }

  function renderList() {
    $("hm-list").innerHTML = shown().map(function (p) {
      var b = BADGE[p.status];
      return '<li class="hm ' + p.status + '" id="p-' + p.id + '"><div class="hmtop"><b>' + esc(p.name) + '</b><span class="hbadge ' + b[1] + '">' + b[0] + '</span></div>' +
        '<p class="where">' + esc(p.where) + '</p><p>' + esc(p.says) + '</p><p class="acc"><b>Getting there:</b> ' + esc(p.access) + '</p>' +
        '<p class="srcs">Sources: ' + p.src.map(function (s) { return '<a href="' + s[1] + '" rel="noopener">' + esc(s[0]) + '</a>'; }).join(", ") + '. Last checked by us: ' + CHECKED + '.</p>' +
        '<p class="acts"><a href="https://www.google.com/maps/search/?api=1&query=' + p.ll[0] + ',' + p.ll[1] + '" rel="noopener">Open in Google Maps</a> &middot; <a data-contact href="#">Report a correction</a></p></li>';
    }).join("");
    if (window.SITE) document.querySelectorAll("#hm-list [data-contact]").forEach(function (a) { a.href = "mailto:" + window.SITE.contactEmail + "?subject=" + encodeURIComponent("Halal map correction"); });
  }
  function renderMap() {
    if (!map) return;
    Object.keys(markers).forEach(function (k) { map.removeLayer(markers[k]); delete markers[k]; });
    var pts = [];
    shown().forEach(function (p) {
      var b = BADGE[p.status];
      var m = window.L.marker(p.ll, { title: p.name, icon: window.L.divIcon({ className: "hmm " + p.status, html: "<span>" + ICON[p.status] + "</span>", iconSize: [34, 34], iconAnchor: [17, 17] }) }).addTo(map);
      m.bindPopup("<b>" + esc(p.name) + "</b><br>" + b[0] + '<br><small>' + esc(p.where) + '</small><br><a href="#p-' + p.id + '">Details below</a>');
      markers[p.id] = m; pts.push(p.ll);
    });
    if (pts.length) map.fitBounds(pts, { padding: [40, 40], maxZoom: 13 });
  }
  document.querySelectorAll("[data-filter]").forEach(function (b) {
    b.addEventListener("click", function () {
      filter = b.getAttribute("data-filter");
      document.querySelectorAll("[data-filter]").forEach(function (x) { x.classList.toggle("act", x === b); });
      renderList(); renderMap();
    });
  });
  $("hm-leads").innerHTML = LEADS.map(function (l) { return "<li><b>" + esc(l[0]) + "</b><span>" + esc(l[1]) + "</span></li>"; }).join("");
  try {
    if (window.L) {
      map = window.L.map("hm-map", { scrollWheelZoom: false }).setView([38.26, 140.87], 11);
      window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 17, attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
    } else { $("hm-map").classList.add("failed"); $("hm-map").innerHTML = '<p class="mapfail">The map could not load. The list below has the same places.</p>'; }
  } catch (e) { map = null; $("hm-map").classList.add("failed"); $("hm-map").innerHTML = '<p class="mapfail">The map could not load. The list below has the same places.</p>'; }
  renderList(); renderMap();
})();
