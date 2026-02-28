# Heliocentric Astrology Chart System

- **Author:** Masaya Ito
- **Date:** 2026-02-08

## About

A Python-based heliocentric astrology chart generator. Computes planetary positions as seen from the Sun using Swiss Ephemeris and renders circular SVG charts.

### Features

- Heliocentric planetary positions for Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
- Zodiac sign mapping with degree/minute precision
- Aspect calculations (Conjunction, Opposition, Trine, Square, Sextile, Quincunx, Semi-sextile)
- SVG chart rendering with zodiac wheel, planet symbols, and aspect lines
- Command-line interface

## Installation

```bash
pip install -e ".[dev]"
```

## Usage

### CLI

```bash
# Chart for current date/time
heliochart

# Chart for a specific date
heliochart "1990-06-15 12:00"

# Generate SVG output
heliochart "1990-06-15" --svg chart.svg

# Positions only (no aspects)
heliochart "2024-01-01" --no-aspects
```

### Python API

```python
from datetime import datetime, timezone
from heliocentric import HeliocentricChart, render_svg

dt = datetime(1990, 6, 15, 12, 0, tzinfo=timezone.utc)
chart = HeliocentricChart.create(dt)

# Text summary
print(chart.summary())

# SVG chart
svg = render_svg(chart)
with open("chart.svg", "w") as f:
    f.write(svg)
```

## Testing

```bash
pytest tests/ -v
```
