// One-off asset pipeline: crops watermarks, encodes loops, optimises stills.
// Usage: FFMPEG=<path to ffmpeg> node docs/scripts/build-assets.js <vantage-site-main>/public
// Writes to ./public/media, ./app (icon, apple-icon, opengraph-image) and prints clip edge colours.
const fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');
const sharp = require('sharp');

const SRC = process.argv[2], FF = process.env.FFMPEG || 'ffmpeg';
const OUT = path.resolve('public/media'), APP = path.resolve('app');
fs.mkdirSync(OUT, { recursive: true });
const ff = args => execFileSync(FF, ['-y', '-v', 'error', ...args]);
const src = p => path.join(SRC, p);

const FG = { r: 0xec, g: 0xe8, b: 0xe1 }, BG = '#121110';

// White studio background → transparent. Flood-fills near-white pixels connected to the image edge,
// so white parts *inside* the product (labels, connectors) are kept. The rim gets partial alpha from
// how far the pixel is from white, which keeps anti-aliased edges and soft shadows smooth.
async function knockOutWhite(img) {
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info, N = w * h;
  const whiteness = (i) => Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
  const bg = new Uint8Array(N), queue = new Int32Array(N);
  let head = 0, tail = 0;
  const push = (i) => { if (!bg[i] && whiteness(i) >= 232) { bg[i] = 1; queue[tail++] = i; } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (head < tail) {
    const i = queue[head++], x = i % w;
    if (x > 0) push(i - 1); if (x < w - 1) push(i + 1); if (i >= w) push(i - w); if (i < N - w) push(i + w);
  }
  for (let i = 0; i < N; i++) {
    if (bg[i]) { data[i * 4 + 3] = 0; continue; }
    // Rim pixels next to the background fade by their whiteness (232 → 255 maps to opaque → clear).
    const x = i % w, nearBg = (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (i >= w && bg[i - w]) || (i < N - w && bg[i + w]);
    if (nearBg) data[i * 4 + 3] = Math.round(255 * Math.min(1, Math.max(0, (255 - whiteness(i)) / 40)));
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function edge(file) {
  const { data, info } = await sharp(file).resize(64, 36, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const s = [0, 0, 0]; let n = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (x > 1 && y > 1 && x < info.width - 2 && y < info.height - 2) continue;
    const i = (y * info.width + x) * 3; s[0] += data[i]; s[1] += data[i + 1]; s[2] += data[i + 2]; n++;
  }
  return '#' + s.map(v => Math.round(v / n).toString(16).padStart(2, '0')).join('');
}

function encode(input, name, { crop, fps, inputArgs = [], size = '1280:720', crf = [26, 36] }) {
  const vf = `crop=${crop},scale=${size}:flags=lanczos,fps=${fps},format=yuv420p`;
  ff([...inputArgs, '-i', input, '-an', '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf[0]), '-movflags', '+faststart', path.join(OUT, name + '.mp4')]);
  ff([...inputArgs, '-i', input, '-an', '-vf', vf, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(crf[1]), '-row-mt', '1', path.join(OUT, name + '.webm')]);
}

(async () => {
  // 1. Hero loop: "Halo On Head" sequence (device floats down onto the head), played forward then
  //    reversed so the loop has no jump. Frames 47–76 are two bright white flashes — cut for
  //    light-sensitive viewers and replaced by a short cross-dissolve from 46 into 77.
  //    Crop y ≤ 1000 removes the "Veo" mark (x 1800–1892, y 1007–1050).
  const seq = src('assets/Halo On Head Scroll Animation');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'halo-'));
  const f = n => path.join(seq, String(n).padStart(3, '0') + '.png');
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const BLEND = 10;
  const blends = await Promise.all(range(1, BLEND).map(async k =>
    sharp(f(46)).composite([{ input: await sharp(f(77)).ensureAlpha(k / (BLEND + 1)).png().toBuffer() }]).png().toBuffer()));
  const forward = [...range(1, 46).map(f), ...blends, ...range(77, 110).map(f)];
  const loop = [...forward, ...forward.slice(1, -1).reverse()];
  loop.forEach((fr, i) => {
    const out = path.join(tmp, String(i).padStart(3, '0') + '.png');
    typeof fr === 'string' ? fs.copyFileSync(fr, out) : fs.writeFileSync(out, fr);
  });
  encode(path.join(tmp, '%03d.png'), 'halo-loop', { crop: '1778:1000:71:0', fps: 24, inputArgs: ['-framerate', '20'], crf: [24, 34] });
  const heroCrop = { left: 71, top: 0, width: 1778, height: 1000 };
  await sharp(path.join(seq, '110.png')).extract(heroCrop).resize(1920).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(OUT, 'halo-poster.jpg'));

  // 3. Feature clips. Crop x ≤ 1148 removes the ✦ mark (≈ x 1160–1210, y 590–650).
  const clips = { obstacles: 'obstacle_detection', reading: 'text_recognition', depth: 'depth_perception', navigation: 'ai_navigation' };
  const edges = {};
  for (const [name, file] of Object.entries(clips)) {
    const input = src(`videos/${file}.mp4`);
    encode(input, `clip-${name}`, { crop: '1148:646:0:37', fps: 24, size: '960:540', crf: [28, 38] });
    const poster = path.join(OUT, `clip-${name}.jpg`);
    ff(['-ss', '4', '-i', input, '-frames:v', '1', '-vf', 'crop=1148:646:0:37', '-q:v', '2', poster]);
    edges[name] = await edge(poster);
  }

  // 4. Hardware parts → transparent PNGs, trimmed and capped. The white-background studio shots get
  //    their background removed by flood-filling near-white from the edges (soft alpha at the rim).
  const parts = {
    lidar: 'TF mini Lidar.png', tof: 'TOF Sensor.png',
    cm5: 'Raspberry Pi Compute Module 5.jpg', 'nano-base': 'Nano Base Board for CM5.jpg',
    'ai-camera': 'Raspberry Pi AI Camera SC1174.jpg', openmove: 'SHOKZ OpenMove Bone Conduction Headset.jpg',
  };
  for (const [name, file] of Object.entries(parts)) {
    const img = sharp(src(`assets/Vantage V01 Components/${file}`)).resize(900, 900, { fit: 'inside', withoutEnlargement: true });
    const png = file.endsWith('.jpg') ? await knockOutWhite(img) : await img.png().toBuffer();
    await sharp(png).trim().resize(640, 640, { fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9 }).toFile(path.join(OUT, `part-${name}.png`));
  }

  // 5. Partner / credibility photos.
  const photos = {
    'al-noor-1': 'images/al-noor/al-noor-01.jpg', 'al-noor-2': 'images/al-noor/al-noor-02.jpg', 'al-noor-3': 'images/al-noor/al-noor-03.jpg',
    'red-bull-basement': 'images/achievements/Red Bull Basement National Winners.jpeg',
    changemakers: 'images/achievements/Expo Change Makers Academy.jpg', mbrif: 'images/achievements/MBRIF Innovation Pitch.png',
    'accessibility-expo': 'images/achievements/Accessibilities Expo.png',
  };
  for (const [name, file] of Object.entries(photos))
    await sharp(src(file)).resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(OUT, `${name}.jpg`));

  // 6. Logo: white-on-black source → fg-coloured mark with luminance as alpha.
  const { data, info } = await sharp(src('images/vantage-eye-logo.png')).greyscale().trim({ threshold: 20 }).raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) { rgba[i * 4] = FG.r; rgba[i * 4 + 1] = FG.g; rgba[i * 4 + 2] = FG.b; rgba[i * 4 + 3] = data[i * info.channels]; }
  const mark = sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } });
  await mark.clone().png().toFile(path.join(OUT, 'logo-mark.png'));

  // 7. Icons + Open Graph image (Next metadata file conventions).
  const icon = async (size, file) => {
    const m = await mark.clone().resize(Math.round(size * 0.78)).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: BG } }).composite([{ input: m, gravity: 'center' }]).png().toFile(file);
  };
  await icon(96, path.join(APP, 'icon.png'));
  await icon(180, path.join(APP, 'apple-icon.png'));
  await sharp(path.join(seq, '110.png')).extract(heroCrop).resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85, mozjpeg: true }).toFile(path.join(APP, 'opengraph-image.jpg'));

  fs.rmSync(tmp, { recursive: true });
  console.log('clip edges', edges, 'logo', info.width + 'x' + info.height);
})();
