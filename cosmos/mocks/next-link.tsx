/**
 * Separate export for next/link alias
 */
import React from "react";

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  }
>(({ href, children, className, ...props }, ref) => {
  return (
    <a ref={ref} href={href} className={className} {...props}>
      {children}
    </a>
  );
});

Link.displayName = "Link";

export default Link;
