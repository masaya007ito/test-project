"""Aspect calculations between planets in a heliocentric chart."""

from dataclasses import dataclass

from heliocentric.calculator import PlanetPosition

ASPECT_TYPES = {
    "Conjunction": {"angle": 0, "orb": 8, "symbol": "\u260c"},
    "Opposition": {"angle": 180, "orb": 8, "symbol": "\u260d"},
    "Trine": {"angle": 120, "orb": 8, "symbol": "\u25b3"},
    "Square": {"angle": 90, "orb": 7, "symbol": "\u25a1"},
    "Sextile": {"angle": 60, "orb": 6, "symbol": "\u2731"},
    "Quincunx": {"angle": 150, "orb": 3, "symbol": "\u26bb"},
    "Semi-sextile": {"angle": 30, "orb": 2, "symbol": "\u26ba"},
}


@dataclass
class Aspect:
    """An aspect (angular relationship) between two planets."""

    planet1: str
    planet2: str
    aspect_type: str
    symbol: str
    exact_angle: float
    actual_angle: float
    orb: float  # difference from exact angle

    def __str__(self) -> str:
        return (
            f"{self.planet1:10s} {self.symbol} {self.planet2:10s}  "
            f"{self.aspect_type:14s} (orb {self.orb:+.1f}\u00b0)"
        )


def angle_difference(lon1: float, lon2: float) -> float:
    """Calculate the shortest angular distance between two longitudes."""
    diff = abs(lon1 - lon2) % 360
    if diff > 180:
        diff = 360 - diff
    return diff


def calculate_aspects(positions: list[PlanetPosition]) -> list[Aspect]:
    """Calculate all aspects between planets.

    Args:
        positions: List of planet positions.

    Returns:
        List of Aspect objects, sorted by orb (tightest first).
    """
    aspects = []

    for i in range(len(positions)):
        for j in range(i + 1, len(positions)):
            p1 = positions[i]
            p2 = positions[j]
            actual = angle_difference(p1.longitude, p2.longitude)

            for asp_name, asp_info in ASPECT_TYPES.items():
                orb = abs(actual - asp_info["angle"])
                if orb <= asp_info["orb"]:
                    aspects.append(Aspect(
                        planet1=p1.name,
                        planet2=p2.name,
                        aspect_type=asp_name,
                        symbol=asp_info["symbol"],
                        exact_angle=asp_info["angle"],
                        actual_angle=actual,
                        orb=actual - asp_info["angle"],
                    ))

    aspects.sort(key=lambda a: abs(a.orb))
    return aspects
