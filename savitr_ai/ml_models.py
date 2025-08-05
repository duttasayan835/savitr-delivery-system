import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, OrdinalEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_curve, auc, precision_recall_curve, average_precision_score
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.impute import SimpleImputer

df = pd.read_csv("Post.csv")

time_slots = [
    '10:00 AM - 12:00 PM',
    '12:00 PM - 03:00 PM',
    '03:00 PM - 05:00 PM'
]

df['shipping_delay'] = df['Days for shipping (real)'] - df['Days for shipment (scheduled)']

user_id_mapping = df.groupby('User ID')['Machine Prediction'].apply(lambda x: x.mode()[0] if not x.mode().empty else None)
df['user_id_encoded'] = df['User ID'].map(user_id_mapping)

numeric_features = [
    'Days for shipping (real)',
    'Days for shipment (scheduled)',
    'Order Item Quantity',
    'shipping_delay'
]

categorical_features = [
    'Delivery Status',
    'Customer Segment',
    'Shipping Mode',
    'user_id_encoded'
]

ordinal_features = [
    'Admin Recomended Slots/Previous Optimized Delivered Slots',
    'Parcel Delivered in This Slot'
]

numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

ordinal_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('ordinal', OrdinalEncoder(categories=[time_slots] * len(ordinal_features)))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features),
        ('ord', ordinal_transformer, ordinal_features)
    ],
    remainder='drop'
)

y = df['Machine Prediction']
y_encoder = OrdinalEncoder(categories=[time_slots])
y_encoded = y_encoder.fit_transform(y.values.reshape(-1, 1)).ravel()

models = {
    'Logistic Regression': LogisticRegression(
            class_weight='balanced',
            max_iter=1000,
            random_state=42
        ),
    'K-Nearest Neighbors': KNeighborsClassifier(n_neighbors=3),
    'Random Forest': RandomForestClassifier(n_estimators=100, max_features="log2", random_state=42),
    'XGBoost': xgb.XGBClassifier(
            objective='multi:softprob',
            learning_rate=0.1,
            max_depth=1,
            n_estimators=100,
            random_state=42,
            eval_metric='mlogloss'
        )
}

pipelines = {name: Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', model)
]) for name, model in models.items()}