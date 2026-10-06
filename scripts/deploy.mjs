// Yayın: test → push → Coolify deploy → canlı adresi doğrula.  Kullanım: npm run deploy  (testsiz: npm run deploy -- --no-test)
// Token: COOLIFY_TOKEN ortam değişkeni ya da ~/.coolify-token dosyası (git'e girmez).
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';

const API = (process.env.COOLIFY_URL || 'http://187.127.77.126:8000') + '/api/v1';
const APP_NAME = 'hesapkitap';
const LIVE = 'https://abdurrahmankaya.com/takip/';
const tokenFile = `${homedir()}/.coolify-token`;
const TOKEN = (process.env.COOLIFY_TOKEN || (existsSync(tokenFile) ? readFileSync(tokenFile, 'utf8') : '')).trim();

const sh = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', ...opts });
const out = cmd => execSync(cmd, { encoding: 'utf8' }).trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fail = msg => { console.error(`\n✗ ${msg}`); process.exit(1); };
const api = async (path, init = {}) => {
  const res = await fetch(API + path, { ...init, headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' } });
  if (!res.ok) fail(`Coolify ${path}: ${res.status} ${await res.text()}`);
  return res.json();
};
const cacheOf = text => (text.match(/CACHE = '([^']+)'/) || [])[1];

if (!TOKEN) fail('Coolify token yok: ~/.coolify-token dosyası ya da COOLIFY_TOKEN gerekli.');
if (out('git status --porcelain')) fail('Commit edilmemiş değişiklik var. Önce commit et.');

const localCache = cacheOf(readFileSync('sw.js', 'utf8'));
const liveBefore = cacheOf(await fetch(LIVE + 'sw.js', { cache: 'no-store' }).then(r => r.text()).catch(() => ''));
if (liveBefore === localCache && out('git diff --name-only @{u}..HEAD -- index.html sw.js manifest.webmanifest privacy.html 2>/dev/null || true'))
  fail(`sw.js CACHE hâlâ '${localCache}'. Yayından önce sayıyı 1 artır.`);

if (!process.argv.includes('--no-test')) sh('npm test');

const sha = out('git rev-parse HEAD');
sh('git push origin HEAD');

const app = (await api('/applications')).find(a => a.name === APP_NAME) || fail(`Coolify'da '${APP_NAME}' uygulaması bulunamadı.`);
const running = async () => (await api('/deployments')).find(d => d.application_name === APP_NAME && d.commit === sha);

// Push webhook'u deploy'u kendisi başlattıysa onu izle, başlatmadıysa API ile tetikle.
let dep = null;
for (let i = 0; i < 4 && !dep; i++) { await sleep(2500); dep = await running(); }
let id = dep?.deployment_uuid;
if (!id) id = (await api(`/deploy?uuid=${app.uuid}&force=false`)).deployments[0].deployment_uuid;

process.stdout.write('Coolify yayınlıyor');
const t0 = Date.now();
for (;;) {
  const { status } = await api(`/deployments/${id}`);
  if (status === 'finished') break;
  if (status === 'failed' || status?.startsWith('cancelled')) fail(`Deploy ${status}. Günlük: Coolify → ${APP_NAME} → Deployments`);
  if (Date.now() - t0 > 10 * 60e3) fail('Deploy 10 dakikada bitmedi.');
  process.stdout.write('.');
  await sleep(3000);
}
console.log(` bitti (${Math.round((Date.now() - t0) / 1000)} sn)`);

for (let i = 0; i < 10; i++) {
  const res = await fetch(LIVE + 'sw.js', { cache: 'no-store' }).catch(() => null);
  if (res?.ok && cacheOf(await res.text()) === localCache) { console.log(`✓ Yayında: ${LIVE} (${localCache})`); process.exit(0); }
  await sleep(2000);
}
fail(`Deploy bitti ama ${LIVE}sw.js beklenen sürümü ('${localCache}') göstermiyor.`);
