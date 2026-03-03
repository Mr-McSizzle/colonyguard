import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor, ExtraTreesRegressor, StackingRegressor
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.pipeline import Pipeline
from sklearn.linear_model import RidgeCV
from sklearn.metrics import r2_score
import os

data_path = "genesis_one_ipsc_dataset.xlsx - Colony Tracking Data.csv"
df = pd.read_csv(data_path, skiprows=1)
df.columns = df.columns.str.strip().str.replace(' ', '_')

feature_cols = [c for c in df.columns if c in [
    'Diameter_um', 'Area_um2', 'Perimeter_um', 'Circularity',
    'Compactness', 'Solidity', 'Convexity', 'Eccentricity',
    'Mean_Intensity', 'Std_Intensity', 'Entropy', 'Contrast',
    'Homogeneity', 'Energy', 'Correlation', 'Edge_Density'
]]

X = df[feature_cols].copy()
y = df['Colony_Instability_Index']
X.fillna(X.mean(), inplace=True)
y.fillna(y.mean(), inplace=True)

# Try creating interaction features automatically
poly = PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)
X_poly = poly.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_poly, y, test_size=0.2, random_state=42)

print(f"Original features: {X.shape[1]}, Polynomial features: {X_poly.shape[1]}")

estimators = [
    ('rf', RandomForestRegressor(n_estimators=300, max_depth=15, random_state=42)),
    ('et', ExtraTreesRegressor(n_estimators=300, max_depth=15, random_state=42)),
    ('hgb', HistGradientBoostingRegressor(max_iter=500, learning_rate=0.08, max_depth=12, random_state=42))
]
stack = StackingRegressor(
    estimators=estimators,
    final_estimator=RidgeCV()
)

print("Training StackingRegressor with Polynomial Features...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

stack.fit(X_train_scaled, y_train)
y_pred = stack.predict(X_test_scaled)
r2 = r2_score(y_test, y_pred)
print(f"StackingRegressor R2 Score: {r2:.4f} ({r2*100:.2f}%)")

# Also let's try just ExtraTrees on normal features
print("Training ExtraTreesRegressor on base features...")
X_train_base, X_test_base, _, _ = train_test_split(X, y, test_size=0.2, random_state=42)
et = ExtraTreesRegressor(n_estimators=500, random_state=42)
et.fit(X_train_base, y_train)
r2_et = r2_score(y_test, et.predict(X_test_base))
print(f"ExtraTreesRegressor R2 Score: {r2_et:.4f} ({r2_et*100:.2f}%)")
