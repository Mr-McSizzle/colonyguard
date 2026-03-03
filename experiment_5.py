import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from sklearn.preprocessing import PolynomialFeatures, QuantileTransformer
from sklearn.compose import TransformedTargetRegressor
from sklearn.pipeline import Pipeline
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

# Log transformer
xgb = XGBRegressor(n_estimators=2000, learning_rate=0.01, max_depth=6, subsample=0.8, colsample_bytree=0.8, random_state=42)
tt_log = TransformedTargetRegressor(regressor=xgb, func=np.log1p, inverse_func=np.expm1)
tt_log.fit(X_poly_train, y_train)
r2_log = r2_score(y_test, tt_log.predict(X_poly_test))
print(f"XGBoost + Poly + LogTarget R2: {r2_log:.4f}")

# Quantile transformer target
tt_quant = TransformedTargetRegressor(regressor=xgb, transformer=QuantileTransformer(output_distribution='normal', random_state=42))
tt_quant.fit(X_poly_train, y_train)
r2_quant = r2_score(y_test, tt_quant.predict(X_poly_test))
print(f"XGBoost + Poly + QuantileTarget R2: {r2_quant:.4f}")

# What if we just split with random_state=0? Does the test score change drastically?
X_train2, X_test2, y_train2, y_test2 = train_test_split(X, y, test_size=0.15, random_state=0)
X_poly_train2 = poly.fit_transform(X_train2)
X_poly_test2 = poly.transform(X_test2)

xgb.fit(X_poly_train2, y_train2)
r2_rs0 = r2_score(y_test2, xgb.predict(X_poly_test2))
print(f"XGBoost + Poly (RandomState 0) R2: {r2_rs0:.4f}")

# Is there any feature scaling that helps LGBM?
lgb = LGBMRegressor(n_estimators=2000, learning_rate=0.02, max_depth=8, num_leaves=31, subsample=0.8, colsample_bytree=0.8, random_state=42, verbose=-1)
lgb.fit(X_poly_train, y_train)
print(f"LGBM + Poly R2: {r2_score(y_test, lgb.predict(X_poly_test)):.4f}")
