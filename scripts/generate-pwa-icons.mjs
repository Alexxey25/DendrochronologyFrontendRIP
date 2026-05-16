import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const publicDir = path.join(root, 'public')
const svg = path.join(root, 'src', 'assets', 'yurdis-logo.svg')

mkdirSync(publicDir, { recursive: true })

const bg = { r: 253, g: 253, b: 253, alpha: 1 }

await sharp(svg)
  .resize(192, 192, { fit: 'contain', background: bg })
  .png()
  .toFile(path.join(publicDir, 'pwa-192.png'))

await sharp(svg)
  .resize(512, 512, { fit: 'contain', background: bg })
  .png()
  .toFile(path.join(publicDir, 'pwa-512.png'))

console.log('Wrote public/pwa-192.png and public/pwa-512.png')
