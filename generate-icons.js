const fs = require('fs');
const { PNG } = require('pngjs');

function createIcon(size) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  const scale = size / 192;

  // Colors
  const bg = { r: 10, g: 22, b: 40 };           // #0a1628
  const ring1 = { r: 74, g: 124, b: 140 };      // #4a7c8c
  const ring2 = { r: 107, g: 163, b: 184 };     // #6ba3b8
  const ring3 = { r: 168, g: 212, b: 230 };     // #a8d4e6
  const wave = { r: 232, g: 244, b: 248 };      // #e8f4f8

  // Helper to set pixel
  function setPixel(x, y, color, alpha = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (size * y + x) << 2;

    // Alpha blending
    const srcA = alpha / 255;
    const dstA = png.data[idx + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);

    if (outA > 0) {
      png.data[idx] = Math.round((color.r * srcA + png.data[idx] * dstA * (1 - srcA)) / outA);
      png.data[idx + 1] = Math.round((color.g * srcA + png.data[idx + 1] * dstA * (1 - srcA)) / outA);
      png.data[idx + 2] = Math.round((color.b * srcA + png.data[idx + 2] * dstA * (1 - srcA)) / outA);
      png.data[idx + 3] = Math.round(outA * 255);
    }
  }

  // Fill background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      png.data[idx] = bg.r;
      png.data[idx + 1] = bg.g;
      png.data[idx + 2] = bg.b;
      png.data[idx + 3] = 255;
    }
  }

  // Draw circle
  function drawCircle(cx, cy, radius, color, thickness, alpha) {
    for (let angle = 0; angle < Math.PI * 2; angle += 0.001) {
      for (let t = -thickness/2; t <= thickness/2; t += 0.5) {
        const r = radius + t;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        setPixel(x, y, color, alpha);
      }
    }
  }

  // Draw circles
  drawCircle(center, center, 70 * scale, ring1, 3 * scale, 128);
  drawCircle(center, center, 55 * scale, ring2, 2 * scale, 153);
  drawCircle(center, center, 40 * scale, ring3, 2 * scale, 178);

  // Draw wave (simplified - just horizontal wave pattern)
  function drawWave(yOffset, color, thickness, alpha) {
    for (let x = center - 35 * scale; x <= center + 35 * scale; x += 0.5) {
      const relX = (x - center) / (35 * scale);
      const y = center + yOffset + Math.sin(relX * Math.PI * 2) * 12 * scale;
      for (let t = -thickness/2; t <= thickness/2; t += 0.5) {
        setPixel(x, y + t, color, alpha);
      }
    }
  }

  drawWave(0, wave, 4 * scale, 255);
  drawWave(10 * scale, ring3, 3 * scale, 178);

  return png;
}

// Generate icons
const icon192 = createIcon(192);
const icon512 = createIcon(512);

fs.writeFileSync('icon-192.png', PNG.sync.write(icon192));
fs.writeFileSync('icon-512.png', PNG.sync.write(icon512));

console.log('Icons generated: icon-192.png, icon-512.png');
