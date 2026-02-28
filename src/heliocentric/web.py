"""Flask web application for heliocentric chart generation."""

from __future__ import annotations

from datetime import datetime, timezone

from flask import Flask, render_template, request

from heliocentric.chart import HeliocentricChart
from heliocentric.renderer import render_svg

app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def index() -> str:
    svg_content = None
    chart = None
    dt_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M")
    error = None

    if request.method == "POST":
        dt_str = request.form.get("datetime", dt_str)
        try:
            dt = datetime.fromisoformat(dt_str).replace(tzinfo=timezone.utc)
            chart = HeliocentricChart.create(dt)
            svg_content = render_svg(chart)
        except (ValueError, TypeError) as e:
            error = f"Invalid date/time: {e}"

    return render_template(
        "index.html",
        svg_content=svg_content,
        chart=chart,
        dt_str=dt_str,
        error=error,
    )


def main() -> None:
    app.run(host="127.0.0.1", port=5000, debug=True)


if __name__ == "__main__":
    main()
