// Builds presentation/NeuroScan_Project.pptx  (run: node presentation/build/build_deck.js)
const pptxgen = require("pptxgenjs");
const path = require("path");
const A = (f) => path.join(__dirname, "..", "assets", f);
const S = (f) => A(path.join("samples", f));
const M = require(A("metrics.json"));
const EX = require(A("example_prediction.json"));

const NAVY = "0F2A4A", NAVY2 = "1B3E68", CIRC1 = "17375E", CIRC2 = "103B58", TEAL = "13808F", MINT = "3AAFA9", BG = "F4F7FA";
const INK = "12294D", GREY = "5A6B7B", LINE = "DCE4EC", WHITE = "FFFFFF", GREEN = "2E8B57";
const HEAD = "Cambria", BODY = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.title = "Brain Tumor Detection from MRI Scans";
pres.author = "Dhwani Agarwal and Akshay Jha";

const classesShort = ["Glioma", "Healthy", "Meningioma", "Pituitary"];
const pct = (x) => (x * 100).toFixed(1) + "%";
const shadow = () => ({ type: "outer", color: "000000", opacity: 0.1, blur: 8, offset: 2, angle: 90 });

function slide(notes, dark) {
  const s = pres.addSlide();
  s.background = { color: dark ? NAVY : BG };
  if (notes) s.addNotes(notes);
  return s;
}
function kicker(s, text, color) {
  s.addText(text.toUpperCase(), { x: 0.6, y: 0.38, w: 8, h: 0.3, fontFace: BODY, fontSize: 10, bold: true, color: color || TEAL, charSpacing: 3, margin: 0, isTextBox: true });
}
function title(s, text, color) {
  s.addText(text, { x: 0.6, y: 0.7, w: 12.1, h: 0.7, fontFace: HEAD, fontSize: 30, bold: true, color: color || INK, margin: 0, isTextBox: true, valign: "middle" });
}
function card(s, x, y, w, h, name, opts) {
  const o = opts || {};
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { color: o.fill || WHITE }, line: { color: o.line || LINE, width: o.lw || 0.5 }, shadow: o.noShadow ? undefined : shadow(), objectName: name || "card" });
}
function badge(s, x, y, n, color) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 0.46, h: 0.46, rectRadius: 0.07, fill: { color: color || TEAL }, line: { color: color || TEAL, width: 0 }, objectName: "badge" + n });
  s.addText(String(n), { x, y, w: 0.46, h: 0.46, fontFace: BODY, fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
}
function dot(s, x, y, color) {
  s.addShape(pres.shapes.OVAL, { x, y, w: 0.14, h: 0.14, fill: { color: color || MINT }, line: { color: color || MINT, width: 0 } });
}
function arrow(s, x1, y1, x2, y2, color) {
  const flipH = x2 < x1;
  s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), flipH, line: { color: color || TEAL, width: 1.75, endArrowType: "triangle" } });
}
function flowBox(s, x, y, w, h, text, o) {
  const op = o || {};
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: op.fill || "DCEAF0" }, line: { color: op.line || TEAL, width: op.lw || 1.5 }, objectName: "flow" });
  s.addText(text, { x, y, w, h, fontFace: BODY, fontSize: op.size || 13, bold: !!op.bold, color: op.color || INK, align: "center", valign: "middle", margin: 0.04, isTextBox: true });
}

// 1 ── Title
{
  const s = slide("This project builds a deep learning model that classifies a brain MRI slice into one of four categories: glioma, meningioma, pituitary macroadenoma, or healthy.", true);
  s.addShape(pres.shapes.OVAL, { x: 8.7, y: -2.2, w: 5.6, h: 5.6, fill: { color: CIRC1 }, line: { color: CIRC1, width: 0 } });
  s.addShape(pres.shapes.OVAL, { x: -1.2, y: 6.0, w: 2.8, h: 2.8, fill: { color: CIRC2 }, line: { color: CIRC2, width: 0 } });
  s.addShape(pres.shapes.OVAL, { x: 11.3, y: 5.5, w: 3.4, h: 3.4, fill: { color: CIRC2 }, line: { color: CIRC2, width: 0 } });
  s.addText("DEEP LEARNING  ·  MEDICAL IMAGE CLASSIFICATION", { x: 0.6, y: 1.4, w: 9, h: 0.3, fontFace: BODY, fontSize: 10, bold: true, color: MINT, charSpacing: 3, margin: 0, isTextBox: true });
  s.addText("Brain Tumor Detection\nfrom MRI Scans", { x: 0.6, y: 1.9, w: 8.5, h: 1.8, fontFace: HEAD, fontSize: 44, bold: true, color: WHITE, margin: 0, isTextBox: true, valign: "top" });
  s.addText("A deep learning model that classifies a brain MRI scan into one of four categories.", { x: 0.6, y: 3.85, w: 8.5, h: 0.4, fontFace: BODY, fontSize: 15, color: "C9D6E4", margin: 0, isTextBox: true });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.75, w: 6.9, h: 1.35, rectRadius: 0.06, fill: { color: NAVY2 }, line: { color: "2D5A8C", width: 1 } });
  s.addText([
    { text: "Dhwani Agarwal   ", options: { bold: true, color: WHITE, fontSize: 15 } }, { text: "RA2311027010021", options: { color: MINT, fontSize: 11, breakLine: true } },
    { text: "Akshay Jha   ", options: { bold: true, color: WHITE, fontSize: 15 } }, { text: "RA2311027010059", options: { color: MINT, fontSize: 11 } },
  ], { x: 0.95, y: 4.9, w: 6.3, h: 1.05, fontFace: BODY, margin: 0, valign: "middle", paraSpaceAfter: 6, isTextBox: true });
}

// 2 ── Project overview
{
  const s = slide("Three parts: a labelled dataset, a transfer learning model, and a prediction that comes with a confidence score.");
  kicker(s, "What we built"); title(s, "Project Overview");
  const items = [
    ["Labelled MRI dataset", "1,137 brain MRI images across four classes, split 80/20 into training and testing sets."],
    ["Transfer learning model", "A MobileNetV2 network pre-trained on ImageNet, fine-tuned on the MRI data in two phases with a four-class head."],
    ["Prediction with confidence", "The model returns the predicted tumor class along with how confident it is, reaching 86.9% accuracy on unseen test images."],
  ];
  items.forEach((it, i) => {
    const x = 0.6 + i * 4.14, w = 3.85;
    card(s, x, 1.85, w, 4.2, "overview" + i);
    badge(s, x + 0.35, 2.2, i + 1);
    s.addText(it[0], { x: x + 0.35, y: 3.0, w: w - 0.7, h: 0.5, fontFace: BODY, fontSize: 18, bold: true, color: INK, margin: 0, isTextBox: true });
    s.addText(it[1], { x: x + 0.35, y: 3.65, w: w - 0.7, h: 2.1, fontFace: BODY, fontSize: 16, color: GREY, margin: 0, valign: "top", isTextBox: true });
  });
}

// 3 ── What the model separates
{
  const s = slide("Four classes: three tumor types and a healthy brain. Telling them apart on an MRI needs specialist training, which is what the model learns.");
  kicker(s, "The problem"); title(s, "What the Model Separates");
  s.addText("Brain tumors differ in type, and the type determines the treatment pathway. Telling them apart on an MRI requires specialist training — this is what the model learns to do.", { x: 0.6, y: 1.5, w: 12.1, h: 0.7, fontFace: BODY, fontSize: 14, color: GREY, margin: 0, valign: "top", isTextBox: true });
  const names = ["Glioma", "Healthy", "Meningioma", "Pituitary Macroadenoma"], files = ["Glioma", "Healthy", "Meningioma", "Pituitary"];
  names.forEach((n, i) => {
    const w = 2.8, x = 0.6 + i * (w + 0.31);
    s.addText(n, { x, y: 2.5, w, h: 0.35, fontFace: BODY, fontSize: 15, bold: true, color: INK, align: "center", margin: 0, isTextBox: true });
    s.addImage({ path: S(files[i] + ".png"), x, y: 2.9, w, h: w, sizing: { type: "cover", w, h: w }, altText: n + " MRI slice" });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.9, w, h: w, fill: { type: "none" }, line: { color: TEAL, width: 2 } });
  });
  s.addText("Real samples from the training set  ·  224 × 224 MRI slices", { x: 0.6, y: 6.15, w: 12.1, h: 0.3, fontFace: BODY, fontSize: 11, italic: true, color: GREY, align: "center", margin: 0, isTextBox: true });
}

// 4 ── Dataset
{
  const s = slide("The dataset is the Mendeley multi-class brain tumor MRI dataset, balanced across classes, split 80/20.");
  kicker(s, "Where the data comes from"); title(s, "The Dataset");
  [["1,137", "MRI images"], ["4", "classes"], ["908", "training images"], ["229", "testing images"]].forEach((k, i) => {
    const w = 2.85, x = 0.6 + i * (w + 0.243);
    card(s, x, 1.65, w, 1.2, "tile" + i);
    s.addText(k[0], { x, y: 1.7, w, h: 0.7, fontFace: HEAD, fontSize: 32, bold: true, color: TEAL, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(k[1], { x, y: 2.4, w, h: 0.3, fontFace: BODY, fontSize: 12, color: GREY, align: "center", margin: 0, isTextBox: true });
  });
  card(s, 0.6, 3.1, 8.3, 3.7, "chartcard");
  s.addChart(pres.charts.BAR, [
    { name: "Training", labels: classesShort, values: [236, 232, 221, 219] },
    { name: "Testing", labels: classesShort, values: [59, 59, 56, 55] },
  ], {
    x: 0.75, y: 3.2, w: 8.0, h: 3.5, barDir: "col", barGrouping: "clustered", chartColors: [TEAL, MINT],
    showTitle: true, title: "Images per class", titleFontSize: 13, titleColor: INK, titleFontFace: BODY,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 10, dataLabelColor: INK, dataLabelFontFace: BODY,
    catAxisLabelColor: INK, catAxisLabelFontSize: 11, catAxisLabelFontFace: BODY, valAxisLabelColor: GREY, valAxisLabelFontSize: 10, valAxisLabelFontFace: BODY,
    valGridLine: { color: LINE, size: 0.5 }, catGridLine: { style: "none" }, showLegend: true, legendPos: "b", legendFontSize: 10, legendColor: INK, legendFontFace: BODY,
  });
  card(s, 9.15, 3.1, 3.58, 3.7, "source");
  s.addText([
    { text: "Source", options: { bold: true, fontSize: 15, color: INK, breakLine: true, paraSpaceAfter: 10 } },
    { text: "Multi-Class Brain Tumor MRI Dataset", options: { bold: true, fontSize: 12, color: INK, breakLine: true, paraSpaceAfter: 4 } },
    { text: "Jamil and Khan, Mendeley Data, V2 (2025)", options: { fontSize: 12, color: GREY, breakLine: true, paraSpaceAfter: 4 } },
    { text: "doi: 10.17632/82mtzd8x72.2", options: { bold: true, fontSize: 12, color: TEAL, breakLine: true, paraSpaceAfter: 4 } },
    { text: "Licence: CC BY 4.0", options: { fontSize: 12, color: GREY } },
  ], { x: 9.45, y: 3.35, w: 3.0, h: 3.2, fontFace: BODY, margin: 0, valign: "top", isTextBox: true });
}

// 5 ── What makes it different
{
  const s = slide("The architecture is standard transfer learning. The contribution is the rigour around it: traceable data, a reproducible split, and evaluation that cannot flatter the model.");
  kicker(s, "Our contribution"); title(s, "What Makes This Project Different");
  const typical = ["Kaggle repost with no attribution", "3 tumor types, or just tumor / no tumor", "Notebook only; the split can't be reproduced", "Class order from os.listdir — shifts between runs", "Accuracy only"];
  const ours = ["Mendeley dataset with a DOI and CC BY 4.0 licence", "4 classes — three tumor types plus Healthy", "Seeded split script committed to the repository", "Sorted class mapping — stable on every rerun", "Confusion matrix, per-class F1 and AUC, confidence score"];
  s.addText("TYPICAL STUDENT PROJECT", { x: 0.6, y: 1.65, w: 5.4, h: 0.3, fontFace: BODY, fontSize: 10, bold: true, color: GREY, charSpacing: 2, align: "center", margin: 0, isTextBox: true });
  s.addText("THIS PROJECT", { x: 6.7, y: 1.65, w: 6.0, h: 0.3, fontFace: BODY, fontSize: 10, bold: true, color: TEAL, charSpacing: 2, align: "center", margin: 0, isTextBox: true });
  typical.forEach((t, i) => {
    const y = 2.05 + i * 0.8;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y, w: 5.4, h: 0.65, rectRadius: 0.04, fill: { color: "E9EEF3" }, line: { color: "E9EEF3", width: 0 } });
    s.addText(t, { x: 0.85, y, w: 5.0, h: 0.65, fontFace: BODY, fontSize: 12, color: GREY, valign: "middle", margin: 0, isTextBox: true });
  });
  ours.forEach((t, i) => {
    const y = 2.05 + i * 0.8;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.7, y, w: 6.0, h: 0.65, rectRadius: 0.04, fill: { color: WHITE }, line: { color: TEAL, width: 1.75 } });
    dot(s, 6.95, y + 0.255, MINT);
    s.addText(t, { x: 7.25, y, w: 5.35, h: 0.65, fontFace: BODY, fontSize: 12, bold: true, color: INK, valign: "middle", margin: 0, isTextBox: true });
  });
  s.addText("The architecture is standard transfer learning. The contribution is the rigour around it — a traceable dataset, a reproducible split, and evaluation that cannot flatter the model.", { x: 0.6, y: 6.15, w: 12.1, h: 0.6, fontFace: BODY, fontSize: 12, italic: true, color: GREY, align: "center", margin: 0, valign: "middle", isTextBox: true });
}

// 6 ── Technologies
{
  const s = slide("The stack: Python and TensorFlow/Keras for the model, scikit-learn and Matplotlib for evaluation, and Flask plus Vercel for the demo and website.");
  kicker(s, "The stack"); title(s, "Technologies Used");
  const groups = [
    ["Language & environment", ["Python 3", "Google Colab (GPU runtime)"]],
    ["Deep learning", ["TensorFlow / Keras", "MobileNetV2 pre-trained on ImageNet"]],
    ["Image & data handling", ["Pillow (PIL)", "NumPy"]],
    ["Evaluation & plotting", ["scikit-learn", "Matplotlib & Seaborn"]],
    ["Web & deployment", ["Flask (local predictor)", "Vercel (project website)"]],
    ["Reproducibility", ["Seeded split scripts", "Fixed random seed (42)"]],
  ];
  groups.forEach((g, i) => {
    const w = 3.85, h = 2.2, x = 0.6 + (i % 3) * (w + 0.29), y = 1.7 + Math.floor(i / 3) * 2.45;
    card(s, x, y, w, h, "tech" + i);
    s.addText(g[0], { x: x + 0.35, y: y + 0.25, w: w - 0.7, h: 0.35, fontFace: BODY, fontSize: 14, bold: true, color: TEAL, margin: 0, isTextBox: true });
    g[1].forEach((t, j) => {
      dot(s, x + 0.35, y + 0.95 + j * 0.5 + 0.06, MINT);
      s.addText(t, { x: x + 0.65, y: y + 0.95 + j * 0.5, w: w - 1.0, h: 0.3, fontFace: BODY, fontSize: 13, color: INK, margin: 0, valign: "middle", isTextBox: true });
    });
  });
}

// 7 ── System architecture
{
  const s = slide("The dataset is split 80/20 with stratification. Both sets are resized to 224 by 224, training images are augmented, and the MobileNetV2 model outputs a class and a confidence score.");
  title(s, "System Architecture");
  const cx = 6.667, L = 3.6, R = 9.73;
  flowBox(s, cx - 2.3, 1.45, 4.6, 0.85, "Brain MRI Dataset\n1,137 labelled images  ·  4 classes", { fill: WHITE, line: INK, lw: 2, bold: true, size: 14 });
  s.addText("stratified  80 / 20", { x: cx - 1, y: 2.35, w: 2, h: 0.3, fontFace: BODY, fontSize: 11, italic: true, color: GREY, align: "center", margin: 0, isTextBox: true });
  arrow(s, cx - 0.9, 2.3, L, 2.85); arrow(s, cx + 0.9, 2.3, R, 2.85);
  flowBox(s, L - 1.7, 2.85, 3.4, 0.75, "Training set\n908 images");
  flowBox(s, R - 1.7, 2.85, 3.4, 0.75, "Testing set\n229 images");
  arrow(s, L, 3.6, L, 4.0); arrow(s, R, 3.6, R, 4.0);
  flowBox(s, L - 1.7, 4.0, 3.4, 0.8, "Preprocessing\nresize 224×224  ·  augment");
  flowBox(s, R - 1.7, 4.0, 3.4, 0.8, "Preprocessing\nresize 224×224");
  arrow(s, L, 4.8, cx - 1.2, 5.3); arrow(s, R, 4.8, cx + 1.2, 5.3);
  flowBox(s, cx - 3.2, 5.3, 6.4, 0.95, "MobileNetV2 Transfer Learning Model\ntwo-phase fine-tune  +  4-class head", { fill: "DCEAF0", line: INK, lw: 2.25, bold: true, size: 14 });
  arrow(s, cx, 6.25, cx, 6.55);
  flowBox(s, cx - 2.6, 6.55, 5.2, 0.5, "Predicted tumor class  +  confidence score", { fill: "E6F4EA", line: GREEN, lw: 1.75, bold: true, size: 13, color: "1D6B40" });
}

// 8 ── Methodology
{
  const s = slide("Five steps: prepare the data, preprocess, augment, train in two phases, then evaluate on the held-out test set.");
  kicker(s, "Step by step"); title(s, "Methodology");
  const st = [
    ["Data preparation", "Split the dataset 80/20 into Training and Testing folders, class by class."],
    ["Preprocessing", "Resize every image to 224×224; the model rescales pixel values internally."],
    ["Augmentation", "Vary brightness, contrast, flip, rotation and zoom on training images only."],
    ["Model training", "Train a new head on a frozen MobileNetV2, then fine-tune its top layers at a low learning rate."],
    ["Evaluation", "Measure accuracy, F1, confusion matrix and ROC/AUC on the unseen test set."],
  ];
  st.forEach((t, i) => {
    const w = 2.28, x = 0.6 + i * (w + 0.18);
    card(s, x, 1.85, w, 4.3, "method" + i);
    badge(s, x + 0.3, 2.2, i + 1, i === 4 ? MINT : TEAL);
    s.addText(t[0], { x: x + 0.3, y: 2.95, w: w - 0.5, h: 0.5, fontFace: BODY, fontSize: 15, bold: true, color: INK, margin: 0, valign: "top", isTextBox: true });
    s.addText(t[1], { x: x + 0.3, y: 3.7, w: w - 0.5, h: 2.2, fontFace: BODY, fontSize: 13.5, color: GREY, margin: 0, valign: "top", isTextBox: true });
  });
}

// 9 ── Augmentation in practice
{
  const s = slide("One training image becomes many. Augmentation is applied only to training images, never to the 229 test images.");
  kicker(s, "Step 3, seen"); title(s, "Augmentation in Practice");
  s.addText("One training image becomes many. Brightness, contrast, flip, rotation and zoom are applied at random, so the model sees a different version of each scan on every pass.", { x: 0.6, y: 1.5, w: 12.1, h: 0.7, fontFace: BODY, fontSize: 14, color: GREY, margin: 0, valign: "top", isTextBox: true });
  ["Original", "Augmented 1", "Augmented 2", "Augmented 3", "Augmented 4"].forEach((n, i) => {
    const w = 2.3, x = 0.6 + i * (w + 0.15);
    s.addText(n, { x, y: 2.45, w, h: 0.3, fontFace: BODY, fontSize: 12, bold: i === 0, color: i === 0 ? INK : TEAL, align: "center", margin: 0, isTextBox: true });
    s.addImage({ path: S("aug" + i + ".png"), x, y: 2.8, w, h: w, sizing: { type: "cover", w, h: w }, altText: n });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.8, w, h: w, fill: { type: "none" }, line: { color: i === 0 ? INK : TEAL, width: 1.5 } });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 5.55, w: 12.1, h: 0.75, rectRadius: 0.04, fill: { color: WHITE }, line: { color: TEAL, width: 1.5 } });
  s.addText("Applied to training images only — the 229 test images are never augmented, so the reported score reflects unseen data.", { x: 0.9, y: 5.55, w: 11.5, h: 0.75, fontFace: BODY, fontSize: 13, bold: true, color: INK, valign: "middle", margin: 0, isTextBox: true });
}

// 10 ── How a prediction is made
{
  const s = slide("A real example from the test set: the model reads the scan, outputs a probability for each class, and reports the top class with its confidence.");
  title(s, "How a Prediction Is Made");
  const cx = 6.667;
  s.addImage({ path: S("predict.png"), x: 0.8, y: 2.0, w: 2.7, h: 2.7, sizing: { type: "cover", w: 2.7, h: 2.7 }, altText: "Test MRI slice" });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 2.0, w: 2.7, h: 2.7, fill: { type: "none" }, line: { color: TEAL, width: 2 } });
  s.addText("A real test image (Meningioma)", { x: 0.8, y: 4.8, w: 2.7, h: 0.3, fontFace: BODY, fontSize: 11, italic: true, color: GREY, align: "center", margin: 0, isTextBox: true });
  flowBox(s, cx - 2.2, 1.45, 4.4, 0.55, "MRI scan image", { fill: WHITE, line: INK, lw: 2, bold: true, size: 14 });
  arrow(s, cx, 2.0, cx, 2.3);
  flowBox(s, cx - 2.2, 2.3, 4.4, 0.6, "Resize to 224 × 224  ·  rescale pixels inside the model", { size: 12 });
  arrow(s, cx, 2.9, cx, 3.2);
  flowBox(s, cx - 2.2, 3.2, 4.4, 0.6, "MobileNetV2 model  —  forward pass", { fill: WHITE, line: INK, lw: 2, bold: true, size: 13 });
  arrow(s, cx, 3.8, cx, 4.1);
  flowBox(s, cx - 2.2, 4.1, 4.4, 0.6, "Probability for each of the 4 classes", { size: 13 });
  arrow(s, cx, 4.7, cx, 5.0);
  flowBox(s, cx - 2.7, 5.0, 5.4, 0.65, "Result:  “Tumor: Meningioma  (Confidence: " + (EX.confidence * 100).toFixed(1) + "%)”", { fill: "E6F4EA", line: GREEN, lw: 1.75, bold: true, size: 13, color: "1D6B40" });
  s.addText("Classes:   Glioma  ·  Healthy  ·  Meningioma  ·  Pituitary Macroadenoma", { x: cx - 3.5, y: 5.8, w: 7, h: 0.3, fontFace: BODY, fontSize: 11, color: GREY, align: "center", margin: 0, isTextBox: true });
  // probabilities card
  card(s, 9.6, 1.9, 3.13, 3.55, "probs");
  s.addText("Model output", { x: 9.85, y: 2.05, w: 2.7, h: 0.35, fontFace: BODY, fontSize: 14, bold: true, color: INK, margin: 0, isTextBox: true });
  Object.entries(EX.probs).forEach(([k, v], i) => {
    const y = 2.6 + i * 0.7, top = v === Math.max(...Object.values(EX.probs));
    s.addText(k === "Pituitary Macroadenoma" ? "Pituitary" : k, { x: 9.85, y, w: 1.4, h: 0.3, fontFace: BODY, fontSize: 11, bold: top, color: INK, margin: 0, isTextBox: true });
    s.addText((v * 100).toFixed(1) + "%", { x: 11.7, y, w: 0.85, h: 0.3, fontFace: BODY, fontSize: 11, bold: top, color: top ? TEAL : GREY, align: "right", margin: 0, isTextBox: true });
    s.addShape(pres.shapes.RECTANGLE, { x: 9.85, y: y + 0.32, w: 2.7, h: 0.1, fill: { color: "E9EEF3" }, line: { color: "E9EEF3", width: 0 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 9.85, y: y + 0.32, w: Math.max(0.03, 2.7 * v), h: 0.1, fill: { color: top ? TEAL : "A9BAC8" }, line: { color: top ? TEAL : "A9BAC8", width: 0 } });
  });
}

// 11 ── Results
{
  const s = slide("On the held-out test set the model reaches 86.9 percent accuracy, up from 80.4 percent for the VGG16 baseline. Pituitary tumors are easiest to detect and meningiomas hardest.");
  kicker(s, "The outcome"); title(s, "Results on Unseen Images");
  [[pct(M.accuracy), "Test accuracy"], [M.macro_f1.toFixed(3), "Macro F1 score"], ["0.974", "Mean AUC, one vs rest"]].forEach((k, i) => {
    const y = 1.7 + i * 1.5;
    card(s, 0.6, y, 3.6, 1.3, "kpi" + i);
    s.addText(k[0], { x: 0.85, y, w: 3.1, h: 0.85, fontFace: HEAD, fontSize: 36, bold: true, color: i === 0 ? TEAL : INK, margin: 0, valign: "middle", isTextBox: true });
    s.addText(k[1], { x: 0.85, y: y + 0.82, w: 3.1, h: 0.35, fontFace: BODY, fontSize: 12, color: GREY, margin: 0, isTextBox: true });
  });
  card(s, 4.5, 1.7, 8.23, 2.95, "f1card");
  s.addChart(pres.charts.BAR, [{ name: "F1 score", labels: classesShort, values: M.per_class.map((c) => c.f1) }], {
    x: 4.6, y: 1.75, w: 8.0, h: 2.85, barDir: "col", chartColors: [TEAL], showLegend: false,
    showTitle: true, title: "F1 score by class", titleFontSize: 13, titleColor: INK, titleFontFace: BODY,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 11, dataLabelColor: INK, dataLabelFontFace: BODY, dataLabelFormatCode: "0.00",
    catAxisLabelColor: INK, catAxisLabelFontSize: 11, catAxisLabelFontFace: BODY, valAxisLabelColor: GREY, valAxisLabelFontSize: 10, valAxisLabelFontFace: BODY,
    valAxisMinVal: 0, valAxisMaxVal: 1, valGridLine: { color: LINE, size: 0.5 }, catGridLine: { style: "none" },
  });
  card(s, 4.5, 4.85, 8.23, 1.65, "cmp");
  s.addText("Baseline vs final model", { x: 4.8, y: 4.95, w: 5, h: 0.35, fontFace: BODY, fontSize: 13, bold: true, color: INK, margin: 0, isTextBox: true });
  [["VGG16 (128 px)", 0.804, "A9BAC8"], ["MobileNetV2 (224 px)", 0.869, TEAL]].forEach((b, i) => {
    const y = 5.4 + i * 0.5;
    s.addText(b[0], { x: 4.8, y, w: 2.2, h: 0.35, fontFace: BODY, fontSize: 12, color: INK, margin: 0, valign: "middle", isTextBox: true });
    s.addShape(pres.shapes.RECTANGLE, { x: 7.0, y: y + 0.04, w: 4.6 * b[1], h: 0.27, fill: { color: b[2] }, line: { color: b[2], width: 0 } });
    s.addText(pct(b[1]), { x: 7.0 + 4.6 * b[1] + 0.1, y, w: 0.9, h: 0.35, fontFace: BODY, fontSize: 12, bold: true, color: INK, margin: 0, valign: "middle", isTextBox: true });
  });
}

// 12 ── Confusion matrix
{
  const s = slide("Most mistakes are glioma versus meningioma, which look alike on some slices. Pituitary recall is 98.2 percent and healthy precision is 96 percent.");
  kicker(s, "Where it goes wrong"); title(s, "Confusion Matrix");
  const cm = M.confusion, rowSum = cm.map((r) => r.reduce((a, b) => a + b, 0));
  const head = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontFace: BODY, fontSize: 12, align: "center" } });
  const rows = [[head("True \\ Predicted"), ...classesShort.map(head)]];
  cm.forEach((r, i) => rows.push([head(classesShort[i]), ...r.map((v, j) => {
    const share = v / rowSum[i], diag = i === j;
    const fill = diag ? (share > 0.9 ? "0E6F7D" : "3AAFA9") : share > 0.08 ? "FFD0CA" : WHITE;
    return { text: String(v), options: { fontFace: HEAD, fontSize: 24, bold: diag, align: "center", color: diag ? WHITE : INK, fill: { color: fill } } };
  })]));
  s.addTable(rows, { x: 0.6, y: 1.7, w: 7.6, colW: [2.0, 1.4, 1.4, 1.4, 1.4], rowH: 0.85, border: { type: "solid", color: LINE, pt: 0.75 }, valign: "middle" });
  card(s, 8.55, 1.7, 4.18, 4.25, "readout");
  s.addText([
    { text: "Reading the matrix", options: { bold: true, fontSize: 16, color: INK, breakLine: true, paraSpaceAfter: 10 } },
    { text: "Rows are the true class, columns the prediction. The diagonal is correct.", options: { fontSize: 12, color: GREY, breakLine: true, paraSpaceAfter: 12 } },
    { text: "11 glioma / meningioma swaps are the main error", options: { bullet: true, fontSize: 13, color: INK, breakLine: true, paraSpaceAfter: 8 } },
    { text: "Pituitary recall 98.2%", options: { bullet: true, fontSize: 13, color: INK, breakLine: true, paraSpaceAfter: 8 } },
    { text: "Healthy precision 96.0%", options: { bullet: true, fontSize: 13, color: INK } },
  ], { x: 8.85, y: 1.95, w: 3.6, h: 3.8, fontFace: BODY, margin: 0, valign: "top", isTextBox: true });
}

// 13 ── Value delivered
{
  const s = slide("Four benefits: speed, triage using the confidence score, reproducibility, and the ability to extend the model to more tumor types.");
  kicker(s, "Why it matters"); title(s, "Value Delivered");
  const v = [
    ["Speed", "A four-way classification in about a second per scan, against minutes of manual review."],
    ["Triage", "The confidence score separates the clear cases from the ones that need a human to look again."],
    ["Reproducibility", "Anyone can regenerate the exact split and retrain — the result can be verified, not just claimed."],
    ["Extensibility", "The pipeline is class-agnostic: adding a fifth tumor type needs a new folder, not a rewrite."],
  ];
  v.forEach((t, i) => {
    const w = 5.95, h = 2.2, x = 0.6 + (i % 2) * (w + 0.2), y = 1.7 + Math.floor(i / 2) * 2.45;
    card(s, x, y, w, h, "value" + i);
    badge(s, x + 0.35, y + 0.3, i + 1, i > 1 ? MINT : TEAL);
    s.addText(t[0], { x: x + 1.0, y: y + 0.3, w: w - 1.3, h: 0.46, fontFace: BODY, fontSize: 17, bold: true, color: INK, margin: 0, valign: "middle", isTextBox: true });
    s.addText(t[1], { x: x + 0.35, y: y + 1.0, w: w - 0.7, h: 1.0, fontFace: BODY, fontSize: 15, color: GREY, margin: 0, valign: "top", isTextBox: true });
  });
}

// 14 ── Limits and next steps
{
  const s = slide("Limits: a small dataset, slices rather than patients, and no clinical validation. Next steps: a patient-level split, a stronger backbone, an ensemble and in-browser inference.");
  kicker(s, "Being honest"); title(s, "Limitations and Next Steps");
  const cols = [
    ["Limitations", CORAL_(), ["Only 1,137 images in total", "Slices, not patients: near-identical slices can sit in both training and validation, so validation reads ~100% while the test set gives 86.9%", "Educational model — no clinical validation, not a medical device"]],
    ["Next steps", TEAL, ["Split training and validation by patient or scan", "Try a stronger backbone such as EfficientNetV2 and ensemble several models", "Export to TensorFlow.js so the website can predict in the browser"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.6 + i * 6.15, w = 5.95;
    card(s, x, 1.7, w, 4.6, "col" + i);
    s.addText(c[0], { x: x + 0.4, y: 1.95, w: w - 0.8, h: 0.5, fontFace: HEAD, fontSize: 22, bold: true, color: c[1], margin: 0, isTextBox: true });
    c[2].forEach((t, j) => {
      const y = 2.7 + j * 1.15;
      dot(s, x + 0.4, y + 0.08, c[1]);
      s.addText(t, { x: x + 0.7, y, w: w - 1.1, h: 1.0, fontFace: BODY, fontSize: 15, color: INK, margin: 0, valign: "top", isTextBox: true });
    });
  });
}
function CORAL_() { return "D9534F"; }

// 15 ── Conclusion
{
  const s = slide("To wrap up: a working four-class MRI classifier built with a reproducible pipeline, reaching 86.9 percent accuracy on unseen test images.", true);
  s.addShape(pres.shapes.OVAL, { x: -1.3, y: -1.6, w: 4.6, h: 4.6, fill: { color: CIRC1 }, line: { color: CIRC1, width: 0 } });
  s.addShape(pres.shapes.OVAL, { x: 11.2, y: 5.4, w: 3.8, h: 3.8, fill: { color: CIRC2 }, line: { color: CIRC2, width: 0 } });
  s.addText("CONCLUSION", { x: 0.9, y: 1.1, w: 6, h: 0.3, fontFace: BODY, fontSize: 10, bold: true, color: MINT, charSpacing: 3, margin: 0, isTextBox: true });
  s.addText("A working four-class MRI classifier", { x: 0.9, y: 1.5, w: 11, h: 0.8, fontFace: HEAD, fontSize: 34, bold: true, color: WHITE, margin: 0, isTextBox: true });
  s.addText("The project takes a citable brain MRI dataset, preprocesses every image through one pipeline, and fine-tunes a MobileNetV2 network to separate glioma, meningioma, pituitary macroadenoma and healthy scans. The model returns a predicted class with a confidence score, and reaches 86.9% accuracy (macro F1 0.868) on test images it never saw during training — up from 80.4% for the VGG16 baseline.", { x: 0.9, y: 2.5, w: 9.2, h: 1.9, fontFace: BODY, fontSize: 15, color: "C9D6E4", margin: 0, valign: "top", paraSpaceAfter: 6, isTextBox: true });
  s.addText("Thank You", { x: 0.9, y: 4.75, w: 8, h: 0.8, fontFace: HEAD, fontSize: 36, bold: true, color: WHITE, margin: 0, isTextBox: true });
  s.addText([
    { text: "Dhwani Agarwal  ·  RA2311027010021", options: { color: MINT, breakLine: true } },
    { text: "Akshay Jha  ·  RA2311027010059", options: { color: MINT } },
  ], { x: 0.9, y: 5.7, w: 8, h: 0.7, fontFace: BODY, fontSize: 13, margin: 0, valign: "top", paraSpaceAfter: 4, isTextBox: true });
}

pres.writeFile({ fileName: path.join(__dirname, "..", "NeuroScan_Project.pptx") }).then((f) => console.log("wrote", f));
