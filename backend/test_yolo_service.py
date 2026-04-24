from __future__ import annotations

import argparse
import asyncio
import base64
from pathlib import Path

from services.yolo_service import analyze_waste_image


def _resolve_image_path(raw_path: str) -> Path:
    path = Path(raw_path).expanduser()
    if not path.is_absolute():
        path = (Path.cwd() / path).resolve()
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"Image file not found: {path}")
    return path


async def _run(image_path: Path) -> None:
    with image_path.open("rb") as file_handle:
        image_base64 = base64.b64encode(file_handle.read()).decode("utf-8")

    result = await analyze_waste_image(
        image_base64=image_base64,
        uid="dummy-user-id",
    )
    print(result.model_dump_json(indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Local test runner for backend/services/yolo_service.py",
    )
    parser.add_argument(
        "image_path",
        help="Path to a local image file (jpg/jpeg/png).",
    )
    args = parser.parse_args()

    image_path = _resolve_image_path(args.image_path)
    asyncio.run(_run(image_path))


if __name__ == "__main__":
    main()
