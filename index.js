// TODO: type checking for properties
// TODO: allow defaultConfig
// TODO: allow customConfig

class SmoothCornersPainter {
  static get inputProperties() {
    return [
      "--smooth-corners",
      "--bg-color",
      "--border-color",
      "--border-width",
    ];
  }

  propertyValue(properties, key) {
    const defaultConfig = {
      "--smooth-corners": 4,
      "--bg-color": "transparent",
      "--border-color": "black",
      "--border-width": 1,
    };

    return properties.get(key)[0] || defaultConfig[key];
  }

  getSuperellipse(a, b, n, strokeWidth) {
    if (Number.isNaN(n)) n = 4;
    if (n > 100) n = 100;
    if (n < 0.00000000001) n = 0.00000000001;

    const n2 = 2 / n;
    const steps = 360;
    const step = (2 * Math.PI) / steps;

    const points = (t) => {
      const cosT = Math.cos(t);
      const sinT = Math.sin(t);

      const x = Math.abs(cosT) ** n2 * a * Math.sign(cosT);
      const y = Math.abs(sinT) ** n2 * b * Math.sign(sinT);

      const adjustX = x > 0 ? x - strokeWidth * 2 : x + strokeWidth * 2;
      const adjustY = y > 0 ? y - strokeWidth * 2 : y + strokeWidth * 2;

      return { x: adjustX, y: adjustY };
    };
    return Array.from({ length: steps }, (_, i) => points(i * step));
  }

  paint(ctx, geom, properties) {
    const n = this.propertyValue(properties, "--smooth-corners");
    const strokeWidth = this.propertyValue(properties, "--border-width");
    const bgColor = this.propertyValue(properties, "--bg-color");
    const borderColor = this.propertyValue(properties, "--border-color");

    const width = geom.width / 2;
    const height = geom.height / 2;
    const points = this.getSuperellipse(width, height, n, strokeWidth);

    ctx.setTransform(1, 0, 0, 1, width, height);
    ctx.beginPath();
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = strokeWidth; // Adjust line width for better anti-aliasing

    for (let i = 0; i < points.length; i++) {
      const { x, y } = points[i];
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

if (typeof registerPaint !== "undefined") {
  registerPaint("smooth-corners", SmoothCornersPainter);
}
