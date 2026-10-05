const { chromium } = require('playwright'); const fs = require('fs');
const path = require('path'), fs2 = require('fs'), { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '..');
const OUTDIR = path.join(ROOT, 'store', 'ekran-goruntuleri', '_yeni'); fs2.mkdirSync(OUTDIR, {recursive: true});
const R = ROOT + '/';
const glyph = (fill = '#fff', dot = '#A66540') => `<path d="M11.5 11c0-1.6 1.6-3 4.5-3s4.5 1.4 4.5 3" fill="none" stroke="${fill}" stroke-width="2" stroke-linecap="round"/><path d="M8.5 14c0-1.5 1.1-2.8 2.9-2.8h9.2c1.8 0 2.9 1.3 2.9 2.8v6.5c0 2.1-1.8 3.5-3.6 3.5h-7.8c-1.8 0-3.6-1.4-3.6-3.5z" fill="${fill}"/><circle cx="19.5" cy="17.8" r="1.6" fill="${dot}"/>`;
// kinds: rounded (PWA), square (iOS store, no alpha), round (circle), fg (adaptive foreground, transparent), splash
const svg = (kind, w, h) => {
  if (kind === 'splash') { const s = Math.min(w, h) * .22; return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#F3EDE4"/><g transform="translate(${(w - s) / 2} ${(h - s) / 2})"><rect width="${s}" height="${s}" rx="${s * .22}" fill="#A66540"/><g transform="translate(${s * .125} ${s * .125}) scale(${s / 42.67})">${glyph()}</g></g></svg>`; }
  if (kind === 'fg') { const s = w * .5; return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><g transform="translate(${(w - s) / 2} ${(h - s) / 2}) scale(${s / 32})">${glyph()}</g></svg>`; }
  const bg = kind === 'round' ? `<circle cx="${w / 2}" cy="${w / 2}" r="${w / 2}" fill="#A66540"/>` : `<rect width="${w}" height="${w}" rx="${kind === 'rounded' ? w * .22 : 0}" fill="#A66540"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}">${bg}<g transform="translate(${w * .125} ${w * .125}) scale(${w / 42.67})">${glyph()}</g></svg>`;
};
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage();
  const shot = async (kind, w, h, file, omitBg = true) => {
    await pg.setViewportSize({width: w, height: h});
    await pg.setContent(`<html><body style="margin:0;background:transparent">${svg(kind, w, h)}</body></html>`);
    await pg.screenshot({path: file, omitBackground: omitBg, clip: {x: 0, y: 0, width: w, height: h}});
  };
  await shot('rounded', 192, 192, R + 'icon-192.png'); await shot('rounded', 512, 512, R + 'icon-512.png');
  await shot('square', 1024, 1024, R + 'store-icon-1024.png', false);
  for (const [f, w, h] of JSON.parse(fs.readFileSync(path.join(__dirname, 'icon-sizes.json')))) {
    const path = R + f;
    if (f.includes('AppIcon')) await shot('square', w, h, path, false);
    else if (f.includes('splash')) await shot('splash', w, h, path, false);
    else if (f.includes('ic_launcher_foreground')) await shot('fg', w, h, path);
    else if (f.includes('ic_launcher_round')) await shot('round', w, h, path);
    else if (f.includes('ic_launcher')) await shot('rounded', w, h, path);
  }
  await b.close(); console.log('icons ok');
})();
