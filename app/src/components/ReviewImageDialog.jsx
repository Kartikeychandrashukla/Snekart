export default function ReviewImageDialog({ image, review, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative bg-black">
          <img src={image} alt="" className="w-full max-h-[70vh] object-contain" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 text-white text-sm leading-none flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-4">
          <p className="text-forest font-semibold text-sm mb-1">{review.customerName}</p>
          <div className="flex items-start gap-2">
            <span className="text-warm text-sm shrink-0">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            <p className="text-gray-500 text-sm">{review.comment}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
