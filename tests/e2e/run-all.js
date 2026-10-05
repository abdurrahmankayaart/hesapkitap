// Tüm uçtan uca testleri sırayla çalıştırır. Kullanım: npm test
// Her test çıktısında "errors []" / "errs: []" gibi boş hata listesi bekler; sayfa hatası ya da çökme varsa başarısız sayar.
const { spawnSync } = require('child_process'), path = require('path');
const TESTS = ['t2b', 't3b', 't5', 't6', 't7', 't11', 'tcal', 'thero', 'tpast', 'tvar'];
let fail = 0;
for (const t of TESTS) {
  const r = spawnSync(process.execPath, [path.join(__dirname, t + '.js')], {encoding: 'utf8', timeout: 180000});
  const out = (r.stdout || '') + (r.stderr || '');
  const pageErr = /err(or)?s:?\s*\[\s*['"]/.test(out);
  const ok = r.status === 0 && !pageErr;
  if (!ok) fail++;
  console.log(`${ok ? '✓' : '✗'} ${t}`);
  if (!ok || process.argv.includes('-v')) console.log(out.split('\n').slice(-15).join('\n'));
}
console.log(fail ? `\n${fail} test başarısız` : '\nTüm testler geçti');
process.exit(fail ? 1 : 0);
