import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from catboost import CatBoostRegressor
from sklearn.ensemble import ExtraTreesRegressor, StackingRegressor
from sklearn.preprocessing import PolynomialFeatures, QuantileTransformer
from sklearn.compose import TransformedTargetRegressor
from sklearn.pipeline import Pipeline
from sklearn.linear_model import RidgeCV
from sklearn.metrics import r2_score

data_path = "genesis_one_ipsc_dataset.xlsx - Colony Tracking Data.csv"
df = pd.read_csv(data_path, skiprows=1)
df.columns = df.columns.str.strip().str.replace(' ', '_')

feature_cols_all = [
    'Diameter_um', 'Area_um2', 'Perimeter_um', 'Circularity',
    'Compactness', 'Solidity', 'Convexity', 'Eccentricity',
    'Mean_Intensity', 'Std_Intensity', 'Entropy', 'Contrast',
    'Homogeneity', 'Energy', 'Correlation', 'Edge_Density'
]
feature_cols = [c for c in df.columns if c in feature_cols_all]

df = df.dropna(subset=['Colony_Instability_Index'])
X = df[feature_cols].copy()
y = df['Colony_Instability_Index']

X.fillna(X.mean(), inplace=True)
y.fillna(y.mean(), inplace=True)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

poly = PolynomialFeatures(degree=2, interaction_only=False, include_bias=False)
X_poly_train = poly.fit_transform(X_train)
X_poly_test = poly.transform(X_test)

# Base models
xgb = XGBRegressor(n_estimators=3000, learning_rate=0.01, max_depth=6, subsample=0.8, colsample_bytree=0.8, random_state=42)
lgb = LGBMRegressor(n_estimators=2000, learning_rate=0.02, max_depth=8, num_leaves=31, subsample=0.8, colsample_bytree=0.8, random_state=42, verbose=-1)
cat = CatBoostRegressor(iterations=2000, learning_rate=0.03, depth=6, random_state=42, verbose=False)
et = ExtraTreesRegressor(n_estimators=1000, max_depth=20, max_features='sqrt', random_state=42)

# Meta model
estimators = [
    ('xgb', xgb),
    ('lgb', lgb),
    ('cat', cat),
    ('et', et)
]

stack = StackingRegressor(
    estimators=estimators,
    final_estimator=RidgeCV(),
    passthrough=False
)

# Target Transformer
tt_stack = TransformedTargetRegressor(
    regressor=stack,
    transformer=QuantileTransformer(output_distribution='normal', random_state=42)
)

print("Training Mega Stacking Ensemble (XGB, LGB, CatBoost, ET)...")
tt_stack.fit(X_poly_train, y_train)

y_pred = tt_stack.predict(X_poly_test)
r2_val = r2_score(y_test, y_pred)
print(f"Final Maximum Stacking R2: {r2_val:.4f} ({r2_val*100:.2f}%)")
