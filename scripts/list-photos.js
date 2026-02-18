import { readdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.tiff', '.tif'
])

const OPTIMIZE_EXTENSIONS = new Set(['.jpg', '.jpeg'])

const photosDir = join(__dirname, '..', 'public', 'photos')
const outputPath = join(__dirname, '..', 'src', 'photoPaths.json')

function getImageFilesToOptimize(dir, basePath = '') {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      files.push(...getImageFilesToOptimize(fullPath, relativePath))
    } else if (entry.isFile()) {
      const ext = entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase()
      if (OPTIMIZE_EXTENSIONS.has(ext)) {
        files.push(fullPath)
      }
    }
  }

  return files
}

function optimizeImages() {
  const files = getImageFilesToOptimize(photosDir)
  if (files.length === 0) {
    console.log('No JPEG images to optimize.')
    return
  }
  console.log(`Optimizing ${files.length} images (auto-orient, resize, quality 85)...`)
  for (const file of files) {
    execSync(
      `magick "${file}" -auto-orient -strip -resize "2048x2048>" -quality 85 "${file}"`,
      { stdio: 'pipe' }
    )
    console.log('  ', file.split('/').pop())
  }
  console.log('Done optimizing.')
}

function getImageEntries(dir, basePath = '') {
  const entries = readdirSync(dir, { withFileTypes: true })
  const result = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      result.push(...getImageEntries(fullPath, relativePath))
    } else if (entry.isFile()) {
      const ext = entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase()
      if (IMAGE_EXTENSIONS.has(ext)) {
        result.push({ path: `/photos/${relativePath}`, fullPath })
      }
    }
  }

  return result.sort((a, b) => a.path.localeCompare(b.path))
}

function getImageDimensions(fullPath) {
  try {
    const out = execSync(`magick identify -format "%w %h" "${fullPath}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
    const [w, h] = out.split(/\s+/).map(Number)
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
      return { width: w, height: h }
    }
  } catch (_) {
    // ignore: leave dimensions undefined
  }
  return {}
}

optimizeImages()
const entries = getImageEntries(photosDir)
console.log(`Reading dimensions for ${entries.length} images...`)
const imageList = entries.map(({ path, fullPath }) => {
  const { width, height } = getImageDimensions(fullPath)
  return { path, ...(width && height ? { width, height } : {}) }
})
writeFileSync(outputPath, JSON.stringify(imageList, null, 2), 'utf-8')
console.log(`Wrote ${imageList.length} images to src/photoPaths.json`)
