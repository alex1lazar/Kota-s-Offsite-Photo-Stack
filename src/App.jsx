import { useState } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import PhotoStack from './PhotoStack'
import PhotoGrid from './PhotoGrid'
import photoPaths from './photoPaths.json'

function App() {
  const [view, setView] = useState('stack')

  return (
    <main className="min-h-screen w-full box-border">
      <div className="max-w-[1220px] w-full mx-auto flex flex-row min-h-screen">
        <aside className="w-[30%] min-w-[280px] py-10 px-8 flex flex-col justify-center gap-2 text-left font-basteleur">
          <img src="/Symbol purple.svg" alt="Kota's Logo" className="w-8 h-8" />
          <h1 className="m-0 text-[1.15rem] font-bold text-gray-900 tracking-tight mt-16 mb-4">
            Kota's 2026 offsite
          </h1>
          <p className="m-0 text-base font-normal text-gray-800">Marrakesh, Morocco</p>
          <p className="m-0 text-base font-normal text-gray-800">43 people, 3 days</p>
          <nav className="mt-6 flex flex-row text-[0.95rem] font-normal gap-2 text-gray-800 mb-16">
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
          <a
            href="https://jobs.ashbyhq.com/kota"
            className="mt-6 pt-0 text-[0.95rem] _blank font-bold text-[#7A43E8] underline hover:text-[#7a14b3]"
            target='_blank'
          >
            Join our team
          </a>
        </aside>
        <section className="w-[70%] flex flex-col items-center justify-center min-h-screen relative font-basteleur">
          <AnimatePresence mode="wait" initial={false}>
            <Motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              {view === 'stack' ? <PhotoStack images={photoPaths} /> : <PhotoGrid images={photoPaths} />}
            </Motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  )
}

export default App
