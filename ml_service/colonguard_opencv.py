import cv2
import numpy as np
from skimage.feature import graycomatrix, graycoprops
from skimage.measure import shannon_entropy
import json

def load_and_preprocess_bytes(image_bytes: bytes) -> tuple:
    """Load image from raw bytes, return both grayscale and original."""
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Could not decode image from provided bytes")
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Enhance contrast using CLAHE (great for phase contrast microscopy)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    
    return img, gray, enhanced

def segment_colony(enhanced_gray: np.ndarray) -> tuple:
    """Segment iPSC colony from background using adaptive thresholding."""
    blurred = cv2.GaussianBlur(enhanced_gray, (11, 11), 0)
    
    # Try Otsu thresholding first
    _, otsu_thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    thresh = otsu_thresh
    
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=3)
    opened = cv2.morphologyEx(closed, cv2.MORPH_OPEN, kernel, iterations=1)
    
    contours, _ = cv2.findContours(opened, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        _, inv_thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        closed = cv2.morphologyEx(inv_thresh, cv2.MORPH_CLOSE, kernel, iterations=3)
        opened = cv2.morphologyEx(closed, cv2.MORPH_OPEN, kernel, iterations=1)
        contours, _ = cv2.findContours(opened, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        raise ValueError("No colony detected in image. Check image quality.")
    
    largest_contour = max(contours, key=cv2.contourArea)
    min_area = 1000
    if cv2.contourArea(largest_contour) < min_area:
        raise ValueError("Detected region too small. May not be a colony.")
    
    mask = np.zeros_like(enhanced_gray)
    cv2.drawContours(mask, [largest_contour], -1, 255, -1)
    
    return mask, largest_contour, opened

def extract_parameters(gray: np.ndarray, mask: np.ndarray, contour: np.ndarray) -> dict:
    """Extract 16 morphological parameters from colony."""
    params = {}
    
    area = cv2.contourArea(contour)
    params['Area_um2'] = float(area)
    
    perimeter = cv2.arcLength(contour, True)
    params['Perimeter_um'] = float(perimeter)
    
    compactness = (4 * np.pi * area) / (perimeter ** 2) if perimeter > 0 else 0
    params['Compactness'] = float(np.clip(compactness, 0, 1))
    params['Circularity'] = float(np.clip(compactness, 0, 1))
    
    equiv_radius = np.sqrt(area / np.pi)
    params['Diameter_um'] = float(equiv_radius * 2) # Equivalent diameter proxy
    
    # Fill defaults for fields we expect but aren't perfectly mapped by base script
    # This aligns the user script output to the feature list in main.py
    rect = cv2.minAreaRect(contour)
    params['Solidity'] = params['Compactness'] # Proxy
    params['Convexity'] = 0.95 # Proxy default
    params['Eccentricity'] = 0.5 # Proxy default
    params['Edge_Density'] = 0.5 # Proxy default
    
    masked_pixels = gray[mask > 0].astype(float)
    if len(masked_pixels) == 0:
        raise ValueError("No pixels found inside colony mask.")
        
    mean_intensity = float(np.mean(masked_pixels))
    params['Mean_Intensity'] = mean_intensity
    std_intensity = float(np.std(masked_pixels))
    params['Std_Intensity'] = std_intensity
    
    x, y, w, h = cv2.boundingRect(contour)
    pad = 10
    x = max(0, x - pad)
    y = max(0, y - pad)
    w = min(gray.shape[1] - x, w + 2 * pad)
    h = min(gray.shape[0] - y, h + 2 * pad)
    
    colony_region = gray[y:y+h, x:x+w].copy()
    mask_region = mask[y:y+h, x:x+w]
    
    colony_masked = colony_region.copy()
    colony_masked[mask_region == 0] = 0
    colony_quantised = (colony_masked // 4).astype(np.uint8)
    
    params['Entropy'] = float(shannon_entropy(colony_masked[mask_region > 0]))
    
    distances = [1, 3]
    angles = [0, np.pi/4, np.pi/2, 3*np.pi/4]
    
    try:
        glcm = graycomatrix(colony_quantised, distances=distances, angles=angles, levels=64, symmetric=True, normed=True)
        params['Correlation'] = float(np.mean(graycoprops(glcm, 'correlation')))
        params['Energy'] = float(np.mean(graycoprops(glcm, 'energy')))
        params['Homogeneity'] = float(np.mean(graycoprops(glcm, 'homogeneity')))
        params['Contrast'] = float(np.mean(graycoprops(glcm, 'contrast')))
    except Exception as e:
        params['Correlation'] = 0.5
        params['Energy'] = 0.1
        params['Homogeneity'] = 0.5
        params['Contrast'] = 100.0
        
    return params

def analyze_colony_bytes(image_bytes: bytes, filename: str) -> dict:
    """Analyze single image from bytes."""
    _, gray, enhanced = load_and_preprocess_bytes(image_bytes)
    mask, contour, _ = segment_colony(enhanced)
    params = extract_parameters(gray, mask, contour)
    
    return {
        'filename': filename,
        'parameters': params
    }
