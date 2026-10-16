// Hesap Kitap sunucusu: web dosyalarını sunar ve isteğe bağlı cihazlar arası eşitleme verisini saklar.
// Bağımlılık yok. Eşitleme verisi DATA_DIR altında, kullanıcının eşitleme kodunun SHA-256 özetiyle adlandırılmış dosyalarda durur.
const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');

const ROOT = process.env.WEB_ROOT || path.join(__dirname, 'public');
const DATA = process.env.DATA_DIR || '/data';
const PORT = +process.env.PORT || 80;
const MAX_BODY = 4 * 1024 * 1024;
const FILES = new Set(['index.html', 'privacy.html', 'manifest.webmanifest', 'sw.js', 'icon.svg', 'icon-192.png', 'icon-512.png', 'og.png']);
const MIME = {html: 'text/html; charset=utf-8', js: 'application/javascript', webmanifest: 'application/manifest+json', svg: 'image/svg+xml', png: 'image/png'};

try { fs.mkdirSync(DATA, {recursive: true}); } catch (e) { console.error('Veri klasörü açılamadı:', e.message); }

const json = (res, code, body) => { res.writeHead(code, {'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*'}); res.end(JSON.stringify(body)); };
const fileOf = id => path.join(DATA, id + '.json');
const readDoc = id => { try { return JSON.parse(fs.readFileSync(fileOf(id), 'utf8')); } catch (e) { return null; } };
function writeDoc(id, doc) {
  const f = fileOf(id), tmp = f + '.tmp';
  if (fs.existsSync(f) && !doc.deleted) fs.copyFileSync(f, f + '.prev'); // son sürümün bir kopyası, yanlış yazmaya karşı
  fs.writeFileSync(tmp, JSON.stringify(doc));
  fs.renameSync(tmp, f);
}

function sync(req, res, id) {
  if (req.method === 'OPTIONS') { res.writeHead(204, {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}); return res.end(); }
  const d0 = readDoc(id);
  // Silinmiş kod: veri yok, yalnızca "silindi" işareti; diğer cihazlar bunu görüp eşitlemeyi kapatır, eski veriyi geri yüklemez.
  if (d0 && d0.deleted) return json(res, 410, {deleted: true});
  if (req.method === 'GET') return d0 ? json(res, 200, d0) : json(res, 404, {v: 0});
  if (req.method === 'DELETE') {
    try { writeDoc(id, {v: (d0 ? d0.v : 0) + 1, t: Date.now(), deleted: true}); fs.rmSync(fileOf(id) + '.prev', {force: true}); } catch (e) { return json(res, 500, {error: 'write'}); }
    return json(res, 200, {deleted: true});
  }
  if (req.method !== 'PUT') return json(res, 405, {error: 'method'});
  const chunks = []; let size = 0, over = false;
  req.on('data', c => { size += c.length; if (size > MAX_BODY) over = true; else chunks.push(c); });
  req.on('end', () => {
    if (over) return json(res, 413, {error: 'too large'});
    let body; try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch (e) { return json(res, 400, {error: 'json'}); }
    if (!body || !body.data || !Array.isArray(body.data.tx)) return json(res, 400, {error: 'data'});
    const cur = readDoc(id);
    // Başka bir cihaz arada yazdıysa reddet; istemci son hali alıp birleştirir ve yeniden gönderir.
    if ((cur ? cur.v : 0) !== (+body.base || 0)) return json(res, 409, cur || {v: 0});
    const doc = {v: (cur ? cur.v : 0) + 1, t: Date.now(), data: body.data};
    try { writeDoc(id, doc); } catch (e) { console.error('Yazılamadı:', e.message); return json(res, 500, {error: 'write'}); }
    json(res, 200, {v: doc.v});
  });
}

http.createServer((req, res) => {
  let p; try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { res.writeHead(400); return res.end(); }
  p = p.replace(/^\/takip(?=\/|$)/, '') || '/'; // Traefik öneki silse de silmese de çalışsın
  const m = p.match(/^\/api\/sync\/([a-f0-9]{64})$/);
  if (m) return sync(req, res, m[1]);
  if (p === '/api/health') return json(res, 200, {ok: true, data: fs.existsSync(DATA)});
  if (p.startsWith('/api/')) return json(res, 404, {error: 'not found'});
  // Veri adrese bağlı: www ile açılırsa kayıtlar ayrı düşer, tek adrese topla.
  if ((req.headers.host || '').toLowerCase() === 'www.abdurrahmankaya.com') { res.writeHead(301, {Location: 'https://abdurrahmankaya.com/takip' + p}); return res.end(); }
  const name = p === '/' ? 'index.html' : p.slice(1);
  if (!FILES.has(name) || (req.method !== 'GET' && req.method !== 'HEAD')) { res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'}); return res.end('Bulunamadı'); }
  const ext = name.split('.').pop();
  fs.readFile(path.join(ROOT, name), (err, buf) => {
    if (err) { res.writeHead(404); return res.end(); }
    const head = {'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': ext === 'png' || ext === 'svg' ? 'public, max-age=604800' : 'no-cache', Vary: 'Accept-Encoding'};
    if (ext !== 'png' && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) { buf = zlib.gzipSync(buf); head['Content-Encoding'] = 'gzip'; }
    head['Content-Length'] = buf.length;
    res.writeHead(200, head);
    res.end(req.method === 'HEAD' ? undefined : buf);
  });
}).listen(PORT, () => console.log(`Hesap Kitap ${PORT} portunda, veri: ${DATA}`));
