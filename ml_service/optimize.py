import pandas as pd
import os
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import r2_score

data_path = os.path.join(os.path.dirname(__file__), "..", "genesis_one_ipsc_dataset.xlsx - Colony Tracking Data.csv")
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

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Try Gradient Boosting
gb = GradientBoostingRegressor(random_state=42)
param_grid = {
    'n_estimators': [100, 300, 500],
    'learning_rate': [0.01, 0.05, 0.1, 0.2],
    'max_depth': [3, 5, 8, -1],
    'subsample': [0.8, 1.0]
}
print("GridSearchCV starting for GradientBoosting...")
grid = GridSearchCV(gb, param_grid, cv=3, scoring='r2', n_jobs=-1)
grid.fit(X_train, y_train)

best_gb = grid.best_estimator_
y_pred = best_gb.predict(X_test)
print(f"Best GB Params: {grid.best_params_}")
print(f"Best GB R2: {r2_score(y_test, y_pred):.4f}")

# Try Random Forest as backup
rf = RandomForestRegressor(random_state=42)
param_grid_rf = {
    'n_estimators': [100, 300, 500],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5],
    'max_features': ['auto', 'sqrt']
}
print("GridSearchCV starting for RandomForest...")
grid_rf = GridSearchCV(rf, param_grid_rf, cv=3, scoring='r2', n_jobs=-1)
grid_rf.fit(X_train, y_train)

best_rf = grid_rf.best_estimator_
y_pred_rf = best_rf.predict(X_test)
print(f"Best RF Params: {grid_rf.best_params_}")
print(f"Best RF R2: {r2_score(y_test, y_pred_rf):.4f}")
