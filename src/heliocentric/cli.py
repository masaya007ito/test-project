"""Command-line interface for heliocentric chart generation."""

from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone

from heliocentric.chart import HeliocentricChart
from heliocentric.renderer import render_svg


def parse_datetime(s: str) -> datetime:
    """Parse a datetime string in various formats."""
    formats = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
        "%Y/%m/%d %H:%M:%S",
        "%Y/%m/%d %H:%M",
        "%Y/%m/%d",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(s, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    raise argparse.ArgumentTypeError(
        f"Invalid date format: '{s}'. Use YYYY-MM-DD [HH:MM[:SS]]"
    )


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(
        description="Generate a heliocentric astrology chart",
        epilog="Example: heliochart 1990-06-15 --svg chart.svg",
    )
    parser.add_argument(
        "datetime",
        nargs="?",
        type=parse_datetime,
        default=None,
        help="Date/time in UTC (YYYY-MM-DD [HH:MM[:SS]]). Defaults to now.",
    )
    parser.add_argument(
        "--svg",
        metavar="FILE",
        help="Output an SVG chart to the specified file.",
    )
    parser.add_argument(
        "--no-aspects",
        action="store_true",
        help="Hide aspect listing in text output.",
    )

    args = parser.parse_args(argv)

    dt = args.datetime or datetime.now(timezone.utc)
    chart = HeliocentricChart.create(dt)

    # Text output
    if args.no_aspects:
        print(f"=== Heliocentric Chart ===")
        print(f"Date/Time (UTC): {chart.dt.strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        print("--- Planetary Positions ---")
        for pos in chart.positions:
            print(f"  {pos}")
    else:
        print(chart.summary())

    # SVG output
    if args.svg:
        svg_content = render_svg(chart)
        with open(args.svg, "w", encoding="utf-8") as f:
            f.write(svg_content)
        print(f"\nSVG chart saved to: {args.svg}")


if __name__ == "__main__":
    main()
