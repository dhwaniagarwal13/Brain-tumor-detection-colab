const drop = document.getElementById("drop");
const fileInput = document.getElementById("file");
const preview = document.getElementById("preview");
const hint = document.getElementById("drop-hint");
const runBtn = document.getElementById("run");
const result = document.getElementById("result");

let selected = null;

function setFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  selected = file;
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  hint.hidden = true;
  runBtn.disabled = false;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function showError(message) {
  result.replaceChildren(el("p", "error", message));
}

function showResult(data) {
  const pct = (v) => (v * 100).toFixed(1) + "%";
  const nodes = [
    el("p", "verdict", data.label),
    el("p", "conf", "Confidence " + pct(data.confidence)),
  ];
  Object.entries(data.probabilities)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, p]) => {
      const row = el("div", "bar-row" + (name === data.label ? " top" : ""));
      const label = el("div", "bar-label");
      label.append(el("span", "", name), el("span", "", pct(p)));
      const bar = el("div", "bar");
      const fill = el("span");
      fill.style.width = "0%";
      bar.append(fill);
      row.append(label, bar);
      nodes.push(row);
      requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = pct(p); }));
    });
  if (data.confidence < 0.7) {
    nodes.push(el("p", "note", "Low confidence. The model is unsure about this image, so treat the result with extra caution."));
  }
  nodes.push(el("p", "note", "Research demo only. Not a medical diagnosis."));
  result.replaceChildren(...nodes);
}

function renderAnalytics(m) {
  const pct = (v) => (v * 100).toFixed(1) + "%";
  const avgAuc = m.per_class.reduce((s, c) => s + c.auc, 0) / m.per_class.length;
  const kpis = document.getElementById("kpis");
  [
    [pct(m.accuracy), "Test accuracy"],
    [m.macro_f1.toFixed(3), "Macro F1"],
    [avgAuc.toFixed(3), "Mean AUC (one-vs-rest)"],
    [String(m.n_test), "Test images"],
  ].forEach(([value, label]) => {
    const box = el("div", "kpi");
    box.append(el("strong", "", value), el("span", "", label));
    kpis.append(box);
  });

  const perclass = document.getElementById("perclass");
  m.per_class.forEach((c) => {
    const row = el("div", "pc-row");
    const name = el("div", "pc-name");
    name.append(el("span", "", c.name), el("small", "", c.support + " images"));
    row.append(name);
    [["Precision", c.precision], ["Recall", c.recall], ["F1", c.f1]].forEach(([label, v]) => {
      const line = el("div", "pc-metric");
      const bar = el("div", "bar");
      const fill = el("span");
      fill.style.width = pct(v);
      bar.append(fill);
      line.append(el("span", "", label), bar, el("span", "", pct(v)));
      row.append(line);
    });
    perclass.append(row);
  });

  const matrix = document.getElementById("matrix");
  const n = m.classes.length;
  matrix.style.gridTemplateColumns = "repeat(" + (n + 1) + ", 1fr)";
  matrix.append(el("div", "m-head"));
  m.classes.forEach((c) => matrix.append(el("div", "m-head", c.replace("Pituitary Macroadenoma", "Pituitary"))));
  m.confusion.forEach((rowVals, i) => {
    const total = rowVals.reduce((a, b) => a + b, 0) || 1;
    matrix.append(el("div", "m-head", m.classes[i].replace("Pituitary Macroadenoma", "Pituitary")));
    rowVals.forEach((count) => {
      const share = count / total;
      const cell = el("div", "m-cell" + (share > 0.5 ? " strong" : ""), String(count));
      cell.style.setProperty("--v", share.toFixed(2));
      cell.title = count + " of " + total + " (" + pct(share) + ")";
      matrix.append(cell);
    });
  });
}

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs, text) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (text !== undefined) node.textContent = text;
  return node;
}

function lineChart(container, train, val, bestEpoch, fmt) {
  const W = 480, H = 260, L = 44, R = 12, T = 12, B = 30;
  const all = train.concat(val);
  let lo = Math.min(...all), hi = Math.max(...all);
  const pad = (hi - lo) * 0.08 || 0.05;
  lo -= pad; hi += pad;
  const n = train.length;
  const x = (i) => L + (i * (W - L - R)) / (n - 1);
  const y = (v) => T + ((hi - v) * (H - T - B)) / (hi - lo);

  const svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, role: "img" });
  for (let g = 0; g <= 4; g++) {
    const v = lo + ((hi - lo) * g) / 4;
    svg.append(svgEl("line", { class: "grid", x1: L, x2: W - R, y1: y(v), y2: y(v) }));
    svg.append(svgEl("text", { class: "tick", x: L - 6, y: y(v) + 4, "text-anchor": "end" }, fmt(v)));
  }
  for (let i = 0; i < n; i++) {
    if (n > 8 && i % 2 === 1) continue;
    svg.append(svgEl("text", { class: "tick", x: x(i), y: H - 10, "text-anchor": "middle" }, String(i + 1)));
  }
  if (bestEpoch) {
    svg.append(svgEl("line", { class: "best", x1: x(bestEpoch - 1), x2: x(bestEpoch - 1), y1: T, y2: H - B }));
  }
  const path = (series) => series.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
  svg.append(svgEl("path", { class: "line-train", d: path(train) }));
  svg.append(svgEl("path", { class: "line-val", d: path(val) }));
  container.replaceChildren(svg);

  const legend = el("div", "legend");
  [["line-train", "Train", "var(--accent)"], ["line-val", "Validation", "var(--accent-2)"]].forEach(([, name, color]) => {
    const item = el("span");
    const swatch = el("i");
    swatch.style.background = color;
    item.append(swatch, document.createTextNode(name));
    legend.append(item);
  });
  container.append(legend);
}

function renderHistory(h) {
  document.getElementById("history").hidden = false;
  lineChart(document.getElementById("chart-loss"), h.loss, h.val_loss, h.best_epoch, (v) => v.toFixed(2));
  lineChart(document.getElementById("chart-acc"), h.acc, h.val_acc, h.best_epoch, (v) => (v * 100).toFixed(0) + "%");
  const last = h.loss.length - 1;
  const note = document.getElementById("history-note");
  note.textContent =
    "Trained for " + h.loss.length + " epochs with early stopping. The dashed line marks epoch " + h.best_epoch +
    ", where validation loss was lowest and the weights were restored. Final-epoch training accuracy was " +
    (h.acc[last] * 100).toFixed(1) + "% against " + (h.val_acc[last] * 100).toFixed(1) +
    "% on validation, so the model fits its training data better than unseen images.";
  note.hidden = false;
}

fetch("static/metrics.json")
  .then((r) => { if (!r.ok) throw new Error("no metrics"); return r.json(); })
  .then((m) => { renderAnalytics(m); if (m.history) renderHistory(m.history); })
  .catch(() => { document.getElementById("analytics-error").hidden = false; });

fileInput.addEventListener("change", () => setFile(fileInput.files[0]));
["dragenter", "dragover"].forEach((ev) =>
  drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); })
);
["dragleave", "drop"].forEach((ev) =>
  drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); })
);
drop.addEventListener("drop", (e) => setFile(e.dataTransfer.files[0]));
drop.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
});

runBtn.addEventListener("click", async () => {
  if (!selected) return;
  runBtn.disabled = true;
  result.replaceChildren(el("div", "spinner"));
  const form = new FormData();
  form.append("image", selected);
  try {
    const res = await fetch("predict", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) showError(data.error || "Prediction failed.");
    else showResult(data);
  } catch (err) {
    showError("The live demo needs the model server, which is not available here. Run webapp/run.bat on a computer with the project to try it.");
  } finally {
    runBtn.disabled = false;
  }
});
