"""
Converts the Figshare "brain tumor dataset" (Jun Cheng et al., DOI 10.6084/m9.figshare.1512427)
from MATLAB v7.3 .mat files into a Training/Testing folder structure ready for the notebook.

Setup:
1. Download the dataset zip from https://figshare.com/articles/dataset/brain_tumor_dataset/1512427
   (or `curl -L -o data.zip https://ndownloader.figshare.com/articles/1512427/versions/5`)
2. Unzip everything (it contains 4 nested zip parts) so all *.mat files end up directly in
   raw_mat/ (no subfolders) — you should have 3064 files named 1.mat, 2.mat, ... 3064.mat.
3. pip install h5py numpy pillow scikit-learn
4. Run: python prepare_dataset.py

Each .mat file stores a "cjdata" struct with an image, a numeric label (1=Meningioma,
2=Glioma, 3=Pituitary), a tumor mask/border, and a patient ID. This script only needs the
image and label; it does a stratified 80/20 split and writes each slice out as a PNG under
Training/<class>/ or Testing/<class>/.
"""

from pathlib import Path

import h5py
import numpy as np
from PIL import Image
from sklearn.model_selection import train_test_split

RAW_DIR = Path(__file__).parent / "raw_mat"
TRAIN_DIR = Path(__file__).parent / "Training"
TEST_DIR = Path(__file__).parent / "Testing"
LABELS = {1: "Meningioma", 2: "Glioma", 3: "Pituitary"}
TEST_SIZE = 0.2
SEED = 42


def load_mat(path):
    with h5py.File(path, "r") as f:
        cjdata = f["cjdata"]
        image = np.array(cjdata["image"])
        label = int(np.array(cjdata["label"]).flatten()[0])
    return image, label


def save_as_png(image, out_path):
    img = image.astype(np.float64)
    img -= img.min()
    if img.max() > 0:
        img /= img.max()
    img = (img * 255).astype(np.uint8)
    Image.fromarray(img).save(out_path)


def main():
    mat_files = sorted(RAW_DIR.glob("*.mat"))
    if not mat_files:
        raise SystemExit(
            f"No .mat files found in {RAW_DIR}. Download and unzip the Figshare dataset "
            "there first (see the instructions at the top of this script)."
        )

    records = []
    for path in mat_files:
        image, label = load_mat(path)
        if label not in LABELS:
            continue
        records.append((path.stem, image, LABELS[label]))

    class_names = [r[2] for r in records]
    train_records, test_records = train_test_split(
        records, test_size=TEST_SIZE, random_state=SEED, stratify=class_names
    )

    for split_dir, split_records in [(TRAIN_DIR, train_records), (TEST_DIR, test_records)]:
        for class_name in LABELS.values():
            (split_dir / class_name).mkdir(parents=True, exist_ok=True)
        for stem, image, class_name in split_records:
            save_as_png(image, split_dir / class_name / f"{stem}.png")

    print(f"Converted {len(records)} images from {len(mat_files)} .mat files")
    print(f"  Training: {len(train_records)} -> {TRAIN_DIR}")
    print(f"  Testing:  {len(test_records)} -> {TEST_DIR}")


if __name__ == "__main__":
    main()
