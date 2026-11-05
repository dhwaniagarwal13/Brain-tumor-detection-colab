"""Improved brain tumor classifier: MobileNetV2 transfer learning at 224px, two-phase training.

Input to the saved model is raw RGB pixels in 0-255 (rescaling is inside the model), which keeps
the browser (TensorFlow.js) and Flask preprocessing identical and trivial.
"""
import json
import os

os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import tensorflow as tf
from tensorflow.keras import layers

HERE = os.path.dirname(os.path.abspath(__file__))
TRAIN_DIR = os.path.join(HERE, "..", "data", "Training")
OUT_DIR = os.path.join(HERE, "..", "models")
IMG = 224
BATCH = 16
SEED = 42
# Explicit class list: stray folders inside Training/ (e.g. models/) must never become a class
CLASSES = ["Glioma", "Healthy", "Meningioma", "Pituitary Macroadenoma"]
os.makedirs(OUT_DIR, exist_ok=True)
tf.keras.utils.set_random_seed(SEED)

common = dict(
    directory=TRAIN_DIR, validation_split=0.15, seed=SEED,
    image_size=(IMG, IMG), batch_size=BATCH, label_mode="categorical", class_names=CLASSES,
)
train_ds = tf.keras.utils.image_dataset_from_directory(subset="training", shuffle=True, **common)
val_ds = tf.keras.utils.image_dataset_from_directory(subset="validation", shuffle=False, **common)
class_names = train_ds.class_names
print("classes:", class_names)
train_ds = train_ds.cache().prefetch(tf.data.AUTOTUNE)
val_ds = val_ds.cache().prefetch(tf.data.AUTOTUNE)

augment = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.08, fill_mode="constant"),
    layers.RandomZoom(0.12, fill_mode="constant"),
    layers.RandomContrast(0.15),
    layers.RandomBrightness(0.15, value_range=(0, 255)),
], name="augment")

base = tf.keras.applications.MobileNetV2(input_shape=(IMG, IMG, 3), include_top=False, weights="imagenet")
base.trainable = False

inputs = tf.keras.Input(shape=(IMG, IMG, 3))
x = augment(inputs)
x = layers.Rescaling(1 / 127.5, offset=-1)(x)  # MobileNetV2 expects [-1, 1]
x = base(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.35)(x)
outputs = layers.Dense(len(class_names), activation="softmax")(x)
model = tf.keras.Model(inputs, outputs)

loss = tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1)
history = {"loss": [], "val_loss": [], "acc": [], "val_acc": []}


def run(epochs, lr, tag):
    model.compile(optimizer=tf.keras.optimizers.Adam(lr), loss=loss, metrics=["accuracy"])
    ckpt = tf.keras.callbacks.ModelCheckpoint(
        os.path.join(OUT_DIR, f"{tag}.keras"), monitor="val_loss", save_best_only=True)
    stop = tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True)
    h = model.fit(train_ds, validation_data=val_ds, epochs=epochs, callbacks=[ckpt, stop], verbose=2)
    for key, src in (("loss", "loss"), ("val_loss", "val_loss"), ("acc", "accuracy"), ("val_acc", "val_accuracy")):
        history[key] += [round(float(v), 4) for v in h.history[src]]
    return min(h.history["val_loss"])


print("== phase 1: train head, base frozen ==")
run(epochs=8, lr=1e-3, tag="phase1")

print("== phase 2: fine-tune top of base ==")
base.trainable = True
for layer in base.layers[:100]:
    layer.trainable = False
for layer in base.layers:
    if isinstance(layer, layers.BatchNormalization):
        layer.trainable = False
best = run(epochs=25, lr=1e-4, tag="best")

model.save(os.path.join(OUT_DIR, "best.keras"))
with open(os.path.join(OUT_DIR, "history.json"), "w") as f:
    json.dump({"classes": class_names, "history": history}, f, indent=2)
print("best val_loss (phase 2):", round(best, 4))
print("done")
