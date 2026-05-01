import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const inputPath  = path.join(__dirname, '../public/logo.png')
const outputPath = path.join(__dirname, '../public/logo-transparent.png')

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const { width, height, channels } = info
const pixels = new Uint8ClampedArray(data)

function pxIdx(x, y) { return (y * width + x) * channels }
function getPixel(x, y) {
  const i = pxIdx(x, y)
  return [pixels[i], pixels[i+1], pixels[i+2]]
}

// Sample background colour from 12 border pixels
const borderSamples = [
  [0,0],[1,0],[0,1],[2,2],
  [width-1,0],[width-2,0],[width-1,1],
  [0,height-1],[0,height-2],[1,height-1],
  [width-1,height-1],[width-2,height-1],
].map(([x,y]) => getPixel(x,y))

const bgR = Math.round(borderSamples.reduce((s,[r]) => s+r, 0) / borderSamples.length)
const bgG = Math.round(borderSamples.reduce((s,[,g]) => s+g, 0) / borderSamples.length)
const bgB = Math.round(borderSamples.reduce((s,[,,b]) => s+b, 0) / borderSamples.length)
console.log(`Background colour: rgb(${bgR}, ${bgG}, ${bgB})`)

// Flood-fill threshold — wide enough to capture anti-aliased background fringe
const FLOOD_THRESHOLD = 55

function colorDist(r, g, b) {
  return Math.sqrt((r-bgR)**2 + (g-bgG)**2 + (b-bgB)**2)
}
function isBackground(r, g, b) {
  return colorDist(r, g, b) <= FLOOD_THRESHOLD
}

// BFS flood-fill from all four edges
const inBackground = new Uint8Array(width * height)
const queue = []

function tryEnqueue(x, y) {
  if (x < 0 || y < 0 || x >= width || y >= height) return
  const ni = y * width + x
  if (inBackground[ni]) return
  const [r,g,b] = getPixel(x, y)
  if (isBackground(r, g, b)) {
    inBackground[ni] = 1
    queue.push(x, y)  // packed pairs — faster than sub-arrays
  }
}

for (let x = 0; x < width; x++) { tryEnqueue(x, 0); tryEnqueue(x, height-1) }
for (let y = 0; y < height; y++) { tryEnqueue(0, y); tryEnqueue(width-1, y) }

for (let qi = 0; qi < queue.length; qi += 2) {
  const cx = queue[qi], cy = queue[qi+1]
  tryEnqueue(cx-1, cy); tryEnqueue(cx+1, cy)
  tryEnqueue(cx, cy-1); tryEnqueue(cx, cy+1)
}

console.log(`Flood-filled ${queue.length/2} background pixels`)

// Assign alpha values:
//   - Interior background pixels (no logo-pixel neighbours) → fully transparent
//   - Edge background pixels (next to logo content) → soft gradient for anti-aliasing
//   - Logo pixels (not in flood fill) → unchanged (fully opaque)
const HARD_ZONE  = FLOOD_THRESHOLD * 0.35  // pixels this close to bg → alpha 0
const SOFT_START = FLOOD_THRESHOLD * 0.35
const SOFT_END   = FLOOD_THRESHOLD          // pixels from SOFT_START→SOFT_END ramp 0→255

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const fi = y * width + x
    if (!inBackground[fi]) continue      // logo pixel, leave opaque

    const pi = pxIdx(x, y)
    const [r,g,b] = [pixels[pi], pixels[pi+1], pixels[pi+2]]
    const dist = colorDist(r, g, b)

    let alpha
    if (dist <= HARD_ZONE) {
      alpha = 0   // clearly background → fully transparent
    } else {
      // Soft ramp: 0 at SOFT_START, 255 at SOFT_END (anti-aliased edge pixels)
      alpha = Math.round(((dist - SOFT_START) / (SOFT_END - SOFT_START)) * 255)
      alpha = Math.max(0, Math.min(255, alpha))
    }
    pixels[pi + 3] = alpha
  }
}

await sharp(Buffer.from(pixels.buffer), {
  raw: { width, height, channels }
}).png({ compressionLevel: 9 }).toFile(outputPath)

console.log(`✓ Saved: ${outputPath}`)
