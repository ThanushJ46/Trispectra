from __future__ import annotations

import argparse
from datetime import datetime
from pathlib import Path

import cv2
from ultralytics import YOLO


def _resolve_path(raw_path: str) -> Path:
    path = Path(raw_path).expanduser()
    if not path.is_absolute():
        path = (Path.cwd() / path).resolve()
    return path


def _print_detection_details(result: object, names: object) -> int:
    boxes = getattr(result, "boxes", None)
    if boxes is None:
        print("[YOLO-DIRECT] boxes found: 0")
        return 0

    cls_data = getattr(boxes, "cls", None)
    conf_data = getattr(boxes, "conf", None)
    xyxy_data = getattr(boxes, "xyxy", None)
    if cls_data is None or conf_data is None or xyxy_data is None:
        print("[YOLO-DIRECT] boxes found: 0")
        return 0

    class_ids = cls_data.tolist()
    scores = conf_data.tolist()
    coords = xyxy_data.tolist()
    count = min(len(class_ids), len(scores), len(coords))

    print(f"[YOLO-DIRECT] boxes found: {count}")
    for class_id, score, coord in zip(class_ids, scores, coords):
        idx = int(class_id)
        label = str(idx)
        if isinstance(names, dict):
            label = str(names.get(idx, names.get(str(idx), idx)))
        elif isinstance(names, (list, tuple)) and 0 <= idx < len(names):
            label = str(names[idx])

        bbox = [float(coord[0]), float(coord[1]), float(coord[2]), float(coord[3])]
        print(
            "[YOLO-DIRECT] detection: "
            f"class_id={idx} label={label} conf={float(score):.4f} bbox={bbox}"
        )

    return count


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Direct YOLO model debug tool for WasteWise backend.",
    )
    parser.add_argument("model_path", help="Path to a YOLO .pt model")
    parser.add_argument("image_path", help="Path to an input image")
    parser.add_argument(
        "--conf",
        type=float,
        default=0.05,
        help="Confidence threshold for YOLO predict()",
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=640,
        help="Inference image size for YOLO predict()",
    )
    args = parser.parse_args()

    model_path = _resolve_path(args.model_path)
    image_path = _resolve_path(args.image_path)

    if not model_path.exists() or not model_path.is_file():
        raise FileNotFoundError(f"Model file not found: {model_path}")
    if not image_path.exists() or not image_path.is_file():
        raise FileNotFoundError(f"Image file not found: {image_path}")

    print(f"[YOLO-DIRECT] model: {model_path}")
    print(f"[YOLO-DIRECT] image: {image_path}")
    print(f"[YOLO-DIRECT] conf threshold: {args.conf}")
    print(f"[YOLO-DIRECT] image size: {args.imgsz}")

    model = YOLO(str(model_path))
    print(f"[YOLO-DIRECT] model.names: {model.names}")

    results = model.predict(
        source=str(image_path),
        conf=args.conf,
        imgsz=args.imgsz,
        verbose=False,
    )
    print(f"[YOLO-DIRECT] raw result count: {len(results)}")

    total_boxes = 0
    for result in results:
        total_boxes += _print_detection_details(result, getattr(result, "names", model.names))

    output_dir = (Path("backend/debug_outputs")).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    if results:
        annotated = results[0].plot()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = output_dir / f"{model_path.stem}_{image_path.stem}_{timestamp}.jpg"
        cv2.imwrite(str(output_path), annotated)
        print(f"[YOLO-DIRECT] annotated output saved: {output_path}")
    else:
        print("[YOLO-DIRECT] no results to annotate")

    print(f"[YOLO-DIRECT] total boxes across results: {total_boxes}")


if __name__ == "__main__":
    main()
