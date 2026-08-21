"""
Stratified 80/20 train/test split for the Mendeley "Multi-Class Brain Tumor MRI Dataset"
(Glioma, Healthy, Meningioma, Pituitary Macroadenoma), already extracted as JPGs under
mendeley_raw/extracted/. Copies files into Training/<class>/ and Testing/<class>/.
"""

import shutil
from pathlib import Path

from sklearn.model_selection import train_test_split

BASE = Path(__file__).parent
SOURCE = BASE / "mendeley_raw" / "extracted" / "Brain Cancer MRI Dataset" / "Brain Cancer MRI Dataset"
TRAIN_DIR = BASE / "Training"
TEST_DIR = BASE / "Testing"
TEST_SIZE = 0.2
SEED = 42


def main():
    class_dirs = sorted(d for d in SOURCE.iterdir() if d.is_dir())
    if not class_dirs:
        raise SystemExit(f"No class folders found in {SOURCE}")

    for split_dir in (TRAIN_DIR, TEST_DIR):
        for class_dir in class_dirs:
            (split_dir / class_dir.name).mkdir(parents=True, exist_ok=True)

    total_train = total_test = 0
    for class_dir in class_dirs:
        files = sorted(class_dir.glob("*.jpg"))
        train_files, test_files = train_test_split(files, test_size=TEST_SIZE, random_state=SEED)
        for f in train_files:
            shutil.copy2(f, TRAIN_DIR / class_dir.name / f.name)
        for f in test_files:
            shutil.copy2(f, TEST_DIR / class_dir.name / f.name)
        print(f"{class_dir.name}: {len(train_files)} train, {len(test_files)} test")
        total_train += len(train_files)
        total_test += len(test_files)

    print(f"\nTotal: {total_train} train, {total_test} test -> {TRAIN_DIR}, {TEST_DIR}")


if __name__ == "__main__":
    main()
