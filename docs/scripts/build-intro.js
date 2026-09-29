// Intro stock footage: downloads the Mixkit clips (Mixkit Stock Video Free License — free for
// commercial use, no attribution required), trims a window, grades it toward the site's warm
// graphite palette, and crossfades the end into the start so the loop has no jump.
// Usage: FFMPEG=<path> node docs/scripts/build-intro.js [cacheDir]
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const sharp = require('sharp');

const FF = process.env.FFMPEG || 'ffmpeg';
const CACHE = path.resolve(process.argv[2] || '.cache/intro');
const OUT = path.resolve('public/media/intro');
fs.mkdirSync(CACHE, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });

// name: [mixkit id, window start (s)]
const clips = {
  default: [47973, 13],   // blind man with a white cane waiting at a crossing
  obstacles: [4331, 0],   // rainy night street: cyclist, taxi, traffic
  reading: [4451, 4],     // Tokyo street dense with signs
  depth: [28823, 16],     // feet climbing stone stairs
  navigation: [61, 12],   // aerial crossing, cars and pedestrians
  haptics: [46908, 2],    // hand reading a texture by touch
  sos: [14669, 0],        // hands on a phone at night
};
const L = 8, F = 1; // loop length and crossfade (seconds)
const grade = 'eq=saturation=0.78:contrast=1.04:brightness=-0.03,colorbalance=rs=0.03:bs=-0.04:rm=0.02:bm=-0.03';

(async () => {
  for (const [name, [id, start]] of Object.entries(clips)) {
    const src = path.join(CACHE, `${id}.mp4`);
    if (!fs.existsSync(src)) {
      for (const q of [1080, 720]) {
        const res = await fetch(`https://assets.mixkit.co/videos/${id}/${id}-${q}.mp4`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) { fs.writeFileSync(src, Buffer.from(await res.arrayBuffer())); break; }
      }
    }
    const fc = `[0:v]${grade},scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24,split[a][b];` +
      `[a]trim=start=${F},setpts=PTS-STARTPTS[main];[b]trim=0:${F},setpts=PTS-STARTPTS[head];` +
      `[main][head]xfade=transition=fade:duration=${F}:offset=${L - F},format=yuv420p`;
    const base = ['-y', '-v', 'error', '-ss', String(start), '-t', String(L + F), '-i', src, '-an', '-filter_complex', fc];
    execFileSync(FF, [...base, '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-maxrate', '1400k', '-bufsize', '2800k', '-movflags', '+faststart', path.join(OUT, `${name}.mp4`)]);
    execFileSync(FF, [...base, '-c:v', 'libvpx-vp9', '-b:v', '1000k', '-crf', '38', '-row-mt', '1', path.join(OUT, `${name}.webm`)]);
    // Poster = first frame of the loop, so the image → video handover is invisible.
    const png = path.join(CACHE, `${name}.png`);
    execFileSync(FF, ['-y', '-v', 'error', '-i', path.join(OUT, `${name}.mp4`), '-frames:v', '1', png]);
    await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, `${name}.jpg`));
    console.log(name, (fs.statSync(path.join(OUT, `${name}.webm`)).size / 1024 | 0) + 'KB webm');
  }
})();
