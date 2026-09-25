# Network Traffic Analyser

A machine learning prototype for analyzing prepared network traffic records. Network Traffic Analyser predicts whether a flow is normal or an attack, assigns a known attack category to flows predicted as attacks, and provides an independent anomaly warning.

Built with React, FastAPI and scikit-learn using the UNSW-NB15 dataset.

> Research and portfolio prototype. This application does not capture live traffic or block connections. Predictions require review: the binary model has a high false-positive rate on the official test set.

## Features

- CSV import, input validation and preview.
- Batch analysis of 1–100 records with 41 input features.
- Binary predictions, predicted attack categories and independent anomaly warnings.
- JSON result export.
- Responsive interface with fixed navigation and a mobile menu.
- Saved preprocessing/model pipelines loaded once at API startup.

## Technology

| Layer | Technologies |
| --- | --- |
| Interface | React, Vite, CSS |
| API | Python, FastAPI, Uvicorn, Pydantic |
| Machine learning | scikit-learn, pandas, NumPy, SciPy, joblib |
| File parsing | Papa Parse |
| Analysis | Jupyter notebooks, Matplotlib, Seaborn |

Development used Python 3.13.5 and Node.js 22.17.0. Use the same scikit-learn version and compatible dependencies used to save the model artifacts.

## Project structure

    netguard_ai/
    ├── api/
    │   ├── main.py
    │   └── schemas.py
    ├── data/
    │   ├── raw/
    │   └── processed/
    ├── frontend/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   ├── services/
    │   │   └── utils/
    │   └── package.json
    ├── models/
    │   ├── binary_rf_baseline.joblib
    │   ├── attack_category_rf.joblib
    │   └── anomaly_isolation_forest.joblib
    ├── notebooks/
    ├── reports/
    ├── src/
    │   └── predictor.py
    ├── tests/
    ├── check_predictor.py
    ├── check_api.py
    ├── requirements.txt
    └── README.md

The dataset and model binaries may not be included in a source checkout.

## Local setup

### 1. Python environment

Run from the project root in PowerShell:

    py -3.13 -m venv .venv
    .\.venv\Scripts\python.exe -m pip install -r requirements.txt

Reuse the existing virtual environment if it is already working.

For a reproducible setup, requirements.txt must contain the dependencies and versions from the working training/API environment. A clean-machine installation has not yet been verified. Do not upgrade ML dependencies without checking model compatibility.

### 2. Download assets or reproduce training

Source code is stored in GitHub. Large datasets and fitted model artifacts are distributed separately.

**Release links are pending.** The maintainer must replace the two placeholders below with working, viewer-access Google Drive links before sharing this as a ready-to-run release.

| Download | Link | Needed for |
| --- | --- | --- |
| Three fitted model artifacts | https://drive.google.com/drive/folders/1JWb_GVjE-Npj8wqUBdktuuluADuZyfeB?usp=sharing | Running the API without training |
| Original training and testing CSV files | https://drive.google.com/drive/folders/1JWb_GVjE-Npj8wqUBdktuuluADuZyfeB?usp=sharing | Notebooks and retraining |

Official dataset source and attribution: [UNSW-NB15, UNSW Research](https://research.unsw.edu.au/projects/unsw-nb15-dataset). Use the original named training/testing split used in this project, not a re-extracted or extended version. Follow the provider's usage and citation conditions.

#### Option A — Run the existing trained application

Download these exact files into the project-root models/ directory:

- models/binary_rf_baseline.joblib
- models/attack_category_rf.joblib
- models/anomaly_isolation_forest.joblib

Download the actual files, not a Google Drive preview webpage. Avoid an extra nested models/models/ folder after extraction. All three files must come from the same project release. They contain fitted preprocessing pipelines and metadata, not just standalone estimators.

The full training dataset is not required for API startup. You still need a compatible input CSV containing 1–100 rows to use the interface.

Only load model artifacts obtained from a trusted source. joblib/pickle-based loading can execute code. Keep the dependency versions used when these artifacts were saved; cross-version scikit-learn loading is unsupported.

#### Option B — Study or regenerate the models

Download the original CSVs into:

- data/raw/UNSW_NB15_training-set.csv
- data/raw/UNSW_NB15_testing-set.csv

The expected shapes are (175341, 45) and (82332, 45), respectively.

Open the notebooks with the project .venv selected as the Jupyter kernel. Run cells in order. Actual tracked notebook filenames are:

1. notebooks/data_understanding.ipynb
2. notebooks/binary_preprocessing.ipynb
3. notebooks/AttackCat_Classification.ipynb
4. notebooks/anomaly_detection.ipynb

Run each model notebook through its export cells and confirm that the three expected model files exist. Notebook execution from a fresh kernel and clean-machine reproducibility have not yet been independently verified. If a notebook depends on variables from another session, make its loading/setup cells explicit before claiming reproducibility.

Keep data and fitted artifacts out of the source repository unless intentionally publishing them through a suitable release mechanism.

### 3. Start the backend

From the project root:

    .\.venv\Scripts\python.exe -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --workers 1

- Health endpoint: http://127.0.0.1:8000/health
- API documentation: http://127.0.0.1:8000/docs

Expected health response:

    {"status":"ready","models_loaded":3}

### 4. Start the frontend

In a separate terminal:

    cd frontend
    npm ci
    npm run dev

Use npm install instead of npm ci if no package-lock.json exists.

Papa Parse must already be declared in frontend/package.json and package-lock.json. A normal checkout should install dependencies with npm ci without manually adding packages.

Open the local URL printed by Vite (normally http://localhost:5173). If that port is occupied, use the actual printed port.

The Vite development proxy forwards /api requests to http://127.0.0.1:8000 and removes the /api prefix. Production hosting requires its own routing configuration.

### 5. Verification commands

With the backend running, from the project root:

    .\.venv\Scripts\python.exe check_predictor.py
    .\.venv\Scripts\python.exe check_api.py

From frontend/:

    npm run lint
    npm run build

These commands describe the verification workflow; not all current repository checks have been independently rerun.

## Troubleshooting

| Symptom | Check or fix |
| --- | --- |
| No module named pandas | Use .\\.venv\\Scripts\\python.exe and install requirements with that same interpreter. |
| Notebook imports fail | Select the project .venv kernel and run setup cells first. |
| Cannot find check_api.py | Run the command from the project root, not its parent directory. |
| Model file not found | Check all three filenames and the models/ folder location. |
| Model compatibility warning | Restore the training dependency versions or retrain and re-export all artifacts. |
| Frontend API request failed | Keep backend running on port 8000; check /health and the Vite /api proxy. |
| HTTP 422 | Check the required feature schema, types, and the 1–100 record batch limit. |
| HTTP 413 | Reduce the request; actual body and file limits are 1 MiB. |
| HTTP 503 | A prediction is already running; wait and retry. |
| Attack prediction for a known Normal row | A valid input can still be a false positive. This is a model error, not automatically an upload error. |

## Usage and input format

1. Choose a CSV file containing prepared flow records.
2. Review the preview and excluded metadata notice.
3. Click Run analysis.
4. Review predictions and export results as JSON.

CSV is the only supported upload format. The frontend converts validated records to JSON for the prediction API.

The application does not extract features from PCAP files, arbitrary Wireshark exports, firewall logs or live network interfaces.

### Required features

    dur, proto, service, state, spkts, dpkts, sbytes, dbytes,
    rate, sttl, dttl, sload, dload, sloss, dloss, sinpkt,
    dinpkt, sjit, djit, swin, stcpb, dtcpb, dwin, tcprtt,
    synack, ackdat, smean, dmean, trans_depth, response_body_len,
    ct_srv_src, ct_state_ttl, ct_dst_ltm, ct_src_dport_ltm,
    ct_dst_sport_ltm, ct_dst_src_ltm, ct_ftp_cmd, ct_flw_http_mthd,
    ct_src_ltm, ct_srv_dst, is_sm_ips_ports

- proto, service and state are categorical text.
- The other 38 inputs must be finite, nonnegative numbers.
- Feature definitions and units must match the training data.
- CSV: comma-separated UTF-8 with a header.
- Maximum file size: 1 MiB. Converted JSON must also fit the API body limit.
- The frontend explicitly excludes id, label, attack_cat and is_ftp_login if present.
- Missing, duplicate and unexpected columns are rejected.
- Direct API requests must omit metadata; extra fields are rejected.

### Prediction API

POST /predict accepts an object containing a records array. Every record must satisfy the full 41-feature schema shown in /docs.

Illustrative response only:

    {
      "count": 1,
      "predictions": [
        {
          "binary_prediction": "Normal",
          "attack_score": 0.08,
          "predicted_category": null,
          "category_score": null,
          "anomaly_score": 0.48,
          "anomaly_warning": false
        }
      ]
    }

| Field | Meaning |
| --- | --- |
| binary_prediction | Normal or Attack using the saved threshold |
| attack_score | Binary model probability estimate; not a calibrated guarantee |
| predicted_category | Known attack category for predicted Attack records |
| category_score | Highest category-model probability estimate |
| anomaly_score | Negative Isolation Forest score_samples; larger means more unusual |
| anomaly_warning | Score exceeds the stored anomaly threshold |

A Normal prediction can have an anomaly warning. The warning does not override the binary prediction.

## Methodology

### Data understanding

The supplied UNSW-NB15 training and test files contain 175,341 and 82,332 records respectively, with 45 columns.

Analysis covered missing values, numerical distributions, categorical coverage, duplicates, contradictory labels and train–test overlap.

Observed findings:

- 67,601 training rows repeated earlier rows when id was excluded.
- 229 feature-pattern groups had conflicting binary labels.
- 1,772 feature-pattern groups had conflicting attack-category labels.
- 8,541 official test records matched training feature patterns in the overlap check.
- is_ftp_login and ct_ftp_cmd were identical in the inspected training data.

Contradictory labels were not automatically relabeled.

### Preparation and splitting

id, label and attack_cat are excluded from model inputs. The redundant is_ftp_login column is also excluded, leaving 41 features.

Binary deduplication by features and binary target left 101,269 records and 101,040 unique feature patterns.

A grouped, approximately stratified split kept identical feature patterns out of both training and validation:

| Task | Training records | Validation records |
| --- | ---: | ---: |
| Binary detection | 81,016 | 20,253 |
| Attack-only categorization | 44,680 | 11,170 |

The attack-only dataset contained 55,850 deduplicated records.

Preprocessing was fitted on the relevant training subset:

- Numerical median imputation.
- Numerical standardization in the binary pipeline.
- Most-frequent categorical imputation and one-hot encoding with unknown-category handling.
- Category and anomaly pipelines used numerical imputation without scaling.

The binary preprocessing produced 193 transformed features. Each fitted preprocessor is saved with its model.

### Algorithms

| Task | Algorithm |
| --- | --- |
| Reference baseline | Dummy Classifier |
| Initial binary baseline | Logistic Regression |
| Final binary detection | Random Forest |
| Attack categorization | Class-weighted Random Forest |
| Supplementary anomaly warning | Isolation Forest |

The saved binary Random Forest uses 100 trees, maximum depth 20, minimum leaf size 2, square-root feature sampling and random state 42.

The category model predicts nine known classes: Analysis, Backdoor, DoS, Exploits, Fuzzers, Generic, Reconnaissance, Shellcode and Worms. It runs only for binary Attack predictions and cannot independently confirm that a record is an attack.

Isolation Forest uses 200 estimators and max_samples=256. It was trained on 41,512 unique normal records and calibrated on 10,378 separate normal records.

### Threshold selection

The binary threshold of 0.51 was selected on validation data from a 0.01-spaced grid to minimize false-positive rate while maintaining at least 95% attack recall.

The anomaly threshold is the 95th percentile of calibration-normal scores, approximately 0.522804. The saved artifact retains the unrounded value; warning is triggered by score > threshold.

Models and the binary threshold were selected using validation results. The later choice to keep anomaly output supplementary was informed by an exploratory combination analysis on the official test set. That analysis is not independent validation of a new combined detector.

## Results

### Binary validation

| Model / threshold | Accuracy | Attack precision | Attack recall | Attack F1 | False-positive rate |
| --- | ---: | ---: | ---: | ---: | ---: |
| Dummy classifier | 51.24% | 0.00% | 0.00% | 0.0000 | — |
| Logistic Regression / 0.50 | 89.74% | 83.92% | 97.68% | 0.9028 | 17.81% |
| Random Forest depth 20 / 0.50 | 92.62% | 89.80% | 95.75% | 0.9268 | 10.35% |

At the selected Random Forest threshold of 0.51, validation attack precision was 90.16%, attack recall was 95.29% and false-positive rate was 9.90%, with 1,027 false alarms and 465 missed attacks.

### Binary official test

Random Forest depth 20, threshold 0.51:

| Metric | Result |
| --- | ---: |
| Records | 82,332 |
| Accuracy | 86.91% |
| Attack precision | 81.40% |
| Attack recall | 98.79% |
| Attack F1 | 0.8926 |
| False-positive rate | 27.65% |
| ROC-AUC | 0.9821 |
| Average precision | 0.9863 |

| Actual / predicted | Normal | Attack |
| --- | ---: | ---: |
| Normal | 26,770 | 10,230 |
| Attack | 548 | 44,784 |

For the 73,791-record novel-pattern test subset, accuracy was 86.08%, attack F1 was 0.8802 and false-positive rate was 27.39%.

“Novel-pattern” means no exact feature-pattern match under the overlap procedure. It does not establish detection of a previously unseen attack type.

### Attack-category model

| Evaluation | Accuracy | Macro F1 |
| --- | ---: | ---: |
| Attack-only validation | 75.64% | 0.6147 |
| Official attack-only test: 45,332 records | 73.69% | 0.5146 |
| Novel attack-pattern test: 38,280 records | 80.39% | 0.5546 |

Attack-only metrics evaluate the category model separately from the binary gate. They are not whole-application classification accuracy.

Performance varies by category. Official attack-only test precision was 8.91% for Analysis and 4.72% for Backdoor. DoS recall was 14.60%.

In the full cascade, 32,873 actual attacks were detected and correctly categorized, 11,911 were detected but given the wrong category, and 548 were missed as normal.

### Anomaly model

| Metric | Official test result |
| --- | ---: |
| Normal false-positive rate | 9.47% |
| Attack detection recall | 35.72% |
| ROC-AUC | 0.7958 |
| Normal records warned | 3,503 |
| Attack records warned | 16,191 |

Combining binary and anomaly predictions with an OR rule recovered 114 binary-missed attacks but added 2,506 normal false alarms. Combined false-positive rate increased to 34.42%. The application exposes anomaly output separately rather than overriding the binary prediction.

## Verification status

Completed checks:

- Saved model reload and predictor integration.
- Three-record API prediction.
- Empty-batch rejection with HTTP 422.
- Oversized-request rejection with HTTP 413.
- CSV upload, preview and JSON result export.
- Parser checks for row limits, invalid numbers, missing/duplicate headers and metadata exclusion.

Clean-machine reproducibility remains unverified.

## Security and resource controls

Current controls include:

- Server-side schema validation; client-side checks are supplementary.
- 1–100 records per request.
- Actual request-body byte limit of 1 MiB before JSON parsing.
- Request-body read timeout of 15 seconds.
- One in-flight prediction per server process; HTTP 503 when busy.
- Generic validation/prediction errors and prediction error identifiers.
- Prediction error logs exclude raw traffic and exception messages.
- Trusted local model loading; no model-upload endpoint.

The prediction lock is not rate limiting. A browser request timeout does not guarantee cancellation of server-side computation.

Authentication, authorization, production rate limiting, HTTPS/reverse-proxy configuration and deployment hardening are not completed. Keep development servers on loopback until deployment controls are implemented and reviewed.

## Limitations

1. High binary false-positive rate can generate excessive alerts.
2. Several attack categories have weak precision or recall.
3. Model scores have not been established as calibrated confidence estimates.
4. Duplicates, conflicting labels and train–test overlap complicate evaluation.
5. Deduplication changes class frequencies and validation population.
6. Exact-pattern isolation does not eliminate every dependency between network flows.
7. Validation/test differences indicate generalization challenges; their cause has not been isolated.
8. Real-world live-traffic and zero-day detection performance have not been established.
9. Compatible feature extraction is required; no built-in extractor is provided.
10. No persistent user history, account system or automatic traffic blocking.
11. File import improves usability, not prediction accuracy.

## Remaining work

- Verify mobile interactions end to end.
- Pin dependencies and reproduce setup in a clean environment.
- Complete deployment-specific access and resource controls.
- Add sample data and input guidance.
- Optionally investigate false-positive reduction on training/validation data without tuning to the already-inspected official test set.

## Dataset and author

Dataset: UNSW-NB15. Consult the dataset provider's official documentation for feature definitions, attribution and usage conditions.

Developed by Nadeera Shasika as an AI/ML portfolio project.

## Release checklist for the maintainer

- Replace both pending Drive links and verify access in a signed-out browser.
- Confirm models match this source revision and the documented thresholds.
- Pin the Python environment used to train/save the artifacts; retain the frontend lockfile.
- Inspect notebooks for private paths, tokens, credentials and unnecessary outputs before public sharing.
- Provide a small compatible sample CSV (no more than 100 records) with its source and purpose documented.
- Test the full download/install/start/predict workflow from a clean checkout.
- Record model SHA-256 checksums if distributing a release; checksums detect file changes but do not establish who created a model.
- Do not describe the release as reproducible or production-ready until the relevant checks pass.
