from pathlib import Path

import joblib
import numpy as np
import pandas as pd


class NetGuardPredictor:
    def __init__(self, model_directory=None):
        project_root = Path(__file__).resolve().parents[1]

        model_directory = (
            Path(model_directory)
            if model_directory is not None
            else project_root / "models"
        )

        self.binary = joblib.load(
            model_directory / "binary_rf_baseline.joblib"
        )
        self.category = joblib.load(
            model_directory / "attack_category_rf.joblib"
        )
        self.anomaly = joblib.load(
            model_directory / "anomaly_isolation_forest.joblib"
        )

        self.input_columns = self.binary["input_columns"]
        self.categorical_columns = ["proto", "service", "state"]
        self.numeric_columns = [
            column
            for column in self.input_columns
            if column not in self.categorical_columns
        ]

    def validate_input(self, records):
        if not isinstance(records, pd.DataFrame):
            raise TypeError("Input must be a pandas DataFrame.")

        if records.empty:
            raise ValueError("Input contains no records.")

        if records.columns.duplicated().any():
            raise ValueError("Input contains duplicate column names.")

        required_columns = set(self.input_columns)
        required_columns.update(self.category["input_columns"])
        required_columns.update(self.anomaly["input_columns"])

        missing = sorted(required_columns - set(records.columns))

        if missing:
            raise ValueError(f"Missing required columns: {missing}")

        # Extra columns such as id and labels are not model inputs.
        features = records.loc[:, self.input_columns].copy()

        for column in self.numeric_columns:
            features[column] = pd.to_numeric(
                features[column], errors="raise"
            )

        numeric_values = features[
            self.numeric_columns
        ].to_numpy(dtype=float)

        if not np.isfinite(numeric_values).all():
            raise ValueError(
                "Numeric features must not contain missing or infinite values."
            )

        for column in self.categorical_columns:
            values = features[column]

            if values.isna().any():
                raise ValueError(f"Missing values in '{column}'.")

            if not values.map(
                lambda value: isinstance(value, str)
            ).all():
                raise ValueError(f"'{column}' must contain text values.")

            if values.str.strip().eq("").any():
                raise ValueError(f"Empty values in '{column}'.")

        return features

    def predict(self, records):
        features = self.validate_input(records)

        binary_pipeline = self.binary["pipeline"]

        attack_column = list(
            binary_pipeline.named_steps["classifier"].classes_
        ).index(1)

        binary_scores = binary_pipeline.predict_proba(
            features[self.binary["input_columns"]]
        )[:, attack_column]

        binary_flags = binary_scores >= self.binary["threshold"]

        # A category is assigned only when the binary model flags an attack.
        categories = np.full(len(features), None, dtype=object)
        category_scores = np.full(len(features), np.nan)

        if binary_flags.any():
            category_pipeline = self.category["pipeline"]

            probabilities = category_pipeline.predict_proba(
                features.loc[
                    binary_flags,
                    self.category["input_columns"]
                ]
            )

            classes = category_pipeline.named_steps[
                "classifier"
            ].classes_

            winning_indices = probabilities.argmax(axis=1)

            categories[binary_flags] = classes[winning_indices]
            category_scores[binary_flags] = probabilities[
                np.arange(len(probabilities)),
                winning_indices
            ]

        anomaly_scores = -self.anomaly["pipeline"].score_samples(
            features[self.anomaly["input_columns"]]
        )

        anomaly_flags = anomaly_scores > self.anomaly["threshold"]

        return pd.DataFrame({
            "binary_prediction": np.where(
                binary_flags, "Attack", "Normal"
            ),
            "attack_score": binary_scores,
            "predicted_category": categories,
            "category_score": category_scores,
            "anomaly_score": anomaly_scores,
            "anomaly_warning": anomaly_flags
        }, index=records.index)