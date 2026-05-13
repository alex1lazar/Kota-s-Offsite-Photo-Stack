import { useState, lazy, Suspense } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import AlbumCover from './AlbumCover'
import photoPaths from './photoPaths.json'

// Lazy-load view components so cover and initial bundle stay small (bundle-dynamic-imports)
const PhotoStack = lazy(() => import('./PhotoStack'))
const PhotoGrid = lazy(() => import('./PhotoGrid'))

// Hoist transition config to avoid recreating objects every render (rendering-hoist-jsx / rerender)
const SIDEBAR_EASE = 'easeOut'
const SIDEBAR_DURATION = 0.3
const sidebarTransition = (delay) => ({ duration: SIDEBAR_DURATION, delay, ease: SIDEBAR_EASE })

function App() {
  const [view, setView] = useState('stack')
  const [hasEntered, setHasEntered] = useState(false)

  const handleOpen = () => setHasEntered(true)

  // Entry view: only the album cover, full screen. No nav, no sidebar.
  if (!hasEntered) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center box-border bg-[#f5f0e8]">
        <AlbumCover onOpen={handleOpen} />
      </main>
    )
  }

  // Main app: sidebar fades in, then photo stack section fades in (easeOut).
  return (
    <main className="min-h-screen w-full box-border">
      <div className="max-w-[1220px] w-full mx-auto flex flex-col md:flex-row min-h-screen">
        <aside className="w-full md:w-[30%] md:min-w-[280px] py-6 px-4 md:py-10 md:px-8 flex flex-col justify-center gap-2 text-left font-basteleur shrink-0">
          <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={sidebarTransition(0)}>
            <img src="/Symbol purple.svg" alt="Kota's Logo" className="w-8 h-8" />
          </Motion.div>
          <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={sidebarTransition(0.1)}>
            <h1 className="m-0 text-[1.15rem] font-bold text-gray-900 tracking-tight mt-8 md:mt-16 mb-4">
              Kota's 2026 offsite
            </h1>
          </Motion.div>
          <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={sidebarTransition(0.2)}>
            <p className="m-0 text-base font-normal text-gray-800">Marrakesh, Morocco</p>
          </Motion.div>
          <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={sidebarTransition(0.3)}>
            <p className="m-0 text-base font-normal text-gray-800">43 people, 3 days</p>
          </Motion.div>
          <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={sidebarTransition(0.4)}>
            <nav className="mt-6 flex flex-row text-[0.95rem] font-normal gap-2 text-gray-800 mb-8 md:mb-16">
              <p>View:</p>
              <button
                type="button"
                onClick={() => setView('stack')}
                className={`bg-transparent border-0 p-0 cursor-pointer text-gray-800 font-basteleur ${view === 'stack' ? 'underline font-semibold' : ''}`}
              >
                Stack
              </button>
              <button
                type="button"
                onClick={() => setView('grid')}
                className={`bg-transparent border-0 p-0 cursor-pointer text-gray-800 font-basteleur ${view === 'grid' ? 'underline font-semibold' : ''}`}
              >
                Grid
              </button>
            </nav>
          </Motion.div>
          <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={sidebarTransition(0.5)}>
            <a
              href="https://jobs.ashbyhq.com/kota"
              className="mt-6 pt-0 text-[0.95rem] _blank font-bold text-[#7A43E8] underline hover:text-[#7a14b3]"
              target='_blank'
            >
              Join our team
            </a>
          </Motion.div>
        </aside>
        <Motion.section
          className="w-full md:w-[70%] flex flex-col items-center justify-center min-h-0 flex-1 relative font-basteleur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1, ease: 'easeOut' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <Motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              <Suspense fallback={null}>
                {view === 'stack' ? <PhotoStack images={photoPaths} /> : <PhotoGrid images={photoPaths} />}
              </Suspense>
            </Motion.div>
          </AnimatePresence>
        </Motion.section>
      </div>
    </main>
  )
}

export default App
