from __future__ import annotations

import argparse
import asyncio
import base64
import os
from pathlib import Path

from services.yolo_service import analyze_waste_image

_DEFAULT_MODEL_PATHS = [
    Path("backend/models/yolo/waste_best.pt"),
    Path("backend/models/yolo/laptop_best.pt"),
    Path("backend/models/yolo/organic_best.pt"),
    Path("backend/models/yolo/best.pt"),
]


def _resolve_image_path(raw_path: str) -> Path:
    path = Path(raw_path).expanduser()
    if not path.is_absolute():
        path = (Path.cwd() / path).resolve()
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"Image file not found: {path}")
    return path


def _resolve_candidate_model_paths() -> list[Path]:
    cwd = Path.cwd().resolve()
    raw_multi = os.getenv("YOLO_MODEL_PATHS", "").strip()
    raw_single = os.getenv("YOLO_MODEL_PATH", "").strip()

    if raw_multi:
        raw_paths = [part.strip() for part in raw_multi.split(",") if part.strip()]
    elif raw_single:
        raw_paths = [raw_single]
    else:
        raw_paths = [str(path) for path in _DEFAULT_MODEL_PATHS]

    resolved: list[Path] = []
    seen: set[str] = set()
    for raw_path in raw_paths:
        path = Path(raw_path).expanduser()
        if not path.is_absolute():
            path = (cwd / path).resolve()
        key = str(path)
        if key in seen:
            continue
        seen.add(key)
        resolved.append(path)
    return resolved


def _configure_env(debug: bool, conf: float | None, imgsz: int | None) -> None:
    if debug:
        os.environ["YOLO_DEBUG"] = "true"
    if conf is not None:
        os.environ["YOLO_CONFIDENCE_THRESHOLD"] = str(conf)
    if imgsz is not None:
        os.environ["YOLO_IMAGE_SIZE"] = str(imgsz)


def _print_preflight(image_path: Path, debug: bool, conf: float | None, imgsz: int | None) -> None:
    print(f"[TEST] image path: {image_path}")
    print(f"[TEST] debug mode: {debug}")
    if conf is not None:
        print(f"[TEST] confidence override: {conf}")
    if imgsz is not None:
        print(f"[TEST] image size override: {imgsz}")

    print("[TEST] candidate model files:")
    for path in _resolve_candidate_model_paths():
        print(f"[TEST] - {path} exists={path.exists() and path.is_file()}")


async def _run(image_path: Path) -> None:
    with image_path.open("rb") as file_handle:
        image_base64 = base64.b64encode(file_handle.read()).decode("utf-8")

    result = await analyze_waste_image(
        image_base64=image_base64,
        uid="dummy-user-id",
    )
    print("[TEST] API-compatible result:")
    print(result.model_dump_json(indent=2))
    print(
        "[TEST] annotated outputs: run backend/debug_yolo_direct.py to save "
        "annotated predictions under backend/debug_outputs/."
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Local test runner for backend/services/yolo_service.py",
    )
    parser.add_argument(
        "image_path",
        help="Path to a local image file (jpg/jpeg/png).",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable detailed YOLO debug logging.",
    )
    parser.add_argument(
        "--conf",
        type=float,
        default=None,
        help="Override YOLO confidence threshold for this run.",
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=None,
        help="Override YOLO inference image size for this run.",
    )
    args = parser.parse_args()

    image_path = _resolve_image_path(args.image_path)
    _configure_env(debug=args.debug, conf=args.conf, imgsz=args.imgsz)
    _print_preflight(
        image_path=image_path,
        debug=args.debug,
        conf=args.conf,
        imgsz=args.imgsz,
    )

    asyncio.run(_run(image_path))


if __name__ == "__main__":
    main()
