/**
 * After rename-and-mix-photos.js: keep only entries for files that exist,
 * renumber to 001.jpg … n.jpg so there are no gaps. Run from repo root.
 */

import { readFileSync, writeFileSync, renameSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const photosDir = join(repoRoot, 'public', 'photos')
const pathsPath = join(repoRoot, 'src', 'photoPaths.json')

const imageList = JSON.parse(readFileSync(pathsPath, 'utf-8'))
const existing = imageList.filter((entry) => {
  const filename = entry.path.replace(/^\/photos\//, '')
  return existsSync(join(photosDir, filename))
})

const n = existing.length
const pad = n < 1000 ? 3 : String(n).length

// Phase 1: move to temp names
for (let i = 0; i < n; i++) {
  const filename = existing[i].path.replace(/^\/photos\//, '')
  const oldPath = join(photosDir, filename)
  renameSync(oldPath, join(photosDir, `__ren_${i}`))
}

// Phase 2: temp -> 001.jpg, 002.jpg, ...
const newList = []
for (let i = 0; i < n; i++) {
  const newName = `${String(i + 1).padStart(pad, '0')}.jpg`
  renameSync(join(photosDir, `__ren_${i}`), join(photosDir, newName))
  const entry = existing[i]
  newList.push({
    path: `/photos/${newName}`,
    ...(entry.width != null && entry.height != null ? { width: entry.width, height: entry.height } : {}),
  })
}

writeFileSync(pathsPath, JSON.stringify(newList, null, 2), 'utf-8')
const lastName = `${String(n).padStart(pad, '0')}.jpg`
console.log(`Closed gaps: ${n} photos now 001.jpg–${lastName}.`)
console.log(`Updated ${pathsPath}`)
