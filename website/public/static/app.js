// Demo upload + live metrics rendering. Every block is guarded so one script serves several pages.
(function () {
  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function $(id) { return document.getElementById(id); }
  var pct = function (v) { return (v * 100).toFixed(1) + "%"; };

  /* ---------- demo ---------- */
  var drop = $("drop");
  if (drop) {
    var fileInput = $("file"), preview = $("preview"), hint = $("drop-hint"), runBtn = $("run"), result = $("result");
    var selected = null;

    var setFile = function (file) {
      if (!file || file.type.indexOf("image/") !== 0) return;
      selected = file;
      preview.src = URL.createObjectURL(file);
      preview.hidden = false;
      hint.hidden = true;
      runBtn.disabled = false;
    };
    var showError = function (m) { result.replaceChildren(el("p", "error", m)); };
    var showResult = function (data) {
      var nodes = [el("p", "verdict", data.label), el("p", "conf", "Confidence " + pct(data.confidence))];
      Object.entries(data.probabilities).sort(function (a, b) { return b[1] - a[1]; }).forEach(function (kv) {
        var row = el("div", "bar-row" + (kv[0] === data.label ? " top" : ""));
        var label = el("div", "bar-label");
        label.append(el("span", "", kv[0]), el("span", "", pct(kv[1])));
        var bar = el("div", "bar"), fill = el("span");
        bar.append(fill);
        row.append(label, bar);
        nodes.push(row);
        requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = pct(kv[1]); }); });
      });
      if (data.confidence < 0.7) nodes.push(el("p", "note", "Low confidence. The model is unsure about this image, so treat the result with extra caution."));
      nodes.push(el("p", "note", "Research demo only. Not a medical diagnosis."));
      result.replaceChildren.apply(result, nodes);
    };

    fileInput.addEventListener("change", function () { setFile(fileInput.files[0]); });
    ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("over"); }); });
    drop.addEventListener("drop", function (e) { setFile(e.dataTransfer.files[0]); });
    drop.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); } });

    runBtn.addEventListener("click", function () {
      if (!selected) return;
      runBtn.disabled = true;
      result.replaceChildren(el("div", "spinner"));
      var form = new FormData();
      form.append("image", selected);
      fetch("predict", { method: "POST", body: form })
        .then(function (res) { return res.json().then(function (d) { return [res.ok, d]; }); })
        .then(function (r) { if (!r[0]) showError(r[1].error || "Prediction failed."); else showResult(r[1]); })
        .catch(function () { showError("The model server is not reachable. This hosted site cannot run the model. Start webapp/run.bat on a computer that has the project, then open the page it serves."); })
        .then(function () { runBtn.disabled = false; });
    });
  }

  /* ---------- metrics ---------- */
  if (!$("kpis")) return;

  var SVG = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs, text) {
    var n = document.createElementNS(SVG, tag);
    Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function lineChart(container, train, val, bestEpoch, fmt) {
    var W = 480, H = 260, L = 44, R = 12, T = 12, B = 30;
    var all = train.concat(val), lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    var pad = (hi - lo) * 0.08 || 0.05; lo -= pad; hi += pad;
    var n = train.length;
    var x = function (i) { return L + (i * (W - L - R)) / (n - 1); };
    var y = function (v) { return T + ((hi - v) * (H - T - B)) / (hi - lo); };
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, role: "img" });
    for (var g = 0; g <= 4; g++) {
      var v = lo + ((hi - lo) * g) / 4;
      svg.append(svgEl("line", { "class": "grid", x1: L, x2: W - R, y1: y(v), y2: y(v) }));
      svg.append(svgEl("text", { "class": "tick", x: L - 6, y: y(v) + 4, "text-anchor": "end" }, fmt(v)));
    }
    for (var i = 0; i < n; i++) {
      if (n > 8 && i % 2 === 1) continue;
      svg.append(svgEl("text", { "class": "tick", x: x(i), y: H - 10, "text-anchor": "middle" }, String(i + 1)));
    }
    if (bestEpoch) svg.append(svgEl("line", { "class": "best", x1: x(bestEpoch - 1), x2: x(bestEpoch - 1), y1: T, y2: H - B }));
    var path = function (s) { return s.map(function (v, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1); }).join(" "); };
    svg.append(svgEl("path", { "class": "line-train", d: path(train) }));
    svg.append(svgEl("path", { "class": "line-val", d: path(val) }));
    container.replaceChildren(svg);
    var legend = el("div", "legend");
    [["Training", "var(--teal)"], ["Validation", "#c27d0e"]].forEach(function (p) {
      var item = el("span"), sw = el("i"); sw.style.background = p[1];
      item.append(sw, document.createTextNode(p[0])); legend.append(item);
    });
    container.append(legend);
  }

  fetch("static/metrics.json")
    .then(function (r) { if (!r.ok) throw new Error("no metrics"); return r.json(); })
    .then(function (m) {
      var avgAuc = m.per_class.reduce(function (s, c) { return s + c.auc; }, 0) / m.per_class.length;
      [[pct(m.accuracy), "Test accuracy"], [m.macro_f1.toFixed(3), "Macro F1 score"], [avgAuc.toFixed(3), "Mean AUC, one vs rest"], [String(m.n_test), "Held-out test images"]]
        .forEach(function (kv) { var b = el("div", "kpi"); b.append(el("strong", "", kv[0]), el("span", "", kv[1])); $("kpis").append(b); });

      var pc = $("perclass");
      if (pc) m.per_class.forEach(function (c) {
        var row = el("div", "pc-row"), name = el("div", "pc-name");
        name.append(el("span", "", c.name), el("small", "", c.support + " images"));
        row.append(name);
        [["Precision", c.precision], ["Recall", c.recall], ["F1", c.f1]].forEach(function (kv) {
          var line = el("div", "pc-metric"), bar = el("div", "bar-track"), fill = el("span");
          fill.style.width = pct(kv[1]); bar.append(fill);
          line.append(el("span", "", kv[0]), bar, el("span", "", pct(kv[1]))); row.append(line);
        });
        pc.append(row);
      });

      var mx = $("matrix");
      if (mx) {
        var short = function (s) { return s.replace("Pituitary Macroadenoma", "Pituitary"); };
        mx.style.gridTemplateColumns = "repeat(" + (m.classes.length + 1) + ", 1fr)";
        mx.append(el("div", "m-head"));
        m.classes.forEach(function (c) { mx.append(el("div", "m-head", short(c))); });
        m.confusion.forEach(function (rowVals, i) {
          var total = rowVals.reduce(function (a, b) { return a + b; }, 0) || 1;
          mx.append(el("div", "m-head", short(m.classes[i])));
          rowVals.forEach(function (count) {
            var share = count / total, cell = el("div", "m-cell" + (share > 0.5 ? " strong" : ""), String(count));
            cell.style.setProperty("--v", share.toFixed(2));
            cell.title = count + " of " + total + " (" + pct(share) + ")";
            mx.append(cell);
          });
        });
      }

      var h = m.history;
      if (h && $("chart-loss")) {
        $("history").hidden = false;
        lineChart($("chart-loss"), h.loss, h.val_loss, h.best_epoch, function (v) { return v.toFixed(2); });
        lineChart($("chart-acc"), h.acc, h.val_acc, h.best_epoch, function (v) { return (v * 100).toFixed(0) + "%"; });
      }
    })
    .catch(function () { var e = $("analytics-error"); if (e) e.hidden = false; });
})();
