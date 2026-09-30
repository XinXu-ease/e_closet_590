"""Batch-test the remove.bg API on images in test-clothingpic.

Set the REMOVE_BG_API_KEY environment variable before running this script.
Processed transparent PNG files are written to test-clipped-clothingpic.
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path

try:
    import requests
except ImportError:
    print(
        "Missing dependency: requests. Install it with: python -m pip install requests",
        file=sys.stderr,
    )
    raise SystemExit(1)


API_URL = "https://api.remove.bg/v1.0/removebg"
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def find_images(input_dir: Path) -> list[Path]:
    """Return supported image files in a stable, case-insensitive order."""
    return sorted(
        (
            path
            for path in input_dir.iterdir()
            if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
        ),
        key=lambda path: path.name.lower(),
    )


def output_path_for(image_path: Path, output_dir: Path) -> Path:
    """Build an output name such as shirt-clipped.png."""
    return output_dir / f"{image_path.stem}-clipped.png"


def remove_background(
    image_path: Path,
    output_path: Path,
    api_key: str,
    timeout_seconds: int,
) -> float:
    """Send one image to remove.bg, save the PNG, and return elapsed seconds."""
    started_at = time.perf_counter()

    with image_path.open("rb") as image_file:
        response = requests.post(
            API_URL,
            headers={"X-Api-Key": api_key},
            files={
                "image_file": (
                    image_path.name,
                    image_file,
                    "application/octet-stream",
                )
            },
            data={"size": "auto", "format": "png"},
            timeout=timeout_seconds,
        )

    if not response.ok:
        try:
            details = response.json()
        except ValueError:
            details = response.text.strip() or response.reason
        raise RuntimeError(f"HTTP {response.status_code}: {details}")

    content_type = response.headers.get("Content-Type", "")
    if "image" not in content_type.lower():
        raise RuntimeError(f"Unexpected response type: {content_type or 'unknown'}")

    output_path.write_bytes(response.content)
    return time.perf_counter() - started_at


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Remove backgrounds from all test clothing images using remove.bg."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List input/output filenames without calling the API.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace output files that already exist.",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=120,
        help="Timeout for each API request in seconds (default: 120).",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    project_dir = Path(__file__).resolve().parent
    input_dir = project_dir / "test-clothingpic"
    output_dir = project_dir / "test-clipped-clothingpic"

    if not input_dir.is_dir():
        print(f"Input directory does not exist: {input_dir}", file=sys.stderr)
        return 1

    images = find_images(input_dir)
    if not images:
        print(f"No supported images found in: {input_dir}", file=sys.stderr)
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)

    if args.dry_run:
        print(f"Found {len(images)} image(s):")
        for image_path in images:
            print(f"  {image_path.name} -> {output_path_for(image_path, output_dir).name}")
        print("Dry run complete; the API was not called.")
        return 0

    api_key = os.environ.get("REMOVE_BG_API_KEY", "").strip()
    if not api_key:
        print(
            "REMOVE_BG_API_KEY is not set. In PowerShell, run:\n"
            "  $env:REMOVE_BG_API_KEY = 'your-api-key'",
            file=sys.stderr,
        )
        return 1

    succeeded = 0
    failed = 0
    skipped = 0

    print(f"Found {len(images)} image(s) in {input_dir}")
    for image_path in images:
        destination = output_path_for(image_path, output_dir)

        if destination.exists() and not args.overwrite:
            print(f"SKIP  {image_path.name}: {destination.name} already exists")
            skipped += 1
            continue

        try:
            elapsed = remove_background(
                image_path=image_path,
                output_path=destination,
                api_key=api_key,
                timeout_seconds=args.timeout,
            )
        except (requests.RequestException, RuntimeError, OSError) as exc:
            print(f"FAIL  {image_path.name}: {exc}", file=sys.stderr)
            failed += 1
            continue

        print(f"OK    {image_path.name} -> {destination.name} ({elapsed:.2f}s)")
        succeeded += 1

    print(f"Done: {succeeded} succeeded, {failed} failed, {skipped} skipped")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
