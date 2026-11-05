// Synthetic axial brain slice, generated in the browser. NOT a patient scan.
// Drag the slider to move through 28 slices; switch sequence to see how T1, T2 and FLAIR differ.
(function () {
  var canvas = document.getElementById("slice");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var N = 280;
  canvas.width = N;
  canvas.height = N;
  var img = ctx.createImageData(N, N);
  var S = 28;

  var slider = document.getElementById("slice-range");
  var ovSlice = document.getElementById("ov-slice");
  var ovSeq = document.getElementById("ov-seq");
  var note = document.getElementById("viewer-note");
  var seqDesc = document.getElementById("seq-desc");
  var seqBtns = document.querySelectorAll("[data-seq]");
  var mode = canvas.getAttribute("data-mode") || "t1";

  // grey levels 0-255 for each tissue under each sequence
  var I = {
    t1:    { scalp: 215, skull: 28, csf: 28,  gm: 112, wm: 168, core: 70,  halo: 92 },
    t2:    { scalp: 150, skull: 25, csf: 238, gm: 150, wm: 100, core: 228, halo: 205 },
    flair: { scalp: 120, skull: 25, csf: 22,  gm: 140, wm: 104, core: 238, halo: 206 }
  };
  var NAMES = { t1: "T1-weighted", t2: "T2-weighted", flair: "T2 FLAIR" };
  var DESC = {
    t1: "T1 shows anatomy. Fluid is dark, white matter is brighter than gray matter, and fat (scalp) is bright. This lesion is slightly darker than the brain around it.",
    t2: "T2 is sensitive to water. Cerebrospinal fluid turns bright white, and so do many lesions and the swelling (edema) around them.",
    flair: "FLAIR is T2 with the fluid signal switched off. Normal fluid is dark again, so lesions and edema stand out as bright areas next to dark ventricles."
  };

  function hash(x, y, z) {
    var h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967295;
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function vnoise(x, y, z) {
    var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    var xf = x - xi, yf = y - yi, zf = z - zi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    return lerp(
      lerp(lerp(hash(xi, yi, zi), hash(xi + 1, yi, zi), u), lerp(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), u), v),
      lerp(lerp(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), u), lerp(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), u), v),
      w
    );
  }
  function fbm(x, y, z) {
    return vnoise(x, y, z) * 0.55 + vnoise(x * 2.1, y * 2.1, z * 2.1) * 0.3 + vnoise(x * 4.3, y * 4.3, z * 4.3) * 0.15;
  }

  var LX = 0.4, LY = -0.2; // lesion centre in normalised coordinates
  function lesionRadius(t) {
    var k = 1 - Math.pow((t - 0.1) / 0.55, 2);
    return k > 0 ? 0.2 * Math.sqrt(k) : 0;
  }

  function render(s) {
    var t = (s - (S - 1) / 2) / ((S - 1) / 2);
    var scale = Math.sqrt(Math.max(0, 1 - 0.92 * t * t));
    var p = I[mode];
    var d = img.data;
    var lr = lesionRadius(t);
    var vent = Math.max(0, 1 - Math.abs(t + 0.05) * 2.6);
    var rx = 0.8 * scale, ry = 0.94 * scale;

    for (var y = 0; y < N; y++) {
      for (var x = 0; x < N; x++) {
        var nx = (x / N - 0.5) * 2, ny = (y / N - 0.5) * 2;
        var v = 3 + vnoise(x * 0.4, y * 0.4, s) * 5;
        if (scale > 0.03) {
          var e = Math.hypot(nx / rx, ny / ry);
          if (e <= 1) {
            if (e > 0.955) {
              v = p.scalp;
            } else if (e > 0.885) {
              v = p.skull;
            } else {
              var g = fbm(nx * 9 + 3, ny * 9, t * 2.2);
              var ridge = Math.abs(g - 0.5);
              var base = e > 0.7 ? p.gm : p.wm;
              var edge = (0.7 - e) / 0.05;
              if (Math.abs(edge) < 1) base = p.gm + (p.wm - p.gm) * (edge * 0.5 + 0.5);
              v = base + (fbm(nx * 14, ny * 14, t * 3) - 0.5) * 26;
              if (e > 0.68 && ridge < 0.02) v = p.csf * 0.8 + base * 0.2;
              if (Math.abs(nx) < 0.012) v = p.csf * 0.6 + v * 0.4;
              if (vent > 0) {
                var ax = (Math.abs(nx) - 0.13) / (0.09 * vent + 0.001);
                var ay = (ny + 0.04) / (0.26 * vent + 0.001);
                if (ax * ax + ay * ay < 1) v = p.csf;
              }
              if (lr > 0) {
                var dd = Math.hypot(nx - LX, ny - LY) + (fbm(nx * 9, ny * 9, t * 2) - 0.5) * 0.05;
                if (dd < lr) {
                  v = p.core + (fbm(nx * 12, ny * 12, 5) - 0.5) * 20;
                } else if (dd < lr * 1.8) {
                  var f = (dd - lr) / (lr * 0.8);
                  v = p.halo * (1 - f) + v * f;
                }
              }
            }
          }
        }
        v = v < 0 ? 0 : v > 255 ? 255 : v;
        var i = (y * N + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    if (lr > 0.03) {
      ctx.save();
      ctx.strokeStyle = "#f4c84b";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc((LX / 2 + 0.5) * N, (LY / 2 + 0.5) * N, lr * 1.95 * (N / 2), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (ovSlice) ovSlice.textContent = "Slice " + (s + 1) + " / " + S;
    if (note) {
      if (lr === 0) note.textContent = "No lesion in this cross-section. A classifier that looks at one slice sees only this image, with nothing to say what lies above or below it.";
      else if (lr < 0.08) note.textContent = "The edge of the lesion is just coming into view. Slices near the top or bottom of a tumor show only a small part of it.";
      else note.textContent = "The lesion is clearly visible here (amber outline). Tumors extend in three dimensions, but a slice-based model sees one flat cross-section at a time.";
    }
  }

  function setMode(m) {
    mode = m;
    if (ovSeq) ovSeq.textContent = NAMES[m];
    if (seqDesc) seqDesc.textContent = DESC[m];
    seqBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-seq") === m)); });
    render(Number(slider.value));
  }

  var pending = false;
  slider.addEventListener("input", function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; render(Number(slider.value)); });
  });
  seqBtns.forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-seq")); }); });

  slider.max = String(S - 1);
  slider.value = "14";
  setMode(mode);
})();
