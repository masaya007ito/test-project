"""Core ephemeris calculator for heliocentric planetary positions.

Uses Swiss Ephemeris (pyswisseph) to compute heliocentric longitudes
for all planets as viewed from the Sun.
"""

from dataclasses import dataclass
from datetime import datetime

import swisseph as swe

# Heliocentric charts use these planets (no Sun/Moon).
# Earth replaces the Sun since we are observing from the Sun.
PLANETS = {
    "Mercury": swe.MERCURY,
    "Venus": swe.VENUS,
    "Earth": swe.EARTH,
    "Mars": swe.MARS,
    "Jupiter": swe.JUPITER,
    "Saturn": swe.SATURN,
    "Uranus": swe.URANUS,
    "Neptune": swe.NEPTUNE,
    "Pluto": swe.PLUTO,
}

ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

ZODIAC_SYMBOLS = [
    "\u2648", "\u2649", "\u264a", "\u264b",
    "\u264c", "\u264d", "\u264e", "\u264f",
    "\u2650", "\u2651", "\u2652", "\u2653",
]


@dataclass
class PlanetPosition:
    """A planet's heliocentric position."""

    name: str
    longitude: float  # 0-360 degrees
    latitude: float
    distance: float  # AU from the Sun
    sign: str
    sign_symbol: str
    degree_in_sign: float

    @property
    def degree_display(self) -> str:
        deg = int(self.degree_in_sign)
        minutes = int((self.degree_in_sign - deg) * 60)
        return f"{deg}\u00b0{minutes:02d}'"

    def __str__(self) -> str:
        return f"{self.name:10s} {self.degree_display:>8s} {self.sign_symbol} {self.sign}"


def datetime_to_julday(dt: datetime) -> float:
    """Convert a datetime to Julian Day number."""
    return swe.julday(dt.year, dt.month, dt.day,
                      dt.hour + dt.minute / 60.0 + dt.second / 3600.0)


def longitude_to_sign(longitude: float) -> tuple[str, str, float]:
    """Convert ecliptic longitude to zodiac sign, symbol, and degree within sign."""
    sign_index = int(longitude / 30) % 12
    degree_in_sign = longitude % 30
    return ZODIAC_SIGNS[sign_index], ZODIAC_SYMBOLS[sign_index], degree_in_sign


def calculate_heliocentric_positions(dt: datetime) -> list[PlanetPosition]:
    """Calculate heliocentric positions of all planets for the given datetime (UTC).

    Args:
        dt: A datetime object in UTC.

    Returns:
        List of PlanetPosition objects for each planet.
    """
    jd = datetime_to_julday(dt)
    positions = []

    for name, planet_id in PLANETS.items():
        # SEFLG_HELCTR = heliocentric, SEFLG_SPEED = include speed info
        flags = swe.FLG_HELCTR | swe.FLG_SPEED
        result, _ = swe.calc_ut(jd, planet_id, flags)

        longitude = result[0] % 360
        latitude = result[1]
        distance = result[2]

        sign, symbol, deg_in_sign = longitude_to_sign(longitude)

        positions.append(PlanetPosition(
            name=name,
            longitude=longitude,
            latitude=latitude,
            distance=distance,
            sign=sign,
            sign_symbol=symbol,
            degree_in_sign=deg_in_sign,
        ))

    return positions
