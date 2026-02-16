import { useState, useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'

// Support both string[] and { path, width?, height? }[]
const getPaths = (images) => images.map((img) => (typeof img === 'string' ? img : img.path))

export default function PhotoGrid({ images = [] }) {
  const paths = useMemo(() => getPaths(images), [images])
  const [selectedImage, setSelectedImage] = useState(null)

  const openOverlay = useCallback((src) => setSelectedImage(src), [])
  const closeOverlay = useCallback(() => setSelectedImage(null), [])

  useEffect(() => {
    if (!selectedImage) return
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeOverlay()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedImage, closeOverlay])

  if (!paths.length) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-500">
        No photos to display.
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.08,
      },
    },
  }
  const item = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  return (
    <>
      <div className="w-full max-w-[65vw] max-h-[80vh] relative overflow-auto hide-scrollbar">
        <Motion.div
          className="w-full p-4 pb-4 grid grid-cols-3 sm:grid-cols-4 gap-x-1 gap-y-2"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {paths.map((src) => (
            <Motion.button
              type="button"
              key={src}
              variants={item}
              onClick={() => openOverlay(src)}
              className="block w-full overflow-hidden bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#7A43E8]"
              style={{
                aspectRatio: '4/3',
                minHeight: 140,
              }}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover object-center"
                style={{ imageOrientation: 'from-image' }}
              />
            </Motion.button>
          ))}
        </Motion.div>
        <div
          className="sticky bottom-0 left-0 right-0 h-4 pointer-events-none z-10 shrink-0"
          style={{
            background: 'linear-gradient(to bottom, transparent, var(--grid-fade-bg, #f5f0e8))',
          }}
          aria-hidden
        />
      </div>

      <AnimatePresence>
        {selectedImage ? (
          <Motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={closeOverlay}
            role="button"
            tabIndex={0}
            aria-label="Close overlay"
          >
            <Motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOverlay}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Close
            </Motion.button>
            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt=""
                className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
                style={{ imageOrientation: 'from-image' }}
              />
            </Motion.div>
          </Motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
