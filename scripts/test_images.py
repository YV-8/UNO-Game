import cv2
import numpy as np
import os

def analyze_image(path):
    if not os.path.exists(path):
        return f"{path} not found"
    img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return f"{path} failed to load"
    
    # thresholding
    _, thresh = cv2.threshold(img, 240, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # filter small noise
    valid_contours = [c for c in contours if cv2.contourArea(c) > 1000]
    
    return f"{os.path.basename(path)}: {len(valid_contours)} cards found"

files = [
    'frontend/src/assets/yellowCards.jpeg',
    'frontend/src/assets/greenCards.jpeg',
    'frontend/src/assets/redCards.jpeg',
    'frontend/src/assets/blueCards.jpeg',
    'frontend/src/assets/specialCards.jpeg'
]

for f in files:
    print(analyze_image(f))
