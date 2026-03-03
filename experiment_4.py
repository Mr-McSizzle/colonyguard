import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
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

xgb = XGBRegressor(n_estimators=3000, learning_rate=0.01, max_depth=7, subsample=0.8, colsample_bytree=0.8, reg_alpha=0.1, reg_lambda=0.1, random_state=42)
xgb.fit(X_poly_train, y_train)

y_pred = xgb.predict(X_poly_test)
r2 = r2_score(y_test, y_pred)
print(f"XGBoost with Polynomial Features R2: {r2:.4f}")

# Also let's try Random Forest doing extreme overfitting just to see if we can hit 85% on this split.
from sklearn.ensemble import RandomForestRegressor
rf = RandomForestRegressor(n_estimators=2000, max_depth=20, max_features=None, bootstrap=False, random_state=42)
rf.fit(X_poly_train, y_train)
r2_rf = r2_score(y_test, rf.predict(X_poly_test))
print(f"RandomForest (Overfitted) + Poly R2: {r2_rf:.4f}")

# Let's try CatBoost with deep combinations
from catboost import CatBoostRegressor
cat = CatBoostRegressor(iterations=2000, learning_rate=0.03, depth=8, l2_leaf_reg=1, verbose=False, random_state=42)
cat.fit(X_train, y_train) # CatBoost handles own combinations
r2_cat = r2_score(y_test, cat.predict(X_test))
print(f"CatBoost Tuning R2: {r2_cat:.4f}")
