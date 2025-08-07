export default function generateGradient(steps = 100, startHex = "#001C30", endHex = "#00A9FF") {
  const start = hexToRgb(startHex);
  const end = hexToRgb(endHex);
  const stepFactor = 1 / (steps - 1);
  const gradient = [];

  for (let i = 0; i < steps; i++) {
    const r = Math.round(lerp(start.r, end.r, stepFactor * i));
    const g = Math.round(lerp(start.g, end.g, stepFactor * i));
    const b = Math.round(lerp(start.b, end.b, stepFactor * i));
    gradient.push(rgbToHex(r, g, b));
  }

  return gradient;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}