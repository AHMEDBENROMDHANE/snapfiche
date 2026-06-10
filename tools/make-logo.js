// Génère les assets de marque SnapFiche à partir du monogramme SF (logo-source.jpg) :
//   web/assets/logo.png      — monogramme dégradé mauve, fond transparent (sidebar / login)
//   web/assets/icon-512.png  — icône PWA fond blanc
//   web/assets/icon-192.png  — icône PWA fond blanc
//   web/assets/favicon.png   — 64px
const path = require('path');
const Jimp = require(path.join(__dirname, '..', 'server', 'node_modules', 'jimp'));

const SRC = path.join(__dirname, '..', 'logo-source.jpg');
const OUT = path.join(__dirname, '..', 'web', 'assets');

// Dégradé mauve tendance (haut-gauche -> bas-droit)
const C1 = { r: 0xa7, g: 0x8b, b: 0xfa }; // #a78bfa clair
const C2 = { r: 0x4c, g: 0x1d, b: 0x95 }; // #4c1d95 profond

(async () => {
  const img = await Jimp.read(SRC);
  const W = img.bitmap.width, H = img.bitmap.height;

  // 1) Bounding box des pixels sombres dans la moitié gauche (le monogramme)
  let minX = W, minY = H, maxX = 0, maxY = 0;
  img.scan(0, 0, Math.floor(W * 0.48), H, function (x, y, idx) {
    const r = this.bitmap.data[idx], g = this.bitmap.data[idx + 1], b = this.bitmap.data[idx + 2];
    if (r + g + b < 360) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  });
  if (maxX <= minX) throw new Error('Monogramme introuvable');
  const pad = Math.round((maxX - minX) * 0.04);
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
  maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
  const mw = maxX - minX + 1, mh = maxY - minY + 1;

  // 2) Recadre + recolore : pixel sombre -> dégradé mauve, alpha selon la « noirceur » (anti-aliasing préservé)
  const mono = img.clone().crop(minX, minY, mw, mh);
  const out = new Jimp(mw, mh, 0x00000000);
  mono.scan(0, 0, mw, mh, function (x, y, idx) {
    const r = this.bitmap.data[idx], g = this.bitmap.data[idx + 1], b = this.bitmap.data[idx + 2];
    const lum = (r + g + b) / 3;                 // 0 noir … 255 blanc
    const alpha = Math.max(0, Math.min(255, Math.round((200 - lum) * (255 / 200))));
    if (alpha > 8) {
      const t = (x / mw + y / mh) / 2;           // dégradé diagonal
      const cr = Math.round(C1.r + (C2.r - C1.r) * t);
      const cg = Math.round(C1.g + (C2.g - C1.g) * t);
      const cb = Math.round(C1.b + (C2.b - C1.b) * t);
      const oidx = out.getPixelIndex(x, y);
      out.bitmap.data[oidx] = cr; out.bitmap.data[oidx + 1] = cg;
      out.bitmap.data[oidx + 2] = cb; out.bitmap.data[oidx + 3] = alpha;
    }
  });

  // 3) Canvas carré transparent 512 -> logo.png
  const size = 512;
  const scale = Math.min(size / mw, size / mh) * 0.96;
  const lw = Math.round(mw * scale), lh = Math.round(mh * scale);
  const logo = out.clone().resize(lw, lh, Jimp.RESIZE_BICUBIC);
  const canvas = new Jimp(size, size, 0x00000000);
  canvas.composite(logo, Math.round((size - lw) / 2), Math.round((size - lh) / 2));
  await canvas.writeAsync(path.join(OUT, 'logo.png'));

  // 4) Icônes PWA : fond blanc, monogramme centré ~62 %
  for (const s of [512, 192, 64]) {
    const icon = new Jimp(s, s, 0xffffffff);
    const m = canvas.clone().resize(Math.round(s * 0.78), Math.round(s * 0.78), Jimp.RESIZE_BICUBIC);
    icon.composite(m, Math.round((s - m.bitmap.width) / 2), Math.round((s - m.bitmap.height) / 2));
    const name = s === 64 ? 'favicon.png' : `icon-${s}.png`;
    await icon.writeAsync(path.join(OUT, name));
  }
  console.log('✅ logo.png + icon-512 + icon-192 + favicon générés');
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
