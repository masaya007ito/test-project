"""Tests for the HeliocentricChart model."""

from datetime import datetime, timezone

from heliocentric.chart import HeliocentricChart


class TestHeliocentricChart:
    def test_create(self):
        dt = datetime(2024, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        chart = HeliocentricChart.create(dt)
        assert chart.dt == dt
        assert len(chart.positions) == 9
        assert isinstance(chart.aspects, list)

    def test_summary_contains_date(self):
        dt = datetime(2024, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        chart = HeliocentricChart.create(dt)
        summary = chart.summary()
        assert "2024-06-15" in summary
        assert "Heliocentric Chart" in summary

    def test_summary_contains_planets(self):
        dt = datetime(2024, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        chart = HeliocentricChart.create(dt)
        summary = chart.summary()
        assert "Earth" in summary
        assert "Mercury" in summary
        assert "Mars" in summary
