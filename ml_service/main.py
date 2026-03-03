import os
import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from xgboost import XGBRegressor
from sklearn.preprocessing import PolynomialFeatures, QuantileTransformer
from sklearn.compose import TransformedTargetRegressor
from sklearn.pipeline import Pipeline
from typing import List
from colonguard_opencv import analyze_colony_bytes
import time
import random

app = FastAPI(title="ColonyGuard ML Service")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to frontend domain natively
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for the model
model = None

# Defining exact required model features
FEATURE_NAMES = [
    'Diameter_um', 'Area_um2', 'Perimeter_um', 'Circularity',
    'Compactness', 'Solidity', 'Convexity', 'Eccentricity',
    'Mean_Intensity', 'Std_Intensity', 'Entropy', 'Contrast',
    'Homogeneity', 'Energy', 'Correlation', 'Edge_Density'
]

ACTIVE_FEATURES = []

# Validation schema
class ColonyMetrics(BaseModel):
    Diameter_um: float
    Area_um2: float
    Perimeter_um: float
    Circularity: float
    Compactness: float
    Solidity: float
    Convexity: float
    Eccentricity: float
    Mean_Intensity: float
    Std_Intensity: float
    Entropy: float
    Contrast: float
    Homogeneity: float
    Energy: float
    Correlation: float
    Edge_Density: float

@app.on_event("startup")
def load_and_train_model():
    global model
    try:
        # Load dataset from parent directory (root App) safely
        data_path = os.path.join(os.path.dirname(__file__), "..", "genesis_one_ipsc_dataset.xlsx - Colony Tracking Data.csv")
        
        print("Initializing ML service & parsing dataset...")
        df = pd.read_csv(data_path, skiprows=1)

        # Preprocess mapping strictly for the active features and Target
        df = df.dropna(subset=['Colony Instability Index'])
        
        # Map known missing spaces to underscores for compatibility
        rename_map = {
            'Diameter um': 'Diameter_um',
            'Area um2': 'Area_um2',
            'Perimeter um': 'Perimeter_um',
            'Shape Factor': 'Circularity',
            'Mean Intensity': 'Mean_Intensity',
            'StdDev Intensity': 'Std_Intensity'
        }
        df = df.rename(columns=rename_map)

        # Dynamically extract intersection of features
        global ACTIVE_FEATURES
        ACTIVE_FEATURES = [f for f in FEATURE_NAMES if f in df.columns]

        # Ensure all columns exist, parse to numeric safely
        for col in ACTIVE_FEATURES + ['Colony Instability Index']:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Drop rows where any of the critical training features are NaN
        df = df.dropna(subset=ACTIVE_FEATURES + ['Colony Instability Index'])
        
        X = df[ACTIVE_FEATURES]
        y = df['Colony Instability Index']
        
        print(f"Dataset successfully compiled! Training RandomForest on {len(df)} samples...")
        
        # Fit logic natively in-memory cache
        # Replaced base RF/Hist arrays with robust XGBoost wrapped in Polynomial Feature Transformers and Quantile Target mapping 
        xgb = XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42)
        tt_xgb = TransformedTargetRegressor(regressor=xgb, transformer=QuantileTransformer(output_distribution='normal', random_state=42))
        
        pipeline = Pipeline([
            ('engine', tt_xgb)
        ])
        
        pipeline.fit(X, y)
        
        model = pipeline
        print("Complex XGBoost+Quantile Pipeline trained and cached to global context natively!")
    except Exception as e:
        print(f"Error initializing model securely: {e}")
        # In actual prod, we might fallback to a pre-trained .pkl if training fails
        model = None

@app.post("/predict")
def predict_score(metrics: ColonyMetrics):
    global model
    if model is None:
        raise HTTPException(status_code=503, detail="ML Model currently unavailable or uninitialized")
    
    try:
        # Extract features purely in matching sequence array natively
        input_dict = metrics.dict()
        input_data = [[input_dict[f] for f in ACTIVE_FEATURES]]
        
        # Run inference synchronously
        prediction = model.predict(input_data)[0]
        
        return {
            "predicted_cii": float(prediction),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")

@app.get("/health")
def health_check():
    return {
        "status": "active",
        "model_loaded": model is not None
    }

@app.post("/analyze_images")
async def analyze_images(files: List[UploadFile] = File(...)):
    global model
    if model is None:
        raise HTTPException(status_code=503, detail="ML Model not strictly initialized")
        
    try:
        colonies_map = {}
        
        for file in files:
            contents = await file.read()
            # 1. Run OpenCV extraction
            cv_results = analyze_colony_bytes(contents, file.filename)
            params = cv_results['parameters']
            
            # 2. Re-arrange params for XGBoost predictor pipeline dynamically
            input_data = [[params.get(f, 0) for f in ACTIVE_FEATURES]]
            prediction = float(model.predict(input_data)[0])
            
            # Compile metric block tracking Day 1
            colony_id = f"COL_NEW_{random.randint(1000, 9999)}"
            metrics = {
                **params,
                'Day': 1,
                'Colony Instability Index': prediction
            }
            
            colonies_map[colony_id] = {
                'id': colony_id,
                'metrics': [metrics]
            }
            
        return {
            "colonies": colonies_map,
            "summary": {"total": len(files)}
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image Analysis failed: {str(e)}")
