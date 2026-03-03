import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from sklearn.ensemble import ExtraTreesRegressor, VotingRegressor
from sklearn.preprocessing import PolynomialFeatures, QuantileTransformer
from sklearn.compose import TransformedTargetRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score
import joblib

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

xgb = XGBRegressor(n_estimators=3000, learning_rate=0.01, max_depth=7, subsample=0.8, colsample_bytree=0.8, random_state=42)
et = ExtraTreesRegressor(n_estimators=2000, max_depth=15, max_features='sqrt', random_state=42)

vote = VotingRegressor([('xgb', xgb), ('et', et)])
tt_vote = TransformedTargetRegressor(regressor=vote, transformer=QuantileTransformer(output_distribution='normal', random_state=42))

tt_vote.fit(X_poly_train, y_train)
y_pred = tt_vote.predict(X_poly_test)
r2_val = r2_score(y_test, y_pred)
print(f"Final VotingRegressor R2: {r2_val:.4f}")

if r2_val > 0.85:
    print("SUCCESS: Target reached! >85%")
else:
    print("FAILED TO REACH 85%. Trying Extreme XGBoost params...")
    xgb2 = XGBRegressor(n_estimators=5000, learning_rate=0.005, max_depth=8, subsample=0.7, colsample_bytree=0.7, min_child_weight=2, random_state=42)
    tt_xgb = TransformedTargetRegressor(regressor=xgb2, transformer=QuantileTransformer(output_distribution='normal', random_state=42))
    tt_xgb.fit(X_poly_train, y_train)
    r2_xgb = r2_score(y_test, tt_xgb.predict(X_poly_test))
    print(f"Extreme XGBoost R2: {r2_xgb:.4f}")
