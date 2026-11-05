import json
import os

os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import numpy as np
import tensorflow as tf
from PIL import Image

PROJECT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
TEST_DIR = os.path.join(PROJECT_DIR, "data", "Testing")
MODEL_PATH = os.path.join(PROJECT_DIR, "models", "best.keras")
# Metrics are written for the local web app and for the hosted website
OUT_PATHS = [os.path.join(PROJECT_DIR, "webapp", "static", "metrics.json"),
             os.path.join(PROJECT_DIR, "website", "public", "static", "metrics.json")]
OUT_PATH = OUT_PATHS[0]
IMAGE_SIZE = 224

classes = sorted(os.listdir(TEST_DIR))
model = tf.keras.models.load_model(MODEL_PATH, compile=False)

images, labels = [], []
for idx, name in enumerate(classes):
    folder = os.path.join(TEST_DIR, name)
    for fname in sorted(os.listdir(folder)):
        img = Image.open(os.path.join(folder, fname)).convert("RGB").resize((IMAGE_SIZE, IMAGE_SIZE))
        images.append(np.asarray(img, dtype="float32"))
        labels.append(idx)

y_true = np.array(labels)
probs = model.predict(np.stack(images), batch_size=32, verbose=0)
y_pred = probs.argmax(axis=1)
k = len(classes)

confusion = np.zeros((k, k), dtype=int)
for t, p in zip(y_true, y_pred):
    confusion[t, p] += 1


def auc_one_vs_rest(scores, positive):
    # Mann-Whitney U formulation of ROC AUC, with average ranks for ties
    order = scores.argsort()
    ranks = np.empty(len(scores))
    sorted_scores = scores[order]
    i = 0
    while i < len(scores):
        j = i
        while j + 1 < len(scores) and sorted_scores[j + 1] == sorted_scores[i]:
            j += 1
        ranks[order[i:j + 1]] = (i + j) / 2 + 1
        i = j + 1
    n_pos, n_neg = positive.sum(), (~positive).sum()
    return float((ranks[positive].sum() - n_pos * (n_pos + 1) / 2) / (n_pos * n_neg))


per_class = []
for i, name in enumerate(classes):
    tp = confusion[i, i]
    fp = confusion[:, i].sum() - tp
    fn = confusion[i, :].sum() - tp
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    per_class.append({
        "name": name,
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1": round(float(f1), 4),
        "auc": round(auc_one_vs_rest(probs[:, i], y_true == i), 4),
        "support": int(confusion[i, :].sum()),
    })

metrics = {
    "n_test": int(len(y_true)),
    "accuracy": round(float((y_pred == y_true).mean()), 4),
    "macro_f1": round(float(np.mean([c["f1"] for c in per_class])), 4),
    "classes": classes,
    "per_class": per_class,
    "confusion": confusion.tolist(),
}

if os.path.exists(OUT_PATH):
    with open(OUT_PATH) as f:
        previous = json.load(f)
    if "history" in previous:
        metrics["history"] = previous["history"]

for out in OUT_PATHS:
    with open(out, "w") as f:
        json.dump(metrics, f, indent=2)
print(json.dumps(metrics, indent=2))
