class SmoothCornersPainter {
  static get inputProperties(): InputProperty[] {
    return [ "--smooth-corners", "--bg-color", "--border-color", "--border-width" ];
  }

  /** 
   * propertyValue - Get property value from CSS
   * @param {Map<string, Array<string>>} properties - CSS properties
   * @param {InputProperty} key - CSS property key
   * @returns {number | string}
   * */ 
  propertyValue(properties, key: InputProperty): number | string {
    const defaultConfig: Record<InputProperty, number | string> = {
      "--smooth-corners": 4,
      "--bg-color": "transparent",
      "--border-color": "black",
      "--border-width": 1,
    };
    return properties.get(key)[0] || defaultConfig[key];
  }

  /** 
   * getSuperellipse - Generate points for a superellipse
   * @param {number} a - width
   * @param {number} b - height
   * @param {number} n - smoothness(draw a Squircle, n=4)
   * @param {number} strokeWidth - border width
   * @returns {Array<{x: number, y: number}>}
   * */ 
  getSuperellipse(a, b, n = 4, strokeWidth) {
    let m = n;
    if (m > 100) m = 100;
    else if (m < 0.00000000001) m = 0.00000000001;

    const m2 = 2 / m;
    const steps = 360;
    const step = (2 * Math.PI) / steps;

    const points = (t: number) => {
      const cosT = Math.cos(t);
      const sinT = Math.sin(t);

      const x = Math.abs(cosT) ** m2 * a * Math.sign(cosT);
      const y = Math.abs(sinT) ** m2 * b * Math.sign(sinT);

      // Adjust points to avoid border clipping
      const adjustX = x > 0 ? x - strokeWidth / 2 : x + strokeWidth / 2;
      const adjustY = y > 0 ? y - strokeWidth / 2 : y + strokeWidth / 2;

      return { x: adjustX, y: adjustY };
    };
    return Array.from({ length: steps }, (_, i) => points(i * step));
  }

  /** 
   * paint - Paint the superellipse
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   * @param {DOMRectReadOnly} geom - Geometry of the element
   * @param {Map<string, Array<string>>} properties - CSS properties
   * */
  paint(ctx, geom, properties) {
    const n = Number(this.propertyValue(properties, "--smooth-corners"));
    const strokeWidth = Number(this.propertyValue(properties, "--border-width"));
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

    for(let [i, { x, y }] of points.entries()) {
      if (i == 0) ctx.moveTo(x, y);
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
