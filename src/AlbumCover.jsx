// Optional: path to the photo shown on the cover (e.g. group shot). Defaults to first album photo.
const DEFAULT_COVER_IMAGE = '/photos/5.JPG'

export default function AlbumCover({ coverImagePath = DEFAULT_COVER_IMAGE, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="album-cover-trigger group flex flex-col items-center justify-center p-6 md:p-10 cursor-pointer border-0 bg-transparent text-left font-basteleur focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A43E8] focus-visible:ring-offset-4 rounded-lg"
      aria-label="Open photo stack"
    >
      {/* Title above the cover */}
      <h2 className="text-[1rem] font-bold text-[#2c2c2c] tracking-tight mb-6 md:mb-8">
        Offsite in Marrakesh
      </h2>

      {/* Book cover container: front is full size; spine overlays left edge (fixed left, top-bottom). */}
      <div
        className="album-cover-wrapper relative w-[561px] max-w-full rounded-tl-md rounded-tr-sm rounded-br-sm rounded-bl-md shadow-[0_1px_4px_0_rgba(129,113,91,0.05),0_3px_6px_0_rgba(129,113,91,0.08),0_24px_22px_0_rgba(129,113,91,0.12)] transition-transform transition-[box-shadow] duration-6480ms ease-out group-hover:-translate-y-2 group-hover:shadow-[0_2px_8px_0_rgba(129,113,91,0.06),0_6px_12px_0_rgba(129,113,91,0.08),0_28px_26px_0_rgba(129,113,91,0.16)]"
        style={{ aspectRatio: '561 / 658' }}
      >
        {/* Spine: fixed to left and top-bottom, overlays left 20px of the cover */}
        <div
          className="album-cover-spine absolute left-0 top-0 bottom-0 w-6 rounded-l-md z-10"
          style={{
            backgroundColor: '#e8e2d8',
            boxShadow: 'inset -2px 0 8px rgba(0,0,0,0.06)',
          }}
        />
        {/* Front cover: full width, cream + grain */}
        <div
          className="album-cover-front relative w-full h-full rounded-tr-sm rounded-br-sm overflow-hidden flex flex-col items-center justify-start pt-8 pb-20 px-6 bg-[#EDDCBF]"
        >
          {/* Grain overlay: separate layer so opacity makes it visible on cream */}
          <div
            className="absolute inset-0 pointer-events-none rounded-tr-sm rounded-br-sm opacity-5"
            style={{
              backgroundImage: 'url(/bitwise%20overlay.png)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'auto',
              mixBlendMode: 'multiply',
            }}
            aria-hidden
          />
          {/* Kota logo (debossed) */}
          <div className="relative z-10 flex items-center gap-2 mb-10">
            <img
              src="/Purple symbol & dark text.svg"
              alt=""
              className="w-6 h-5 opacity-60"
              style={{ filter: 'brightness(0.75) contrast(0.85)' }}
            />
            <span
              className="text-sm font-medium tracking-wide"
              style={{
                color: '#8a8580',
                textShadow: '0 1px 0 rgba(255,255,255,0.7), 0 -1px 2px rgba(0,0,0,0.06)',
              }}
            >
              Kota
            </span>
          </div>
          {/* Embedded photo on cover: 310×176, 80px from bottom, ratio preserved when scaling */}
          <div
            className="relative z-10 w-[310px] max-w-full mt-auto flex items-center justify-center overflow-hidden shrink-0"
            style={{
              aspectRatio: '310 / 176',
            }}
          >
            <img
              src={coverImagePath}
              alt=""
              className="w-full h-full object-cover object-center pointer-events-none select-none"
              draggable={false}
            />
            {/* Inset shadow overlay so it appears on top of the image */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ boxShadow: 'inset 0 0 4px 1px rgba(0, 0, 0, 0.15)' }}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-[#6b6560]">Click to open album</p>
    </button>
  )
}
