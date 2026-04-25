# WasteWise YOLOv11 Backend Setup (Multi-Model)

## 1) Install dependencies

From project root:

```bash
pip install -r backend/requirements.txt
```

## 2) Place YOLO model weights

Put available model files in:

```text
backend/models/yolo/
```

Expected filenames:

- `waste_best.pt` (optional for now)
- `laptop_best.pt`
- `organic_best.pt`
- `best.pt` (optional fallback)

Service behavior:

- Missing model files are skipped with warnings.
- If no model files exist, endpoint call fails with:
  `No YOLO model files found. Place models in backend/models/yolo/`

## 3) Configure environment variables

Create/update `backend/.env`:

```env
YOLO_LAPTOP_CONFIDENCE_THRESHOLD=0.30
YOLO_ORGANIC_CONFIDENCE_THRESHOLD=0.90
YOLO_WASTE_CONFIDENCE_THRESHOLD=0.25
YOLO_CONFIDENCE_THRESHOLD=0.25
YOLO_IMAGE_SIZE=640
YOLO_DEBUG=false
```

Optional explicit model list:

```env
YOLO_MODEL_PATHS=backend/models/yolo/waste_best.pt,backend/models/yolo/laptop_best.pt,backend/models/yolo/organic_best.pt,backend/models/yolo/best.pt
```

Notes:

- `YOLO_MODEL_PATHS` accepts comma-separated absolute or project-relative paths.
- `YOLO_MODEL_PATH` remains supported for a single model file.
- Model-specific env vars override the global fallback threshold.

## 4) Run FastAPI

From `backend`:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 5) Local service test

From project root:

```bash
python backend/test_yolo_service.py test_laptop.jpg
python backend/test_yolo_service.py test_organic.jpg
python backend/test_yolo_service.py test_waste.jpg
```

With debug and lower confidence:

```bash
python backend/test_yolo_service.py test_laptop.jpg --conf 0.05 --debug
python backend/test_yolo_service.py test_organic.jpg --conf 0.10 --debug
python backend/test_yolo_service.py test_waste.jpg --conf 0.25 --debug
```

## 6) Direct single-model debug

```bash
python backend/debug_yolo_direct.py backend/models/yolo/laptop_best.pt test_laptop.jpg --conf 0.05
python backend/debug_yolo_direct.py backend/models/yolo/organic_best.pt test_organic.jpg --conf 0.05
python backend/debug_yolo_direct.py backend/models/yolo/waste_best.pt test_waste.jpg --conf 0.25
```

Annotated outputs are saved under:

```text
backend/debug_outputs/
```

## 7) Test `/api/vision/analyze`

Request body:

```json
{
  "uid": "user-id",
  "image_base64": "BASE64_IMAGE_STRING"
}
```

Example `curl`:

```bash
curl -X POST "http://127.0.0.1:8000/api/vision/analyze" \
  -H "Content-Type: application/json" \
  -d "{\"uid\":\"user-id\",\"image_base64\":\"<BASE64_IMAGE_STRING>\"}"
```

## 8) Troubleshooting zero detections

If detection returns zero items:

1. Lower threshold and run debug:
```bash
set YOLO_CONFIDENCE_THRESHOLD=0.05
python backend/test_yolo_service.py test_laptop.jpg --conf 0.05 --debug
```
2. Run direct model debug:
```bash
python backend/debug_yolo_direct.py backend/models/yolo/laptop_best.pt test_laptop.jpg --conf 0.05
```
3. Confirm test image contains classes seen during training.
4. Confirm `model.names` aligns with `backend/config/waste_rules.json` after normalization.
5. Confirm model files are present in `backend/models/yolo/`.

## 9) Troubleshooting false positives (organic on laptop images)

If `organic_best.pt` gives false positives on non-organic images:

1. Keep a higher organic threshold:
```bash
set YOLO_ORGANIC_CONFIDENCE_THRESHOLD=0.90
```
2. Keep laptop threshold moderate:
```bash
set YOLO_LAPTOP_CONFIDENCE_THRESHOLD=0.30
```
3. Re-run with debug to inspect per-model thresholds and boxes:
```bash
python backend/test_yolo_service.py test_laptop.jpg --debug
```
