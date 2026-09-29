// WCAG 2 ratio + APCA-W3 (0.0.98G) Lc for palette pairs. node contrast.js pairs.json
const ch = h => h.match(/\w\w/g).map(x => parseInt(x, 16) / 255);
const L = h => { const c = ch(h).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const apca = (txt, bg) => {
  const Y = h => { const c = ch(h).map(v => v ** 2.4); let y = 0.2126729 * c[0] + 0.7151522 * c[1] + 0.072175 * c[2]; return y < 0.022 ? y + (0.022 - y) ** 1.414 : y; };
  const t = Y(txt), b = Y(bg); let S;
  if (b > t) { S = (b ** 0.56 - t ** 0.57) * 1.14; return S < 0.1 ? 0 : (S - 0.027) * 100; }
  S = (b ** 0.65 - t ** 0.62) * 1.14; return S > -0.1 ? 0 : (S + 0.027) * 100;
};
const pairs = JSON.parse(require('fs').readFileSync(process.argv[2])); let fail = 0;
for (const [fg, bg, min, name, lc] of pairs) {
  const r = ratio(fg, bg), a = Math.abs(apca(fg, bg)), ok = r >= min && (!lc || a >= lc); if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1 (≥${min})  Lc ${a.toFixed(0).padStart(3)}${lc ? ' (≥' + lc + ')' : '      '}  ${name}  ${fg} on ${bg}`);
}
process.exit(fail ? 1 : 0);
