import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import ExtraTreesRegressor, VotingRegressor, HistGradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
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

# Neural Network Setup
mlp = Pipeline([
    ('scaler', StandardScaler()),
    ('mlp', MLPRegressor(hidden_layer_sizes=(256, 128, 64), max_iter=2000, learning_rate_init=0.001, early_stopping=True, random_state=42))
])

# Voting Regressor
voting = VotingRegressor([
    ('et', ExtraTreesRegressor(n_estimators=500, max_depth=20, max_features='sqrt', random_state=42)),
    ('hgb', HistGradientBoostingRegressor(max_iter=1000, learning_rate=0.05, max_depth=10, random_state=42)),
    ('mlp', mlp)
])

print("Training ExtraTrees with depth and sqrt features...")
et2 = ExtraTreesRegressor(n_estimators=1000, max_depth=25, max_features='sqrt', random_state=42)
et2.fit(X_train, y_train)
y_pred_et = et2.predict(X_test)
print(f"Optimized ExtraTrees R2: {r2_score(y_test, y_pred_et):.4f}")

print("Training Deep Neural Network (MLP)...")
mlp.fit(X_train, y_train)
y_pred_mlp = mlp.predict(X_test)
print(f"MLPRegressor R2: {r2_score(y_test, y_pred_mlp):.4f}")

print("Training Multi-Algorithm Voting Regressor...")
voting.fit(X_train, y_train)
y_pred_vote = voting.predict(X_test)
print(f"VotingRegressor R2: {r2_score(y_test, y_pred_vote):.4f}")
