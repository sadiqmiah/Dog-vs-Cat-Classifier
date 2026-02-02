from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import tensorflow as tf
import io
import os

app = FastAPI(title="Dog vs Cat Classifier")

# --------------------
# CORS (Render-safe)
# --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# Model loading
# --------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "model.keras")

model = None
IMG_SIZE = 224
CLASS_NAMES = ["Cat 🐱", "Dog 🐶"]


@app.on_event("startup")
def load_model():
    global model
    model = tf.keras.models.load_model(MODEL_PATH)
    print("✅ Model loaded successfully")


def preprocess_image(image: Image.Image):
    image = image.convert("RGB")
    image = image.resize((IMG_SIZE, IMG_SIZE))
    img_array = np.array(image) / 255.0
    return np.expand_dims(img_array, axis=0)


# --------------------
# Routes
# --------------------
@app.get("/")
def health_check():
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    processed = preprocess_image(image)

    prob = float(model.predict(processed)[0][0])  # 🔑 FORCE python float

    if prob >= 0.5:
        label = "Dog 🐶"
        confidence = prob
    else:
        label = "Cat 🐱"
        confidence = 1 - prob

    return {
        "prediction": label,
        "confidence": round(float(confidence) * 100, 2)
    }
