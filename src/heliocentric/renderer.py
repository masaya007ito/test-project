"""SVG renderer for heliocentric astrology charts.

Generates a circular chart with:
- 12 zodiac sign sectors
- Planet positions plotted around the ecliptic
- Aspect lines connecting planets
"""

from __future__ import annotations

import math
from xml.etree.ElementTree import Element, SubElement, tostring

from heliocentric.aspects import ASPECT_TYPES
from heliocentric.calculator import ZODIAC_SIGNS, ZODIAC_SYMBOLS, PlanetPosition
from heliocentric.chart import HeliocentricChart

# Chart layout constants
SIZE = 800
CENTER = SIZE / 2
OUTER_RADIUS = 350
SIGN_RADIUS = 320
INNER_RADIUS = 280
PLANET_RADIUS = 240
ASPECT_RADIUS = 180

# Planet display symbols
PLANET_SYMBOLS = {
    "Mercury": "\u263f",
    "Venus": "\u2640",
    "Earth": "\u2641",
    "Mars": "\u2642",
    "Jupiter": "\u2643",
    "Saturn": "\u2644",
    "Uranus": "\u2645",
    "Neptune": "\u2646",
    "Pluto": "\u2647",
}

# Aspect line colors
ASPECT_COLORS = {
    "Conjunction": "#FFD700",
    "Opposition": "#FF0000",
    "Trine": "#0000FF",
    "Square": "#FF0000",
    "Sextile": "#0000FF",
    "Quincunx": "#00AA00",
    "Semi-sextile": "#00AA00",
}

# Zodiac sign colors by element
ELEMENT_COLORS = {
    "fire": "#FFE0E0",    # Aries, Leo, Sagittarius
    "earth": "#E0FFE0",   # Taurus, Virgo, Capricorn
    "air": "#FFFFE0",     # Gemini, Libra, Aquarius
    "water": "#E0E0FF",   # Cancer, Scorpio, Pisces
}

SIGN_ELEMENTS = [
    "fire", "earth", "air", "water",
    "fire", "earth", "air", "water",
    "fire", "earth", "air", "water",
]


def _angle_to_xy(angle_deg: float, radius: float) -> tuple[float, float]:
    """Convert an angle (0=Aries cusp, counterclockwise) to SVG coordinates.

    In astrology charts, 0° Aries is at the left (9 o'clock position)
    and signs proceed counterclockwise.
    """
    rad = math.radians(180 - angle_deg)
    x = CENTER + radius * math.cos(rad)
    y = CENTER - radius * math.sin(rad)
    return x, y


def _draw_zodiac_wheel(svg: Element) -> None:
    """Draw the 12 zodiac sign sectors."""
    for i in range(12):
        start_angle = i * 30
        end_angle = (i + 1) * 30

        # Draw sector arc
        x1_o, y1_o = _angle_to_xy(start_angle, OUTER_RADIUS)
        x2_o, y2_o = _angle_to_xy(end_angle, OUTER_RADIUS)
        x1_i, y1_i = _angle_to_xy(start_angle, INNER_RADIUS)
        x2_i, y2_i = _angle_to_xy(end_angle, INNER_RADIUS)

        color = ELEMENT_COLORS[SIGN_ELEMENTS[i]]

        path_d = (
            f"M {x1_i},{y1_i} "
            f"L {x1_o},{y1_o} "
            f"A {OUTER_RADIUS},{OUTER_RADIUS} 0 0,0 {x2_o},{y2_o} "
            f"L {x2_i},{y2_i} "
            f"A {INNER_RADIUS},{INNER_RADIUS} 0 0,1 {x1_i},{y1_i} Z"
        )
        SubElement(svg, "path", d=path_d, fill=color,
                   stroke="#666", **{"stroke-width": "1"})

        # Draw sign symbol at the center of the sector
        mid_angle = start_angle + 15
        sx, sy = _angle_to_xy(mid_angle, SIGN_RADIUS)
        text = SubElement(svg, "text", x=str(sx), y=str(sy + 6),
                          fill="#333", **{
                              "text-anchor": "middle",
                              "font-size": "20",
                              "font-family": "serif",
                          })
        text.text = ZODIAC_SYMBOLS[i]

    # Inner circle
    SubElement(svg, "circle", cx=str(CENTER), cy=str(CENTER),
               r=str(INNER_RADIUS), fill="white",
               stroke="#666", **{"stroke-width": "1"})


def _draw_degree_ticks(svg: Element) -> None:
    """Draw tick marks every 10 degrees around the wheel."""
    for deg in range(0, 360, 10):
        x1, y1 = _angle_to_xy(deg, INNER_RADIUS)
        x2, y2 = _angle_to_xy(deg, INNER_RADIUS + 10)
        SubElement(svg, "line", x1=str(x1), y1=str(y1),
                   x2=str(x2), y2=str(y2),
                   stroke="#999", **{"stroke-width": "0.5"})


def _draw_planets(svg: Element, positions: list[PlanetPosition]) -> dict[str, tuple[float, float]]:
    """Draw planet symbols and return their coordinates for aspect lines."""
    coords = {}

    for pos in positions:
        angle = pos.longitude
        px, py = _angle_to_xy(angle, PLANET_RADIUS)
        ax, ay = _angle_to_xy(angle, ASPECT_RADIUS)
        coords[pos.name] = (ax, ay)

        symbol = PLANET_SYMBOLS.get(pos.name, "?")

        # Planet symbol
        text = SubElement(svg, "text", x=str(px), y=str(py + 7),
                          fill="#222", **{
                              "text-anchor": "middle",
                              "font-size": "22",
                              "font-weight": "bold",
                              "font-family": "serif",
                          })
        text.text = symbol

        # Degree label
        lx, ly = _angle_to_xy(angle, PLANET_RADIUS - 25)
        label = SubElement(svg, "text", x=str(lx), y=str(ly + 5),
                           fill="#555", **{
                               "text-anchor": "middle",
                               "font-size": "10",
                               "font-family": "sans-serif",
                           })
        label.text = pos.degree_display

        # Line from planet to wheel edge
        ex, ey = _angle_to_xy(angle, INNER_RADIUS)
        SubElement(svg, "line", x1=str(px), y1=str(py),
                   x2=str(ex), y2=str(ey),
                   stroke="#CCC", **{"stroke-width": "0.5"})

    return coords


def _draw_aspects(svg: Element, chart: HeliocentricChart,
                  coords: dict[str, tuple[float, float]]) -> None:
    """Draw aspect lines between planets."""
    for asp in chart.aspects:
        if asp.planet1 not in coords or asp.planet2 not in coords:
            continue

        x1, y1 = coords[asp.planet1]
        x2, y2 = coords[asp.planet2]
        color = ASPECT_COLORS.get(asp.aspect_type, "#999")

        # Tighter orbs get thicker lines
        max_orb = ASPECT_TYPES[asp.aspect_type]["orb"]
        thickness = max(0.5, 2.5 * (1 - abs(asp.orb) / max_orb))

        dash = ""
        if asp.aspect_type in ("Quincunx", "Semi-sextile"):
            dash = "4,3"

        attrs = {
            "x1": str(x1), "y1": str(y1),
            "x2": str(x2), "y2": str(y2),
            "stroke": color,
            "stroke-width": f"{thickness:.1f}",
            "opacity": "0.7",
        }
        if dash:
            attrs["stroke-dasharray"] = dash

        SubElement(svg, "line", **attrs)


def _draw_center_info(svg: Element, chart: HeliocentricChart) -> None:
    """Draw date/time info in the center of the chart."""
    # Sun symbol at the very center
    sun = SubElement(svg, "text", x=str(CENTER), y=str(CENTER - 10),
                     fill="#FFB300", **{
                         "text-anchor": "middle",
                         "font-size": "36",
                         "font-family": "serif",
                     })
    sun.text = "\u2609"  # ☉ Sun symbol

    label = SubElement(svg, "text", x=str(CENTER), y=str(CENTER + 20),
                       fill="#333", **{
                           "text-anchor": "middle",
                           "font-size": "11",
                           "font-family": "sans-serif",
                       })
    label.text = "HELIOCENTRIC"

    date_text = SubElement(svg, "text", x=str(CENTER), y=str(CENTER + 36),
                           fill="#666", **{
                               "text-anchor": "middle",
                               "font-size": "10",
                               "font-family": "sans-serif",
                           })
    date_text.text = chart.dt.strftime("%Y-%m-%d %H:%M UTC")


def render_svg(chart: HeliocentricChart) -> str:
    """Render a heliocentric chart as an SVG string.

    Args:
        chart: A computed HeliocentricChart.

    Returns:
        SVG markup as a string.
    """
    svg = Element("svg", xmlns="http://www.w3.org/2000/svg",
                  width=str(SIZE), height=str(SIZE),
                  viewBox=f"0 0 {SIZE} {SIZE}")

    # Background
    SubElement(svg, "rect", width=str(SIZE), height=str(SIZE), fill="#FAFAFA")

    _draw_zodiac_wheel(svg)
    _draw_degree_ticks(svg)
    coords = _draw_planets(svg, chart.positions)
    _draw_aspects(svg, chart, coords)
    _draw_center_info(svg, chart)

    return '<?xml version="1.0" encoding="UTF-8"?>\n' + tostring(svg, encoding="unicode")
