from __future__ import annotations

import asyncio
import argparse
import base64
from pathlib import Path

from services.yolo_service import analyze_waste_image


def _default_image_candidates() -> list[Path]:
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent
    return [
        script_dir / "test_image.jpg",
        script_dir / "test_image.jpeg",
        script_dir / "test_image.png",
        project_root / "test_image.jpg",
        project_root / "test_image.jpeg",
        project_root / "test_image.png",
    ]


def _resolve_image_path(image_path: str | None) -> Path:
    if image_path:
        candidate = Path(image_path).expanduser()
        if not candidate.is_absolute():
            candidate = (Path.cwd() / candidate).resolve()
        if not candidate.exists() or not candidate.is_file():
            raise FileNotFoundError(f"Image file not found: {candidate}")
        return candidate

    for candidate in _default_image_candidates():
        if candidate.exists() and candidate.is_file():
            return candidate

    searched = "\n".join(str(path) for path in _default_image_candidates())
    raise FileNotFoundError(
        "No image file provided and no default test image was found.\n"
        "Looked for:\n"
        f"{searched}"
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Send a local image to YOLO Vision for waste analysis."
    )
    parser.add_argument(
        "image",
        nargs="?",
        help="Path to an image file. If omitted, the script looks for test_image.jpg/jpeg/png.",
    )
    parser.add_argument(
        "--uid",
        default="debug-user",
        help="UID used when building the final AnalysisResult.",
    )
    args = parser.parse_args()

    try:
        image_path = _resolve_image_path(args.image)
    except FileNotFoundError as exc:
        print(exc)
        raise SystemExit(1) from exc

    with image_path.open("rb") as file_handle:
        image_base64 = base64.b64encode(file_handle.read()).decode("utf-8")

    analysis_result = asyncio.run(
        analyze_waste_image(image_base64=image_base64, uid=args.uid)
    )

    print(f"Using image: {image_path}")
    print(analysis_result.model_dump_json(indent=2))


if __name__ == "__main__":
    main()
