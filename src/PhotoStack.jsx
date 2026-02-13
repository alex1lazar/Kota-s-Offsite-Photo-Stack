import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'

const STACK_SIZE = 11 // 1 current + 10 behind
// Slight tilt angles (degrees) so layers have a mix of left/right tilt
const ROTATION_ANGLES = [-3, -2, -1, 0, 1, 2, 3]

// Deterministic PRNG (avoids Math.random during render; stable across re-renders)
function mulberry32(seed) {
  let t = seed >>> 0
  return function rand() {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function hashStringToSeed(str) {
  // FNV-1a 32-bit
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function makeCardTransform(src) {
  const rand = mulberry32(hashStringToSeed(src))
  return {
    // Each card gets its own stable rotation; no movement in stack.
    rotationDeg: ROTATION_ANGLES[Math.floor(rand() * ROTATION_ANGLES.length)],
    offsetX: 0,
    offsetY: 0,
  }
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

const CARD_RADIUS = 2

function cardShadow(stackPos) {
  const b = 0.04 + stackPos * 0.008
  const c = 0.06 + stackPos * 0.012
  return `0 1px 3px rgba(0,0,0,${b}), 0 4px 14px rgba(0,0,0,${c})`
}

// Normalize to { path, width?, height? }[] (supports legacy string[])
function normalizeImages(images) {
  return images.map((img) => (typeof img === 'string' ? { path: img } : img))
}

export default function PhotoStack({ images = [] }) {
  const list = useMemo(() => normalizeImages(images), [images])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [navDir, setNavDir] = useState(1) // 1 = next, -1 = prev (used for exit rotate)
  const [aspectRatios, setAspectRatios] = useState({})
  const [pileSize, setPileSize] = useState({ w: 0, h: 0 })
  const [hoverCard, setHoverCard] = useState(null)
  const pileRef = useRef(null)
  const imagesLen = list.length

  const getAspectRatio = useCallback(
    (item) => {
      if (item.width != null && item.height != null && item.height > 0) {
        return item.width / item.height
      }
      return aspectRatios[item.path] ?? FALLBACK_ASPECT_RATIO
    },
    [aspectRatios]
  )

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
  const stackSize = Math.min(STACK_SIZE, imagesLen)
  const cardTransformsBySrc = useMemo(() => {
    const map = new Map()
    for (const item of list) {
      map.set(item.path, makeCardTransform(item.path))
    }
    return map
  }, [list])

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

  const cycleToNext = useCallback(() => {
    if (!imagesLen) return
    setNavDir(1)
    setCurrentIndex((prev) => (prev + 1) % imagesLen)
  }, [imagesLen])

  const cycleToPrev = useCallback(() => {
    if (!imagesLen) return
    setNavDir(-1)
    setCurrentIndex((prev) => (prev - 1 + imagesLen) % imagesLen)
  }, [imagesLen])

  const handleWheel = useCallback(
    (e) => {
      if (!imagesLen) return
      e.preventDefault()
      if (e.deltaY > 0) {
        cycleToNext()
      } else if (e.deltaY < 0) {
        cycleToPrev()
      }
    },
    [imagesLen, cycleToNext, cycleToPrev]
  )

  useEffect(() => {
    if (!imagesLen) return
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [imagesLen, handleWheel])

  // Keyboard navigation: left/right arrow keys
  useEffect(() => {
    if (!imagesLen) return
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        cycleToNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        cycleToPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [imagesLen, cycleToNext, cycleToPrev])

  if (!imagesLen) {
    return (
      <div style={styles.stackEmpty}>
        <p style={styles.hint}>No photos to display.</p>
      </div>
    )
  }

  const visibleImages = []
  for (let i = 0; i < stackSize; i++) {
    const imageIndex = (currentIndex + i) % imagesLen
    const item = list[imageIndex]
    visibleImages.push({ src: item.path, item, imageIndex, stackPosition: i })
  }

  const top = visibleImages[0]
  const rest = visibleImages.slice(1)

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
          {rest.map(({ src, item, imageIndex, stackPosition }) => {
            const ar = getAspectRatio(item)
            const { w, h } = pileSize
            const cardW = w && h ? Math.min(w, h * ar) : '100%'
            const cardH = w && h ? Math.min(h, w / ar) : '100%'
            const t = cardTransformsBySrc.get(src) ?? { offsetX: 0, offsetY: 0, rotationDeg: 0 }
            const isHover = hoverCard === stackPosition
            return (
              <div
                key={imageIndex}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  translate: '-50% -50%',
                  width: cardW,
                  height: cardH,
                  transformOrigin: 'center center',
                  rotate: `${t.rotationDeg}deg`,
                  borderRadius: CARD_RADIUS,
                  overflow: 'hidden',
                  boxShadow: cardShadow(stackPosition, isHover),
                  background: '#1a1a1a',
                  transition: 'box-shadow 0.35s ease',
                  userSelect: 'none',
                  zIndex: stackSize - stackPosition,
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

          <AnimatePresence initial={false}>
            {top ? (() => {
              const { src, item, imageIndex } = top
              const ar = getAspectRatio(item)
              const { w, h } = pileSize
              const cardW = w && h ? Math.min(w, h * ar) : '100%'
              const cardH = w && h ? Math.min(h, w / ar) : '100%'
              const baseRotation = cardTransformsBySrc.get(src)?.rotationDeg ?? 0
              const isHover = hoverCard === 0
              return (
                <Motion.div
                  key={`top-${imageIndex}`}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    translate: '-50% -50%',
                    width: cardW,
                    height: cardH,
                    transformOrigin: 'center center',
                    borderRadius: CARD_RADIUS,
                    overflow: 'hidden',
                    boxShadow: cardShadow(0, isHover),
                    background: '#1a1a1a',
                    transition: 'box-shadow 0.35s ease',
                    userSelect: 'none',
                    zIndex: stackSize,
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    rotate: baseRotation,
                    scale: 1,
                    opacity: 1,
                    filter: 'blur(0px)',
                  }}
                  animate={{
                    x: 0,
                    y: 0,
                    rotate: baseRotation,
                    scale: 1,
                    opacity: 1,
                    filter: 'blur(0px)',
                  }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  exit={{
                    scale: 1.15,
                    rotate: baseRotation + (navDir >= 0 ? -5 : 5),
                    opacity: 0,
                    filter: 'blur(24px)',
                    transition: { duration: 0.2, ease: 'easeOut' },
                  }}
                  onMouseEnter={() => setHoverCard(0)}
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
                </Motion.div>
              )
            })() : null}
          </AnimatePresence>
        </div>
        <div style={styles.meta}>
        <p style={styles.count} aria-live="polite">
          {currentIndex + 1} of {list.length}
        </p>
        </div>
      </div>
    </div>
  )
}