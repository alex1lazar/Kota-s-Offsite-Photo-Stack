import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

const STACK_SIZE = 11 // 1 current + 10 behind
// Slight tilt angles (degrees) so layers have a mix of left/right tilt
const ROTATION_ANGLES = [-3, -2, -1, 0, 1, 2, 3]

/**
 * One random rotation and one random (x,y) offset per stack position.
 * Position 0 = front card (no rotation, no offset). Positions 1..N = behind (random each).
 * Stable across re-renders so the stack looks consistent.
 */
function useStackTransforms() {
  return useMemo(() =>
    Array.from({ length: STACK_SIZE }, (_, i) => {
      if (i === 0) {
        return { rotationDeg: 0, offsetX: 0, offsetY: 0 }
      }
      const sign = () => (Math.random() > 0.5 ? 1 : -1)
      return {
        rotationDeg: ROTATION_ANGLES[Math.floor(Math.random() * ROTATION_ANGLES.length)],
        offsetX: sign() * (6 + Math.random() * 12), // ±6..18px
        offsetY: sign() * (6 + Math.random() * 12),
      }
    }),
    []
  )
}

// Fallback only before image dimensions are known (avoids layout jump)
const FALLBACK_ASPECT_RATIO = 1

const styles = {
  stack: {
    cursor: 'pointer',
    width: '100%',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    boxSizing: 'border-box',
    position: 'relative',
  },
  stackEmpty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    color: '#888',
    cursor: 'default',
  },
  pile: {
    position: 'relative',
    margin: '0 auto',
    overflow: 'visible',
  },
  meta: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '4rem',
    padding: '0 1rem',
    boxSizing: 'border-box',
  },
  hint: { margin: '4rem', fontSize: '0.9rem', color: '#6b6b6b' },
  count: { margin: 0, fontSize: '0.85rem', color: '#6b6b6b', fontVariantNumeric: 'tabular-nums' },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center',
    display: 'block',
    pointerEvents: 'none',
    imageOrientation: 'from-image',
    maxWidth: '100%',
    maxHeight: '100%',
  },
}

const SCALE_STEP = 0.04
const CARD_RADIUS = 2

function cardShadow(stackPos) {
  const b = 0.06 + stackPos * 0.015
  const c = 0.08 + stackPos * 0.02
  const d = 0.06 + stackPos * 0.015
  const e = 0.05 + stackPos * 0.01
  return `0 1px 3px rgba(0,0,0,${b}), 0 4px 14px rgba(0,0,0,${c}), 0 12px 32px rgba(0,0,0,${d}), 0 28px 64px rgba(0,0,0,${e})`
}

export default function PhotoStack({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [aspectRatios, setAspectRatios] = useState({})
  const [pileSize, setPileSize] = useState({ w: 0, h: 0 })
  const [hoverCard, setHoverCard] = useState(null)
  const pileRef = useRef(null)
  useEffect(() => {
    const el = pileRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setPileSize((s) => (s.w === width && s.h === height ? s : { w: width, h: height }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const stackTransforms = useStackTransforms()

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

  if (!images.length) {
    return (
      <div style={styles.stackEmpty}>
        <p style={styles.hint}>No photos to display.</p>
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', minHeight: '100%' }}>
      <div style={styles.stack} onClick={cycleToNext}>
      <p style={styles.hint}>Scroll, click, or use arrows to navigate</p>
        <div
          ref={pileRef}
          style={{
            ...styles.pile,
            width: '100%',
            height: '100%',
            maxWidth: '65vw',
            maxHeight: '50vh',
          }}
        >
        {visibleImages.map(({ src, stackPosition }) => {
          const ar = aspectRatios[src] ?? FALLBACK_ASPECT_RATIO
          const { w, h } = pileSize
          const cardW = w && h ? Math.min(w, h * ar) : '100%'
          const cardH = w && h ? Math.min(h, w / ar) : '100%'
          const t = stackTransforms[stackPosition]
          const scale = 1
          const isHover = hoverCard === stackPosition
          return (
            <div
              key={`${src}-${stackPosition}-${currentIndex}`}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: cardW,
                height: cardH,
                transform: `translate(-50%, -50%) translate(${t.offsetX}px, ${t.offsetY}px) scale(${scale}) rotate(${t.rotationDeg}deg)`,
                transformOrigin: 'center center',
                borderRadius: CARD_RADIUS,
                overflow: 'hidden',
                boxShadow: cardShadow(stackPosition, isHover),
                background: '#1a1a1a',
                transition: 'transform 0.35s ease, box-shadow 0.35s ease',
                userSelect: 'none',
                zIndex: STACK_SIZE - stackPosition,
              }}
              onMouseEnter={() => setHoverCard(stackPosition)}
              onMouseLeave={() => setHoverCard(null)}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                draggable={false}
                onLoad={handleImageLoad}
                style={styles.cardImg}
              />
            </div>
          )
        })}
        </div>
        <div style={styles.meta}>
        <p style={styles.count} aria-live="polite">
          {currentIndex + 1} of {images.length}
        </p>
        </div>
      </div>
    </div>
  )
}