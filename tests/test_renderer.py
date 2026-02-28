"""Tests for the SVG chart renderer."""

from datetime import datetime, timezone

from heliocentric.chart import HeliocentricChart
from heliocentric.renderer import render_svg


class TestRenderSvg:
    def test_returns_svg_string(self):
        dt = datetime(2024, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        chart = HeliocentricChart.create(dt)
        svg = render_svg(chart)
        assert svg.startswith("<?xml")
        assert "<svg" in svg
        assert "</svg>" in svg

    def test_contains_zodiac_symbols(self):
        dt = datetime(2024, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        chart = HeliocentricChart.create(dt)
        svg = render_svg(chart)
        # Check for Aries symbol
        assert "\u2648" in svg

    def test_contains_heliocentric_label(self):
        dt = datetime(2024, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        chart = HeliocentricChart.create(dt)
        svg = render_svg(chart)
        assert "HELIOCENTRIC" in svg

    def test_contains_date(self):
        dt = datetime(2024, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        chart = HeliocentricChart.create(dt)
        svg = render_svg(chart)
        assert "2024-06-15" in svg
