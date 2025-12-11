import "@testing-library/jest-dom/vitest";

// Next.js API route modules import 'next/server' which expects global Request/Response
// Provide minimal polyfills for test environment
/* eslint-disable @typescript-eslint/no-explicit-any */
if (!(global as any).Request) {
  (global as any).Request = class {};
}
if (!(global as any).Response) {
  (global as any).Response = class {};
}
if (!(global as any).ReadableStream) {
  (global as any).ReadableStream = class {};
}

// Mock ResizeObserver for cmdk/Radix UI components
if (typeof window !== "undefined" && !(window as any).ResizeObserver) {
  (window as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (!(global as any).ResizeObserver) {
  (global as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock scrollIntoView for cmdk
Element.prototype.scrollIntoView = function () {};
/* eslint-enable @typescript-eslint/no-explicit-any */
