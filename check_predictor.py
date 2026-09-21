from pathlib import Path

import numpy as np
import pandas as pd

from src.predictor import NetGuardPredictor


project_root = Path(__file__).resolve().parent

sample = pd.read_csv(
    project_root / "data/raw/UNSW_NB15_testing-set.csv",
    nrows=10
)

predictor = NetGuardPredictor()

results = predictor.predict(sample)

binary_pipeline = predictor.binary["pipeline"]

attack_column = list(
    binary_pipeline.named_steps["classifier"].classes_
).index(1)

expected_scores = binary_pipeline.predict_proba(
    sample[predictor.input_columns]
)[:, attack_column]

np.testing.assert_allclose(
    results["attack_score"].to_numpy(),
    expected_scores
)

normal_rows = results["binary_prediction"] == "Normal"
attack_rows = ~normal_rows

assert results.loc[
    normal_rows, "predicted_category"
].isna().all()

assert results.loc[
    attack_rows, "predicted_category"
].notna().all()

assert len(results) == len(sample)

print(results.round(4).to_string(index=False))
print("\nPredictor integration check passed")