# NeuroScan: Brain Tumor MRI Classification

Classifies brain MRI slices into **Glioma, Healthy, Meningioma, Pituitary Macroadenoma** using a fine-tuned MobileNetV2, with a Colab notebook, a local prediction app and an educational website.

By **Dhwani Agarwal (RA2311027010021)** and **Akshay Jha (RA2311027010059)**.

> Educational project. Not a medical device and not for diagnosis.

## Results (229 held-out test images)

| Model | Input | Accuracy | Macro F1 |
|---|---|---|---|
| VGG16 baseline | 128 px | 80.4% | 0.807 |
| **MobileNetV2, two-phase fine-tune** | 224 px | **86.9%** | **0.868** |

Per-class F1: Glioma 0.857, Healthy 0.881, Meningioma 0.811, Pituitary 0.923.
Validation accuracy during training reads close to 100% because near-identical slices from one scan can fall on both sides of the split, so the test set is the number to trust.

## Dataset
Multi-Class Brain Tumor MRI Dataset, Jamil and Khan (2025), Mendeley Data V2, doi:10.17632/82mtzd8x72.2, CC BY 4.0. 1,137 images split 80/20 into `Training/` and `Testing/`.

## Layout
- `Brain_Tumor_Detection_Colab.ipynb`: full pipeline for Google Colab (upload `train.zip` and `test.zip` to Drive first).
- `Training/train_improved.py`: local training script; the trained model is `Training/models/best.keras`.
- `webapp/`: Flask app (`run.bat`) for live predictions, and `evaluate.py` for metrics.
- `site_src/` and `site/`: the website source and the built static pages (`python site_src/build.py`). Deployed on Vercel.

## Run the predictor locally
```
cd webapp
python -m venv .venv && .venv\Scripts\pip install tensorflow flask pillow
run.bat
```
Images go only to your own computer. The hosted website cannot run the model; it shows the results and learning content.

## Ideas to improve further
Patient-level validation split, a stronger backbone (EfficientNetV2), model ensembling, and exporting the model to TensorFlow.js for in-browser prediction.
