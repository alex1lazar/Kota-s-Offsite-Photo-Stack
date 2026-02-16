/**
 * Rename all photos to 001.jpg … n.jpg and reorder so landscape and portrait
 * are interleaved. Reads src/photoPaths.json, renames files in public/photos,
 * writes updated src/photoPaths.json.
 *
 * Run from repo root: node scripts/rename-and-mix-photos.js
 */

import { readFileSync, writeFileSync, renameSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const photosDir = join(repoRoot, 'public', 'photos')
const pathsPath = join(repoRoot, 'src', 'photoPaths.json')

const imageList = JSON.parse(readFileSync(pathsPath, 'utf-8'))

function isLandscape(entry) {
  const w = entry.width ?? 0
  const h = entry.height ?? 0
  return w >= h
}

const landscape = imageList.filter(isLandscape)
const portrait = imageList.filter((e) => !isLandscape(e))

// Interleave: take one from each list until one runs out, then append the rest
const mixed = []
const maxLen = Math.max(landscape.length, portrait.length)
for (let i = 0; i < maxLen; i++) {
  if (i < landscape.length) mixed.push(landscape[i])
  if (i < portrait.length) mixed.push(portrait[i])
}

const n = mixed.length
const pad = n < 1000 ? 3 : String(n).length

// Phase 1: rename every file to a temp name so we never overwrite
for (let i = 0; i < n; i++) {
  const entry = mixed[i]
  const filename = entry.path.replace(/^\/photos\//, '')
  const oldPath = join(photosDir, filename)
  const tempPath = join(photosDir, `__ren_${i}`)
  if (existsSync(oldPath)) {
    renameSync(oldPath, tempPath)
  }
}

// Phase 2: rename temp to final 001.jpg, 002.jpg, ...
const newList = []
for (let i = 0; i < n; i++) {
  const entry = mixed[i]
  const newName = `${String(i + 1).padStart(pad, '0')}.jpg`
  const tempPath = join(photosDir, `__ren_${i}`)
  const newPath = join(photosDir, newName)
  if (existsSync(tempPath)) {
    renameSync(tempPath, newPath)
  }
  newList.push({
    path: `/photos/${newName}`,
    ...(entry.width != null && entry.height != null ? { width: entry.width, height: entry.height } : {}),
  })
}

writeFileSync(pathsPath, JSON.stringify(newList, null, 2), 'utf-8')
console.log(`Renamed ${n} images to 001.jpg–${String(n).padStart(pad, '0')}.jpg and interleaved ${landscape.length} landscape with ${portrait.length} portrait.`)
console.log(`Updated ${pathsPath}`)
