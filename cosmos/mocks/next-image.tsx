/**
 * Separate export for next/image alias
 */
import React from 'react'

const Image = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string
    alt: string
    fill?: boolean
    width?: number
    height?: number
  }
>(({ src, alt, fill, width, height, className, style, ...props }, ref) => {
  const imgStyle: React.CSSProperties = fill
    ? { ...style, width: '100%', height: '100%', objectFit: 'cover' }
    : { ...style, width, height }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={imgStyle}
      {...props}
    />
  )
})

Image.displayName = 'Image'

export default Image
