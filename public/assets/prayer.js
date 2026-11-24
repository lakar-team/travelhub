(function () {
  var P = window.PRAYER;
  if (!P) return;
  var KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  var WHAT = ["Dawn", "Sun rises", "After midday", "Afternoon", "Sunset", "Night"];
  // data row = [fajr, sunrise, dhuhr, asrStd, asrHan, maghrib, isha]
  var RAM = { start: 38, end: 67 }; // expected Ramadan 2027: ~8 Feb to ~9 Mar (day index in a 365-day year)
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var FIRST = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  var state = { city: "Sendai", school: 0, sel: 0 };

  function $(id) { return document.getElementById(id); }
  function fmt(m) { var h = Math.floor(m / 60), mm = m % 60; return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm; }
  function dur(m) { return Math.floor(m / 60) + "h " + (m % 60 < 10 ? "0" : "") + (m % 60) + "m"; }
  function dateOf(i) { return new Date(2027, 0, 1 + i); }
  function dateLabel(i) { return dateOf(i).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }
  function monthLabel(i) { return dateOf(i).toLocaleDateString("en-GB", { month: "long" }); }
  function todayIdx() {
    var n = new Date(), s = new Date(n.getFullYear(), 0, 0);
    return Math.max(0, Math.min(364, Math.floor((n - s) / 864e5) - 1));
  }
  function rows() { return P.cities[state.city]; }
  function idx() { return [0, 1, 2, state.school ? 4 : 3, 5, 6]; }
  function vals(i) { var r = rows()[i], k = idx(); return k.map(function (j) { return r[j]; }); }
  function inRam(i) { return i >= RAM.start && i <= RAM.end; }

  /* ---------- today / selected cards ---------- */
  function renderCards() {
    var v = vals(state.sel), t = todayIdx();
    var head = state.sel === t ? "Today in " + state.city : dateLabel(state.sel) + " in " + state.city;
    var h = '<h3>' + head + (inRam(state.sel) ? ' <span class="ram">Ramadan (expected)</span>' : "") + '</h3><div class="pcards">';
    for (var k = 0; k < 6; k++) {
      h += '<div class="pcard p' + k + '"><small>' + WHAT[k] + '</small><b>' + KEYS[k] + '</b><span>' + fmt(v[k]) + '</span></div>';
    }
    h += '</div>';
    if (inRam(state.sel)) h += '<p class="fast">Fast today: Fajr to Maghrib = <b>' + dur(v[4] - v[0]) + '</b></p>';
    $("pt-cards").innerHTML = h;
  }

  /* ---------- chart ---------- */
  var W = 1000, H = 520, ml = 56, mr = 86, mt = 16, mb = 34, pw = W - ml - mr, ph = H - mt - mb, y0 = 120, y1 = 1380;
  function X(i) { return ml + i / 364 * pw; }
  function Y(v) { return mt + (v - y0) / (y1 - y0) * ph; }
  function path(s) { return s.map(function (v, i) { return (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(""); }

  function renderChart() {
    var r = rows(), k = idx();
    var ser = k.map(function (j) { return r.map(function (x) { return x[j]; }); });
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Chart of daily prayer times in ' + state.city + ' through the year" id="pt-svg">';
    s += '<rect x="' + ml + '" y="' + mt + '" width="' + pw + '" height="' + ph + '" class="plot"/>';
    // Ramadan band
    s += '<rect x="' + X(RAM.start) + '" y="' + mt + '" width="' + (X(RAM.end) - X(RAM.start)) + '" height="' + ph + '" class="ramband"/>';
    s += '<text x="' + (X(RAM.start) + X(RAM.end)) / 2 + '" y="' + (mt + 14) + '" class="ramlab" text-anchor="middle">Ramadan 2027</text>';
    // daylight band (sunrise to maghrib)
    var up = ser[1].map(function (v, i) { return X(i).toFixed(1) + "," + Y(v).toFixed(1); });
    var dn = ser[4].map(function (v, i) { return X(i).toFixed(1) + "," + Y(v).toFixed(1); }).reverse();
    s += '<polygon points="' + up.concat(dn).join(" ") + '" class="dayband"/>';
    // grid
    for (var h = 2; h <= 22; h += 2) {
      s += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + Y(h * 60) + '" y2="' + Y(h * 60) + '" class="grid"/>';
      s += '<text x="' + (ml - 8) + '" y="' + (Y(h * 60) + 4) + '" text-anchor="end" class="axis">' + (h < 10 ? "0" : "") + h + ':00</text>';
    }
    FIRST.forEach(function (d, m) {
      s += '<line x1="' + X(d) + '" x2="' + X(d) + '" y1="' + mt + '" y2="' + (H - mb) + '" class="grid v"/>';
      s += '<text x="' + (X(d) + 4) + '" y="' + (H - 12) + '" class="axis">' + MONTHS[m] + '</text>';
    });
    // lines + labels
    for (var n = 0; n < 6; n++) {
      s += '<path d="' + path(ser[n]) + '" class="line l' + n + '"/>';
      s += '<text x="' + (W - mr + 8) + '" y="' + (Y(ser[n][364]) + 4) + '" class="lab l' + n + 't">' + KEYS[n] + '</text>';
    }
    s += '<g id="pt-sel"></g>';
    s += '<rect x="' + ml + '" y="' + mt + '" width="' + pw + '" height="' + ph + '" fill="transparent" id="pt-hit" style="touch-action:pan-y;cursor:crosshair"/></svg>';
    $("pt-chart").innerHTML = s;
    drawSel();
    var hit = $("pt-hit"), svg = $("pt-svg");
    function move(e) {
      var b = svg.getBoundingClientRect(), x = (e.clientX - b.left) / b.width * W;
      state.sel = Math.max(0, Math.min(364, Math.round((x - ml) / pw * 364)));
      drawSel(); renderCards();
    }
    hit.addEventListener("pointermove", move);
    hit.addEventListener("pointerdown", move);
  }
  function drawSel() {
    var g = $("pt-sel"); if (!g) return;
    var v = vals(state.sel), x = X(state.sel);
    var h = '<line x1="' + x + '" x2="' + x + '" y1="' + mt + '" y2="' + (H - mb) + '" class="selline"/>';
    v.forEach(function (t, n) { h += '<circle cx="' + x + '" cy="' + Y(t) + '" r="4.5" class="dot l' + n + 'f"/>'; });
    g.innerHTML = h;
  }

  /* ---------- month-by-month table ---------- */
  function renderTable() {
    var h = '<table class="ptable"><thead><tr><th>15th of</th>' + KEYS.map(function (k) { return "<th>" + k + "</th>"; }).join("") + "</tr></thead><tbody>";
    for (var m = 0; m < 12; m++) {
      var i = FIRST[m] + 14, v = vals(i);
      var ram = inRam(i) || (m === 1) || (m === 2 && false);
      h += "<tr" + (ram ? ' class="ramrow"' : "") + "><th>" + ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m] + (ram ? " &#9790;" : "") + "</th>" + v.map(function (t) { return "<td>" + fmt(t) + "</td>"; }).join("") + "</tr>";
    }
    $("pt-table").innerHTML = h + "</tbody></table>";
  }

  /* ---------- insights ---------- */
  function renderInsights() {
    var r = rows(), mag = r.map(function (x) { return x[5]; }), dl = r.map(function (x) { return x[5] - x[1]; });
    var lo = Math.min.apply(0, mag), hi = Math.max.apply(0, mag);
    var fastMin = 1e9, fastMax = 0;
    for (var i = RAM.start; i <= RAM.end; i++) { var f = r[i][5] - r[i][0]; fastMin = Math.min(fastMin, f); fastMax = Math.max(fastMax, f); }
    var iso = function (arr, v) { return arr.indexOf(v); };
    $("pt-insights").innerHTML =
      '<div class="ins"><b>' + fmt(lo) + '</b><span>Earliest Maghrib (sunset), in ' + monthLabel(iso(mag, lo)) + '. Plan evening sightseeing around this.</span></div>' +
      '<div class="ins"><b>' + fmt(hi) + '</b><span>Latest Maghrib, in ' + monthLabel(iso(mag, hi)) + '.</span></div>' +
      '<div class="ins"><b>' + dur(Math.min.apply(0, dl)) + ' to ' + dur(Math.max.apply(0, dl)) + '</b><span>Daylight, from midwinter to midsummer.</span></div>' +
      '<div class="ins"><b>' + dur(fastMin) + ' to ' + dur(fastMax) + '</b><span>Fasting day (Fajr to Maghrib) during Ramadan 2027 in ' + state.city + '. Short, because Ramadan falls in winter in 2027.</span></div>';
  }

  function renderAll() { renderCards(); renderChart(); renderTable(); renderInsights(); }
  state.sel = todayIdx();
  $("pt-city").addEventListener("change", function (e) { state.city = e.target.value; renderAll(); });
  $("pt-school").addEventListener("change", function (e) { state.school = +e.target.value; renderAll(); });
  renderAll();
})();
