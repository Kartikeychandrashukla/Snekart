// Resized variants of images uploaded to our API (GET /api/uploads/image/{id}?w=…).
// The API only accepts the widths listed here; external image URLs are returned unchanged.
const THUMBNAIL_WIDTHS = [400, 800]

function isUploadedImage(url) {
  return typeof url === 'string' && url.includes('/api/uploads/image/')
}

export function thumbnailUrl(url, width) {
  return isUploadedImage(url) ? `${url}${url.includes('?') ? '&' : '?'}w=${width}` : url
}

// srcSet for <img> so the browser picks 400px or 800px based on displayed size and screen
// density; undefined for external URLs (no variants exist).
export function thumbnailSrcSet(url) {
  return isUploadedImage(url)
    ? THUMBNAIL_WIDTHS.map(w => `${thumbnailUrl(url, w)} ${w}w`).join(', ')
    : undefined
}
