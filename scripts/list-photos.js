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

function getImagePaths(dir, basePath = '') {
  const entries = readdirSync(dir, { withFileTypes: true })
  const paths = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      paths.push(...getImagePaths(fullPath, relativePath))
    } else if (entry.isFile()) {
      const ext = entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase()
      if (IMAGE_EXTENSIONS.has(ext)) {
        paths.push(`/photos/${relativePath}`)
      }
    }
  }

  return paths.sort()
}

optimizeImages()
const imagePaths = getImagePaths(photosDir)
writeFileSync(outputPath, JSON.stringify(imagePaths, null, 2), 'utf-8')
console.log(`Found ${imagePaths.length} images, wrote to src/photoPaths.json`)
