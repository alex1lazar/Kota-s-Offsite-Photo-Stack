import PhotoStack from './PhotoStack'
import photoPaths from './photoPaths.json'
import './App.css'

function App() {
  return (
    <main className="app">
      <div className="app__container">
        <aside className="app__left">
          <span className="app__icon" aria-hidden>＊</span>
          <h1 className="app__title">Kota's 2026 offsite</h1>
          <p className="app__meta">Marrakesh, Morocco</p>
          <p className="app__meta">43 people, 3 days</p>
          <nav className="app__view">
            <span className="app__view--active">STACK</span>
            <span>GRID</span>
          </nav>
          <a href="#join" className="app__cta">Join our team</a>
        </aside>
        <section className="app__right">
          <PhotoStack images={photoPaths} />
        </section>
      </div>
    </main>
  )
}

export default App
