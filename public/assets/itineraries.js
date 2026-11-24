(function () {
  var P = window.PRAYER;
  if (!P) return;
  function $(id) { return document.getElementById(id); }
  function fmt(m) { m = Math.round(m); var h = Math.floor(m / 60) % 24, mm = m % 60; return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm; }
  function dur(m) { m = Math.round(m); return Math.floor(m / 60) + "h " + (m % 60 < 10 ? "0" : "") + (m % 60) + "m"; }

  // representative day in a 365-day year, and a sensible departure time for the season
  var SEASONS = {
    winter: { label: "Winter", date: "15 Jan", idx: 14, depart: 450 },
    spring: { label: "Spring", date: "15 Apr", idx: 104, depart: 480 },
    summer: { label: "Summer", date: "15 Jul", idx: 195, depart: 510 },
    autumn: { label: "Autumn", date: "15 Oct", idx: 287, depart: 465 }
  };
  // one-way travel time from Sendai in minutes. ESTIMATES: confirm routes and timetables before travelling.
  var DESTS = {
    matsushima: { name: "Matsushima", travel: 45, evening: false },
    zao: { name: "Zao Fox Village", travel: 90, evening: false },
    ginzan: { name: "Ginzan Onsen", travel: 180, evening: true }
  };
  var state = { season: "winter", dest: "ginzan", travel: 180, school: 0, combine: true };

  function plan() {
    var S = SEASONS[state.season], D = DESTS[state.dest], T = P.cities.Sendai[S.idx];
    var fajr = T[0], sunrise = T[1], dhuhr = T[2], asr = T[state.school ? 4 : 3], mag = T[5], isha = T[6];
    var combine = state.combine && state.school === 0;
    var tr = state.travel, depart = S.depart, arrive = depart + tr;
    var end = D.evening ? mag + 60 : mag - 15;
    if (end < arrive + 90) end = arrive + 90;
    var back = end + tr;
    var warn = [];
    var br = []; // breaks inside the day: {t, d, kind, title, note}

    var fT = Math.max(fajr + 10, Math.min(depart - 75, sunrise - 30));
    var pre = [{ t: fT, d: 15, kind: "prayer", title: "Fajr", note: "Window " + fmt(fajr) + " to " + fmt(sunrise) + " (sunrise). Pray before you leave." }];

    if (combine) {
      var tM = Math.min(Math.max(dhuhr + 15, arrive + 5), mag - 45);
      br.push({ t: tM, d: 25, kind: "prayer", title: "Dhuhr + Asr together", note: "Combined at Dhuhr time. Possible any time between " + fmt(dhuhr) + " and sunset (" + fmt(mag) + ")." });
    } else {
      var dT = Math.max(dhuhr + 15, arrive + 5);
      if (dT > asr - 20) warn.push("Dhuhr would fall very close to Asr. Consider arriving earlier.");
      br.push({ t: dT, d: 15, kind: "prayer", title: "Dhuhr", note: "Window " + fmt(dhuhr) + " to " + fmt(asr) + "." });
      var aT = Math.min(Math.max(asr + 10, dT + 60), mag - 25);
      br.push({ t: aT, d: 15, kind: "prayer", title: "Asr", note: "Window " + fmt(asr) + " to sunset (" + fmt(mag) + ")." });
    }
    var first = br[0];
    var lunch = { t: first.t + first.d, d: 45, kind: "lunch", title: "Lunch", note: "Look for halal or vegetarian options. Confirm the venue in advance." };
    br.push(lunch);
    if (!combine) { // keep Asr clear of lunch, but still before sunset
      var asrB = br[1];
      if (asrB.t < lunch.t + lunch.d + 20) asrB.t = Math.min(lunch.t + lunch.d + 20, mag - 25);
    }

    var post = [];
    if (combine) {
      post.push({ t: mag + 5, d: 25, kind: "prayer", title: "Maghrib + Isha together", note: "Combined at Maghrib time. Possible between " + fmt(mag) + " and midnight." });
    } else {
      post.push({ t: mag + 5, d: 15, kind: "prayer", title: "Maghrib", note: "Window " + fmt(mag) + " to " + fmt(isha) + ". Short, so plan it." });
      var iT = Math.max(isha + 10, 0);
      if (iT >= end && iT < back) { iT = Math.min(Math.max(iT, back), 1430); warn.push("Isha falls while you travel back. Pray at a rest stop or after you arrive (window ends around midnight)."); }
      post.push({ t: iT, d: 15, kind: "prayer", title: "Isha", note: "Window opens " + fmt(isha) + "." });
    }

    // assemble events
    var ev = [];
    pre.forEach(function (e) { ev.push(e); });
    ev.push({ t: depart, d: tr, kind: "travel", title: "Travel to " + D.name, note: "About " + dur(tr) + " (estimate)." });
    br.concat(post).forEach(function (e) { ev.push(e); });
    // sightseeing = gaps between arrival and end not covered by breaks
    var inner = br.concat(post).filter(function (e) { return e.t < end && e.t >= arrive; }).sort(function (a, b) { return a.t - b.t; });
    var cur = arrive;
    inner.forEach(function (e) { if (e.t > cur + 10) ev.push({ t: cur, d: e.t - cur, kind: "see", title: "Sightseeing", note: "" }); cur = Math.max(cur, e.t + e.d); });
    if (end > cur + 10) ev.push({ t: cur, d: end - cur, kind: "see", title: D.evening ? "Sightseeing and evening lights" : "Sightseeing", note: D.evening ? "Ginzan is at its best after dark when the lamps are lit." : "" });
    ev.push({ t: end, d: tr, kind: "travel", title: "Travel back to Sendai", note: "Back about " + fmt(back) + "." });
    ev.forEach(function (e) {
      if (e.kind === "prayer" && e.t >= end && e.t < back) {
        e.note += combine && e.title.indexOf("Maghrib") === 0
          ? " This falls on the way back. Combining lets you either pray at a station or rest stop, or wait until you arrive and pray both before midnight."
          : " This falls on the way back. Plan a stop at a station or rest stop.";
      }
    });
    ev.sort(function (a, b) { return a.t - b.t; });

    var see = ev.filter(function (e) { return e.kind === "see"; }).reduce(function (s, e) { return s + e.d; }, 0);
    var stops = ev.filter(function (e) { return e.kind === "prayer"; }).length;
    if (see < 150) warn.push("Only " + dur(see) + " of sightseeing. Consider an overnight stay instead of a day trip.");
    if (back > 1400) warn.push("Very late return. Consider leaving earlier or staying overnight.");
    return { S: S, D: D, T: { fajr: fajr, sunrise: sunrise, dhuhr: dhuhr, asr: asr, mag: mag, isha: isha }, ev: ev, see: see, stops: stops, back: back, warn: warn, combine: combine };
  }

  /* ---------- timeline graphic ---------- */
  var W = 1000, x0 = 36, x1 = 984, lo = 180, hi = 1440;
  function X(m) { return x0 + (m - lo) / (hi - lo) * (x1 - x0); }
  var COL = { travel: "#8a9a97", see: "var(--accent)", prayer: "var(--p5)", lunch: "var(--p1)" };
  function rect(a, b, y, h, fill, text, cls) {
    var w = Math.max(1, X(b) - X(a));
    var s = '<rect x="' + X(a).toFixed(1) + '" y="' + y + '" width="' + w.toFixed(1) + '" height="' + h + '" rx="4" fill="' + fill + '"' + (cls ? ' class="' + cls + '"' : "") + "/>";
    if (text && w > 38) s += '<text x="' + (X(a) + w / 2).toFixed(1) + '" y="' + (y + h / 2 + 4) + '" text-anchor="middle" class="tl">' + text + "</text>";
    return s;
  }
  function chart(p) {
    var t = p.T, s = '<svg viewBox="0 0 ' + W + ' 290" role="img" aria-label="Timeline of the sample day with prayer windows">';
    s += '<text x="' + x0 + '" y="16" class="tlh">Prayer windows (Sendai)</text>';
    s += rect(t.fajr, t.sunrise, 24, 34, "var(--p0)", "Fajr");
    s += rect(t.dhuhr, t.asr, 24, 34, "var(--p2)", "Dhuhr");
    s += rect(t.asr, t.mag, 24, 34, "var(--p3)", "Asr");
    s += rect(t.mag, t.isha, 24, 34, "var(--p4)", "Mag.");
    s += rect(t.isha, hi, 24, 34, "var(--p5)", "Isha");
    s += '<text x="' + x0 + '" y="86" class="tlh">Combine windows for travellers' + (p.combine ? "" : " (not used in this plan)") + "</text>";
    s += rect(t.dhuhr, t.mag, 94, 22, p.combine ? "var(--p2)" : "#9aa9a6", "Dhuhr + Asr", "comb" + (p.combine ? "" : " off"));
    s += rect(t.mag, hi, 94, 22, p.combine ? "var(--p4)" : "#9aa9a6", "Maghrib + Isha", "comb" + (p.combine ? "" : " off"));
    s += '<text x="' + x0 + '" y="140" class="tlh">Your day</text>';
    p.ev.forEach(function (e) { s += rect(e.t, e.t + e.d, 150, 46, COL[e.kind], e.kind === "prayer" ? "Pray" : (e.kind === "lunch" ? "Lunch" : (e.kind === "see" ? "See" : "Travel"))); });
    for (var h = 4; h <= 24; h += 2) {
      s += '<line x1="' + X(h * 60) + '" x2="' + X(h * 60) + '" y1="22" y2="206" class="grid"/><text x="' + X(h * 60) + '" y="224" text-anchor="middle" class="axis">' + (h === 24 ? "24" : (h < 10 ? "0" : "") + h) + "</text>";
    }
    s += '<g transform="translate(' + x0 + ',250)"><rect width="14" height="14" rx="3" fill="' + COL.travel + '"/><text x="20" y="12" class="axis">Travel</text><rect x="90" width="14" height="14" rx="3" fill="' + COL.see + '"/><text x="110" y="12" class="axis">Sightseeing</text><rect x="210" width="14" height="14" rx="3" fill="' + COL.prayer + '"/><text x="230" y="12" class="axis">Prayer</text><rect x="300" width="14" height="14" rx="3" fill="' + COL.lunch + '"/><text x="320" y="12" class="axis">Lunch</text></g></svg>';
    return s;
  }

  function render() {
    var p = plan(), S = p.S, D = p.D;
    var dl = p.T.mag - p.T.sunrise;
    $("it-head").innerHTML = "<h2>" + S.label + " day: Sendai to " + D.name + "</h2><p class=\"sub\">Based on prayer times for " + S.date + " in Sendai. Sunrise " + fmt(p.T.sunrise) + ", sunset " + fmt(p.T.mag) + ", " + dur(dl) + " of daylight.</p>";
    $("it-chart").innerHTML = chart(p);
    var h = '<ol class="steps2">';
    p.ev.forEach(function (e) {
      h += '<li class="k-' + e.kind + '"><span class="tm">' + fmt(e.t) + (e.kind === "prayer" ? "" : "&ndash;" + fmt(e.t + e.d)) + '</span><div><b>' + e.title + "</b>" + (e.note ? "<p>" + e.note + "</p>" : "") + "</div></li>";
    });
    $("it-list").innerHTML = h + "</ol>";
    var w = p.warn.map(function (x) { return '<div class="warn">' + x + "</div>"; }).join("");
    var tip = {
      winter: "Short days. Sunset is early, so start early and keep the evening for Maghrib and Isha.",
      spring: "Daylight is lengthening. Fajr is early, but the middle of the day is comfortable for a longer outing.",
      summer: "Long days. Fajr is very early (you may pray and rest again), and sunset comes late, so there is plenty of daylight.",
      autumn: "Days are shortening quickly. Plan sightseeing earlier and watch the sunset time."
    }[state.season];
    $("it-notes").innerHTML = w +
      '<div class="insights"><div class="ins"><b>' + dur(p.see) + '</b><span>of sightseeing in this plan</span></div>' +
      '<div class="ins"><b>' + p.stops + ' prayer stop' + (p.stops === 1 ? "" : "s") + '</b><span>' + (p.combine ? "Combining Dhuhr+Asr and Maghrib+Isha keeps the day to fewer stops." : "Each prayer prayed separately.") + '</span></div>' +
      '<div class="ins"><b>Back about ' + fmt(p.back) + '</b><span>' + tip + "</span></div></div>";
    $("it-combine-note").textContent = state.school === 1 ? "Hanafi school selected: combining is switched off here, because the Hanafi school generally does not combine prayers for travel. Asr is shown at its later Hanafi time." : "";
    $("it-combine").disabled = state.school === 1;
  }

  document.querySelectorAll("[data-season]").forEach(function (b) {
    b.addEventListener("click", function () {
      state.season = b.getAttribute("data-season");
      document.querySelectorAll("[data-season]").forEach(function (x) { x.classList.toggle("act", x === b); });
      render();
    });
  });
  $("it-dest").addEventListener("change", function (e) { state.dest = e.target.value; state.travel = DESTS[state.dest].travel; $("it-travel").value = state.travel; $("it-travel-val").textContent = dur(state.travel); render(); });
  $("it-travel").addEventListener("input", function (e) { state.travel = +e.target.value; $("it-travel-val").textContent = dur(state.travel); render(); });
  $("it-school").addEventListener("change", function (e) { state.school = +e.target.value; render(); });
  $("it-combine").addEventListener("change", function (e) { state.combine = e.target.checked; render(); });
  $("it-travel").value = state.travel; $("it-travel-val").textContent = dur(state.travel);
  render();
})();
