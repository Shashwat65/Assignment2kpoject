import { useEffect, useState } from 'react'

export function useImage(src?: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    if (!src) return setImage(null)
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setImage(img)
    img.src = src
    return () => {
      img.onload = null
    }
  }, [src])
  return image
}

export default useImage
