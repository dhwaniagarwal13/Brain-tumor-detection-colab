import io
import os

os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import numpy as np
from flask import Flask, jsonify, render_template, request
from PIL import Image, UnidentifiedImageError

import tensorflow as tf

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "Brain_Tumor_Prediction.h5")
IMAGE_SIZE = 128
# Same order as sorted(os.listdir(train_dir)) in the notebook
CLASS_NAMES = ["Glioma", "Healthy", "Meningioma", "Pituitary Macroadenoma"]
MAX_UPLOAD_BYTES = 8 * 1024 * 1024

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_BYTES

model = tf.keras.models.load_model(MODEL_PATH, compile=False)


def preprocess(raw_bytes):
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGB").resize((IMAGE_SIZE, IMAGE_SIZE))
    return np.expand_dims(np.asarray(img, dtype="float32") / 255.0, axis=0)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    file = request.files.get("image")
    if file is None or file.filename == "":
        return jsonify(error="No image uploaded."), 400
    try:
        batch = preprocess(file.read())
    except (UnidentifiedImageError, OSError):
        return jsonify(error="That file is not a readable image."), 400

    probs = model.predict(batch, verbose=0)[0]
    top = int(np.argmax(probs))
    return jsonify(
        label=CLASS_NAMES[top],
        confidence=float(probs[top]),
        probabilities={name: float(p) for name, p in zip(CLASS_NAMES, probs)},
    )


@app.errorhandler(413)
def too_large(_):
    return jsonify(error="Image is larger than 8 MB."), 413


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
