import { useState } from 'react'

export default function ProductImageGallery({ images, alt }) {
  const gallery = images.filter(Boolean)
  const [active, setActive] = useState(0)
  const activeImage = gallery[active] ?? gallery[0]

  return (
    <div>
      <div className="rounded-2xl overflow-hidden bg-white aspect-square">
        <img
          src={activeImage}
          alt={alt}
          fetchpriority="high"
          className="w-full h-full object-cover"
        />
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-3 mt-3">
          {gallery.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              className={`w-16 h-16 rounded-xl overflow-hidden bg-white border-2 shrink-0 transition-colors ${
                i === active ? 'border-forest' : 'border-taupe hover:border-forest/50'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
