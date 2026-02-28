"""Heliocentric chart model combining positions and aspects."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime

from heliocentric.aspects import Aspect, calculate_aspects
from heliocentric.calculator import PlanetPosition, calculate_heliocentric_positions


@dataclass
class HeliocentricChart:
    """A complete heliocentric astrology chart."""

    dt: datetime
    positions: list[PlanetPosition] = field(default_factory=list)
    aspects: list[Aspect] = field(default_factory=list)

    @classmethod
    def create(cls, dt: datetime) -> "HeliocentricChart":
        """Create a heliocentric chart for the given datetime (UTC).

        Args:
            dt: Datetime in UTC.

        Returns:
            A fully computed HeliocentricChart.
        """
        positions = calculate_heliocentric_positions(dt)
        aspects = calculate_aspects(positions)
        return cls(dt=dt, positions=positions, aspects=aspects)

    def summary(self) -> str:
        """Return a text summary of the chart."""
        lines = []
        lines.append(f"=== Heliocentric Chart ===")
        lines.append(f"Date/Time (UTC): {self.dt.strftime('%Y-%m-%d %H:%M:%S')}")
        lines.append("")
        lines.append("--- Planetary Positions ---")
        for pos in self.positions:
            lines.append(f"  {pos}")
        lines.append("")
        lines.append(f"--- Aspects ({len(self.aspects)}) ---")
        for asp in self.aspects:
            lines.append(f"  {asp}")
        return "\n".join(lines)
