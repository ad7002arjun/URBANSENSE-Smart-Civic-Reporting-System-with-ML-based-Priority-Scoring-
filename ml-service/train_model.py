"""
URBANSENSE - CNN Model Training Script
Uses MobileNetV2 with Transfer Learning for urban issue severity classification.
"""

import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import numpy as np
import os


def create_model():
    """
    Create MobileNetV2-based severity classification model.
    
    Architecture:
    - MobileNetV2 (pretrained on ImageNet) as feature extractor
    - Global Average Pooling
    - Dense layers for classification
    - Output: 4 severity classes (low, medium, high, critical)
    """
    
    print("📦 Loading MobileNetV2 pretrained weights...")
    
    # Load pretrained MobileNetV2 (Transfer Learning)
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(224, 224, 3)
    )
    
    # Freeze base model layers (Transfer Learning)
    base_model.trainable = False
    
    # Add custom classification head
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.3)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.2)(x)
    predictions = Dense(4, activation='softmax')(x)  # 4 severity classes
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    # Compile model
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print("✅ Model Architecture Created Successfully")
    print(f"   Total Parameters: {model.count_params():,}")
    print(f"   Trainable Parameters: {sum(tf.keras.backend.count_params(w) for w in model.trainable_weights):,}")
    
    return model


def generate_demo_data(num_samples=200):
    """
    Generate synthetic training data for demonstration.
    
    In a real project, you would use actual urban issue images:
    - Pothole images
    - Garbage dump images
    - Broken streetlight images
    - Sewage overflow images
    """
    print(f"📦 Generating {num_samples} synthetic training samples...")
    
    # Random images (224x224x3) - simulating urban issue images
    X = np.random.rand(num_samples, 224, 224, 3).astype('float32')
    
    # Labels: 0=low, 1=medium, 2=high, 3=critical
    # Weighted distribution (more medium/high cases)
    weights = [0.2, 0.35, 0.3, 0.15]
    y_indices = np.random.choice(4, num_samples, p=weights)
    y = tf.keras.utils.to_categorical(y_indices, num_classes=4)
    
    print(f"   Distribution: low={sum(y_indices==0)}, medium={sum(y_indices==1)}, high={sum(y_indices==2)}, critical={sum(y_indices==3)}")
    
    return X, y


def train_and_save():
    """Train the model and save it."""
    
    print("\n" + "=" * 55)
    print("🏙️  URBANSENSE - CNN Severity Classification Model")
    print("=" * 55)
    print("Architecture: MobileNetV2 + Custom Classification Head")
    print("Technique:    Transfer Learning (ImageNet weights)")
    print("Classes:      [low, medium, high, critical]")
    print("Input Shape:  224 x 224 x 3 (RGB)")
    print("=" * 55 + "\n")
    
    # Create model
    model = create_model()
    
    # Generate demo training data
    print("\n📊 Preparing Training Data...")
    X_train, y_train = generate_demo_data(200)
    X_val, y_val = generate_demo_data(50)
    
    print("\n🏋️  Training Model...")
    print("-" * 40)
    
    # Train (few epochs for demo - enough to create a working model)
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=5,
        batch_size=16,
        verbose=1
    )
    
    # Print training results
    print("\n📈 Training Results:")
    print(f"   Final Training Accuracy:   {history.history['accuracy'][-1]:.4f}")
    print(f"   Final Validation Accuracy: {history.history['val_accuracy'][-1]:.4f}")
    print(f"   Final Training Loss:       {history.history['loss'][-1]:.4f}")
    print(f"   Final Validation Loss:     {history.history['val_loss'][-1]:.4f}")
    
    # Save model
    os.makedirs('model', exist_ok=True)
    
    model_path = 'model/urbansense_model.h5'
    model.save(model_path)
    print(f"\n✅ Model saved to {model_path}")
    
    # Get file size
    file_size = os.path.getsize(model_path) / (1024 * 1024)
    print(f"   Model file size: {file_size:.1f} MB")
    
    # Test prediction
    print("\n🔍 Testing Model Prediction...")
    test_image = np.random.rand(1, 224, 224, 3).astype('float32')
    prediction = model.predict(test_image, verbose=0)
    classes = ['low', 'medium', 'high', 'critical']
    predicted_class = classes[np.argmax(prediction[0])]
    confidence = np.max(prediction[0])
    print(f"   Test Prediction: {predicted_class} (confidence: {confidence:.4f})")
    print(f"   All Probabilities: {dict(zip(classes, [f'{p:.4f}' for p in prediction[0]]))}")
    
    return model, history


if __name__ == '__main__':
    train_and_save()
    print("\n🎉 Model Training Complete!")
    print("   You can now start the ML service: python app.py")