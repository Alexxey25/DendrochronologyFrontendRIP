import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const name = process.platform === 'win32' ? 'yurdis_app.exe' : 'yurdis_app'
const exe = join(root, 'src-tauri', 'target', 'release', name)

if (!existsSync(exe)) {
  console.error(
    'Нет собранного приложения. Сначала: npm run tauri:build (или npm run tauri:run:release для сборки+cargo run)',
  )
  process.exit(1)
}

spawn(exe, { stdio: 'inherit' }).on('exit', (c) => process.exit(c ?? 0))
