import PhotoStack from './PhotoStack'
import photoPaths from './photoPaths.json'

function App() {
  return (
    <main className="min-h-screen w-full box-border">
      <div className="max-w-[1220px] w-full mx-auto flex flex-row min-h-screen">
        <aside className="w-[33%] min-w-[280px] py-10 px-8 flex flex-col justify-center gap-2 text-left font-basteleur">
          <img src="/Symbol purple.svg" alt="Kota's Logo" className="w-8 h-8" />
          <h1 className="m-0 text-[1.15rem] font-bold text-gray-900 tracking-tight mt-16 mb-4">
            Kota's 2026 offsite
          </h1>
          <p className="m-0 text-base font-normal text-gray-800">Marrakesh, Morocco</p>
          <p className="m-0 text-base font-normal text-gray-800">43 people, 3 days</p>
          <nav className="mt-6 text-[0.95rem] font-normal text-gray-800 mb-16">
            <span className="underline font-semibold">STACK</span>
            <span className="ml-4">GRID</span>
          </nav>
          <a
            href="https://jobs.ashbyhq.com/kota"
            className="mt-6 pt-0 text-[0.95rem] font-bold text-[#7A43E8] underline hover:text-[#7a14b3]"
          >
            Join our team
          </a>
        </aside>
        <section className="w-[67%] flex flex-col items-center justify-center min-h-screen relative font-basteleur">
          <PhotoStack images={photoPaths} />
        </section>
      </div>
    </main>
  )
}

export default App
