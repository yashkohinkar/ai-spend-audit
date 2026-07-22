// Render a branded 1200x630 OG image to public/og.png using sharp (SVG -> PNG).
const sharp = require("sharp");
const path = require("path");

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1220"/>
      <stop offset="1" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="14" height="630" fill="#2dd4bf"/>

  <!-- logo mark: a rounded scope ring -->
  <g transform="translate(96,96)">
    <circle cx="44" cy="44" r="40" fill="none" stroke="#2dd4bf" stroke-width="8"/>
    <circle cx="44" cy="44" r="10" fill="#2dd4bf"/>
    <line x1="44" y1="-6" x2="44" y2="18" stroke="#2dd4bf" stroke-width="6" stroke-linecap="round"/>
    <line x1="44" y1="70" x2="44" y2="94" stroke="#2dd4bf" stroke-width="6" stroke-linecap="round"/>
    <line x1="-6" y1="44" x2="18" y2="44" stroke="#2dd4bf" stroke-width="6" stroke-linecap="round"/>
    <line x1="70" y1="44" x2="94" y2="44" stroke="#2dd4bf" stroke-width="6" stroke-linecap="round"/>
  </g>
  <text x="180" y="158" font-family="DejaVu Sans, Arial, sans-serif" font-size="56" font-weight="bold" fill="#e2e8f0">SpendScope</text>
  <text x="180" y="200" font-family="DejaVu Sans, Arial, sans-serif" font-size="26" fill="#94a3b8">AI Spend Audit</text>

  <text x="96" y="360" font-family="DejaVu Sans, Arial, sans-serif" font-size="64" font-weight="bold" fill="#f8fafc">Find the AI tools</text>
  <text x="96" y="438" font-family="DejaVu Sans, Arial, sans-serif" font-size="64" font-weight="bold" fill="#f8fafc">you pay for and</text>
  <text x="96" y="516" font-family="DejaVu Sans, Arial, sans-serif" font-size="64" font-weight="bold" fill="#2dd4bf">don't use.</text>

  <text x="96" y="582" font-family="DejaVu Sans, Arial, sans-serif" font-size="24" fill="#64748b">Free. No login. Cursor · Copilot · Claude · ChatGPT · Gemini · API</text>
</svg>`;

sharp(Buffer.from(svg))
  .png()
  .toFile(path.join(__dirname, "..", "client", "public", "og.png"))
  .then(() => console.log("wrote public/og.png"))
  .catch((e) => { console.error(e); process.exit(1); });
