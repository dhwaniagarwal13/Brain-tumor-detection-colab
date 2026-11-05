const pptxgen = require("pptxgenjs");
const path = require("path");
const A = (f) => path.join(__dirname, "..", "assets", f);
const M = require(A("metrics.json"));
const H = require(A("history.json")).history;

const INK = "0B1F33", INK2 = "13314D", TEAL = "14B8A6", CORAL = "FF6B5E", LIGHT = "F3F7FA", WHITE = "FFFFFF", MUTE = "5B7083", CARD = "FFFFFF";
const HEAD = "Cambria", BODY = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.title = "NeuroScan: Brain Tumor MRI Classification";
pres.author = "Dhwani Agarwal and Akshay Jha";

const classes = ["Glioma", "Healthy", "Meningioma", "Pituitary"];
const pct = (x) => (x * 100).toFixed(1) + "%";

function title(s, text, dark) {
  s.addText(text, { x: 0.6, y: 0.35, w: 8.8, h: 0.8, fontFace: HEAD, fontSize: 32, bold: true, color: dark ? WHITE : INK, margin: 0, isTextBox: true, valign: "middle" });
}
function light(notes) {
  const s = pres.addSlide();
  s.background = { color: LIGHT };
  if (notes) s.addNotes(notes);
  return s;
}
function dark(notes) {
  const s = pres.addSlide();
  s.background = { color: INK };
  if (notes) s.addNotes(notes);
  return s;
}
function card(s, x, y, w, h, name) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.1, fill: { color: CARD }, line: { color: "DCE6EE", width: 0.75 }, objectName: name || "card" });
}

// 1. Title
{
  const s = dark("Welcome. This project classifies brain MRI slices into four categories and improves on a baseline model by about six and a half points of accuracy.");
  const imgs = ["Glioma", "Healthy", "Meningioma", "Pituitary"];
  imgs.forEach((n, i) => {
    s.addImage({ path: A(n + ".jpg"), x: 6.0 + (i % 2) * 1.75, y: 1.2 + Math.floor(i / 2) * 1.75, w: 1.6, h: 1.6, sizing: { type: "cover", w: 1.6, h: 1.6 }, rounding: true, altText: n + " MRI slice" });
  });
  s.addText("NeuroScan", { x: 0.6, y: 1.4, w: 5.2, h: 0.9, fontFace: HEAD, fontSize: 54, bold: true, color: WHITE, margin: 0, isTextBox: true });
  s.addText("Brain tumor MRI classification with transfer learning", { x: 0.6, y: 2.4, w: 5, h: 0.9, fontFace: BODY, fontSize: 22, color: TEAL, margin: 0, isTextBox: true });
  s.addText("Glioma  |  Meningioma  |  Pituitary Macroadenoma  |  Healthy", { x: 0.6, y: 3.5, w: 5.2, h: 0.4, fontFace: BODY, fontSize: 14, color: "B9C9D6", margin: 0, isTextBox: true });
  s.addText([{ text: "Dhwani Agarwal (RA2311027010021)", options: { breakLine: true } }, { text: "Akshay Jha (RA2311027010059)" }], { x: 0.6, y: 4.3, w: 5.2, h: 0.65, fontFace: BODY, fontSize: 15, color: WHITE, margin: 0, isTextBox: true });
  s.addText("Educational project, not a medical device", { x: 0.6, y: 5.0, w: 5, h: 0.3, fontFace: BODY, fontSize: 11, color: "8FA6B8", margin: 0, isTextBox: true });
}

// 2. Problem
{
  const s = light("Brain tumors are diagnosed from MRI, and different types need different treatment. A model that sorts slices into types can support, not replace, a radiologist.");
  title(s, "Why classify brain MRI?");
  const rows = [
    ["4", "classes to tell apart", "Glioma, Meningioma, Pituitary Macroadenoma and a healthy brain"],
    ["1,137", "MRI images", "A public, citable academic dataset (Mendeley Data, CC BY 4.0)"],
    ["86.9%", "test accuracy", "On 229 images the model never saw during training"],
  ];
  rows.forEach((r, i) => {
    const y = 1.5 + i * 1.25;
    card(s, 0.6, y, 8.8, 1.05, "stat" + i);
    s.addText(r[0], { x: 0.85, y, w: 2.3, h: 1.05, fontFace: HEAD, fontSize: 38, bold: true, color: i === 2 ? CORAL : TEAL, margin: 0, valign: "middle", isTextBox: true });
    s.addText([{ text: r[1], options: { bold: true, fontSize: 18, color: INK, breakLine: true } }, { text: r[2], options: { fontSize: 14, color: MUTE } }], { x: 3.3, y, w: 5.9, h: 1.05, fontFace: BODY, margin: 0, valign: "middle", isTextBox: true });
  });
}

// 3. Dataset
{
  const s = light("The dataset is balanced across classes, split eighty twenty. Training has 908 images and testing 229, and the test set is never touched until final reporting.");
  title(s, "A balanced dataset");
  s.addChart(pres.charts.BAR, [
    { name: "Training", labels: classes, values: [236, 232, 221, 219] },
    { name: "Testing", labels: classes, values: [59, 59, 56, 55] },
  ], {
    x: 0.6, y: 1.3, w: 5.2, h: 3.9, barDir: "col", barGrouping: "clustered", chartColors: [TEAL, CORAL],
    showTitle: true, title: "Images per class", titleFontSize: 14, titleColor: INK, titleFontFace: BODY,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 11, dataLabelColor: INK, dataLabelFontFace: BODY,
    catAxisLabelColor: INK, catAxisLabelFontSize: 11, catAxisLabelFontFace: BODY, valAxisLabelColor: MUTE, valAxisLabelFontSize: 10, valAxisLabelFontFace: BODY,
    valGridLine: { color: "DCE6EE", size: 0.5 }, catGridLine: { style: "none" }, showLegend: true, legendPos: "b", legendFontSize: 11, legendColor: INK, legendFontFace: BODY,
  });
  ["Glioma", "Healthy", "Meningioma", "Pituitary"].forEach((n, i) => {
    const x = 6.1 + (i % 2) * 1.8, y = 1.3 + Math.floor(i / 2) * 2.05;
    s.addImage({ path: A(n + ".jpg"), x, y, w: 1.65, h: 1.65, sizing: { type: "cover", w: 1.65, h: 1.65 }, altText: n + " MRI slice" });
    s.addText(n, { x, y: y + 1.68, w: 1.65, h: 0.3, fontFace: BODY, fontSize: 12, color: INK, align: "center", margin: 0, isTextBox: true });
  });
}

// 4. Pipeline
{
  const s = light("Training and prediction share exactly the same preprocessing. Rescaling is part of the model, so the website, the app and the notebook cannot drift apart.");
  title(s, "From scan to prediction");
  const steps = [
    ["1", "Prepare", "Resize to 224 x 224, three channels"],
    ["2", "Augment", "Flip, rotate, zoom, contrast, brightness"],
    ["3", "Train head", "MobileNetV2 frozen, new classifier on top"],
    ["4", "Fine-tune", "Unfreeze top layers at a low learning rate"],
    ["5", "Evaluate", "Held-out test set, F1, AUC, confusion matrix"],
  ];
  steps.forEach((st, i) => {
    const x = 0.6 + i * 1.78;
    card(s, x, 1.7, 1.65, 2.4, "step" + i);
    s.addShape(pres.shapes.OVAL, { x: x + 0.52, y: 1.9, w: 0.6, h: 0.6, fill: { color: i === 4 ? CORAL : TEAL }, line: { color: WHITE, width: 0 } });
    s.addText(st[0], { x: x + 0.52, y: 1.9, w: 0.6, h: 0.6, fontFace: HEAD, fontSize: 20, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(st[1], { x: x + 0.1, y: 2.65, w: 1.45, h: 0.4, fontFace: BODY, fontSize: 16, bold: true, color: INK, align: "center", margin: 0, isTextBox: true });
    s.addText(st[2], { x: x + 0.12, y: 3.1, w: 1.41, h: 1.2, fontFace: BODY, fontSize: 12, color: MUTE, align: "center", valign: "top", margin: 0, isTextBox: true });
  });
}

// 5. Model comparison
{
  const s = light("The baseline was VGG16 at 128 pixels. The new model is MobileNetV2 at 224 pixels, which is smaller, faster and more accurate on this small dataset.");
  title(s, "Two models, one clear winner");
  const hdr = { bold: true, color: WHITE, fill: { color: INK }, fontFace: BODY, fontSize: 14, align: "left" };
  const cell = (t, o) => ({ text: t, options: Object.assign({ fontFace: BODY, fontSize: 14, color: INK, fill: { color: WHITE } }, o || {}) });
  const win = { bold: true, color: INK, fill: { color: "D7F5F0" } };
  s.addTable([
    [{ text: "", options: hdr }, { text: "VGG16 baseline", options: hdr }, { text: "MobileNetV2 (final)", options: hdr }],
    [cell("Input size"), cell("128 x 128"), cell("224 x 224", win)],
    [cell("Head"), cell("Flatten, dropout, 128 units"), cell("Average pooling, dropout 0.35", win)],
    [cell("Training"), cell("One phase"), cell("Two phases: head, then fine-tune", win)],
    [cell("Test accuracy"), cell("80.4%"), cell("86.9%", win)],
    [cell("Macro F1"), cell("0.807"), cell("0.868", win)],
  ], { x: 0.6, y: 1.5, w: 8.8, colW: [2.2, 3.1, 3.5], rowH: 0.55, border: { type: "solid", color: "DCE6EE", pt: 0.75 }, valign: "middle" });
  s.addText("+6.5 points of accuracy from a lighter network", { x: 0.6, y: 4.85, w: 8.8, h: 0.4, fontFace: HEAD, fontSize: 18, italic: true, color: CORAL, margin: 0, isTextBox: true });
}

// 6. Training curves
{
  const s = light("Phase one trains only the new head. At epoch nine we unfreeze the top of the base network and drop the learning rate. Validation accuracy reached one hundred percent, which is inflated by near duplicate slices, so we trust the test set instead.");
  title(s, "Training in two phases");
  const ep = H.loss.map((_, i) => String(i + 1));
  s.addChart(pres.charts.LINE, [
    { name: "Train loss", labels: ep, values: H.loss },
    { name: "Validation loss", labels: ep, values: H.val_loss },
  ], {
    x: 0.6, y: 1.3, w: 5.8, h: 3.9, chartColors: [TEAL, CORAL], lineSize: 2.5, lineDataSymbol: "none",
    showTitle: true, title: "Loss by epoch (fine-tuning begins at epoch 9)", titleFontSize: 13, titleColor: INK, titleFontFace: BODY,
    catAxisLabelColor: MUTE, catAxisLabelFontSize: 10, catAxisLabelFontFace: BODY, valAxisLabelColor: MUTE, valAxisLabelFontSize: 10, valAxisLabelFontFace: BODY,
    catAxisLabelFrequency: 4, valGridLine: { color: "DCE6EE", size: 0.5 }, catGridLine: { style: "none" },
    showLegend: true, legendPos: "b", legendFontSize: 11, legendColor: INK, legendFontFace: BODY,
  });
  card(s, 6.7, 1.5, 2.7, 2.8, "notes");
  s.addText([
    { text: "What to know", options: { bold: true, fontSize: 16, color: INK, breakLine: true, paraSpaceAfter: 8 } },
    { text: "33 epochs in total", options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } },
    { text: "Label smoothing 0.1 against overconfidence", options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } },
    { text: "Validation hit 100%, but is inflated by near-duplicate slices", options: { bullet: true } },
  ], { x: 6.85, y: 1.65, w: 2.4, h: 3.2, fontFace: BODY, fontSize: 13, color: INK, valign: "top", margin: 0, isTextBox: true });
}

// 7. Results
{
  const s = dark("On the held-out test set the model reaches eighty six point nine percent accuracy. Pituitary tumors are easiest to find, meningiomas hardest.");
  title(s, "Results on unseen images", true);
  [[pct(M.accuracy), "Test accuracy"], [M.macro_f1.toFixed(3), "Macro F1"], ["0.974", "Mean AUC"]].forEach((k, i) => {
    const y = 1.4 + i * 1.3;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y, w: 3.0, h: 1.12, rectRadius: 0.1, fill: { color: INK2 }, line: { color: INK2, width: 0 } });
    s.addText(k[0], { x: 0.8, y, w: 1.9, h: 1.12, fontFace: HEAD, fontSize: 32, bold: true, color: i === 0 ? CORAL : TEAL, margin: 0, valign: "middle", isTextBox: true });
    s.addText(k[1], { x: 2.55, y, w: 1.0, h: 1.12, fontFace: BODY, fontSize: 12, color: "B9C9D6", margin: 0, valign: "middle", isTextBox: true });
  });
  s.addChart(pres.charts.BAR, [{ name: "F1 score", labels: classes, values: M.per_class.map((c) => c.f1) }], {
    x: 4.0, y: 1.3, w: 5.4, h: 3.9, barDir: "bar", chartColors: [TEAL], showLegend: false,
    showTitle: true, title: "F1 score by class", titleFontSize: 14, titleColor: WHITE, titleFontFace: BODY,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 12, dataLabelColor: WHITE, dataLabelFontFace: BODY, dataLabelFormatCode: "0.00",
    catAxisLabelColor: WHITE, catAxisLabelFontSize: 12, catAxisLabelFontFace: BODY, catAxisOrientation: "maxMin",
    valAxisLabelColor: "B9C9D6", valAxisLabelFontSize: 10, valAxisLabelFontFace: BODY, valAxisMinVal: 0, valAxisMaxVal: 1,
    valGridLine: { color: "2A4863", size: 0.5 }, catGridLine: { style: "none" },
  });
}

// 8. Confusion matrix
{
  const s = light("Most mistakes are glioma versus meningioma, which look alike on some slices. Healthy scans are rarely flagged wrongly, with precision of ninety six percent.");
  title(s, "Where the model gets confused");
  const cm = M.confusion;
  const rowMax = cm.map((r) => r.reduce((a, b) => a + b, 0));
  const head = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: INK }, fontFace: BODY, fontSize: 11, align: "center" } });
  const rows = [[head("True \\ Predicted"), ...classes.map(head)]];
  cm.forEach((r, i) => {
    rows.push([head(classes[i]), ...r.map((v, j) => {
      const share = v / rowMax[i];
      const diag = i === j;
      const fill = diag ? (share > 0.9 ? "0E8F82" : "35B3A5") : share > 0.08 ? "FFC9C3" : "FFFFFF";
      return { text: String(v), options: { fontFace: HEAD, fontSize: 20, bold: diag, align: "center", color: diag ? WHITE : INK, fill: { color: fill } } };
    })]);
  });
  s.addTable(rows, { x: 0.6, y: 1.5, w: 5.8, colW: [1.5, 1.0, 1.0, 1.3, 1.0], rowH: 0.7, border: { type: "solid", color: "DCE6EE", pt: 0.75 }, valign: "middle" });
  card(s, 6.7, 1.5, 2.7, 2.8, "readout");
  s.addText([
    { text: "Reading it", options: { bold: true, fontSize: 16, color: INK, breakLine: true, paraSpaceAfter: 8 } },
    { text: "11 glioma / meningioma swaps", options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } },
    { text: "Pituitary recall 98.2%", options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } },
    { text: "Healthy precision 96.0%", options: { bullet: true } },
  ], { x: 6.85, y: 1.65, w: 2.4, h: 3.2, fontFace: BODY, fontSize: 13, color: INK, valign: "top", margin: 0, isTextBox: true });
}

// 9. Product
{
  const s = light("The project ships three things: a Colab notebook, a local Flask app for live prediction, and a public website with learning content.");
  title(s, "What was built");
  const items = [
    ["Colab notebook", "Full pipeline: data, training, evaluation, ROC and confusion matrix"],
    ["Local predictor", "Flask app. Images stay on your own computer"],
    ["Website", "Nine pages on tumors, MRI, the model, results and FAQ, deployed on Vercel"],
  ];
  items.forEach((it, i) => {
    const x = 0.6 + i * 3.0;
    card(s, x, 1.6, 2.8, 2.8, "prod" + i);
    s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: 1.85, w: 0.7, h: 0.7, fill: { color: [TEAL, CORAL, INK2][i] }, line: { color: WHITE, width: 0 } });
    s.addText(String(i + 1), { x: x + 0.2, y: 1.85, w: 0.7, h: 0.7, fontFace: HEAD, fontSize: 22, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(it[0], { x: x + 0.2, y: 2.75, w: 2.4, h: 0.45, fontFace: HEAD, fontSize: 20, bold: true, color: INK, margin: 0, isTextBox: true });
    s.addText(it[1], { x: x + 0.2, y: 3.25, w: 2.4, h: 1.3, fontFace: BODY, fontSize: 14, color: MUTE, valign: "top", margin: 0, isTextBox: true });
  });
}

// 10. Limitations and next steps
{
  const s = light("Limits: small dataset, slices rather than patients, and no clinical validation. Next steps are patient level splits, a stronger backbone, an ensemble and in browser inference.");
  title(s, "Limits and next steps");
  card(s, 0.6, 1.5, 4.3, 2.9, "limits");
  card(s, 5.1, 1.5, 4.3, 2.9, "next");
  s.addText([
    { text: "Limits", options: { bold: true, fontSize: 20, color: CORAL, breakLine: true, paraSpaceAfter: 10 } },
    { text: "Only 1,137 images", options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
    { text: "Slices, not patients: validation leaks", options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
    { text: "No clinical validation", options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
    { text: "Hosted site cannot run the model", options: { bullet: true } },
  ], { x: 0.85, y: 1.7, w: 3.8, h: 2.5, fontFace: BODY, fontSize: 15, color: INK, valign: "top", margin: 0, isTextBox: true });
  s.addText([
    { text: "Next", options: { bold: true, fontSize: 20, color: TEAL, breakLine: true, paraSpaceAfter: 10 } },
    { text: "Split by patient or scan", options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
    { text: "EfficientNetV2 backbone", options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
    { text: "Ensemble several models", options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
    { text: "Export to TensorFlow.js", options: { bullet: true } },
  ], { x: 5.35, y: 1.7, w: 3.8, h: 2.5, fontFace: BODY, fontSize: 15, color: INK, valign: "top", margin: 0, isTextBox: true });
}

// 11. Conclusion
{
  const s = dark("To wrap up: transfer learning with a careful two phase fine tune lifted test accuracy from eighty to eighty seven percent.");
  s.addText("86.9%", { x: 0.6, y: 1.2, w: 8.8, h: 1.6, fontFace: HEAD, fontSize: 96, bold: true, color: CORAL, margin: 0, isTextBox: true });
  s.addText("test accuracy, up from 80.4%, using a fine-tuned MobileNetV2", { x: 0.6, y: 2.9, w: 8.8, h: 0.6, fontFace: BODY, fontSize: 22, color: WHITE, margin: 0, isTextBox: true });
  s.addText("Notebook, local app and website are complete. Thank you.", { x: 0.6, y: 3.8, w: 8.8, h: 0.5, fontFace: BODY, fontSize: 16, color: TEAL, margin: 0, isTextBox: true });
  s.addText("Dataset: Jamil and Khan (2025), Mendeley Data V2, doi:10.17632/82mtzd8x72.2, CC BY 4.0", { x: 0.6, y: 4.9, w: 8.8, h: 0.35, fontFace: BODY, fontSize: 11, color: "8FA6B8", margin: 0, isTextBox: true });
}

pres.writeFile({ fileName: path.join(__dirname, "..", "NeuroScan_Project.pptx") }).then((f) => console.log("wrote", f));
