import { useState, useEffect, useCallback, useMemo } from 'react'
import './PhotoStack.css'

const STACK_SIZE = 11 // 1 current + 10 behind
// Discrete angles so we get a real mix of left/right tilt, not a gradual trend
const ROTATION_ANGLES = [-3, -2, -1, 0, 1, 2, 3]

// Stable random rotation per image: one of [-3,-2,-1,0,1,2,3]°. Keyed by src so it never changes on re-render.
function useRotationBySrc(images) {
  return useMemo(() => {
    const map = {}
    images.forEach((src) => {
      map[src] = ROTATION_ANGLES[Math.floor(Math.random() * ROTATION_ANGLES.length)]
    })
    return map
  }, [images])
}

// Random px offset per stack position (±10–20px), stable so each position keeps the same offset.
function useStackPositionOffsets() {
  return useMemo(() =>
    Array.from({ length: STACK_SIZE }, () => {
      const sign = () => (Math.random() > 0.5 ? 1 : -1)
      const px = () => sign() * (10 + Math.random() * 10)
      return { x: px(), y: px() }
    }),
    []
  )
}

const DEFAULT_ASPECT_RATIO = 4 / 3

export default function PhotoStack({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [aspectRatios, setAspectRatios] = useState({})
  const rotationBySrc = useRotationBySrc(images)
  const positionOffsets = useStackPositionOffsets()

  const handleImageLoad = useCallback((e) => {
    const img = e.target
    if (img.naturalWidth && img.naturalHeight && img.src) {
      const ratio = img.naturalWidth / img.naturalHeight
      const key = (() => {
        try {
          return new URL(img.src, window.location.origin).pathname
        } catch {
          return img.src
        }
      })()
      setAspectRatios((prev) => (prev[key] === ratio ? prev : { ...prev, [key]: ratio }))
    }
  }, [])

  const topAspectRatio = aspectRatios[images[currentIndex]] ?? DEFAULT_ASPECT_RATIO

  if (!images.length) {
    return (
      <div className="photo-stack photo-stack--empty">
        <p>No photos to display.</p>
      </div>
    )
  }

  const visibleImages = []
  for (let i = 0; i < STACK_SIZE; i++) {
    const imageIndex = (currentIndex + i) % images.length
    visibleImages.push({ src: images[imageIndex], stackPosition: i })
  }

  const cycleToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const cycleToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault()
      if (e.deltaY > 0) {
        cycleToNext()
      } else if (e.deltaY < 0) {
        cycleToPrev()
      }
    },
    [cycleToNext, cycleToPrev]
  )

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Keyboard navigation: left/right arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        cycleToNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        cycleToPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cycleToNext, cycleToPrev])

  return (
    <div className="photo-stack" onClick={cycleToNext}>
      <div
        className="photo-stack__pile"
        style={{
          aspectRatio: topAspectRatio,
          width: `min(90vw, calc(85vh * ${topAspectRatio}))`,
          maxWidth: '65vw',
          maxHeight: '65vh',
        }}
      >
        {visibleImages.map(({ src, stackPosition }) => (
          <div
            key={`${src}-${stackPosition}-${currentIndex}`}
            className="photo-stack__card"
            style={{
              '--stack-pos': stackPosition,
              '--rotation': stackPosition === 0 ? '0deg' : `${rotationBySrc[src] ?? 0}deg`,
              '--rand-x': `${positionOffsets[stackPosition].x}px`,
              '--rand-y': `${positionOffsets[stackPosition].y}px`,
              aspectRatio: aspectRatios[src] ?? DEFAULT_ASPECT_RATIO,
              zIndex: STACK_SIZE - stackPosition,
            }}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              draggable={false}
              onLoad={handleImageLoad}
            />
          </div>
        ))}
      </div>
      <div className="photo-stack__meta">
        <p className="photo-stack__hint">
         Scroll, click, or use arrows to navigate
        </p>
        <p className="photo-stack__count" aria-live="polite">
        {currentIndex + 1} of {images.length}
        </p>
      </div>
    </div>
  )
}
