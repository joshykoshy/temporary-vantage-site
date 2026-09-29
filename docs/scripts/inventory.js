// Asset inventory + palette extraction. Usage: node inventory.js <assetRoot> <outJson> <posterDir>
const fs = require('fs'), path = require('path'), sharp = require('sharp');
const { execFileSync } = require('child_process');
const ffmpeg = require('ffmpeg-static'), ffprobe = require('ffprobe-static').path;
const [root, outJson, posterDir] = process.argv.slice(2);
fs.mkdirSync(posterDir, { recursive: true });

const SKIP = new Set(['node_modules', '.git', '.next', 'dist']);
const RASTER = /\.(png|jpe?g|webp|avif|gif)$/i, VIDEO = /\.(mp4|webm|mov)$/i, OTHER = /\.(svg|ico|woff2?|ttf|otf)$/i;
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
  SKIP.has(e.name) ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const hex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

async function palette(input) {
  const { data, info } = await sharp(input).resize(96, 96, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, buckets = new Map(), edge = [];
  let transparent = 0, edgeTransparent = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, a = data[i + 3], px = [data[i], data[i + 1], data[i + 2]];
    const isEdge = x < 3 || y < 3 || x >= W - 3 || y >= H - 3;
    if (a < 128) { transparent++; if (isEdge) edgeTransparent++; continue; }
    if (isEdge) edge.push(px);
    const k = px.map(v => v >> 5).join(',');           // 8 levels/channel
    const b = buckets.get(k) || { n: 0, s: [0, 0, 0] };
    b.n++; px.forEach((v, j) => b.s[j] += v); buckets.set(k, b);
  }
  const opaque = W * H - transparent;
  const dominant = [...buckets.values()].sort((a, b) => b.n - a.n).slice(0, 5)
    .map(b => ({ hex: hex(b.s.map(v => v / b.n)), pct: Math.round(100 * b.n / opaque) }));
  const mean = edge.length ? [0, 1, 2].map(j => edge.reduce((s, p) => s + p[j], 0) / edge.length) : null;
  const sd = mean ? Math.sqrt(edge.reduce((s, p) => s + p.reduce((t, v, j) => t + (v - mean[j]) ** 2, 0), 0) / edge.length / 3) : null;
  const lum = mean ? (0.2126 * mean[0] + 0.7152 * mean[1] + 0.0722 * mean[2]) / 255 : null;
  return {
    dominant,
    edge: mean ? hex(mean) : 'transparent',
    edgeSd: sd && Math.round(sd),                       // low = solid background
    edgeTransparentPct: Math.round(100 * edgeTransparent / (edgeTransparent + edge.length)),
    edgeLum: lum && +lum.toFixed(2),
  };
}

(async () => {
  const files = walk(root).filter(f => RASTER.test(f) || VIDEO.test(f) || OTHER.test(f));
  const out = [];
  for (const f of files) {
    const rel = path.relative(root, f).replace(/\\/g, '/');
    const bytes = fs.statSync(f).size, rec = { path: rel, bytes };
    const seq = /Scroll Animation\/|public\/frames\//.test(rel);
    try {
      if (RASTER.test(f)) {
        const m = await sharp(f).metadata();
        Object.assign(rec, { type: m.format, w: m.width, h: m.height, alpha: m.hasAlpha });
        if (!seq || /\/(001|055|100|110|200)\.png$/.test(rel)) rec.palette = await palette(f);
      } else if (VIDEO.test(f)) {
        const p = JSON.parse(execFileSync(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,codec_name:format=duration', '-of', 'json', f]));
        const s = p.streams[0];
        Object.assign(rec, { type: 'video/' + s.codec_name, w: s.width, h: s.height, duration: +(+p.format.duration).toFixed(1) });
        const poster = path.join(posterDir, rel.replace(/[\/ …]/g, '_') + '.jpg');
        execFileSync(ffmpeg, ['-y', '-v', 'error', '-ss', String(Math.min(1, rec.duration / 2)), '-i', f, '-frames:v', '1', '-q:v', '3', poster]);
        rec.poster = poster; rec.palette = await palette(poster);
      } else {
        rec.type = path.extname(f).slice(1);
        if (/svg|ico/.test(rec.type)) try { const m = await sharp(f).metadata(); rec.w = m.width; rec.h = m.height; } catch {}
      }
    } catch (e) { rec.error = e.message.split('\n')[0]; }
    out.push(rec);
  }
  fs.writeFileSync(outJson, JSON.stringify(out, null, 1));
  console.log(out.length, 'assets');
})();
