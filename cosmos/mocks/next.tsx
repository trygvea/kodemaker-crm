/**
 * Mock implementations for next/navigation hooks used in Cosmos
 * These allow components using Next.js navigation to work outside of Next.js context
 */

// Mock next/navigation hooks
export const usePathname = () => '/cosmos'
export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  refresh: () => {},
  back: () => {},
  forward: () => {},
  prefetch: () => {},
})
