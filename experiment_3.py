import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from catboost import CatBoostRegressor
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

print("Training XGBoost...")
xgb = XGBRegressor(n_estimators=1000, learning_rate=0.05, max_depth=6, random_state=42)
xgb.fit(X_train, y_train)
print(f"XGBoost R2: {r2_score(y_test, xgb.predict(X_test)):.4f}")

print("Training LightGBM...")
lgb = LGBMRegressor(n_estimators=1000, learning_rate=0.05, max_depth=6, random_state=42)
lgb.fit(X_train, y_train)
print(f"LightGBM R2: {r2_score(y_test, lgb.predict(X_test)):.4f}")

print("Training CatBoost...")
cat = CatBoostRegressor(iterations=1000, learning_rate=0.05, depth=6, random_state=42, verbose=False)
cat.fit(X_train, y_train)
print(f"CatBoost R2: {r2_score(y_test, cat.predict(X_test)):.4f}")
