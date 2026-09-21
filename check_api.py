import json
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import pandas as pd


project_root = Path(__file__).resolve().parent

sample = pd.read_csv(
    project_root / "data/raw/UNSW_NB15_testing-set.csv",
    nrows=3
)

# Send only model inputs, without correct answers
sample = sample.drop(
    columns=["id", "label", "attack_cat", "is_ftp_login"]
)

payload = {
    "records": sample.to_dict(orient="records")
}

request = Request(
    "http://127.0.0.1:8000/predict",
    data=json.dumps(payload, allow_nan=False).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST"
)

try:
    with urlopen(request, timeout=60) as response:
        result = json.load(response)
        print(json.dumps(result, indent=2))
except HTTPError as error:
    print("HTTP status:", error.code)
    print(error.read().decode("utf-8"))
    raise