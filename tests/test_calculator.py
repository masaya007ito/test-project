"""Tests for the heliocentric calculator module."""

from datetime import datetime, timezone

from heliocentric.calculator import (
    PLANETS,
    PlanetPosition,
    calculate_heliocentric_positions,
    datetime_to_julday,
    longitude_to_sign,
)


class TestDatetimeToJulday:
    def test_j2000_epoch(self):
        """J2000.0 epoch is Julian Day 2451545.0."""
        dt = datetime(2000, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        jd = datetime_to_julday(dt)
        assert abs(jd - 2451545.0) < 0.001

    def test_known_date(self):
        dt = datetime(2024, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
        jd = datetime_to_julday(dt)
        assert jd > 2460000  # sanity check


class TestLongitudeToSign:
    def test_aries(self):
        sign, symbol, deg = longitude_to_sign(15.0)
        assert sign == "Aries"
        assert symbol == "\u2648"
        assert abs(deg - 15.0) < 0.001

    def test_taurus(self):
        sign, _, deg = longitude_to_sign(45.0)
        assert sign == "Taurus"
        assert abs(deg - 15.0) < 0.001

    def test_pisces(self):
        sign, _, deg = longitude_to_sign(350.0)
        assert sign == "Pisces"
        assert abs(deg - 20.0) < 0.001

    def test_zero_degrees(self):
        sign, _, deg = longitude_to_sign(0.0)
        assert sign == "Aries"
        assert abs(deg) < 0.001

    def test_boundary(self):
        sign, _, _ = longitude_to_sign(30.0)
        assert sign == "Taurus"


class TestCalculateHeliocentricPositions:
    def test_returns_all_planets(self):
        dt = datetime(2024, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        positions = calculate_heliocentric_positions(dt)
        assert len(positions) == len(PLANETS)

    def test_planet_names(self):
        dt = datetime(2024, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        positions = calculate_heliocentric_positions(dt)
        names = {p.name for p in positions}
        assert names == set(PLANETS.keys())

    def test_longitude_range(self):
        dt = datetime(2024, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        positions = calculate_heliocentric_positions(dt)
        for pos in positions:
            assert 0 <= pos.longitude < 360, f"{pos.name} longitude out of range"

    def test_distance_positive(self):
        dt = datetime(2024, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        positions = calculate_heliocentric_positions(dt)
        for pos in positions:
            assert pos.distance > 0, f"{pos.name} distance should be positive"

    def test_earth_distance_approx_1au(self):
        """Earth should be approximately 1 AU from the Sun."""
        dt = datetime(2024, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        positions = calculate_heliocentric_positions(dt)
        earth = next(p for p in positions if p.name == "Earth")
        assert 0.98 < earth.distance < 1.02

    def test_mercury_closest(self):
        """Mercury should be the closest planet to the Sun."""
        dt = datetime(2024, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        positions = calculate_heliocentric_positions(dt)
        mercury = next(p for p in positions if p.name == "Mercury")
        for pos in positions:
            if pos.name != "Mercury":
                assert mercury.distance < pos.distance

    def test_different_dates_give_different_positions(self):
        dt1 = datetime(2024, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        dt2 = datetime(2024, 7, 1, 12, 0, 0, tzinfo=timezone.utc)
        pos1 = calculate_heliocentric_positions(dt1)
        pos2 = calculate_heliocentric_positions(dt2)
        # At least Earth should be in a different position
        earth1 = next(p for p in pos1 if p.name == "Earth")
        earth2 = next(p for p in pos2 if p.name == "Earth")
        assert abs(earth1.longitude - earth2.longitude) > 1


class TestPlanetPosition:
    def test_degree_display(self):
        pos = PlanetPosition(
            name="Earth", longitude=45.5, latitude=0.0, distance=1.0,
            sign="Taurus", sign_symbol="\u2649", degree_in_sign=15.5,
        )
        assert "15\u00b0" in pos.degree_display
        assert "30'" in pos.degree_display

    def test_str_format(self):
        pos = PlanetPosition(
            name="Earth", longitude=45.5, latitude=0.0, distance=1.0,
            sign="Taurus", sign_symbol="\u2649", degree_in_sign=15.5,
        )
        s = str(pos)
        assert "Earth" in s
        assert "Taurus" in s
