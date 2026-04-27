"""
URBANSENSE - ML Severity Detection Microservice
Flask REST API for image severity classification using MobileNetV2 CNN.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import os
import io
import time

app = Flask(__name__)
CORS(app)

# ============================================
# GLOBAL VARIABLES
# ============================================
model = None
CLASS_LABELS = ['low', 'medium', 'high', 'critical']
MODEL_PATH = 'model/urbansense_model.h5'

# Category-based severity boost
# Higher risk categories get boosted toward higher severity
CATEGORY_BOOST = {
    'sewage':                {'high': 0.25, 'critical': 0.30},
    'water_leak':            {'high': 0.20, 'critical': 0.20},
    'pothole':               {'high': 0.15, 'critical': 0.10},
    'road_damage':           {'high': 0.15, 'critical': 0.10},
    'garbage':               {'medium': 0.10, 'high': 0.10},
    'illegal_construction':  {'high': 0.15, 'critical': 0.15},
    'streetlight':           {'medium': 0.10, 'low': 0.05},
    'air_pollution':         {'medium': 0.10, 'high': 0.10},
    'noise_pollution':       {'low': 0.10, 'medium': 0.10},
    'other':                 {},
}


def load_model():
    """Load the trained CNN model."""
    global model
    
    if os.path.exists(MODEL_PATH):
        print(f"📦 Loading model from {MODEL_PATH}...")
        model = tf.keras.models.load_model(MODEL_PATH)
        print("✅ Model loaded successfully!")
        print(f"   Parameters: {model.count_params():,}")
    else:
        print("⚠️  No trained model found!")
        print("   Run 'python train_model.py' first to create the model.")
        print("   Creating a fresh model now...")
        
        from train_model import create_model
        model = create_model()
        os.makedirs('model', exist_ok=True)
        model.save(MODEL_PATH)
        print("✅ Fresh model created and saved!")


def preprocess_image(image_path=None, image_bytes=None):
    """
    Preprocess image for MobileNetV2 input.
    - Resize to 224x224
    - Convert to RGB
    - Normalize pixel values to [0, 1]
    - Add batch dimension
    """
    try:
        if image_bytes:
            img = Image.open(io.BytesIO(image_bytes))
        elif image_path:
            img = Image.open(image_path)
        else:
            raise ValueError("No image provided")
        
        # Convert to RGB (handles PNG with alpha, grayscale, etc.)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to model input size (MobileNetV2 expects 224x224)
        img = img.resize((224, 224), Image.LANCZOS)
        
        # Convert to numpy array and normalize
        img_array = np.array(img, dtype='float32') / 255.0
        
        # Add batch dimension: (224,224,3) -> (1,224,224,3)
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    except Exception as e:
        print(f"❌ Image preprocessing error: {str(e)}")
        raise


def apply_category_boost(probabilities, category):
    """
    Adjust prediction probabilities based on complaint category.
    
    For example:
    - 'sewage' complaints should be boosted toward 'high'/'critical'
    - 'streetlight' complaints are generally 'low'/'medium'
    """
    adjusted = probabilities.copy()
    boosts = CATEGORY_BOOST.get(category, {})
    
    for severity_class, boost_value in boosts.items():
        class_index = CLASS_LABELS.index(severity_class)
        adjusted[class_index] += boost_value
    
    # Re-normalize to ensure probabilities sum to 1
    total = adjusted.sum()
    if total > 0:
        adjusted = adjusted / total
    
    return adjusted


# ============================================
# API ENDPOINTS
# ============================================

@app.route('/predict', methods=['POST'])
def predict():
    """
    🔍 Predict severity of an urban issue from image.
    
    Accepts:
    - JSON: { "image_path": "path/to/image", "category": "pothole" }
    - Form: multipart form with 'image' file and 'category' field
    
    Returns:
    {
        "severity": "high",
        "confidence": 0.85,
        "raw_severity": "medium",
        "raw_confidence": 0.72,
        "probabilities": { "low": 0.05, "medium": 0.15, "high": 0.55, "critical": 0.25 },
        "category": "pothole",
        "model": "MobileNetV2-TransferLearning"
    }
    """
    start_time = time.time()
    
    try:
        global model
        if model is None:
            load_model()
        
        img_array = None
        category = 'other'
        
        # ---- Handle JSON request (from Node.js backend) ----
        if request.is_json:
            data = request.get_json()
            image_path = data.get('image_path')
            category = data.get('category', 'other')
            
            if image_path and os.path.exists(image_path):
                img_array = preprocess_image(image_path=image_path)
            else:
                # Image not found - return fallback
                print(f"⚠️  Image not found: {image_path}")
                return jsonify({
                    'severity': get_fallback_severity(category),
                    'confidence': 0.3,
                    'raw_severity': 'medium',
                    'raw_confidence': 0.3,
                    'probabilities': {'low': 0.25, 'medium': 0.35, 'high': 0.25, 'critical': 0.15},
                    'category': category,
                    'model': 'fallback',
                    'note': 'Image file not found, using category-based fallback'
                }), 200
        
        # ---- Handle multipart form request ----
        elif 'image' in request.files:
            image_file = request.files['image']
            category = request.form.get('category', 'other')
            image_bytes = image_file.read()
            img_array = preprocess_image(image_bytes=image_bytes)
        
        # ---- No image provided ----
        else:
            return jsonify({
                'severity': get_fallback_severity(category),
                'confidence': 0.3,
                'raw_severity': 'medium',
                'raw_confidence': 0.3,
                'probabilities': {'low': 0.25, 'medium': 0.35, 'high': 0.25, 'critical': 0.15},
                'category': category,
                'model': 'fallback',
                'note': 'No image provided'
            }), 200
        
        # ---- Run CNN Prediction ----
        raw_predictions = model.predict(img_array, verbose=0)
        raw_probs = raw_predictions[0]
        
        raw_class_index = int(np.argmax(raw_probs))
        raw_severity = CLASS_LABELS[raw_class_index]
        raw_confidence = float(np.max(raw_probs))
        
        # ---- Apply Category Boost ----
        adjusted_probs = apply_category_boost(raw_probs, category)
        
        adjusted_class_index = int(np.argmax(adjusted_probs))
        final_severity = CLASS_LABELS[adjusted_class_index]
        final_confidence = float(np.max(adjusted_probs))
        
        # Build probability dictionary
        probabilities = {
            label: round(float(prob), 4)
            for label, prob in zip(CLASS_LABELS, adjusted_probs)
        }
        
        processing_time = round(time.time() - start_time, 3)
        
        result = {
            'severity': final_severity,
            'confidence': round(final_confidence, 4),
            'raw_severity': raw_severity,
            'raw_confidence': round(raw_confidence, 4),
            'probabilities': probabilities,
            'category': category,
            'model': 'MobileNetV2-TransferLearning',
            'processing_time_seconds': processing_time,
        }
        
        print(f"🔍 Prediction: {final_severity} (conf: {final_confidence:.2f}) | "
              f"Raw: {raw_severity} (conf: {raw_confidence:.2f}) | "
              f"Category: {category} | Time: {processing_time}s")
        
        return jsonify(result), 200
    
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        return jsonify({
            'severity': 'medium',
            'confidence': 0.3,
            'error': str(e),
            'model': 'error-fallback'
        }), 200


def get_fallback_severity(category):
    """Fallback severity based on category when ML can't process."""
    fallback_map = {
        'sewage': 'high',
        'water_leak': 'high',
        'pothole': 'medium',
        'road_damage': 'medium',
        'illegal_construction': 'medium',
        'garbage': 'medium',
        'streetlight': 'low',
        'air_pollution': 'medium',
        'noise_pollution': 'low',
        'other': 'medium',
    }
    return fallback_map.get(category, 'medium')


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'running',
        'service': 'URBANSENSE ML Severity Detection Service',
        'model_loaded': model is not None,
        'model_type': 'MobileNetV2 (Transfer Learning / CNN)',
        'input_shape': '224 x 224 x 3 (RGB)',
        'classes': CLASS_LABELS,
        'num_classes': len(CLASS_LABELS),
        'framework': 'TensorFlow / Keras',
    }), 200


@app.route('/model-info', methods=['GET'])
def model_info():
    """Detailed model architecture information."""
    global model
    if model is None:
        load_model()
    
    # Count layers
    total_layers = len(model.layers)
    trainable_layers = sum(1 for layer in model.layers if layer.trainable)
    
    return jsonify({
        'architecture': 'MobileNetV2 + Custom Classification Head',
        'base_model': 'MobileNetV2 (pretrained on ImageNet)',
        'technique': 'Transfer Learning',
        'input_shape': '224 x 224 x 3',
        'output_classes': CLASS_LABELS,
        'num_classes': 4,
        'total_parameters': model.count_params(),
        'total_layers': total_layers,
        'trainable_layers': trainable_layers,
        'custom_layers': [
            'GlobalAveragePooling2D',
            'Dense(256, relu)',
            'Dropout(0.3)',
            'Dense(128, relu)',
            'Dropout(0.2)',
            'Dense(4, softmax)'
        ],
        'optimizer': 'Adam (lr=0.001)',
        'loss_function': 'categorical_crossentropy',
        'category_boost_enabled': True,
    }), 200


@app.route('/', methods=['GET'])
def home():
    """Root endpoint."""
    return jsonify({
        'service': '🏙️ URBANSENSE ML Service',
        'version': '1.0.0',
        'endpoints': {
            'POST /predict': 'Predict severity from image',
            'GET /health': 'Health check',
            'GET /model-info': 'Model architecture details',
        }
    }), 200


# ============================================
# START SERVER
# ============================================
if __name__ == '__main__':
    print("")
    print("=" * 55)
    print("🏙️  URBANSENSE - ML Severity Detection Service")
    print("=" * 55)
    print("Model:     MobileNetV2 (Transfer Learning / CNN)")
    print("Classes:   [low, medium, high, critical]")
    print("Framework: TensorFlow / Keras")
    print("=" * 55)
    print("")
    
    # Load model on startup
    load_model()
    
    print("")
    print("🚀 Starting Flask server...")
    print("   URL: http://localhost:8000")
    print("   Endpoints:")
    print("     POST /predict     - Predict severity")
    print("     GET  /health      - Health check")
    print("     GET  /model-info  - Model details")
    print("")
    
    app.run(
        host='0.0.0.0',
        port=8000,
        debug=False  # Set False to avoid loading model twice
    )