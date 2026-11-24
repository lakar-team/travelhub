(function () {
  // Typical-year windows (NOT 2027 forecasts). conf: "src" = from published sources, "est" = estimate, confirm before relying.
  var MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function doy(m, d) { var n = d - 1; for (var i = 0; i < m - 1; i++) n += MD[i]; return n; }
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function lab(i) { var m = 0; while (m < 11 && i >= doy(m + 2, 1)) m++; return MON[m] + " " + (i - doy(m + 1, 1) + 1); }

  var PLACES = [
    { id: "ginzan", name: "Ginzan Onsen", pref: "Yamagata", ll: [38.5721, 140.529], live: true, url: "/ginzan.html",
      sakura: { w: [4, 15, 4, 28], c: "est", note: "Estimate: nearest city Yamagata blooms mid-April; valley towns run a little later." },
      foliage: { w: [10, 20, 11, 10], c: "src", note: "Late Oct to early Nov." },
      snow: { w: [12, 10, 3, 15], c: "est", note: "Winter town; heaviest scenery usually Jan to Feb." } },
    { id: "zao", name: "Zao Fox Village", pref: "Miyagi", ll: [38.0, 140.57], live: true, url: "/zao.html",
      sakura: { w: [4, 6, 4, 15], c: "est", note: "Estimate: follows the Sendai area." },
      foliage: { w: [10, 25, 11, 12], c: "est", note: "Estimate for the lower valley; the mountain turns earlier." },
      snow: { w: [12, 20, 3, 5], c: "est", note: "Foxes in snow, most reliably Jan to Feb." } },
    { id: "zaomtn", name: "Zao Mountain (snow monsters)", pref: "Yamagata / Miyagi", ll: [38.143, 140.44], live: false, url: null, info: true,
      foliage: { w: [9, 25, 10, 28], c: "src", note: "Colour starts late Sep and peaks mid to late Oct." },
      snow: { w: [12, 20, 3, 25], c: "src", note: "Snow monsters: main window late Dec to late Mar, best late Jan to Feb. Varies by year." } },
    { id: "matsushima", name: "Matsushima", pref: "Miyagi", ll: [38.3667, 141.0667], live: true, url: "/matsushima.html",
      sakura: { w: [4, 6, 4, 13], c: "src", note: "Sendai area full bloom is typically early to mid April." },
      foliage: { w: [11, 1, 11, 20], c: "est", note: "Estimate for the low coast; Entsuin and Rikyu Garden are known autumn spots." } },
    { id: "hiraizumi", name: "Hiraizumi / Chusonji", pref: "Iwate", ll: [38.9886, 141.1156], live: false, url: null,
      sakura: { w: [4, 16, 4, 24], c: "src", note: "Nearest city Morioka: mid to late April." },
      foliage: { w: [10, 25, 11, 10], c: "src", note: "Late Oct to early Nov." } },
    { id: "hirosaki", name: "Hirosaki Castle", pref: "Aomori", ll: [40.6075, 140.464], live: false, url: null,
      sakura: { w: [4, 20, 4, 28], c: "src", note: "Aomori area full bloom is typically around Apr 18 to 26." },
      foliage: { w: [10, 15, 11, 5], c: "est", note: "Estimate." },
      snow: { w: [12, 10, 3, 20], c: "est", note: "Estimate." } },
    { id: "aizu", name: "Aizuwakamatsu", pref: "Fukushima", ll: [37.4873, 139.929], live: false, url: null,
      sakura: { w: [4, 10, 4, 20], c: "est", note: "Estimate: Fukushima area blooms early April; Aizu a little later." },
      foliage: { w: [10, 20, 11, 10], c: "est", note: "Estimate." },
      snow: { w: [12, 10, 3, 20], c: "est", note: "Estimate." } }
  ];
  var LAYERS = { sakura: { icon: "🌸", name: "Cherry blossom", col: "#e8739a" }, foliage: { icon: "🍁", name: "Autumn leaves", col: "#d9541e" }, snow: { icon: "❄️", name: "Snow", col: "#4a90c8" } };
  var state = { layer: "sakura", day: doy(4, 12), map: null, markers: {} };

  function $(id) { return document.getElementById(id); }
  function win(p, layer) { var w = p[layer]; if (!w) return null; var a = doy(w.w[0], w.w[1]), b = doy(w.w[2], w.w[3]); return { a: a, b: b, c: w.c, note: w.note, wrap: b < a }; }
  function inSeason(p, layer, d) { var w = win(p, layer); if (!w) return false; return w.wrap ? (d >= w.a || d <= w.b) : (d >= w.a && d <= w.b); }
  function range(p, layer) { var w = win(p, layer); return w ? lab(w.a) + " to " + lab(w.b) : "No data"; }

  function renderList() {
    var L = state.layer, d = state.day, h = "";
    PLACES.forEach(function (p) {
      var w = win(p, L); if (!w) return;
      var on = inSeason(p, L, d);
      h += '<li class="' + (on ? "on" : "off") + '"><div><b>' + p.name + '</b> <small>' + p.pref + '</small>' +
        (p.live ? '' : (p.info ? ' <span class="tag">Info</span>' : ' <span class="tag soon">Coming soon</span>')) + '</div>' +
        '<div class="rng">' + LAYERS[L].icon + ' ' + range(p, L) + ' <span class="conf ' + w.c + '">' + (w.c === "src" ? "Source-backed" : "Estimate") + '</span></div>' +
        '<p>' + w.note + '</p>' + (p.live ? '<a href="' + p.url + '">See the page</a>' : "") + '</li>';
    });
    $("ss-list").innerHTML = h;
    var inn = PLACES.filter(function (p) { return inSeason(p, L, d); }).length;
    $("ss-now").innerHTML = "<b>" + lab(state.day) + "</b>: " + inn + " place" + (inn === 1 ? "" : "s") + " in " + LAYERS[L].name.toLowerCase() + " season";
  }

  function iconFor(p, on) {
    var L = LAYERS[state.layer];
    return window.L.divIcon({ className: "ssm" + (on ? " on" : " off"), html: "<span style=\"border-color:" + L.col + "\">" + L.icon + "</span>", iconSize: [on ? 40 : 28, on ? 40 : 28], iconAnchor: [on ? 20 : 14, on ? 20 : 14] });
  }
  function renderMap() {
    if (!state.map) return;
    PLACES.forEach(function (p) {
      var w = win(p, state.layer), m = state.markers[p.id];
      if (!w) { if (m) m.setOpacity(0); return; }
      var on = inSeason(p, state.layer, state.day);
      if (!m) {
        m = window.L.marker(p.ll, { title: p.name }).addTo(state.map);
        state.markers[p.id] = m;
        m.on("click", function () { });
      }
      m.setOpacity(1);
      m.setIcon(iconFor(p, on));
      m.bindPopup("<b>" + p.name + "</b><br>" + LAYERS[state.layer].icon + " " + range(p, state.layer) + "<br><small>" + w.note + "</small>" + (p.live ? '<br><a href="' + p.url + '">See the page</a>' : ""));
    });
  }
  function update() { renderList(); renderMap(); $("ss-date").textContent = lab(state.day); }

  document.querySelectorAll("[data-layer]").forEach(function (b) {
    b.addEventListener("click", function () {
      state.layer = b.getAttribute("data-layer");
      document.querySelectorAll("[data-layer]").forEach(function (x) { x.classList.toggle("act", x === b); });
      update();
    });
  });
  var sl = $("ss-slider");
  sl.max = 364; sl.value = state.day;
  sl.addEventListener("input", function () { state.day = +sl.value; update(); });

  try {
    if (window.L) {
      state.map = window.L.map("ss-map", { scrollWheelZoom: false }).setView([39.0, 140.6], 7);
      window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 12, attribution: "&copy; OpenStreetMap contributors" }).addTo(state.map);
    } else { $("ss-map").classList.add("failed"); $("ss-map").innerHTML = '<p class="mapfail">The map could not load. The list below shows the same information.</p>'; }
  } catch (e) { $("ss-map").classList.add("failed"); $("ss-map").innerHTML = '<p class="mapfail">The map could not load. The list below shows the same information.</p>'; state.map = null; }
  update();
})();
