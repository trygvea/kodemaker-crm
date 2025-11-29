/**
 * Mock implementation of next/image for React Cosmos
 *
 * Why we can't use the real Next.js Image component:
 * - Next.js Image requires the Next.js runtime and server-side image optimization
 * - Even with `unoptimized` prop, the Image component depends on Next.js internals
 * - Cosmos runs in a Vite environment without Next.js server capabilities
 * - This mock provides a compatible API using a standard <img> tag
 *
 * Reference: https://nextjs.org/docs/messages/no-img-element
 * The warning about <img> vs <Image /> is expected and acceptable in this mock.
 */
import React from "react";

const Image = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    unoptimized?: boolean;
  }
>(({ src, alt, fill, width, height, className, style, ...props }, ref) => {
  const imgStyle: React.CSSProperties = fill
    ? { ...style, width: "100%", height: "100%", objectFit: "cover" }
    : { ...style, width, height };

  // Using <img> instead of Next.js <Image /> because Cosmos runs outside
  // the Next.js runtime. This is intentional and necessary for the mock.
  // The Next.js eslint rule warning is expected and acceptable here.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={imgStyle}
      {...props}
    />
  );
});

Image.displayName = "Image";

export default Image;
