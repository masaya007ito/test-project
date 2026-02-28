"""Tests for aspect calculations."""

from heliocentric.aspects import Aspect, angle_difference, calculate_aspects
from heliocentric.calculator import PlanetPosition


class TestAngleDifference:
    def test_same_angle(self):
        assert angle_difference(0, 0) == 0

    def test_simple_difference(self):
        assert abs(angle_difference(10, 100) - 90) < 0.001

    def test_wrap_around(self):
        assert abs(angle_difference(350, 10) - 20) < 0.001

    def test_symmetric(self):
        assert abs(angle_difference(30, 150) - angle_difference(150, 30)) < 0.001

    def test_opposition(self):
        assert abs(angle_difference(0, 180) - 180) < 0.001


def _make_pos(name: str, longitude: float) -> PlanetPosition:
    from heliocentric.calculator import longitude_to_sign
    sign, sym, deg = longitude_to_sign(longitude)
    return PlanetPosition(
        name=name, longitude=longitude, latitude=0, distance=1,
        sign=sign, sign_symbol=sym, degree_in_sign=deg,
    )


class TestCalculateAspects:
    def test_conjunction(self):
        positions = [_make_pos("A", 10), _make_pos("B", 12)]
        aspects = calculate_aspects(positions)
        assert any(a.aspect_type == "Conjunction" for a in aspects)

    def test_opposition(self):
        positions = [_make_pos("A", 0), _make_pos("B", 180)]
        aspects = calculate_aspects(positions)
        assert any(a.aspect_type == "Opposition" for a in aspects)

    def test_trine(self):
        positions = [_make_pos("A", 0), _make_pos("B", 120)]
        aspects = calculate_aspects(positions)
        assert any(a.aspect_type == "Trine" for a in aspects)

    def test_square(self):
        positions = [_make_pos("A", 0), _make_pos("B", 90)]
        aspects = calculate_aspects(positions)
        assert any(a.aspect_type == "Square" for a in aspects)

    def test_sextile(self):
        positions = [_make_pos("A", 0), _make_pos("B", 60)]
        aspects = calculate_aspects(positions)
        assert any(a.aspect_type == "Sextile" for a in aspects)

    def test_no_aspect(self):
        positions = [_make_pos("A", 0), _make_pos("B", 45)]
        aspects = calculate_aspects(positions)
        # 45° is not a standard aspect (within orbs)
        major = [a for a in aspects if a.aspect_type in ("Conjunction", "Opposition", "Trine", "Square", "Sextile")]
        assert len(major) == 0

    def test_sorted_by_orb(self):
        positions = [
            _make_pos("A", 0),
            _make_pos("B", 1),     # tight conjunction
            _make_pos("C", 125),   # wider trine
        ]
        aspects = calculate_aspects(positions)
        for i in range(len(aspects) - 1):
            assert abs(aspects[i].orb) <= abs(aspects[i + 1].orb)

    def test_str_format(self):
        asp = Aspect(
            planet1="Earth", planet2="Mars", aspect_type="Trine",
            symbol="\u25b3", exact_angle=120, actual_angle=121, orb=1.0,
        )
        s = str(asp)
        assert "Earth" in s
        assert "Mars" in s
        assert "Trine" in s
