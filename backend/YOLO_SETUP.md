# WasteWise YOLOv11 Backend Setup

## 1) Install dependencies

From the project root:

```bash
pip install -r backend/requirements.txt
```

## 2) Place YOLO model weights

Default expected path:

```text
backend/models/yolo/best.pt
```

You can keep this default, or provide a custom path with `YOLO_MODEL_PATH`.

## 3) Configure environment variables

Create/update `backend/.env`:

```env
YOLO_MODEL_PATH=backend/models/yolo/best.pt
YOLO_CONFIDENCE_THRESHOLD=0.25
```

`YOLO_MODEL_PATH` can be absolute or project-relative.

## 4) Run FastAPI server

From the `backend` directory:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 5) Test YOLO service directly

From project root:

```bash
python backend/test_yolo_service.py sample.jpg
```

## 6) Test API endpoint `/api/vision/analyze`

Request body format:

```json
{
  "image_base64": "BASE64_IMAGE_STRING",
  "uid": "dummy-user-id",
  "filename": "sample.jpg"
}
```

Example `curl`:

```bash
curl -X POST "http://127.0.0.1:8000/api/vision/analyze" \
  -H "Content-Type: application/json" \
  -d "{\"image_base64\":\"<BASE64_IMAGE_STRING>\",\"uid\":\"dummy-user-id\",\"filename\":\"sample.jpg\"}"
```
